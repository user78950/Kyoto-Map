/* 화면 설정: 글자 크기 · 라이트/다크 모드 (모든 화면 공용) */
(function(){
  var KEY='kh-settings';
  var SIZES=[[1,'보통'],[1.15,'크게'],[1.3,'더 크게'],[1.4,'아주 크게']];
  var THEMES=[['light','light_mode','라이트','밝은 화면'],['dark','dark_mode','다크','어두운 화면'],['system','contrast','자동','기기 설정 따름']];
  function load(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(e){return {}}}
  function save(s){try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}}
  var st=load();
  function apply(s){
    var r=document.documentElement;r.dataset.theme=s.theme||'system';r.style.setProperty('--kh-fs',String(s.fs||1));
    var dark=r.dataset.theme==='dark'||(r.dataset.theme==='system'&&window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches);
    var m=document.querySelector('meta[name="theme-color"]');if(!m){m=document.createElement('meta');m.name='theme-color';document.head.appendChild(m)}
    if(!document.body||!document.body.dataset.khSplash)m.content=dark?'#141317':'#fbf8ff';
    swapLogos(dark);
    document.dispatchEvent(new CustomEvent('kh-settings',{detail:s}));
    if(window.KH_relayout)try{window.KH_relayout()}catch(e){}
  }
  function swapLogos(dark){document.querySelectorAll('img[data-kh-logo]').forEach(function(i){var u=dark?i.dataset.dark:i.dataset.light;if(u&&i.getAttribute('src')!==u)i.setAttribute('src',u)})}
  var _dark=false;
  apply(st);
  document.addEventListener('DOMContentLoaded',function(){apply(st)});
  /* 다른 화면(탭·캔버스)에서 바꾼 설정도 바로 반영 */
  window.addEventListener('storage',function(e){if(e.key===KEY){st=load();apply(st);if(document.getElementById('kh-set-sheet'))render()}});
  if(window.matchMedia)try{matchMedia('(prefers-color-scheme: dark)').addEventListener('change',function(){apply(st)})}catch(e){}

  function ms(n,c){return '<span class="material-symbols-outlined '+(c||'')+'" aria-hidden="true">'+n+'</span>'}
  function body(){
    var fs=st.fs||1,th=st.theme||'system';
    return '<div class="flex items-center justify-between px-margin pt-1 pb-3"><h2 class="font-headline-md text-headline-md text-on-surface">화면 설정</h2>'+
      '<button type="button" id="kh-set-close" class="w-11 h-11 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant" aria-label="닫기">'+ms('close','text-[22px]')+'</button></div>'+
      '<div class="px-margin pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] flex flex-col gap-space-lg">'+
      '<section><h3 class="font-label-lg text-label-lg text-on-surface mb-1">글자 크기</h3><p class="font-body-sm text-body-sm text-on-surface-variant mb-3">글씨가 작게 느껴지면 크게 바꿔 보세요.</p>'+
        '<div class="grid grid-cols-4 gap-2" role="radiogroup" aria-label="글자 크기">'+SIZES.map(function(s,i){var on=Math.abs(fs-s[0])<.01;
          return '<button type="button" role="radio" aria-checked="'+on+'" data-fs="'+s[0]+'" class="flex flex-col items-center justify-center gap-1 min-h-[84px] rounded-xl border-2 '+(on?'border-primary bg-primary/10 text-primary':'border-outline-variant/60 bg-surface-container-lowest text-on-surface')+'">'+
          '<span class="font-headline-sm font-bold leading-none" style="font-size:'+(16+i*5)+'px">가</span><span class="font-label-sm text-[12px] font-semibold">'+s[1]+'</span></button>'}).join('')+'</div>'+
        '<div class="mt-3 p-space-md rounded-xl bg-surface-container-low"><p class="font-label-sm text-label-sm text-on-surface-variant mb-1">미리보기</p><p class="font-headline-sm text-headline-sm text-on-surface">기요미즈데라</p><p class="font-body-md text-body-md text-on-surface-variant">778년에 세워진 절로, 절벽 위 무대가 유명해요.</p></div>'+
      '</section>'+
      '<section><h3 class="font-label-lg text-label-lg text-on-surface mb-3">화면 모드</h3>'+
        '<div class="grid grid-cols-3 gap-2" role="radiogroup" aria-label="화면 모드">'+THEMES.map(function(t){var on=th===t[0];
          return '<button type="button" role="radio" aria-checked="'+on+'" data-theme-opt="'+t[0]+'" class="flex flex-col items-center justify-center gap-1 min-h-[92px] rounded-xl border-2 '+(on?'border-primary bg-primary/10 text-primary':'border-outline-variant/60 bg-surface-container-lowest text-on-surface')+'">'+
          ms(t[1],'text-[28px]')+'<span class="font-label-lg text-label-lg">'+t[2]+'</span><span class="font-label-sm text-[11px] text-on-surface-variant">'+t[3]+'</span></button>'}).join('')+'</div>'+
      '</section>'+
      '<div class="grid grid-cols-2 gap-2 pt-1">'+
        '<button type="button" id="kh-set-reset" class="min-h-[52px] rounded-full bg-surface-container text-on-surface-variant font-label-lg text-label-lg">기본값으로</button>'+
        '<button type="button" id="kh-set-done" class="min-h-[52px] rounded-full bg-primary text-on-primary font-label-lg text-label-lg shadow-md">완료</button>'+
      '</div></div>';
  }
  function render(){
    var sh=document.getElementById('kh-set-sheet');if(!sh)return;
    var y=sh.scrollTop;sh.innerHTML='<div class="pt-2.5 pb-1"><div class="w-10 h-1 rounded-full bg-surface-container-highest mx-auto"></div></div>'+body();sh.scrollTop=y;
    sh.querySelectorAll('[data-fs]').forEach(function(b){b.onclick=function(){st.fs=parseFloat(b.dataset.fs);save(st);apply(st);render()}});
    sh.querySelectorAll('[data-theme-opt]').forEach(function(b){b.onclick=function(){st.theme=b.dataset.themeOpt;save(st);apply(st);render()}});
    document.getElementById('kh-set-close').onclick=close;document.getElementById('kh-set-done').onclick=close;
    document.getElementById('kh-set-reset').onclick=function(){st={};save(st);apply(st);render()};
  }
  var lastFocus=null;
  function open(){
    if(document.getElementById('kh-set-root'))return;lastFocus=document.activeElement;
    var root=document.createElement('div');root.id='kh-set-root';
    root.innerHTML='<div id="kh-set-scrim" class="fixed inset-0 z-[80] bg-ink/50 flex items-end justify-center"><div id="kh-set-sheet" class="w-full max-w-[430px] max-h-[90vh] overflow-y-auto bg-surface text-on-surface rounded-t-2xl shadow-xl" role="dialog" aria-modal="true" aria-label="화면 설정"></div></div>';
    document.body.appendChild(root);document.body.style.overflow='hidden';render();
    root.querySelector('#kh-set-scrim').addEventListener('click',function(e){if(e.target.id==='kh-set-scrim')close()});
    document.addEventListener('keydown',onKey);var c=document.getElementById('kh-set-close');if(c)c.focus();
  }
  function onKey(e){if(e.key==='Escape')close()}
  function close(){var r=document.getElementById('kh-set-root');if(r)r.remove();document.body.style.overflow='';document.removeEventListener('keydown',onKey);if(lastFocus&&lastFocus.focus)lastFocus.focus()}
  window.KH_openSettings=open;

  /* 설정 버튼 달기 */
  function addButtons(){
    var BTN='kh-set-btn w-10 h-10 rounded-full flex items-center justify-center transition-colors';
    document.querySelectorAll('a[data-path="traveler-profile"]').forEach(function(a){
      if(a.parentElement.querySelector('.kh-set-btn'))return;
      var wrap=document.createElement('div');wrap.className='flex items-center gap-1';a.parentElement.insertBefore(wrap,a);
      var b=document.createElement('button');b.type='button';b.className=BTN+' text-on-surface-variant hover:bg-surface-container-high hover:text-primary';b.setAttribute('aria-label','화면 설정 (글자 크기, 다크 모드)');b.title='화면 설정';
      b.innerHTML='<span class="font-headline-sm text-[15px] font-bold leading-none" aria-hidden="true">가<span class="text-[11px]">가</span></span>';b.onclick=open;
      wrap.appendChild(b);wrap.appendChild(a);
    });
    var bell=document.getElementById('sound-toggle');
    if(bell&&!bell.parentElement.querySelector('.kh-set-btn')){
      var w=document.createElement('div');w.className='flex items-center gap-2';bell.parentElement.insertBefore(w,bell);
      var b2=document.createElement('button');b2.type='button';b2.className=BTN+' bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/15 text-white';b2.setAttribute('aria-label','화면 설정 (글자 크기, 다크 모드)');
      b2.innerHTML='<span class="font-headline-sm text-[15px] font-bold leading-none" aria-hidden="true">가<span class="text-[11px]">가</span></span>';b2.onclick=open;w.appendChild(b2);w.appendChild(bell);
    }
    document.querySelectorAll('[data-open-settings]').forEach(function(el){el.addEventListener('click',open)});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',addButtons);else addButtons();
})();
