/* Argo Tookee Lisensi — fitur tambahan: Laporan, Sales, Cabut Lisensi, Tema, Info, ID Card + kirim WA */
const APP_VER='2.0',APP_DT='18 Oktober 2026';
const FF='Poppins,"Segoe UI",Roboto,Arial,sans-serif';
const rpf=n=>'Rp '+Math.round(n||0).toLocaleString('id-ID');
const fmtL=t=>new Date(t).toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'});
const lsg=(k,d)=>{try{const v=localStorage.getItem(k);return v==null?d:v}catch(e){return d}};
const lss=(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}};
const appName=l=>l.a==='smart'?'Argo Tookee Smart (Petugas)':l.a==='pantau'?'Argo Tookee Pantau (Pemilik)':l.a==='supir'?'Argo Tookee Supir':'Argo Tookee Smart + Pantau';
const appShort=l=>l.a==='smart'?'SMART':l.a==='pantau'?'PANTAU':l.a==='supir'?'SUPIR':'SMART + PANTAU';
const codeFmt=p=>'ATK-'+String(p||'').replace(/(.{4})(?=.)/g,'$1-');
const mKey=t=>{const d=new Date(t);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')};
const mLab=k=>{const [y,m]=k.split('-');return ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'][+m-1]+' '+y.slice(2)};
const last6=()=>{const r=[],d=new Date();d.setDate(1);for(let i=5;i>=0;i--){const x=new Date(d.getFullYear(),d.getMonth()-i,1);r.push(mKey(x))}return r};

/* ---------- tab ---------- */
const TABS=['mk','dl','lp','sa','cb','tm','in','ky'];
function openTab(t){document.querySelectorAll('.tabs button').forEach(x=>x.classList.toggle('on',x.dataset.t===t));TABS.forEach(i=>{const e=$(i);if(e)e.classList.toggle('hide',i!==t)});render();window.scrollTo({top:0,behavior:'smooth'})}
document.querySelectorAll('.tabs button').forEach(b=>b.onclick=()=>openTab(b.dataset.t));

/* ---------- tema ---------- */
const THEMES=[['sawit','Sawit','#14b35a'],['malam','Malam','#f6d55c'],['laut','Laut','#2aa3ff'],['senja','Senja','#ff9a3c'],['anggur','Anggur','#b36bff'],['mawar','Mawar','#ff6b9a'],['kopi','Kopi','#e0b27a'],['putih','Putih','#ffffff'],['krem','Krem','#f6c744']];
function applyTheme(t){if(!THEMES.some(x=>x[0]===t))t='sawit';document.documentElement.setAttribute('data-theme',t);lss('ats_theme',t);
  const m=document.querySelector('meta[name=theme-color]');if(m)m.content=({malam:'#101614',laut:'#09385c',senja:'#5c280e',anggur:'#3c1856',mawar:'#6e1834',kopi:'#422a1c',putih:'#f4f8f5',krem:'#faf3e1'})[t]||'#0b4a24';
  document.querySelectorAll('#thl button').forEach(b=>b.classList.toggle('on',b.dataset.t===t))}
$('thl').innerHTML=THEMES.map(x=>`<button type="button" class="thb" data-t="${x[0]}"><i style="background:${x[2]}"></i>${x[1]}</button>`).join('');
$('thl').onclick=e=>{const b=e.target.closest('button');if(b)applyTheme(b.dataset.t)};
applyTheme(lsg('ats_theme','sawit'));

/* ---------- QR + ID Card ---------- */
const WA=()=>String(lsg('ats_wa','6285831051763')).replace(/\D/g,'');
function qrText(l){const v=String(lsg('ats_vurl','')).trim();
  if(v)return v+(v.includes('?')?'&':'?')+'kode='+encodeURIComponent(l.p);
  return 'https://wa.me/'+WA()+'?text='+encodeURIComponent('Verifikasi lisensi '+codeFmt(l.p)+(l.n?' a.n. '+l.n:''))}
let _tpl=null;
const loadTpl=()=>_tpl||(_tpl=new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=()=>{_tpl=null;rej(new Error('Template kartu (kartu-template.jpg) tidak ditemukan'))};i.src='kartu-template.jpg?v=1'}));
async function makeCard(l){
  const img=await loadTpl();try{await Promise.all([document.fonts.load('600 30px Poppins'),document.fonts.load('700 30px Poppins'),document.fonts.load('800 30px Poppins')])}catch(e){}
  const W=img.naturalWidth,H=img.naturalHeight,c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');x.drawImage(img,0,0);
  const strip=(sx,sw,y,h,dx,dw)=>x.drawImage(img,sx,y,sw,h,dx,y,dw,h);
  const fit=(t,maxW,size,wt,style)=>{let s=size;do{x.font=(style||'')+' '+wt+' '+s+'px '+FF;if(x.measureText(t).width<=maxW)break;s-=1}while(s>14);return s};
  const status=l.rev?'Dicabut':(l.e&&l.e<Date.now())?'Kedaluwarsa':'Aktif';
  const sc=status==='Aktif'?'#1a7a2a':status==='Dicabut'?'#c0392b':'#b7791f';
  /* kepala: nama aplikasi */
  if(l.a!=='smart'){
    strip(772,6,213,64,404,376);
    const t=appShort(l);fit(t,335,76,800,'italic');const g=x.createLinearGradient(0,212,0,276);g.addColorStop(0,'#0f5f2e');g.addColorStop(1,'#0a3a1c');
    x.fillStyle=g;x.textBaseline='middle';x.textAlign='left';x.fillText(t,414,243);
    strip(684,4,822,52,522,164);
    const w=appShort(l);x.font='800 44px '+FF;const mw=x.measureText(w).width,mx=150;x.fillStyle='#fff';x.textBaseline='middle';x.textAlign='left';
    x.save();x.translate(530,847);if(mw>mx)x.scale(mx/mw,1);x.fillText(w,0,0);x.restore();
  }
  /* isi data */
  strip(462,6,350,350,476,664);strip(462,6,700,70,476,586);
  x.textBaseline='middle';x.textAlign='left';x.fillStyle='#0b3b21';
  const row=(t,y,size,wt,max,ls)=>{x.letterSpacing=ls||'0px';const s=fit(t,max||640,size,wt);x.font=wt+' '+s+'px '+FF;x.fillText(t,486,y);const w=x.measureText(t).width;x.letterSpacing='0px';return w};
  row((l.co||('ARGO TOOKEE '+appShort(l))).toUpperCase(),378,34,700);
  row(l.n||'-',438,42,600);
  row(l.ad||'-',510,34,600);
  row(codeFmt(l.p),590,36,700,640,'2px');
  row(fmtL(l.i||Date.now())+' – '+(l.e?fmtL(l.e):'Selamanya'),653,32,600);
  x.fillStyle=sc;const sw=row(status,733,38,700);x.fillStyle=sc;
  const cx=486+sw+40,cy=733;x.beginPath();x.arc(cx,cy,22,0,7);x.fill();x.strokeStyle='#fff';x.lineWidth=5;x.lineCap='round';x.lineJoin='round';x.beginPath();
  if(status==='Aktif'){x.moveTo(cx-10,cy+1);x.lineTo(cx-3,cy+9);x.lineTo(cx+11,cy-8)}else if(status==='Dicabut'){x.moveTo(cx-9,cy-9);x.lineTo(cx+9,cy+9);x.moveTo(cx+9,cy-9);x.lineTo(cx-9,cy+9)}else{x.moveTo(cx,cy-11);x.lineTo(cx,cy+3);x.moveTo(cx,cy+10);x.lineTo(cx,cy+10.5)}x.stroke();
  /* QR */
  x.fillStyle='#fff';x.fillRect(1154,360,262,258);
  const q=QR.make(qrText(l),'M'),n=q.size,m=Math.max(2,Math.floor(240/(n+2))),tot=m*n,ox=1285-Math.round(tot/2),oy=489-Math.round(tot/2);
  x.fillStyle='#0a0a0a';for(let yy=0;yy<n;yy++)for(let xx=0;xx<n;xx++)if(q.get(xx,yy))x.fillRect(ox+xx*m,oy+yy*m,m,m);
  /* lencana */
  if(status!=='Aktif'){
    const px=972,py=810,pw=270,ph=82,r=41;x.beginPath();x.moveTo(px+r,py);x.arcTo(px+pw,py,px+pw,py+ph,r);x.arcTo(px+pw,py+ph,px,py+ph,r);x.arcTo(px,py+ph,px,py,r);x.arcTo(px,py,px+pw,py,r);x.closePath();
    x.fillStyle=status==='Dicabut'?'#7d1d12':'#6b4c06';x.fill();x.lineWidth=5;x.strokeStyle='#f2c230';x.stroke();
    x.fillStyle='#ffe7a1';x.textAlign='center';x.textBaseline='middle';const t=status==='Dicabut'?'DICABUT':'KEDALUWARSA';fit(t,pw-60,36,800);x.fillText(t,px+pw/2,py+ph/2+2);x.textAlign='left';
  }
  return c;
}
const cardCache={};
async function cardFile(l){const key=[l.p,l.n,l.co,l.ad,l.e,l.i,l.rev,l.a,Math.floor(Date.now()/36e5)].join('|');
  if(cardCache[key])return cardCache[key];const c=await makeCard(l);
  const blob=await new Promise(r=>c.toBlob(r,'image/jpeg',.92));const f={blob,url:c.toDataURL('image/jpeg',.9),name:'ID-Card-Lisensi-'+l.p+'.jpg'};cardCache[key]=f;return f}
