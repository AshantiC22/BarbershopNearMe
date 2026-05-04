import { useState, useEffect, useRef } from 'react'

const CSS = `
.pt-root{position:fixed;inset:0;z-index:9998;background:#050403;display:flex;align-items:center;justify-content:center;overflow:hidden;transition:opacity .55s ease,transform .55s ease;}
.pt-root.exit{opacity:0;transform:scale(.96);pointer-events:none;}
.pt-wrap{width:min(96vw,700px);display:flex;flex-direction:column;flex-shrink:0;}
.pt-film{background:#050403;border:3px solid #E8DFC8;border-radius:14px 10px 16px 8px / 8px 16px 10px 14px;overflow:hidden;position:relative;}
.pt-sprockets{height:22px;background:#050403;display:flex;align-items:center;padding:0 6px;gap:2px;overflow:hidden;}
.pt-sprockets.top{border-bottom:2px solid #E8DFC8;}
.pt-sprockets.bot{border-top:2px solid #E8DFC8;}
.pt-sp{width:16px;height:13px;flex-shrink:0;border:2px solid #E8DFC8;border-radius:2px;background:#050403;}
.pt-canvas-zone{position:relative;height:360px;background:#050403;overflow:hidden;}
.pt-canvas-zone canvas{position:absolute;top:0;left:0;width:100%;height:100%;display:block;}
.pt-grain{position:absolute;inset:0;pointer-events:none;z-index:10;opacity:.09;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.82' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='256' height='256' filter='url(%23n)'/%3E%3C/svg%3E");animation:pt-grain .06s steps(1) infinite;}
@keyframes pt-grain{0%{transform:translate(0,0)}25%{transform:translate(-3px,2px)}50%{transform:translate(2px,-2px)}75%{transform:translate(-2px,3px)}}
.pt-vig{position:absolute;inset:0;pointer-events:none;z-index:9;background:radial-gradient(ellipse at 50% 55%,transparent 35%,rgba(5,4,3,.72) 100%);}
.pt-title{position:absolute;inset:0;z-index:20;background:#050403;display:flex;flex-direction:column;align-items:center;justify-content:center;transition:opacity .4s ease;}
.pt-title.hidden{opacity:0;pointer-events:none;}
.pt-title-eyebrow{font-family:'Courier Prime',monospace;font-size:11px;letter-spacing:.32em;text-transform:uppercase;color:rgba(232,223,200,.35);margin-bottom:14px;}
.pt-title-main{font-family:'Bebas Neue',sans-serif;font-size:clamp(52px,11vw,90px);line-height:.88;text-align:center;text-transform:uppercase;color:#E8DFC8;text-shadow:4px 4px 0 #8B1A1A;animation:pt-pop .6s cubic-bezier(.34,1.56,.64,1) both;}
@keyframes pt-pop{0%{transform:scaleY(2.4) scaleX(.6) rotate(-3deg);opacity:0;}100%{transform:none;opacity:1;}}
.pt-title-red{color:#8B1A1A;display:block;animation:pt-pulse 2s ease-in-out .6s infinite;}
@keyframes pt-pulse{0%,100%{transform:scale(1);}50%{transform:scale(1.08) rotate(-1.5deg);}}
.pt-title-sub{font-family:'Boogaloo',cursive;font-size:14px;letter-spacing:.16em;text-transform:uppercase;color:rgba(232,223,200,.4);margin-top:12px;animation:pt-fade .8s ease .4s both;}
@keyframes pt-fade{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:none;}}
.pt-title-stars{display:flex;align-items:center;gap:12px;margin-top:18px;animation:pt-fade .8s ease .65s both;}
.pt-tline{width:56px;height:1px;background:rgba(139,26,26,.4);}
.pt-tstar{width:12px;height:12px;background:#8B1A1A;clip-path:polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%);animation:pt-spin 2.5s linear infinite;}
.pt-tstar.b{background:#E8DFC8;animation-delay:.6s;}
@keyframes pt-spin{to{transform:rotate(360deg);}}
.pt-done{position:absolute;inset:0;z-index:20;background:#050403;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;opacity:0;pointer-events:none;transition:opacity .5s ease;}
.pt-done.show{opacity:1;pointer-events:auto;}
.pt-done-title{font-family:'Bebas Neue',sans-serif;font-size:clamp(40px,9vw,68px);line-height:.9;text-transform:uppercase;text-align:center;color:#E8DFC8;text-shadow:4px 4px 0 #8B1A1A;animation:pt-pop .6s cubic-bezier(.34,1.56,.64,1) both;}
.pt-done-sub{font-family:'Courier Prime',monospace;font-size:11px;letter-spacing:.28em;text-transform:uppercase;color:rgba(232,223,200,.32);text-align:center;line-height:2.3;margin-top:4px;}
.pt-load{background:#050403;border-top:2px solid #E8DFC8;padding:14px 32px 18px;transition:opacity .35s ease;}
.pt-load-row{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px;}
.pt-load-lbl{font-family:'Courier Prime',monospace;font-size:10px;letter-spacing:.28em;text-transform:uppercase;color:rgba(232,223,200,.38);}
.pt-load-pct{font-family:'Bebas Neue',sans-serif;font-size:17px;letter-spacing:.1em;color:#E8DFC8;}
.pt-load-track{height:10px;background:#0A0806;border:2px solid rgba(232,223,200,.25);border-radius:20px;overflow:hidden;}
.pt-load-bar{height:100%;width:0%;border-radius:20px;background:#8B1A1A;transition:width .25s ease;position:relative;overflow:hidden;}
.pt-load-bar::after{content:'';position:absolute;inset:0;background:repeating-linear-gradient(90deg,transparent,transparent 7px,rgba(255,255,255,.09) 7px,rgba(255,255,255,.09) 9px);animation:pt-shim .65s linear infinite;}
@keyframes pt-shim{to{transform:translateX(9px);}}
.pt-enter{font-family:'Bebas Neue',sans-serif;font-size:16px;letter-spacing:.2em;text-transform:uppercase;background:#8B1A1A;color:#E8DFC8;border:3px solid #E8DFC8;border-radius:50px;padding:12px 40px;box-shadow:4px 4px 0 #E8DFC8;cursor:pointer;transform:scale(0);transition:transform .45s cubic-bezier(.34,1.56,.64,1),background .2s;margin-top:8px;}
.pt-enter.show{transform:scale(1);}
.pt-enter:hover{background:#6B0F0F;transform:scale(1.07) rotate(-1.5deg);box-shadow:6px 6px 0 #E8DFC8;}
.pt-enter:active{transform:scale(.93);}
html:has(.pt-root),body:has(.pt-root){overflow:hidden!important;}
`

