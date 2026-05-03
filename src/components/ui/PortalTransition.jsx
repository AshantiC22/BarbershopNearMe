import { useState, useEffect, useRef } from 'react'

/*
  PortalTransition
  ─────────────────
  A rubber-hose cartoon loading screen shown once when navigating
  to the booking portal. Different scene from the main LoadingScreen:
  a demon barber sitting in his chair, then jumping up excited when
  a customer arrives.

  Usage:
    <PortalTransition onDone={() => setReady(true)} />
*/

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Boogaloo&family=Bebas+Neue&family=Courier+Prime:wght@700&display=swap');

.pt-root{
  position:fixed;inset:0;z-index:9998;
  background:#050403;
  display:flex;align-items:center;justify-content:center;
  overflow:hidden;
  transition:opacity .55s ease,transform .55s ease;
}
.pt-root.exit{opacity:0;transform:scale(.96) translateZ(0);pointer-events:none;transition:opacity .55s cubic-bezier(.16,1,.3,1),transform .55s cubic-bezier(.16,1,.3,1);}

.pt-wrap{width:min(96vw,700px);display:flex;flex-direction:column;flex-shrink:0;}

.pt-film{will-change:opacity;
  background:#050403;
  border:3px solid #E8DFC8;
  border-radius:14px 10px 16px 8px / 8px 16px 10px 14px;
  overflow:hidden;position:relative;
}

