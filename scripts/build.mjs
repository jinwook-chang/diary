import {readdir,readFile,mkdir,writeFile,copyFile,rm} from 'node:fs/promises';
import {marked} from 'marked';
await rm('_site',{recursive:true,force:true});
await mkdir('_site/entries',{recursive:true});
const files=(await readdir('entries')).filter(f=>/^\d{4}-\d{2}-\d{2}\.md$/.test(f)).sort().reverse();
const entries=[];
for(const file of files){
 const source=await readFile(`entries/${file}`,'utf8');
 const title=source.match(/^#\s+(.+)$/m)?.[1] || file.slice(0,-3);
 const body=source.replace(/^#\s+.+\r?\n?/m,'').trim();
 entries.push({date:file.slice(0,-3),title,html:marked.parse(body)});
 await copyFile(`entries/${file}`,`_site/entries/${file}`);
}
await writeFile('_site/entries.json',JSON.stringify(entries));
for(const file of ['index.html','style.css','app.js'])await copyFile(file,`_site/${file}`);
console.log(`Built ${entries.length} entries.`);
