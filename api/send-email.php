<?php
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid request body']);
    exit;
}

$name    = htmlspecialchars(trim($data['name'] ?? ''), ENT_QUOTES, 'UTF-8');
$phone   = htmlspecialchars(trim($data['phone'] ?? ''), ENT_QUOTES, 'UTF-8');
$email   = filter_var(trim($data['email'] ?? ''), FILTER_SANITIZE_EMAIL);
$service = htmlspecialchars(trim($data['service'] ?? ''), ENT_QUOTES, 'UTF-8');
$message = htmlspecialchars(trim($data['message'] ?? ''), ENT_QUOTES, 'UTF-8');

// Calculator-specific fields
$messenger = htmlspecialchars(trim($data['messenger'] ?? ''), ENT_QUOTES, 'UTF-8');
$summary   = htmlspecialchars(trim($data['summary'] ?? ''), ENT_QUOTES, 'UTF-8');
$priceMin  = htmlspecialchars(trim($data['price_min'] ?? ''), ENT_QUOTES, 'UTF-8');
$priceMax  = htmlspecialchars(trim($data['price_max'] ?? ''), ENT_QUOTES, 'UTF-8');

// Validate required fields
if (empty($name) || empty($phone)) {
    http_response_code(400);
    echo json_encode(['error' => 'Name and phone are required']);
    exit;
}

// Build email body
$to = 'info@svoemore.com.ua'; // Change to actual company email
$subject = "=?UTF-8?B?" . base64_encode("Нова заявка з сайту: $name") . "?=";

$body = "Нова заявка з сайту Своє Море\n";
$body .= "================================\n\n";
$body .= "Ім'я: $name\n";
$body .= "Телефон: $phone\n";

if ($email) {
    $body .= "Email: $email\n";
}
if ($service) {
    $body .= "Послуга: $service\n";
}
if ($messenger) {
    $body .= "Месенджер: $messenger\n";
}
if ($message) {
    $body .= "\nПовідомлення:\n$message\n";
}
if ($summary) {
    $body .= "\n--- Розрахунок калькулятора ---\n";
    $body .= "$summary\n";
    if ($priceMin && $priceMax) {
        $body .= "Орієнтовна вартість: від $priceMin до $priceMax грн\n";
    }
}

$body .= "\n================================\n";
$body .= "Відправлено: " . date('d.m.Y H:i:s') . "\n";

$headers  = "From: noreply@svoemore.com.ua\r\n";
$headers .= "Reply-To: " . ($email ?: "noreply@svoemore.com.ua") . "\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";

$sent = mail($to, $subject, $body, $headers);

if ($sent) {
    echo json_encode(['success' => true, 'message' => 'Email sent successfully']);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to send email']);
}
