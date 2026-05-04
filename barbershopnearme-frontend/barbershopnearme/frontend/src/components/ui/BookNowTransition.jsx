import { useState, useEffect, useRef } from "react";

/*
  BARBERSHOPNEARME — Loading Screen v4
  ──────────────────────────────────────
  Same Itchy & Scratchy chase format as before.
  New characters:
    RAZOR RAZZ — a rubber-hose straight razor villain.
                 Chrome blade body, sinister eye on the spine,
                 tiny legs, white gloves, top hat.
                 Chases with the blade snapping open/closed.
    CURL — a terrified rubber-hose hair curl / wiggly strand.
           Bouncy spiral body, big white eyes, tiny arms,
           screaming mouth, sweat beads flying.
  Title: "Razz & Curl" — A Rubber Hose Trimming
*/

/* ── CSS ── */
const CSS = `
.bn-root{position:fixed;inset:0;z-index:9999;background:#050403;display:flex;align-items:center;justify-content:center;overflow:hidden;box-sizing:border-box;transition:opacity .5s ease,transform .5s ease;}
.bn-root.exit{opacity:0;transform:scale(.96) translateZ(0);pointer-events:none;transition:opacity .72s ease-in,transform .72s ease-in;}
.bn-wrap{width:min(96vw,700px);display:flex;flex-direction:column;flex-shrink:0;}
.bn-film{will-change:opacity;background:#050403;border:3px solid #E8DFC8;border-radius:14px 10px 16px 8px / 8px 16px 10px 14px;overflow:hidden;position:relative;}
.bn-sprockets{height:22px;background:#050403;display:flex;align-items:center;padding:0 6px;overflow:hidden;gap:2px;}
.bn-sprockets.top{border-bottom:2px solid #E8DFC8;}
.bn-sprockets.bot{border-top:2px solid #E8DFC8;}
.bn-sp{width:16px;height:13px;flex-shrink:0;border:2px solid #E8DFC8;border-radius:2px;background:#050403;}
.bn-canvas-zone{position:relative;height:340px;background:#050403;overflow:hidden;}
.bn-canvas-zone canvas{position:absolute;top:0;left:0;width:100%;height:100%;display:block;}
.bn-grain{position:absolute;inset:0;pointer-events:none;z-index:10;opacity:.09;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.82' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='256' height='256' filter='url(%23n)'/%3E%3C/svg%3E");animation:bn-grain .06s steps(1) infinite;}
/* Lock body scroll while animation is visible */
html:has(.bn-root),body:has(.bn-root){overflow:hidden!important;height:100%!important;}
html:has(.pt-root),body:has(.pt-root){overflow:hidden!important;height:100%!important;}
@keyframes bn-grain{0%{transform:translate(0,0)}25%{transform:translate(-3px,2px)}50%{transform:translate(2px,-2px)}75%{transform:translate(-2px,3px)}}
.bn-vig{position:absolute;inset:0;pointer-events:none;z-index:9;background:radial-gradient(ellipse at 50% 55%,transparent 32%,rgba(5,4,3,.72) 100%);}

/* TITLE */
.bn-title-overlay{position:absolute;inset:0;z-index:20;background:#050403;display:flex;flex-direction:column;align-items:center;justify-content:center;transition:opacity .65s cubic-bezier(.16,1,.3,1);}
.bn-title-overlay.hidden{opacity:0;pointer-events:none;}
.bn-eyebrow{font-family:'Courier Prime',monospace;font-size:11px;letter-spacing:.32em;text-transform:uppercase;color:rgba(232,223,200,.35);margin-bottom:16px;}
.bn-title-main{font-family:'Bebas Neue',sans-serif;font-size:clamp(54px,12vw,94px);line-height:.86;text-align:center;text-transform:uppercase;color:#E8DFC8;text-shadow:4px 4px 0 #8B1A1A;animation:bn-titlePop .65s cubic-bezier(.34,1.56,.64,1) both;}
@keyframes bn-titlePop{0%{transform:scaleY(2.5) scaleX(.55) rotate(-4deg);opacity:0;}100%{transform:none;opacity:1;}}
.bn-title-red{color:#8B1A1A;display:block;text-align:center;font-size:1.25em;line-height:1.1;animation:bn-redPulse 2.2s ease-in-out .65s infinite;}
@keyframes bn-redPulse{0%,100%{transform:scale(1) rotate(0deg);}50%{transform:scale(1.1) rotate(-2deg);}}
.bn-title-sub{font-family:'Boogaloo',cursive;font-size:15px;letter-spacing:.16em;text-transform:uppercase;color:rgba(232,223,200,.4);margin-top:14px;animation:bn-subFade .8s ease .45s both;}
@keyframes bn-subFade{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:none;}}
.bn-title-stars{display:flex;align-items:center;gap:14px;margin-top:20px;animation:bn-subFade .8s ease .65s both;}
.bn-tline{width:64px;height:1px;background:rgba(139,26,26,.4);}
.bn-tstar{width:12px;height:12px;background:#8B1A1A;clip-path:polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%);animation:bn-starSpin 2.5s linear infinite;}
.bn-tstar.b{background:#E8DFC8;animation-delay:.6s;animation-duration:3.5s;}
@keyframes bn-starSpin{to{transform:rotate(360deg);}}

/* DONE */
.bn-done{position:absolute;inset:0;z-index:20;background:#050403;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;opacity:0;pointer-events:none;transition:opacity .75s cubic-bezier(.16,1,.3,1);}
.bn-done.show{opacity:1;pointer-events:auto;}
.bn-done-title{font-family:'Bebas Neue',sans-serif;font-size:clamp(44px,9vw,76px);line-height:.88;text-transform:uppercase;text-align:center;color:#E8DFC8;text-shadow:4px 4px 0 #8B1A1A;animation:bn-titlePop .6s cubic-bezier(.34,1.56,.64,1) both;}
.bn-done-sub{font-family:'Courier Prime',monospace;font-size:11px;letter-spacing:.28em;text-transform:uppercase;color:rgba(232,223,200,.32);text-align:center;line-height:2.3;margin-top:6px;}

/* BAR */
.bn-load{background:#050403;border-top:2px solid #E8DFC8;padding:14px 32px 18px;transition:opacity .35s ease;}
.bn-load-row{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px;}
.bn-load-lbl{font-family:'Courier Prime',monospace;font-size:10px;letter-spacing:.28em;text-transform:uppercase;color:rgba(232,223,200,.38);}
.bn-load-pct{font-family:'Bebas Neue',sans-serif;font-size:17px;letter-spacing:.1em;color:#E8DFC8;}
.bn-load-track{height:10px;background:#0A0806;border:2px solid rgba(232,223,200,.25);border-radius:20px;overflow:hidden;}
.bn-load-bar{height:100%;width:0%;border-radius:20px;background:#8B1A1A;will-change:width;transition:width .25s cubic-bezier(.16,1,.3,1);position:relative;overflow:hidden;}
.bn-load-bar::after{content:'';position:absolute;inset:0;background:repeating-linear-gradient(90deg,transparent,transparent 7px,rgba(255,255,255,.09) 7px,rgba(255,255,255,.09) 9px);animation:bn-shim .65s linear infinite;}
@keyframes bn-shim{to{transform:translateX(9px);}}

/* ENTER */
.bn-enter{font-family:'Bebas Neue',sans-serif;font-size:16px;letter-spacing:.2em;text-transform:uppercase;background:#8B1A1A;color:#E8DFC8;border:3px solid #E8DFC8;border-radius:50px;padding:12px 40px;box-shadow:4px 4px 0 #E8DFC8;cursor:pointer;transform:scale(0);transition:transform .45s cubic-bezier(.34,1.56,.64,1),background .2s,box-shadow .15s;margin-top:10px;}
.bn-enter.show{transform:scale(1);}
.bn-enter:hover{background:#6B0F0F;transform:scale(1.07) rotate(-1.5deg);box-shadow:6px 6px 0 #E8DFC8;}
.bn-enter:active{transform:scale(.93);box-shadow:1px 1px 0 #E8DFC8;}
`;

