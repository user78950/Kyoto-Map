/** 교토 히스토리아 Tailwind 설정
 *  디자인 토큰은 Stitch(DESIGN.md) 원본 그대로입니다.
 *  CSS 다시 만들기:  npx tailwindcss@3 -i ./src/input.css -o ./styles.css --minify
 */
module.exports = {
  content: ["./*.html", "./*.js"],
  darkMode: "class",
  theme: {
    "extend": {
      "colors": {
        "surface-variant": "#e4e1ea",
        "secondary": "#45664e",
        "on-error-container": "#93000a",
        "error-container": "#ffdad6",
        "surface-container-high": "#eae7ef",
        "primary-fixed-dim": "#ffb4a5",
        "surface-dim": "#dbd9e1",
        "secondary-fixed": "#c7ecce",
        "surface": "#fbf8ff",
        "inverse-surface": "#303036",
        "surface-bright": "#fbf8ff",
        "on-error": "#ffffff",
        "on-background": "#1b1b21",
        "on-surface": "#1b1b21",
        "outline": "#8f706a",
        "on-secondary": "#ffffff",
        "on-primary-fixed": "#3f0400",
        "secondary-fixed-dim": "#abcfb2",
        "on-primary": "#ffffff",
        "on-tertiary-fixed-variant": "#5d4201",
        "primary-container": "#c23018",
        "primary": "#9f1500",
        "error": "#ba1a1a",
        "on-secondary-fixed": "#01210f",
        "surface-container-low": "#f5f2fb",
        "inverse-primary": "#ffb4a5",
        "on-secondary-container": "#496a52",
        "on-tertiary": "#ffffff",
        "tertiary-container": "#826322",
        "on-secondary-fixed-variant": "#2e4e37",
        "secondary-container": "#c4e9cb",
        "surface-container-highest": "#e4e1ea",
        "tertiary-fixed": "#ffdea5",
        "on-primary-container": "#ffe0da",
        "tertiary": "#674b0a",
        "on-surface-variant": "#5a403b",
        "tertiary-fixed-dim": "#e9c176",
        "surface-container-lowest": "#ffffff",
        "outline-variant": "#e3beb7",
        "on-primary-fixed-variant": "#8f1100",
        "on-tertiary-fixed": "#261900",
        "background": "#fbf8ff",
        "primary-fixed": "#ffdad3",
        "on-tertiary-container": "#ffe4b6",
        "surface-tint": "#b5260f",
        "surface-container": "#efecf5",
        "inverse-on-surface": "#f2eff8"
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
