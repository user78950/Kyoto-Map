/* 탐방 수첩 고도화: 프로필 수정 · 새 답사 기록 작성 */
(function(){
  const $=q=>document.querySelector(q);
  const esc=t=>String(t??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const ms=(n,c='',f=false)=>`<span class="material-symbols-outlined ${c}" ${f?`style="font-variation-settings: 'FILL' 1;"`:''}>${n}</span>`;
  const SITES=(window.KH_SITES||[]).slice().sort((a,b)=>a.ko.localeCompare(b.ko,'ko'));
  const BY={};SITES.forEach(s=>BY[s.id]=s);
  const load=(k,d)=>{try{const v=JSON.parse(localStorage.getItem(k));return v??d}catch(e){return d}};
  const store=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch(e){return false}};
  const today=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
  const dot=s=>s.replace(/-/g,'.');

  /* ---------- 토스트 ---------- */
  let tt;function toast(m){const t=$('#nb-toast');t.querySelector('span:last-child').textContent=m;t.classList.remove('opacity-0','pointer-events-none');clearTimeout(tt);tt=setTimeout(()=>t.classList.add('opacity-0','pointer-events-none'),2400)}

  /* ---------- 공용 시트(모달) ---------- */
  function sheet(title,body,onMount){
    const root=$('#nb-modal');
    root.innerHTML=`<div id="nb-scrim" class="fixed inset-0 z-[60] bg-on-background/40 flex items-end justify-center">
      <div class="w-full max-w-[430px] max-h-[92vh] flex flex-col bg-surface rounded-t-2xl shadow-xl" role="dialog" aria-modal="true" aria-label="${esc(title)}">
        <div class="pt-2.5 pb-1"><div class="w-10 h-1 rounded-full bg-surface-container-highest mx-auto"></div></div>
        <div class="flex items-center justify-between px-margin py-2"><h2 class="font-headline-md text-headline-md text-on-surface">${esc(title)}</h2><button type="button" id="nb-close" class="w-9 h-9 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant" aria-label="닫기">${ms('close','text-[20px]')}</button></div>
        <div class="overflow-y-auto px-margin pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))]" id="nb-body">${body}</div>
      </div></div>`;
    document.body.style.overflow='hidden';
    const close=()=>{root.innerHTML='';document.body.style.overflow='';document.removeEventListener('keydown',onKey)};
    const onKey=e=>{if(e.key==='Escape'){const f=root._onClose;root._onClose=null;if(f)f();close()}};
    document.addEventListener('keydown',onKey);
    const dismiss=()=>{const f=root._onClose;root._onClose=null;if(f)f();close()};
    $('#nb-close').onclick=dismiss;
    $('#nb-scrim').addEventListener('click',e=>{if(e.target.id==='nb-scrim')dismiss()});
    root._onClose=null;
    onMount&&onMount(close,root);
  }
  const field=(label,inner,hint='')=>`<label class="block mb-4"><span class="flex items-center justify-between font-label-md text-label-md text-on-surface-variant mb-1.5"><span>${label}</span>${hint}</span>${inner}</label>`;
  const INPUT='w-full px-3.5 py-3 rounded-xl bg-surface-container-lowest border border-outline-variant/70 text-on-surface font-body-md text-body-md placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15';

  /* 사진 줄이기 (저장 공간 절약) */
  function shrink(file,max,q){return new Promise((res,rej)=>{const r=new FileReader();r.onerror=rej;r.onload=()=>{const img=new Image();img.onerror=rej;img.onload=()=>{const k=Math.min(1,max/Math.max(img.width,img.height));const c=document.createElement('canvas');c.width=Math.round(img.width*k);c.height=Math.round(img.height*k);c.getContext('2d').drawImage(img,0,0,c.width,c.height);res(c.toDataURL('image/jpeg',q))};img.src=r.result};r.readAsDataURL(file)})}

  /* =====================================================
     1) 프로필
     ===================================================== */
  const TITLES=['교토 입문자','골목 산책자','고도 탐구자','역사 답사가','정원 감상가','성곽 순례자','교토 박사'];
  const SEALS=['旅','京','寺','社','城','史','茶','竹'];
  const COLORS=[['vermilion','bg-primary-container text-on-primary'],['matcha','bg-secondary text-on-secondary'],['gold','bg-tertiary-container text-on-tertiary-container'],['sumi','bg-inverse-surface text-inverse-on-surface']];
  const colorCls=c=>(COLORS.find(x=>x[0]===c)||COLORS[0])[1];
  const DEF={name:'김교토',title:'고도 탐구자',intro:'역사 답사가 · 교토 8회차 탐색 중',level:4,avatar:null};
  let prof=Object.assign({},DEF,load('kh-profile',{}));

  const passImg=document.querySelector('#kh-passport-avatar');
  function avatarHTML(p,size){
    if(p.avatar&&p.avatar.type==='photo')return `<img alt="${esc(p.name)} 님 프로필" class="${size} object-cover shadow-sm" src="${p.avatar.data}"/>`;
    if(p.avatar&&p.avatar.type==='seal')return `<span class="${size} ${colorCls(p.avatar.color)} flex items-center justify-center font-headline-md font-bold shadow-sm" style="font-size:1.6em">${esc(p.avatar.char)}</span>`;
    return null;
  }
  function renderProfile(){
    const nameEl=$('#kh-prof-name'),introEl=$('#kh-prof-intro'),titleEl=$('#kh-prof-title'),lvEl=$('#kh-prof-level');
    if(nameEl)nameEl.innerHTML=`${esc(prof.name)} <span class="font-body-md text-body-md text-on-surface-variant font-normal">님</span>`;
    if(introEl)introEl.textContent=prof.intro;
    if(titleEl)titleEl.textContent=prof.title;
    if(lvEl)lvEl.textContent='탐방 레벨 '+prof.level;
    const slot=$('#kh-passport-avatar-slot');
    if(slot){const h=avatarHTML(prof,'w-16 h-16 rounded-xl');if(h)slot.innerHTML=h}
    if(window.KH_applyAvatar)window.KH_applyAvatar();
  }
  function openProfile(){
    let draft=JSON.parse(JSON.stringify(prof));
    const preview=()=>{const h=avatarHTML(draft,'w-20 h-20 rounded-2xl');return h||`<span class="w-20 h-20 rounded-2xl bg-surface-container-high text-on-surface-variant flex items-center justify-center">${ms('person','text-[36px]')}</span>`};
    sheet('프로필 수정',`
      <div class="flex flex-col items-center gap-2 pt-1 pb-4">
        <div id="pf-preview" class="relative">${preview()}</div>
        <div class="flex gap-2 mt-1">
          <label class="px-3 py-1.5 rounded-full bg-surface-container text-on-surface font-label-md text-label-md flex items-center gap-1 cursor-pointer">${ms('photo_camera','text-[16px]')}사진 선택<input id="pf-file" type="file" accept="image/*" class="hidden"></label>
          <button type="button" id="pf-clear-photo" class="px-3 py-1.5 rounded-full bg-surface-container text-on-surface-variant font-label-md text-label-md">기본 이미지</button>
        </div>
      </div>
      <div class="mb-4"><span class="block font-label-md text-label-md text-on-surface-variant mb-1.5">인장 아바타</span>
        <div class="flex flex-wrap gap-2" id="pf-seals">${SEALS.map(c=>`<button type="button" data-seal="${c}" class="w-11 h-11 rounded-xl border font-headline-sm text-[20px] font-bold">${c}</button>`).join('')}</div>
        <div class="flex gap-2 mt-2" id="pf-colors">${COLORS.map(([k,c])=>`<button type="button" data-color="${k}" class="w-8 h-8 rounded-full ${c} ring-offset-2 ring-offset-surface" aria-label="${k}"></button>`).join('')}</div>
      </div>
      ${field('이름 (닉네임)',`<input id="pf-name" maxlength="12" class="${INPUT}" value="${esc(draft.name)}" placeholder="예: 김교토">`,`<span id="pf-name-c" class="text-[11px]"></span>`)}
      ${field('한 줄 소개',`<input id="pf-intro" maxlength="30" class="${INPUT}" value="${esc(draft.intro)}" placeholder="예: 성곽 덕후 · 교토 3회차">`,`<span id="pf-intro-c" class="text-[11px]"></span>`)}
      <div class="mb-4"><span class="block font-label-md text-label-md text-on-surface-variant mb-1.5">칭호</span>
        <div class="flex flex-wrap gap-1.5" id="pf-titles">${TITLES.map(t=>`<button type="button" data-title="${t}" class="px-3 py-1.5 rounded-full font-label-md text-label-md">${t}</button>`).join('')}</div></div>
      <div class="grid grid-cols-2 gap-2 pt-2">
        <button type="button" id="pf-reset" class="h-12 rounded-full bg-surface-container text-on-surface-variant font-label-lg text-label-lg">처음 상태로</button>
        <button type="button" id="pf-save" class="h-12 rounded-full bg-primary text-on-primary font-label-lg text-label-lg shadow-md flex items-center justify-center gap-1.5">${ms('check','text-[18px]')}저장하기</button>
      </div>`,(close)=>{
        const sync=()=>{
          $('#pf-preview').innerHTML=preview();
          document.querySelectorAll('[data-seal]').forEach(b=>{const on=draft.avatar&&draft.avatar.type==='seal'&&draft.avatar.char===b.dataset.seal;b.className=`w-11 h-11 rounded-xl border font-headline-sm text-[20px] font-bold ${on?'border-primary bg-primary/10 text-primary':'border-outline-variant/70 bg-surface-container-lowest text-on-surface'}`});
          document.querySelectorAll('[data-color]').forEach(b=>{const on=(draft.avatar&&draft.avatar.color||'vermilion')===b.dataset.color;b.classList.toggle('ring-2',on);b.classList.toggle('ring-on-surface',on)});
          document.querySelectorAll('[data-title]').forEach(b=>{const on=draft.title===b.dataset.title;b.className=`px-3 py-1.5 rounded-full font-label-md text-label-md ${on?'bg-inverse-surface text-inverse-on-surface':'bg-surface-container text-on-surface-variant'}`});
          $('#pf-name-c').textContent=`${$('#pf-name').value.length}/12`;$('#pf-intro-c').textContent=`${$('#pf-intro').value.length}/30`;
        };
        document.querySelectorAll('[data-seal]').forEach(b=>b.onclick=()=>{draft.avatar={type:'seal',char:b.dataset.seal,color:(draft.avatar&&draft.avatar.color)||'vermilion'};sync()});
        document.querySelectorAll('[data-color]').forEach(b=>b.onclick=()=>{const ch=(draft.avatar&&draft.avatar.type==='seal')?draft.avatar.char:'旅';draft.avatar={type:'seal',char:ch,color:b.dataset.color};sync()});
        document.querySelectorAll('[data-title]').forEach(b=>b.onclick=()=>{draft.title=b.dataset.title;sync()});
        $('#pf-name').oninput=sync;$('#pf-intro').oninput=sync;
        $('#pf-file').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{const data=await shrink(f,320,.82);draft.avatar={type:'photo',data};sync()}catch(err){toast('사진을 불러오지 못했습니다.')}};
        $('#pf-clear-photo').onclick=()=>{draft.avatar=null;sync()};
        $('#pf-reset').onclick=()=>{if(confirm('프로필을 처음 상태로 되돌릴까요?')){prof=Object.assign({},DEF);try{localStorage.removeItem('kh-profile')}catch(e){}renderProfile();close();toast('프로필을 처음 상태로 되돌렸습니다.')}};
        $('#pf-save').onclick=()=>{const name=$('#pf-name').value.trim();if(!name){toast('이름을 입력해 주세요.');$('#pf-name').focus();return}
          draft.name=name;draft.intro=$('#pf-intro').value.trim()||DEF.intro;prof=draft;
          if(!store('kh-profile',prof)){toast('저장 공간이 부족해 사진을 줄여 다시 시도해 주세요.');return}
          renderProfile();close();toast('프로필을 저장했습니다.')};
        sync();
      });
  }

  /* =====================================================
     2) 답사 기록
     ===================================================== */
  const KINDS=[['관찰 메모','visibility','bg-primary'],['건축','architecture','bg-tertiary'],['소리풍경','graphic_eq','bg-secondary'],['정원·자연','park','bg-secondary'],['맛·휴식','local_cafe','bg-tertiary-container'],['감상','favorite','bg-primary-container']];
  const WEATHER=[['맑음','sunny'],['흐림','cloud'],['비','rainy'],['눈','ac_unit']];
  let notes=load('kh-notes',[]);
  const BASE_COUNT=15; /* 디자인 원본에 이미 있던 기록 수 */
  function countUI(){
    const n=BASE_COUNT+notes.length;
    const st=$('#kh-stat-notes');if(st)st.innerHTML=`${n}<span class="text-body-sm text-on-surface-variant font-normal">개</span>`;
    const all=$('#kh-notes-all');if(all)all.textContent=`전체보기 (${n})`;
  }
  function noteCard(n){
    const s=BY[n.site];const k=KINDS.find(x=>x[0]===n.kind)||KINDS[0];const w=WEATHER.find(x=>x[0]===n.weather);
    return `<article class="rounded-xl bg-surface-container-lowest p-space-md shadow-sm flex flex-col ring-1 ring-primary/10" data-note="${n.id}">
      <div class="flex items-start justify-between gap-2">
        <div class="flex items-center gap-space-xs min-w-0"><span class="w-2.5 h-2.5 rounded-full shrink-0 ${k[2]}"></span><h4 class="font-label-lg text-label-lg text-on-surface font-semibold truncate">${esc(n.title)}</h4></div>
        <span class="font-label-sm text-[11px] text-on-surface-variant shrink-0">${dot(n.date)}</span>
      </div>
      <div class="flex flex-wrap items-center gap-1.5 mt-1.5">
        ${s?`<a href="map.html?site=${s.id}" class="inline-flex items-center gap-0.5 font-label-sm text-label-sm text-primary">${ms('location_on','text-[13px]')}${esc(s.ko)}</a>`:''}
        <span class="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-[10px]">${ms(k[1],'text-[12px]')}${esc(k[0])}</span>
        ${w?`<span class="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-[10px]">${ms(w[1],'text-[12px]')}${w[0]}</span>`:''}
        <span class="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-label-sm text-[10px]">내 기록</span>
      </div>
      ${n.body?`<p class="font-body-md text-body-md text-on-surface-variant mt-2 leading-relaxed whitespace-pre-line">${esc(n.body)}</p>`:''}
      ${n.photos&&n.photos.length?`<div class="grid ${n.photos.length===1?'grid-cols-1':'grid-cols-2'} gap-space-xs mt-space-sm">${n.photos.map((p,i)=>`<button type="button" data-zoom="${n.id}:${i}" class="relative ${n.photos.length===3&&i===0?'col-span-2':''} aspect-video rounded-lg overflow-hidden bg-surface-container"><img class="w-full h-full object-cover" alt="답사 사진 ${i+1}" src="${p}"/></button>`).join('')}</div>`:''}
      <div class="flex items-center justify-between mt-space-md pt-2 gap-2">
        <div class="flex items-center gap-1.5 flex-wrap">${(n.tags||[]).map(t=>`<span class="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-[11px]">#${esc(t)}</span>`).join('')}</div>
        <div class="flex items-center gap-3 shrink-0">
          <button type="button" data-edit="${n.id}" class="flex items-center gap-1 text-on-surface-variant hover:text-primary transition-colors">${ms('edit','text-[16px]')}<span class="font-label-sm text-[11px]">수정</span></button>
          <button type="button" data-del="${n.id}" class="flex items-center gap-1 text-on-surface-variant hover:text-error transition-colors">${ms('delete','text-[16px]')}<span class="font-label-sm text-[11px]">삭제</span></button>
        </div>
      </div></article>`;
  }
  function renderNotes(){
    const box=$('#kh-user-notes');if(!box)return;
    const list=notes.slice().sort((a,b)=>b.date.localeCompare(a.date)||b.id-a.id);
    box.innerHTML=list.map(noteCard).join('');
    box.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{if(!confirm('이 기록을 삭제할까요?'))return;notes=notes.filter(n=>String(n.id)!==b.dataset.del);store('kh-notes',notes);renderNotes();toast('기록을 삭제했습니다.')});
    box.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>openNote(notes.find(n=>String(n.id)===b.dataset.edit)));
    box.querySelectorAll('[data-zoom]').forEach(b=>b.onclick=()=>{const[id,i]=b.dataset.zoom.split(':');const n=notes.find(x=>String(x.id)===id);viewPhoto(n.photos[+i])});
    if(window.KH_bindLinks)window.KH_bindLinks(box);
    countUI();
  }
  function viewPhoto(src){
    const root=$('#nb-modal');root.innerHTML=`<div id="nb-scrim" class="fixed inset-0 z-[60] bg-on-background/85 flex items-center justify-center p-4"><img class="max-w-full max-h-[85vh] rounded-xl shadow-xl" alt="답사 사진" src="${src}"/><button type="button" id="nb-close" class="absolute top-4 right-4 w-10 h-10 rounded-full bg-surface/90 flex items-center justify-center" aria-label="닫기">${ms('close','text-[20px]')}</button></div>`;
    const close=()=>root.innerHTML='';$('#nb-close').onclick=close;$('#nb-scrim').onclick=e=>{if(e.target.id==='nb-scrim')close()};
  }
  function openNote(edit){
    const draftKey='kh-note-draft';
    const saved=!edit&&load(draftKey,null);
    let d=edit?JSON.parse(JSON.stringify(edit)):Object.assign({site:'',title:'',date:today(),kind:KINDS[0][0],weather:'',body:'',tags:[],photos:[]},saved||{});
    const opts=`<option value="">명소를 선택하세요</option>`+['temple','shrine','castle','alley'].map(t=>`<optgroup label="${{temple:'사찰',shrine:'신사',castle:'성곽·궁궐',alley:'역사 골목'}[t]}">${SITES.filter(s=>s.type===t).map(s=>`<option value="${s.id}">${esc(s.ko)} (${esc(s.ja)})</option>`).join('')}</optgroup>`).join('');
    sheet(edit?'답사 기록 수정':'새 답사 기록',`
      ${saved&&!edit?`<div class="mb-4 flex items-center justify-between gap-2 p-2.5 rounded-lg bg-tertiary-fixed/60 text-on-tertiary-fixed"><span class="font-body-sm text-body-sm flex items-center gap-1">${ms('edit_note','text-[16px]')}작성 중이던 기록을 불러왔어요.</span><button type="button" id="nt-discard" class="font-label-sm text-label-sm underline">새로 쓰기</button></div>`:''}
      ${field('명소',`<select id="nt-site" class="${INPUT}">${opts}</select>`)}
      ${field('제목',`<input id="nt-title" maxlength="40" class="${INPUT}" placeholder="예: 기요미즈데라 본당 무대 결구">`,`<span id="nt-title-c" class="text-[11px]"></span>`)}
      <div class="grid grid-cols-2 gap-3">
        ${field('방문 날짜',`<input id="nt-date" type="date" class="${INPUT}" max="${today()}">`)}
        <div class="mb-4"><span class="block font-label-md text-label-md text-on-surface-variant mb-1.5">날씨</span><div class="flex gap-1.5" id="nt-weather">${WEATHER.map(([w,i])=>`<button type="button" data-w="${w}" class="flex-1 h-[46px] rounded-xl flex items-center justify-center" aria-label="${w}" title="${w}">${ms(i,'text-[20px]')}</button>`).join('')}</div></div>
      </div>
      <div class="mb-4"><span class="block font-label-md text-label-md text-on-surface-variant mb-1.5">기록 유형</span><div class="flex flex-wrap gap-1.5" id="nt-kinds">${KINDS.map(([k,i])=>`<button type="button" data-k="${k}" class="px-3 py-1.5 rounded-full font-label-md text-label-md flex items-center gap-1">${ms(i,'text-[15px]')}${k}</button>`).join('')}</div></div>
      ${field('내용',`<textarea id="nt-body" rows="6" maxlength="1000" class="${INPUT} leading-relaxed" placeholder="보고, 듣고, 느낀 것을 적어 보세요. 건축의 디테일, 소리, 냄새, 사람들의 모습도 좋아요."></textarea>`,`<span id="nt-body-c" class="text-[11px]"></span>`)}
      <div class="mb-4"><span class="flex items-center justify-between font-label-md text-label-md text-on-surface-variant mb-1.5"><span>사진 (최대 3장)</span><span class="text-[11px]">기기에만 저장돼요</span></span>
        <div class="grid grid-cols-3 gap-2" id="nt-photos"></div></div>
      <div class="mb-5"><span class="block font-label-md text-label-md text-on-surface-variant mb-1.5">태그</span>
        <div class="flex flex-wrap items-center gap-1.5 p-2 rounded-xl bg-surface-container-lowest border border-outline-variant/70 focus-within:border-primary" id="nt-tagbox"><input id="nt-tag" class="flex-1 min-w-[120px] bg-transparent outline-none font-body-md text-body-md px-1.5 py-1" placeholder="입력 후 Enter 또는 쉼표"></div>
        <div class="flex flex-wrap gap-1.5 mt-2" id="nt-tag-sugg"></div></div>
      <button type="button" id="nt-save" class="w-full h-14 rounded-full bg-primary text-on-primary font-label-lg text-label-lg shadow-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all">${ms(edit?'check':'edit_note','text-[20px]')}${edit?'수정 완료':'기록 저장하기'}</button>
    `,(close,root)=>{
      const v=id=>$(id);
      v('#nt-site').value=d.site;v('#nt-title').value=d.title;v('#nt-date').value=d.date;v('#nt-body').value=d.body;
      const keepDraft=()=>{if(edit)return;collect();if(d.title||d.body||d.photos.length)store(draftKey,d)};
      root._onClose=()=>{if(edit)return;collect();if(d.title||d.body||d.photos.length){keepDraft();toast('작성 중인 기록을 임시 저장했어요.')}};
      function collect(){d.site=v('#nt-site').value;d.title=v('#nt-title').value.trim();d.date=v('#nt-date').value||today();d.body=v('#nt-body').value.trim()}
      function sync(){
        document.querySelectorAll('[data-k]').forEach(b=>{const on=d.kind===b.dataset.k;b.className=`px-3 py-1.5 rounded-full font-label-md text-label-md flex items-center gap-1 ${on?'bg-inverse-surface text-inverse-on-surface':'bg-surface-container text-on-surface-variant'}`});
        document.querySelectorAll('[data-w]').forEach(b=>{const on=d.weather===b.dataset.w;b.className=`flex-1 h-[46px] rounded-xl flex items-center justify-center ${on?'bg-secondary text-on-secondary':'bg-surface-container text-on-surface-variant'}`});
        v('#nt-title-c').textContent=`${v('#nt-title').value.length}/40`;v('#nt-body-c').textContent=`${v('#nt-body').value.length}/1000`;
        v('#nt-photos').innerHTML=d.photos.map((p,i)=>`<div class="relative aspect-square rounded-xl overflow-hidden bg-surface-container"><img class="w-full h-full object-cover" alt="첨부 사진 ${i+1}" src="${p}"/><button type="button" data-rm="${i}" class="absolute top-1 right-1 w-6 h-6 rounded-full bg-on-background/70 text-surface flex items-center justify-center" aria-label="사진 빼기">${ms('close','text-[14px]')}</button></div>`).join('')+(d.photos.length<3?`<label class="aspect-square rounded-xl border-2 border-dashed border-outline-variant flex flex-col items-center justify-center gap-1 text-on-surface-variant cursor-pointer hover:bg-surface-container-low">${ms('add_a_photo','text-[24px]')}<span class="font-label-sm text-label-sm">${d.photos.length}/3</span><input id="nt-file" type="file" accept="image/*" multiple class="hidden"></label>`:'');
        v('#nt-photos').querySelectorAll('[data-rm]').forEach(b=>b.onclick=()=>{d.photos.splice(+b.dataset.rm,1);sync()});
        const f=v('#nt-file');if(f)f.onchange=async e=>{const files=[...e.target.files].slice(0,3-d.photos.length);for(const file of files){try{d.photos.push(await shrink(file,960,.72))}catch(err){toast('사진을 불러오지 못했습니다.')}}sync()};
        const box=v('#nt-tagbox'),inp=v('#nt-tag');box.querySelectorAll('.nt-chip').forEach(c=>c.remove());
        d.tags.forEach((t,i)=>{const c=document.createElement('span');c.className='nt-chip inline-flex items-center gap-0.5 pl-2 pr-1 py-0.5 rounded-full bg-surface-container text-on-surface font-label-sm text-[12px]';c.innerHTML=`#${esc(t)}<button type="button" class="w-4 h-4 rounded-full flex items-center justify-center" aria-label="태그 빼기">${ms('close','text-[12px]')}</button>`;c.querySelector('button').onclick=()=>{d.tags.splice(i,1);sync()};box.insertBefore(c,inp)});
        const s=BY[v('#nt-site').value];const sugg=[...new Set([s&&s.district.split(' ')[0],s&&{temple:'사찰',shrine:'신사',castle:'성곽',alley:'골목'}[s.type],d.kind.replace('·',''),'첫방문','다시가고싶은곳'].filter(Boolean))].filter(t=>!d.tags.includes(t)).slice(0,5);
        v('#nt-tag-sugg').innerHTML=sugg.map(t=>`<button type="button" data-sg="${esc(t)}" class="px-2 py-0.5 rounded-full border border-dashed border-outline-variant text-on-surface-variant font-label-sm text-[11px]">+ #${esc(t)}</button>`).join('');
        v('#nt-tag-sugg').querySelectorAll('[data-sg]').forEach(b=>b.onclick=()=>{if(d.tags.length<6){d.tags.push(b.dataset.sg);sync()}});
      }
      const addTag=()=>{const inp=v('#nt-tag');inp.value.split(/[,，]/).map(t=>t.trim().replace(/^#/,'')).filter(Boolean).forEach(t=>{if(!d.tags.includes(t)&&d.tags.length<6)d.tags.push(t.slice(0,12))});inp.value='';sync()};
      v('#nt-tag').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===','){e.preventDefault();addTag()}else if(e.key==='Backspace'&&!e.target.value&&d.tags.length){d.tags.pop();sync()}});
      v('#nt-tag').addEventListener('blur',addTag);
      document.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{d.kind=b.dataset.k;sync()});
      document.querySelectorAll('[data-w]').forEach(b=>b.onclick=()=>{d.weather=d.weather===b.dataset.w?'':b.dataset.w;sync()});
      ['#nt-title','#nt-body'].forEach(id=>v(id).addEventListener('input',sync));
      v('#nt-site').addEventListener('change',()=>{const s=BY[v('#nt-site').value];if(s&&!v('#nt-title').value)v('#nt-title').placeholder=`예: ${s.ko}에서 본 것`;sync()});
      const dis=v('#nt-discard');if(dis)dis.onclick=()=>{try{localStorage.removeItem(draftKey)}catch(e){}d={site:'',title:'',date:today(),kind:KINDS[0][0],weather:'',body:'',tags:[],photos:[]};v('#nt-site').value='';v('#nt-title').value='';v('#nt-body').value='';v('#nt-date').value=today();dis.parentElement.remove();sync()};
      v('#nt-save').onclick=()=>{
        addTag();collect();
        if(!d.site){toast('어느 명소의 기록인지 골라 주세요.');v('#nt-site').focus();return}
        if(!d.title&&!d.body){toast('제목이나 내용을 적어 주세요.');v('#nt-title').focus();return}
        if(!d.title)d.title=BY[d.site].ko+' 답사';
        const next=edit?notes.map(n=>n.id===edit.id?d:n):[...notes,Object.assign({},d,{id:Date.now()})];
        if(!store('kh-notes',next)){toast('저장 공간이 부족해요. 사진 수를 줄여 주세요.');return}
        notes=next;try{localStorage.removeItem(draftKey)}catch(e){}
        root._onClose=null;close();renderNotes();
        const card=document.querySelector('#kh-user-notes article');if(card)card.scrollIntoView({behavior:'smooth',block:'center'});
        toast(edit?'기록을 수정했습니다.':'새 답사 기록을 저장했습니다.');
      };
      sync();
    });
  }

  /* ---------- 연결 ---------- */
  document.querySelectorAll('[data-open-note]').forEach(b=>b.addEventListener('click',()=>openNote()));
  document.querySelectorAll('[data-open-profile]').forEach(b=>b.addEventListener('click',openProfile));
  const all=$('#kh-notes-all');if(all)all.addEventListener('click',()=>{if(window.switchPassportTab)switchPassportTab('notes')});
  renderProfile();renderNotes();
})();
