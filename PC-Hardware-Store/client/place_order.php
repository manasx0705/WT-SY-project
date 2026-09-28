<?php
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $name = $_POST['name'] ?? '';
    $email = $_POST['email'] ?? '';
    $phone = $_POST['phone'] ?? '';
    $address = $_POST['address'] ?? '';
    $city = $_POST['city'] ?? '';
    $state = $_POST['state'] ?? '';
    $pincode = $_POST['pincode'] ?? '';
    $payment = $_POST['payment'] ?? '';
    
    // Default cart data if none provided
    $cartData = $_POST['cart_data'] ?? '[]';
    $cart = json_decode($cartData, true);
    if (!is_array($cart)) {
        $cart = [];
    }

    $order = [
        'order_id' => time(),
        'date' => date('d F Y'), // e.g. 25 September 2026
        'name' => $name,
        'email' => $email,
        'phone' => $phone,
        'address' => "$address, $city, $state - $pincode",
        'payment' => $payment,
        'items' => $cart,
        'status' => 'Processing'
    ];

    $ordersFile = 'orders.json';
    $orders = [];
    if (file_exists($ordersFile)) {
        $fileContent = file_get_contents($ordersFile);
        $decoded = json_decode($fileContent, true);
        if (is_array($decoded)) {
            $orders = $decoded;
        }
    }
    
    $orders[] = $order;
    file_put_contents($ordersFile, json_encode($orders, JSON_PRETTY_PRINT));

    // Redirect to orders page
    header("Location: orders.html");
    exit();
}
?>
