<?php
/**
 * Plugin Name: Hero Landing Poem
 * Plugin URI: https://matthiasneumayer.com
 * Description: Shortcode [hero_landing_poem] for a full-screen hero with a typewriter poem background and centered text. Supports background image, custom colors, typing speed.
 * Version: 3.0.0
 * Author: Matthias Neumayer
 * License: GPL2+
 */

if (!defined('ABSPATH')) exit;

// Ensure proper MIME types for JavaScript files
function hero_landing_poem_fix_mime_types() {
    // Fix JavaScript MIME type issues
    if (!wp_doing_ajax() && !is_admin()) {
        add_action('init', function() {
            if (isset($_SERVER['REQUEST_URI']) && 
                strpos($_SERVER['REQUEST_URI'], '/hero-landing-poem/js/') !== false &&
                pathinfo($_SERVER['REQUEST_URI'], PATHINFO_EXTENSION) === 'js') {
                header('Content-Type: application/javascript; charset=utf-8');
            }
        });
    }
}
add_action('plugins_loaded', 'hero_landing_poem_fix_mime_types');

function hero_landing_poem_block_init() {
    register_block_type( __DIR__ . '/build', [
        'render_callback' => 'render_hero_landing_poem_block'
    ] );
}
add_action( 'init', 'hero_landing_poem_block_init' );

function hero_landing_poem_enqueue_assets() {
    // Only enqueue if the block is present
    if ( !is_singular() || !has_block('hero-landing-poem/hero-landing-poem') ) {
        return;
    }

    $plugin_version = '3.0.2'; // Increment version to force cache refresh
    $plugin_url = plugin_dir_url(__FILE__);
    
    // Ensure files exist before enqueuing
    $plugin_path = plugin_dir_path(__FILE__);

    // Enqueue CSS
    wp_enqueue_style(
        'hero-landing-poem-style',
        $plugin_url . 'css/style.css',
        [],
        $plugin_version
    );

    // Enqueue JavaScript files with proper dependencies and file existence checks
    if (file_exists($plugin_path . 'js/typewriter.js')) {
        wp_enqueue_script(
            'hero-landing-poem-typewriter',
            $plugin_url . 'js/typewriter.js',
            [],
            $plugin_version,
            true
        );
    }

    if (file_exists($plugin_path . 'js/autofit.js')) {
        wp_enqueue_script(
            'hero-landing-poem-autofit',
            $plugin_url . 'js/autofit.js',
            ['hero-landing-poem-typewriter'], // Depends on typewriter
            $plugin_version,
            true
        );
    }

    if (file_exists($plugin_path . 'js/blur-animation.js')) {
        wp_enqueue_script(
            'hero-landing-poem-blur-animation',
            $plugin_url . 'js/blur-animation.js',
            [],
            $plugin_version,
            true
        );
    }

    if (file_exists($plugin_path . 'js/scroll-arrow.js')) {
        wp_enqueue_script(
            'hero-landing-poem-scroll-arrow',
            $plugin_url . 'js/scroll-arrow.js',
            [], // No dependencies to avoid conflicts
            $plugin_version,
            true
        );
    }
    
}
add_action('wp_enqueue_scripts', 'hero_landing_poem_enqueue_assets');

