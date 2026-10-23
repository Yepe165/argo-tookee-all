/* Login admin (email + kata sandi) — akun disimpan di perangkat ini, sandi di-hash PBKDF2 */
(function(){
const $=id=>document.getElementById(id),AK='ats_auth',ST='ats_sess_t',FL='ats_lgfail',IDLE=8*36e5,KP_='ats_priv_jwk';
const b64=b=>btoa(String.fromCharCode.apply(null,new Uint8Array(b))),ub=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
const lg=k=>{try{return localStorage.getItem(k)}catch(e){return null}},ls=(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}},ld=k=>{try{localStorage.removeItem(k)}catch(e){}};
const IT=150000;
async function hash(pw,salt,it){const k=await crypto.subtle.importKey('raw',new TextEncoder().encode(pw),'PBKDF2',false,['deriveBits']);return b64(await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt,iterations:it},k,256))}
const acct=()=>{try{return JSON.parse(lg(AK)||'null')}catch(e){return null}};
let mode=acct()?'login':'setup';
const msg=(t,ok)=>{const m=$('lgm');m.textContent=t||'';m.className='lgm'+(ok?' ok':'')};
function setMode(m){mode=m;msg('');
  const setup=m==='setup',reset=m==='reset';
  $('lgk').classList.toggle('hide',!reset);
  $('lgt').textContent=setup?'BUAT AKUN ADMIN':reset?'ATUR ULANG':'LOGIN ADMIN';
  $('lgp').innerHTML=setup?'Buat email dan kata sandi admin<br>untuk perangkat ini':reset?'Tempel kunci pribadi untuk membuktikan<br>Anda admin, lalu buat sandi baru':'Panel Administrasi Lisensi<br>Argo Tookee Lisensi';
  $('lgbt').textContent=setup?'SIMPAN & MASUK':reset?'SIMPAN SANDI BARU':'MASUK KE DASHBOARD';
  $('lgl').textContent=reset?'Kembali ke login':'Lupa kata sandi?';$('lgl').style.display=setup?'none':'';
  $('lgw').autocomplete=(setup||reset)?'new-password':'current-password';
  if(reset&&acct())$('lge').value=acct().e;}
function unlock(){ls(ST,String(Date.now()));document.documentElement.classList.add('ok');['lgw','lgk'].forEach(i=>$(i).value='');try{render();window.scrollTo(0,0)}catch(e){}}
function lockNow(){ld(ST);location.reload()}
const emailOk=e=>/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
async function submit(ev){ev.preventDefault();msg('');
  if(!(window.crypto&&crypto.subtle))return msg('Buka lewat alamat https agar login bisa dipakai.');
  const e=$('lge').value.trim().toLowerCase(),pw=$('lgw').value,btn=$('lgg');
  if(!emailOk(e))return msg('Isi email admin yang benar.');
  if(!pw)return msg('Isi kata sandi.');
  if(mode==='login'){
    let f={};try{f=JSON.parse(lg(FL)||'{}')}catch(x){}
    if(f.u&&Date.now()<f.u)return msg('Terlalu banyak percobaan. Coba lagi '+Math.ceil((f.u-Date.now())/1000)+' detik lagi.');
    const a=acct();if(!a){setMode('setup');return}
    btn.disabled=true;let ok=false;try{ok=e===a.e&&(await hash(pw,ub(a.s),a.it))===a.h}catch(x){}btn.disabled=false;
    if(ok){ld(FL);return unlock()}
    f.n=(f.n||0)+1;if(f.n>=5){f.u=Date.now()+60000;f.n=0}ls(FL,JSON.stringify(f));return msg('Email atau kata sandi salah.')}
  if(pw.length<6)return msg('Kata sandi minimal 6 karakter.');
  if(mode==='reset'){
    try{const j=JSON.parse($('lgk').value.trim());if(j.kty!=='EC'||!j.d)throw 0;
      const own=JSON.parse(lg(KP_)||'null');const pub=typeof APP_PUBKEY!=='undefined'?APP_PUBKEY:null;
      const match=own?own.d===j.d:(pub&&j.x===pub.x&&j.y===pub.y);if(!match)return msg('Kunci pribadi tidak cocok.')}
    catch(x){return msg('Kunci pribadi tidak valid. Tempel seluruh teks JSON.')}}
  btn.disabled=true;try{const salt=crypto.getRandomValues(new Uint8Array(16));ls(AK,JSON.stringify({e,s:b64(salt),it:IT,h:await hash(pw,salt,IT)}))}catch(x){btn.disabled=false;return msg('Gagal menyimpan akun.')}
  btn.disabled=false;ld(FL);unlock()}
$('lgf').onsubmit=submit;
$('lgy').onclick=()=>{const c=$('lgc');c.checked=!c.checked;c.dispatchEvent(new Event('change'))};
$('lgc').onchange=()=>{const t=$('lgc').checked?'text':'password';$('lgw').type=t};
$('lgl').onclick=ev=>{ev.preventDefault();setMode(mode==='reset'?'login':'reset')};
setMode(mode);
/* sesi: tutup otomatis bila tidak aktif */
let lastT=Date.now();
const touch=()=>{const n=Date.now();if(n-lastT>20000&&document.documentElement.classList.contains('ok')){lastT=n;ls(ST,String(n))}};
['pointerdown','keydown','scroll'].forEach(t=>addEventListener(t,touch,{passive:true}));
const chk=()=>{if(!document.documentElement.classList.contains('ok'))return;const t=+lg(ST)||0;if(!t||Date.now()-t>IDLE)lockNow()};
setInterval(chk,30000);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')chk()});
/* kartu akun di tab Info */
const a=acct();
const inf=$('in');if(inf)inf.insertAdjacentHTML('beforeend','<div class="card"><b>Akun admin</b><p class="note" id="lga"></p><input id="ae" type="email" placeholder="Email admin baru"><input id="ao" type="password" placeholder="Kata sandi saat ini"><input id="an" type="password" placeholder="Kata sandi baru (min. 6 karakter)"><button class="b" id="asv">Simpan perubahan</button><button class="b" id="lgo" style="background:var(--glass-in);box-shadow:none">Keluar</button></div>');
const showA=()=>{const x=acct();if($('lga'))$('lga').textContent='Masuk sebagai '+(x?x.e:'-')+'. Sesi otomatis berakhir bila tidak dipakai 8 jam.';if($('ae')&&x)$('ae').placeholder='Email admin ('+x.e+')'};showA();
if($('lgo'))$('lgo').onclick=lockNow;
if($('asv'))$('asv').onclick=async()=>{const x=acct(),ne=($('ae').value.trim().toLowerCase()||x.e),op=$('ao').value,np=$('an').value;
  if(!op)return alert('Isi kata sandi saat ini.');if(!emailOk(ne))return alert('Email tidak valid.');if(np&&np.length<6)return alert('Kata sandi baru minimal 6 karakter.');
  if((await hash(op,ub(x.s),x.it))!==x.h)return alert('Kata sandi saat ini salah.');
  const salt=crypto.getRandomValues(new Uint8Array(16)),pw=np||op;ls(AK,JSON.stringify({e:ne,s:b64(salt),it:IT,h:await hash(pw,salt,IT)}));
  $('ae').value=$('ao').value=$('an').value='';showA();alert('Akun admin diperbarui.')};
})();
