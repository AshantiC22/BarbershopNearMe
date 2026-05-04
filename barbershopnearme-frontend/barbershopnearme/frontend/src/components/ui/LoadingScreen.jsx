import { useState, useEffect, useRef } from "react";

/*
  BARBERSHOPNEARME — Itchy & Clippy Loading Screen
  ─────────────────────────────────────────────────
  Canvas-based 60fps rubber hose chase animation.

  ITCHY  — demon barber cat. Red barber coat, top hat,
           handlebar mustache, BOW TIE, manic green eyes,
           ear tufts. Wields snapping scissors.

  CLIPPY — terrified mouse in polka-dot suit + tiny top hat
           that flies off when Itchy lunges. Huge spiral
           panic eyes, sweat drops, spreading fingers.

  Title card: Itchy & Clippy — A Rubber Hose Tragedy
  "&" centered on its own line in blood red.

  Wraps children — shows once on site load.
*/

const CSS = `
.ls-root{position:fixed;inset:0;z-index:9999;background:#050403;display:flex;align-items:center;justify-content:center;overflow:hidden;box-sizing:border-box;transition:opacity .5s ease,transform .5s ease;}
.ls-root.exit{opacity:0;transform:scale(.97) translateZ(0);pointer-events:none;transition:opacity .7s cubic-bezier(.16,1,.3,1),transform .7s cubic-bezier(.16,1,.3,1);}
.ls-wrap{width:min(96vw,700px);display:flex;flex-direction:column;flex-shrink:0;}
.ls-film{will-change:opacity;background:#050403;border:3px solid #E8DFC8;border-radius:14px 10px 16px 8px / 8px 16px 10px 14px;overflow:hidden;position:relative;}
.ls-sprockets{height:22px;background:#050403;display:flex;align-items:center;padding:0 6px;overflow:hidden;gap:2px;}
.ls-sprockets.top{border-bottom:2px solid #E8DFC8;}
.ls-sprockets.bot{border-top:2px solid #E8DFC8;}
.ls-sp{width:16px;height:13px;flex-shrink:0;border:2px solid #E8DFC8;border-radius:2px;background:#050403;}
.ls-canvas-zone{position:relative;height:340px;background:#050403;overflow:hidden;}
.ls-canvas-zone canvas{position:absolute;top:0;left:0;width:100%;height:100%;display:block;}
.ls-grain{position:absolute;inset:0;pointer-events:none;z-index:10;opacity:.09;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.82' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='256' height='256' filter='url(%23n)'/%3E%3C/svg%3E");animation:ls-grain .06s steps(1) infinite;}
/* Lock body scroll while animation is visible */
html:has(.ls-root),body:has(.ls-root){overflow:hidden!important;height:100%!important;}
html:has(.pt-root),body:has(.pt-root){overflow:hidden!important;height:100%!important;}
@keyframes ls-grain{0%{transform:translate(0,0)}25%{transform:translate(-3px,2px)}50%{transform:translate(2px,-2px)}75%{transform:translate(-2px,3px)}}
.ls-vig{position:absolute;inset:0;pointer-events:none;z-index:9;background:radial-gradient(ellipse at 50% 55%,transparent 32%,rgba(5,4,3,.72) 100%);}

.ls-title-overlay{position:absolute;inset:0;z-index:20;background:#050403;display:flex;flex-direction:column;align-items:center;justify-content:center;transition:opacity .65s cubic-bezier(.16,1,.3,1);}
.ls-title-overlay.hidden{opacity:0;pointer-events:none;}
.ls-eyebrow{font-family:'Courier Prime',monospace;font-size:11px;letter-spacing:.32em;text-transform:uppercase;color:rgba(232,223,200,.35);margin-bottom:16px;}
.ls-title-main{
  font-family:'Bebas Neue',sans-serif;
  font-size:clamp(54px,12vw,94px);
  line-height:.88;text-align:center;text-transform:uppercase;
  color:#E8DFC8;text-shadow:4px 4px 0 #8B1A1A;
  animation:ls-titlePop .65s cubic-bezier(.34,1.56,.64,1) both;
}
@keyframes ls-titlePop{0%{transform:scaleY(2.5) scaleX(.55) rotate(-4deg);opacity:0;}100%{transform:none;opacity:1;}}
.ls-title-red{
  color:#8B1A1A;
  display:block;
  text-align:center;
  font-size:1.3em;
  line-height:1.05;
  animation:ls-redPulse 2.2s ease-in-out .65s infinite;
}
@keyframes ls-redPulse{0%,100%{transform:scale(1) rotate(0deg);}50%{transform:scale(1.1) rotate(-2deg);}}
.ls-title-sub{font-family:'Boogaloo',cursive;font-size:15px;letter-spacing:.16em;text-transform:uppercase;color:rgba(232,223,200,.4);margin-top:14px;animation:ls-subFade .8s ease .45s both;}
@keyframes ls-subFade{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:none;}}
.ls-title-stars{display:flex;align-items:center;gap:14px;margin-top:20px;animation:ls-subFade .8s ease .65s both;}
.ls-tline{width:64px;height:1px;background:rgba(139,26,26,.4);}
.ls-tstar{width:12px;height:12px;background:#8B1A1A;clip-path:polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%);animation:ls-starSpin 2.5s linear infinite;}
.ls-tstar.b{background:#E8DFC8;animation-delay:.6s;animation-duration:3.5s;}
@keyframes ls-starSpin{to{transform:rotate(360deg);}}

.ls-done{position:absolute;inset:0;z-index:20;background:#050403;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;opacity:0;pointer-events:none;transition:opacity .75s cubic-bezier(.16,1,.3,1);}
.ls-done.show{opacity:1;pointer-events:auto;}
.ls-done-title{font-family:'Bebas Neue',sans-serif;font-size:clamp(44px,9vw,76px);line-height:.88;text-transform:uppercase;text-align:center;color:#E8DFC8;text-shadow:4px 4px 0 #8B1A1A;animation:ls-titlePop .6s cubic-bezier(.34,1.56,.64,1) both;}
.ls-done-sub{font-family:'Courier Prime',monospace;font-size:11px;letter-spacing:.28em;text-transform:uppercase;color:rgba(232,223,200,.32);text-align:center;line-height:2.3;margin-top:6px;}
.ls-load{background:#050403;border-top:2px solid #E8DFC8;padding:14px 32px 18px;transition:opacity .35s ease;}
.ls-load-row{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px;}
.ls-load-lbl{font-family:'Courier Prime',monospace;font-size:10px;letter-spacing:.28em;text-transform:uppercase;color:rgba(232,223,200,.38);}
.ls-load-pct{font-family:'Bebas Neue',sans-serif;font-size:17px;letter-spacing:.1em;color:#E8DFC8;}
.ls-load-track{height:10px;background:#0A0806;border:2px solid rgba(232,223,200,.25);border-radius:20px;overflow:hidden;}
.ls-load-bar{height:100%;width:0%;border-radius:20px;background:#8B1A1A;will-change:width;transition:width .25s cubic-bezier(.16,1,.3,1);position:relative;overflow:hidden;}
.ls-load-bar::after{content:'';position:absolute;inset:0;background:repeating-linear-gradient(90deg,transparent,transparent 7px,rgba(255,255,255,.09) 7px,rgba(255,255,255,.09) 9px);animation:ls-shim .65s linear infinite;}
@keyframes ls-shim{to{transform:translateX(9px);}}
.ls-enter{font-family:'Bebas Neue',sans-serif;font-size:16px;letter-spacing:.2em;text-transform:uppercase;background:#8B1A1A;color:#E8DFC8;border:3px solid #E8DFC8;border-radius:50px;padding:12px 40px;box-shadow:4px 4px 0 #E8DFC8;cursor:pointer;transform:scale(0);transition:transform .45s cubic-bezier(.34,1.56,.64,1),background .2s,box-shadow .15s;margin-top:10px;}
.ls-enter.show{transform:scale(1);}
.ls-enter:hover{background:#6B0F0F;transform:scale(1.07) rotate(-1.5deg);box-shadow:6px 6px 0 #E8DFC8;}
.ls-enter:active{transform:scale(.93);box-shadow:1px 1px 0 #E8DFC8;}
`;

