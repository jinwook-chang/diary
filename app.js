'use strict';
const $=id=>document.getElementById(id);
let entries=[];
$('open-archive').onclick=()=>$('archive').showModal();
$('close-archive').onclick=()=>$('archive').close();
function render(){
 const requested=location.hash.slice(1);
 const index=requested?entries.findIndex(e=>e.date===requested):0;
 const entry=entries[index];
 for(const id of ['older','newer','source'])$(id).hidden=true;
 if(!entry){$('date').textContent='';$('title').textContent=requested?'글을 찾을 수 없습니다.':'아직 기록이 없습니다.';$('body').replaceChildren();return;}
 $('date').textContent=entry.date.replaceAll('-','.');$('date').dateTime=entry.date;
 $('title').textContent=entry.title;
 // HTML is generated at build time from this repository's author-controlled Markdown.
 $('body').innerHTML=entry.html;
 document.title=`${entry.title} · 사이`;
 $('source').href=`https://github.com/jinwook-chang/diary/blob/main/entries/${entry.date}.md`;$('source').hidden=false;
 for(const [id,target] of [['older',entries[index+1]],['newer',entries[index-1]]])if(target){$(id).href=`#${target.date}`;$(id).hidden=false;}
 for(const a of $('entries').querySelectorAll('a')){if(a.hash===`#${entry.date}`)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');}
}
async function load(){
 try{
  const response=await fetch('entries.json');if(!response.ok)throw Error('load');
  entries=await response.json();
  for(const entry of entries){
   const link=document.createElement('a');link.href=`#${entry.date}`;
   const date=document.createElement('time');date.textContent=entry.date.replaceAll('-','.');
   const title=document.createElement('span');title.textContent=entry.title;
   link.append(date,title);link.onclick=()=>{$('archive').close();};$('entries').append(link);
  }
  render();
 }catch{$('body').textContent='글을 불러오지 못했습니다. 잠시 후 새로고침해 주세요.';}
}
window.addEventListener('hashchange',()=>{render();window.scrollTo({top:0});});
load();