const dl=(blob,name)=>{const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},2000)};
function waText(l){return 'Halo '+(l.n||'')+', terima kasih telah menggunakan Argo Tookee.\n\nBerikut lisensi '+appName(l)+' Anda. ID Card lisensi terlampir pada pesan ini.\n\nKODE LISENSI (salin seluruhnya):\n'+l.token+'\n\nPassword awal login: '+l.p+(l.g?'\nKode Grup: '+l.g:'')+'\nMasa berlaku: '+(l.e?fmtL(l.e):'Selamanya')+'\n'+(l.d?'Lisensi ini terikat pada satu HP.':'Lisensi ini bebas HP.')+'\n\nCara aktivasi: buka aplikasi, tempel kode lisensi di halaman Aktivasi, lalu login dengan password awal.'}
function waLink(l,text){const hp=String(l.hp||'').replace(/\D/g,'').replace(/^0/,'62');return 'https://wa.me/'+hp+'?text='+encodeURIComponent(text)}
async function kirimKartu(l){
  let f;try{f=await cardFile(l)}catch(e){return alert('Gagal membuat ID Card: '+e.message)}
  const file=new File([f.blob],f.name,{type:'image/jpeg'}),text=waText(l);
  if(navigator.canShare&&navigator.canShare({files:[file]})){try{await navigator.share({files:[file],text,title:'Lisensi Argo Tookee'});return}catch(e){if(e&&e.name==='AbortError')return}}
  dl(f.blob,f.name);window.open(waLink(l,text),'_blank');
  alert('ID Card sudah diunduh. Di WhatsApp yang terbuka, tekan lampiran lalu pilih gambar '+f.name+' untuk dikirim bersama pesan.')}