/* ── palette ── */
const INK   = '#050403';
const BONE  = '#E8DFC8';
const BLOOD = '#8B1A1A';
const BLOOD2= '#6B0F0F';
const GREY  = '#b8b098';
const CREAM = '#d4cbb0';
const PINK  = '#f0a0a0';
const SPOTS = '#ccc4ac';
const SKIN  = '#C8986A';
const SKIN3 = '#DEB888';

const LABELS      = ['Loading...','Sharpening the blade...','Heating the towel...','Chasing the mouse...','Almost ready...'];
const SPLAT_WORDS = ['SNIP!','CLIP!','SLICE!','YIPE!','EEK!','CHOP!','BZZT!'];

const lerp      = (a,b,t) => a+(b-a)*t;
const clamp     = (v,a,b) => Math.max(a,Math.min(b,v));
const easeInOut = t => t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
const easeOut   = t => 1-Math.pow(1-t,3);
const sin       = (t,f=1,a=1) => Math.sin(t*f)*a;
const cos       = (t,f=1,a=1) => Math.cos(t*f)*a;
const TAU       = Math.PI*2;

function S(ctx,fill,stroke,lw,fn){
  ctx.beginPath();fn();
  if(fill){ctx.fillStyle=fill;ctx.fill();}
  if(stroke){ctx.lineWidth=lw||2.5;ctx.strokeStyle=stroke;ctx.stroke();}
}

