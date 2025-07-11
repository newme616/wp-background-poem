import { __ } from "@wordpress/i18n";
import { useBlockProps, InspectorControls, ColorPalette } from "@wordpress/block-editor";
import {
  PanelBody,
  TextControl,
  TextareaControl,
  SelectControl,
  RangeControl,
  ToggleControl,
} from "@wordpress/components";
import "./editor.scss";

export default function Edit({ attributes, setAttributes }) {
  const blockProps = useBlockProps();

  const {
    background_text,
    background_text_size,
    background_font_family,
    background_font_weight,
    background_font_style,
    background_line_height,
    background_letter_spacing,
    background_color,
    background_opacity,
  } = attributes;

  return (
    <>
      <InspectorControls>
        <PanelBody title={__("Poem Settings", "hero-landing-poem")}>
          <TextareaControl
            label={__("Background Poem Text", "hero-landing-poem")}
            value={background_text}
            onChange={(val) => setAttributes({ background_text: val })}
            help={__("Leave empty to use the text from the global settings.", "hero-landing-poem")}
          />
          <TextControl
            label={__("Background Font Size", "hero-landing-poem")}
            value={background_text_size}
            onChange={(val) => setAttributes({ background_text_size: val })}
            help={__("e.g., clamp(1.5rem, 3vw, 3rem). Leave empty to use default.", "hero-landing-poem")}
          />
          <TextControl
            label={__("Font Family", "hero-landing-poem")}
            value={background_font_family}
            onChange={(val) => setAttributes({ background_font_family: val })}
            help={__('e.g., "Georgia, serif"')}
          />
          <SelectControl
            label={__("Font Weight", "hero-landing-poem")}
            value={background_font_weight}
            options={[
              { label: "Default", value: "" },
              { label: "Normal", value: "normal" },
              { label: "Bold", value: "bold" },
              { label: "100", value: "100" },
              { label: "200", value: "200" },
              { label: "300", value: "300" },
              { label: "400", value: "400" },
              { label: "500", value: "500" },
              { label: "600", value: "600" },
              { label: "700", value: "700" },
              { label: "800", value: "800" },
              { label: "900", value: "900" },
            ]}
            onChange={(val) => setAttributes({ background_font_weight: val })}
          />
          <SelectControl
            label={__("Font Style", "hero-landing-poem")}
            value={background_font_style}
            options={[
              { label: "Normal", value: "normal" },
              { label: "Italic", value: "italic" },
            ]}
            onChange={(val) => setAttributes({ background_font_style: val })}
          />
          <RangeControl
            label={__("Line Height", "hero-landing-poem")}
            value={background_line_height}
            onChange={(val) => setAttributes({ background_line_height: val })}
            min={0.5}
            max={3}
            step={0.1}
          />
          <RangeControl
            label={__("Letter Spacing (px)", "hero-landing-poem")}
            value={background_letter_spacing}
            onChange={(val) => setAttributes({ background_letter_spacing: val })}
            min={-5}
            max={20}
            step={0.1}
          />
          <p>{__("Background Color", "hero-landing-poem")}</p>
          <ColorPalette value={background_color} onChange={(val) => setAttributes({ background_color: val })} />
          <RangeControl
            label={__("Opacity", "hero-landing-poem")}
            value={background_opacity}
            onChange={(val) => setAttributes({ background_opacity: val })}
            min={0}
            max={1}
            step={0.01}
          />
          <ToggleControl
            label={__("Animate Opacity", "hero-landing-poem")}
            checked={attributes.enable_opacity_animation}
            onChange={(isChecked) => setAttributes({ enable_opacity_animation: isChecked })}
            help={__("Animate the poem's opacity from 0 to the set value.", "hero-landing-poem")}
          />
          {attributes.enable_opacity_animation && (
            <RangeControl
              label={__("Opacity Animation Duration (ms)", "hero-landing-poem")}
              value={attributes.opacity_animation_duration}
              onChange={(val) => setAttributes({ opacity_animation_duration: val })}
              min={500}
              max={10000}
              step={100}
            />
          )}
          <RangeControl
            label={__("Typing Speed (ms)", "hero-landing-poem")}
            value={attributes.typing_speed}
            onChange={(val) => setAttributes({ typing_speed: val })}
            min={10}
            max={500}
            step={10}
          />
          <RangeControl
            label={__("Start Delay (ms)", "hero-landing-poem")}
            value={attributes.start_delay}
            onChange={(val) => setAttributes({ start_delay: val })}
            min={0}
            max={5000}
            step={100}
          />
          <SelectControl
            label={__("Text Starting Position", "hero-landing-poem")}
            value={attributes.text_align}
            options={[
              { label: "Top Left (Typewriter Style)", value: "top-left" },
              { label: "Top Center", value: "top-center" },
              { label: "Top Right", value: "top-right" },
              { label: "Center Left", value: "center-left" },
              { label: "Center", value: "center" },
              { label: "Center Right", value: "center-right" },
              { label: "Bottom Left", value: "bottom-left" },
              { label: "Bottom Center", value: "bottom-center" },
              { label: "Bottom Right", value: "bottom-right" },
            ]}
            onChange={(val) => {
              const positions = {
                "top-left": { vertical: "flex-start", horizontal: "flex-start", align: "left" },
                "top-center": { vertical: "flex-start", horizontal: "center", align: "center" },
                "top-right": { vertical: "flex-start", horizontal: "flex-end", align: "right" },
                "center-left": { vertical: "center", horizontal: "flex-start", align: "left" },
                center: { vertical: "center", horizontal: "center", align: "center" },
                "center-right": { vertical: "center", horizontal: "flex-end", align: "right" },
                "bottom-left": { vertical: "flex-end", horizontal: "flex-start", align: "left" },
                "bottom-center": { vertical: "flex-end", horizontal: "center", align: "center" },
                "bottom-right": { vertical: "flex-end", horizontal: "flex-end", align: "right" },
              };
              const position = positions[val];
              setAttributes({
                text_align: val,
                text_position_vertical: position.vertical,
                text_position_horizontal: position.horizontal,
              });
            }}
          />
        </PanelBody>
        <PanelBody title={__("Background Settings", "hero-landing-poem")}>
          <TextControl
            label={__("Background Image URL", "hero-landing-poem")}
            value={attributes.background_image_url}
            onChange={(val) => setAttributes({ background_image_url: val })}
            help={__("Enter a URL for the background image. Leave empty for no background image.")}
          />
          <p>{__("Container Background Color", "hero-landing-poem")}</p>
          <ColorPalette
            value={attributes.container_background_color}
            onChange={(val) => setAttributes({ container_background_color: val })}
          />
        </PanelBody>
        <PanelBody title={__("Animation Settings", "hero-landing-poem")}>
          <RangeControl
            label={__("Arrow Fade-In Delay (ms)", "hero-landing-poem")}
            value={attributes.arrow_fade_in_delay}
            onChange={(val) => setAttributes({ arrow_fade_in_delay: val })}
            min={0}
            max={15000}
            step={100}
            help={__("Time to wait before the scroll-down arrow fades in.", "hero-landing-poem")}
          />
          <TextControl
            label={__("Arrow Bottom Spacing", "hero-landing-poem")}
            value={attributes.arrow_bottom_spacing}
            onChange={(val) => setAttributes({ arrow_bottom_spacing: val })}
            help={__("CSS value for the space from the bottom (e.g., '3rem', '50px').", "hero-landing-poem")}
          />
        </PanelBody>
      </InspectorControls>
      <div {...blockProps}>
        <div className="hero-landing-poem-content-editor">
          <p className="editor-info-text">Hero Background Poem</p>
          <p className="editor-info-text">
            <i>(No inner content. A scroll-down arrow will be shown on the live site.)</i>
          </p>
        </div>
      </div>
    </>
  );
}