async function simpanKartu(l){try{const f=await cardFile(l);dl(f.blob,f.name)}catch(e){alert('Gagal membuat ID Card: '+e.message)}}
window.kartu=async p=>{const l=D.lic.find(x=>x.p===p);if(!l)return;$('kv').classList.remove('hide');$('kvi').src='';$('kvt').textContent='Membuat ID Card…';
  try{const f=await cardFile(l);$('kvi').src=f.url;$('kvt').textContent=(l.n||'Pembeli')+' · '+codeFmt(l.p)}catch(e){$('kvt').textContent='Gagal: '+e.message}
  $('kvw').onclick=()=>kirimKartu(l);$('kvs').onclick=()=>simpanKartu(l);$('kvc').onclick=()=>$('kv').classList.add('hide')};

/* hasil pembuatan: tombol ID Card */
const _showRes=showRes;
showRes=function(l,msg){_showRes(l,msg);const w=$('rcw');if(w){w.classList.remove('hide');$('rimg').src='';cardFile(l).then(f=>{$('rimg').src=f.url}).catch(()=>{});$('rwc').onclick=()=>kirimKartu(l);$('rsc').onclick=()=>simpanKartu(l)}};

/* ubah data pembeli */
window.ubah=p=>{const l=D.lic.find(x=>x.p===p);if(!l)return;
  const co=prompt('Nama perusahaan / usaha (untuk ID Card)',l.co||'');if(co===null)return;
  const ad=prompt('Alamat',l.ad||'');if(ad===null)return;
  const pr=prompt('Harga (Rp)',l.pr||'');if(pr===null)return;
  const sl=prompt('Nama sales / penjual',l.sl||'');if(sl===null)return;
  l.co=co.trim();l.ad=ad.trim();l.pr=+String(pr).replace(/\D/g,'')||0;l.sl=sl.trim();save()};
