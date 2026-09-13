'use strict';
const $ = id => document.getElementById(id);
const KEY = 'sai-diary-v1';
const moods = [['happy','☀','좋아요'],['calm','☘','평온해요'],['ordinary','◡','그저 그래요'],['sad','☂','울적해요'],['tired','☾','지쳤어요']];
const dateKey = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const parseDate = key => new Date(`${key}T12:00:00`);
const validDate = key => /^\d{4}-\d{2}-\d{2}$/.test(key) && !isNaN(parseDate(key)) && dateKey(parseDate(key)) === key;
function validate(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw Error('형식');
  const clean = {};
  for (const [key, item] of Object.entries(data)) {
    if (!validDate(key) || !item || typeof item.title !== 'string' || typeof item.body !== 'string' || !['',...moods.map(m=>m[0])].includes(item.mood)) throw Error('형식');
    clean[key] = {title:item.title.slice(0,160),body:item.body,mood:item.mood};
  }
  return clean;
}
let entries = {}, storageReady = true;
try { const raw = localStorage.getItem(KEY); if (raw) entries = validate(JSON.parse(raw)); }
catch { storageReady=false; }
let selected = dateKey(new Date()), shown = parseDate(selected), mood = '', toastTimer;
function toast(message) { $('toast').textContent=message; $('toast').hidden=false; clearTimeout(toastTimer); toastTimer=setTimeout(()=>$('toast').hidden=true,4500); }
function persist(next) {
  if (!storageReady) { $('save-state').textContent='저장 불가 · 백업을 내보내 주세요'; return false; }
  try { localStorage.setItem(KEY,JSON.stringify(next)); $('save-state').textContent='저장됨'; return true; }
  catch { $('save-state').textContent='저장 실패 · 백업을 내보내 주세요'; return false; }
}
function save() {
  const item={title:$('title').value,body:$('body').value,mood};
  if (item.title.trim() || item.body.trim() || item.mood) entries[selected]=item;
  else delete entries[selected];
  persist(entries); renderCalendar(); renderEntries(); updateCount();
}
function updateCount() { $('word-count').textContent=`${$('body').value.length.toLocaleString()}자`; $('delete').disabled=!entries[selected]; }
function renderMoods() {
  $('moods').replaceChildren();
  for (const [id,icon,label] of moods) {
    const button=document.createElement('button'); button.textContent=`${icon} ${label}`; button.setAttribute('aria-pressed',String(mood===id));
    button.onclick=()=>{mood=mood===id?'':id;renderMoods();save();}; $('moods').append(button);
  }
}
function select(key) {
  selected=key; shown=parseDate(key);
  const entry=entries[key] || {title:'',body:'',mood:''};
  $('title').value=entry.title; $('body').value=entry.body; mood=entry.mood;
  $('date-heading').textContent=new Intl.DateTimeFormat('ko-KR',{year:'numeric',month:'long',day:'numeric',weekday:'long'}).format(shown);
  $('save-state').textContent=storageReady?(entries[key]?'저장됨':''):'저장 불가 · 백업을 확인해 주세요';
  renderMoods();renderCalendar();renderEntries();updateCount();
}
function renderCalendar() {
  $('month-label').textContent=`${shown.getFullYear()}년 ${shown.getMonth()+1}월`;
  $('calendar').replaceChildren();
  const year=shown.getFullYear(),month=shown.getMonth();
  for(let i=0;i<new Date(year,month,1).getDay();i++) $('calendar').append(document.createElement('span'));
  for(let day=1;day<=new Date(year,month+1,0).getDate();day++) {
    const key=dateKey(new Date(year,month,day)),button=document.createElement('button');
    button.textContent=day;button.setAttribute('aria-label',`${key}${entries[key]?' 기록 있음':''}`);button.setAttribute('aria-pressed',String(key===selected));
    if(key===selected)button.classList.add('selected'); if(key===dateKey(new Date()))button.classList.add('current');if(entries[key])button.classList.add('has-entry');
    button.onclick=()=>{select(key);$('archive-dialog').close();};$('calendar').append(button);
  }
}
function renderEntries() {
  const query=$('search').value.trim().toLowerCase();
  const keys=Object.keys(entries).sort().reverse().filter(key=>`${entries[key].title} ${entries[key].body} ${key}`.toLowerCase().includes(query));
  $('entry-count').textContent=Object.keys(entries).length;$('entries').replaceChildren();
  if(!keys.length) { const p=document.createElement('p');p.className='empty';p.textContent=query?'찾는 기록이 아직 없어요.':'아직 기록이 없어요.';$('entries').append(p); }
  for(const key of keys) {
    const button=document.createElement('button');button.className=`entry-link${key===selected?' active':''}`;
    const small=document.createElement('small');small.textContent=`${key.replaceAll('-','.')}  ${moods.find(m=>m[0]===entries[key].mood)?.[1]||''}`;
    const strong=document.createElement('strong');strong.textContent=entries[key].title || entries[key].body.trim().split('\n')[0] || '마음을 기록한 하루';
    button.append(small,strong);button.onclick=()=>{select(key);$('archive-dialog').close();};$('entries').append(button);
  }
}
$('title').addEventListener('input',save);$('body').addEventListener('input',save);$('search').addEventListener('input',renderEntries);
$('prev').onclick=()=>{shown=new Date(shown.getFullYear(),shown.getMonth()-1,1);renderCalendar();};
$('next').onclick=()=>{shown=new Date(shown.getFullYear(),shown.getMonth()+1,1);renderCalendar();};
$('today').onclick=()=>{$('archive-dialog').close();select(dateKey(new Date()));$('title').focus();$('title').scrollIntoView({behavior:'smooth',block:'center'});};
$('delete').onclick=()=>$('confirm-dialog').showModal();
$('confirm-dialog').addEventListener('close',()=>{if($('confirm-dialog').returnValue==='delete'){const next={...entries};delete next[selected];if(persist(next)){entries=next;select(selected);toast('기록을 삭제했어요.');}else toast('저장소에 접근할 수 없어 삭제하지 못했어요.');}});
$('export').onclick=()=>{
  const url=URL.createObjectURL(new Blob([JSON.stringify({version:1,entries},null,2)],{type:'application/json'}));
  const a=document.createElement('a');a.href=url;a.download=`sai-diary-${dateKey(new Date())}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('백업 파일을 내보냈어요.');
};
$('import').onclick=()=>$('import-file').click();
$('import-file').onchange=async event=>{
  const file=event.target.files[0];if(!file)return;
  try {
    if(file.size>10*1024*1024)throw Error('크기');
    const data=JSON.parse(await file.text());if(data.version!==1)throw Error('버전');
    const imported=validate(data.entries),next={...imported,...entries};
    if(!persist(next))throw Error('저장');
    entries=next;select(selected);toast('백업을 불러왔어요. 같은 날짜의 기존 기록은 유지했어요.');
  } catch {toast('불러오지 못했어요. 백업 형식과 브라우저 저장 공간을 확인해 주세요.');}
  event.target.value='';
};
window.addEventListener('storage',event=>{if(event.key===KEY){try{entries=event.newValue?validate(JSON.parse(event.newValue)):{};select(selected);toast('다른 탭에서 바뀐 기록을 반영했어요.');}catch{toast('다른 탭의 데이터를 읽지 못했어요.');}}});
select(selected);
if(!storageReady)toast('저장된 데이터를 읽지 못했어요. 기존 데이터는 덮어쓰지 않습니다.');

$('open-archive').onclick=()=>$('archive-dialog').showModal();
$('close-archive').onclick=()=>$('archive-dialog').close();
