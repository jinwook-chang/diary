'use strict';
const $=id=>document.getElementById(id);
let entries=[],shown=new Date(),loaded=false;
function renderList(){
 const query=$('search').value.trim().toLocaleLowerCase();
 const matches=entries.filter(e=>`${e.date} ${e.title} ${e.text}`.toLocaleLowerCase().includes(query));
 $('list-title').textContent=query?'검색 결과':'전체 글';$('count').textContent=`${matches.length}개의 글`;$('entries').replaceChildren();
 for(const entry of matches){
  const link=document.createElement('a');link.href=`#${entry.date}`;link.className='entry-row';
  const title=document.createElement('span');title.textContent=entry.title;
  const date=document.createElement('time');date.textContent=entry.date.replaceAll('-','.');date.dateTime=entry.date;
  link.append(title,date);$('entries').append(link);
 }
 if(!matches.length){const p=document.createElement('p');p.className='muted empty';p.textContent=query?'검색 결과가 없습니다.':'아직 기록이 없습니다.';$('entries').append(p);}
}
function render(){
 if(!loaded)return;
 const requested=location.hash.slice(1);
 $('list-view').hidden=!!requested;$('detail-view').hidden=!requested;
 if(!requested){document.title='일기장';renderList();renderCalendar();return;}
 const index=entries.findIndex(e=>e.date===requested),entry=entries[index];
 for(const id of ['older','newer','source'])$(id).hidden=true;
 if(!entry){document.title='글을 찾을 수 없습니다 · 일기장';$('date').textContent='';$('title').textContent='글을 찾을 수 없습니다.';$('body').replaceChildren();renderCalendar();return;}
 shown=new Date(`${entry.date}T12:00:00`);renderCalendar();
 $('date').textContent=entry.date.replaceAll('-','.');$('date').dateTime=entry.date;$('title').textContent=entry.title;
 // HTML is generated from author-controlled repository Markdown at build time.
 $('body').innerHTML=entry.html;document.title=`${entry.title} · 일기장`;
 $('source').href=`https://github.com/jinwook-chang/diary/blob/main/entries/${entry.date}.md`;$('source').hidden=false;
 for(const [id,target] of [['older',entries[index+1]],['newer',entries[index-1]]])if(target){$(id).href=`#${target.date}`;$(id).hidden=false;}
}
function renderCalendar(){
 const year=shown.getFullYear(),month=shown.getMonth();
 $('month-label').textContent=`${year}년 ${month+1}월`;$('calendar').replaceChildren();
 for(let i=0;i<new Date(year,month,1).getDay();i++)$('calendar').append(document.createElement('span'));
 const dates=new Set(entries.map(e=>e.date));
 for(let day=1;day<=new Date(year,month+1,0).getDate();day++){
  const key=`${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
  const button=document.createElement('button');button.textContent=day;button.disabled=!dates.has(key);
  button.setAttribute('aria-label',`${key} ${dates.has(key)?'기록 있음':'기록 없음'}`);
  if(dates.has(key))button.classList.add('has-entry');
  if(key===location.hash.slice(1)){button.classList.add('selected');button.setAttribute('aria-current','date');}
  button.onclick=()=>{location.hash=key;};$('calendar').append(button);
 }
}
$('prev').onclick=()=>{shown=new Date(shown.getFullYear(),shown.getMonth()-1,1);renderCalendar();};
$('next').onclick=()=>{shown=new Date(shown.getFullYear(),shown.getMonth()+1,1);renderCalendar();};
$('search').addEventListener('input',()=>{if(location.hash)location.hash='';else if(loaded)renderList();});
$('all-entries').onclick=()=>{$('search').value='';if(!location.hash&&loaded)renderList();};
window.addEventListener('hashchange',()=>{render();window.scrollTo({top:0});});
async function load(){
 renderCalendar();
 try{
  const response=await fetch('entries.json');if(!response.ok)throw Error('load');entries=await response.json();
  entries.sort((a,b)=>b.date.localeCompare(a.date));
  for(const entry of entries){const doc=new DOMParser().parseFromString(entry.html,'text/html');entry.text=doc.body.textContent;}
  loaded=true;render();
 }catch{$('entries').textContent='글을 불러오지 못했습니다. 잠시 후 새로고침해 주세요.';}
}
load();
