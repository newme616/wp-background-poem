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

    wp_enqueue_style(
        'hero-landing-poem-style',
        plugin_dir_url(__FILE__) . 'css/style.css',
        [],
        '1.2'
    );
    wp_enqueue_script(
        'hero-landing-poem-script',
        plugin_dir_url(__FILE__) . 'js/typewriter.js',
        [],
        '1.2',
        true
    );

    wp_enqueue_script(
        'hero-landing-poem-autofit',
        plugin_dir_url(__FILE__) . 'js/autofit.js',
        [],
        '1.0',
        true
    );

    wp_enqueue_script(
        'hero-landing-poem-blur-animation',
        plugin_dir_url(__FILE__) . 'js/blur-animation.js',
        [],
        '1.0',
        true
    );
}
add_action('wp_enqueue_scripts', 'hero_landing_poem_enqueue_assets');

function render_hero_landing_poem_block($attributes, $content) {
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
    $auto_fit_text = $attributes['auto_fit_text'] ?? true;

    // Build the style string for the main container (background image/color)
    $container_style = '';
    if (!empty($attributes['background_image_url'])) {
        $container_style .= 'background-image: url(' . esc_url($attributes['background_image_url']) . ');';
    }
    if (!empty($attributes['container_background_color'])) {
        $container_style .= 'background-color:' . esc_attr($attributes['container_background_color']) . ';';
    }

    $output = '<div class="hero-landing-poem-container" style="' . $container_style . '">';

    // Build the style string for the background text container (.hero-landing-poem-bg)
    $bg_style = '';
    if (!empty($attributes['text_position_vertical'])) {
        $bg_style .= 'align-items:' . esc_attr($attributes['text_position_vertical']) . ';';
    }
    if (!empty($attributes['text_position_horizontal'])) {
        $bg_style .= 'justify-content:' . esc_attr($attributes['text_position_horizontal']) . ';';
    }
    if (!empty($attributes['text_align'])) {
        $align_value = in_array($attributes['text_align'], ['top-left', 'center-left', 'bottom-left']) ? 'left' :
                      (in_array($attributes['text_align'], ['top-center', 'center', 'bottom-center']) ? 'center' : 'right');
        $bg_style .= 'text-align:' . $align_value . ';';
    }
    if (isset($attributes['background_opacity'])) {
        $bg_style .= 'opacity:' . esc_attr($attributes['background_opacity']) . ';';
    }

    // Build the style string for the poem text itself (.hero-poem-blur-container)
    $poem_style = '';
    if (!$auto_fit_text) {
        $poem_style .= 'font-size:' . ($attributes['background_text_size'] ?? $default_bg_size) . ';';
    }
    if (!empty($attributes['background_font_family'])) {
        $poem_style .= 'font-family:' . esc_attr($attributes['background_font_family']) . ';';
    }
    if (!empty($attributes['background_font_weight'])) {
        $poem_style .= 'font-weight:' . esc_attr($attributes['background_font_weight']) . ';';
    }
    if (!empty($attributes['background_font_style'])) {
        $poem_style .= 'font-style:' . esc_attr($attributes['background_font_style']) . ';';
    }
    if (isset($attributes['background_line_height'])) {
        $poem_style .= 'line-height:' . esc_attr($attributes['background_line_height']) . ';';
    }
    if (isset($attributes['background_letter_spacing'])) {
        $poem_style .= 'letter-spacing:' . esc_attr($attributes['background_letter_spacing']) . 'px;';
    }
    if (!empty($attributes['background_color'])) {
        $poem_style .= 'color:' . esc_attr($attributes['background_color']) . ';';
    }
    if (isset($attributes['background_blur']) && $attributes['background_blur'] > 0) {
        if (empty($attributes['enable_blur_animation'])) {
            $poem_style .= 'filter:blur(' . esc_attr($attributes['background_blur']) . 'px);';
        }
    }

    $container_attrs = $auto_fit_text ? ' data-auto-fit-text="true"' : '';
    
    $typewriter_attrs = 'data-text="' . esc_attr($background_text) . '"';
    if (isset($attributes['typing_speed'])) {
        $typewriter_attrs .= ' data-typing-speed="' . esc_attr($attributes['typing_speed']) . '"';
    }
    if (isset($attributes['start_delay'])) {
        $typewriter_attrs .= ' data-start-delay="' . esc_attr($attributes['start_delay']) . '"';
    }

    $poem_attrs = '';
    if (!empty($attributes['enable_blur_animation']) && $attributes['background_blur'] > 0) {
        $poem_attrs .= ' data-blur-animation="true"';
        $poem_attrs .= ' data-blur-target="' . esc_attr($attributes['background_blur']) . '"';
        $poem_attrs .= ' data-blur-duration="' . esc_attr($attributes['blur_animation_duration']) . '"';
    }
    
    $output .= '<div class="hero-landing-poem-bg"' . $container_attrs . ' style="' . $bg_style . '"><div class="hero-poem-blur-container"' . $poem_attrs . ' style="' . $poem_style . '"><span class="hero-typewriter-target" ' . $typewriter_attrs . '></span></div></div>';
    
    $content_style = '';
    if (!empty($attributes['content_font_size'])) {
        $content_style .= 'font-size:' . esc_attr($attributes['content_font_size']) . ';';
    }
    if (!empty($attributes['content_color'])) {
        $content_style .= 'color:' . esc_attr($attributes['content_color']) . ';';
    }
    
    // Add content positioning styles
    if (!empty($attributes['content_position_vertical'])) {
        $content_style .= 'align-items:' . esc_attr($attributes['content_position_vertical']) . ';';
    }
    if (!empty($attributes['content_position_horizontal'])) {
        $content_style .= 'justify-content:' . esc_attr($attributes['content_position_horizontal']) . ';';
    }
    if (!empty($attributes['content_align'])) {
        $align_value = in_array($attributes['content_align'], ['top-left', 'center-left', 'bottom-left']) ? 'left' :
                      (in_array($attributes['content_align'], ['top-center', 'center', 'bottom-center']) ? 'center' : 'right');
        $content_style .= 'text-align:' . $align_value . ';';
    }
    
    if ($content) {
        $output .= '<div class="hero-landing-poem-content" style="' . $content_style . '">' . $content . '</div>';
    }
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