const INK   = '#050403'
const BONE  = '#E8DFC8'
const BLOOD = '#8B1A1A'
const BLOOD2= '#6B0F0F'
const SKIN  = '#C8986A'
const SKIN2 = '#A07040'
const SKIN3 = '#DEB888'
const TAU   = Math.PI * 2

const LABELS = ['Preparing your chair...','Honing the blade...','Warming the towel...','Almost there...','The barber awaits...']

const lerp      = (a,b,t) => a+(b-a)*t
const clamp     = (v,a,b) => Math.max(a,Math.min(b,v))
const easeOut   = t => 1-Math.pow(1-t,3)
const easeInOut = t => t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2
const sin       = (t,f,a=1) => Math.sin(t*f)*a
const cos       = (t,f,a=1) => Math.cos(t*f)*a

function S(ctx,fill,stroke,lw,fn){
  ctx.beginPath();fn()
  if(fill){ctx.fillStyle=fill;ctx.fill()}
  if(stroke){ctx.lineWidth=lw||2.5;ctx.strokeStyle=stroke;ctx.stroke()}
}

function drawChair(ctx,cx,by){
  S(ctx,'#1a1410',INK,3,()=>{ctx.moveTo(cx-18,by);ctx.bezierCurveTo(cx-18,by+20,cx-30,by+24,cx-30,by+30);ctx.lineTo(cx+30,by+30);ctx.bezierCurveTo(cx+30,by+24,cx+18,by+20,cx+18,by);ctx.closePath()})
  S(ctx,'#222',INK,3,()=>ctx.ellipse(cx,by+30,40,12,0,0,TAU))
  for(let i=0;i<5;i++){const a=i*TAU/5;ctx.save();ctx.translate(cx,by+30);ctx.rotate(a);S(ctx,'#1a1410',INK,3,()=>{ctx.moveTo(0,0);ctx.lineTo(0,36);ctx.bezierCurveTo(0,42,-8,44,-10,44);ctx.lineTo(10,44);ctx.bezierCurveTo(8,44,0,42,0,36);ctx.closePath()});ctx.restore()}
  S(ctx,BLOOD,INK,3,()=>ctx.ellipse(cx,by-6,48,18,0,0,TAU))
  S(ctx,BLOOD2,null,0,()=>ctx.ellipse(cx,by-8,36,12,0,0,TAU))
  S(ctx,BLOOD,INK,2.5,()=>ctx.ellipse(cx-44,by-4,10,14,-.3,0,TAU))
  S(ctx,BLOOD,INK,2.5,()=>ctx.ellipse(cx+44,by-4,10,14,.3,0,TAU))
  S(ctx,BLOOD,INK,3,()=>{ctx.moveTo(cx-40,by-6);ctx.bezierCurveTo(cx-44,by-60,cx-38,by-110,cx-24,by-120);ctx.bezierCurveTo(cx-10,by-128,cx+10,by-128,cx+24,by-120);ctx.bezierCurveTo(cx+38,by-110,cx+44,by-60,cx+40,by-6);ctx.closePath()})
  for(let i=0;i<3;i++){const ry=by-30-i*28;ctx.beginPath();ctx.moveTo(cx-32,ry);ctx.bezierCurveTo(cx-28,ry+8,cx+28,ry+8,cx+32,ry);ctx.lineWidth=2;ctx.strokeStyle='rgba(107,15,15,.6)';ctx.stroke()}
  S(ctx,BLOOD,INK,3,()=>{ctx.moveTo(cx-22,by-118);ctx.bezierCurveTo(cx-24,by-138,cx-16,by-148,cx,by-150);ctx.bezierCurveTo(cx+16,by-148,cx+24,by-138,cx+22,by-118);ctx.closePath()})
  for(const s of[-1,1]){S(ctx,'#1a1410',INK,3,()=>{ctx.moveTo(cx+s*24,by-56);ctx.bezierCurveTo(cx+s*28,by-56,cx+s*56,by-52,cx+s*60,by-48);ctx.bezierCurveTo(cx+s*64,by-44,cx+s*62,by-38,cx+s*58,by-36);ctx.bezierCurveTo(cx+s*54,by-34,cx+s*26,by-38,cx+s*22,by-40);ctx.closePath()});S(ctx,BLOOD,INK,2.5,()=>ctx.ellipse(cx+s*58,by-44,8,6,.2*s,0,TAU))}
}