/* ══════════════════════════════════════════════════════════════
   ITCHY — demon barber cat
   Red barber coat · top hat · bow tie · handlebar mustache
   manic yellow-green eyes · ear tufts · tail pom
══════════════════════════════════════════════════════════════ */
function drawCat(ctx, x, y, t, lunging=false){
  ctx.save();
  ctx.translate(x, y);
  const lp  = sin(t, 14);
  const rawSq = sin(t,14,.07)*Math.sign(lp);
  const sq  = 1 + rawSq * easeInOut(Math.abs(rawSq)/.07);
  if(lunging){ ctx.rotate(-.22); ctx.translate(12,-6); }

  /* shadow */
  S(ctx,`rgba(0,0,0,${lunging?.45:.28})`,null,0,
    ()=>ctx.ellipse(0,2,lunging?58:46,lunging?10:7,0,0,TAU));

  /* tail */
  ctx.save(); ctx.translate(28,-38);
  const tw=sin(t,9,.7);
  ctx.rotate(tw);
  ctx.beginPath(); ctx.moveTo(0,0);
  ctx.bezierCurveTo(24,-28,44,-12,38,14);
  ctx.lineWidth=11; ctx.strokeStyle=BONE; ctx.lineCap='round'; ctx.stroke();
  ctx.lineWidth=5;  ctx.strokeStyle=INK;  ctx.stroke();
  S(ctx,BONE,INK,3,()=>ctx.arc(38+sin(t,9,4),14+cos(t,9,3),9,0,TAU));
  ctx.restore();

  /* body — red barber coat */
  ctx.save(); ctx.scale(sq,2-sq);
  S(ctx,'#1a0808',null,0,()=>ctx.ellipse(2,2-38,30,32,0,0,TAU));
  S(ctx,BLOOD,INK,4,()=>ctx.ellipse(0,-38,29,31,0,0,TAU));
  S(ctx,BONE,INK,2,()=>ctx.ellipse(0,-34,14,20,0,0,TAU));
  /* buttons */
  for(let i=0;i<3;i++) S(ctx,INK,BONE,1.5,()=>ctx.arc(0,-46+i*9,2.5,0,TAU));
  /* lapels */
  for(const s of[-1,1]){
    ctx.save(); ctx.translate(s*13,-47);
    S(ctx,BLOOD2,INK,2,()=>{ ctx.moveTo(0,0); ctx.bezierCurveTo(s*-4,8,s*-8,14,s*-5,20); ctx.lineTo(s*4,20); ctx.closePath(); });
    ctx.restore();
  }
  /* bow tie */
  S(ctx,BLOOD,INK,2.5,()=>{ ctx.moveTo(-12,-18); ctx.bezierCurveTo(-6,-12,6,-12,12,-18); ctx.bezierCurveTo(6,-24,-6,-24,-12,-18); ctx.closePath(); });
  S(ctx,BLOOD2,INK,1.5,()=>ctx.arc(0,-18,3.5,0,TAU));
  ctx.restore();

  /* back legs */
  for(const [ox,ph] of[[-16,lp],[4,-lp]]){
    ctx.save(); ctx.translate(ox,-20); ctx.rotate(ph*.52);
    S(ctx,BONE,INK,3,()=>ctx.ellipse(0,0,7,17,0,0,TAU));
    ctx.translate(0,26); ctx.rotate(ph*.38+.25);
    S(ctx,BONE,INK,2.5,()=>ctx.ellipse(0,0,6,13,0,0,TAU));
    ctx.translate(0,15);
    const fq=1+clamp(-Math.min(ph,0),0,.9)*.35;
    ctx.scale(fq,1/fq);
    S(ctx,BONE,INK,2.5,()=>ctx.ellipse(7,0,14,5.5,0,0,TAU));
    ctx.restore();
  }

  /* front arms */
  ctx.save(); ctx.translate(14,-40); ctx.rotate(-1.1+sin(t,14,.18));
  S(ctx,BONE,INK,3,()=>ctx.ellipse(0,0,7,15,0,0,TAU));
  ctx.translate(0,18); ctx.rotate(-.3+sin(t,14,.15));
  S(ctx,BONE,INK,2.5,()=>ctx.ellipse(0,0,6,11,0,0,TAU));
  S(ctx,BONE,INK,2.5,()=>ctx.arc(0,12,7,0,TAU));
  ctx.restore();
  ctx.save(); ctx.translate(-14,-40); ctx.rotate(1.0+lp*.4);
  S(ctx,BONE,INK,3,()=>ctx.ellipse(0,0,7,14,0,0,TAU));
  ctx.translate(0,17); ctx.rotate(.3-lp*.25);
  S(ctx,BONE,INK,2.5,()=>ctx.ellipse(0,0,6,10,0,0,TAU));
  S(ctx,BONE,INK,2.5,()=>ctx.arc(0,11,6.5,0,TAU));
  ctx.restore();

  /* HEAD */
  const hb=sin(t,14,4);
  ctx.save(); ctx.translate(0,-80+hb); ctx.rotate(sin(t,7,.08));

  /* ears */
  for(const s of[-1,1]){
    ctx.save(); ctx.translate(s*20,-6); ctx.rotate(s*.25);
    S(ctx,BONE,INK,3.5,()=>{ ctx.moveTo(0,6); ctx.bezierCurveTo(s*-11,-20,s*12,-28,s*18,-2); ctx.closePath(); });
    ctx.save(); ctx.scale(.52,.52); ctx.translate(s*4,-4);
    S(ctx,PINK,null,0,()=>{ ctx.moveTo(0,6); ctx.bezierCurveTo(s*-7,-12,s*9,-16,s*12,0); ctx.closePath(); });
    ctx.restore();
    /* ear tufts */
    ctx.save(); ctx.translate(s*6,-16);
    for(let i=0;i<3;i++){
      ctx.save(); ctx.rotate(s*(-.3+i*.3));
      ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(0,-6);
      ctx.lineWidth=2.5; ctx.strokeStyle=INK; ctx.lineCap='round'; ctx.stroke();
      ctx.restore();
    }
    ctx.restore(); ctx.restore();
  }

  /* head shape */
  S(ctx,'#1a0808',null,0,()=>ctx.ellipse(2,2,27,25,0,0,TAU));
  S(ctx,BONE,INK,4.5,()=>ctx.ellipse(0,0,27,25,0,0,TAU));

  /* TOP HAT */
  ctx.save(); ctx.translate(0,-22);
  S(ctx,INK,BONE,3,()=>ctx.ellipse(0,0,30,8,0,0,TAU));
  S(ctx,INK,BONE,3,()=>ctx.rect(-18,-32,36,32));
  S(ctx,BLOOD,null,0,()=>ctx.rect(-18,-13,36,7));
  ctx.beginPath(); ctx.moveTo(-10,-30); ctx.bezierCurveTo(-6,-28,-2,-28,2,-30);
  ctx.lineWidth=2; ctx.strokeStyle='rgba(232,223,200,.3)'; ctx.stroke();
  ctx.restore();

  /* cheeks */
  for(const s of[-1,1])
    S(ctx,'#f0c8c8',INK,1.5,()=>ctx.ellipse(s*16,6,9,7,s*.25,0,TAU));

  /* angry brows */
  for(const s of[-1,1]){
    ctx.save(); ctx.translate(s*12,-10); ctx.rotate(s*.65);
    ctx.beginPath(); ctx.moveTo(-10,2); ctx.lineTo(10,2);
    ctx.lineWidth=7; ctx.strokeStyle='rgba(0,0,0,.3)'; ctx.lineCap='round'; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-10,0); ctx.lineTo(10,0);
    ctx.lineWidth=5.5; ctx.strokeStyle=INK; ctx.stroke();
    ctx.restore();
  }

  /* manic eyes */
  for(const s of[-1,1]){
    S(ctx,'#fffff8',INK,3,()=>ctx.ellipse(s*11,0,9,9,0,0,TAU));
    S(ctx,'#c8e840',null,0,()=>ctx.arc(s*11,1,6,0,TAU));
    S(ctx,INK,null,0,()=>ctx.ellipse(s*11,1,3.5,4.5,sin(t,6,.2),0,TAU));
    S(ctx,'#fff',null,0,()=>ctx.arc(s*11-2,-0.5,1.8,0,TAU));
    ctx.beginPath(); ctx.moveTo(s*11-9,0); ctx.lineTo(s*11+9,0);
    ctx.lineWidth=3.5; ctx.strokeStyle=INK; ctx.lineCap='round'; ctx.stroke();
  }

  /* HANDLEBAR MUSTACHE */
  ctx.save(); ctx.translate(0,11);
  for(const s of[-1,1]){
    ctx.beginPath(); ctx.moveTo(s*2,0);
    ctx.bezierCurveTo(s*8,-5,s*18,-6,s*20,0);
    ctx.bezierCurveTo(s*18,5,s*10,8,s*14,4);
    ctx.lineWidth=5.5; ctx.strokeStyle=INK; ctx.lineCap='round'; ctx.stroke();
    ctx.lineWidth=3.5; ctx.strokeStyle=BONE; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(s*14,4);
    ctx.bezierCurveTo(s*18,0,s*22,-4,s*20,-8);
    ctx.lineWidth=4; ctx.strokeStyle=INK; ctx.stroke();
    ctx.lineWidth=2.5; ctx.strokeStyle=BONE; ctx.stroke();
  }
  ctx.restore();

  /* nose */
  S(ctx,'#f4b8a0',INK,2,()=>ctx.ellipse(0,5,6,5,0,0,TAU));

  /* grin + teeth */
  ctx.beginPath(); ctx.moveTo(-16,14); ctx.bezierCurveTo(-8,24,8,24,16,14);
  ctx.lineWidth=4; ctx.strokeStyle=INK; ctx.lineCap='round'; ctx.stroke();
  for(let i=0;i<5;i++){
    const tx=-10+i*5;
    S(ctx,BONE,INK,1.8,()=>{ ctx.moveTo(tx-3.5,14); ctx.lineTo(tx-3,21); ctx.lineTo(tx+3,21); ctx.lineTo(tx+3.5,14); ctx.closePath(); });
  }
  S(ctx,BLOOD,INK,2,()=>ctx.ellipse(0,20,7,5,0,0,TAU)); /* tongue */

  ctx.restore(); /* head */
  ctx.restore(); /* cat */
}