/* ── palette ── */
const INK   = '#050403';
const BONE  = '#E8DFC8';
const BLOOD = '#8B1A1A';
const BLOOD2= '#6B0F0F';
const SILVER= '#d8d4c8';
const STEEL = '#a8a49a';
const STEEL2= '#8a8680';
const GOLD  = '#c8a840';
const CURL1 = '#c8b090'; /* hair strand warm tan */
const CURL2 = '#b09878';
const CURL3 = '#dcc8a8';

const LABELS      = ['Loading...','Sharpening the blade...','Heating the towel...','Outrunning the razor...','Almost ready...'];
const SPLAT_WORDS = ['SNIP!','SHAVE!','CLOSE!','TRIM!','EEK!','BUZZ!','CUT!'];

const lerp      = (a,b,t) => a+(b-a)*t;
const clamp     = (v,a,b) => Math.max(a,Math.min(b,v));
const easeInOut = t => t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
const easeOut   = t => 1-Math.pow(1-t,3);
const sin       = (t,f=1,a=1) => Math.sin(t*f)*a;
const cos       = (t,f=1,a=1) => Math.cos(t*f)*a;
const PI        = Math.PI;
const TAU       = PI*2;

function S(ctx,fill,stroke,lw,fn){
  ctx.beginPath();fn();
  if(fill){ctx.fillStyle=fill;ctx.fill();}
  if(stroke){ctx.lineWidth=lw||2.5;ctx.strokeStyle=stroke;ctx.stroke();}
}

