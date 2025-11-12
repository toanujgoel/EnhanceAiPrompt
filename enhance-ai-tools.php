<?php
/**
 * Plugin Name: EnhanceAI Tools
 * Plugin URI: https://yourdomain.com
 * Description: AI-powered tools for content creation and enhancement
 * Version: 1.0.0
 * Author: Your Name
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class EnhanceAITools {
    
    public function __construct() {
        add_action('init', array($this, 'init'));
        register_activation_hook(__FILE__, array($this, 'activate'));
    }
    
    public function init() {
        // Add shortcode
        add_shortcode('enhance_ai_tools', array($this, 'render_shortcode'));
        
        // Add admin menu
        if (is_admin()) {
            add_action('admin_menu', array($this, 'admin_menu'));
        }
    }
    
    // Shortcode to embed the React app
    public function render_shortcode($atts) {
        $atts = shortcode_atts(array(
            'height' => '800px',
        ), $atts);
        
        $site_url = get_site_url();
        
        ob_start();
        ?>
        <div style="width: 100%; height: <?php echo esc_attr($atts['height']); ?>; border: none; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <iframe 
                src="<?php echo esc_url($site_url . '/ai-tools/'); ?>" 
                width="100%" 
                height="100%" 
                frameborder="0"
                style="border: none; border-radius: 12px;"
                allow="microphone; camera">
            </iframe>
        </div>
        <?php
        return ob_get_clean();
    }
    
    // Admin menu
    public function admin_menu() {
        add_menu_page(
            'AI Tools',
            'AI Tools', 
            'manage_options',
            'enhance-ai-tools',
            array($this, 'admin_page'),
            'dashicons-robot',
            30
        );
    }
    
    public function admin_page() {
        ?>
        <div class="wrap">
            <h1>EnhanceAI Tools</h1>
            <div class="card" style="padding: 20px; margin-top: 20px;">
                <h2>Available Shortcodes</h2>
                <p>Use these shortcodes to embed AI tools in your pages and posts:</p>
                <ul>
                    <li><strong>[enhance_ai_tools]</strong> - Full AI tools suite (default height: 800px)</li>
                    <li><strong>[enhance_ai_tools height="600px"]</strong> - Custom height</li>
                </ul>
                
                <h3>Direct Link</h3>
                <p>Direct access: <a href="<?php echo get_site_url() . '/ai-tools/'; ?>" target="_blank"><?php echo get_site_url() . '/ai-tools/'; ?></a></p>
                
                <h3>Test Your Deployment</h3>
                <p>Click the link above to test if your AI tools are working correctly.</p>
            </div>
        </div>
        <?php
    }
    
    public function activate() {
        // Create AI Tools page if it doesn't exist
        $page_check = get_page_by_title('AI Tools');
        if (!$page_check) {
            wp_insert_post(array(
                'post_title' => 'AI Tools',
                'post_content' => '[enhance_ai_tools]',
                'post_status' => 'publish',
                'post_type' => 'page',
                'post_slug' => 'ai-tools-page'
            ));
        }
    }
}

// Initialize the plugin
new EnhanceAITools();
?>