window.cabut=p=>{const l=D.lic.find(x=>x.p===p);if(!l)return;
  if(!l.rev&&!confirm('Cabut lisensi '+codeFmt(p)+' milik '+(l.n||'pembeli')+'?\n\nAplikasi di HP pembeli akan terkunci dan kembali ke halaman lisensi.'))return;rv(p)};

/* ---------- render tambahan ---------- */
const _render=render;
render=function(){_render();try{extra()}catch(e){console.error(e)}};
function extra(){
  const L=D.lic,now=Date.now();
  /* daftar: info + tombol */
  document.querySelectorAll('#list .it').forEach(it=>{const sp=it.querySelector('.code');if(!sp)return;const p=sp.textContent.trim(),l=L.find(x=>x.p===p);if(!l)return;
    if(!it.querySelector('.xi')){const m=it.querySelector('.m');if(m&&(l.co||l.ad||l.pr||l.sl))m.insertAdjacentHTML('beforeend','<br><span class="xi">'+[l.co&&esc(l.co),l.pr?rpf(l.pr):'',l.sl&&'Sales: '+esc(l.sl)].filter(Boolean).join(' · ')+'</span>')}
    if(!it.querySelector('.xk')){const last=it.querySelector('button.s:last-child');const h='<button class="s xk" onclick="kartu(\''+p+'\')">ID Card</button><button class="s" onclick="ubah(\''+p+'\')">Ubah data</button>';if(last)last.insertAdjacentHTML('beforebegin',h)}});
  /* sales datalist */
  const names=[...new Set(L.map(l=>l.sl).filter(Boolean))];$('slList').innerHTML=names.map(n=>'<option value="'+esc(n)+'">').join('');
  /* cabut lisensi */
  const cq=($('cq').value||'').toLowerCase();
  $('cbl').innerHTML=L.filter(l=>(l.p+(l.n||'')+(l.hp||'')+(l.co||'')).toLowerCase().includes(cq)).map(l=>{const s=st(l);return'<div class="it"><div class="rowb"><div><span class="code">'+l.p+'</span><span class="tag '+s[1]+'">'+s[0]+'</span><div class="m">'+(esc(l.n)||'<i>tanpa nama</i>')+' · '+esc(appShort(l))+' · s/d '+fmt(l.e)+'</div></div><button class="s cbb'+(l.rev?' ok':'')+'" onclick="cabut(\''+l.p+'\')">'+(l.rev?'Pulihkan':'Cabut')+'</button></div></div>'}).join('')||'<p class="note">Belum ada lisensi.</p>';
  /* laporan */
  const per=$('lpp').value,from=per==='bln'?new Date(new Date().getFullYear(),new Date().getMonth(),1).getTime():per==='30'?now-30*864e5:per==='thn'?new Date(new Date().getFullYear(),0,1).getTime():0;
  const inP=L.filter(l=>(l.i||0)>=from),act=L.filter(l=>st(l)[0]==='Aktif'),soon=L.filter(l=>!l.rev&&l.e&&l.e>=now&&l.e-now<=14*864e5).sort((a,b)=>a.e-b.e);
  const cnt=a=>L.filter(l=>l.a===a).length,rev=inP.reduce((s,l)=>s+(+l.pr||0),0);
  $('lpk').innerHTML=[['Dibuat',inP.length],['Aktif',act.length],['Segera berakhir',soon.length],['Kedaluwarsa',L.filter(l=>st(l)[0]==='Kedaluwarsa').length],['Dicabut',L.filter(l=>l.rev).length],['Pendapatan',rpf(rev)]].map(a=>'<div><b>'+a[1]+'</b>'+a[0]+'</div>').join('');
  $('lpa').innerHTML=[['Smart (Petugas)',cnt('smart')],['Pantau (Pemilik)',cnt('pantau')],['Supir',cnt('supir')],['Gabungan',cnt('')]].map(a=>'<div class="rowb"><span>'+a[0]+'</span><b>'+a[1]+'</b></div>').join('');
  const ms=last6(),mc=ms.map(k=>L.filter(l=>l.i&&mKey(l.i)===k).length),mx=Math.max(1,...mc);
  $('lpm').innerHTML=ms.map((k,i)=>'<div class="col"><span>'+mc[i]+'</span><i style="height:'+Math.round(mc[i]/mx*90+4)+'px"></i><em>'+mLab(k)+'</em></div>').join('');
  $('lps').innerHTML=soon.map(l=>{const d=Math.ceil((l.e-now)/864e5);return'<div class="it"><div class="rowb"><div><span class="code">'+l.p+'</span><div class="m">'+(esc(l.n)||'-')+' · berakhir '+fmt(l.e)+' ('+d+' hari)</div></div><button class="s" onclick="ingat(\''+l.p+'\')">Ingatkan WA</button></div></div>'}).join('')||'<p class="note">Tidak ada lisensi yang berakhir dalam 14 hari.</p>';
  /* sales */
  const sold=L.filter(l=>+l.pr>0),tot=sold.reduce((s,l)=>s+l.pr,0),thisM=sold.filter(l=>mKey(l.i||0)===mKey(now)).reduce((s,l)=>s+l.pr,0);
  $('slk').innerHTML=[['Total penjualan',rpf(tot)],['Bulan ini',rpf(thisM)],['Transaksi',sold.length],['Rata-rata',rpf(sold.length?tot/sold.length:0)]].map(a=>'<div><b>'+a[1]+'</b>'+a[0]+'</div>').join('');
  const by={};sold.forEach(l=>{const k=l.sl||'(tanpa sales)';by[k]=by[k]||{n:0,t:0};by[k].n++;by[k].t+=l.pr});
  const bk=Object.keys(by).sort((a,b)=>by[b].t-by[a].t),bm=Math.max(1,...bk.map(k=>by[k].t));
  $('slb').innerHTML=bk.map(k=>'<div class="it"><div class="rowb"><b>'+esc(k)+'</b><span>'+rpf(by[k].t)+' · '+by[k].n+' lisensi</span></div><div class="pb"><i style="width:'+Math.round(by[k].t/bm*100)+'%"></i></div></div>').join('')||'<p class="note">Belum ada penjualan. Isi kolom Harga dan Sales saat membuat lisensi, atau lewat tombol Ubah data di tab Daftar.</p>';
  const sm=last6().map(k=>[k,sold.filter(l=>mKey(l.i||0)===k).reduce((s,l)=>s+l.pr,0)]),smx=Math.max(1,...sm.map(a=>a[1]));
  $('slm').innerHTML=sm.map(a=>'<div class="col"><span>'+(a[1]?(a[1]>=1e6?(a[1]/1e6).toFixed(1).replace('.0','')+'jt':Math.round(a[1]/1e3)+'rb'):'0')+'</span><i style="height:'+Math.round(a[1]/smx*90+4)+'px"></i><em>'+mLab(a[0])+'</em></div>').join('');
  $('sll').innerHTML=sold.slice(0,30).map(l=>'<div class="it"><div class="rowb"><div><span class="code">'+l.p+'</span><div class="m">'+(esc(l.n)||'-')+' · '+fmt(l.i)+(l.sl?' · '+esc(l.sl):'')+'</div></div><b>'+rpf(l.pr)+'</b></div></div>').join('');
  /* info */
  let kunci='Belum ada kunci pribadi';try{const j=JSON.parse(localStorage.getItem(KP)||'null');if(j)kunci=(j.x===APP_PUBKEY.x&&j.y===APP_PUBKEY.y)?'✓ Cocok dengan aplikasi':'✗ Tidak cocok dengan aplikasi'}catch(e){}
  $('inf').innerHTML=[['Versi',APP_VER+' ('+APP_DT+')'],['Kunci tanda tangan',kunci],['Firebase',fbu()?fbu().replace('https://',''):'Belum diisi'],['Jumlah lisensi',L.length],['Terpasang sebagai aplikasi',matchMedia('(display-mode: standalone)').matches?'Ya':'Belum (menu browser → Instal aplikasi)'],['Koneksi aman (https)',window.isSecureContext?'Ya':'Tidak, lisensi tidak bisa ditandatangani']].map(a=>'<div class="rowb"><span>'+a[0]+'</span><b>'+a[1]+'</b></div>').join('');
}
['cq','lpp'].forEach(i=>{$(i).oninput=render;$(i).onchange=render});
window.ingat=p=>{const l=D.lic.find(x=>x.p===p);if(!l)return;const d=Math.max(0,Math.ceil((l.e-Date.now())/864e5));
  window.open(waLink(l,'Halo '+(l.n||'')+', lisensi '+appName(l)+' Anda akan berakhir pada '+fmtL(l.e)+' ('+d+' hari lagi). Hubungi kami bila ingin memperpanjang agar aplikasi tetap bisa dipakai. Terima kasih.'),'_blank')};