/* ══════════════════════════════════════════════════════════════
   RAZOR RAZZ — the villain
   A chrome straight razor brought to life. Body IS the blade.
   Wears a tiny top hat, white gloves, spats. Pure menace.
══════════════════════════════════════════════════════════════ */
function drawRazor(ctx, x, y, t, lunging=false){
  ctx.save();
  ctx.translate(x, y);

  const lp  = sin(t, 16);
  const sq  = 1 + sin(t, 16, .065) * Math.sign(lp);
  if(lunging){ ctx.rotate(-.18); ctx.translate(10,-5); }

  /* ── SHADOW ── */
  S(ctx,`rgba(0,0,0,${lunging?.45:.25})`,null,0,
    ()=>ctx.ellipse(0,2,lunging?62:48,lunging?10:7,0,0,TAU));

  /* ── LEGS — tiny, stubby, very rubber hose ── */
  for(const [ox,ph] of [[-14,lp],[10,-lp]]){
    ctx.save(); ctx.translate(ox, 0);
    ctx.rotate(ph * .55);
    /* upper */
    S(ctx,STEEL,INK,2.5,()=>ctx.ellipse(0,0,6,14,0,0,TAU));
    ctx.translate(0,20); ctx.rotate(ph*.35+.2);
    /* lower */
    S(ctx,STEEL,INK,2.5,()=>ctx.ellipse(0,0,5,11,0,0,TAU));
    ctx.translate(0,13);
    /* SPAT shoe — white rubber hose shoe */
    const fq=1+clamp(-Math.min(ph,0),0,.9)*.32;
    ctx.scale(fq,1/fq);
    S(ctx,BONE,INK,3,()=>{
      ctx.moveTo(-10,0);
      ctx.bezierCurveTo(-12,-8,12,-8,12,0);
      ctx.bezierCurveTo(14,6,18,12,16,16);
      ctx.bezierCurveTo(6,20,-6,20,-16,16);
      ctx.bezierCurveTo(-18,12,-12,6,-10,0);
      ctx.closePath();
    });
    /* spat button */
    S(ctx,STEEL2,INK,1.2,()=>ctx.arc(6,8,2,0,TAU));
    /* shoe shine */
    ctx.beginPath();
    ctx.moveTo(-4,-4); ctx.bezierCurveTo(0,-8,6,-6,8,-2);
    ctx.lineWidth=1.5; ctx.strokeStyle='rgba(232,223,200,.35)'; ctx.stroke();
    ctx.restore();
  }

  /* ── BODY — the razor blade itself ── */
  ctx.save();
  ctx.scale(sq, 2-sq);
  /* blade body — long chrome ellipse, tilted slightly */
  ctx.save(); ctx.rotate(-.08);
  /* blade shadow */
  S(ctx,STEEL2,null,0,()=>ctx.ellipse(2,2-28,18,38,0,0,TAU));
  /* main blade */
  S(ctx,SILVER,INK,3.5,()=>ctx.ellipse(0,-28,18,38,0,0,TAU));
  /* blade highlight stripe */
  S(ctx,BONE,null,0,()=>{
    ctx.moveTo(-4,-54); ctx.bezierCurveTo(-2,-58,2,-58,4,-54);
    ctx.bezierCurveTo(6,-42,6,-14,4,4);
    ctx.bezierCurveTo(2,8,-2,8,-4,4);
    ctx.bezierCurveTo(-6,-14,-6,-42,-4,-54); ctx.closePath();
  });
  ctx.globalAlpha=.25; ctx.fill(); ctx.globalAlpha=1;
  /* edge line — the sharp edge */
  ctx.beginPath();
  ctx.moveTo(14,-62); ctx.lineTo(16,8);
  ctx.lineWidth=2.5; ctx.strokeStyle=BONE; ctx.globalAlpha=.7; ctx.stroke(); ctx.globalAlpha=1;
  ctx.restore(); /* blade tilt */

  /* HANDLE — inlaid dark handle at bottom */
  S(ctx,INK,STEEL2,3,()=>{
    ctx.moveTo(-12,4); ctx.bezierCurveTo(-14,8,-14,18,-12,22);
    ctx.bezierCurveTo(-6,28,6,28,12,22);
    ctx.bezierCurveTo(14,18,14,8,12,4);
    ctx.closePath();
  });
  /* handle rivets */
  for(const ry of[8,14,20])
    S(ctx,STEEL2,INK,1.2,()=>ctx.arc(-7,ry-28+44,2.5,0,TAU));
  ctx.restore(); /* body scale */

  /* ── ARMS — white gloves ── */
  /* right arm: raised, blade pointing forward with the body */
  ctx.save(); ctx.translate(16,-52);
  ctx.rotate(-1.2 + sin(t,16,.2));
  S(ctx,STEEL,INK,2.5,()=>ctx.ellipse(0,0,6,13,0,0,TAU));
  ctx.translate(0,16); ctx.rotate(-.3+sin(t,16,.15));
  S(ctx,STEEL,INK,2,()=>ctx.ellipse(0,0,5,10,0,0,TAU));
  /* white glove */
  S(ctx,BONE,INK,2.5,()=>ctx.arc(0,12,7.5,0,TAU));
  /* glove button */
  S(ctx,STEEL2,INK,1.2,()=>ctx.arc(4,8,2,0,TAU));
  ctx.restore();

  /* left arm: pumping */
  ctx.save(); ctx.translate(-16,-52);
  ctx.rotate(1.1 + lp*.45);
  S(ctx,STEEL,INK,2.5,()=>ctx.ellipse(0,0,6,12,0,0,TAU));
  ctx.translate(0,15); ctx.rotate(.3-lp*.28);
  S(ctx,STEEL,INK,2,()=>ctx.ellipse(0,0,5,9,0,0,TAU));
  S(ctx,BONE,INK,2.5,()=>ctx.arc(0,11,7,0,TAU));
  S(ctx,STEEL2,INK,1.2,()=>ctx.arc(4,7,2,0,TAU));
  ctx.restore();

  /* ── HEAD — emerges from top of blade ── */
  const hb  = sin(t,16,3.5);
  const htilt = sin(t,8,.09);
  ctx.save();
  ctx.translate(0,-80+hb);
  ctx.rotate(htilt);

  /* HEAD SHAPE — round, chrome-ish, villain */
  S(ctx,'#c0bcb2',null,0,()=>ctx.ellipse(2,2,22,20,0,0,TAU)); /* shadow */
  S(ctx,SILVER,INK,4,()=>ctx.ellipse(0,0,22,20,0,0,TAU));

  /* TOP HAT */
  ctx.save(); ctx.translate(0,-18);
  S(ctx,INK,BONE,3,()=>ctx.ellipse(0,2,26,7,0,0,TAU)); /* brim */
  S(ctx,INK,BONE,3,()=>ctx.rect(-16,-26,32,28)); /* body */
  /* hat band - gold */
  S(ctx,GOLD,INK,2,()=>ctx.rect(-16,-4,32,7));
  /* hat shine */
  ctx.beginPath(); ctx.moveTo(-8,-24); ctx.bezierCurveTo(-4,-26,4,-26,8,-24);
  ctx.lineWidth=2; ctx.strokeStyle='rgba(232,223,200,.25)'; ctx.stroke();
  ctx.restore();

  /* MONOCLE — villain essential */
  S(ctx,'rgba(180,220,255,.12)',GOLD,2.5,()=>ctx.arc(9,2,10,0,TAU));
  ctx.beginPath(); ctx.moveTo(18,2); ctx.lineTo(22,8);
  ctx.lineWidth=2; ctx.strokeStyle=GOLD; ctx.stroke();

  /* VILLAIN BROWS — sharp V-angles */
  for(const s of[-1,1]){
    ctx.save(); ctx.translate(s*10,-9);
    ctx.rotate(s*0.75);
    ctx.beginPath(); ctx.moveTo(-8,0); ctx.lineTo(8,0);
    ctx.lineWidth=5; ctx.strokeStyle=INK; ctx.lineCap='round'; ctx.stroke();
    ctx.restore();
  }

  /* EYES — one normal, one monocle */
  /* left eye — large and sinister */
  S(ctx,'#fffff0',INK,2.5,()=>ctx.ellipse(-9,1,7.5,8,0,0,TAU));
  S(ctx,BLOOD,null,0,()=>ctx.arc(-9,1,5.5,0,TAU)); /* red iris */
  S(ctx,INK,null,0,()=>ctx.ellipse(-9,1,3,4,sin(t,6,.2),0,TAU));
  S(ctx,'#fff',null,0,()=>ctx.arc(-9-.8,-0.5,1.5,0,TAU));
  /* right eye — monocle eye, smaller */
  S(ctx,'#fffff0',INK,2,()=>ctx.ellipse(9,2,5.5,6,0,0,TAU));
  S(ctx,BLOOD,null,0,()=>ctx.arc(9,2,4,0,TAU));
  S(ctx,INK,null,0,()=>ctx.ellipse(9,2,2.5,3,sin(t,6,.15),0,TAU));
  S(ctx,'#fff',null,0,()=>ctx.arc(8.2,.8,1.2,0,TAU));

  /* THIN VILLAIN MOUSTACHE */
  ctx.save(); ctx.translate(0,10);
  for(const s of[-1,1]){
    ctx.beginPath();
    ctx.moveTo(s*2,0);
    ctx.bezierCurveTo(s*6,-3,s*14,-4,s*16,-1);
    ctx.lineWidth=3.5; ctx.strokeStyle=INK; ctx.lineCap='round'; ctx.stroke();
    ctx.lineWidth=2; ctx.strokeStyle=STEEL2; ctx.stroke();
    /* curled tip */
    ctx.beginPath(); ctx.moveTo(s*16,-1);
    ctx.bezierCurveTo(s*19,2,s*18,6,s*15,5);
    ctx.lineWidth=3; ctx.strokeStyle=INK; ctx.stroke();
    ctx.lineWidth=1.8; ctx.strokeStyle=STEEL2; ctx.stroke();
  }
  ctx.restore();

  /* GRIN — thin cruel smile */
  ctx.beginPath();
  ctx.moveTo(-10,14); ctx.bezierCurveTo(-4,20,4,20,10,14);
  ctx.lineWidth=3; ctx.strokeStyle=INK; ctx.lineCap='round'; ctx.stroke();
  /* one gold tooth */
  S(ctx,GOLD,INK,1.5,()=>ctx.rect(-2,14,5,5));

  ctx.restore(); /* head */
  ctx.restore(); /* razor */
}

