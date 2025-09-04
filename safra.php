<?php
// ===========================
// إعداد مفتاح Tap السري
// ===========================
$secretKey = "PUT_YOUR_SECRET_KEY_HERE"; // استبدله بمفتاحك من Tap

// ===========================
// قراءة بيانات الطلب من Tap
// ===========================
$input = file_get_contents('php://input');
$headers = getallheaders();
$tapSignature = $headers['Tap-Signature'] ?? '';

// ===========================
// حساب التوقيع محلياً للتحقق
// ===========================
$calculatedSignature = hash_hmac('sha256', $input, $secretKey);

// ===========================
// مقارنة التوقيع
// ===========================
if (hash_equals($calculatedSignature, $tapSignature)) {
    // ✅ التوقيع صحيح - الرسالة من Tap
    $data = json_decode($input, true);
    
    // مثال: تخزين حالة الدفع
    $paymentId = $data['id'];
    $status = $data['status'];

    // هنا ممكن تخزن المعلومات في قاعدة بيانات أو ملف
    file_put_contents("payments.log", date('Y-m-d H:i:s')." | $paymentId | $status\n", FILE_APPEND);

    // الرد لـ Tap
    http_response_code(200);
    echo json_encode(["message" => "Payment verified"]);
} else {
    // ❌ التوقيع غير صحيح
    http_response_code(400);
    echo json_encode(["error" => "Invalid signature"]);
}