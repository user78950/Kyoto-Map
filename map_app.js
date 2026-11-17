/* 지도 탐색: 검색 · 핀 터치 · 확대/이동 · 바텀시트 */
(function(){
  const S=window.KH_SITES, BY={}; S.forEach(s=>BY[s.id]=s);
  const IMG=window.KH_IMAGES||{};
  const $=q=>document.querySelector(q);
  const canvas=$('#map-canvas'), svg=$('#map-svg'), layer=$('#pin-layer');
  const esc=t=>String(t??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const ms=(n,c='',f=false)=>`<span class="material-symbols-outlined ${c}" ${f?`style="font-variation-settings: 'FILL' 1;"`:''}>${n}</span>`;

  /* ---------- 위치 계산: 원본 디자인의 핀 6개 위치에 맞춘 근사 변환 ---------- */
  const FIX={kinkaku:[26,14],nijo:[36,43],ginkaku:[79,21],yasaka:[74,50],kiyomizu:[81,68],fushimi:[59,86],gosho:[51,27],sento:[56,31],hokanji:[77,57],sannenzaka:[79,62],kodaiji:[78,54],shinbashi:[68,47],ryozen:[83,60],sanjusangendo:[65,73],honnoji:[61,44],heian:[76,38],nanzenji:[88,40],tetsugaku:[86,29],shimogamo:[63,16],kamigamo:[46,4],daitokuji:[40,9],kitano:[30,26],ryoanji:[16,18],toji:[38,74]};
  function base(s){if(FIX[s.id])return FIX[s.id];return [934.168*s.lng+22.006*s.lat-127541.308, -81.585*s.lng-1101.263*s.lat+49676.071]}
  const inFrame=s=>{const[x,y]=base(s);return !s.far&&x>=3&&x<=97&&y>=3&&y<=97};
  const km=(a,b)=>{const R=6371,r=Math.PI/180,dl=(b.lat-a.lat)*r,dn=(b.lng-a.lng)*r;const h=Math.sin(dl/2)**2+Math.cos(a.lat*r)*Math.cos(b.lat*r)*Math.sin(dn/2)**2;return 2*R*Math.asin(Math.sqrt(h))};
  const walk=d=>Math.max(1,Math.round(d*1.3/4.5*60));
  const hhmm=h=>{const H=Math.floor(h),M=Math.round((h-H)*60);return String(H).padStart(2,'0')+':'+String(M).padStart(2,'0')};
  const ERAS=[['아스카',538,710],['나라',710,794],['헤이안',794,1185],['가마쿠라',1185,1336],['무로마치',1336,1573],['아즈치·모모야마',1573,1603],['에도',1603,1868],['근현대',1868,2100]];
  const eraLabel=y=>{const e=ERAS.find(e=>y>=e[1]&&y<e[2])||ERAS[7];if(e[0]==='근현대')return '근현대';const p=(y-e[1])/(e[2]-e[1]);return `${e[0]} 시대 ${p<.34?'초기':p<.67?'중기':'말기'}`};
  const yText=s=>s.yearText||s.year+'년';

  /* ---------- 핀 스타일 (원본 마크업 클래스 그대로) ---------- */
  const PIN={temple:['bg-tertiary-fixed','text-on-tertiary-fixed','temple_buddhist',1,'text-tertiary-container'],shrine:['bg-primary-fixed','text-primary','door_front',0,'text-primary'],castle:['bg-surface-container-highest','text-on-surface','fort',0,'text-secondary'],alley:['bg-secondary-container','text-on-secondary-container','cottage',1,'text-secondary']};
  const PIN_OVR={ginkaku:['bg-surface-variant','text-on-surface-variant','spa',1,'text-on-surface-variant'],yasaka:['bg-primary-fixed','text-primary','festival',0,'text-primary'],fushimi:['bg-primary','text-on-primary','door_front',0,'text-primary']};
  const LABEL={kinkaku:'킨카쿠지 (금각사)',nijo:'니조 성 (二条城)',ginkaku:'긴카쿠지 (은각사)',fushimi:'후시미 이나리'};
  const TYPE_KO={temple:'사찰',shrine:'신사',castle:'성곽',alley:'골목'};
  const TYPE_WORDS={temple:'사찰 절 temple 寺',shrine:'신사 shrine 神社 도리이',castle:'성 성곽 궁궐 고쇼 리큐 castle 城 御所',alley:'골목 거리 길 alley'};

  /* ---------- 상태 ---------- */
  let store={saved:[]};try{store=Object.assign(store,JSON.parse(localStorage.getItem('kh-linked')||'{}'))}catch(e){}
  const save=()=>{try{localStorage.setItem('kh-linked',JSON.stringify(store))}catch(e){}};
  const st={sel:'kiyomizu',cat:'all',s:1,tx:0,ty:0};
  const q0=new URLSearchParams(location.search).get('site');if(q0&&BY[q0])st.sel=q0;

  /* ---------- 토스트 ---------- */
  let tt;function toast(m){const t=$('#toast-msg');$('#toast-text').textContent=m;t.classList.remove('opacity-0','pointer-events-none');t.classList.add('opacity-100');clearTimeout(tt);tt=setTimeout(()=>{t.classList.remove('opacity-100');t.classList.add('opacity-0','pointer-events-none')},2400)}

  /* ---------- 핀 그리기 ---------- */
  function visible(s){return st.cat==='all'||s.type===st.cat}
  function pinHTML(s){
    const sel=s.id===st.sel,[bg,ic,icon,fill,tagc]=PIN_OVR[s.id]||PIN[s.type];const name=LABEL[s.id]||s.ko;
    if(!inFrame(s))return `<div class="kh-pin absolute left-0 top-0 w-0 h-0 pointer-events-none ${sel?'z-30':'z-20'} cursor-pointer" data-pin="${s.id}" role="button" tabindex="0" aria-label="${esc(s.ko)} (지도 밖)">
      <div class="relative flex flex-col items-center w-max pointer-events-auto" style="transform:translate(-50%,-50%)">
        <div class="relative w-7 h-7 rounded-full ${sel?'bg-primary-container text-on-primary-container ring-4 ring-surface':bg+' '+ic} flex items-center justify-center shadow-md border border-dashed border-outline">${ms(icon,'text-[15px]',!!fill)}<span class="kh-arrow absolute w-4 h-4 rounded-full bg-surface-container-lowest shadow-sm flex items-center justify-center">${ms('arrow_upward','text-[11px] text-primary')}</span></div>
        <span class="kh-name ${sel?'':'hidden'} mt-1 font-label-sm text-[10px] font-semibold ${sel?'text-primary bg-surface/95':'text-on-surface bg-surface/85'} px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap">${esc(s.ko)}${s.far?' ↗':''}</span>
      </div></div>`;
    if(sel)return `<div class="kh-pin absolute left-0 top-0 w-0 h-0 pointer-events-none z-30 cursor-pointer" data-pin="${s.id}" role="button" tabindex="0" aria-label="${esc(s.ko)}">
      <div class="relative flex flex-col items-center w-max pointer-events-auto" style="transform:translate(-50%,-62%)">
        <span class="absolute top-5 w-11 h-11 bg-primary/20 rounded-full animate-ping pointer-events-none"></span>
        <div class="px-2.5 py-0.5 mb-1.5 bg-primary text-on-primary rounded-full shadow-md flex items-center gap-1">${ms(s.unesco?'verified':'location_on','text-[12px]')}<span class="font-label-sm text-[10px] font-semibold tracking-tight whitespace-nowrap">${s.unesco?'유네스코 세계유산':esc(s.tag)}</span></div>
        <div class="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center shadow-xl ring-4 ring-surface transform scale-110">${ms(icon,'text-[22px]',true)}</div>
        <span class="mt-1 font-label-md text-label-md font-bold text-primary bg-surface/95 px-2 py-0.5 rounded shadow-sm whitespace-nowrap">${esc(name)}</span>
      </div></div>`;
    return `<div class="kh-pin absolute left-0 top-0 w-0 h-0 pointer-events-none z-10 cursor-pointer group" data-pin="${s.id}" role="button" tabindex="0" aria-label="${esc(s.ko)}">
      <div class="relative flex flex-col items-center w-max pointer-events-auto" style="transform:translate(-50%,-50%)">
        <div class="kh-badge px-2 py-0.5 mb-1 bg-surface-container-lowest/95 backdrop-blur-sm rounded-md shadow-sm"><span class="font-label-sm text-[10px] ${tagc} font-semibold tracking-tight whitespace-nowrap">${esc(s.tag)}</span></div>
        <div class="w-8 h-8 rounded-full ${bg} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">${ms(icon,'text-[18px] '+ic,!!fill)}</div>
        <span class="kh-name mt-1 font-label-md text-label-md font-semibold text-on-surface bg-surface/80 px-1.5 py-0.5 rounded backdrop-blur-xs whitespace-nowrap shadow-xs">${esc(name)}</span>
      </div></div>`;
  }
  function drawPins(){
    layer.innerHTML=S.map(pinHTML).join('');
    layer.querySelectorAll('[data-pin]').forEach(p=>p.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select(p.dataset.pin,true)}}));
    layout();
  }
  function layout(){
    const W=canvas.clientWidth,H=canvas.clientHeight;
    svg.style.transform=`translate(${st.tx}px,${st.ty}px) scale(${st.s})`;
    const boxes=[],edges=[];
    const items=[...layer.querySelectorAll('[data-pin]')].map(el=>({el,s:BY[el.dataset.pin]}));
    items.sort((a,b)=>(b.s.id===st.sel)-(a.s.id===st.sel)||(b.s.pop||1)-(a.s.pop||1));
    items.forEach(({el,s})=>{
      const show=visible(s)||s.id===st.sel;el.style.opacity=show?'1':'.18';el.firstElementChild.style.pointerEvents=show?'auto':'none';
      const[bx,by]=base(s);let px=bx/100*W*st.s+st.tx,py=by/100*H*st.s+st.ty;
      if(!inFrame(s)){edges.push({el,s,px,py});return}
      const off=px<-30||px>W+30||py<-30||py>H+30;el.style.display=off?'none':'';
      el.style.transform=`translate(${px}px,${py}px)`;
      if(s.id===st.sel){boxes.push({x:px-60,y:py-60,w:120,h:100});return}
      const badge=el.querySelector('.kh-badge'),name=el.querySelector('.kh-name');
      if(badge)badge.style.visibility=st.s>=1.7?'visible':'hidden';
      const w=(name?name.textContent.length:4)*12+12,r={x:px-w/2,y:py+14,w,h:20};
      const pinBox={x:px-16,y:py-16,w:32,h:32};
      const hit=boxes.some(b=>r.x<b.x+b.w&&r.x+r.w>b.x&&r.y<b.y+b.h&&r.y+r.h>b.y);
      if(name)name.style.visibility=hit?'hidden':'visible';if(!hit)boxes.push(r);boxes.push(pinBox);
    });
    /* 지도 밖 명소: 가장자리 표시 + 겹치지 않게 벌리기 */
    const pad=24,cx=W/2,cy=H/2,P=2*(W+H-4*pad);
    const toT=(x,y)=>{const L=pad,R=W-pad,T=pad,B=H-pad;if(y<=T+.01)return x-L;if(x>=R-.01)return (R-L)+(y-T);if(y>=B-.01)return (R-L)+(B-T)+(R-x);return 2*(R-L)+(B-T)+(B-y)};
    const fromT=t=>{const L=pad,R=W-pad,T=pad,B=H-pad,w=R-L,h=B-T;t=((t%P)+P)%P;if(t<w)return[L+t,T];t-=w;if(t<h)return[R,T+t];t-=h;if(t<w)return[R-t,B];t-=w;return[L,B-t]};
    edges.forEach(e=>{const dx=e.px-cx,dy=e.py-cy;const k=Math.min(Math.abs((W/2-pad)/(dx||1e-6)),Math.abs((H/2-pad)/(dy||1e-6)));e.ang=Math.atan2(dy,dx);e.t=toT(cx+dx*k,cy+dy*k)});
    edges.sort((a,b)=>a.t-b.t);
    for(let pass=0;pass<4;pass++)for(let i=1;i<edges.length;i++)if(edges[i].t-edges[i-1].t<30)edges[i].t=edges[i-1].t+30;
    edges.forEach(e=>{const[x,y]=fromT(e.t);e.el.style.display='';e.el.style.transform=`translate(${x}px,${y}px)`;
      const a=e.el.querySelector('.kh-arrow');if(a){const ux=Math.cos(e.ang),uy=Math.sin(e.ang);a.style.left=`calc(50% + ${ux*14}px - 8px)`;a.style.top=`calc(50% + ${uy*14}px - 8px)`;a.style.transform=`rotate(${e.ang*180/Math.PI+90}deg)`}});
  }

  /* ---------- 확대 · 이동 ---------- */
  function clamp(){const W=canvas.clientWidth,H=canvas.clientHeight;st.s=Math.min(3,Math.max(1,st.s));st.tx=Math.min(0,Math.max(W-W*st.s,st.tx));st.ty=Math.min(0,Math.max(H-H*st.s,st.ty))}
  function zoomAt(f,px,py){const W=canvas.clientWidth,H=canvas.clientHeight;px=px??W/2;py=py??H/2;const ns=Math.min(3,Math.max(1,st.s*f)),k=ns/st.s;st.tx=px-(px-st.tx)*k;st.ty=py-(py-st.ty)*k;st.s=ns;clamp();layout()}
  function centerOn(s){if(!inFrame(s)){st.s=1;st.tx=0;st.ty=0;return}const W=canvas.clientWidth,H=canvas.clientHeight;st.s=Math.max(st.s,1.8);const[bx,by]=base(s);st.tx=W/2-bx/100*W*st.s;st.ty=H*0.55-by/100*H*st.s;clamp()}
  const pts=new Map();let start=null,moved=0,pinch=null;
  canvas.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;canvas.setPointerCapture(e.pointerId);pts.set(e.pointerId,{x:e.clientX,y:e.clientY});moved=0;
    if(pts.size===1)start={x:e.clientX,y:e.clientY,tx:st.tx,ty:st.ty,t:e.target};if(pts.size===2){const[a,b]=[...pts.values()];pinch={d:Math.hypot(a.x-b.x,a.y-b.y),s:st.s}}});
  canvas.addEventListener('pointermove',e=>{if(!pts.has(e.pointerId))return;pts.set(e.pointerId,{x:e.clientX,y:e.clientY});const r=canvas.getBoundingClientRect();
    if(pts.size===2&&pinch){const[a,b]=[...pts.values()];const d=Math.hypot(a.x-b.x,a.y-b.y);zoomAt(pinch.s*d/pinch.d/st.s,(a.x+b.x)/2-r.left,(a.y+b.y)/2-r.top);moved=99;return}
    if(start){const dx=e.clientX-start.x,dy=e.clientY-start.y;moved=Math.max(moved,Math.hypot(dx,dy));if(moved>5&&st.s>1){st.tx=start.tx+dx;st.ty=start.ty+dy;clamp();layout()}}});
  const end=e=>{if(!pts.has(e.pointerId))return;pts.delete(e.pointerId);if(!pts.size){if(start&&moved<8){const p=start.t.closest&&start.t.closest('[data-pin]');if(p)select(p.dataset.pin,false)}start=null;pinch=null}else if(pts.size===1){const[p]=[...pts.values()];start={x:p.x,y:p.y,tx:st.tx,ty:st.ty,t:canvas};pinch=null}};
  canvas.addEventListener('pointerup',end);canvas.addEventListener('pointercancel',end);
  canvas.addEventListener('wheel',e=>{e.preventDefault();const r=canvas.getBoundingClientRect();zoomAt(Math.exp(-e.deltaY*.0015),e.clientX-r.left,e.clientY-r.top)},{passive:false});
  canvas.addEventListener('dblclick',e=>{const r=canvas.getBoundingClientRect();zoomAt(1.6,e.clientX-r.left,e.clientY-r.top)});
  $('#zoom-in').addEventListener('click',()=>zoomAt(1.4));
  $('#zoom-out').addEventListener('click',()=>zoomAt(1/1.4));
  window.addEventListener('resize',()=>{clamp();layout()});
  /* Tailwind가 스타일을 늦게 입혀도 지도 크기가 정해지면 다시 배치 */
  if(window.ResizeObserver){let lw=0,lh=0;new ResizeObserver(()=>{const w=canvas.clientWidth,h=canvas.clientHeight;if(w!==lw||h!==lh){lw=w;lh=h;const s=BY[st.sel];if(new URLSearchParams(location.search).get('site'))centerOn(s);clamp();layout()}}).observe(canvas)}

  /* ---------- 썸네일 (사진이 없는 곳은 일러스트) ---------- */
  const TH={temple:['#826322','#5d4201'],shrine:['#c23018','#8f1100'],castle:['#3a3940','#1b1b21'],alley:['#45664e','#2e4e37']};
  const SIL={temple:'<path d="M12 1l1 3h-2zM4 8.5Q12 4 20 8.5V10H4zM6.5 10h11v3h-11zM3 14.5Q12 10 21 14.5V16H3zM5.5 16h13v4h-13zM2 21h20v2H2z"/>',shrine:'<path d="M1 4.5Q12 2 23 4.5V6.5Q12 4.5 1 6.5zM3.5 9h17v1.8h-17zM6 6h2v17H6zM16 6h2v17h-2zM11 5h2v4h-2z"/>',castle:'<path d="M2 23l2.5-7h15L22 23zM7 16v-4h10v4zM5 12.5Q12 8.5 19 12.5v1H5zM9 9.5V7h6v2.5zM7.5 7.5Q12 3.5 16.5 7.5v.8h-9zM11.4 2h1.2v2.2h-1.2z"/>',alley:'<path d="M2 12l6-5 6 5v11H2zM12 12l5-4 5 4v11h-10zM4 15h3v3H4zM9 15h3v3H9zM15 15h2.5v3H15zM18.5 15H21v3h-2.5z"/>'};
  function thumb(s,big=false){
    if(IMG[s.id])return `<img class="w-full h-full object-cover" alt="" src="${IMG[s.id]}"/>`;
    const[a,b]=TH[s.type];const ch=[...s.ja].slice(0,big?4:3);
    return `<div class="relative w-full h-full overflow-hidden" style="background:linear-gradient(150deg,${a},${b})"><svg class="absolute -right-2 -bottom-1 w-[70%] h-[70%]" style="color:rgba(255,255,255,.12)" viewBox="0 0 24 24" fill="currentColor">${SIL[s.type]}</svg><div class="absolute inset-0 flex items-center justify-center"><span class="flex flex-col items-center font-headline-md font-bold" style="color:rgba(255,255,255,.92);font-size:${big?40:15}px;line-height:1.05">${ch.map(c=>`<span>${c}</span>`).join('')}</span></div></div>`;
  }

  /* ---------- 바텀시트 ---------- */
  const DEITY={temple:'모시는 본존',shrine:'모시는 제신',castle:'축조·거주',alley:'성격'};
  const BADGE={temple:'bg-tertiary text-on-tertiary',shrine:'bg-primary text-on-primary',castle:'bg-inverse-surface text-inverse-on-surface',alley:'bg-secondary text-on-secondary'};
  function cell(l,v,sub,c='text-on-surface'){return `<div class="bg-surface-container-low p-2 rounded-xl flex flex-col items-center text-center min-w-0"><span class="font-label-sm text-[10px] text-on-surface-variant tracking-wider">${l}</span><span class="font-label-md text-label-md font-semibold ${c} mt-0.5 truncate w-full">${v}</span><span class="text-[10px] text-on-surface-variant/80 truncate w-full">${sub||'&nbsp;'}</span></div>`}
  function renderSheet(){
    const s=BY[st.sel],sv=store.saved.includes(s.id);
    $('#detail-preview-panel').innerHTML=`<div class="bg-surface-container-lowest rounded-2xl shadow-xl p-space-md flex flex-col transition-all duration-300">
      <div class="flex items-start gap-space-md">
        <div class="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 shadow-sm">${thumb(s)}<div class="absolute top-1 left-1 ${BADGE[s.type]} px-1.5 py-0.5 rounded-sm font-label-sm text-[9px] font-semibold">${TYPE_KO[s.type]}</div></div>
        <div class="flex-1 min-w-0 flex flex-col justify-between min-h-24 py-0.5 gap-1">
          <div>
            <div class="flex items-center justify-between"><span class="font-label-sm text-label-sm text-tertiary-container font-semibold tracking-wide truncate">${esc(s.district)}${s.far?'':' 지구'}</span>
              <button id="sheet-save" class="text-on-surface-variant hover:text-primary transition-colors" title="즐겨찾기" aria-label="즐겨찾기">${ms(sv?'bookmark':'bookmark_border','text-[20px]'+(sv?' text-primary':''),sv)}</button></div>
            <h2 class="font-headline-sm text-headline-sm text-on-surface font-semibold tracking-tight truncate mt-0.5">${esc(s.ko)}</h2>
            <p class="font-body-sm text-body-sm text-on-surface-variant truncate">${esc(s.full)} <span class="text-[11px] opacity-75 font-serif ml-1">${esc(s.jaFull)}</span></p>
          </div>
          ${s.far?`<div class="flex items-center gap-1.5 bg-tertiary-fixed/60 text-on-tertiary-fixed px-2 py-0.5 rounded-full w-fit">${ms('train','text-[13px]')}<span class="font-label-sm text-[11px] font-medium">${esc(s.far)}</span></div>`
          :`<div class="flex items-center gap-1.5 bg-secondary-container/40 text-on-secondary-container px-2 py-0.5 rounded-full w-fit"><span class="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span><span class="font-label-sm text-[11px] font-medium">추천 관람: ${hhmm(s.quiet[0])} ~ ${hhmm(s.quiet[1])} (한적함)</span></div>`}
        </div>
      </div>
      <div class="grid grid-cols-3 gap-2 my-space-md pt-space-xs">
        ${cell('창건 시기',esc(yText(s).replace(' (전승)','*')),eraLabel(s.year))}
        ${cell('문화유산',esc(s.heritage[0]),esc(s.heritage[1]),(s.unesco||/국보/.test(s.heritage[0]))?'text-primary':'text-on-surface')}
        ${cell(DEITY[s.type],esc(s.deity[0]),esc(s.deity[1]))}
      </div>
      <div class="grid grid-cols-3 gap-2 -mt-2 mb-space-md">
        ${cell('입장료',esc(s.feeText),s.fee?'성인 기준':'',s.fee===0?'text-secondary':'text-on-surface')}
        ${cell('개방 시간',esc(s.hours.split('–')[0]),s.hours.includes('–')?'~ '+s.hours.split('–')[1]:'')}
        ${cell('권장 체류',esc(s.stayText),'')}
      </div>
      <p class="font-body-md text-body-md text-on-surface-variant leading-relaxed mb-space-md">${esc(s.summary)}</p>
      <div class="flex items-center gap-space-sm pt-space-xs">
        <a class="flex-1 py-3 px-space-md rounded-xl bg-surface-container text-on-surface hover:bg-surface-container-high active:scale-98 transition-all flex items-center justify-center gap-1.5 font-label-lg text-label-lg font-semibold text-center" data-path="walking-routes" href="routes.html">${ms('add_location_alt','text-[18px]')}<span>루트에 추가</span></a>
        ${s.id==='kiyomizu'?`<a class="flex-[1.4] py-3 px-space-md rounded-xl bg-primary-container text-on-primary hover:bg-primary active:scale-98 transition-all shadow-md flex items-center justify-center gap-1.5 font-label-lg text-label-lg font-semibold text-center" data-path="heritage-detail" href="detail.html">${ms('headphones','text-[18px]')}<span>역사 해설 보기</span></a>`
        :`<button id="open-story" type="button" class="flex-[1.4] py-3 px-space-md rounded-xl bg-primary-container text-on-primary hover:bg-primary active:scale-98 transition-all shadow-md flex items-center justify-center gap-1.5 font-label-lg text-label-lg font-semibold text-center">${ms('auto_stories','text-[18px]')}<span>역사 해설 보기</span></button>`}
      </div></div>`;
    $('#sheet-save').onclick=()=>{const i=store.saved.indexOf(s.id);if(i>=0){store.saved.splice(i,1);toast('즐겨찾기를 해제했습니다.')}else{store.saved.push(s.id);toast(`‘${s.ko}’을(를) 즐겨찾기에 담았습니다.`)}save();renderSheet()};
    const os=$('#open-story');if(os)os.onclick=()=>openStory(s);
    if(window.KH_bindLinks)window.KH_bindLinks($('#detail-preview-panel'));
  }
  function renderNearby(){
    const s=BY[st.sel];const near=S.filter(o=>o.id!==s.id&&!o.far).map(o=>({o,d:km(s,o)})).sort((a,b)=>a.d-b.d).slice(0,4);
    $('#nearby-list').innerHTML=near.map(({o,d})=>`<button type="button" data-near="${o.id}" class="w-44 flex-shrink-0 bg-surface-container-lowest p-space-sm rounded-xl shadow-xs text-left">
      <div class="relative w-full h-24 rounded-lg overflow-hidden mb-2">${thumb(o)}<span class="absolute bottom-1 right-1 bg-surface-dim/80 backdrop-blur-xs text-on-surface font-label-sm text-[10px] px-1.5 py-0.5 rounded">${d<=2.4?'도보 '+walk(d)+'분':d.toFixed(1)+'km'}</span></div>
      <p class="font-label-md text-label-md font-semibold text-on-surface truncate">${esc(o.ko)} <span class="font-normal opacity-70">(${esc(o.ja)})</span></p>
      <p class="font-body-sm text-[11px] text-on-surface-variant truncate">${esc(o.tag)}</p></button>`).join('');
    $('#nearby-list').querySelectorAll('[data-near]').forEach(b=>b.onclick=()=>{select(b.dataset.near,true);scrollToMap()});
  }
  function scrollToMap(){const y=canvas.getBoundingClientRect().top+window.scrollY-140;window.scrollTo({top:Math.max(0,y),behavior:'smooth'})}
  function select(id,center){
    if(!BY[id])return;st.sel=id;const s=BY[id];
    if(!visible(s)){st.cat='all';syncChips()}
    if(center)centerOn(s);
    drawPins();renderSheet();renderNearby();
    try{history.replaceState(null,'','?site='+id)}catch(e){}
  }

  /* ---------- 역사 해설 시트 (기요미즈데라 외) ---------- */
  function openStory(s){
    const tag={p:'bg-primary/10 text-primary',s:'bg-secondary-container text-on-secondary-container',t:'bg-tertiary-fixed text-on-tertiary-fixed'};
    const dot=['bg-primary','bg-secondary','bg-tertiary'],txt=['text-primary','text-secondary','text-tertiary'];
    const root=$('#kh-modal');
    root.innerHTML=`<div id="kh-scrim" class="fixed inset-0 z-[60] bg-on-background/40 flex items-end justify-center">
      <div class="kh-sheet w-full max-w-[430px] max-h-[88vh] overflow-y-auto bg-surface rounded-t-2xl shadow-xl pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))]" role="dialog" aria-modal="true" aria-label="${esc(s.ko)} 역사 해설">
        <div class="relative h-48 overflow-hidden rounded-t-2xl">${thumb(s,true)}<div class="absolute inset-0 bg-gradient-to-t from-on-background/90 via-on-background/30 to-transparent"></div>
          <button id="kh-close" class="absolute top-3 right-3 w-9 h-9 rounded-full bg-surface/80 backdrop-blur-md text-on-surface flex items-center justify-center" aria-label="닫기">${ms('close','text-[20px]')}</button>
          <div class="absolute bottom-3 left-margin right-margin text-white"><div class="flex flex-wrap gap-1.5 mb-1">${s.unesco?`<span class="inline-flex items-center gap-1 bg-primary-container text-white px-2.5 py-0.5 rounded-full font-label-sm text-label-sm">${ms('stars','text-[13px]',true)} 유네스코 세계유산</span>`:''}${s.nt?`<span class="bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full font-label-sm text-label-sm">${esc(s.nt)}</span>`:''}<span class="bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full font-label-sm text-label-sm">${esc(yText(s))}</span></div>
            <h2 class="font-display-lg-mobile text-[26px] leading-tight font-semibold">${esc(s.ko)} <span class="font-headline-sm text-headline-sm font-normal text-white/80">${esc(s.ja)}</span></h2></div>
        </div>
        <div class="px-margin pt-space-md flex flex-col gap-space-lg">
          <p class="font-body-md text-body-md text-on-surface-variant leading-relaxed">${esc(s.summary)}</p>
          <div class="grid grid-cols-2 gap-2">
            ${[['schedule','개방 시간',s.hours],['payments','입장료',s.feeText],['timer','권장 체류',s.stayText],[s.far?'train':'wb_twilight',s.far?'교토에서':'한적한 시간',s.far||`${hhmm(s.quiet[0])} ~ ${hhmm(s.quiet[1])}`]].map(([i,l,v])=>`<div class="bg-surface-container-low p-space-sm rounded-xl"><span class="flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant">${ms(i,'text-[15px] text-secondary')}${l}</span><p class="font-label-lg text-label-lg text-on-surface mt-1">${esc(v)}</p></div>`).join('')}
          </div>
          <div class="bg-surface-container-low p-2.5 rounded-lg flex items-start gap-2">${ms('info','text-on-surface-variant text-[18px]')}<p class="font-body-sm text-body-sm text-on-surface-variant">${esc(s.hoursNote)}. 요금과 시간은 참고값이니 방문 전 공식 안내를 확인해 주세요.</p></div>
          <section class="flex flex-col gap-space-md">
            <div class="flex items-center gap-2"><span class="w-1 h-5 rounded-full bg-primary"></span><h3 class="font-headline-md text-headline-md text-on-surface">천년의 연표 (歴史年表)</h3></div>
            <div class="relative pl-6 flex flex-col gap-space-md"><div class="absolute left-2 top-3 bottom-3 w-0.5 bg-surface-container-high"></div>
              ${s.events.map(([y,t,d],i)=>`<div class="relative flex flex-col gap-1"><div class="absolute -left-6 top-1 w-4 h-4 rounded-full ${dot[i%3]} flex items-center justify-center ring-4 ring-surface shadow-sm"><span class="w-1.5 h-1.5 bg-surface rounded-full"></span></div>
                <div class="flex items-baseline gap-2"><span class="font-headline-sm text-headline-sm ${txt[i%3]} font-semibold">${y===550?'6세기':y+'년'}</span><span class="font-label-sm text-label-sm text-on-surface-variant">${eraLabel(y)}</span></div>
                <div class="bg-surface-container-lowest p-space-md rounded-xl shadow-sm"><h4 class="font-headline-sm text-headline-sm text-on-surface">${esc(t)}</h4><p class="font-body-md text-body-md text-on-surface-variant mt-1">${esc(d)}</p></div></div>`).join('')}
            </div>
          </section>
          <section class="flex flex-col gap-space-md">
            <div class="flex items-center gap-2"><span class="w-1 h-5 rounded-full bg-primary-container"></span><h3 class="font-headline-md text-headline-md text-on-surface">알고 보면 더 흥미로운 이야기</h3></div>
            ${s.cards.map(([k,tg,ic,ti,ja,body,ex])=>`<article class="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col gap-space-sm"><div class="flex items-start justify-between"><span class="px-2.5 py-0.5 rounded-full ${tag[k]} font-label-sm text-label-sm font-semibold">${esc(tg)}</span>${ms(ic,'text-[20px] text-on-surface-variant')}</div>
              <div><h4 class="font-headline-sm text-headline-sm text-on-surface">${esc(ti)}<br><span class="font-body-sm text-body-sm text-on-surface-variant font-normal">${esc(ja)}</span></h4><p class="font-body-md text-body-md text-on-surface-variant mt-2 leading-relaxed">${esc(body)}</p></div>
              ${ex&&ex.tip?`<div class="flex items-center gap-3 bg-surface-container-low p-2.5 rounded-lg">${ms('tips_and_updates','text-secondary text-[20px]')}<p class="font-body-sm text-body-sm text-on-surface">추천 팁: ${esc(ex.tip)}</p></div>`:''}
              ${ex&&ex.info?`<div class="bg-surface-container-low p-2.5 rounded-lg flex items-center gap-2">${ms('info','text-on-surface-variant text-[18px]')}<p class="font-body-sm text-body-sm text-on-surface-variant">${esc(ex.info)}</p></div>`:''}
            </article>`).join('')}
          </section>
          <div class="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex items-start gap-3">${ms('directions_transit','text-primary text-[22px]')}<div><p class="font-label-md text-label-md text-on-surface-variant">찾아가는 법</p><p class="font-body-md text-body-md text-on-surface mt-0.5">${esc(s.access)}</p></div></div>
          <div class="grid grid-cols-2 gap-2">
            <a href="routes.html" data-path="walking-routes" class="py-3 rounded-xl bg-surface-container text-on-surface flex items-center justify-center gap-1.5 font-label-lg text-label-lg">${ms('footprint','text-[18px] text-primary')}역사 코스 보기</a>
            <a href="notebook.html" data-path="notebook-and-stamps" class="py-3 rounded-xl bg-tertiary/10 text-tertiary flex items-center justify-center gap-1.5 font-label-lg text-label-lg">${ms('approval','text-[18px]')}탐방 수첩</a>
          </div>
        </div>
      </div></div>`;
    document.body.style.overflow='hidden';
    const close=()=>{root.innerHTML='';document.body.style.overflow=''};
    $('#kh-close').onclick=close;$('#kh-scrim').onclick=e=>{if(e.target.id==='kh-scrim')close()};
    document.addEventListener('keydown',function k(e){if(e.key==='Escape'){close();document.removeEventListener('keydown',k)}});
    if(window.KH_bindLinks)window.KH_bindLinks(root);
    $('#kh-close').focus();
  }

  /* ---------- 검색 ---------- */
  const input=$('#search-input'),box=$('#search-results');
  const norm=t=>String(t||'').toLowerCase().replace(/[\s·()（）\-]/g,'');
  function search(q){
    const n=norm(q);if(!n)return [];
    return S.map(s=>{const names=norm(s.ko+s.full),jp=norm(s.ja+s.jaFull),other=norm(s.district+s.tag+s.deity.join(''));const typ=norm(TYPE_WORDS[s.type]);
      let sc=0;if(names.startsWith(n))sc=100;else if(names.includes(n))sc=80;else if(jp.includes(n))sc=70;else if(typ.includes(n))sc=50;else if(other.includes(n))sc=30;
      return {s,sc}}).filter(x=>x.sc).sort((a,b)=>b.sc-a.sc||(a.s.far?1:0)-(b.s.far?1:0)||(inFrame(b.s)?1:0)-(inFrame(a.s)?1:0)||(b.s.pop||1)-(a.s.pop||1)||a.s.year-b.s.year).map(x=>x.s);
  }
  function renderResults(){
    const q=input.value.trim();if(!q){box.classList.add('hidden');box.innerHTML='';return}
    const r=search(q);const [bg,ic]=['',''];
    box.innerHTML=r.length?`<p class="px-3 pt-2 pb-1 font-label-sm text-label-sm text-on-surface-variant">검색 결과 ${r.length}곳</p>`+r.slice(0,8).map(s=>{const p=PIN_OVR[s.id]||PIN[s.type];return `<button type="button" data-hit="${s.id}" class="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-surface-container-low active:bg-surface-container">
      <span class="w-8 h-8 rounded-full ${p[0]} flex items-center justify-center shrink-0">${ms(p[2],'text-[17px] '+p[1],!!p[3])}</span>
      <span class="min-w-0 flex-1"><span class="block font-label-lg text-label-lg text-on-surface truncate">${esc(s.ko)} <span class="font-normal text-on-surface-variant text-[12px]">${esc(s.ja)}</span></span><span class="block font-body-sm text-[11px] text-on-surface-variant truncate">${TYPE_KO[s.type]} · ${esc(s.district)}${s.far?' · 근교':''}</span></span>
      ${ms('north_west','text-[16px] text-outline')}</button>`}).join('')
      :`<div class="px-3 py-4 text-center font-body-sm text-body-sm text-on-surface-variant">‘${esc(q)}’에 맞는 명소가 없어요.<br>예: 니조, 성, 금각사, 二条城</div>`;
    box.classList.remove('hidden');
    box.querySelectorAll('[data-hit]').forEach(b=>b.addEventListener('click',()=>pick(b.dataset.hit)));
  }
  function pick(id){input.value=BY[id].ko;box.classList.add('hidden');input.blur();select(id,true);scrollToMap()}
  input.addEventListener('input',renderResults);
  input.addEventListener('focus',renderResults);
  input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();const r=search(input.value);if(r.length)pick(r[0].id);else toast('검색 결과가 없습니다.')}if(e.key==='Escape'){box.classList.add('hidden')}});
  document.addEventListener('pointerdown',e=>{if(!e.target.closest('#search-wrap'))box.classList.add('hidden')});
  const mic=$('#search-mic');if(mic)mic.addEventListener('click',()=>{const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR){toast('이 브라우저는 음성 검색을 지원하지 않습니다.');return}try{const r=new SR();r.lang='ko-KR';r.onresult=e=>{input.value=e.results[0][0].transcript;renderResults()};r.onerror=()=>toast('음성을 인식하지 못했습니다.');r.start();toast('말씀해 주세요…')}catch(e){toast('음성 검색을 시작할 수 없습니다.')}});

  /* ---------- 카테고리 칩 · 시대 토글 · 내 위치 ---------- */
  const chips=[...document.querySelectorAll('.filter-chip')];
  const ON='filter-chip whitespace-nowrap px-4 py-2 rounded-full font-label-md text-label-md transition-all bg-inverse-surface text-inverse-on-surface shadow-sm',OFF='filter-chip whitespace-nowrap px-4 py-2 rounded-full font-label-md text-label-md transition-all bg-surface-container-high text-on-surface-variant hover:bg-surface-variant';
  function syncChips(){chips.forEach(c=>{c.className=c.dataset.category===st.cat?ON:OFF;c.setAttribute('aria-pressed',c.dataset.category===st.cat)})}
  chips.forEach(c=>c.addEventListener('click',()=>{st.cat=c.dataset.category;syncChips();if(!visible(BY[st.sel])){const f=S.find(s=>visible(s)&&inFrame(s));if(f){st.sel=f.id;renderSheet();renderNearby()}}drawPins()}));
  const eraBtn=$('#era-toggle-btn'),eraText=$('#current-era-text');const eras=['헤이안 (794)','무로마치 (1336)','에도 (1603)','현대 교토'];let ei=2;
  if(eraBtn)eraBtn.addEventListener('click',()=>{ei=(ei+1)%eras.length;eraText.textContent=eras[ei]});
  const loc=$('#locate-btn');if(loc)loc.addEventListener('click',()=>{if(!navigator.geolocation){toast('위치 정보를 쓸 수 없습니다.');return}navigator.geolocation.getCurrentPosition(p=>{const me={lat:p.coords.latitude,lng:p.coords.longitude};const n=S.filter(s=>!s.far).map(s=>({s,d:km(me,s)})).sort((a,b)=>a.d-b.d)[0];if(n.d>30){toast('현재 위치가 교토 밖에 있습니다.');return}select(n.s.id,true);toast(`가장 가까운 곳: ${n.s.ko} (${n.d<=2.4?'도보 '+walk(n.d)+'분':n.d.toFixed(1)+'km'})`)},()=>toast('위치 권한이 없어 현재 위치를 찾지 못했습니다.'),{timeout:8000})});

  /* ---------- 시작 ---------- */
  syncChips();if(q0&&BY[q0])centerOn(BY[q0]);drawPins();renderSheet();renderNearby();
})();