/* ══════════════════════════════════════════════════════════════
   BLADE FLASH — razor opens/closes with a glint when near
══════════════════════════════════════════════════════════════ */
function drawBladeFlash(ctx, x, y, t){
  ctx.save(); ctx.translate(x, y);
  ctx.rotate(-.4 + sin(t,16,.2));

  const snap = sin(t,22,32);

  for(const s of[-1,1]){
    ctx.save(); ctx.rotate(s*snap*PI/180);
    /* handle ring */
    S(ctx,STEEL,INK,3,()=>ctx.arc(s*-3,s*12,12,0,TAU));
    S(ctx,STEEL2,null,0,()=>ctx.arc(s*-3,s*12,6,0,TAU));
    S(ctx,INK,null,0,()=>ctx.arc(s*-3,s*12,3,0,TAU));
    /* blade */
    ctx.beginPath();
    ctx.moveTo(s*-3,s*4);
    ctx.bezierCurveTo(12,s*7,36,s*3,58,1);
    ctx.lineWidth=11; ctx.strokeStyle=SILVER; ctx.lineCap='round'; ctx.stroke();
    ctx.lineWidth=4;  ctx.strokeStyle=INK;    ctx.stroke();
    /* edge glint */
    ctx.beginPath();
    ctx.moveTo(14,s*5); ctx.bezierCurveTo(32,s*4,48,s*2,58,1);
    ctx.lineWidth=2; ctx.strokeStyle='rgba(255,255,240,.55)'; ctx.stroke();
    ctx.restore();
  }
  /* pivot gem */
  S(ctx,BLOOD,INK,2,()=>ctx.arc(0,0,5.5,0,TAU));
  S(ctx,'#ff6666',null,0,()=>ctx.arc(-1,-1,2.5,0,TAU));
  /* snip sparkle */
  if(Math.abs(sin(t,22))>.85){
    ctx.save(); ctx.translate(58,0);
    for(let i=0;i<8;i++){
      ctx.save(); ctx.rotate(i*PI/4);
      ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(0,-9);
      ctx.lineWidth=2; ctx.strokeStyle=BONE;
      ctx.globalAlpha=.8; ctx.stroke(); ctx.globalAlpha=1;
      ctx.restore();
    }
    ctx.restore();
  }
  ctx.restore();
}

