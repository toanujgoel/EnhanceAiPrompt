<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-User-Plan');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Configuration
$RATE_LIMIT_FILE = '../data/rate-limits.json';
$FREE_DAILY_LIMIT = 5;
$PREMIUM_DAILY_LIMIT = 100;

// Ensure data directory exists
if (!file_exists('../data')) {
    mkdir('../data', 0755, true);
}

// Initialize rate limit file if it doesn't exist
if (!file_exists($RATE_LIMIT_FILE)) {
    file_put_contents($RATE_LIMIT_FILE, json_encode([
        'ips' => [],
        'lastCleanup' => date('Y-m-d')
    ]));
}

function getUserIP() {
    // Get the most accurate IP address
    $ipKeys = ['HTTP_X_FORWARDED_FOR', 'HTTP_X_REAL_IP', 'HTTP_CLIENT_IP', 'REMOTE_ADDR'];
    
    foreach ($ipKeys as $key) {
        if (!empty($_SERVER[$key])) {
            $ips = explode(',', $_SERVER[$key]);
            $ip = trim($ips[0]);
            
            // Validate IP address
            if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                return $ip;
            }
        }
    }
    
    // Fallback to REMOTE_ADDR even if it's private (for localhost testing)
    return $_SERVER['REMOTE_ADDR'] ?? 'unknown';
}

function cleanupOldEntries(&$data) {
    $today = date('Y-m-d');
    
    // If it's a new day, reset all counters
    if ($data['lastCleanup'] !== $today) {
        $data['ips'] = [];
        $data['lastCleanup'] = $today;
        return true;
    }
    
    return false;
}

function getRateLimitData() {
    global $RATE_LIMIT_FILE;
    
    if (!file_exists($RATE_LIMIT_FILE)) {
        return ['ips' => [], 'lastCleanup' => date('Y-m-d')];
    }
    
    $data = json_decode(file_get_contents($RATE_LIMIT_FILE), true);
    if (!$data) {
        return ['ips' => [], 'lastCleanup' => date('Y-m-d')];
    }
    
    return $data;
}

function saveRateLimitData($data) {
    global $RATE_LIMIT_FILE;
    return file_put_contents($RATE_LIMIT_FILE, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
}

function getUserUsage($ip, $data) {
    if (!isset($data['ips'][$ip])) {
        return ['count' => 0, 'date' => date('Y-m-d')];
    }
    
    return $data['ips'][$ip];
}

function incrementUsage($ip, &$data) {
    if (!isset($data['ips'][$ip])) {
        $data['ips'][$ip] = ['count' => 0, 'date' => date('Y-m-d')];
    }
    
    $data['ips'][$ip]['count']++;
    $data['ips'][$ip]['date'] = date('Y-m-d');
}

// Main logic
$userIP = getUserIP();
$userPlan = $_SERVER['HTTP_X_USER_PLAN'] ?? 'FREE';
$method = $_SERVER['REQUEST_METHOD'];

// Load current rate limit data
$rateLimitData = getRateLimitData();

// Clean up old entries if needed
$wasCleanedUp = cleanupOldEntries($rateLimitData);
if ($wasCleanedUp) {
    saveRateLimitData($rateLimitData);
}

if ($method === 'GET') {
    // Return current usage status
    $usage = getUserUsage($userIP, $rateLimitData);
    $limit = ($userPlan === 'PREMIUM') ? $PREMIUM_DAILY_LIMIT : $FREE_DAILY_LIMIT;
    $remaining = max(0, $limit - $usage['count']);
    
    echo json_encode([
        'ip' => $userIP,
        'plan' => $userPlan,
        'usage' => $usage['count'],
        'limit' => $limit,
        'remaining' => $remaining,
        'date' => $usage['date'],
        'canUse' => $remaining > 0
    ]);
    exit;
}

if ($method === 'POST') {
    // Check if user can make a request
    $usage = getUserUsage($userIP, $rateLimitData);
    $limit = ($userPlan === 'PREMIUM') ? $PREMIUM_DAILY_LIMIT : $FREE_DAILY_LIMIT;
    
    if ($usage['count'] >= $limit) {
        http_response_code(429); // Too Many Requests
        echo json_encode([
            'error' => 'Daily usage limit exceeded',
            'usage' => $usage['count'],
            'limit' => $limit,
            'resetTime' => date('Y-m-d 00:00:00', strtotime('+1 day')),
            'upgradeRequired' => $userPlan === 'FREE'
        ]);
        exit;
    }
    
    // Parse the request to determine tool type
    $input = json_decode(file_get_contents('php://input'), true);
    $tool = $input['tool'] ?? 'unknown';
    
    // Increment usage
    incrementUsage($userIP, $rateLimitData);
    
    // Save updated data
    if (!saveRateLimitData($rateLimitData)) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to update usage tracking']);
        exit;
    }
    
    // Return success with updated usage info
    $newUsage = getUserUsage($userIP, $rateLimitData);
    $remaining = max(0, $limit - $newUsage['count']);
    
    echo json_encode([
        'success' => true,
        'tool' => $tool,
        'usage' => $newUsage['count'],
        'limit' => $limit,
        'remaining' => $remaining,
        'canContinue' => $remaining > 0
    ]);
    exit;
}

// Method not allowed
http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
?>