function drawBarberDemon(ctx,cx,by,t,excitement){
  const bodyBob = sin(t,1.4,1.5)+sin(t,2,2.5)*excitement
  const headBob = sin(t,0.9,2)+sin(t,2.2,3.5)*excitement
  const legSpread = lerp(1,0,easeInOut(excitement))
  const riseT = clamp(excitement*1.15,0,1)
  const springRise = riseT<0.7?easeOut(riseT/0.7)*1.08:1.08-easeInOut((riseT-0.7)/0.3)*0.08
  const standY = lerp(by-10,by-82,clamp(springRise,0,1))
  const bodyY  = standY

  ctx.save(); ctx.translate(cx,bodyY)

  /* legs */
  ctx.save(); ctx.translate(0,46)
  for(const s of[-1,1]){
    const la = s*legSpread*0.55
    ctx.save(); ctx.rotate(la)
    S(ctx,BLOOD,INK,3,()=>ctx.ellipse(0,0,12,28,0,0,TAU))
    ctx.translate(0,36); ctx.rotate(.3*s*(1-excitement*.6))
    S(ctx,BLOOD,INK,3,()=>ctx.ellipse(0,0,10,24,0,0,TAU))
    ctx.translate(0,28)
    S(ctx,INK,BONE,3,()=>{ctx.moveTo(-14,0);ctx.bezierCurveTo(-14,-10,14,-10,14,0);ctx.bezierCurveTo(16,8,22,16,20,20);ctx.bezierCurveTo(10,26,-10,26,-20,20);ctx.bezierCurveTo(-22,16,-16,8,-14,0);ctx.closePath()})
    ctx.restore()
  }
  ctx.restore()

  /* body */
  ctx.save(); ctx.translate(0,bodyBob)
  S(ctx,BLOOD,INK,4,()=>{ctx.moveTo(-36,0);ctx.bezierCurveTo(-36,-50,-22,-70,0,-72);ctx.bezierCurveTo(22,-70,36,-50,36,0);ctx.bezierCurveTo(36,28,22,44,0,44);ctx.bezierCurveTo(-22,44,-36,28,-36,0);ctx.closePath()})
  S(ctx,BONE,INK,2,()=>ctx.ellipse(0,-28,14,26,0,0,TAU))
  for(const s of[-1,1]) S(ctx,BLOOD2,INK,2,()=>{ctx.moveTo(s*10,-54);ctx.lineTo(s*32,-30);ctx.lineTo(s*22,-22);ctx.closePath()})
  for(let i=0;i<3;i++) S(ctx,INK,BONE,1.5,()=>ctx.arc(0,-50+i*14,3,0,TAU))
  ctx.restore()

  /* arms */
  const armBaseL = lerp(0.28,-1.85,easeOut(clamp(excitement*1.1,0,1)))+sin(t,0.7,0.06)
  const armBaseR = lerp(0.28,-1.65,easeOut(clamp(excitement*1.05-0.03,0,1)))+sin(t,0.8,0.06)
  ctx.save(); ctx.translate(-28,-38+bodyBob); ctx.rotate(armBaseL)
  S(ctx,BLOOD,INK,3,()=>ctx.ellipse(0,0,9,24,0,0,TAU))
  ctx.translate(0,32); ctx.rotate(.4-excitement*.8)
  S(ctx,BLOOD,INK,3,()=>ctx.ellipse(0,0,8,20,0,0,TAU))
  S(ctx,SKIN,INK,2.5,()=>ctx.ellipse(0,22,10,11,0,0,TAU))
  ctx.restore()
  ctx.save(); ctx.translate(28,-38+bodyBob); ctx.rotate(armBaseR)
  S(ctx,BLOOD,INK,3,()=>ctx.ellipse(0,0,9,24,0,0,TAU))
  ctx.translate(0,32); ctx.rotate(-.4+excitement*.6)
  S(ctx,BLOOD,INK,3,()=>ctx.ellipse(0,0,8,20,0,0,TAU))
  S(ctx,SKIN,INK,2.5,()=>ctx.ellipse(0,22,10,11,0,0,TAU))
  ctx.restore()

  /* head */
  ctx.save(); ctx.translate(0,-76+bodyBob+headBob)
  for(const s of[-1,1]){
    ctx.save(); ctx.translate(s*22,-2); ctx.rotate(s*.18)
    S(ctx,SKIN,INK,3.5,()=>{ctx.moveTo(0,10);ctx.bezierCurveTo(s*-12,-20,s*14,-28,s*18,-2);ctx.closePath()})
    ctx.save(); ctx.scale(.52,.52); ctx.translate(s*4,-4)
    S(ctx,'#e8a0a0',null,0,()=>{ctx.moveTo(0,10);ctx.bezierCurveTo(s*-8,-14,s*10,-18,s*12,-1);ctx.closePath()})
    ctx.restore()
    ctx.save(); ctx.translate(s*6,-22); ctx.rotate(s*-.2)
    S(ctx,BONE,INK,2.5,()=>{ctx.moveTo(0,0);ctx.bezierCurveTo(s*-6,-18,s*4,-28,0,-32);ctx.bezierCurveTo(s*-4,-28,s*6,-18,0,0);ctx.closePath()})
    S(ctx,BLOOD,null,0,()=>ctx.arc(0,-30,4,0,TAU))
    ctx.restore(); ctx.restore()
  }
  S(ctx,'#1a0808',null,0,()=>ctx.ellipse(2,2,28,27,0,0,TAU))
  S(ctx,SKIN,INK,4.5,()=>ctx.ellipse(0,0,28,27,0,0,TAU))
  /* hair pompadour */
  S(ctx,INK,INK,2,()=>{ctx.moveTo(-28,-14);ctx.bezierCurveTo(-26,-34,-16,-44,-8,-46);ctx.bezierCurveTo(-2,-48,8,-46,16,-40);ctx.bezierCurveTo(22,-34,26,-22,26,-12);ctx.closePath()})
  /* monocle */
  S(ctx,'rgba(200,220,240,.12)',BONE,2,()=>ctx.arc(12,-2,11,0,TAU))
  ctx.beginPath();ctx.moveTo(22,-2);ctx.lineTo(26,4);ctx.lineWidth=2;ctx.strokeStyle=BONE;ctx.stroke()
  /* moustache */
  ctx.save(); ctx.translate(0,12)
  for(const s of[-1,1]){
    ctx.beginPath();ctx.moveTo(s*2,0);ctx.bezierCurveTo(s*8,-5,s*18,-6,s*20,0);ctx.bezierCurveTo(s*18,5,s*10,8,s*14,4);ctx.lineWidth=6;ctx.strokeStyle=INK;ctx.lineCap='round';ctx.stroke();ctx.lineWidth=4;ctx.strokeStyle=BONE;ctx.stroke()
    ctx.beginPath();ctx.moveTo(s*14,4);ctx.bezierCurveTo(s*18,0,s*22,-5,s*20,-9);ctx.lineWidth=4;ctx.strokeStyle=INK;ctx.stroke();ctx.lineWidth=2.5;ctx.strokeStyle=BONE;ctx.stroke()
  }
  ctx.restore()
  /* eyes */
  for(const s of[-1,1]){
    S(ctx,'#fffff8',INK,3,()=>ctx.ellipse(s*11,0,8,8,0,0,TAU))
    S(ctx,'#4a8a20',null,0,()=>ctx.arc(s*11,lerp(3,-1,easeInOut(excitement)),5.5,0,TAU))
    S(ctx,INK,null,0,()=>ctx.ellipse(s*11,lerp(3,-1,easeInOut(excitement)),3,3+excitement,0,0,TAU))
    S(ctx,'#fff',null,0,()=>ctx.arc(s*11-1.5,lerp(3,-1,easeInOut(excitement))-1.5,1.5,0,TAU))
    ctx.save(); ctx.translate(s*11,-10+excitement*4); ctx.rotate(s*(excitement>0.5?-.3:.4))
    ctx.beginPath();ctx.moveTo(-7,0);ctx.lineTo(7,0);ctx.lineWidth=4;ctx.strokeStyle=INK;ctx.lineCap='round';ctx.stroke()
    ctx.restore()
  }
  /* nose */
  S(ctx,'#f4b0a0',INK,1.8,()=>ctx.ellipse(0,7,6,5,0,0,TAU))
  /* mouth */
  const mW=lerp(8,18,easeInOut(excitement)),mH=lerp(2,10,easeInOut(excitement))
  S(ctx,INK,INK,2,()=>ctx.ellipse(0,17,mW,mH,0,0,TAU))
  if(excitement>0.2){
    S(ctx,'#b06060',null,0,()=>ctx.ellipse(0,17.5,mW*.6,mH*.6,0,0,TAU))
    for(let i=0;i<4;i++) S(ctx,BONE,INK,1.5,()=>ctx.rect(-7+i*3.8,14,3.2,5))
  }
  /* stars when excited */
  if(excitement>0.3){
    const starAlpha=clamp((excitement-0.3)/0.4,0,1)
    for(let i=0;i<5;i++){
      const sa=t*3+i*(TAU/5),sr=36+sin(t*4+i,1,4)
      ctx.save(); ctx.translate(Math.cos(sa)*sr,Math.sin(sa)*sr); ctx.rotate(t*5+i)
      ctx.scale(excitement,.8*excitement); ctx.globalAlpha=starAlpha
      S(ctx,i%2===0?BLOOD:BONE,null,0,()=>{ctx.moveTo(0,-8);for(let p=0;p<5;p++){const a=p*TAU/5-TAU/4;ctx.lineTo(Math.cos(a)*8,Math.sin(a)*8);const a2=a+TAU/10;ctx.lineTo(Math.cos(a2)*3.5,Math.sin(a2)*3.5)}ctx.closePath()})
      ctx.globalAlpha=1; ctx.restore()
    }
  }
  ctx.restore() /* head */
  ctx.restore() /* body */
}