/* ══════════════════════════════════════════════════════════════
   CURL — the victim
   A living hair curl/strand with googly eyes and tiny limbs.
   Bouncy, rubbery, absolutely terrified.
══════════════════════════════════════════════════════════════ */
function drawCurl(ctx, x, y, t, hatFlyOff=false){
  ctx.save(); ctx.translate(x, y);

  const lp     = sin(t,18,.9);
  const scared = Math.abs(sin(t,24,1.8));
  const rawSqM = sin(t,18,.06)*Math.sign(lp);
  const sq     = 1 + rawSqM * easeInOut(Math.abs(rawSqM)/.06);

  /* shadow */
  S(ctx,'rgba(0,0,0,.22)',null,0,()=>ctx.ellipse(0,4,32+sin(t,18,3),5,0,0,TAU));

  /* ── BODY — a bouncy spiral curl of hair ── */
  ctx.save(); ctx.scale(sq, 2-sq);

  /* draw 2.5 spiral loops as thick bezier curves */
  const curlWiggle = sin(t,12,.06);
  ctx.save(); ctx.rotate(curlWiggle);

  /* outer curl loop 1 */
  S(ctx,CURL1,INK,3.5,()=>{
    ctx.moveTo(0,-8);
    ctx.bezierCurveTo(24,-8, 28,12, 12,20);
    ctx.bezierCurveTo(-4,28, -22,20, -22,4);
    ctx.bezierCurveTo(-22,-14, -6,-28, 10,-28);
    ctx.bezierCurveTo(26,-28, 36,-14, 34,4);
  });
  /* outer curl loop 2 — slightly smaller, offset */
  S(ctx,CURL2,INK,3,()=>{
    ctx.moveTo(10,-28);
    ctx.bezierCurveTo(22,-28, 30,-18, 28,-6);
    ctx.bezierCurveTo(26,8, 14,16, 2,14);
    ctx.bezierCurveTo(-10,12, -16,2, -14,-8);
    ctx.bezierCurveTo(-12,-18, -4,-24, 4,-24);
  });
  /* inner curl highlight */
  S(ctx,CURL3,INK,2,()=>{
    ctx.moveTo(4,-24);
    ctx.bezierCurveTo(12,-24, 18,-16, 16,-8);
    ctx.bezierCurveTo(14,2, 6,6, 0,4);
  });
  /* curl center knot */
  S(ctx,CURL1,INK,2.5,()=>ctx.arc(2,0,8,0,TAU));
  S(ctx,CURL3,null,0,()=>ctx.ellipse(-1,-1,4,4,0,0,TAU));
  ctx.restore(); /* curl wiggle */

  /* TINY ARMS — stick out from the curl body */
  for(const [ox,oy,ph,dir] of [
    [-28,-12, -lp, -1],
    [28,-8,    lp,  1],
  ]){
    const panicRaise = scared*.55;
    ctx.save(); ctx.translate(ox, oy);
    ctx.rotate(ph*.4 + dir*(-0.7+panicRaise));
    S(ctx,CURL2,INK,3,()=>ctx.ellipse(0,0,5,12,0,0,TAU));
    ctx.translate(0,15); ctx.rotate(.2-ph*.2+panicRaise*.3);
    S(ctx,CURL2,INK,2.5,()=>ctx.ellipse(0,0,4,9,0,0,TAU));
    /* tiny fist */
    S(ctx,CURL3,INK,2,()=>ctx.arc(0,10,5.5,0,TAU));
    /* spread fingers when panicking */
    if(scared>.5){
      for(let f=0;f<4;f++){
        ctx.save(); ctx.translate(-4+f*2.8,10);
        ctx.rotate(-.3+f*.2+scared*.15);
        ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(0,-5);
        ctx.lineWidth=1.8; ctx.strokeStyle=INK; ctx.lineCap='round'; ctx.stroke();
        ctx.restore();
      }
    }
    ctx.restore();
  }

  /* TINY LEGS — peek out from bottom of the curl */
  for(const [ox,ph] of [[-10,lp],[6,-lp]]){
    ctx.save(); ctx.translate(ox,22);
    ctx.rotate(ph*.42);
    S(ctx,CURL2,INK,2.5,()=>ctx.ellipse(0,0,5,12,0,0,TAU));
    ctx.translate(0,16);
    const fq=1+clamp(-Math.min(ph,0),0,.8)*.28;
    ctx.scale(fq,1/fq);
    /* tiny shoe */
    S(ctx,INK,CURL1,2.5,()=>{
      ctx.moveTo(-8,0); ctx.bezierCurveTo(-9,-5,9,-5,9,0);
      ctx.bezierCurveTo(11,5,12,9,10,11);
      ctx.bezierCurveTo(5,14,-5,14,-10,11);
      ctx.bezierCurveTo(-12,9,-9,5,-8,0); ctx.closePath();
    });
    ctx.restore();
  }

  ctx.restore(); /* body scale */

  /* ── HEAD — big round, eyes wide with terror ── */
  const hb = sin(t,18,2.2) + scared*.5;
  ctx.save(); ctx.translate(0,-52+hb);
  ctx.rotate(sin(t,30,.07)*scared);

  /* MINI TOP HAT (flies off when razor is close) */
  if(!hatFlyOff){
    ctx.save(); ctx.translate(0,-18);
    S(ctx,INK,BONE,2.5,()=>ctx.ellipse(0,2,17,5,0,0,TAU));
    S(ctx,INK,BONE,2.5,()=>ctx.rect(-10,-16,20,18));
    /* tiny hat stripe */
    S(ctx,BLOOD,null,0,()=>ctx.rect(-10,-5,20,5));
    /* tiny curl on hat */
    ctx.beginPath();
    ctx.moveTo(-4,-14); ctx.bezierCurveTo(-2,-18,2,-18,4,-14);
    ctx.lineWidth=2; ctx.strokeStyle=CURL1; ctx.stroke();
    ctx.restore();
  }

  /* HEAD SHAPE — fluffy hair curl ball */
  S(ctx,CURL1,INK,4,()=>ctx.ellipse(0,0,21,20,0,0,TAU));
  /* fluffy texture bumps around edge */
  for(let i=0;i<8;i++){
    const ba=i*TAU/8+.2;
    const bx=Math.cos(ba)*18, by=Math.sin(ba)*17;
    S(ctx,CURL3,INK,2,()=>ctx.arc(bx,by,4.5+sin(t*2+i,1,.5),0,TAU));
  }
  /* main head fill on top */
  S(ctx,CURL1,INK,3,()=>ctx.ellipse(0,0,16,15,0,0,TAU));

  /* CHEEKS — rosy */
  for(const s of[-1,1])
    S(ctx,'rgba(220,140,120,.55)',null,0,()=>ctx.ellipse(s*12,6,8,6,s*.2,0,TAU));

  /* SWEAT DROPS — multiple, fly off in terror */
  for(let sw=0;sw<3;sw++){
    const swT=((t*.65+sw*.38)%1);
    const swX=17+sw*4, swY=-12+swT*22;
    const swA=swT<.65?1:1-(swT-.65)/.35;
    ctx.globalAlpha=swA*.8;
    S(ctx,'#5599dd',INK,1.2,()=>{
      ctx.moveTo(swX,swY-3.5);
      ctx.bezierCurveTo(swX+2.5,swY-2,swX+2.5,swY,swX,swY+2);
      ctx.bezierCurveTo(swX-2.5,swY,swX-2.5,swY-2,swX,swY-3.5);
      ctx.closePath();
    });
    ctx.globalAlpha=1;
  }

  /* EYES — huge googly terror eyes */
  for(const s of[-1,1]){
    /* big white oval */
    S(ctx,'#fffff8',INK,3,()=>ctx.ellipse(s*9,0,9,11,0,0,TAU));
    /* spiral panic ring */
    ctx.beginPath();
    ctx.arc(s*9,0,8,0,TAU);
    ctx.lineWidth=1.2; ctx.strokeStyle='rgba(200,180,160,.2)'; ctx.stroke();
    /* tiny darting pupil */
    const epx=s*9+sin(t,36+s*4,3);
    const epy=  cos(t,28+s*3,2);
    S(ctx,INK,null,0,()=>ctx.arc(epx,epy,3,0,TAU));
    S(ctx,'#fff',null,0,()=>ctx.arc(epx-.6,epy-.6,1.2,0,TAU));
    /* lower lid shake */
    ctx.beginPath();
    ctx.moveTo(s*9-8,5+scared*.6);
    ctx.bezierCurveTo(s*9-3,7+scared,s*9+3,7+scared,s*9+8,5+scared*.6);
    ctx.lineWidth=2; ctx.strokeStyle=INK; ctx.stroke();
  }

  /* NOSE — little button */
  S(ctx,'#c8a880',INK,1.8,()=>ctx.ellipse(0,6,4,3,0,0,TAU));

  /* MOUTH — big O of pure terror */
  const mO=7+scared*3.5;
  S(ctx,INK,INK,2.5,()=>ctx.ellipse(0,15,mO*.9,mO,0,0,TAU));
  S(ctx,'#a06050',null,0,()=>ctx.ellipse(0,15.5,mO*.55,mO*.6,0,0,TAU));
  /* tiny uvula */
  if(scared>1)
    S(ctx,'#cc7060',INK,1.2,()=>ctx.arc(0,18+sin(t,18,.5),2.2,0,TAU));

  /* EYEBROWS — arched up in terror */
  for(const s of[-1,1]){
    ctx.save(); ctx.translate(s*9,-12+scared*2);
    ctx.rotate(s*(-.4-scared*.2));
    ctx.beginPath(); ctx.moveTo(-7,0); ctx.bezierCurveTo(-3,-4,3,-4,7,0);
    ctx.lineWidth=3.5; ctx.strokeStyle=CURL2; ctx.lineCap='round'; ctx.stroke();
    ctx.restore();
  }

  ctx.restore(); /* head */
  ctx.restore(); /* curl */
}