/* ══════════════════════════════════════════════════════════════
   SCISSORS — snapping above Itchy's head
══════════════════════════════════════════════════════════════ */
function drawScissors(ctx, x, y, t){
  ctx.save(); ctx.translate(x,y); ctx.rotate(-.45+sin(t,14,.18));
  const snap=sin(t,20,34);
  for(const s of[-1,1]){
    ctx.save(); ctx.rotate(s*snap*Math.PI/180);
    S(ctx,CREAM,INK,3.5,()=>ctx.arc(s*-3,s*13,14,0,TAU));
    S(ctx,'#c8b880',null,0,()=>ctx.arc(s*-3,s*13,9,0,TAU));
    S(ctx,INK,null,0,()=>ctx.arc(s*-3,s*13,5,0,TAU));
    ctx.beginPath(); ctx.arc(s*-3,s*13,14,0,TAU);
    ctx.setLineDash([3,3]); ctx.lineWidth=1.5; ctx.strokeStyle='rgba(232,223,200,.4)'; ctx.stroke(); ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(s*-3,s*4); ctx.bezierCurveTo(12,s*8,38,s*4,62,1);
    ctx.lineWidth=12; ctx.strokeStyle=CREAM; ctx.lineCap='round'; ctx.stroke();
    ctx.lineWidth=5;  ctx.strokeStyle=INK;   ctx.stroke();
    ctx.beginPath(); ctx.moveTo(20,s*5); ctx.bezierCurveTo(38,s*3.5,52,s*1.5,62,1);
    ctx.lineWidth=6; ctx.strokeStyle='#c8c0a0'; ctx.lineCap='round'; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(10,s*5); ctx.bezierCurveTo(30,s*4,50,s*2,62,1);
    ctx.lineWidth=2; ctx.strokeStyle='rgba(255,255,240,.5)'; ctx.stroke();
    ctx.restore();
  }
  S(ctx,BLOOD,INK,2.5,()=>ctx.arc(0,0,6,0,TAU));
  S(ctx,'#ff4444',null,0,()=>ctx.arc(-1,-1,2.5,0,TAU));
  if(Math.abs(sin(t,20))>.8){
    ctx.save(); ctx.translate(62,0);
    for(let i=0;i<6;i++){
      ctx.save(); ctx.rotate(i*Math.PI/3);
      ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(0,-8);
      ctx.lineWidth=2; ctx.strokeStyle='#fffff0'; ctx.globalAlpha=.7; ctx.stroke(); ctx.globalAlpha=1;
      ctx.restore();
    }
    ctx.restore();
  }
  ctx.restore();
}