.pt-sprockets{
  height:22px;background:#050403;
  display:flex;align-items:center;padding:0 6px;gap:2px;overflow:hidden;
}
.pt-sprockets.top{border-bottom:2px solid #E8DFC8;}
.pt-sprockets.bot{border-top:2px solid #E8DFC8;}
.pt-sp{width:16px;height:13px;flex-shrink:0;border:2px solid #E8DFC8;border-radius:2px;background:#050403;}

.pt-canvas-zone{position:relative;height:400px;background:#050403;overflow:hidden;}
.pt-canvas-zone canvas{position:absolute;inset:0;width:100%;height:100%;display:block;}

.pt-grain{
  position:absolute;inset:0;z-index:10;pointer-events:none;opacity:.09;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.82' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='256' height='256' filter='url(%23n)'/%3E%3C/svg%3E");
  animation:pt-grain .06s steps(1) infinite;
}
@keyframes pt-grain{0%{transform:translate(0,0)}25%{transform:translate(-3px,2px)}50%{transform:translate(2px,-2px)}75%{transform:translate(-2px,3px)}}
.pt-vig{position:absolute;inset:0;z-index:9;pointer-events:none;background:radial-gradient(ellipse at 50% 55%,transparent 35%,rgba(5,4,3,.72) 100%);}

/* TITLE CARD */
.pt-title{
  position:absolute;inset:0;z-index:20;background:#050403;
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  transition:opacity .4s ease;
}
.pt-title.hidden{opacity:0;pointer-events:none;}
.pt-title-eyebrow{font-family:'Courier Prime',monospace;font-size:11px;letter-spacing:.32em;text-transform:uppercase;color:rgba(232,223,200,.35);margin-bottom:14px;}
.pt-title-main{
  font-family:'Bebas Neue',sans-serif;
  font-size:clamp(52px,11vw,90px);line-height:.88;text-align:center;
  text-transform:uppercase;color:#E8DFC8;text-shadow:4px 4px 0 #8B1A1A;
  animation:pt-titlePop .6s cubic-bezier(.34,1.56,.64,1) both;
}
@keyframes pt-titlePop{0%{transform:scaleY(2.4) scaleX(.6) rotate(-3deg);opacity:0;}100%{transform:none;opacity:1;}}
.pt-title-red{color:#8B1A1A;display:block;animation:pt-redPulse 2s ease-in-out .6s infinite;}
@keyframes pt-redPulse{0%,100%{transform:scale(1);}50%{transform:scale(1.08) rotate(-1.5deg);}}
.pt-title-sub{font-family:'Boogaloo',cursive;font-size:14px;letter-spacing:.16em;text-transform:uppercase;color:rgba(232,223,200,.4);margin-top:12px;animation:pt-fade .8s ease .4s both;}
@keyframes pt-fade{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:none;}}
.pt-title-stars{display:flex;align-items:center;gap:12px;margin-top:18px;animation:pt-fade .8s ease .65s both;}
.pt-tline{width:56px;height:1px;background:rgba(139,26,26,.4);}
.pt-tstar{width:12px;height:12px;background:#8B1A1A;clip-path:polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%);animation:pt-spin 2.5s linear infinite;}
.pt-tstar.b{background:#E8DFC8;animation-delay:.6s;}
@keyframes pt-spin{to{transform:rotate(360deg);}}

/* DONE / ENTER */
.pt-done{position:absolute;inset:0;z-index:20;background:#050403;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;opacity:0;pointer-events:none;transition:opacity .5s ease;}
.pt-done.show{opacity:1;pointer-events:auto;}
.pt-done-title{font-family:'Bebas Neue',sans-serif;font-size:clamp(40px,9vw,68px);line-height:.9;text-transform:uppercase;text-align:center;color:#E8DFC8;text-shadow:4px 4px 0 #8B1A1A;animation:pt-titlePop .6s cubic-bezier(.34,1.56,.64,1) both;}
.pt-done-sub{font-family:'Courier Prime',monospace;font-size:11px;letter-spacing:.28em;text-transform:uppercase;color:rgba(232,223,200,.32);text-align:center;line-height:2.3;margin-top:4px;}

/* LOAD BAR */
.pt-load{background:#050403;border-top:2px solid #E8DFC8;padding:14px 32px 18px;transition:opacity .35s ease;}
.pt-load-row{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px;}
.pt-load-lbl{font-family:'Courier Prime',monospace;font-size:10px;letter-spacing:.28em;text-transform:uppercase;color:rgba(232,223,200,.38);}
.pt-load-pct{font-family:'Bebas Neue',sans-serif;font-size:17px;letter-spacing:.1em;color:#E8DFC8;}
.pt-load-track{height:10px;background:#0A0806;border:2px solid rgba(232,223,200,.25);border-radius:20px;overflow:hidden;}
.pt-load-bar{height:100%;width:0%;border-radius:20px;background:#8B1A1A;transition:width .2s ease;position:relative;overflow:hidden;}
.pt-load-bar::after{content:'';position:absolute;inset:0;background:repeating-linear-gradient(90deg,transparent,transparent 7px,rgba(255,255,255,.09) 7px,rgba(255,255,255,.09) 9px);animation:pt-shim .65s linear infinite;}
@keyframes pt-shim{to{transform:translateX(9px);}}

/* ENTER BTN */
.pt-enter{font-family:'Bebas Neue',sans-serif;font-size:16px;letter-spacing:.2em;text-transform:uppercase;background:#8B1A1A;color:#E8DFC8;border:3px solid #E8DFC8;border-radius:50px;padding:12px 40px;box-shadow:4px 4px 0 #E8DFC8;cursor:pointer;transform:scale(0);transition:transform .45s cubic-bezier(.34,1.56,.64,1),background .2s,box-shadow .15s;margin-top:8px;}
.pt-enter.show{transform:scale(1);}
.pt-enter:hover{background:#6B0F0F;transform:scale(1.07) rotate(-1.5deg);box-shadow:6px 6px 0 #E8DFC8;}
.pt-enter:active{transform:scale(.93);box-shadow:1px 1px 0 #E8DFC8;}
`

/* ── palette ── */
const INK  = '#050403'
const BONE = '#E8DFC8'
const BLOOD= '#8B1A1A'
const SKIN = '#C8986A'
const SKIN2= '#A07040'
const SKIN3= '#DEB888'
const CREAM= '#d4cbb0'
const RED2 = '#6B0F0F'

const LABELS = [
  'Preparing your chair...','Honing the blade...','Warming the towel...','Almost there...','The barber awaits...',
]

const lerp     = (a,b,t) => a+(b-a)*t
const clamp    = (v,a,b) => Math.max(a,Math.min(b,v))
const easeOut  = t => 1-Math.pow(1-t,3)
const easeInOut= t => t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2
const sin      = (t,f,a=1) => Math.sin(t*f)*a
const cos      = (t,f,a=1) => Math.cos(t*f)*a
const TAU      = Math.PI*2

function S(ctx,fill,stroke,lw,fn){
  ctx.beginPath();fn()
  if(fill){ctx.fillStyle=fill;ctx.fill()}
  if(stroke){ctx.lineWidth=lw||2.5;ctx.strokeStyle=stroke;ctx.stroke()}
}

/* ══════════════════════════════════════════════
   BARBER CHAIR — the throne
══════════════════════════════════════════════ */
function drawChair(ctx, cx, by){
  /* base / hydraulic */
  S(ctx,'#1a1410',INK,3,()=>{
    ctx.moveTo(cx-18,by)
    ctx.bezierCurveTo(cx-18,by+20,cx-30,by+24,cx-30,by+30)
    ctx.lineTo(cx+30,by+30)
    ctx.bezierCurveTo(cx+30,by+24,cx+18,by+20,cx+18,by)
    ctx.closePath()
  })
  /* base plate */
  S(ctx,'#222',INK,3,()=>ctx.ellipse(cx,by+30,40,12,0,0,TAU))
  /* star legs */
  for(let i=0;i<5;i++){
    const a=i*TAU/5
    ctx.save();ctx.translate(cx,by+30)
    ctx.rotate(a)
    S(ctx,'#1a1410',INK,3,()=>{
      ctx.moveTo(0,0);ctx.lineTo(0,36)
      ctx.bezierCurveTo(0,42,-8,44,-10,44)
      ctx.lineTo(10,44)
      ctx.bezierCurveTo(8,44,0,42,0,36)
      ctx.closePath()
    })
    ctx.restore()
  }
  /* seat */
  S(ctx,BLOOD,INK,3,()=>ctx.ellipse(cx,by-6,48,18,0,0,TAU))
  S(ctx,RED2,null,0,()=>ctx.ellipse(cx,by-8,36,12,0,0,TAU))
  /* seat side roll */
  S(ctx,BLOOD,INK,2.5,()=>ctx.ellipse(cx-44,by-4,10,14,-.3,0,TAU))
  S(ctx,BLOOD,INK,2.5,()=>ctx.ellipse(cx+44,by-4,10,14,.3,0,TAU))
  /* back rest */
  S(ctx,BLOOD,INK,3,()=>{
    ctx.moveTo(cx-40,by-6)
    ctx.bezierCurveTo(cx-44,by-60,cx-38,by-110,cx-24,by-120)
    ctx.bezierCurveTo(cx-10,by-128,cx+10,by-128,cx+24,by-120)
    ctx.bezierCurveTo(cx+38,by-110,cx+44,by-60,cx+40,by-6)
    ctx.closePath()
  })
  /* back rest cushion lines */
  for(let i=0;i<3;i++){
    const ry=by-30-i*28
    ctx.beginPath()
    ctx.moveTo(cx-32,ry)
    ctx.bezierCurveTo(cx-28,ry+8,cx+28,ry+8,cx+32,ry)
    ctx.lineWidth=2;ctx.strokeStyle='rgba(107,15,15,.6)';ctx.stroke()
  }
  /* headrest */
  S(ctx,BLOOD,INK,3,()=>{
    ctx.moveTo(cx-22,by-118)
    ctx.bezierCurveTo(cx-24,by-138,cx-16,by-148,cx,by-150)
    ctx.bezierCurveTo(cx+16,by-148,cx+24,by-138,cx+22,by-118)
    ctx.closePath()
  })
  /* armrests */
  for(const s of[-1,1]){
    S(ctx,'#1a1410',INK,3,()=>{
      ctx.moveTo(cx+s*24,by-56)
      ctx.bezierCurveTo(cx+s*28,by-56,cx+s*56,by-52,cx+s*60,by-48)
      ctx.bezierCurveTo(cx+s*64,by-44,cx+s*62,by-38,cx+s*58,by-36)
      ctx.bezierCurveTo(cx+s*54,by-34,cx+s*26,by-38,cx+s*22,by-40)
      ctx.closePath()
    })
    S(ctx,BLOOD,INK,2.5,()=>ctx.ellipse(cx+s*58,by-44,8,6,.2*s,0,TAU))
  }
}

/* ══════════════════════════════════════════════
   BARBER DEMON — sitting reading newspaper, 
   then stands up excited when customer arrives
══════════════════════════════════════════════ */
function drawBarberDemon(ctx, cx, by, t, excitement){
  /* excitement 0=sitting reading, 1=standing with arms up excited */

  const sitY   = by - 10
  /* spring overshoot on stand — goes a bit past then settles */
  const riseT   = clamp(excitement * 1.15, 0, 1)
  const springRise = riseT < 0.7
    ? easeOut(riseT / 0.7) * 1.08   /* overshoot */
    : 1.08 - easeInOut((riseT - 0.7) / 0.3) * 0.08   /* settle */
  const standY = lerp(sitY, by - 82, clamp(springRise, 0, 1))
  const bodyY  = standY

  /* legs come together smoothly as barber stands */
  const legSpread = lerp(1, 0, easeInOut(excitement))

  /* ── LEGS ── */
  ctx.save(); ctx.translate(cx, bodyY+46)
  for(const s of[-1,1]){
    const legAngle = s * legSpread * 0.55
    const legBob   = sin(t,2,.8)*excitement
    ctx.save(); ctx.rotate(legAngle)
    /* thigh */
    S(ctx,BLOOD,INK,3,()=>ctx.ellipse(0,0,12,28,0,0,TAU))
    ctx.translate(0,36); ctx.rotate(.3*s*(1-excitement*.6))
    /* shin */
    S(ctx,BLOOD,INK,3,()=>ctx.ellipse(0,0,10,24,0,0,TAU))
    ctx.translate(0,28)
    /* shoe — big rubber hose shoe */
    S(ctx,INK,BONE,3,()=>{
      ctx.moveTo(-14,0)
      ctx.bezierCurveTo(-14,-10,14,-10,14,0)
      ctx.bezierCurveTo(16,8,22,16,20,20)
      ctx.bezierCurveTo(10,26,-10,26,-20,20)
      ctx.bezierCurveTo(-22,16,-16,8,-14,0)
      ctx.closePath()
    })
    /* shoe shine */
    ctx.beginPath()
    ctx.moveTo(-6,-6); ctx.bezierCurveTo(-2,-10,6,-8,8,-4)
    ctx.lineWidth=2;ctx.strokeStyle='rgba(232,223,200,.2)';ctx.stroke()
    ctx.restore()
  }
  ctx.restore()

  /* ── BODY / COAT ── */
  ctx.save(); ctx.translate(cx, bodyY)
  /* coat body */
  /* always gently breathing — scales up to full bounce when excited */
  const bodyBob = sin(t, 1.4, 1.5) + sin(t, 2, 2.5) * excitement
  ctx.save(); ctx.translate(0, bodyBob)
  S(ctx,BLOOD,INK,4,()=>{
    ctx.moveTo(-36,0)
    ctx.bezierCurveTo(-36,-50,-22,-70,0,-72)
    ctx.bezierCurveTo(22,-70,36,-50,36,0)
    ctx.bezierCurveTo(36,28,22,44,0,44)
    ctx.bezierCurveTo(-22,44,-36,28,-36,0)
    ctx.closePath()
  })
  /* shirt bib */
  S(ctx,BONE,INK,2,()=>ctx.ellipse(0,-28,14,26,0,0,TAU))
  /* coat lapels */
  for(const s of[-1,1]){
    S(ctx,RED2,INK,2,()=>{
      ctx.moveTo(s*10,-54); ctx.lineTo(s*32,-30); ctx.lineTo(s*22,-22); ctx.closePath()
    })
  }
  /* coat buttons */
  for(let i=0;i<3;i++)
    S(ctx,INK,BONE,1.5,()=>ctx.arc(0,-50+i*14,3,0,TAU))
  /* pocket square */
  ctx.save(); ctx.translate(28,-40)
  S(ctx,BONE,INK,1.5,()=>{
    ctx.moveTo(0,0); ctx.lineTo(-8,0); ctx.lineTo(-9,-10); ctx.lineTo(0,-8); ctx.closePath()
  })
  ctx.restore()
  ctx.restore(); /* body bob */

  /* ── ARMS ── */
  /* arms: gentle hang at rest, wave up when excited with slight lag between arms */
  const armBaseL = lerp(0.28, -1.85, easeOut(clamp(excitement * 1.1, 0, 1)))
  const armBaseR = lerp(0.28, -1.65, easeOut(clamp(excitement * 1.05 - 0.03, 0, 1)))
  /* subtle idle sway even at rest */
  const armLiftL = armBaseL + sin(t, 0.7, 0.06)
  const armLiftR = armBaseR + sin(t, 0.8, 0.06)

  /* left arm */
  ctx.save(); ctx.translate(-28, -38+bodyBob)
  ctx.rotate(armLiftL + sin(t,3,.08)*excitement)
  S(ctx,BLOOD,INK,3,()=>ctx.ellipse(0,0,9,24,0,0,TAU))
  ctx.translate(0,32); ctx.rotate(.4 - excitement*.8)
  S(ctx,BLOOD,INK,3,()=>ctx.ellipse(0,0,8,20,0,0,TAU))
  /* gloved fist */
  S(ctx,SKIN,INK,2.5,()=>ctx.ellipse(0,22,10,11,0,0,TAU))
  /* fingers curl up when excited */
  if(excitement>0.3){
    for(let f=0;f<4;f++){
      ctx.save(); ctx.translate(-8+f*5.5, 16)
      ctx.rotate(-.4+sin(t,4+f,.15)*excitement)
      S(ctx,SKIN3,INK,1.8,()=>ctx.ellipse(0,-6,3.5,7,0,0,TAU))
      ctx.restore()
    }
  }
  ctx.restore() /* left arm */

  /* right arm */
  ctx.save(); ctx.translate(28,-38+bodyBob)
  ctx.rotate(armLiftR + sin(t,2.8,.1)*excitement)
  S(ctx,BLOOD,INK,3,()=>ctx.ellipse(0,0,9,24,0,0,TAU))
  ctx.translate(0,32); ctx.rotate(-.4+excitement*.6)
  S(ctx,BLOOD,INK,3,()=>ctx.ellipse(0,0,8,20,0,0,TAU))
  S(ctx,SKIN,INK,2.5,()=>ctx.ellipse(0,22,10,11,0,0,TAU))
  if(excitement>0.3){
    for(let f=0;f<4;f++){
      ctx.save(); ctx.translate(-8+f*5.5,16)
      ctx.rotate(.4+sin(t,4+f,.15)*excitement)
      S(ctx,SKIN3,INK,1.8,()=>ctx.ellipse(0,-6,3.5,7,0,0,TAU))
      ctx.restore()
    }
  }
  ctx.restore() /* right arm */

  /* ── HEAD ── */
  /* always nodding gently — nods faster when excited */
  const headBob = sin(t, 0.9, 2) + sin(t, 2.2, 3.5) * excitement
  ctx.save(); ctx.translate(0,-76+bodyBob+headBob)

  /* EARS */
  for(const s of[-1,1]){
    ctx.save(); ctx.translate(s*22,-2); ctx.rotate(s*.18)
    S(ctx,SKIN,INK,3.5,()=>{
      ctx.moveTo(0,10); ctx.bezierCurveTo(s*-12,-20,s*14,-28,s*18,-2); ctx.closePath()
    })
    ctx.save(); ctx.scale(.52,.52); ctx.translate(s*4,-4)
    S(ctx,'#e8a0a0',null,0,()=>{ctx.moveTo(0,10);ctx.bezierCurveTo(s*-8,-14,s*10,-18,s*12,-1);ctx.closePath()})
    ctx.restore()
    /* demon horn! */
    ctx.save(); ctx.translate(s*6,-22); ctx.rotate(s*-.2)
    S(ctx,BONE,INK,2.5,()=>{
      ctx.moveTo(0,0); ctx.bezierCurveTo(s*-6,-18,s*4,-28,0,-32); ctx.bezierCurveTo(s*-4,-28,s*6,-18,0,0); ctx.closePath()
    })
    /* horn tip red glow */
    S(ctx,BLOOD,null,0,()=>ctx.arc(0,-30,4,0,TAU))
    ctx.restore()
    ctx.restore()
  }

  /* head shape */
  S(ctx,'#1a0808',null,0,()=>ctx.ellipse(2,2,28,27,0,0,TAU))
  S(ctx,SKIN,INK,4.5,()=>ctx.ellipse(0,0,28,27,0,0,TAU))

  /* HAIR — slicked back pompadour */
  S(ctx,INK,INK,2,()=>{
    ctx.moveTo(-28,-14)
    ctx.bezierCurveTo(-26,-34,-16,-44,-8,-46)
    ctx.bezierCurveTo(-2,-48,8,-46,16,-40)
    ctx.bezierCurveTo(22,-34,26,-22,26,-12)
    ctx.closePath()
  })
  /* pompadour wave */
  ctx.beginPath()
  ctx.moveTo(-20,-28); ctx.bezierCurveTo(-10,-44,10,-44,20,-28)
  ctx.lineWidth=2; ctx.strokeStyle='rgba(232,223,200,.15)'; ctx.stroke()

  /* MONOCLE */
  S(ctx,'rgba(200,220,240,.12)',BONE,2,()=>ctx.arc(12,-2,11,0,TAU))
  ctx.beginPath();ctx.moveTo(22,-2);ctx.lineTo(26,4)
  ctx.lineWidth=2;ctx.strokeStyle=BONE;ctx.stroke()

  /* MOUSTACHE — handlebar */
  ctx.save(); ctx.translate(0,12)
  for(const s of[-1,1]){
    ctx.beginPath()
    ctx.moveTo(s*2,0)
    ctx.bezierCurveTo(s*8,-5,s*18,-6,s*20,0)
    ctx.bezierCurveTo(s*18,5,s*10,8,s*14,4)
    ctx.lineWidth=6; ctx.strokeStyle=INK; ctx.lineCap='round'; ctx.stroke()
    ctx.lineWidth=4; ctx.strokeStyle=BONE; ctx.stroke()
    /* curled wax tips */
    ctx.beginPath(); ctx.moveTo(s*14,4)
    ctx.bezierCurveTo(s*18,0,s*22,-5,s*20,-9)
    ctx.lineWidth=4; ctx.strokeStyle=INK; ctx.stroke()
    ctx.lineWidth=2.5; ctx.strokeStyle=BONE; ctx.stroke()
  }
  ctx.restore()

  /* EYES — change with excitement */
  for(const s of[-1,1]){
    /* sclera */
    S(ctx,'#fffff8',INK,3,()=>ctx.ellipse(s*11,0,8,8,0,0,TAU))
    /* iris shifts — looking down at paper when idle, looking at camera when excited */
    /* eyes ease up as excitement rises — smooth look shift */
    const eyeOffY = lerp(3, -1, easeInOut(excitement))
    S(ctx,'#4a8a20',null,0,()=>ctx.arc(s*11,eyeOffY,5.5,0,TAU))
    S(ctx,INK,null,0,()=>ctx.ellipse(s*11,eyeOffY,3,3+excitement,0,0,TAU))
    S(ctx,'#fff',null,0,()=>ctx.arc(s*11-1.5,eyeOffY-1.5,1.5,0,TAU))
    /* excitement: eyebrows raise */
    ctx.save(); ctx.translate(s*11,-10+excitement*4); ctx.rotate(s*(excitement>0.5?-.3:.4))
    ctx.beginPath(); ctx.moveTo(-7,0); ctx.lineTo(7,0)
    ctx.lineWidth=4; ctx.strokeStyle=INK; ctx.lineCap='round'; ctx.stroke()
    ctx.restore()
  }

  /* NOSE */
  S(ctx,'#f4b0a0',INK,1.8,()=>ctx.ellipse(0,7,6,5,0,0,TAU))
  S(ctx,INK,null,0,()=>ctx.ellipse(-2.5,8,1.5,1.2,0,0,TAU))
  S(ctx,INK,null,0,()=>ctx.ellipse(2.5,8,1.5,1.2,0,0,TAU))

  /* MOUTH — neutral when reading, wide grin when excited */
  /* mouth opens smoothly with ease */
  const mouthW = lerp(8, 18, easeInOut(excitement))
  const mouthH = lerp(2, 10, easeInOut(excitement))
  S(ctx,INK,INK,2,()=>ctx.ellipse(0,17,mouthW,mouthH,0,0,TAU))
  if(excitement>0.2){
    S(ctx,'#b06060',null,0,()=>ctx.ellipse(0,17.5,mouthW*.6,mouthH*.6,0,0,TAU))
    /* teeth */
    for(let i=0;i<4;i++){
      S(ctx,BONE,INK,1.5,()=>ctx.rect(-7+i*3.8,14,3.2,5))
    }
  }

  /* excitement: stars fade in above 0.3 so they don't pop in hard */
  if(excitement>0.3){
    const starCount=5
    for(let i=0;i<starCount;i++){
      const sa=t*3+i*(TAU/starCount)
      const sr=36+sin(t*4+i,1,4)
      const sx=Math.cos(sa)*sr, sy=Math.sin(sa)*sr
      ctx.save(); ctx.translate(sx,sy); ctx.rotate(t*5+i)
      const starAlpha = clamp((excitement - 0.3) / 0.4, 0, 1)
      ctx.globalAlpha = starAlpha
      ctx.scale(excitement, .8*excitement)
      S(ctx,i%2===0?BLOOD:BONE,null,0,()=>{
        ctx.moveTo(0,-8)
        for(let p=0;p<5;p++){
          const a=p*TAU/5-TAU/4
          ctx.lineTo(Math.cos(a)*8,Math.sin(a)*8)
          const a2=a+TAU/10
          ctx.lineTo(Math.cos(a2)*3.5,Math.sin(a2)*3.5)
        }
        ctx.closePath()
      })
      ctx.globalAlpha = 1
      ctx.restore()
    }
  }

  ctx.restore() /* head */
  ctx.restore() /* body */
}

/* ══════════════════════════════════════════════
   NEWSPAPER — held while sitting, drops on stand
══════════════════════════════════════════════ */
function drawNewspaper(ctx, cx, by, t, excitement){
  if(excitement>0.6) return /* dropped */
  /* newspaper fades out smoothly starting early */
  const alpha = clamp(1 - easeInOut(excitement / 0.5), 0, 1)
  ctx.globalAlpha=alpha

  /* paper held in front of body while sitting */
  const paperY=by-52
  ctx.save(); ctx.translate(cx-10,paperY)
  ctx.rotate(-.1+sin(t,1.2,.04))

  /* paper body */
  S(ctx,CREAM,INK,2.5,()=>{
    ctx.moveTo(-32,-44); ctx.lineTo(32,-44)
    ctx.lineTo(34,44); ctx.lineTo(-34,44); ctx.closePath()
  })
  /* headline */
  ctx.fillStyle='rgba(10,8,6,.7)'
  ctx.font=`bold 7px 'Bebas Neue',sans-serif`
  ctx.textAlign='center'; ctx.textBaseline='middle'
  ctx.fillText('THE DAILY BLADE',0,-32)
  ctx.fillText('CUSTOMER',0,-18)
  ctx.fillText('INCOMING!',0,-8)
  /* rule lines */
  for(let i=0;i<6;i++){
    ctx.beginPath()
    ctx.moveTo(-24,4+i*7); ctx.lineTo(24,4+i*7)
    ctx.lineWidth=1.5; ctx.strokeStyle='rgba(10,8,6,.2)'; ctx.stroke()
  }
  /* fold */
  ctx.beginPath(); ctx.moveTo(-34,0); ctx.lineTo(34,0)
  ctx.lineWidth=1; ctx.strokeStyle='rgba(10,8,6,.15)'; ctx.stroke()
  ctx.restore()

  ctx.globalAlpha=1
}

/* ══════════════════════════════════════════════
   BACKGROUND
══════════════════════════════════════════════ */
function drawBg(ctx,W,H,t,bgCanvas){
  ctx.fillStyle='#080604'; ctx.fillRect(0,0,W,H)
  if(bgCanvas){ ctx.globalAlpha=.9; ctx.drawImage(bgCanvas,0,0); ctx.globalAlpha=1 }
  /* slow diagonal light */
  const ray=(t*10)%100
  ctx.save()
  for(let i=-2;i<(W+H)/100+2;i++){
    ctx.beginPath(); const rx=i*100+ray
    ctx.moveTo(rx,0); ctx.lineTo(rx-H*.6,H)
    ctx.lineWidth=1.5; ctx.strokeStyle=BONE; ctx.globalAlpha=.016; ctx.stroke()
  }
  ctx.globalAlpha=1; ctx.restore()
}

function drawShopBg(ctx,W,H,t){
  const gY=H-72
  /* checkered floor */
  const tW=52,tH=30
  ctx.save()
  ctx.beginPath(); ctx.rect(0,gY,W,H-gY); ctx.clip()
  for(let tx=0;tx<W;tx+=tW)
    for(let ty=gY;ty<H;ty+=tH){
      const shade=(Math.floor(tx/tW)+Math.floor((ty-gY)/tH))%2
      ctx.fillStyle=shade?'#0e0b09':'#0b0806'
      ctx.fillRect(tx,ty,tW,tH)
      ctx.strokeStyle='rgba(232,223,200,.03)'; ctx.lineWidth=.8; ctx.strokeRect(tx,ty,tW,tH)
    }
  ctx.restore()
  /* ground line */
  ctx.beginPath()
  ctx.moveTo(0,gY); ctx.bezierCurveTo(W*.3,gY-5,W*.7,gY+5,W,gY)
  ctx.lineWidth=3; ctx.strokeStyle=BONE; ctx.globalAlpha=.55; ctx.stroke(); ctx.globalAlpha=1
  ctx.beginPath()
  ctx.moveTo(0,gY); ctx.bezierCurveTo(W*.3,gY-5,W*.7,gY+5,W,gY)
  ctx.lineTo(W,H); ctx.lineTo(0,H); ctx.closePath()
  ctx.fillStyle='#0c0908'; ctx.fill()
  /* mirror on left wall */
  ctx.save(); ctx.translate(80,60)
  S(ctx,'#0a1018',BONE,3,()=>{
    ctx.moveTo(0,0); ctx.bezierCurveTo(0,-8,8,-16,16,-18)
    ctx.lineTo(96,-18); ctx.bezierCurveTo(104,-16,112,-8,112,0)
    ctx.lineTo(112,140); ctx.bezierCurveTo(112,148,104,156,96,158)
    ctx.lineTo(16,158); ctx.bezierCurveTo(8,156,0,148,0,140); ctx.closePath()
  })
  /* mirror reflection shimmer */
  ctx.beginPath(); ctx.moveTo(16,10); ctx.bezierCurveTo(24,6,48,4,60,10)
  ctx.lineWidth=2; ctx.strokeStyle='rgba(232,223,200,.1)'; ctx.stroke()
  ctx.restore()
  /* shelf on right */
  ctx.save(); ctx.translate(W-180,80)
  S(ctx,'#1a1208',BONE,2.5,()=>ctx.rect(0,0,160,12))
  /* bottles on shelf */
  const bottles=[
    {x:10,w:14,h:32,col:'#2a4060'},{x:32,w:10,h:40,col:'#3a6030'},
    {x:50,w:16,h:28,col:'#601818'},{x:74,w:11,h:36,col:'#1a3048'},
    {x:94,w:15,h:44,col:'#3a2860'},{x:118,w:10,h:30,col:'#602030'},
  ]
  for(const b of bottles){
    S(ctx,b.col,BONE,1.5,()=>{
      ctx.roundRect(b.x,-b.h,b.w,b.h,3)
    })
    S(ctx,INK,BONE,1.5,()=>ctx.rect(b.x+2,-b.h-6,b.w-4,8))
    ctx.beginPath(); ctx.moveTo(b.x+b.w*.3,-b.h+4); ctx.bezierCurveTo(b.x+b.w*.25,-b.h+8,b.x+b.w*.4,-b.h+10,b.x+b.w*.3,-b.h+12)
    ctx.lineWidth=1.2; ctx.strokeStyle='rgba(255,255,255,.15)'; ctx.stroke()
  }
  ctx.restore()
  /* wall barber pole */
  const po=(t*55)%20
  const px=W-68,py=48,pw=22,ph=130
  ctx.beginPath(); ctx.roundRect(px,py,pw,ph,11); ctx.fillStyle='#0a0806'; ctx.fill()
  ctx.lineWidth=2.5; ctx.strokeStyle=BONE; ctx.stroke()
  ctx.save()
  ctx.beginPath(); ctx.roundRect(px+2,py+2,pw-4,ph-4,9); ctx.clip()
  const sc=[BONE,'#111',BLOOD]
  for(let i=-2;i<(ph/20)+3;i++){
    ctx.fillStyle=sc[((i%3)+3)%3]; ctx.fillRect(px+2,py+i*20+po,pw-4,20)
  }
  ctx.restore()
  ctx.beginPath(); ctx.roundRect(px,py,pw,ph,11); ctx.lineWidth=2.5; ctx.strokeStyle=BONE; ctx.stroke()
  for(const cy of[py,py+ph])
    S(ctx,BONE,INK,2,()=>ctx.ellipse(px+pw/2,cy,pw/2+5,8,0,0,TAU))
  return gY
}

/* ══════════════════════════════════════════════
   COMPONENT
══════════════════════════════════════════════ */
export default function PortalTransition({ onDone }) {
  const [phase,    setPhase]  = useState('title')
  const [exitDone, setExit]   = useState(false)
  const [enterShow,setEnter]  = useState(false)

  const canvasRef    = useRef(null)
  const rafRef       = useRef(null)
  const progRef      = useRef(0)
  const tRef         = useRef(0)
  const lastRef      = useRef(null)
  const bgRef        = useRef({})
  const excitRef     = useRef(0)   /* smoothed excitement 0..1 */
  const titleRef  = useRef(null)
  const doneRef   = useRef(null)
  const loadRef   = useRef(null)
  const barRef    = useRef(null)
  const pctRef    = useRef(null)
  const lblRef    = useRef(null)

  useEffect(()=>{
    const cv=canvasRef.current
    function resize(){
      const z=cv.parentElement
      cv.width=z.offsetWidth; cv.height=z.offsetHeight
      const W=cv.width,H=cv.height,oc=document.createElement('canvas')
      oc.width=W; oc.height=H
      const ox=oc.getContext('2d')
      for(let xx=0;xx<W;xx+=22)
        for(let yy=0;yy<H-72;yy+=22){
          const d=Math.hypot(xx-W/2,yy-H/2)
          const a=Math.max(0,.05-(d/W)*.05)
          ox.beginPath(); ox.arc(xx,yy,1.3,0,TAU)
          ox.fillStyle=BONE; ox.globalAlpha=a; ox.fill()
        }
      bgRef.current={canvas:oc}
    }
    resize()
    window.addEventListener('resize',resize)
    return()=>window.removeEventListener('resize',resize)
  },[])

  useEffect(()=>{
    const id=setTimeout(()=>{
      if(titleRef.current) titleRef.current.classList.add('hidden')
      setTimeout(()=>setPhase('scene'),440)
    },2800)
    return()=>clearTimeout(id)
  },[])

  useEffect(()=>{
    if(phase!=='scene') return
    const cv=canvasRef.current
    const ctx=cv.getContext('2d')
    let labelIdx=0

    function frame(ts){
      if(!lastRef.current) lastRef.current=ts
      const dt=Math.min((ts-lastRef.current)/1000,.033)
      lastRef.current=ts
      tRef.current+=dt
      const t=tRef.current

      progRef.current=Math.min(100,progRef.current+.22+Math.random()*.18)
      const p=Math.round(progRef.current)
      if(barRef.current) barRef.current.style.width=p+'%'
      if(pctRef.current) pctRef.current.textContent=p+'%'
      const li=Math.min(LABELS.length-1,Math.floor(p/(100/LABELS.length)))
      if(li!==labelIdx){labelIdx=li;if(lblRef.current)lblRef.current.textContent=LABELS[li]}

      const W=cv.width,H=cv.height
      drawBg(ctx,W,H,t,bgRef.current.canvas)
      const gY=drawShopBg(ctx,W,H,t)

      /* smooth excitement — lerps toward raw target so all transitions are gradual */
      const rawExcitement = clamp((p - 50) / 50, 0, 1)
      excitRef.current = lerp(excitRef.current, rawExcitement, dt * 1.8)
      const excitement = excitRef.current

      const chairX = W / 2, chairY = gY - 10
      drawChair(ctx, chairX, chairY)
      drawNewspaper(ctx, chairX, chairY - 30, t, excitement)
      drawBarberDemon(ctx, chairX, chairY - 30, t, excitement)

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
    setTimeout(()=>{setExit(true);onDone?.()},520)
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
              {/* title */}
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
              {/* done */}
              <div className="pt-done" ref={doneRef}>
                <div className="pt-done-title">The Chair<br/>Is Yours.</div>
                <div className="pt-done-sub">Barbershopnearme · Est. 1931<br/>Hattiesburg, MS</div>
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