function render_hero_landing_poem_block($attributes, $content) {
    // Note: $content is no longer used as we've removed InnerBlocks.
    
    $options = get_option('hero_landing_poem_settings');
    
    // Fallback values from global settings
    $default_text = $options['text'] ?? 'Kurz nach acht Uhr verlor ich den Verstand.
Ich saß im Garten und schrieb, 
als plötzlich die Wörter begannen
zu flüstern und zu tanzen,
sich von der Seite zu lösen.

Es war ein Samstagabend und ich
war auf einer Party.
Film war der Grund,
glaub ich.

The words were dancing now,
moving across the page
like shadows in candlelight,
each letter finding its way home.';
    $default_bg_size = $options['background_text_size'] ?? '14px';
    
    // Get values from attributes, with fallbacks to defaults
    $background_text = $attributes['background_text'] ?? $default_text;
    $auto_fit_text = $attributes['auto_fit_text'] ?? false;

    // Build the style string for the main container (background image/color)
    $container_style = '';
    if (!empty($attributes['background_image_url']) && filter_var($attributes['background_image_url'], FILTER_VALIDATE_URL)) {
        $container_style .= 'background-image: url(' . esc_url($attributes['background_image_url']) . ');';
    }
    if (!empty($attributes['container_background_color']) && preg_match('/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/', $attributes['container_background_color'])) {
        $container_style .= 'background-color:' . esc_attr($attributes['container_background_color']) . ';';
    }

    $output = '<div class="hero-landing-poem-container" style="' . $container_style . '">';

    // Build the style string for the background text container (.hero-landing-poem-bg)
    $bg_style = '';
    $valid_align_values = ['flex-start', 'center', 'flex-end'];
    
    // Handle vertical alignment - only apply if different from default 'flex-start'
    if (!empty($attributes['text_position_vertical']) && 
        in_array($attributes['text_position_vertical'], $valid_align_values) && 
        $attributes['text_position_vertical'] !== 'flex-start') {
        $bg_style .= 'align-items:' . esc_attr($attributes['text_position_vertical']) . ';';
    }
    
    // Handle horizontal alignment - only apply if different from default 'flex-start'
    if (!empty($attributes['text_position_horizontal']) && 
        in_array($attributes['text_position_horizontal'], $valid_align_values) && 
        $attributes['text_position_horizontal'] !== 'flex-start') {
        $bg_style .= 'justify-content:' . esc_attr($attributes['text_position_horizontal']) . ';';
    }
    
    // Build the style string for the poem text itself (.hero-poem-blur-container)
    $poem_style = '';
    
    // Handle text alignment - only apply if different from default 'top-left'
    if (!empty($attributes['text_align']) && $attributes['text_align'] !== 'top-left') {
        $align_value = in_array($attributes['text_align'], ['top-left', 'center-left', 'bottom-left']) ? 'left' :
                      (in_array($attributes['text_align'], ['top-center', 'center', 'bottom-center']) ? 'center' : 'right');
        $poem_style .= 'text-align:' . $align_value . ';';
    }
    
    // Handle font size - only apply if auto-fit is disabled
    if (!$auto_fit_text && !empty($attributes['background_text_size'])) {
        // Validate CSS font-size value
        if (preg_match('/^[0-9.]+(?:px|em|rem|%|vw|vh)$|^clamp\(.+\)$/', $attributes['background_text_size'])) {
            $poem_style .= 'font-size:' . esc_attr($attributes['background_text_size']) . ';';
        } else {
            $poem_style .= 'font-size:' . esc_attr($default_bg_size) . ';';
        }
    } elseif (!$auto_fit_text) {
        $poem_style .= 'font-size:' . esc_attr($default_bg_size) . ';';
    }
    if (!empty($attributes['background_font_family'])) {
        $poem_style .= 'font-family:' . esc_attr($attributes['background_font_family']) . ';';
    }
    if (!empty($attributes['background_font_weight'])) {
        $poem_style .= 'font-weight:' . esc_attr($attributes['background_font_weight']) . ';';
    }
    if (!empty($attributes['background_font_style']) && in_array($attributes['background_font_style'], ['normal', 'italic', 'oblique'])) {
        $poem_style .= 'font-style:' . esc_attr($attributes['background_font_style']) . ';';
    }
    if (isset($attributes['background_line_height']) && is_numeric($attributes['background_line_height']) && $attributes['background_line_height'] > 0) {
        $poem_style .= 'line-height:' . esc_attr($attributes['background_line_height']) . ';';
    }
    if (isset($attributes['background_letter_spacing']) && is_numeric($attributes['background_letter_spacing'])) {
        $poem_style .= 'letter-spacing:' . esc_attr($attributes['background_letter_spacing']) . 'px;';
    }
    if (!empty($attributes['background_color']) && preg_match('/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/', $attributes['background_color'])) {
        $poem_style .= 'color:' . esc_attr($attributes['background_color']) . ';';
    }
    if (isset($attributes['background_opacity']) && is_numeric($attributes['background_opacity']) && $attributes['background_opacity'] >= 0 && $attributes['background_opacity'] <= 1) {
        $poem_style .= 'opacity:' . esc_attr($attributes['background_opacity']) . ';';
    }
    if (isset($attributes['background_blur']) && is_numeric($attributes['background_blur']) && $attributes['background_blur'] >= 0) {
        if (empty($attributes['enable_blur_animation'])) {
            $poem_style .= 'filter:blur(' . esc_attr(min($attributes['background_blur'], 50)) . 'px);'; // Cap at 50px
        }
    }

    $container_attrs = $auto_fit_text ? ' data-auto-fit-text="true"' : '';
    
    $typewriter_attrs = 'data-text="' . esc_attr($background_text) . '"';
    if (isset($attributes['typing_speed']) && is_numeric($attributes['typing_speed']) && $attributes['typing_speed'] > 0) {
        $typewriter_attrs .= ' data-typing-speed="' . esc_attr(max(10, min($attributes['typing_speed'], 1000))) . '"'; // Bounds: 10-1000ms
    }
    if (isset($attributes['start_delay']) && is_numeric($attributes['start_delay']) && $attributes['start_delay'] >= 0) {
        $typewriter_attrs .= ' data-start-delay="' . esc_attr(min($attributes['start_delay'], 10000)) . '"'; // Cap at 10s
    }

    $poem_attrs = '';
    if (!empty($attributes['enable_blur_animation']) && isset($attributes['background_blur']) && $attributes['background_blur'] > 0) {
        $poem_attrs .= ' data-blur-animation="true"';
        $poem_attrs .= ' data-blur-target="' . esc_attr(min($attributes['background_blur'], 50)) . '"'; // Cap at 50px
        if (isset($attributes['blur_animation_duration']) && is_numeric($attributes['blur_animation_duration'])) {
            $poem_attrs .= ' data-blur-duration="' . esc_attr(max(500, min($attributes['blur_animation_duration'], 30000))) . '"'; // Bounds: 0.5-30s
        }
    }
    
    $output .= '<div class="hero-landing-poem-bg"' . $container_attrs . ' style="' . $bg_style . '"><div class="hero-poem-blur-container"' . $poem_attrs . ' style="' . $poem_style . '"><span class="hero-typewriter-target" ' . $typewriter_attrs . '></span></div></div>';
    
    // Add scroll-down arrow
    $arrow_styles = [];
    if (isset($attributes['arrow_fade_in_delay']) && is_numeric($attributes['arrow_fade_in_delay'])) {
        $delay_in_ms = max(0, min($attributes['arrow_fade_in_delay'], 60000)); // Bounds: 0-60s
        $arrow_styles[] = 'animation-delay: ' . esc_attr($delay_in_ms) . 'ms';
    }
    
    // Handle custom bottom spacing for the arrow
    if (!empty($attributes['arrow_bottom_spacing'])) {
        // Basic validation for a CSS size value
        if (preg_match('/^[0-9.]+(?:px|em|rem|%|vw|vh)$/', $attributes['arrow_bottom_spacing'])) {
            $arrow_styles[] = 'bottom: ' . esc_attr($attributes['arrow_bottom_spacing']);
        }
    }
    
    $arrow_style_attr = !empty($arrow_styles) ? 'style="' . implode(';', $arrow_styles) . ';"' : '';
    $output .= '<a href="#autorin" class="scroll-down" ' . $arrow_style_attr . ' aria-label="Scroll to next section"></a>';
    
    $output .= '</div>';

    return $output;
}

