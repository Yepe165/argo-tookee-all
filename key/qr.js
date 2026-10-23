/* Pembuat kode QR ringkas (mode byte, koreksi L/M). Tanpa pustaka luar. */
(function(g){
const ECC=[[-1,7,10,15,20,26,18,20,24,30,18,20,24,26,30,22,24,28,30,28,28,28,28,30,30,26,28,30,30,30,30,30,30,30,30,30,30,30,30,30,30],
 [-1,10,16,26,18,24,16,18,22,22,26,30,22,22,24,24,28,28,26,26,26,26,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28]];
const BLK=[[-1,1,1,1,1,1,2,2,2,2,4,4,4,4,4,6,6,6,6,7,8,8,9,9,10,12,12,12,13,14,15,16,17,18,19,19,20,21,22,24,25],
 [-1,1,1,1,2,2,4,4,4,5,5,5,8,9,9,10,10,11,13,14,16,17,17,18,20,21,23,25,26,28,29,31,33,35,37,38,40,43,45,47,49]];
const FMT=[1,0];
const mul=(x,y)=>{let z=0;for(let i=7;i>=0;i--){z=(z<<1)^((z>>>7)*0x11D);z^=((y>>>i)&1)*x}return z};
const rawMods=v=>{let r=(16*v+128)*v+64;if(v>=2){const n=Math.floor(v/7)+2;r-=(25*n-10)*n-55;if(v>=7)r-=36}return r};
const dataCw=(v,e)=>Math.floor(rawMods(v)/8)-ECC[e][v]*BLK[e][v];
const rsDiv=d=>{const r=new Array(d-1).fill(0);r.push(1);let root=1;for(let i=0;i<d;i++){for(let j=0;j<r.length;j++){r[j]=mul(r[j],root);if(j+1<r.length)r[j]^=r[j+1]}root=mul(root,2)}return r};
const rsRem=(data,div)=>{const r=div.map(()=>0);for(const b of data){const f=b^r.shift();r.push(0);div.forEach((c,i)=>{r[i]^=mul(c,f)})}return r};
const bit=(x,i)=>((x>>>i)&1)!==0;
function make(text,level){
  const e=level==='L'?0:1,bytes=Array.from(new TextEncoder().encode(String(text)));
  let ver=1;for(;;ver++){if(ver>40)throw new Error('Data terlalu panjang');const cap=dataCw(ver,e)*8,cc=ver<=9?8:16;if(4+cc+bytes.length*8<=cap)break}
  const bits=[];const put=(v,n)=>{for(let i=n-1;i>=0;i--)bits.push((v>>>i)&1)};
  put(4,4);put(bytes.length,ver<=9?8:16);bytes.forEach(b=>put(b,8));
  const cap=dataCw(ver,e)*8;put(0,Math.min(4,cap-bits.length));put(0,(8-bits.length%8)%8);
  for(let p=0xEC;bits.length<cap;p^=0xEC^0x11)put(p,8);
  const data=[];for(let i=0;i<bits.length;i+=8){let b=0;for(let j=0;j<8;j++)b=(b<<1)|bits[i+j];data.push(b)}
  // ECC + interleave
  const nb=BLK[e][ver],el=ECC[e][ver],raw=Math.floor(rawMods(ver)/8),ns=nb-raw%nb,sl=Math.floor(raw/nb),div=rsDiv(el),blocks=[];
  for(let i=0,k=0;i<nb;i++){const d=data.slice(k,k+sl-el+(i<ns?0:1));k+=d.length;const ec=rsRem(d,div);if(i<ns)d.push(0);blocks.push(d.concat(ec))}
  const all=[];for(let i=0;i<blocks[0].length;i++)blocks.forEach((b,j)=>{if(i!==sl-el||j>=ns)all.push(b[i])});
  // matrix
  const size=ver*4+17,m=[],fn=[];for(let i=0;i<size;i++){m.push(new Array(size).fill(false));fn.push(new Array(size).fill(false))}
  const set=(x,y,v)=>{m[y][x]=v;fn[y][x]=true};
  for(let i=0;i<size;i++){set(6,i,i%2===0);set(i,6,i%2===0)}
  const finder=(x,y)=>{for(let dy=-4;dy<=4;dy++)for(let dx=-4;dx<=4;dx++){const d=Math.max(Math.abs(dx),Math.abs(dy)),xx=x+dx,yy=y+dy;if(xx>=0&&xx<size&&yy>=0&&yy<size)set(xx,yy,d!==2&&d!==4)}};
  finder(3,3);finder(size-4,3);finder(3,size-4);
  let al=[];if(ver>1){const n=Math.floor(ver/7)+2,st=ver===32?26:Math.ceil((ver*4+4)/(n*2-2))*2;al=[6];for(let p=size-7;al.length<n;p-=st)al.splice(1,0,p)}
  al.forEach((cx,i)=>al.forEach((cy,j)=>{if((i===0&&j===0)||(i===0&&j===al.length-1)||(i===al.length-1&&j===0))return;for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)set(cx+dx,cy+dy,Math.max(Math.abs(dx),Math.abs(dy))!==1)}));
  const fmt=mask=>{const d=(FMT[e]<<3)|mask;let r=d;for(let i=0;i<10;i++)r=(r<<1)^((r>>>9)*0x537);const b=((d<<10)|r)^0x5412;
    for(let i=0;i<=5;i++)set(8,i,bit(b,i));set(8,7,bit(b,6));set(8,8,bit(b,7));set(7,8,bit(b,8));for(let i=9;i<15;i++)set(14-i,8,bit(b,i));
    for(let i=0;i<8;i++)set(size-1-i,8,bit(b,i));for(let i=8;i<15;i++)set(8,size-15+i,bit(b,i));set(8,size-8,true)};
  fmt(0);
  if(ver>=7){let r=ver;for(let i=0;i<12;i++)r=(r<<1)^((r>>>11)*0x1F25);const b=(ver<<12)|r;for(let i=0;i<18;i++){const c=bit(b,i),a=size-11+i%3,q=Math.floor(i/3);set(a,q,c);set(q,a,c)}}
  // data
  let k=0;for(let right=size-1;right>=1;right-=2){if(right===6)right=5;for(let v=0;v<size;v++)for(let j=0;j<2;j++){const x=right-j,up=((right+1)&2)===0,y=up?size-1-v:v;if(!fn[y][x]&&k<all.length*8){m[y][x]=bit(all[k>>>3],7-(k&7));k++}}}
  const conds=[(x,y)=>(x+y)%2===0,(x,y)=>y%2===0,(x,y)=>x%3===0,(x,y)=>(x+y)%3===0,(x,y)=>(Math.floor(x/3)+Math.floor(y/2))%2===0,(x,y)=>x*y%2+x*y%3===0,(x,y)=>(x*y%2+x*y%3)%2===0,(x,y)=>((x+y)%2+x*y%3)%2===0];
  const apply=mk=>{for(let y=0;y<size;y++)for(let x=0;x<size;x++)if(!fn[y][x]&&conds[mk](x,y))m[y][x]=!m[y][x]};
  const pen=()=>{let p=0;const lines=[];for(let y=0;y<size;y++)lines.push(m[y]);for(let x=0;x<size;x++)lines.push(m.map(r=>r[x]));
    lines.forEach(l=>{let run=1;for(let i=1;i<=size;i++){if(i<size&&l[i]===l[i-1])run++;else{if(run>=5)p+=run-2;run=1}}
      const s=l.map(v=>v?1:0).join('');['10111010000','00001011101'].forEach(pt=>{let i=-1;while((i=s.indexOf(pt,i+1))>=0)p+=40})});
    for(let y=0;y<size-1;y++)for(let x=0;x<size-1;x++){const c=m[y][x];if(c===m[y][x+1]&&c===m[y+1][x]&&c===m[y+1][x+1])p+=3}
    let dark=0;m.forEach(r=>r.forEach(v=>{if(v)dark++}));p+=Math.floor(Math.abs(dark*20-size*size*10)/(size*size))*10;return p};
  let best=0,bp=1e9;for(let mk=0;mk<8;mk++){apply(mk);fmt(mk);const p=pen();if(p<bp){bp=p;best=mk}apply(mk)}
  apply(best);fmt(best);
  return{size,ver,get:(x,y)=>m[y][x]};
}
g.QR={make};
})(typeof window!=='undefined'?window:globalThis);