function drawNewspaper(ctx,cx,by,t,excitement){
  if(excitement>0.6) return
  const alpha=clamp(1-easeInOut(excitement/0.5),0,1)
  ctx.globalAlpha=alpha
  ctx.save(); ctx.translate(cx-10,by-52); ctx.rotate(-.1+sin(t,1.2,.04))
  S(ctx,'#d4cbb0',INK,2.5,()=>{ctx.moveTo(-32,-44);ctx.lineTo(32,-44);ctx.lineTo(34,44);ctx.lineTo(-34,44);ctx.closePath()})
  ctx.fillStyle='rgba(10,8,6,.7)'; ctx.font=`bold 7px 'Bebas Neue',sans-serif`; ctx.textAlign='center'; ctx.textBaseline='middle'
  ctx.fillText('THE DAILY BLADE',0,-32); ctx.fillText('CUSTOMER',0,-18); ctx.fillText('INCOMING!',0,-8)
  for(let i=0;i<6;i++){ctx.beginPath();ctx.moveTo(-24,4+i*7);ctx.lineTo(24,4+i*7);ctx.lineWidth=1.5;ctx.strokeStyle='rgba(10,8,6,.2)';ctx.stroke()}
  ctx.restore(); ctx.globalAlpha=1
}

function drawBg(ctx,W,H,t,bgCanvas){
  ctx.fillStyle='#080604'; ctx.fillRect(0,0,W,H)
  if(bgCanvas&&bgCanvas.width>0&&bgCanvas.height>0){ ctx.globalAlpha=.9; ctx.drawImage(bgCanvas,0,0); ctx.globalAlpha=1 }
  ctx.save()
  const ray=(t*10)%100
  for(let i=-2;i<(W+H)/100+2;i++){ctx.beginPath();ctx.moveTo(i*100+ray,0);ctx.lineTo(i*100+ray-H*.6,H);ctx.lineWidth=1.5;ctx.strokeStyle=BONE;ctx.globalAlpha=.016;ctx.stroke()}
  ctx.globalAlpha=1; ctx.restore()
}