/* ══════════════════════════════════════════════════════════════
   CLIPPY — polka-dot suit mouse with top hat
   Huge spiral panic eyes · spreading fingers · sweat beads
══════════════════════════════════════════════════════════════ */
function drawMouse(ctx, x, y, t, hatFlyOff=false){
  ctx.save(); ctx.translate(x,y);
  const lp=sin(t,16,.9);
  const scared=Math.abs(sin(t,22,1.8));
  const rawSqM=sin(t,16,.06)*Math.sign(lp);
  const sq=1+rawSqM*easeInOut(Math.abs(rawSqM)/.06);

  /* shadow */
  S(ctx,'rgba(0,0,0,.25)',null,0,()=>ctx.ellipse(0,4,36+sin(t,16,3),6,0,0,TAU));

  /* tail */
  ctx.save(); ctx.translate(18,-22);
  const tc=sin(t,10,.5);
  ctx.beginPath(); ctx.moveTo(0,0);
  ctx.bezierCurveTo(22+tc*14,-18,34,6+tc*12,22,22);
  ctx.bezierCurveTo(14,32,4,24,-8,36);
  ctx.lineWidth=6; ctx.strokeStyle=GREY; ctx.lineCap='round'; ctx.stroke();
  ctx.lineWidth=3; ctx.strokeStyle=INK;  ctx.stroke();
  ctx.restore();

  /* back legs */
  for(const [ox,ph] of[[-10,lp],[4,-lp]]){
    ctx.save(); ctx.translate(ox,-14); ctx.rotate(ph*.44);
    S(ctx,GREY,INK,3,()=>ctx.ellipse(0,0,6,14,0,0,TAU));
    ctx.translate(0,20); ctx.rotate(ph*.3+.22);
    S(ctx,GREY,INK,2.5,()=>ctx.ellipse(0,0,5,11,0,0,TAU));
    ctx.translate(0,13);
    const fq=1+clamp(-Math.min(ph,0),0,.9)*.28;
    ctx.scale(fq,1/fq);
    S(ctx,GREY,INK,2.5,()=>ctx.ellipse(5,0,12,5,0,0,TAU));
    ctx.restore();
  }

  /* body — polka-dot suit */
  ctx.save(); ctx.scale(sq,2-sq);
  S(ctx,SPOTS,INK,3,()=>ctx.ellipse(0,-26,22,26,0,0,TAU));
  /* polka dots */
  for(const [dx,dy] of[[-8,-32],[6,-28],[-4,-20],[8,-18],[-10,-18],[2,-38],[-14,-26],[10,-36]])
    S(ctx,'rgba(100,90,80,.3)',null,0,()=>ctx.arc(dx,dy,2.5,0,TAU));
  S(ctx,BONE,INK,1.5,()=>ctx.ellipse(0,-22,10,15,0,0,TAU));
  /* tiny bow tie */
  for(const s of[-1,1]){
    S(ctx,BLOOD,INK,1.5,()=>{ ctx.moveTo(s*1,-10); ctx.bezierCurveTo(s*5,-7,s*9,-7,s*10,-10); ctx.bezierCurveTo(s*9,-13,s*5,-13,s*1,-10); ctx.closePath(); });
  }
  S(ctx,BLOOD2,INK,1,()=>ctx.arc(0,-10,2,0,TAU));
  ctx.restore();

  /* front arms — flailing in panic */
  for(const [ox,ph,dir] of[[-10,-lp,-1],[8,lp,1]]){
    const panicRaise=scared*.4;
    ctx.save(); ctx.translate(ox,-36); ctx.rotate(ph*.35+dir*(-0.65+panicRaise));
    S(ctx,GREY,INK,3,()=>ctx.ellipse(0,0,5.5,12,0,0,TAU));
    ctx.translate(0,15); ctx.rotate(.2-ph*.2+panicRaise*.3);
    S(ctx,GREY,INK,2.5,()=>ctx.ellipse(0,0,4.5,9,0,0,TAU));
    S(ctx,GREY,INK,2,()=>ctx.arc(0,10,5.5,0,TAU));
    if(scared>.5){
      for(let f=0;f<4;f++){
        ctx.save(); ctx.translate(-4+f*2.8,10); ctx.rotate(-.3+f*.2+scared*.15);
        ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(0,-5);
        ctx.lineWidth=1.8; ctx.strokeStyle=INK; ctx.lineCap='round'; ctx.stroke();
        ctx.restore();
      }
    }
    ctx.restore();
  }

  /* HEAD */
  const hb=sin(t,16,2.5)+scared*.5;
  ctx.save(); ctx.translate(0,-56+hb);
  ctx.rotate(sin(t,28,.08)*scared);

  /* ears */
  for(const s of[-1,1]){
    S(ctx,GREY,INK,3.5,()=>ctx.ellipse(s*17,-2,12,12,s*.15,0,TAU));
    S(ctx,'#c09090',INK,2,()=>ctx.ellipse(s*17,-2,6.5,6.5,0,0,TAU));
    ctx.beginPath(); ctx.moveTo(s*17,-8); ctx.bezierCurveTo(s*13,-4,s*19,2,s*15,6);
    ctx.lineWidth=1.2; ctx.strokeStyle='rgba(180,100,100,.35)'; ctx.stroke();
  }

  /* head shape */
  S(ctx,'#141210',null,0,()=>ctx.ellipse(2,2,22,22,0,0,TAU));
  S(ctx,GREY,INK,4,()=>ctx.ellipse(0,0,22,22,0,0,TAU));

  /* TINY TOP HAT */
  if(!hatFlyOff){
    ctx.save(); ctx.translate(0,-20);
    S(ctx,INK,BONE,2.5,()=>ctx.ellipse(0,0,18,5,0,0,TAU));
    S(ctx,INK,BONE,2.5,()=>ctx.rect(-11,-18,22,18));
    S(ctx,BLOOD,null,0,()=>ctx.rect(-11,-7,22,5));
    S(ctx,BONE,null,0,()=>ctx.arc(4,-12,2,0,TAU));
    S(ctx,BONE,null,0,()=>ctx.arc(-4,-14,1.5,0,TAU));
    ctx.restore();
  }

  /* cheeks */
  for(const s of[-1,1])
    S(ctx,'rgba(220,140,140,.6)',null,0,()=>ctx.ellipse(s*14,6,8,6,s*.2,0,TAU));

  /* sweat drops */
  for(let sw=0;sw<3;sw++){
    const swT=((t*.6+sw*.4)%1);
    const swA=swT<.7?1:1-(swT-.7)/.3;
    ctx.globalAlpha=swA*.85;
    S(ctx,'#5599cc',INK,1.2,()=>{
      const swX=16+sw*5, swY=-14+swT*20, sz=2.5+sw*.8;
      ctx.moveTo(swX,swY-sz*1.5);
      ctx.bezierCurveTo(swX+sz,swY-sz,swX+sz,swY,swX,swY+sz*.5);
      ctx.bezierCurveTo(swX-sz,swY,swX-sz,swY-sz,swX,swY-sz*1.5); ctx.closePath();
    });
    ctx.globalAlpha=1;
  }

  /* HUGE SPIRAL PANIC EYES */
  for(const s of[-1,1]){
    S(ctx,'#fffff8',INK,3,()=>ctx.ellipse(s*9,0,10,12,0,0,TAU));
    for(let ring=1;ring<=2;ring++){
      ctx.beginPath(); ctx.arc(s*9,0,ring*2.5+scared*.5,0,TAU);
      ctx.lineWidth=1.2; ctx.strokeStyle=`rgba(180,180,160,${.25-.05*ring})`; ctx.stroke();
    }
    const epx=s*9+sin(t,34+s*3,2.8);
    const epy=cos(t,26+s*2,1.8);
    S(ctx,INK,null,0,()=>ctx.arc(epx,epy,3,0,TAU));
    S(ctx,'#fff',null,0,()=>ctx.arc(epx-.8,epy-.8,1.2,0,TAU));
    ctx.beginPath(); ctx.moveTo(s*9-9,5+scared*.5); ctx.bezierCurveTo(s*9-3,7+scared,s*9+3,7+scared,s*9+9,5+scared*.5);
    ctx.lineWidth=2; ctx.strokeStyle=INK; ctx.stroke();
  }

  /* nose */
  S(ctx,'#f4a8a8',INK,2,()=>ctx.ellipse(0,7,5.5,4,0,0,TAU));

  /* open O terror mouth */
  const mO=7+scared*3;
  S(ctx,INK,INK,2,()=>ctx.ellipse(0,16,mO*.9,mO,0,0,TAU));
  S(ctx,'#b06060',null,0,()=>ctx.ellipse(0,16.5,mO*.55,mO*.65,0,0,TAU));
  if(scared>1) S(ctx,'#cc6666',INK,1.2,()=>ctx.arc(0,19+sin(t,16,.5),2.5,0,TAU));

  /* whiskers */
  for(const s of[-1,1]){
    for(let w=0;w<3;w++){
      const wy=-2+w*6;
      ctx.beginPath(); ctx.moveTo(s*4,wy); ctx.quadraticCurveTo(s*14,wy+scared*.8*s,s*22,wy+scared*.4*s);
      ctx.lineWidth=1.4; ctx.strokeStyle=INK; ctx.globalAlpha=.4; ctx.stroke(); ctx.globalAlpha=1;
    }
  }

  ctx.restore(); /* head */
  ctx.restore(); /* mouse */
}

