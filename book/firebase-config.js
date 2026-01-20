// ==============================================
// إعدادات Firebase - استبدل بمعلومات مشروعك
// ==============================================

// ⚠️ **هام**: استبدل هذه القيم بمعلومات مشروعك من Firebase Console
// 1. اذهب إلى console.firebase.google.com
// 2. أنشئ مشروع جديد
// 3. أضف تطبيق ويب
// 4. انسخ معلومات التكوين

const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "G-MEASUREMENT_ID"
};

// تهيئة Firebase
firebase.initializeApp(firebaseConfig);

// المصادقة وقاعدة البيانات
const auth = firebase.auth();
const db = firebase.firestore();

// دالة لتسجيل الدخول
async function loginUser(email, password) {
  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// دالة لتسجيل مستخدم جديد
async function registerUser(name, email, password) {
  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    // حفظ معلومات إضافية للمستخدم
    await db.collection('users').doc(user.uid).set({
      name: name,
      email: email,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      hasPaid: false,
      purchaseDate: null,
      lastAccess: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    return { success: true, user: user };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// دالة للتحقق من حالة الدفع
async function checkPaymentStatus(userId) {
  try {
    const userDoc = await db.collection('users').doc(userId).get();
    if (userDoc.exists) {
      return userDoc.data().hasPaid || false;
    }
    return false;
  } catch (error) {
    console.error("Error checking payment:", error);
    return false;
  }
}

// دالة لتحديث حالة الدفع
async function updatePaymentStatus(userId, paymentData) {
  try {
    await db.collection('users').doc(userId).update({
      hasPaid: true,
      purchaseDate: firebase.firestore.FieldValue.serverTimestamp(),
      paymentMethod: paymentData.method,
      transactionId: paymentData.transactionId,
      amount: paymentData.amount
    });
    
    // إضافة إلى سجل المشتريات
    await db.collection('purchases').add({
      userId: userId,
      productId: 'book_1000_monthly',
      amount: 19,
      currency: 'USD',
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      status: 'completed'
    });
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// دالة لتسجيل خروج
function logoutUser() {
  return auth.signOut();
}

// دالة للتحقق من حالة المصادقة
function getCurrentUser() {
  return new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      unsubscribe();
      resolve(user);
    });
  });
}

// تصدير الدوال للاستخدام
window.firebaseAuth = {
  login: loginUser,
  register: registerUser,
  logout: logoutUser,
  checkPayment: checkPaymentStatus,
  updatePayment: updatePaymentStatus,
  getCurrentUser: getCurrentUser,
  auth: auth,
  db: db
};