function drawShop(ctx,W,H,t){
  const gY=H-78
  const tW=52,tH=30
  ctx.save(); ctx.beginPath(); ctx.rect(0,gY,W,H-gY); ctx.clip()
  for(let tx=0;tx<W;tx+=tW) for(let ty=gY;ty<H;ty+=tH){const shade=(Math.floor(tx/tW)+Math.floor((ty-gY)/tH))%2;ctx.fillStyle=shade?'#0e0b09':'#0b0806';ctx.fillRect(tx,ty,tW,tH);ctx.strokeStyle='rgba(232,223,200,.03)';ctx.lineWidth=.8;ctx.strokeRect(tx,ty,tW,tH)}
  ctx.restore()
  ctx.beginPath();ctx.moveTo(0,gY);ctx.bezierCurveTo(W*.3,gY-5,W*.7,gY+5,W,gY);ctx.lineWidth=3;ctx.strokeStyle=BONE;ctx.globalAlpha=.55;ctx.stroke();ctx.globalAlpha=1
  ctx.beginPath();ctx.moveTo(0,gY);ctx.bezierCurveTo(W*.3,gY-5,W*.7,gY+5,W,gY);ctx.lineTo(W,H);ctx.lineTo(0,H);ctx.closePath();ctx.fillStyle='#0c0908';ctx.fill()
  /* mirror */
  ctx.save(); ctx.translate(80,60)
  S(ctx,'#0a1018','rgba(232,223,200,.5)',2.5,()=>{ctx.moveTo(8,0);ctx.bezierCurveTo(8,-8,16,-14,24,-14);ctx.lineTo(100,-14);ctx.bezierCurveTo(108,-14,116,-8,116,0);ctx.lineTo(116,148);ctx.bezierCurveTo(116,156,108,162,100,162);ctx.lineTo(24,162);ctx.bezierCurveTo(16,162,8,156,8,148);ctx.closePath()})
  ctx.restore()
  /* pole */
  const po=(t*55)%20,px=W-88,py=42,pw=26,ph=156
  ctx.beginPath();ctx.roundRect(px,py,pw,ph,13);ctx.fillStyle='#0a0806';ctx.fill();ctx.lineWidth=3;ctx.strokeStyle=BONE;ctx.stroke()
  ctx.save();ctx.beginPath();ctx.roundRect(px+2,py+2,pw-4,ph-4,11);ctx.clip()
  const sc=[BONE,'#111',BLOOD];for(let i=-2;i<(ph/20)+3;i++){ctx.fillStyle=sc[((i%3)+3)%3];ctx.fillRect(px+2,py+i*20+po,pw-4,20)}
  ctx.restore();ctx.beginPath();ctx.roundRect(px,py,pw,ph,13);ctx.lineWidth=3;ctx.strokeStyle=BONE;ctx.stroke()
  for(const cy of[py,py+ph]) S(ctx,BONE,INK,2.5,()=>ctx.ellipse(px+pw/2,cy,pw/2+5,9,0,0,TAU))
  return gY
}