/* ══════════════════════════════════════════════════════════════
   FLYING HAT — flies off Curl when razor is very close
══════════════════════════════════════════════════════════════ */
function drawFlyingHat(ctx, x, y, t){
  ctx.save(); ctx.translate(x,y);
  ctx.rotate(sin(t*2.8,1,.9));
  S(ctx,INK,BONE,2.5,()=>ctx.ellipse(0,2,17,5,0,0,TAU));
  S(ctx,INK,BONE,2.5,()=>ctx.rect(-10,-16,20,18));
  S(ctx,BLOOD,null,0,()=>ctx.rect(-10,-5,20,5));
  ctx.restore();
}

/* ══════════════════════════════════════════════════════════════
   BACKGROUND
══════════════════════════════════════════════════════════════ */
function drawBg(ctx,W,H,t,bgCanvas){
  ctx.fillStyle='#080604'; ctx.fillRect(0,0,W,H);
  if(bgCanvas){ ctx.globalAlpha=.88; ctx.drawImage(bgCanvas,0,0); ctx.globalAlpha=1; }
  ctx.save();
  const ray=(t*11)%110;
  for(let i=-3;i<(W+H)/110+3;i++){
    const rx=i*110+ray;
    ctx.beginPath(); ctx.moveTo(rx,0); ctx.lineTo(rx-H*.65,H);
    ctx.lineWidth=1.5; ctx.strokeStyle=BONE; ctx.globalAlpha=.017; ctx.stroke();
  }
  ctx.globalAlpha=1; ctx.restore();
}