function hero_landing_poem_settings_menu() {
    add_options_page(
        'Hero Landing Poem Settings',
        'Hero Landing Poem',
        'manage_options',
        'hero-landing-poem-settings',
        'hero_landing_poem_settings_page'
    );
}
add_action('admin_menu', 'hero_landing_poem_settings_menu');

function hero_landing_poem_settings_page() {
    ?>
    <div class="wrap">
        <h1>Hero Landing Poem Settings</h1>
        <form method="post" action="options.php">
            <?php
            settings_fields('hero_landing_poem_settings_group');
            do_settings_sections('hero-landing-poem-settings');
            submit_button();
            ?>
        </form>
    </div>
    <?php
}

function hero_landing_poem_register_settings() {
    register_setting('hero_landing_poem_settings_group', 'hero_landing_poem_settings');

    add_settings_section('hero_landing_poem_main', 'General Settings', null, 'hero-landing-poem-settings');

    add_settings_field(
        'hero_landing_poem_text',
        'Default Background Text',
        function() {
            $options = get_option('hero_landing_poem_settings');
            $value = $options['text'] ?? '';
            echo '<textarea name="hero_landing_poem_settings[text]" rows="10" cols="60">' . esc_textarea($value) . '</textarea>';
            echo '<p class="description">This is the default text for the typewriter effect in the background.</p>';
        },
        'hero-landing-poem-settings',
        'hero_landing_poem_main'
    );

    add_settings_field(
        'hero_landing_poem_background_text_size',
        'Background Font Size',
        function() {
            $options = get_option('hero_landing_poem_settings');
            $value = $options['background_text_size'] ?? 'clamp(1.5rem, 3vw, 3rem)';
            echo '<input type="text" name="hero_landing_poem_settings[background_text_size]" value="' . esc_attr($value) . '" />';
            echo '<p class="description">CSS font-size value for the background text (e.g., clamp(1.5rem, 3vw, 3rem)).</p>';
        },
        'hero-landing-poem-settings',
        'hero_landing_poem_main'
    );

    // Add more settings fields as needed for other attributes
    add_settings_field(
        'hero_landing_poem_background_font_family',
        'Background Font Family',
        function() {
            $options = get_option('hero_landing_poem_settings');
            $value = $options['background_font_family'] ?? '';
            echo '<input type="text" name="hero_landing_poem_settings[background_font_family]" value="' . esc_attr($value) . '" />';
            echo '<p class="description">CSS font-family for the background text (e.g., Georgia, serif).</p>';
        },
        'hero-landing-poem-settings',
        'hero_landing_poem_main'
    );
    add_settings_field(
        'hero_landing_poem_background_font_weight',
        'Background Font Weight',
        function() {
            $options = get_option('hero_landing_poem_settings');
            $value = $options['background_font_weight'] ?? '';
            echo '<input type="text" name="hero_landing_poem_settings[background_font_weight]" value="' . esc_attr($value) . '" />';
            echo '<p class="description">CSS font-weight for the background text (e.g., 400, bold).</p>';
        },
        'hero-landing-poem-settings',
        'hero_landing_poem_main'
    );
    add_settings_field(
        'hero_landing_poem_background_font_style',
        'Background Font Style',
        function() {
            $options = get_option('hero_landing_poem_settings');
            $value = $options['background_font_style'] ?? '';
            echo '<input type="text" name="hero_landing_poem_settings[background_font_style]" value="' . esc_attr($value) . '" />';
            echo '<p class="description">CSS font-style for the background text (e.g., normal, italic).</p>';
        },
        'hero-landing-poem-settings',
        'hero_landing_poem_main'
    );
    add_settings_field(
        'hero_landing_poem_background_line_height',
        'Background Line Height',
        function() {
            $options = get_option('hero_landing_poem_settings');
            $value = $options['background_line_height'] ?? '';
            echo '<input type="text" name="hero_landing_poem_settings[background_line_height]" value="' . esc_attr($value) . '" />';
            echo '<p class="description">CSS line-height for the background text (e.g., 1.5).</p>';
        },
        'hero-landing-poem-settings',
        'hero_landing_poem_main'
    );
    add_settings_field(
        'hero_landing_poem_background_letter_spacing',
        'Background Letter Spacing',
        function() {
            $options = get_option('hero_landing_poem_settings');
            $value = $options['background_letter_spacing'] ?? '';
            echo '<input type="text" name="hero_landing_poem_settings[background_letter_spacing]" value="' . esc_attr($value) . '" />';
            echo '<p class="description">CSS letter-spacing for the background text (e.g., 0.1).</p>';
        },
        'hero-landing-poem-settings',
        'hero_landing_poem_main'
    );
}
add_action('admin_init', 'hero_landing_poem_register_settings');
?>
