// firebase.js
// مركزي: Auth + Realtime DB helpers
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  sendEmailVerification,
  signOut
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import {
  getDatabase,
  ref,
  set,
  update,
  get,
  child
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAdPFwWxQ1SbOTBUnHyJU9ji1CyHzluMUU",
  authDomain: "quizzes-8edd4.firebaseapp.com",
  projectId: "quizzes-8edd4",
  storageBucket: "quizzes-8edd4.firebasestorage.app",
  messagingSenderId: "567385584064",
  appId: "1:567385584064:web:bcef8d81c2e3db16e11825",
  measurementId: "G-EW7TGSHREG",
  databaseURL: "https://quizzes-8edd4-default-rtdb.firebaseio.com"
};

let app, auth, rdb;
export function initFirebase() {
  if (app) return { app, auth, rdb };
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  rdb = getDatabase(app);
  return { app, auth, rdb };
}

/* ---------- Helpers ---------- */
function genDeviceId() {
  let id = localStorage.getItem("qbank-device-id");
  if (!id) {
    id = "dev-" + Math.random().toString(36).slice(2, 12) + "-" + Date.now().toString(36);
    localStorage.setItem("qbank-device-id", id);
  }
  return id;
}

/* ---------- Authentication API ---------- */

export async function signupWithEmail(name, email, password) {
  if (!auth) initFirebase();
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  // set display name
  try { await updateProfile(cred.user, { displayName: name }); } catch(e){ /* ignore */ }
  // send verification email (optional)
  try { await sendEmailVerification(cred.user); } catch (e) { /* ignore */ }

  // save minimal RTDB record
  const uid = cred.user.uid;
  const deviceId = genDeviceId();
  const userRef = ref(rdb, `users/${uid}`);
  await set(userRef, {
    email,
    name,
    subscription: {
      type: "none",
      price: 0,
      maxDevices: 1,
      active: false,
      expiresAt: 0
    },
    devices: { [deviceId]: true },
    createdAt: Date.now(),
    lastLogin: Date.now()
  });
  return cred;
}

export async function loginWithEmail(email, password) {
  if (!auth) initFirebase();
  const cred = await signInWithEmailAndPassword(auth, email, password);
  // update lastLogin and register device
  const uid = cred.user.uid;
  const deviceId = genDeviceId();

  const userRef = ref(rdb);
  const snap = await get(child(userRef, `users/${uid}`));
  if (!snap.exists()) {
    // if no RTDB profile, create minimal profile
    await set(ref(rdb, `users/${uid}`), {
      email,
      name: cred.user.displayName || "",
      subscription: {
        type: "none",
        price: 0,
        maxDevices: 1,
        active: false,
        expiresAt: 0
      },
      devices: { [deviceId]: true },
      createdAt: Date.now(),
      lastLogin: Date.now()
    });
    return { createdNewProfile: true, profile: null };
  }
  const data = snap.val();

  // device check
  const devicesObj = data.devices || {};
  const allowed = (data.subscription && data.subscription.maxDevices) ? Number(data.subscription.maxDevices) : 1;
  const deviceExists = !!devicesObj[deviceId];
  const currentCount = Object.keys(devicesObj).length;

  if (!deviceExists && currentCount >= allowed) {
    // too many devices — do not add
    throw { code: 'TOO_MANY_DEVICES', currentCount, allowed };
  }

  // add/update device and lastLogin
  await update(ref(rdb, `users/${uid}`), {
    lastLogin: Date.now()
  });
  await update(ref(rdb, `users/${uid}/devices`), { [deviceId]: true });

  return { createdNewProfile: false, profile: data };
}

export async function loginWithGoogle() {
  if (!auth) initFirebase();
  const provider = new GoogleAuthProvider();
  const res = await signInWithPopup(auth, provider);
  const user = res.user;
  // ensure RTDB profile exists similarly to signup
  const uid = user.uid;
  const deviceId = genDeviceId();
  const userRef = ref(rdb);
  const snap = await get(child(userRef, `users/${uid}`));
  if (!snap.exists()) {
    await set(ref(rdb, `users/${uid}`), {
      email: user.email || "",
      name: user.displayName || "",
      subscription: {
        type: "none",
        price: 0,
        maxDevices: 1,
        active: false,
        expiresAt: 0
      },
      devices: { [deviceId]: true },
      createdAt: Date.now(),
      lastLogin: Date.now()
    });
  } else {
    // update lastLogin/devices
    await update(ref(rdb, `users/${uid}`), { lastLogin: Date.now() });
    await update(ref(rdb, `users/${uid}/devices`), { [deviceId]: true });
  }
  return res;
}

export async function logout() {
  if (!auth) initFirebase();
  try {
    await signOut(auth);
  } catch (e) { /* ignore */ }
}

/* ---------- RTDB read helper ---------- */
export async function getUserRT(uid) {
  if (!rdb) initFirebase();
  const snap = await get(child(ref(rdb), `users/${uid}`));
  return snap.exists() ? snap.val() : null;
}

/* ---------- Friendly messages ---------- */
export function friendlyErrorMessage(codeOrErr) {
  if (!codeOrErr) return "حدث خطأ غير معروف";
  // if thrown object
  if (typeof codeOrErr === 'object' && codeOrErr.code === 'TOO_MANY_DEVICES') {
    return `عدد الأجهزة المسجلة لديك ${codeOrErr.currentCount} وهذا يتجاوز الحد المسموح ${codeOrErr.allowed}. تواصل مع الدعم.`;
  }
  const code = (typeof codeOrErr === 'string') ? codeOrErr : (codeOrErr.code || '');
  const map = {
    "auth/invalid-email": "البريد الإلكتروني غير صالح.",
    "auth/email-already-in-use": "هذا البريد مستخدم من قبل.",
    "auth/weak-password": "كلمة المرور ضعيفة — استخدم 6 أحرف على الأقل.",
    "auth/wrong-password": "كلمة المرور غير صحيحة.",
    "auth/user-not-found": "لا يوجد مستخدم بهذا البريد.",
    "auth/popup-closed-by-user": "تم إغلاق نافذة تسجيل الدخول قبل اكتمال العملية.",
    "auth/network-request-failed": "فشل الاتصال. تأكد من الإنترنت.",
    "auth/too-many-requests": "عدد محاولات تسجيل الدخول كبير، حاول لاحقًا."
  };
  return map[code] || (codeOrErr.message ? codeOrErr.message : String(codeOrErr));
}
