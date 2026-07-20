<?php
/**
 * Eldorado Sofa - cPanel Host Database API
 * This file handles dynamic data persistence using a secure flat-file database on your hosting.
 * It is completely independent of external cloud servers and immune to network blockages in Iran.
 */

// Headers for security and CORS (allows development server to talk to it if needed)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json; charset=utf-8");

// Password matches the Admin Panel passcode: 'qwertyuiop1234567890'
define('ADMIN_PASSWORD', 'qwertyuiop1234567890');
define('DB_FILE', __DIR__ . '/data_db.php');

// Handle CORS Preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Function to safely read data from the PHP-protected database file
function read_database() {
    if (!file_exists(DB_FILE)) {
        return [];
    }
    $content = file_get_contents(DB_FILE);
    // Remove the PHP security execution wrapper
    $json = str_replace("<?php exit; ?>\n", "", $content);
    $json = str_replace("<?php exit; ?>", "", $json);
    return json_decode(trim($json), true) ?: [];
}

// Function to safely write data to the PHP-protected database file
function write_database($data) {
    // We add <?php exit; ?> on the very first line. If anyone tries to access data_db.php in their browser directly, 
    // the web server will execute the PHP file, hit 'exit;', and return absolutely nothing, keeping your data 100% secure!
    $content = "<?php exit; ?>\n" . json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    return file_put_contents(DB_FILE, $content) !== false;
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Anyone (customers) can read the public catalog data
    $db = read_database();
    
    // Hide administrative details like password logs if any, but return the entities
    $response = [
        'eldorado_products' => isset($db['eldorado_products']) ? $db['eldorado_products'] : null,
        'eldorado_blogs' => isset($db['eldorado_blogs']) ? $db['eldorado_blogs'] : null,
        'eldorado_home_config' => isset($db['eldorado_home_config']) ? $db['eldorado_home_config'] : null,
        'eldorado_categories' => isset($db['eldorado_categories']) ? $db['eldorado_categories'] : null,
        // Inquiries can be public/fetched by admin, but we keep it inside the database
        'eldorado_inquiries' => isset($db['eldorado_inquiries']) ? $db['eldorado_inquiries'] : null,
        'eldorado_contact_settings' => isset($db['eldorado_contact_settings']) ? $db['eldorado_contact_settings'] : null,
    ];
    
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    exit;
}

if ($method === 'POST') {
    $raw_input = file_get_contents('php://input');
    $input = json_decode($raw_input, true);
    
    if (!$input) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON payload.'], JSON_UNESCAPED_UNICODE);
        exit;
    }
    
    $action = isset($input['action']) ? $input['action'] : '';
    
    // For lead/inquiry submission, we DO NOT require admin password, so any visitor can submit an inquiry!
    if ($action === 'submit_inquiry') {
        $new_lead = isset($input['lead']) ? $input['lead'] : null;
        if (!$new_lead) {
            http_response_code(400);
            echo json_encode(['error' => 'No lead data provided.'], JSON_UNESCAPED_UNICODE);
            exit;
        }
        
        $db = read_database();
        $inquiries = isset($db['eldorado_inquiries']) && is_array($db['eldorado_inquiries']) ? $db['eldorado_inquiries'] : [];
        
        // Push the new inquiry to the top of the array
        array_unshift($inquiries, $new_lead);
        $db['eldorado_inquiries'] = $inquiries;
        
        if (write_database($db)) {
            echo json_encode(['success' => true, 'message' => 'Lead registered successfully.'], JSON_UNESCAPED_UNICODE);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to save lead to host storage.'], JSON_UNESCAPED_UNICODE);
        }
        exit;
    }
    
    // All other write operations require Admin authentication
    $password = isset($input['password']) ? $input['password'] : '';
    if ($password !== ADMIN_PASSWORD) {
        http_response_code(403);
        echo json_encode(['error' => 'Access Denied. Incorrect administration password.'], JSON_UNESCAPED_UNICODE);
        exit;
    }
    
    $db = read_database();
    
    if ($action === 'save_all') {
        if (isset($input['products'])) $db['eldorado_products'] = $input['products'];
        if (isset($input['blogs'])) $db['eldorado_blogs'] = $input['blogs'];
        if (isset($input['homeConfig'])) $db['eldorado_home_config'] = $input['homeConfig'];
        if (isset($input['categories'])) $db['eldorado_categories'] = $input['categories'];
        if (isset($input['inquiries'])) $db['eldorado_inquiries'] = $input['inquiries'];
        if (isset($input['contactSettings'])) $db['eldorado_contact_settings'] = $input['contactSettings'];
        
        if (write_database($db)) {
            echo json_encode(['success' => true, 'message' => 'All database changes saved to host successfully.'], JSON_UNESCAPED_UNICODE);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to write to database on host.'], JSON_UNESCAPED_UNICODE);
        }
        exit;
    }
    
    if ($action === 'save_key') {
        $key = isset($input['key']) ? $input['key'] : '';
        $data = isset($input['data']) ? $input['data'] : null;
        
        if (!$key) {
            http_response_code(400);
            echo json_encode(['error' => 'Key parameter is required.'], JSON_UNESCAPED_UNICODE);
            exit;
        }
        
        $db[$key] = $data;
        if (write_database($db)) {
            echo json_encode(['success' => true, 'message' => "Key '{$key}' saved successfully."], JSON_UNESCAPED_UNICODE);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to write to database on host.'], JSON_UNESCAPED_UNICODE);
        }
        exit;
    }
    
    http_response_code(400);
    echo json_encode(['error' => 'Unknown action requested.'], JSON_UNESCAPED_UNICODE);
    exit;
}