export default function PortalTransition({ onDone }){
  const [phase,     setPhase]  = useState('title')
  const [exitDone,  setExit]   = useState(false)
  const [enterShow, setEnter]  = useState(false)

  const canvasRef = useRef(null)
  const rafRef    = useRef(null)
  const progRef   = useRef(0)
  const tRef      = useRef(0)
  const lastRef   = useRef(null)
  const bgRef     = useRef({})
  const excitRef  = useRef(0)
  const titleRef  = useRef(null)
  const doneRef   = useRef(null)
  const loadRef   = useRef(null)
  const barRef    = useRef(null)
  const pctRef    = useRef(null)
  const lblRef    = useRef(null)

  /* lock body scroll */
  useEffect(()=>{
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  },[])

  /* resize + bg offscreen canvas */
  useEffect(()=>{
    const cv = canvasRef.current

    function buildBg(W,H){
      const oc = document.createElement('canvas')
      oc.width=W; oc.height=H
      const ox = oc.getContext('2d')
      for(let xx=0;xx<W;xx+=22)
        for(let yy=0;yy<H-78;yy+=22){
          const d=Math.hypot(xx-W/2,yy-H/2)
          const a=Math.max(0,.055-(d/W)*.055)
          ox.beginPath(); ox.arc(xx,yy,1.3,0,TAU)
          ox.fillStyle=BONE; ox.globalAlpha=a; ox.fill()
        }
      return oc
    }

    function resize(){
      const z = cv.parentElement
      const W = z.offsetWidth  || 680
      const H = z.offsetHeight || 360
      cv.width  = W
      cv.height = H
      bgRef.current = { canvas: buildBg(W,H) }
    }

    requestAnimationFrame(()=>requestAnimationFrame(()=>resize()))
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  },[])

  /* title → scene */
  useEffect(()=>{
    const id = setTimeout(()=>{
      if(titleRef.current) titleRef.current.classList.add('hidden')
      setTimeout(()=>setPhase('scene'), 440)
    }, 2800)
    return () => clearTimeout(id)
  },[])

  /* main loop */
  useEffect(()=>{
    if(phase!=='scene') return
    const cv  = canvasRef.current
    if(!cv) return
    const ctx = cv.getContext('2d')
    let labelIdx = 0

    function frame(ts){
      if(!bgRef.current?.canvas || bgRef.current.canvas.width===0){ rafRef.current=requestAnimationFrame(frame); return }
      if(!lastRef.current) lastRef.current=ts
      const dt=Math.min((ts-lastRef.current)/1000,.033)
      lastRef.current=ts
      tRef.current+=dt
      const t=tRef.current

      progRef.current=Math.min(100,progRef.current+.22+Math.random()*.18)
      const p=Math.round(progRef.current)
      if(barRef.current)  barRef.current.style.width=p+'%'
      if(pctRef.current)  pctRef.current.textContent=p+'%'
      const li=Math.min(LABELS.length-1,Math.floor(p/(100/LABELS.length)))
      if(li!==labelIdx){labelIdx=li;if(lblRef.current)lblRef.current.textContent=LABELS[li]}

      const rawExcitement=clamp((p-50)/50,0,1)
      excitRef.current=lerp(excitRef.current,rawExcitement,dt*1.8)
      const excitement=excitRef.current

      const W=cv.width,H=cv.height
      drawBg(ctx,W,H,t,bgRef.current?.canvas)
      const gY=drawShop(ctx,W,H,t)
      const chairX=W/2,chairY=gY-10
      drawChair(ctx,chairX,chairY)
      drawNewspaper(ctx,chairX,chairY-30,t,excitement)
      drawBarberDemon(ctx,chairX,chairY-30,t,excitement)

      if(progRef.current>=100){
        if(lblRef.current) lblRef.current.textContent='The chair is yours.'
        if(pctRef.current) pctRef.current.textContent='100%'
        if(barRef.current) barRef.current.style.width='100%'
        setTimeout(()=>{
          if(loadRef.current) loadRef.current.style.opacity='0'
          if(doneRef.current) doneRef.current.classList.add('show')
          setTimeout(()=>setEnter(true),480)
        },550)
        return
      }
      rafRef.current=requestAnimationFrame(frame)
    }
    rafRef.current=requestAnimationFrame(frame)
    return()=>{if(rafRef.current)cancelAnimationFrame(rafRef.current)}
  },[phase])

  const handleEnter=()=>{
    setPhase('exit')
    /* wait for full exit fade, then navigate BEFORE unmounting
       so the next page mounts cleanly without a black frame */
    setTimeout(()=>{
      onDone?.()
      /* give React one rAF to start mounting the next page, then unmount */
      requestAnimationFrame(()=>requestAnimationFrame(()=>setExit(true)))
    },600)
  }

  if(exitDone) return null
  const sprockets=Array.from({length:32})

  return(
    <>
      <style>{CSS}</style>
      <div className={`pt-root${phase==='exit'?' exit':''}`}>
        <div className="pt-wrap">
          <div className="pt-film">
            <div className="pt-sprockets top">{sprockets.map((_,i)=><div key={i} className="pt-sp"/>)}</div>
            <div className="pt-canvas-zone">
              <canvas ref={canvasRef}/>
              <div className="pt-vig"/>
              <div className="pt-grain"/>
              <div className="pt-title" ref={titleRef}>
                <div className="pt-title-eyebrow">Barbershopnearme — Client Portal</div>
                <div className="pt-title-main">
                  The Barber
                  <span className="pt-title-red">Awaits</span>
                  You
                </div>
                <div className="pt-title-sub">— step into the chair —</div>
                <div className="pt-title-stars">
                  <div className="pt-tline"/>
                  <div className="pt-tstar"/><div className="pt-tstar b"/><div className="pt-tstar"/>
                  <div className="pt-tline"/>
                </div>
              </div>
              <div className="pt-done" ref={doneRef}>
                <div className="pt-done-title">The Chair<br/>Is Yours.</div>
                <div className="pt-done-sub">Barbershopnearme · Est. 2024<br/>Plano, TX</div>
                <button className={`pt-enter${enterShow?' show':''}`} onClick={handleEnter}>
                  Enter the Portal
                </button>
              </div>
            </div>
            <div className="pt-sprockets bot">{sprockets.map((_,i)=><div key={i} className="pt-sp"/>)}</div>
            <div className="pt-load" ref={loadRef}>
              <div className="pt-load-row">
                <span className="pt-load-lbl" ref={lblRef}>Preparing your chair...</span>
                <span className="pt-load-pct" ref={pctRef}>0%</span>
              </div>
              <div className="pt-load-track"><div className="pt-load-bar" ref={barRef}/></div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
