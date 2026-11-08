/* Ling 1: static, private learning workspace. No accounts, analytics or uploads. */
(() => {
'use strict';
const D=window.LING_DATA;
const $=s=>document.querySelector(s);
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const strip=x=>String(x??'').replace(/<[^>]*>/g,' ').replace(/&amp;/g,'&').replace(/&gt;/g,'>');
const norm=x=>String(x??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/đ/g,'d');
const KEY='ling1-study-v2';
let storageOK=true;
const fresh=()=>({version:2,done:[],last:'c0',attempts:{},drafts:{},revealed:[],stars:[],known:[],review:[],tests:{},textSize:false});
let state=fresh();
try{const s=JSON.parse(localStorage.getItem(KEY)||'null');if(s&&s.version===2){for(const key of ['done','revealed','stars','known','review'])if(Array.isArray(s[key]))state[key]=s[key].filter(x=>typeof x==='string');for(const key of ['attempts','drafts','tests'])if(s[key]&&typeof s[key]==='object'&&!Array.isArray(s[key]))state[key]=s[key];if(D.lessons.some(l=>l.id===s.last))state.last=s.last;state.textSize=s.textSize===true;}}catch{storageOK=false;}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch{storageOK=false;}updateSide();}
const groups={start:{title:'Bắt đầu',short:'Tổng quan',symbol:'01'},phon:{title:'Phonetics & phonology',short:'Âm học',symbol:'/ə/'},morph:{title:'Morphology',short:'Hình thái học',symbol:'un·do'},syntax:{title:'Syntax',short:'Cú pháp',symbol:'S + V'}};
let route='home',practice={lesson:'all',type:'all',mode:'all',page:0},glossFilter='',flash={group:'all',mode:'all',pos:0,flip:false,order:null},ipa={tab:'consonants',index:0},testId=null;
const lessonOf=id=>D.lessons.find(l=>l.id===id)||D.lessons[0];
const questionOf=id=>D.questions.find(q=>q.id===id);
function toast(msg){$('#toast').textContent=msg;$('#toast').hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(()=>{$('#toast').hidden=true;},3200);}
function head(kicker,title,lead=''){return `<div class="pagehead"><span class="eyebrow">${kicker}</span><h1>${title}</h1>${lead?`<p class="lead">${lead}</p>`:''}</div>`;}
function button(action,label,cls='',extra=''){return `<button class="btn ${cls}" data-action="${action}" ${extra}>${label}</button>`;}
function doneCount(){return D.lessons.filter(l=>state.done.includes(l.id)).length;}
function updateSide(){if(!$('#side-count'))return;$('#side-count').textContent=`${doneCount()}/${D.lessons.length}`;$('#side-progress').style.width=(doneCount()/D.lessons.length*100)+'%';document.querySelectorAll('[data-done]').forEach(n=>n.textContent=state.done.includes(n.dataset.done)?'✓':'');}
function navigation(){
 $('#navigation').innerHTML=[['home','⌂','Không gian học'],['practice','✎','Luyện tập'],['tests','▤','Đề tự luyện'],['flash','▣','Flashcards'],['ipa','ə','Khám phá IPA'],['glossary','Aa','Tra thuật ngữ']].map(([id,ic,t])=>`<a class="navlink" data-route="${id}" href="#${id}"><span class="navicon" aria-hidden="true">${ic}</span>${t}</a>`).join('')+
 Object.entries(groups).map(([key,g])=>`<details class="nav-group" ${['start','phon'].includes(key)?'open':''}><summary>${g.title}</summary>${D.lessons.filter(l=>l.group===key).map((l,i)=>`<a class="navlink navlesson" data-route="lesson/${l.id}" href="#lesson/${l.id}"><span class="number">${String(i+1).padStart(2,'0')}</span><span>${l.title}</span><span class="check" data-done="${l.id}"></span></a>`).join('')}</details>`).join('')+
 `<div class="nav-group"><a class="navlink" data-route="progress" href="#progress"><span class="navicon">◴</span>Tiến độ của bạn</a><a class="navlink" data-route="sources" href="#sources"><span class="navicon">≡</span>Nguồn & quy ước</a></div>`;
 updateSide();
}
function closeMenu(){ $('#sidebar').classList.remove('open');$('#backdrop').hidden=true;$('#menu').setAttribute('aria-expanded','false');$('.workarea').inert=false; }
function routeTo(){
 let hash;try{hash=decodeURIComponent(location.hash.slice(1)||'home');}catch{hash='home';}
 // Native anchors inside lessons should scroll, not change the current lesson.
 if(hash.startsWith('section-')||hash==='main')return;
 route=hash;testId=null;closeMenu();
 document.querySelectorAll('[data-route]').forEach(n=>{n.classList.toggle('active',n.dataset.route===route);if(n.dataset.route===route){n.setAttribute('aria-current','page');const d=n.closest('details');if(d)d.open=true;}else n.removeAttribute('aria-current');});
 if(route.startsWith('lesson/')){const id=route.split('/')[1];if(!D.lessons.some(l=>l.id===id)){location.hash='home';return;}renderLesson(id);}
 else if(route.startsWith('practice/')){practice.lesson=route.split('/')[1];practice.page=0;renderPractice();}
 else if(route.startsWith('test/')){testId=route.split('/')[1];renderTest();}
 else ({home:renderHome,practice:renderPractice,tests:renderTests,flash:renderFlash,ipa:renderIPA,glossary:renderGlossary,progress:renderProgress,sources:renderSources}[route]||renderHome)();
 const title=$('#main h1')?.textContent||'Ling 1';document.title=title+' · Ling 1';$('#breadcrumb').textContent=route.startsWith('lesson/')?groups[lessonOf(route.split('/')[1]).group].title:title;
 window.scrollTo({top:0,behavior:'instant'});$('#main').focus({preventScroll:true});
}
function renderHome(){
 const last=lessonOf(state.last);const hasStarted=state.done.length>0||Object.keys(state.attempts).length>0;
 $('#main').innerHTML=head('Introduction to English Linguistics 1','Hiểu từng phần. Nối cả bức tranh.','Từ cách tạo một âm đến cách tạo một câu — học bằng tiếng Việt, giữ đúng thuật ngữ tiếng Anh.')+
 `<div class="chips"><span class="chip">${D.lessons.length} bài học</span><span class="chip">${D.glossary.length} thuật ngữ</span><span class="chip">${D.questions.length} câu & bài luyện</span><span class="chip">${D.tests.length} đề tự luyện</span></div>
 <div class="dashboard-grid"><section class="resume"><span class="eyebrow">${hasStarted?'Tiếp tục từ lần trước':'Bắt đầu nhẹ nhàng'}</span><h2>${last.title}</h2><p class="lead">${last.lead}</p><div class="actions"><a class="btn" href="#lesson/${last.id}">${hasStarted?'Tiếp tục học':'Mở bài đầu tiên'}</a><a class="btn secondary" href="#practice">Luyện một vài câu</a></div></section><aside class="coursebrief"><span class="eyebrow">Học kỳ I · 2026–27</span><h3>Đi đúng lộ trình.</h3><p>Giữa kỳ ở tuần 10: âm học và hình thái. Sau đó tiếp tục với cú pháp.</p><div class="grade"><div><b>20%</b><span>THAM GIA & BÀI TẬP</span></div><div><b>20%</b><span>GIỮA KỲ</span></div><div><b>60%</b><span>CUỐI KỲ</span></div></div></aside></div>
 <div class="sectionrow"><h2>Ba mảng, một hệ thống</h2><span class="eyebrow">Âm → từ → câu</span></div><div class="module-grid">${['phon','morph','syntax'].map((g,i)=>{const ls=D.lessons.filter(l=>l.group===g);return `<a class="module" href="#lesson/${ls[0].id}"><div class="module-symbol" aria-hidden="true">${groups[g].symbol}</div><div class="module-content"><span class="eyebrow">0${i+1} · ${groups[g].short}</span><h3>${groups[g].title}</h3><p>${['Âm được tạo ra thế nào? Khi nào đổi âm làm đổi từ?','Từ gồm những đơn vị nghĩa nào? Chúng kết hợp ra sao?','Các từ làm gì trong câu? Cụm và mệnh đề lồng nhau thế nào?'][i]}</p><div class="module-foot"><span>${ls.length} bài học</span><span>${ls.filter(l=>state.done.includes(l.id)).length}/${ls.length} hoàn thành</span></div></div></a>`;}).join('')}</div>
 <h2>Mở đúng thứ bạn cần</h2><div class="quickgrid"><a class="quickitem" href="#ipa"><b>Bảng 44 âm</b><span>Mô tả, ví dụ & nghe từ</span></a><a class="quickitem" href="#lesson/s4"><b>7 clause patterns</b><span>Phân biệt O, C và A</span></a><a class="quickitem" href="#lesson/m3"><b>Morph ≠ morpheme</b><span>Đếm hai tầng rõ ràng</span></a><a class="quickitem" href="#glossary"><b>Từ điển thuật ngữ</b><span>Anh–Việt, có ví dụ</span></a></div>
 <details class="info"><summary>Cách học để không chỉ thuộc đáp án</summary><p>Đọc ý chính, che lời giải rồi tự phân tích ví dụ. Sau khi làm câu luyện, nói lại vì sao đúng và vì sao các lựa chọn còn lại không phù hợp. Trang Tiến độ tách <b>bài bạn tự đánh dấu hoàn thành</b> khỏi <b>kết quả luyện tập</b>; mở bài không tự động đồng nghĩa đã hiểu.</p></details>`;
 if(!storageOK)$('#main').insertAdjacentHTML('beforeend','<p class="storage-warning">Trình duyệt không cho phép lưu dữ liệu. Bạn vẫn học được nhưng tiến độ có thể mất khi đóng trang.</p>');
}
function renderLesson(id){
 const l=lessonOf(id);state.last=id;save();const idx=D.lessons.indexOf(l);
 $('#main').innerHTML=head(`${groups[l.group].title} · ${l.week}`,l.title,l.lead)+`<div class="chips"><span class="chip">${l.ref}</span><span class="chip">${l.blocks.length} phần nhỏ</span><span class="chip">Giải thích tiếng Việt · thuật ngữ tiếng Anh</span></div><div class="lesson-layout" style="margin-top:28px"><article class="lesson-content">${l.blocks.map((b,i)=>`<section class="lesson-section" id="section-${id}-${i}"><h2><span class="sectionno">${String(i+1).padStart(2,'0')}</span>${b.title}</h2>${b.html}</section>`).join('')}<section class="remember"><span class="eyebrow">Nhớ một điều này</span><p>${l.remember}</p></section><div class="actions">${button('complete',state.done.includes(id)?'✓ Đã hoàn thành':'Tôi đã hiểu bài này','gold',`data-id="${id}" aria-pressed="${state.done.includes(id)}"`)}${id!=='c0'?`<a class="btn secondary" href="#practice/${id}">Luyện phần này</a>`:''}${button('print','In bài học','secondary')}</div><p class="hint">Bạn tự đánh giá đã hiểu; mở một bài không tự tính là hoàn thành.</p><div class="lesson-controls">${idx>0?`<a class="btn secondary" href="#lesson/${D.lessons[idx-1].id}">Bài trước</a>`:'<span></span>'}${idx<D.lessons.length-1?`<a class="btn" href="#lesson/${D.lessons[idx+1].id}">Bài tiếp theo</a>`:'<a class="btn" href="#tests">Đến đề tự luyện</a>'}</div></article><aside class="lesson-toc" aria-label="Mục lục bài"><span class="eyebrow">Trong bài này</span>${l.blocks.map((b,i)=>`<a href="#section-${id}-${i}" data-scroll="section-${id}-${i}">${i+1}. ${b.title}</a>`).join('')}<p class="hint tocsource">Số trang luôn là trang PDF, không phải số slide in bên trong.</p><div class="actions">${button('print','In bài này','secondary small')}</div></aside></div>`;
}
function lessonOptions(selected='all'){return `<option value="all" ${selected==='all'?'selected':''}>Tất cả nội dung</option>`+['phon','morph','syntax'].map(g=>`<optgroup label="${groups[g].title}"><option value="${g}" ${selected===g?'selected':''}>Toàn bộ ${groups[g].short}</option>${D.lessons.filter(l=>l.group===g).map(l=>`<option value="${l.id}" ${selected===l.id?'selected':''}>${l.title}</option>`).join('')}</optgroup>`).join('');}
function matchesScope(q,scope){return scope==='all'||q.lesson===scope||lessonOf(q.lesson).group===scope;}
function practiceList(){return D.questions.filter(q=>matchesScope(q,practice.lesson)&&(practice.type==='all'||q.type===practice.type)&&(practice.mode==='all'||practice.mode==='wrong'&&state.attempts[q.id]?.ok===false||practice.mode==='new'&&!state.attempts[q.id]&&!state.revealed.includes(q.id)||practice.mode==='starred'&&state.stars.includes(q.id)));}
function canonical(s){return String(s||'').toLowerCase().normalize('NFKC').replace(/ɡ/g,'g').replace(/:/g,'ː').replace(/labio[- ]velar/g,'labialvelar').replace(/labial[- ]velar/g,'labialvelar').replace(/labio[- ]dental/g,'labiodental').replace(/alveolo[- ]palatal|palato[- ]alveolar|post[- ]alveolar|postalveolar/g,'postalveolar').replace(/inter[- ]dental/g,'dental').replace(/plosive/g,'stop').replace(/rime/g,'rhyme').replace(/vocal folds/g,'vocal cords').replace(/soft palate/g,'velum').replace(/âm vị/g,'phoneme').replace(/âm tiết/g,'syllable').replace(/hữu thanh/g,'voiced').replace(/vô thanh/g,'voiceless');}
function termMatch(value,expected){
 let v=canonical(value).trim(),e=canonical(expected).trim();
 if(!v)return false;
 if(/^\/.+\/$/.test(expected)){const sym=e.replace(/\//g,'');return v.replace(/\//g,'').split(/[\s,;]+/).includes(sym);}
 if(e==='bilabial'&&/\blabialvelar\b/.test(v))return true;
 if(e==='neutral')return /\b(neutral|unrounded)\b/.test(v);
 if(e==='lateral approximant')return /\blateral\b/.test(v)&&/\b(approximant|continuant)\b/.test(v);
 if(e==='approximant')return /\b(approximant|retroflex|glide)\b/.test(v);
 if(e==='glide')return /\b(glide|approximant|semivowel|semi-vowel)\b/.test(v);
 const patt=e.replace(/[.*+?^${}()|[\]\\]/g,'\\$&').replace(/\s+/g,'\\s+');
 return new RegExp('(^|[^a-z])'+patt+'(?:s)?(?=$|[^a-z])','i').test(v);
}
function grade(q,value){
 if(q.type==='mc')return Number.isInteger(value)&&value===q.c;
 if(q.type==='tf')return typeof value==='boolean'&&value===q.ans;
 if(q.type==='fill'){
  if(!String(value||'').trim())return false;
  const cv=canonical(value);
  // Contradictory labels must never pass keyword checks.
  for(const [a,b] of [['voiced','voiceless'],['rounded','unrounded'],['long','short'],['high','low'],['front','back']])if(new RegExp('\\b'+a+'\\b').test(cv)&&new RegExp('\\b'+b+'\\b').test(cv))return false;
  return q.ans.every(e=>termMatch(value,e));
 }
 return null;
}
function answerText(q){return q.type==='mc'?q.opts[q.c]:q.type==='tf'?(q.ans?'Đúng':'Sai'):Array.isArray(q.ans)?q.ans.join(' · '):strip(q.ans);}
function feedback(q,a,mode){
 const isOpen=q.type==='open';const ok=isOpen?null:grade(q,a?.value);
 return `<div class="feedback ${ok===true?'ok':ok===false?'bad':''}" id="feedback-${q.id}" tabindex="-1" role="status"><b>${isOpen?'Lời giải tham khảo':ok?'✓ Chính xác':'✕ Cần xem lại'}</b><p><strong>${esc(answerText(q))}</strong></p><p>${esc(q.why||'')}</p><a href="#lesson/${q.lesson}">Đọc lại: ${esc(lessonOf(q.lesson).title)}</a>${mode==='practice'&&!isOpen?`<div class="actions">${button('retry','Thử lại câu này','secondary small',`data-id="${q.id}"`)}</div>`:''}</div>`;
}
function questionHTML(q,num,mode='practice',draft){
 const exam=mode==='test';const t=exam?state.tests[testId]:null;
 const answered=exam?!!t?.submitted:!!state.attempts[q.id];
 const a=exam?{value:t?.answers[q.id]}:state.attempts[q.id];
 const reveal=exam?!!t?.submitted:state.revealed.includes(q.id);
 const val=exam?t?.answers[q.id]:(a?.value??state.drafts[q.id]);
 let input='';
 if(q.type==='mc'||q.type==='tf'){
  const opts=q.type==='mc'?q.opts:['Đúng','Sai'];
  input=`<div class="options">${opts.map((o,i)=>{const v=q.type==='tf'?i===0:i;const picked=val===v;const correct=q.type==='tf'?v===q.ans:i===q.c;return `<button class="option ${answered&&correct?'correct':answered&&picked?'wrong':picked?'selected':''}" ${answered?'disabled':''} data-action="${exam?'testpick':'answer'}" data-id="${q.id}" data-value="${q.type==='tf'?String(v):i}" aria-pressed="${picked}"><span class="letter" aria-hidden="true">${answered&&correct?'✓':answered&&picked?'✕':String.fromCharCode(65+i)}</span><span>${esc(o)}</span></button>`;}).join('')}</div>`;
 }else if(q.type==='fill')input=`<div class="answerline"><label class="sr-only" for="input-${q.id}">Câu trả lời cho câu ${num}</label><input type="text" id="input-${q.id}" data-draft="${q.id}" data-mode="${mode}" value="${esc(val||'')}" ${answered?'disabled':''} placeholder="Nhập thuật ngữ hoặc mô tả bằng tiếng Anh" autocomplete="off">${exam?'':button('checkfill','Kiểm tra','',`data-id="${q.id}" ${answered?'disabled':''}`)}</div><p class="hint">Chấp nhận các nhãn tương đương thông dụng. Với IPA, có thể nhập có hoặc không có / /.</p>`;
 else if(q.type==='open')input=`<label class="sr-only" for="input-${q.id}">Phần tự trả lời câu ${num}</label><textarea id="input-${q.id}" data-draft="${q.id}" data-mode="${mode}" placeholder="Tự phân tích trước khi xem lời giải…">${esc(val||'')}</textarea>${exam?'<p class="hint">Tự luận không chấm tự động. Lời giải xuất hiện sau khi nộp bài.</p>':`<div class="actions">${button('reveal',reveal?'Ẩn lời giải':'Đối chiếu lời giải','secondary',`data-id="${q.id}"`)}</div>`}`;
 return `<section class="question" id="q-${q.id}"><div class="questionhead"><span class="questionmeta">${num} · ${({mc:'TRẮC NGHIỆM',tf:'ĐÚNG / SAI',fill:'ĐIỀN THUẬT NGỮ',open:'TỰ LUẬN'})[q.type]} · ${esc(groups[lessonOf(q.lesson).group].short)}</span>${!exam?`<button class="qstar" data-action="star" data-id="${q.id}" aria-label="${state.stars.includes(q.id)?'Bỏ đánh dấu':'Đánh dấu ôn lại'}" aria-pressed="${state.stars.includes(q.id)}">${state.stars.includes(q.id)?'★':'☆'}</button>`:''}</div><h3>${esc(strip(q.q))}</h3>${input}${q.type==='open'?(reveal?feedback(q,a,mode):''):(answered?feedback(q,a,mode):'')}</section>`;
}
function renderPractice(){
 const list=practiceList(),perPage=8,pages=Math.max(1,Math.ceil(list.length/perPage));practice.page=Math.min(practice.page,pages-1);
 const displayed=list.slice(practice.page*perPage,(practice.page+1)*perPage);
 const objective=list.filter(q=>q.type!=='open'),attempted=objective.filter(q=>state.attempts[q.id]),correct=attempted.filter(q=>state.attempts[q.id].ok);
 $('#main').innerHTML=head('Tự làm · hiểu vì sao','Luyện tập có lời giải','Chọn một phần nhỏ. Trả lời trước, rồi kiểm tra lập luận. Câu tự luận có lời giải để bạn tự đối chiếu, không giả lập chấm bằng AI.')+
 `<div class="filterbar"><div class="field"><label for="practice-lesson">Nội dung</label><select id="practice-lesson">${lessonOptions(practice.lesson)}</select></div><div class="field"><label for="practice-type">Dạng bài</label><select id="practice-type">${[['all','Tất cả dạng bài'],['mc','Trắc nghiệm'],['tf','Đúng / sai'],['fill','Điền thuật ngữ'],['open','Tự luận & phân tích']].map(([v,t])=>`<option value="${v}" ${practice.type===v?'selected':''}>${t}</option>`).join('')}</select></div><div class="field"><label for="practice-mode">Bộ câu hỏi</label><select id="practice-mode">${[['all','Tất cả'],['new','Chưa làm'],['wrong','Cần sửa lại'],['starred','Đã đánh dấu']].map(([v,t])=>`<option value="${v}" ${practice.mode===v?'selected':''}>${t}</option>`).join('')}</select></div></div>
 <div class="practice-summary"><span>${list.length} câu / bài trong bộ lọc · trang ${practice.page+1}/${pages}</span><span>Đúng ${correct.length}/${attempted.length} câu đã chấm · ${objective.length} câu có thể chấm</span></div>
 ${displayed.length?displayed.map((q,i)=>questionHTML(q,practice.page*perPage+i+1)).join(''):`<div class="empty"><h2>Không có câu nào trong bộ lọc này.</h2><p>Thử đổi nội dung, dạng bài hoặc chọn “Tất cả”.</p>${button('practice-all','Hiện tất cả bài luyện','secondary')}</div>`}
 ${pages>1?`<div class="pagination">${button('practice-prev','Trang trước','secondary',practice.page===0?'disabled':'')}<span>${practice.page+1} / ${pages}</span>${button('practice-next','Trang sau','secondary',practice.page===pages-1?'disabled':'')}</div>`:''}`;
}
function replaceQuestion(id){const q=questionOf(id);const card=document.getElementById('q-'+id);if(q&&card){const num=Number(card.querySelector('.questionmeta')?.textContent.match(/^\d+/)?.[0])||1;card.outerHTML=questionHTML(q,num);document.getElementById('feedback-'+id)?.focus({preventScroll:true});}const objective=D.questions.filter(q=>matchesScope(q,practice.lesson)&&q.type!=='open'&&(practice.type==='all'||q.type===practice.type));const attempted=objective.filter(q=>state.attempts[q.id]);const summary=$('.practice-summary span:last-child');if(summary)summary.textContent=`Trong nội dung đã chọn: đúng ${attempted.filter(q=>state.attempts[q.id].ok).length}/${attempted.length} câu đã chấm`;}
function renderGlossary(){
 const list=D.glossary.filter(g=>norm(g.join(' ')).includes(norm(glossFilter)));
 $('#main').innerHTML=head('English ↔ Tiếng Việt','Tra thuật ngữ','Định nghĩa ngắn để nhớ, bài học để hiểu sâu. Tên gọi gần nhau không nhất thiết chỉ cùng một thứ.')+`<div class="filterbar"><div class="field"><label for="gloss-filter">Tìm tiếng Anh hoặc tiếng Việt, có hoặc không dấu</label><input type="text" id="gloss-filter" value="${esc(glossFilter)}" placeholder="Ví dụ: morpheme, hinh vi, complement…"></div></div><p class="hint">${list.length}/${D.glossary.length} thuật ngữ</p><div class="gloss-list">${list.map(g=>`<article class="gloss-card"><h2 style="font-size:1.25rem;margin-bottom:4px">${esc(g[0])}</h2><span class="vn">${esc(g[1])}</span><p>${esc(g[2])}</p><a href="#lesson/${g[3]}">Đọc ví dụ trong bài học</a></article>`).join('')}</div>${!list.length?'<div class="empty">Chưa có thuật ngữ khớp. Thử một từ ngắn hơn hoặc tìm không dấu.</div>':''}`;
}
function flashList(){let a=D.glossary.filter(g=>(flash.group==='all'||lessonOf(g[3]).group===flash.group)&&(flash.mode==='all'||flash.mode==='unknown'&&!state.known.includes(g[0])||flash.mode==='review'&&state.review.includes(g[0])));if(flash.order)a.sort((a,b)=>flash.order.indexOf(a[0])-flash.order.indexOf(b[0]));return a;}
function renderFlash(){
 const cards=flashList();flash.pos=cards.length?((flash.pos%cards.length)+cards.length)%cards.length:0;const c=cards[flash.pos];
 $('#main').innerHTML=head('Nhớ thuật ngữ bằng tự kiểm tra','Flashcards','Đọc mặt trước, tự nói định nghĩa và một ví dụ, rồi lật để đối chiếu. “Đã nhớ” là tự đánh giá của bạn.')+`<div class="flash-shell"><div class="filterbar"><div class="field"><label for="flash-group">Chủ đề</label><select id="flash-group">${[['all','Tất cả'],['phon','Âm học'],['morph','Hình thái học'],['syntax','Cú pháp']].map(([v,t])=>`<option value="${v}" ${flash.group===v?'selected':''}>${t}</option>`).join('')}</select></div><div class="field"><label for="flash-mode">Bộ thẻ</label><select id="flash-mode">${[['all','Tất cả thẻ'],['unknown','Chưa đánh dấu nhớ'],['review','Cần ôn lại']].map(([v,t])=>`<option value="${v}" ${flash.mode===v?'selected':''}>${t}</option>`).join('')}</select></div></div>${c?`<div class="row"><span class="hint">${groups[lessonOf(c[3]).group].title}</span><span class="hint">${flash.pos+1} / ${cards.length}</span></div><button class="flashcard ${flash.flip?'flipped':''}" data-action="flash-flip" aria-label="${flash.flip?'Lật về thuật ngữ':'Lật thẻ xem định nghĩa'}"><span class="eyebrow">${flash.flip?'Giải nghĩa':'Thuật ngữ'}</span>${flash.flip?`<p class="translation">${esc(c[0])} · ${esc(c[1])}</p><p class="definition">${esc(c[2])}</p>`:`<span class="term">${esc(c[0])}</span><span class="hint">Tự giải thích rồi bấm để lật</span>`}</button><div class="flash-controls">${button('flash-prev','Thẻ trước','secondary')}${button('flash-flip','Lật thẻ','secondary')}${button('flash-next','Thẻ sau','secondary')}</div><div class="flash-controls">${button('flash-review','Cần ôn lại','secondary')}${button('flash-known','Tôi đã nhớ','gold')}</div><div class="row"><a href="#lesson/${c[3]}">Xem bài học</a>${button('flash-shuffle','Xáo thứ tự','secondary small')}</div>`:'<div class="empty"><h2>Không có thẻ trong bộ này.</h2><p>Chọn “Tất cả thẻ”, hoặc đánh dấu các thẻ bạn muốn ôn lại.</p></div>'}</div>`;
}
function ipaRecords(){if(ipa.tab==='consonants')return D.consonants.map(r=>({sym:r[0],word:r[4],phon:r[5],props:[['Voicing',r[1]],['Place',r[2]],['Manner',r[3]]]}));if(ipa.tab==='vowels')return D.vowels.map(r=>({sym:r[0],word:r[5],phon:r[6],props:[['Length',r[1]],['Height',r[2]],['Tongue',r[3]],['Lips',r[4]]]}));return D.diphthongs.map(r=>({sym:r[0],word:r[2],phon:r[3],props:[['Glide',r[1]],['Group',r[0].endsWith('ə')?'Centring':'Closing']]}));}
function renderIPA(){const records=ipaRecords();ipa.index=Math.min(ipa.index,records.length-1);const r=records[ipa.index];
 $('#main').innerHTML=head('RP truyền thống · hệ quy chiếu của học phần','Chạm vào một âm. Hiểu cách tạo âm.','Bảng mô tả theo slide, với lưu ý khi hệ giọng hoặc thuật ngữ có khác biệt. Âm thanh là giọng đọc từ ví dụ của trình duyệt, không phải bản ghi IPA đơn âm.')+`<div class="tabs" aria-label="Loại âm">${[['consonants','24 phụ âm'],['vowels','12 nguyên âm đơn'],['diphthongs','8 nguyên âm đôi']].map(([v,t])=>`<button class="tab ${ipa.tab===v?'active':''}" data-action="ipa-tab" data-value="${v}" aria-pressed="${ipa.tab===v}">${t}</button>`).join('')}</div><div class="ipa-layout"><div><div class="ipa-grid">${records.map((x,i)=>`<button class="ipa-key ${i===ipa.index?'active':''}" data-action="ipa-pick" data-value="${i}" aria-pressed="${i===ipa.index}" aria-label="Âm ${x.sym}, ví dụ ${x.word}">${x.sym}<small>${x.word}</small></button>`).join('')}</div><aside class="note"><b>Đọc bảng đúng cách</b><p>${ipa.tab==='consonants'?'Chọn một âm để xem voicing, place và manner. Slide gộp /w/ vào bilabial; mô tả đầy đủ hơn là labial-velar. /r/ thay đổi theo giọng.':ipa.tab==='vowels'?'Các nhãn high/mid/low là hệ đơn giản hóa trong bài học. Neutral mô tả môi không tròn/không chủ động kéo giãn; đây không phải chiều phân loại tongue height.':'Các nguyên âm đôi centring thuộc hệ RP truyền thống; trong giọng Anh hiện đại, một số âm có thể đổi hoặc nhập với nguyên âm đơn.'}</p></aside></div><aside class="ipa-detail"><div class="ipa-big">/${r.sym}/</div><dl>${r.props.map(([k,v])=>`<dt>${k}</dt><dd>${v}</dd>`).join('')}<dt>Example</dt><dd>${r.word} ${r.phon}</dd></dl>${button('speak','Nghe từ “'+r.word+'”','',`data-word="${r.word}"`)}<p class="hint">Ưu tiên giọng en-GB nếu thiết bị có. Tốc độ 0,85×. Nếu không nghe được, dùng từ và phiên âm phía trên.</p><a href="#lesson/p2">Xem cách mô tả âm</a></aside></div>`;
}
function testItems(t){return t.sections.flatMap(s=>s.items.filter(q=>q.type!=='match'));}
function testCount(t){const qs=testItems(t);return {auto:qs.filter(q=>q.type!=='open').length+t.sections.filter(s=>s.type==='match').reduce((a,s)=>a+s.items.length,0),open:qs.filter(q=>q.type==='open').length};}
function renderTests(){
 $('#main').innerHTML=head('Làm hết · nộp bài · đối chiếu','Đề tự luyện','Giữ bốn bộ đề từ bản gốc và bổ sung morphology, syntax, giữa kỳ, tổng ôn. Mỗi đề chỉ hiện lời giải sau khi nộp; tự luận không chấm tự động.')+`<div class="actions" style="margin:0 0 24px">${button('random-test','Chọn ngẫu nhiên một đề','secondary')}</div><div class="testgrid">${D.tests.map((t,i)=>{const c=testCount(t),s=state.tests[t.id];return `<article class="testcard"><span class="eyebrow">Đề ${String(i+1).padStart(2,'0')}</span><h2>${esc(t.title)}</h2><p>${esc(t.note)}</p><div class="chips"><span class="chip">${c.auto} câu tự chấm</span><span class="chip">${c.open} câu tự luận</span>${s?.submitted?'<span class="chip">Đã nộp</span>':s?'<span class="chip">Đang làm</span>':''}</div><div class="actions"><a class="btn" href="#test/${t.id}">${s?.submitted?'Xem kết quả':s?'Làm tiếp':'Mở đề'}</a></div></article>`;}).join('')}</div><p class="hint">Điểm web là số câu tự chấm đúng / số câu tự chấm. Không quy đổi thành điểm chính thức của môn.</p>`;
}
function ensureTest(id){if(!state.tests[id]||typeof state.tests[id]!=='object')state.tests[id]={answers:{},submitted:false,started:Date.now(),elapsed:0};const t=state.tests[id];if(!t.answers||typeof t.answers!=='object')t.answers={};return t;}
function currentTest(){return D.tests.find(t=>t.id===testId);}
function testQuestion(id){return testItems(currentTest()).find(q=>q.id===id);}
function testStats(t){const s=ensureTest(t.id);let correct=0,total=0,filled=0;for(const q of testItems(t)){if(q.type==='open')continue;total++;if(s.answers[q.id]!==undefined&&s.answers[q.id]!=='')filled++;if(grade(q,s.answers[q.id]))correct++;}t.sections.forEach((sec,si)=>{if(sec.type!=='match')return;sec.items.forEach((q,i)=>{total++;const v=s.answers[`match-${si}-${i}`];if(v!==undefined&&v!=='')filled++;if(Number.isInteger(v)&&v===i)correct++;});});return{correct,total,filled};}
function renderTest(){const t=currentTest();if(!t){location.hash='tests';return;}const s=ensureTest(t.id);save();const stats=testStats(t);let num=0;
 $('#main').innerHTML=head('Tự kiểm tra toàn phần',t.title,t.note)+`<div class="actions"><a href="#tests">Tất cả đề</a>${button('reset-test','Làm lại đề này','secondary small')}</div><div class="testhead"><span id="test-filled">Đã trả lời ${stats.filled}/${stats.total} câu tự chấm</span><span class="timer" id="test-time"></span>${!s.submitted?button('submit-test','Nộp bài','gold'):'<b>Đã nộp</b>'}</div>${s.submitted?`<section class="result"><span class="eyebrow" style="color:#e8bd72">Kết quả tự luyện</span><div class="score">${stats.correct} / ${stats.total}</div><p>${Math.round(stats.correct/stats.total*100)}% câu tự chấm đúng. Tự luận không nằm trong điểm này.</p><p>Đọc lời giải ngay dưới từng câu, sau đó mở bài liên quan để sửa phần chưa chắc.</p></section>`:'<aside class="note"><b>Chưa hiện đáp án</b><p>Đề được giữ trên trình duyệt này khi bạn chuyển trang hoặc tải lại. Đồng hồ ghi thời gian kể từ lúc mở đề, không tự nộp và không phải thời lượng thi chính thức.</p></aside>'}${t.sections.map((sec,si)=>`<section><h2 style="margin-top:30px">${esc(sec.title)}</h2>${sec.type==='match'?`<div class="question"><p>Nối mỗi thuật ngữ với định nghĩa phù hợp.</p>${sec.items.map((q,i)=>{num++;const v=s.answers[`match-${si}-${i}`];return `<div class="matchrow"><label for="match-${si}-${i}">${num}. ${esc(q.term)}</label><select id="match-${si}-${i}" data-match="${si}-${i}" ${s.submitted?'disabled':''}><option value="">Chọn định nghĩa</option>${sec.items.map((_,k)=>sec.items.length-1-k).map(j=>`<option value="${j}" ${v===j?'selected':''}>${esc(sec.items[j].def)}</option>`).join('')}</select></div>${s.submitted?`<p class="hint" style="color:${v===i?'var(--green)':'var(--red)'}">${v===i?'✓':'✕'} ${esc(q.term)}: ${esc(q.def)}</p>`:''}`;}).join('')}</div>`:sec.items.map(q=>questionHTML(q,++num,'test')).join('')}</section>`).join('')}${!s.submitted?`<div class="actions">${button('submit-test','Nộp bài và xem lời giải','gold')}</div>`:''}`;
 updateTestTime();
}
function updateTestTime(){if(!testId||!$('#test-time'))return;const s=ensureTest(testId);const sec=Math.max(0,Math.floor((s.submitted?s.elapsed:Date.now()-s.started)/1000));$('#test-time').textContent=`${Math.floor(sec/60)}:${String(sec%60).padStart(2,'0')} đã trôi qua`;}
setInterval(updateTestTime,1000);
function renderProgress(){
 const valid=D.questions.filter(q=>q.type!=='open'&&state.attempts[q.id]);const correct=valid.filter(q=>state.attempts[q.id].ok).length;
 $('#main').innerHTML=head('Nhìn rõ những gì đã học','Tiến độ của bạn','Dữ liệu lưu riêng trong trình duyệt hiện tại, không có tài khoản và không đồng bộ giữa thiết bị. Xóa dữ liệu trình duyệt có thể làm mất tiến độ.')+
 `<div class="stats"><div class="stat"><b>${doneCount()}/${D.lessons.length}</b><span>Bài tự đánh dấu hoàn thành</span></div><div class="stat"><b>${correct}/${valid.length}</b><span>Câu đúng / đã chấm</span></div><div class="stat"><b>${state.known.length}/${D.glossary.length}</b><span>Thẻ tự đánh dấu nhớ</span></div></div><div class="actions" style="margin-bottom:25px">${button('review-wrong',`Ôn ${valid.length-correct} câu cần sửa`,'gold')}${button('export','Xuất bản sao tiến độ','secondary')}</div><h2>Lộ trình bài học</h2>${D.lessons.map(l=>`<div class="progressrow"><a href="#lesson/${l.id}">${l.title}</a><span class="${state.done.includes(l.id)?'complete':''}">${state.done.includes(l.id)?'✓ Hoàn thành':'Chưa đánh dấu'}</span></div>`).join('')}<h2 style="margin-top:30px">Đề đã làm</h2>${D.tests.filter(t=>state.tests[t.id]).map(t=>{const s=state.tests[t.id],a=testStats(t);return `<div class="progressrow"><a href="#test/${t.id}">${t.title}</a><span>${s.submitted?`${a.correct}/${a.total}`:'Đang làm'}</span></div>`;}).join('')||'<p class="muted">Chưa mở đề nào. Bạn có thể bắt đầu bằng một đề chuyên đề ngắn.</p>'}<details class="info"><summary>Dữ liệu được tính như thế nào?</summary><p>Mỗi câu luyện chỉ tính một lần, theo lần trả lời gần nhất. Làm lại không cộng thêm vào tổng số câu. Tự luận và thẻ nhớ là tự đánh giá, không được coi là đã chấm đúng bằng máy. Điểm trong từng đề được giữ riêng, không cộng lẫn với phần luyện tập.</p><p>Không có dữ liệu gửi đến máy chủ từ các thao tác học. Bản sao tiến độ là một file JSON đọc được; không chứa thông tin tài khoản.</p></details>`;
}
function renderSources(){
 $('#main').innerHTML=head('Nguồn rõ · phạm vi rõ','Tài liệu & những chỗ đã hiệu chỉnh','Nội dung dựa trên ba PDF bạn cung cấp và bản web Ling1.txt. Số trang dưới đây là số trang PDF; bản web được biên soạn lại để tự học, không phải đáp án chính thức.')+
 `<section class="lesson-section"><h2>Ba tài liệu chính</h2><ul><li><b>File in 1(3).pdf</b> — 34 trang: bài tập bổ sung.</li><li><b>File in 2(3).pdf</b> — 144 trang: slide và bài tập.</li><li><b>Syllabus for INTRO 1_HK1_2026_27.docx(2).pdf</b> — 5 trang: đề cương môn ENG2055.</li></ul><p>Giáo trình được syllabus chỉ định: Brinton, L. J. & Brinton, D. M. (2010), <i>The Linguistic Structure of Modern English</i>, cùng workbook. Web không khẳng định đã đối chiếu toàn văn cuốn sách; nguồn trực tiếp là các file đã cung cấp.</p><p>Giữ bốn đề gốc từ Ling1.txt, sửa các phát biểu sai/thiếu phạm vi; bổ sung bài luyện và giải thích. Không có mục Forum hay tài khoản giả hoạt động.</p></section>
 <section class="lesson-section"><h2>Bản đồ nội dung → tài liệu</h2><div class="table-scroll"><table><thead><tr><th>Nguồn</th><th>Trang PDF</th><th>Nội dung</th><th>Bài học</th></tr></thead><tbody>${D.sourceMap.map(r=>`<tr><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td><td><a href="#lesson/${r[0]}">Mở bài</a></td></tr>`).join('')}</tbody></table></div></section>
 <section class="lesson-section"><h2>Những điểm không nên học máy móc</h2><ol><li><b>/h/ là voiceless</b>, không phải voiced như một đáp án ở bản web cũ.</li><li><b>44 phonemes</b> là mô hình RP truyền thống, không phải con số tuyệt đối cho mọi giọng tiếng Anh.</li><li><b>[tⁿ] không phải minh họa phù hợp cho get there</b>. Dùng tea [tʰ] và stay [t] để học bật hơi/không bật hơi; ⁿ là nasal release.</li><li><b>Phoneme phân biệt nghĩa, không tự mang nghĩa từ vựng.</b></li><li><b>Nucleus bắt buộc</b>; nguyên âm là trường hợp điển hình, còn có syllabic consonants.</li><li><b>Word primary stress ≠ nuclear stress trong mọi ngữ cảnh.</b></li><li><b>Perfect ≠ perfective</b> trong mọi lý thuyết; công thức have + participle là perfect.</li><li><b>Form ≠ function.</b> NP có thể là S, O, C, A; interrogative có thể dùng để yêu cầu.</li><li><b>Đếm morph/morpheme và phân loại câu</b> cần thống nhất quy ước với giảng viên.</li></ol></section>
 <section class="lesson-section"><h2>Nguồn mở để đọc thêm</h2><p><a href="https://pressbooks.pub/essentialsoflinguistics/chapter/4-3-allophones-and-predictable-variation/" target="_blank" rel="noopener">Catherine Anderson · Essentials of Linguistics: Allophones and Predictable Variation</a> — bổ sung cho giải thích về allophones. Sách dùng hệ giọng khác; không lấy nguyên bảng âm để thay RP trong học phần.</p><p><a href="https://www.phonetics.ucla.edu/course/contents.html" target="_blank" rel="noopener">UCLA · A Course in Phonetics: tài nguyên nghe</a> — nguồn nghe tham khảo bên ngoài, cần Internet.</p><p>Để đi thi, ưu tiên cách gọi và phạm vi giảng viên xác nhận. Nếu slide và kiến thức mở rộng khác nhau, trình bày rõ thay vì trộn hai hệ.</p></section>`;
}

// Actions share one state layer for UI and the optional browser agent interface.
$('#main').addEventListener('click',e=>{
 const scroll=e.target.closest('[data-scroll]');if(scroll){e.preventDefault();document.getElementById(scroll.dataset.scroll)?.scrollIntoView({behavior:'smooth'});return;}
 const b=e.target.closest('[data-action]');if(!b)return;const a=b.dataset.action,id=b.dataset.id;
 if(a==='complete'){state.done=state.done.includes(id)?state.done.filter(x=>x!==id):[...state.done,id];save();b.textContent=state.done.includes(id)?'✓ Đã hoàn thành':'Tôi đã hiểu bài này';b.setAttribute('aria-pressed',String(state.done.includes(id)));toast(state.done.includes(id)?'Đã lưu bài hoàn thành trên trình duyệt này.':'Đã bỏ đánh dấu hoàn thành.');}
 if(a==='print')window.print();
 if(a==='answer'||a==='checkfill'){
  const q=questionOf(id);if(!q||state.attempts[id])return;
  const v=a==='checkfill'?document.getElementById('input-'+id).value:q.type==='tf'?b.dataset.value==='true':Number(b.dataset.value);
  if(a==='checkfill'&&!v.trim()){toast('Nhập câu trả lời trước khi kiểm tra.');return;}
  state.attempts[id]={value:v,ok:grade(q,v)};save();replaceQuestion(id);
 }
 if(a==='retry'){delete state.attempts[id];save();replaceQuestion(id);}
 if(a==='reveal'){state.revealed=state.revealed.includes(id)?state.revealed.filter(x=>x!==id):[...state.revealed,id];save();replaceQuestion(id);}
 if(a==='star'){state.stars=state.stars.includes(id)?state.stars.filter(x=>x!==id):[...state.stars,id];save();b.textContent=state.stars.includes(id)?'★':'☆';b.setAttribute('aria-pressed',String(state.stars.includes(id)));b.setAttribute('aria-label',state.stars.includes(id)?'Bỏ đánh dấu':'Đánh dấu ôn lại');}
 if(a==='practice-next'||a==='practice-prev'){practice.page+=a==='practice-next'?1:-1;renderPractice();window.scrollTo({top:0,behavior:'instant'});}
 if(a==='practice-all'){practice={lesson:'all',type:'all',mode:'all',page:0};renderPractice();}
 if(a.startsWith('flash-')){
  const c=flashList()[flash.pos];
  if(a==='flash-flip')flash.flip=!flash.flip;
  if(a==='flash-next'||a==='flash-prev'){flash.pos+=a==='flash-next'?1:-1;flash.flip=false;}
  if(a==='flash-known'||a==='flash-review'){
   if(!c)return;const term=c[0];state.known=state.known.filter(x=>x!==term);state.review=state.review.filter(x=>x!==term);(a==='flash-known'?state.known:state.review).push(term);save();if(flash.mode==='all')flash.pos++;flash.flip=false;
  }
  if(a==='flash-shuffle'){flash.order=flashList().map(g=>g[0]);for(let i=flash.order.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[flash.order[i],flash.order[j]]=[flash.order[j],flash.order[i]];}flash.pos=0;flash.flip=false;}
  renderFlash();
 }
 if(a==='ipa-tab'){ipa.tab=b.dataset.value;ipa.index=0;renderIPA();}
 if(a==='ipa-pick'){ipa.index=Number(b.dataset.value);renderIPA();}
 if(a==='speak'){
  if(!('speechSynthesis'in window)||typeof SpeechSynthesisUtterance==='undefined'){toast('Thiết bị chưa hỗ trợ đọc từ. Bạn vẫn có thể xem từ và IPA.');return;}
  const u=new SpeechSynthesisUtterance(b.dataset.word);u.lang='en-GB';u.rate=.85;const voice=speechSynthesis.getVoices().find(v=>v.lang.toLowerCase()==='en-gb');if(voice)u.voice=voice;u.onerror=()=>toast('Không phát được âm thanh trên thiết bị này.');speechSynthesis.cancel();speechSynthesis.speak(u);toast('Đang đọc từ ví dụ “'+b.dataset.word+'”, không phải âm IPA riêng lẻ.');
 }
 if(a==='random-test'){location.hash='test/'+D.tests[Math.floor(Math.random()*D.tests.length)].id;}
 if(a==='testpick'){
  const q=testQuestion(id),t=ensureTest(testId);if(t.submitted||!q)return;t.answers[id]=q.type==='tf'?b.dataset.value==='true':Number(b.dataset.value);save();document.getElementById('q-'+id).querySelectorAll('.option').forEach(x=>{x.classList.toggle('selected',x===b);x.setAttribute('aria-pressed',String(x===b));});const stats=testStats(currentTest());$('#test-filled').textContent=`Đã trả lời ${stats.filled}/${stats.total} câu tự chấm`;
 }
 if(a==='submit-test'){
  const t=ensureTest(testId),stats=testStats(currentTest());if(t.submitted)return;if(stats.filled<stats.total&&!confirm(`Bạn còn ${stats.total-stats.filled} câu tự chấm chưa trả lời. Nộp bài và tính các câu này là chưa đúng?`))return;t.submitted=true;t.elapsed=Date.now()-t.started;save();renderTest();window.scrollTo({top:0,behavior:'instant'});
 }
 if(a==='reset-test'){if(confirm('Xóa câu trả lời và kết quả của riêng đề này để làm lại? Các phần học khác được giữ nguyên.')){delete state.tests[testId];save();renderTest();toast('Đã làm mới đề này.');}}
 if(a==='review-wrong'){practice={lesson:'all',type:'all',mode:'wrong',page:0};location.hash='practice';}
 if(a==='export'){const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='Ling1_tien_do.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),5000);toast('Đã xuất bản sao dữ liệu tiến độ.');}
});
$('#main').addEventListener('change',e=>{
 const n=e.target;
 if(n.id.startsWith('practice-')){const key=n.id.replace('practice-','');if(['lesson','type','mode'].includes(key)){practice[key]=n.value;practice.page=0;renderPractice();}}
 if(n.id==='flash-group'||n.id==='flash-mode'){flash[n.id.replace('flash-','')]=n.value;flash.pos=0;flash.flip=false;flash.order=null;renderFlash();}
 if(n.dataset.match){const t=ensureTest(testId);if(t.submitted)return;t.answers['match-'+n.dataset.match]=n.value===''?'':Number(n.value);save();const stats=testStats(currentTest());$('#test-filled').textContent=`Đã trả lời ${stats.filled}/${stats.total} câu tự chấm`;}
});
$('#main').addEventListener('input',e=>{
 const n=e.target;
 if(n.id==='gloss-filter'){const pos=n.selectionStart;glossFilter=n.value;renderGlossary();const input=$('#gloss-filter');input.focus();input.setSelectionRange(pos,pos);}
 if(n.dataset.draft){if(n.dataset.mode==='test'){const t=ensureTest(testId);if(!t.submitted){t.answers[n.dataset.draft]=n.value;const stats=testStats(currentTest());$('#test-filled').textContent=`Đã trả lời ${stats.filled}/${stats.total} câu tự chấm`;}}else state.drafts[n.dataset.draft]=n.value;save();}
});
$('#main').addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.matches('input[data-draft][data-mode="practice"]')){e.preventDefault();e.target.parentElement.querySelector('[data-action="checkfill"]')?.click();}});
$('#menu').addEventListener('click',()=>{$('#sidebar').classList.add('open');$('#backdrop').hidden=false;$('#menu').setAttribute('aria-expanded','true');$('.workarea').inert=true;$('#close-menu').focus();});
$('#close-menu').addEventListener('click',()=>{closeMenu();$('#menu').focus();});$('#backdrop').addEventListener('click',closeMenu);
$('#text-size').addEventListener('click',()=>{state.textSize=!state.textSize;document.body.classList.toggle('large-text',state.textSize);save();toast(state.textSize?'Đã tăng cỡ chữ nội dung.':'Đã dùng cỡ chữ tiêu chuẩn.');});
document.body.classList.toggle('large-text',state.textSize);
const searchIndex=[...D.lessons.map(l=>({title:l.title,sub:groups[l.group].title+' · '+l.week,text:l.title+' '+l.lead+' '+l.blocks.map(b=>b.title+' '+strip(b.html)).join(' '),href:'#lesson/'+l.id})),...D.glossary.map(g=>({title:g[0]+' · '+g[1],sub:g[2],text:g.join(' '),href:'#lesson/'+g[3]}))];
$('#search').addEventListener('input',e=>{const query=norm(e.target.value).trim(),out=$('#search-results');if(!query){out.hidden=true;e.target.setAttribute('aria-expanded','false');return;}const terms=query.split(/\s+/);const hits=searchIndex.filter(it=>terms.every(t=>norm(it.text).includes(t))).sort((a,b)=>Number(norm(b.title).includes(query))-Number(norm(a.title).includes(query))).slice(0,9);out.innerHTML=hits.length?hits.map(h=>`<a href="${h.href}">${esc(h.title)}<small>${esc(h.sub)}</small></a>`).join(''):'<p>Chưa tìm thấy. Thử một thuật ngữ ngắn hơn hoặc tiếng Việt không dấu.</p>';out.hidden=false;e.target.setAttribute('aria-expanded','true');});
$('#search-results').addEventListener('click',e=>{if(e.target.closest('a')){$('#search-results').hidden=true;$('#search').value='';$('#search').setAttribute('aria-expanded','false');}});
$('#search').addEventListener('keydown',e=>{if(e.key==='ArrowDown'){$('#search-results a')?.focus();e.preventDefault();}if(e.key==='Enter'){$('#search-results a')?.click();}});
document.addEventListener('click',e=>{if(!e.target.closest('.search')){$('#search-results').hidden=true;$('#search').setAttribute('aria-expanded','false');}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeMenu();$('#search-results').hidden=true;$('#search').setAttribute('aria-expanded','false');}if(e.key==='/'&&!/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)){e.preventDefault();$('#search').focus();}});
window.addEventListener('hashchange',routeTo);
navigation();routeTo();