function drawShop(ctx,W,H,t){
  const gY=H-78;

  /* checkerboard floor */
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

  /* ground line with bezier wobble */
  ctx.beginPath();
  ctx.moveTo(0,gY); ctx.bezierCurveTo(W*.28,gY-5,W*.72,gY+5,W,gY);
  ctx.lineWidth=3; ctx.strokeStyle=BONE; ctx.globalAlpha=.55; ctx.stroke(); ctx.globalAlpha=1;
  ctx.beginPath();
  ctx.moveTo(0,gY); ctx.bezierCurveTo(W*.28,gY-5,W*.72,gY+5,W,gY);
  ctx.lineTo(W,H); ctx.lineTo(0,H); ctx.closePath();
  ctx.fillStyle='#0c0908'; ctx.fill();

  /* MIRROR left wall */
  ctx.save(); ctx.translate(60,55);
  S(ctx,'#0a1018','rgba(232,223,200,.5)',2.5,()=>{
    ctx.moveTo(8,0); ctx.bezierCurveTo(8,-8,16,-14,24,-14);
    ctx.lineTo(100,-14); ctx.bezierCurveTo(108,-14,116,-8,116,0);
    ctx.lineTo(116,148); ctx.bezierCurveTo(116,156,108,162,100,162);
    ctx.lineTo(24,162); ctx.bezierCurveTo(16,162,8,156,8,148); ctx.closePath();
  });
  /* mirror frame */
  S(ctx,'#1a1208',STEEL2,2,()=>{
    ctx.moveTo(0,-4); ctx.bezierCurveTo(0,-12,10,-20,24,-20);
    ctx.lineTo(100,-20); ctx.bezierCurveTo(114,-20,124,-12,124,-4);
    ctx.lineTo(124,152); ctx.bezierCurveTo(124,166,114,168,100,168);
    ctx.lineTo(24,168); ctx.bezierCurveTo(10,168,0,166,0,152); ctx.closePath();
  });
  /* reflection glint */
  ctx.beginPath(); ctx.moveTo(20,10); ctx.bezierCurveTo(28,6,52,4,64,10);
  ctx.lineWidth=2; ctx.strokeStyle='rgba(232,223,200,.08)'; ctx.stroke();
  ctx.restore();

  /* BARBER POLE right */
  const po=(t*55)%20;
  const px=W-88,py=42,pw=26,ph=156;
  ctx.beginPath(); ctx.roundRect(px,py,pw,ph,13); ctx.fillStyle='#0a0806'; ctx.fill();
  ctx.lineWidth=3; ctx.strokeStyle=BONE; ctx.stroke();
  ctx.save();
  ctx.beginPath(); ctx.roundRect(px+2,py+2,pw-4,ph-4,11); ctx.clip();
  const sc=[BONE,'#111',BLOOD];
  for(let i=-2;i<(ph/20)+3;i++){
    ctx.fillStyle=sc[((i%3)+3)%3]; ctx.fillRect(px+2,py+i*20+po,pw-4,20);
  }
  ctx.restore();
  ctx.beginPath(); ctx.roundRect(px,py,pw,ph,13); ctx.lineWidth=3; ctx.strokeStyle=BONE; ctx.stroke();
  for(const cy of[py,py+ph])
    S(ctx,BONE,INK,2.5,()=>ctx.ellipse(px+pw/2,cy,pw/2+5,9,0,0,TAU));

  /* sign */
  ctx.fillStyle=INK; ctx.fillRect(px-28,py-30,pw+56,24);
  ctx.strokeStyle=BONE; ctx.lineWidth=2; ctx.strokeRect(px-28,py-30,pw+56,24);
  ctx.fillStyle=BONE;
  ctx.font=`bold 9px 'Bebas Neue',sans-serif`;
  ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText('BARBERSHOPNEARME',px+pw/2,py-18);

  return gY;
}

