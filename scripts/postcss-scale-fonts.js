/* 글자 크기·줄 간격(px)을 화면 설정의 배율(--kh-fs)에 맞춰 커지게 바꾸는 PostCSS 플러그인 */
module.exports = () => ({
  postcssPlugin: "kh-scale-fonts",
  Declaration(decl) {
    if ((decl.prop === "font-size" || decl.prop === "line-height") && /\dpx/.test(decl.value) && !decl.value.includes("--kh-fs")) {
      decl.value = decl.value.replace(/(\d*\.?\d+)px/g, "calc($1px * var(--kh-fs, 1))");
    }
  },
});
module.exports.postcss = true;