// Optional agent-facing tools use the same visible actions. Unsupported browsers need nothing.
if(document.modelContext?.registerTool){
 const lifecycle=new AbortController();
 const register=tool=>{try{Promise.resolve(document.modelContext.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{}};
 register({name:'search_learning_content',title:'Tìm kiến thức Ling 1',description:'Search available lessons and glossary. Read-only; does not mark anything complete.',inputSchema:{type:'object',properties:{query:{type:'string'}},required:['query'],additionalProperties:false},annotations:{readOnlyHint:true},execute(input){if(typeof input?.query!=='string'||!input.query.trim())throw Error('query must be a non-empty string');return searchIndex.filter(x=>norm(x.text).includes(norm(input.query))).slice(0,8).map(({title,sub,href})=>({title,summary:sub,href}));}});
 register({name:'open_learning_lesson',title:'Mở bài học',description:'Open a specific lesson in the visible learning interface. Does not mark it complete.',inputSchema:{type:'object',properties:{lesson_id:{type:'string'}},required:['lesson_id'],additionalProperties:false},annotations:{readOnlyHint:false},execute(input){const l=D.lessons.find(l=>l.id===input?.lesson_id);if(!l)throw Error('Unknown lesson_id');history.replaceState(null,'','#lesson/'+l.id);routeTo();return {lesson_id:l.id,title:l.title,opened:true,completed:state.done.includes(l.id)};}});
 window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
}
// Deliberately scoped hooks for deterministic non-browser verification.
window.Ling1Check={grade,termMatch,canonical,getStats:()=>({lessons:D.lessons.length,questions:D.questions.length,glossary:D.glossary.length}),testStats};
})();
