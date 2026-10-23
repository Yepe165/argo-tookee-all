// Pengingat WA otomatis H-1 untuk Argo Tookee Lisensi (Vercel Cron + Fonnte)
// Jalan tiap hari (lihat vercel.json). Mengirim ke pelanggan yang lisensinya berakhir BESOK (tanggal WIB).

const API_KEY = process.env.FIREBASE_API_KEY || 'AIzaSyCsIX7NyE5WRR18jy7fDUTUaWb_IJthFkI';
const PROJECT = process.env.FIREBASE_PROJECT_ID || 'argo-tookee';
const FS = 'https://firestore.googleapis.com/v1/projects/' + PROJECT + '/databases/(default)/documents';
const WIB = 7 * 3600e3, DAY = 864e5;

const dayKey = ms => new Date(ms + WIB).toISOString().slice(0, 10);
const fmtDate = ms => new Date(ms + WIB).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC' });
function waNum(v){ let n = String(v || '').replace(/\D/g, ''); if(n.startsWith('0')) n = '62' + n.slice(1); else if(n.startsWith('8')) n = '62' + n; return n; }

const D = f => { if(!f) return null; if('stringValue' in f) return f.stringValue; if('integerValue' in f) return +f.integerValue; if('doubleValue' in f) return f.doubleValue; return null; };
const parseDoc = d => { const o = { id: d.name.split('/').pop() }, fl = d.fields || {}; for(const k in fl) o[k] = D(fl[k]); return o; };

async function login(){
  const r = await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' + API_KEY, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD, returnSecureToken: true })
  });
  const j = await r.json();
  if(!r.ok) throw new Error('Login admin gagal: ' + ((j.error && j.error.message) || r.status));
  return j.idToken;
}
async function listAll(t){
  let out = [], pt = '';
  do{
    const r = await fetch(FS + '/licenses?pageSize=300' + (pt ? '&pageToken=' + encodeURIComponent(pt) : ''), { headers: { Authorization: 'Bearer ' + t } });
    const j = await r.json();
    if(!r.ok) throw new Error('Firestore: ' + ((j.error && j.error.message) || r.status));
    (j.documents || []).forEach(d => out.push(parseDoc(d)));
    pt = j.nextPageToken || '';
  }while(pt);
  return out;
}
async function markSent(t, r){
  try{
    await fetch(FS + '/licenses/' + encodeURIComponent(r.id) + '?currentDocument.exists=true&updateMask.fieldPaths=remindedExp', {
      method: 'PATCH', headers: { Authorization: 'Bearer ' + t, 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields: { remindedExp: { integerValue: String(r.expiresAt) } } })
    });
  }catch(e){}
}
function buildMsg(r){
  const url = process.env.APP_URL || '';
  return 'Halo ' + (r.name || '') + ', kami dari *Argo Tookee*.\n\nPemberitahuan: lisensi aplikasi Anda akan *berakhir besok* (' + fmtDate(r.expiresAt) + ').\n\nKode lisensi:\n' + r.id + '\n\nAgar aplikasi tetap bisa dipakai tanpa terputus, silakan hubungi kami untuk perpanjangan sebelum masa berlaku habis.' + (url ? '\n\nAplikasi: ' + url : '') + '\n\nTerima kasih.';
}
async function sendWa(r){
  const body = new URLSearchParams({ target: waNum(r.wa), message: buildMsg(r), countryCode: '62' });
  const res = await fetch('https://api.fonnte.com/send', { method: 'POST', headers: { Authorization: process.env.FONNTE_TOKEN }, body });
  const j = await res.json().catch(() => ({}));
  if(!res.ok || j.status === false) throw new Error(j.reason || j.detail || ('HTTP ' + res.status));
}

module.exports = async (req, res) => {
  // Hanya boleh dipanggil Vercel Cron (atau Anda, dengan rahasia yang sama)
  const secret = process.env.CRON_SECRET;
  if(!secret || req.headers.authorization !== 'Bearer ' + secret) return res.status(401).json({ error: 'Tidak diizinkan' });
  for(const k of ['FONNTE_TOKEN', 'ADMIN_EMAIL', 'ADMIN_PASSWORD']) if(!process.env[k]) return res.status(500).json({ error: 'Env belum diisi: ' + k });

  const dry = req.query && req.query.dry === '1';
  try{
    const t = await login();
    const rows = await listAll(t);
    const tomorrow = dayKey(Date.now() + DAY);
    const due = rows.filter(r => r.status === 'active' && r.expiresAt && r.wa && dayKey(r.expiresAt) === tomorrow && r.remindedExp !== r.expiresAt);
    const result = [];
    for(const r of due){
      if(dry){ result.push({ name: r.name, wa: r.wa, status: 'dry-run' }); continue; }
      try{ await sendWa(r); await markSent(t, r); result.push({ name: r.name, status: 'terkirim' }); }
      catch(e){ result.push({ name: r.name, status: 'gagal', error: e.message }); }
      await new Promise(ok => setTimeout(ok, 3000)); // jeda antar pesan agar aman dari blokir
    }
    res.status(200).json({ tanggalBesok: tomorrow, jumlah: due.length, hasil: result });
  }catch(e){ res.status(500).json({ error: e.message }); }
};