/* ── flying hat when Itchy lunges ── */
function drawFlyingHat(ctx, x, y, t){
  ctx.save(); ctx.translate(x,y); ctx.rotate(sin(t*3,1,.9));
  S(ctx,INK,BONE,2.5,()=>ctx.ellipse(0,0,18,5,0,0,TAU));
  S(ctx,INK,BONE,2.5,()=>ctx.rect(-11,-18,22,18));
  S(ctx,BLOOD,null,0,()=>ctx.rect(-11,-7,22,5));
  S(ctx,BONE,null,0,()=>ctx.arc(4,-12,2,0,TAU));
  ctx.restore();
}

/* ── background + shop ── */
function drawBg(ctx,W,H,t,bgCanvas){
  ctx.fillStyle='#080604'; ctx.fillRect(0,0,W,H);
  if(bgCanvas && bgCanvas.width>0 && bgCanvas.height>0){ ctx.globalAlpha=.9; ctx.drawImage(bgCanvas,0,0); ctx.globalAlpha=1; }
  ctx.save();
  const ray=(t*11)%110;
  for(let i=-3;i<(W+H)/110+3;i++){
    ctx.beginPath(); ctx.moveTo(i*110+ray,0); ctx.lineTo(i*110+ray-H*.65,H);
    ctx.lineWidth=1.5; ctx.strokeStyle=BONE; ctx.globalAlpha=.017; ctx.stroke();
  }
  ctx.globalAlpha=1; ctx.restore();
}

function drawShop(ctx,W,H,t){
  const gY=H-78;
  const tW=54,tH=32;
  ctx.save();
  ctx.beginPath(); ctx.rect(0,gY,W,H-gY); ctx.clip();
  for(let tx=0;tx<W;tx+=tW)
    for(let ty=gY;ty<H;ty+=tH){
      const shade=(Math.floor(tx/tW)+Math.floor((ty-gY)/tH))%2;
      ctx.fillStyle=shade?'#0e0b09':'#0b0806';
      ctx.fillRect(tx,ty,tW,tH);
      ctx.strokeStyle='rgba(232,223,200,.03)'; ctx.lineWidth=.8; ctx.strokeRect(tx,ty,tW,tH);
    }
  ctx.restore();
  ctx.beginPath();
  ctx.moveTo(0,gY); ctx.bezierCurveTo(W*.3,gY-6,W*.7,gY+6,W,gY);
  ctx.lineWidth=3; ctx.strokeStyle=BONE; ctx.globalAlpha=.55; ctx.stroke(); ctx.globalAlpha=1;
  ctx.beginPath();
  ctx.moveTo(0,gY); ctx.bezierCurveTo(W*.3,gY-6,W*.7,gY+6,W,gY);
  ctx.lineTo(W,H); ctx.lineTo(0,H); ctx.closePath();
  ctx.fillStyle='#0c0908'; ctx.fill();
  /* window left */
  ctx.save(); ctx.translate(40,80);
  S(ctx,'#0a1220',BONE,2,()=>ctx.rect(0,0,80,100));
  ctx.beginPath(); ctx.moveTo(40,0); ctx.lineTo(40,100); ctx.moveTo(0,50); ctx.lineTo(80,50);
  ctx.lineWidth=2; ctx.strokeStyle=BONE; ctx.globalAlpha=.5; ctx.stroke(); ctx.globalAlpha=1;
  S(ctx,'rgba(232,220,180,.12)',null,0,()=>ctx.arc(20+sin(t*.3,1,4),25,18,0,TAU));
  ctx.restore();
  /* barber pole */
  const po=(t*55)%20;
  const px=W-90,py=44,pw=28,ph=160;
  ctx.beginPath(); ctx.roundRect(px,py,pw,ph,14); ctx.fillStyle='#0a0806'; ctx.fill();
  ctx.lineWidth=3; ctx.strokeStyle=BONE; ctx.stroke();
  ctx.save();
  ctx.beginPath(); ctx.roundRect(px+2,py+2,pw-4,ph-4,12); ctx.clip();
  const sc=[BONE,'#111',BLOOD];
  for(let i=-2;i<(ph/20)+3;i++){ ctx.fillStyle=sc[((i%3)+3)%3]; ctx.fillRect(px+2,py+i*20+po,pw-4,20); }
  ctx.restore();
  ctx.beginPath(); ctx.roundRect(px,py,pw,ph,14); ctx.lineWidth=3; ctx.strokeStyle=BONE; ctx.stroke();
  for(const cy of[py,py+ph]) S(ctx,BONE,INK,2.5,()=>ctx.ellipse(px+pw/2,cy,pw/2+6,10,0,0,TAU));
  /* sign */
  ctx.fillStyle=INK; ctx.fillRect(px-30,py-32,pw+60,24);
  ctx.strokeStyle=BONE; ctx.lineWidth=2; ctx.strokeRect(px-30,py-32,pw+60,24);
  ctx.fillStyle=BONE; ctx.font=`bold 9px 'Bebas Neue',sans-serif`;
  ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('BARBERSHOPNEARME',px+pw/2,py-20);
  return gY;
}

