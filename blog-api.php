<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Path to the blog posts JSON file
$blogDataFile = __DIR__ . '/data/dynamic-blog-posts.json';
$staticBlogPosts = __DIR__ . '/data/blogPosts.ts';

// Ensure the data directory exists
if (!is_dir(__DIR__ . '/data')) {
    mkdir(__DIR__ . '/data', 0755, true);
}

// Initialize the blog posts file if it doesn't exist
if (!file_exists($blogDataFile)) {
    file_put_contents($blogDataFile, json_encode([], JSON_PRETTY_PRINT));
}

function getBlogPosts() {
    global $blogDataFile;
    $content = file_get_contents($blogDataFile);
    return json_decode($content, true) ?: [];
}

function saveBlogPosts($posts) {
    global $blogDataFile;
    return file_put_contents($blogDataFile, json_encode($posts, JSON_PRETTY_PRINT));
}

function generateNextId($posts) {
    if (empty($posts)) {
        return 1000; // Start dynamic posts from ID 1000 to avoid conflicts with static posts
    }
    return max(array_column($posts, 'id')) + 1;
}

function validateBlogPost($data) {
    $required = ['title', 'category', 'excerpt', 'content'];
    foreach ($required as $field) {
        if (!isset($data[$field]) || empty(trim($data[$field]))) {
            return "Missing or empty required field: $field";
        }
    }
    return null;
}

function sanitizeInput($data) {
    return [
        'title' => htmlspecialchars(trim($data['title']), ENT_QUOTES, 'UTF-8'),
        'category' => htmlspecialchars(trim($data['category']), ENT_QUOTES, 'UTF-8'),
        'excerpt' => htmlspecialchars(trim($data['excerpt']), ENT_QUOTES, 'UTF-8'),
        'content' => trim($data['content']), // Content may contain HTML
        'imageUrl' => filter_var($data['imageUrl'] ?? '', FILTER_VALIDATE_URL) ?: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        'author' => [
            'name' => htmlspecialchars(trim($data['author']['name'] ?? 'AI Writer'), ENT_QUOTES, 'UTF-8'),
            'imageUrl' => filter_var($data['author']['imageUrl'] ?? '', FILTER_VALIDATE_URL) ?: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
        ]
    ];
}

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        // Return all blog posts (both static and dynamic)
        $dynamicPosts = getBlogPosts();
        
        // For GET requests, we'll return only dynamic posts
        // The frontend will merge them with static posts
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'posts' => $dynamicPosts,
            'count' => count($dynamicPosts)
        ]);
        break;

    case 'POST':
        // Add a new blog post (from n8n webhook)
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Invalid JSON data']);
            exit;
        }

        // Validate required fields
        $validation = validateBlogPost($input);
        if ($validation) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => $validation]);
            exit;
        }

        // Get existing posts
        $posts = getBlogPosts();
        
        // Sanitize and prepare new post
        $sanitized = sanitizeInput($input);
        $newPost = [
            'id' => generateNextId($posts),
            'title' => $sanitized['title'],
            'category' => $sanitized['category'],
            'excerpt' => $sanitized['excerpt'],
            'content' => $sanitized['content'],
            'imageUrl' => $sanitized['imageUrl'],
            'date' => date('M d, Y'),
            'author' => $sanitized['author'],
            'published' => true,
            'createdAt' => date('c'), // ISO 8601 format
            'source' => 'n8n-automation'
        ];

        // Add to beginning of array (newest first)
        array_unshift($posts, $newPost);
        
        // Limit to 50 dynamic posts to prevent unlimited growth
        $posts = array_slice($posts, 0, 50);

        // Save posts
        if (saveBlogPosts($posts)) {
            http_response_code(201);
            echo json_encode([
                'success' => true,
                'message' => 'Blog post created successfully',
                'post' => $newPost
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Failed to save blog post']);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed']);
        break;
}
?>