/* laporan: ekspor */
function csvRows(){const q=v=>'"'+String(v==null?'':v).replace(/"/g,'""')+'"';
  const head=['Kode','Nama','WhatsApp','Perusahaan','Alamat','Aplikasi','Kode Grup','ID Perangkat','Dibuat','Berlaku sampai','Status','Harga','Sales'];
  return [head].concat(D.lic.map(l=>[l.p,l.n,l.hp,l.co,l.ad,appName(l),l.g,l.d,l.i?new Date(l.i).toISOString().slice(0,10):'',l.e?new Date(l.e).toISOString().slice(0,10):'Selamanya',st(l)[0],l.pr||0,l.sl])).map(r=>r.map(q).join(',')).join('\r\n')}
$('lpx').onclick=()=>dl(new Blob(['﻿'+csvRows()],{type:'text/csv;charset=utf-8'}),'laporan-lisensi-'+new Date().toISOString().slice(0,10)+'.csv');
$('lpc').onclick=()=>{const L=D.lic,now=Date.now(),act=L.filter(l=>st(l)[0]==='Aktif').length,rev=L.filter(l=>l.rev).length,ex=L.filter(l=>st(l)[0]==='Kedaluwarsa').length,tot=L.reduce((s,l)=>s+(+l.pr||0),0);
  const t='LAPORAN LISENSI ARGO TOOKEE\n'+fmtL(now)+'\n\nTotal lisensi: '+L.length+'\nAktif: '+act+'\nKedaluwarsa: '+ex+'\nDicabut: '+rev+'\nTotal penjualan: '+rpf(tot);
  navigator.clipboard.writeText(t).then(()=>alert('Ringkasan disalin. Tempel di WhatsApp.'),()=>prompt('Salin ringkasan ini:',t))};
$('lpw').onclick=()=>{const L=D.lic,act=L.filter(l=>st(l)[0]==='Aktif').length;window.open('https://wa.me/?text='+encodeURIComponent('LAPORAN LISENSI ARGO TOOKEE\n'+fmtL(Date.now())+'\nTotal: '+L.length+' · Aktif: '+act+' · Dicabut: '+L.filter(l=>l.rev).length+'\nPenjualan: '+rpf(L.reduce((s,l)=>s+(+l.pr||0),0))),'_blank')};
$('lpp2').onclick=()=>window.print();

/* info: pengaturan + pembaruan */
$('iwa').value=lsg('ats_wa','6285831051763');$('ivu').value=lsg('ats_vurl','');
$('iss').onclick=()=>{const w=$('iwa').value.replace(/\D/g,''),v=$('ivu').value.trim();if(v&&!/^https:\/\//.test(v))return alert('Alamat verifikasi harus diawali https://');lss('ats_wa',w||'6285831051763');lss('ats_vurl',v);cardCacheClear();alert('Tersimpan. ID Card berikutnya memakai pengaturan ini.')};
function cardCacheClear(){for(const k in cardCache)delete cardCache[k]}
$('iup').onclick=async()=>{try{const rs=await navigator.serviceWorker.getRegistrations();for(const r of rs)await r.unregister();const ks=await caches.keys();for(const k of ks)await caches.delete(k)}catch(e){}location.reload()};
$('ifb').onclick=()=>openTab('ky');
render();