/* ══════════════════════════════════════════════════════════════
   COMPONENT
══════════════════════════════════════════════════════════════ */
export default function BookNowTransition({ onDone }){
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

  const titleRef  = useRef(null);
  const doneRef   = useRef(null);
  const loadRef   = useRef(null);
  const barRef    = useRef(null);
  const pctRef    = useRef(null);
  const lblRef    = useRef(null);

  const linesRef = useRef(
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
      const z = cv.parentElement;
      const W = z.offsetWidth  || 680;
      const H = z.offsetHeight || 360;
      cv.width  = W;
      cv.height = H;
      bgRef.current = { canvas: buildBg(W, H) };
    }

    requestAnimationFrame(()=>{
      requestAnimationFrame(()=>{ resize(); });
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
        life:0,maxLife:1.3,
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

      /* progress */
      progRef.current=Math.min(100,progRef.current+.24+Math.random()*.02);
      const p=Math.round(progRef.current);
      if(barRef.current)  barRef.current.style.width=p+'%';
      if(pctRef.current)  pctRef.current.textContent=p+'%';
      const li=Math.min(LABELS.length-1,Math.floor(p/(100/LABELS.length)));
      if(li!==labelIdx){labelIdx=li;if(lblRef.current)lblRef.current.textContent=LABELS[li];}

      /* splats */
      splatTRef.current-=dt;
      if(splatTRef.current<=0&&p>15){splatTRef.current=2.8+Math.random()*2.0;spawnSplat();}
      for(let i=splatsRef.current.length-1;i>=0;i--){
        const s=splatsRef.current[i]; s.life+=dt;
        if(s.life>s.maxLife) splatsRef.current.splice(i,1);
      }

      /* speed lines */
      for(const l of linesRef.current){
        l.x-=l.speed*dt;
        if(l.x+l.len<0) l.x=cv.width+l.len;
      }

      const W=cv.width,H=cv.height;

      /* character positions */
      const cycle=14;
      const frac=(t%cycle)/cycle;
      const catRaw = frac<.08?easeInOut(frac/.08)*.04
                   : frac>.92?.96+easeInOut((frac-.92)/.08)*.04
                   : frac;
      const catEase=catRaw<.5?easeOut(catRaw*2)*.5:.5+easeOut((catRaw-.5)*2)*.5;
      const razorX=lerp(-130,W+140,catEase);
      const curlX=razorX+108;
      const gap=curlX-razorX;
      const lunging=gap<125;

      /* flying hat */
      const hat=hatRef.current;
      if(lunging&&!hat.flying&&p>20){
        hat.flying=true; hat.x=curlX-4; hat.y=H-78-52-18;
        hat.vx=3.5+Math.random()*3.5; hat.vy=-10-Math.random()*4;
      }
      if(!lunging&&hat.flying) hat.flying=false;
      if(hat.flying){
        hat.x+=hat.vx*dt*60; hat.y+=hat.vy*dt*60; hat.vy+=14*dt;
        if(hat.y>H) hat.flying=false;
      }

      const gY=H-78;
      const razorBounce=Math.pow(Math.abs(sin(t,16,1)),.35)*7;
      const curlBounce =Math.pow(Math.abs(sin(t,18,1)),.35)*5.5;

      /* draw */
      drawBg(ctx,W,H,t,bgRef.current?.canvas);

      /* speed lines */
      for(const l of linesRef.current){
        ctx.beginPath(); ctx.moveTo(l.x,l.y); ctx.lineTo(l.x+l.len,l.y);
        ctx.lineWidth=l.w; ctx.strokeStyle=BONE;
        ctx.globalAlpha=l.alpha; ctx.stroke(); ctx.globalAlpha=1;
      }

      drawShop(ctx,W,H,t);

      /* motion blur ghosts */
      for(let i=2;i>0;i--){
        const blurFrac=((t-i*.042)%cycle)/cycle;
        const blurRaw=blurFrac<.08?easeInOut(blurFrac/.08)*.04:blurFrac>.92?.96+easeInOut((blurFrac-.92)/.08)*.04:blurFrac;
        const blurEase=blurRaw<.5?easeOut(blurRaw*2)*.5:.5+easeOut((blurRaw-.5)*2)*.5;
        const blurRX=lerp(-130,W+140,blurEase);
        const blurCX=blurRX+108;
        ctx.globalAlpha=.05/i;
        drawCurl(ctx,blurCX,gY-curlBounce,t,hat.flying);
        drawRazor(ctx,blurRX,gY-razorBounce,t,lunging);
        ctx.globalAlpha=1;
      }

      /* main characters */
      drawCurl(ctx,curlX,gY-curlBounce,t,hat.flying);
      drawBladeFlash(ctx,razorX+52,gY-razorBounce-88,t);
      drawRazor(ctx,razorX,gY-razorBounce,t,lunging);

      /* flying hat */
      if(hat.flying) drawFlyingHat(ctx,hat.x,hat.y,t);

      /* splat words */
      for(const s of splatsRef.current){
        const pp=s.life/s.maxLife;
        const sc2=pp<.15?easeOut(pp/.15)*1.2:pp<.6?1.2-easeInOut((pp-.15)/.45)*.22:0.98;
        const alpha=pp>.65?1-easeInOut((pp-.65)/.35):1;
        ctx.save();
        ctx.translate(s.x,s.y); ctx.rotate(s.rot); ctx.scale(sc2,sc2);
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
    /* wait for full exit fade (700ms) before unmounting and navigating */
    setTimeout(()=>{ setExit(true); onDone?.(); }, 720);
  };
  if(exitDone) return null;
  const sprockets=Array.from({length:32});

  return(
    <>
      <style>{CSS}</style>
      <div className={`bn-root${phase==='exit'?' exit':''}`}>
        <div className="bn-wrap">
          <div className="bn-film">
            <div className="bn-sprockets top">{sprockets.map((_,i)=><div key={i} className="bn-sp"/>)}</div>
            <div className="bn-canvas-zone">
              <canvas ref={canvasRef}/>
              <div className="bn-vig"/>
              <div className="bn-grain"/>

              <div className="bn-title-overlay" ref={titleRef}>
                <div className="bn-eyebrow">Barbershopnearme presents</div>
                <div className="bn-title-main">
                  The
                  <span className="bn-title-red">Chair</span>
                  Awaits
                </div>
                <div className="bn-title-sub">— Razz &amp; Curl — A Close Shave —</div>
                <div className="bn-title-stars">
                  <div className="bn-tline"/>
                  <div className="bn-tstar"/><div className="bn-tstar b"/><div className="bn-tstar"/>
                  <div className="bn-tline"/>
                </div>
              </div>

              <div className="bn-done" ref={doneRef}>
                <div className="bn-done-title">Ready to<br/>Book.</div>
                <div className="bn-done-sub">Barbershopnearme · Est. 2024<br/>Plano, TX</div>
                <button className={`bn-enter${enterShow?' show':''}`} onClick={handleEnter}>
                  Enter the Portal
                </button>
              </div>
            </div>
            <div className="bn-sprockets bot">{sprockets.map((_,i)=><div key={i} className="bn-sp"/>)}</div>
            <div className="bn-load" ref={loadRef}>
              <div className="bn-load-row">
                <span className="bn-load-lbl" ref={lblRef}>Loading...</span>
                <span className="bn-load-pct" ref={pctRef}>0%</span>
              </div>
              <div className="bn-load-track">
                <div className="bn-load-bar" ref={barRef}/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