/* ══════════════════════════════════════════════════════════════
   COMPONENT
══════════════════════════════════════════════════════════════ */
export default function LoadingScreen({ children }){
  const [phase,     setPhase]  = useState('title');
  const [exitDone,  setExit]   = useState(false);
  const [enterShow, setEnter]  = useState(false);

  const canvasRef  = useRef(null);
  const rafRef     = useRef(null);
  const progRef    = useRef(0);
  const tRef       = useRef(0);
  const lastRef    = useRef(null);
  const splatTRef  = useRef(2);
  const splatsRef  = useRef([]);
  const bgRef      = useRef({});
  const hatRef     = useRef({flying:false,x:0,y:0,vx:4,vy:-10});
  const titleRef   = useRef(null);
  const doneRef    = useRef(null);
  const loadRef    = useRef(null);
  const barRef     = useRef(null);
  const pctRef     = useRef(null);
  const lblRef     = useRef(null);
  const linesRef   = useRef(
    Array.from({length:8},()=>({
      y:10+Math.random()*340, speed:160+Math.random()*140,
      len:40+Math.random()*130, x:Math.random()*720,
      alpha:.025+Math.random()*.06, w:1+Math.random()*.8,
    }))
  );

  /* lock body scroll while animation is visible */
  useEffect(()=>{
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  },[])

  /* resize + build bg offscreen canvas */
  useEffect(()=>{
    const cv = canvasRef.current;

    function buildBg(W, H){
      const oc = document.createElement('canvas');
      oc.width = W; oc.height = H;
      const ox = oc.getContext('2d');
      for(let xx=0; xx<W; xx+=22)
        for(let yy=0; yy<H-78; yy+=22){
          const d = Math.hypot(xx-W/2, yy-H/2);
          const a = Math.max(0, .055-(d/W)*.055);
          ox.beginPath(); ox.arc(xx,yy,1.3,0,TAU);
          ox.fillStyle=BONE; ox.globalAlpha=a; ox.fill();
        }
      return oc;
    }

    function resize(){
      /* use parentElement size, fall back to hardcoded if not painted yet */
      const z = cv.parentElement;
      const W = z.offsetWidth  || 680;
      const H = z.offsetHeight || 360;
      cv.width  = W;
      cv.height = H;
      bgRef.current = { canvas: buildBg(W, H) };
    }

    /* defer first resize until after browser has painted the layout */
    requestAnimationFrame(()=>{
      requestAnimationFrame(()=>{
        resize();
      });
    });

    /* pause animation when tab is hidden */
    function onVisibility(){ if(document.hidden) lastRef.current=null; }
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  },[]);

  /* title → scene */
  useEffect(()=>{
    const id=setTimeout(()=>{
      if(titleRef.current) titleRef.current.classList.add('hidden');
      setTimeout(()=>setPhase('scene'),500);
    },3500);
    return()=>clearTimeout(id);
  },[]);

  /* main loop */
  useEffect(()=>{
    if(phase!=='scene') return;
    const cv=canvasRef.current;
    const ctx=cv.getContext('2d');
    let labelIdx=0;

    function spawnSplat(){
      splatsRef.current.push({
        word:SPLAT_WORDS[Math.floor(Math.random()*SPLAT_WORDS.length)],
        x:60+Math.random()*500, y:40+Math.random()*220,
        life:0, maxLife:1.3,
        rot:(Math.random()-.5)*.55,
        size:30+Math.random()*18,
      });
    }

    function frame(ts){
      if(!bgRef.current?.canvas || bgRef.current.canvas.width===0) { rafRef.current=requestAnimationFrame(frame); return; }
      if(!lastRef.current) lastRef.current=ts;
      const dt=Math.min((ts-lastRef.current)/1000,.016);
      lastRef.current=ts;
      tRef.current+=dt;
      const t=tRef.current;

      progRef.current=Math.min(100,progRef.current+.24+Math.random()*.02);
      const p=Math.round(progRef.current);
      if(barRef.current)  barRef.current.style.width=p+'%';
      if(pctRef.current)  pctRef.current.textContent=p+'%';
      const li=Math.min(LABELS.length-1,Math.floor(p/(100/LABELS.length)));
      if(li!==labelIdx){labelIdx=li;if(lblRef.current)lblRef.current.textContent=LABELS[li];}

      splatTRef.current-=dt;
      if(splatTRef.current<=0&&p>15){splatTRef.current=2.8+Math.random()*2.0;spawnSplat();}
      for(let i=splatsRef.current.length-1;i>=0;i--){
        const s=splatsRef.current[i]; s.life+=dt;
        if(s.life>s.maxLife) splatsRef.current.splice(i,1);
      }

      for(const l of linesRef.current){
        l.x-=l.speed*dt;
        if(l.x+l.len<0) l.x=cv.width+l.len;
      }

      const W=cv.width,H=cv.height;

      /* positions — cat eases in/out at screen edges */
      const cycle=14;
      const frac=(t%cycle)/cycle;
      const catRaw=frac<.08?easeInOut(frac/.08)*.04:frac>.92?.96+easeInOut((frac-.92)/.08)*.04:frac;
      const catEase=catRaw<.5?easeOut(catRaw*2)*.5:.5+easeOut((catRaw-.5)*2)*.5;
      const catX=lerp(-130,W+140,catEase);
      const mouseX=catX+108;
      const gap=mouseX-catX;
      const lunging=gap<130;

      /* flying hat physics */
      const hat=hatRef.current;
      if(lunging&&!hat.flying&&p>20){
        hat.flying=true; hat.x=mouseX-4; hat.y=H-78-52-18;
        hat.vx=3.5+Math.random()*3.5; hat.vy=-10-Math.random()*4;
      }
      if(!lunging&&hat.flying) hat.flying=false;
      if(hat.flying){
        hat.x+=hat.vx*dt*60; hat.y+=hat.vy*dt*60; hat.vy+=14*dt;
        if(hat.y>H) hat.flying=false;
      }

      const gY=H-78;
      const catBounce  =Math.pow(Math.abs(sin(t,14,1)),.35)*7;
      const mouseBounce=Math.pow(Math.abs(sin(t,16,1)),.35)*5.5;

      drawBg(ctx,W,H,t,bgRef.current?.canvas);

      /* speed lines */
      for(const l of linesRef.current){
        ctx.beginPath(); ctx.moveTo(l.x,l.y); ctx.lineTo(l.x+l.len,l.y);
        ctx.lineWidth=l.w; ctx.strokeStyle=BONE; ctx.globalAlpha=l.alpha; ctx.stroke(); ctx.globalAlpha=1;
      }

      drawShop(ctx,W,H,t);

      /* motion blur ghosts — only after enough time has passed */
      for(let i=3;i>0;i--){
        if(t < i*.042) continue;
        const bf=((t-i*.042)%cycle)/cycle;
        const br=bf<.08?easeInOut(bf/.08)*.04:bf>.92?.96+easeInOut((bf-.92)/.08)*.04:bf;
        const be=br<.5?easeOut(br*2)*.5:.5+easeOut((br-.5)*2)*.5;
        const bCatX=lerp(-130,W+140,be);
        const bMouseX=bCatX+108;
        ctx.globalAlpha=.05/i;
        drawMouse(ctx,bMouseX,gY-mouseBounce,t,hat.flying);
        drawCat(ctx,bCatX,gY-catBounce,t,lunging);
        ctx.globalAlpha=1;
      }

      drawMouse(ctx,mouseX,gY-mouseBounce,t,hat.flying);
      drawScissors(ctx,catX+50,gY-catBounce-90,t);
      drawCat(ctx,catX,gY-catBounce,t,lunging);
      if(hat.flying) drawFlyingHat(ctx,hat.x,hat.y,t);

      /* splat words */
      for(const s of splatsRef.current){
        const pp=s.life/s.maxLife;
        const sc2=pp<.15?easeOut(pp/.15)*1.2:pp<.6?1.2-easeInOut((pp-.15)/.45)*.22:0.98;
        const alpha=pp>.65?1-easeInOut((pp-.65)/.35):1;
        ctx.save(); ctx.translate(s.x,s.y); ctx.rotate(s.rot); ctx.scale(sc2,sc2);
        ctx.globalAlpha=alpha;
        ctx.font=`bold ${s.size}px 'Bebas Neue',sans-serif`;
        ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.fillStyle='rgba(0,0,0,.45)'; ctx.fillText(s.word,3,3);
        ctx.strokeStyle=BONE; ctx.lineWidth=6; ctx.lineJoin='round'; ctx.strokeText(s.word,0,0);
        ctx.fillStyle=BLOOD; ctx.fillText(s.word,0,0);
        ctx.globalAlpha=1; ctx.restore();
      }

      if(progRef.current>=100){
        if(lblRef.current) lblRef.current.textContent='Ready.';
        if(pctRef.current) pctRef.current.textContent='100%';
        if(barRef.current) barRef.current.style.width='100%';
        setTimeout(()=>{
          if(loadRef.current) loadRef.current.style.opacity='0';
          if(doneRef.current) doneRef.current.classList.add('show');
          setTimeout(()=>setEnter(true),480);
        },600);
        return;
      }
      rafRef.current=requestAnimationFrame(frame);
    }
    rafRef.current=requestAnimationFrame(frame);
    return()=>{if(rafRef.current)cancelAnimationFrame(rafRef.current);};
  },[phase]);

  const handleEnter=()=>{
    setPhase('exit');
    /* wait for full 700ms exit fade, THEN mount children */
    setTimeout(()=>setExit(true), 750);
  };
  if(exitDone) return <>{children}</>;
  const sprockets=Array.from({length:32});

  return(
    <>
      <style>{CSS}</style>
      <div className={`ls-root${phase==='exit'?' exit':''}`}>
        <div className="ls-wrap">
          <div className="ls-film">
            <div className="ls-sprockets top">{sprockets.map((_,i)=><div key={i} className="ls-sp"/>)}</div>
            <div className="ls-canvas-zone">
              <canvas ref={canvasRef}/>
              <div className="ls-vig"/>
              <div className="ls-grain"/>

              {/* TITLE CARD — & centered on its own line */}
              <div className="ls-title-overlay" ref={titleRef}>
                <div className="ls-eyebrow">Barbershopnearme presents</div>
                <div className="ls-title-main">
                  Itchy
                  <span className="ls-title-red">&amp;</span>
                  Clippy
                </div>
                <div className="ls-title-sub">— A Rubber Hose Tragedy —</div>
                <div className="ls-title-stars">
                  <div className="ls-tline"/>
                  <div className="ls-tstar"/><div className="ls-tstar b"/><div className="ls-tstar"/>
                  <div className="ls-tline"/>
                </div>
              </div>

              <div className="ls-done" ref={doneRef}>
                <div className="ls-done-title">The Chair<br/>Is Ready.</div>
                <div className="ls-done-sub">Barbershopnearme · Est. 2024<br/>Plano, TX</div>
                <button className={`ls-enter${enterShow?' show':''}`} onClick={handleEnter}>
                  Enter the Shop
                </button>
              </div>
            </div>
            <div className="ls-sprockets bot">{sprockets.map((_,i)=><div key={i} className="ls-sp"/>)}</div>
            <div className="ls-load" ref={loadRef}>
              <div className="ls-load-row">
                <span className="ls-load-lbl" ref={lblRef}>Loading...</span>
                <span className="ls-load-pct" ref={pctRef}>0%</span>
              </div>
              <div className="ls-load-track">
                <div className="ls-load-bar" ref={barRef}/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
