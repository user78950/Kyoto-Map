/** 교토 히스토리아 Tailwind 설정
 *  색상은 CSS 변수로 연결돼 있어 라이트/다크 모드가 자동으로 바뀝니다.
 *  실제 색 값(라이트·다크)은 src/input.css 에 있습니다. (라이트 값 = Stitch DESIGN.md 원본)
 *  CSS 다시 만들기:  npm run build:css
 */
module.exports = {
  content: ["./*.html", "./*.js"],
  darkMode: ["selector", '[data-theme="dark"]'],
  theme: {
    "extend": {
      "colors": {
        "surface-variant": "rgb(var(--c-surface-variant) / <alpha-value>)",
        "secondary": "rgb(var(--c-secondary) / <alpha-value>)",
        "on-error-container": "rgb(var(--c-on-error-container) / <alpha-value>)",
        "error-container": "rgb(var(--c-error-container) / <alpha-value>)",
        "surface-container-high": "rgb(var(--c-surface-container-high) / <alpha-value>)",
        "primary-fixed-dim": "rgb(var(--c-primary-fixed-dim) / <alpha-value>)",
        "surface-dim": "rgb(var(--c-surface-dim) / <alpha-value>)",
        "secondary-fixed": "rgb(var(--c-secondary-fixed) / <alpha-value>)",
        "surface": "rgb(var(--c-surface) / <alpha-value>)",
        "inverse-surface": "rgb(var(--c-inverse-surface) / <alpha-value>)",
        "surface-bright": "rgb(var(--c-surface-bright) / <alpha-value>)",
        "on-error": "rgb(var(--c-on-error) / <alpha-value>)",
        "on-background": "rgb(var(--c-on-background) / <alpha-value>)",
        "on-surface": "rgb(var(--c-on-surface) / <alpha-value>)",
        "outline": "rgb(var(--c-outline) / <alpha-value>)",
        "on-secondary": "rgb(var(--c-on-secondary) / <alpha-value>)",
        "on-primary-fixed": "rgb(var(--c-on-primary-fixed) / <alpha-value>)",
        "secondary-fixed-dim": "rgb(var(--c-secondary-fixed-dim) / <alpha-value>)",
        "on-primary": "rgb(var(--c-on-primary) / <alpha-value>)",
        "on-tertiary-fixed-variant": "rgb(var(--c-on-tertiary-fixed-variant) / <alpha-value>)",
        "primary-container": "rgb(var(--c-primary-container) / <alpha-value>)",
        "primary": "rgb(var(--c-primary) / <alpha-value>)",
        "error": "rgb(var(--c-error) / <alpha-value>)",
        "on-secondary-fixed": "rgb(var(--c-on-secondary-fixed) / <alpha-value>)",
        "surface-container-low": "rgb(var(--c-surface-container-low) / <alpha-value>)",
        "inverse-primary": "rgb(var(--c-inverse-primary) / <alpha-value>)",
        "on-secondary-container": "rgb(var(--c-on-secondary-container) / <alpha-value>)",
        "on-tertiary": "rgb(var(--c-on-tertiary) / <alpha-value>)",
        "tertiary-container": "rgb(var(--c-tertiary-container) / <alpha-value>)",
        "on-secondary-fixed-variant": "rgb(var(--c-on-secondary-fixed-variant) / <alpha-value>)",
        "secondary-container": "rgb(var(--c-secondary-container) / <alpha-value>)",
        "surface-container-highest": "rgb(var(--c-surface-container-highest) / <alpha-value>)",
        "tertiary-fixed": "rgb(var(--c-tertiary-fixed) / <alpha-value>)",
        "on-primary-container": "rgb(var(--c-on-primary-container) / <alpha-value>)",
        "tertiary": "rgb(var(--c-tertiary) / <alpha-value>)",
        "on-surface-variant": "rgb(var(--c-on-surface-variant) / <alpha-value>)",
        "tertiary-fixed-dim": "rgb(var(--c-tertiary-fixed-dim) / <alpha-value>)",
        "surface-container-lowest": "rgb(var(--c-surface-container-lowest) / <alpha-value>)",
        "outline-variant": "rgb(var(--c-outline-variant) / <alpha-value>)",
        "on-primary-fixed-variant": "rgb(var(--c-on-primary-fixed-variant) / <alpha-value>)",
        "on-tertiary-fixed": "rgb(var(--c-on-tertiary-fixed) / <alpha-value>)",
        "background": "rgb(var(--c-background) / <alpha-value>)",
        "primary-fixed": "rgb(var(--c-primary-fixed) / <alpha-value>)",
        "on-tertiary-container": "rgb(var(--c-on-tertiary-container) / <alpha-value>)",
        "surface-tint": "rgb(var(--c-surface-tint) / <alpha-value>)",
        "surface-container": "rgb(var(--c-surface-container) / <alpha-value>)",
        "inverse-on-surface": "rgb(var(--c-inverse-on-surface) / <alpha-value>)",
        "parchment": "rgb(var(--c-parchment) / <alpha-value>)",
        "river": "rgb(var(--c-river) / <alpha-value>)",
        "river-ink": "rgb(var(--c-river-ink) / <alpha-value>)",
        "frame": "rgb(var(--c-frame) / <alpha-value>)",
        "frame-line": "rgb(var(--c-frame-line) / <alpha-value>)",
        "ink": "rgb(var(--c-ink) / <alpha-value>)",
        "paper": "rgb(var(--c-paper) / <alpha-value>)"
      },
      "borderRadius": {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      "spacing": {
        "space-sm": "0.5rem",
        "space-md": "1rem",
        "gutter": "1rem",
        "margin-lg": "1.5rem",
        "margin": "1.25rem",
        "space-xl": "2.25rem",
        "space-lg": "1.5rem",
        "gutter-sm": "0.75rem",
        "space-xs": "0.25rem"
      },
      "fontFamily": {
        "headline-md": [
          "Noto Serif",
          "Noto Serif KR",
          "serif"
        ],
        "body-md": [
          "Plus Jakarta Sans",
          "sans-serif"
        ],
        "body-lg": [
          "Plus Jakarta Sans",
          "sans-serif"
        ],
        "headline-lg": [
          "Noto Serif",
          "Noto Serif KR",
          "serif"
        ],
        "display-lg": [
          "Noto Serif",
          "Noto Serif KR",
          "serif"
        ],
        "label-lg": [
          "Plus Jakarta Sans",
          "sans-serif"
        ],
        "display-lg-mobile": [
          "Noto Serif",
          "Noto Serif KR",
          "serif"
        ],
        "body-sm": [
          "Plus Jakarta Sans",
          "sans-serif"
        ],
        "label-md": [
          "Plus Jakarta Sans",
          "sans-serif"
        ],
        "label-sm": [
          "Plus Jakarta Sans",
          "sans-serif"
        ],
        "headline-sm": [
          "Noto Serif",
          "Noto Serif KR",
          "serif"
        ]
      },
      "fontSize": {
        "headline-md": [
          "22px",
          {
            "lineHeight": "30px",
            "fontWeight": "500"
          }
        ],
        "body-md": [
          "14px",
          {
            "lineHeight": "22px",
            "fontWeight": "400"
          }
        ],
        "body-lg": [
          "16px",
          {
            "lineHeight": "26px",
            "fontWeight": "400"
          }
        ],
        "headline-lg": [
          "26px",
          {
            "lineHeight": "34px",
            "letterSpacing": "-0.01em",
            "fontWeight": "600"
          }
        ],
        "display-lg": [
          "40px",
          {
            "lineHeight": "48px",
            "letterSpacing": "-0.02em",
            "fontWeight": "600"
          }
        ],
        "label-lg": [
          "14px",
          {
            "lineHeight": "20px",
            "letterSpacing": "0.02em",
            "fontWeight": "600"
          }
        ],
        "display-lg-mobile": [
          "30px",
          {
            "lineHeight": "38px",
            "letterSpacing": "-0.01em",
            "fontWeight": "600"
          }
        ],
        "body-sm": [
          "12px",
          {
            "lineHeight": "18px",
            "fontWeight": "400"
          }
        ],
        "label-md": [
          "12px",
          {
            "lineHeight": "16px",
            "letterSpacing": "0.04em",
            "fontWeight": "500"
          }
        ],
        "label-sm": [
          "11px",
          {
            "lineHeight": "14px",
            "letterSpacing": "0.06em",
            "fontWeight": "600"
          }
        ],
        "headline-sm": [
          "18px",
          {
            "lineHeight": "26px",
            "fontWeight": "500"
          }
        ]
      }
    }
  },
  plugins: [],
};
