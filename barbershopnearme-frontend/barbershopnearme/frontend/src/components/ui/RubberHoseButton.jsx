import { useRef, useEffect, useCallback } from 'react'

/*
  RubberHoseButton — v3
  ──────────────────────
  A rubber-hose cartoon hand rises from below, reaches up,
  and physically covers+presses the button on hover/click.

  How the layering works:
    - The wrapper has position:relative and NO overflow:hidden
    - A transparent <div> sits over the button to catch mouse events
    - The canvas is position:absolute, z-index ABOVE the button
      so the hand visually covers it
    - Canvas height = tall enough that the hand draws above the button
    - The button text fades out as the hand covers it (opacity tied to hand height)

  Props:
    variant   'primary' | 'ghost' | 'book'
    onClick   click handler
    children  label
    splat     word that pops on click
    disabled
    style / className — forwarded to the button element
*/

/* ── palette ── */
const INK   = '#070504'
const BONE  = '#E8DFC8'
const SKIN  = '#C8986A'
const SKIN2 = '#A07040'
const SKIN3 = '#DEB888'
const SKIN4 = '#8B5E38'  /* deep shadow */
const BLOOD = '#8B1A1A'
const BLOOD2= '#6B0F0F'
const TAU   = Math.PI * 2

/* ── math utils ── */
const lerp     = (a, b, t) => a + (b - a) * t
const clamp    = (v, lo, hi) => Math.max(lo, Math.min(hi, v))
const easeOut3 = t => 1 - Math.pow(1 - t, 3)
const easeOut5 = t => 1 - Math.pow(1 - t, 5)
const spring   = t => {
  /* overshoot spring — settles at 1 */
  if (t <= 0) return 0
  if (t >= 1) return 1
  return 1 - Math.pow(Math.E, -5 * t) * Math.cos(4 * Math.PI * t * .5)
}
const sn = (t, f, a = 1) => Math.sin(t * f) * a
const cs = (t, f, a = 1) => Math.cos(t * f) * a

/* ── shape helper ── */
function S(ctx, fill, stroke, lw, fn) {
  ctx.beginPath()
  fn()
  if (fill)   { ctx.fillStyle   = fill;        ctx.fill()   }
  if (stroke) { ctx.lineWidth   = lw || 2.5;
                ctx.strokeStyle = stroke;       ctx.stroke() }
}

/* ──────────────────────────────────────────────────────────
   DRAW HAND
   cx,cy = wrist anchor (centre of palm base)
   stretch = vertical scale for rubber hose elongation
   squash  = horizontal scale (inverse of stretch)
   pressT  = 0..1  how far through a press
   hoverT  = 0..1  settled-on-button amount
   t       = absolute time for idle animation
────────────────────────────────────────────────────────── */
function drawHand(ctx, cx, cy, stretch, squash, pressT, hoverT, t) {
  ctx.save()
  ctx.translate(cx, cy)
  ctx.scale(squash, stretch)

  /* ── SLEEVE / CUFF — drawn first so fingers sit on top ── */
  ctx.save()
  ctx.translate(0, 36)

  /* sleeve shadow */
  S(ctx, 'rgba(0,0,0,.3)', null, 0, () => {
    ctx.moveTo(-46, 4)
    ctx.bezierCurveTo(-46, 54, -24, 72, 0, 72)
    ctx.bezierCurveTo(24, 72, 46, 54, 46, 4)
    ctx.closePath()
  })
  /* blood-red barber coat sleeve */
  S(ctx, BLOOD, INK, 4, () => {
    ctx.moveTo(-44, 0)
    ctx.bezierCurveTo(-44, 52, -22, 70, 0, 70)
    ctx.bezierCurveTo(22, 70, 44, 52, 44, 0)
    ctx.closePath()
  })
  /* bone white cuff band */
  S(ctx, BONE, INK, 2.5, () => {
    ctx.moveTo(-40,  4); ctx.bezierCurveTo(-40, 18, -22, 28, 0, 28)
    ctx.bezierCurveTo(22, 28, 40, 18, 40, 4)
    ctx.lineTo(40, -2); ctx.bezierCurveTo(40, -14, 22, -20, 0, -20)
    ctx.bezierCurveTo(-22, -20, -40, -14, -40, -2)
    ctx.closePath()
  })
  /* cuff button */
  S(ctx, INK, BONE, 1.8, () => ctx.arc(0, 16, 4.5, 0, TAU))
  S(ctx, BONE, null, 0,   () => ctx.arc(0, 16, 2,   0, TAU))
  /* sleeve pinstripes */
  for (const sx of [-20, 0, 20]) {
    ctx.beginPath()
    ctx.moveTo(sx, -18)
    ctx.bezierCurveTo(sx, 20, sx, 40, sx * 1.1, 60)
    ctx.lineWidth = 1.2
    ctx.strokeStyle = 'rgba(232,223,200,.12)'
    ctx.stroke()
  }
  ctx.restore()

  /* ── PALM ── */
  /* cast shadow */
  S(ctx, 'rgba(0,0,0,.28)', null, 0, () =>
    ctx.ellipse(4, 8, 38, 26, 0, 0, TAU))

  /* main palm shape */
  S(ctx, SKIN, INK, 4, () => {
    ctx.moveTo(-38, 0)
    ctx.bezierCurveTo(-40, -42, -22, -58, 0, -60)
    ctx.bezierCurveTo(22, -58, 40, -42, 38, 0)
    ctx.bezierCurveTo(38, 28, 22, 38, 0, 38)
    ctx.bezierCurveTo(-22, 38, -38, 28, -38, 0)
    ctx.closePath()
  })

  /* palm highlights */
  S(ctx, SKIN3, null, 0, () => {
    ctx.moveTo(-18, -52); ctx.bezierCurveTo(-10, -58, 10, -58, 18, -52)
    ctx.bezierCurveTo(10, -46, -10, -46, -18, -52); ctx.closePath()
  })

  /* palm creases */
  for (const [y1, y2, alpha] of [[-8, 2, .55], [-20, -12, .38], [-32, -26, .25]]) {
    ctx.beginPath()
    ctx.moveTo(-28, y1); ctx.quadraticCurveTo(0, y2, 28, y1)
    ctx.lineWidth = 1.8; ctx.strokeStyle = SKIN2
    ctx.globalAlpha = alpha; ctx.stroke(); ctx.globalAlpha = 1
  }

  /* knuckle row */
  for (const [kx, ky] of [[-25, -54], [-10, -57], [5, -56], [20, -53]]) {
    S(ctx, SKIN3, SKIN2, 1.8, () => ctx.ellipse(kx, ky, 8, 6, 0, 0, TAU))
  }

  /* ── THUMB — left side ── */
  ctx.save()
  ctx.translate(-36, -8)
  ctx.rotate(-0.8 + sn(t, 2.8, .06) + pressT * .15)
  /* upper thumb */
  S(ctx, SKIN, INK, 3, () => ctx.ellipse(0, -20, 12, 22, 0, 0, TAU))
  S(ctx, SKIN3, null, 0, () => ctx.ellipse(-3, -28, 6, 8, -.2, 0, TAU))
  /* thumb knuckle */
  ctx.beginPath()
  ctx.moveTo(-9, -12); ctx.quadraticCurveTo(0, -10, 9, -12)
  ctx.lineWidth = 1.8; ctx.strokeStyle = SKIN2; ctx.stroke()
  /* fingertip */
  ctx.save(); ctx.translate(0, -38)
  S(ctx, SKIN3, SKIN2, 1.8, () => ctx.ellipse(0, 0, 10, 9.5, 0, 0, TAU))
  /* nail */
  S(ctx, 'rgba(255,240,220,.65)', null, 0, () => {
    ctx.moveTo(-5, -2); ctx.bezierCurveTo(-5, -8, 5, -8, 5, -2); ctx.closePath()
  })
  ctx.restore()
  ctx.restore()

  /* ── 4 FINGERS ── */
  const fingerDefs = [
    { x: -23, baseA: -.14, len: 65,  w: 9   },  /* index  */
    { x:  -8, baseA: -.05, len: 74,  w: 10  },  /* middle */
    { x:   7, baseA:  .05, len: 70,  w: 9.5 },  /* ring   */
    { x:  22, baseA:  .16, len: 54,  w: 8.5 },  /* pinky  */
  ]

  /* spread fingers slightly when hovering */
  const spreadAmt  = lerp(0, .09, hoverT)
  /* curl inward when pressing */
  const curlAmt    = lerp(0, .22, pressT)
  /* rubber-hose stretch length */
  const lenStretch = lerp(1, 1.15, clamp((stretch - 1) * 5, 0, 1))

  for (let i = 0; i < 4; i++) {
    const f  = fingerDefs[i]
    const fa = f.baseA + (i - 1.5) * spreadAmt - curlAmt * .35
    const fl = f.len * lenStretch

    ctx.save()
    ctx.translate(f.x, -57)
    ctx.rotate(fa)

    /* ── proximal phalange ── */
    /* shadow */
    S(ctx, SKIN4, null, 0, () => ctx.ellipse(1.5, -fl * .28 + 2, f.w - 1, fl * .3, 0, 0, TAU))
    /* main */
    S(ctx, SKIN, INK, 2.5, () => ctx.ellipse(0, -fl * .28, f.w, fl * .3, 0, 0, TAU))
    /* highlight */
    S(ctx, SKIN3, null, 0, () => ctx.ellipse(-f.w * .25, -fl * .38, f.w * .4, fl * .12, -.2, 0, TAU))
    /* MCP knuckle dot */
    S(ctx, SKIN2, INK, 1.5, () => ctx.arc(0, -fl * .05, 3.8, 0, TAU))

    /* ── medial phalange ── */
    ctx.save()
    ctx.translate(0, -fl * .56)
    S(ctx, SKIN4, null, 0, () => ctx.ellipse(1.5, -fl * .2 + 2, f.w - 1.5, fl * .22, 0, 0, TAU))
    S(ctx, SKIN, INK, 2, () => ctx.ellipse(0, -fl * .2, f.w - .5, fl * .22, 0, 0, TAU))
    S(ctx, SKIN3, null, 0, () => ctx.ellipse(-f.w * .25, -fl * .28, f.w * .35, fl * .1, -.2, 0, TAU))
    /* PIP crease */
    ctx.beginPath()
    ctx.moveTo(-(f.w * .7), -fl * .06)
    ctx.quadraticCurveTo(0, -fl * .04, f.w * .7, -fl * .06)
    ctx.lineWidth = 1.8; ctx.strokeStyle = SKIN2; ctx.stroke()

    /* ── distal phalange + fingertip ── */
    ctx.save()
    ctx.translate(0, -fl * .38)
    S(ctx, SKIN4, null, 0, () => ctx.ellipse(1.5, 1.5, f.w * .82, f.w * .88, 0, 0, TAU))
    S(ctx, SKIN3, SKIN2, 1.8, () => ctx.ellipse(0, 0, f.w * .82, f.w * .88, 0, 0, TAU))
    /* fingernail */
    S(ctx, 'rgba(255,240,220,.6)', null, 0, () => {
      ctx.moveTo(-f.w * .4, -f.w * .3)
      ctx.bezierCurveTo(-f.w * .4, -f.w * .85, f.w * .4, -f.w * .85, f.w * .4, -f.w * .3)
      ctx.closePath()
    })
    /* nail outline */
    ctx.beginPath()
    ctx.moveTo(-f.w * .4, -f.w * .3)
    ctx.bezierCurveTo(-f.w * .4, -f.w * .82, f.w * .4, -f.w * .82, f.w * .4, -f.w * .3)
    ctx.lineWidth = 1.2; ctx.strokeStyle = SKIN2; ctx.globalAlpha = .5; ctx.stroke()
    ctx.globalAlpha = 1
    ctx.restore()

    ctx.restore() /* medial */
    ctx.restore() /* finger root */
  }

  ctx.restore() /* hand root */
}

/* ══════════════════════════════════════════════════════════
   COMPONENT
══════════════════════════════════════════════════════════ */
export default function RubberHoseButton({
  variant   = 'primary',
  onClick,
  children,
  style     = {},
  className = '',
  splat     = 'CLICK!',
  disabled  = false,
}) {
  const wrapRef   = useRef(null)
  const canvasRef = useRef(null)
  const btnRef    = useRef(null)
  const splatRef  = useRef(null)
  const rafRef    = useRef(null)

  /* all mutable animation state in a single ref — zero re-renders */
  const S_ = useRef({
    phase:     'idle',   /* idle | rising | hovering | pressing | recoil | retreating */
    wx:        0,        /* current wrist x in canvas coords */
    wy:        0,        /* current wrist y */
    targetWx:  0,
    targetWy:  0,
    stretch:   1,
    squash:    1,
    pressT:    0,
    hoverT:    0,
    animT:     0,
    lastTS:    null,
    /* how far the canvas sticks up above the wrapper top */
    ABOVE:     160,
  })

  /* ── canvas size: full wrapper width, tall enough for hand above button ── */
  useEffect(() => {
    const cv   = canvasRef.current
    const wrap = wrapRef.current
    if (!cv || !wrap) return
    const ABOVE = S_.current.ABOVE

    function resize() {
      cv.width  = wrap.offsetWidth
      /* tall: button height + space above for the hand */
      cv.height = wrap.offsetHeight + ABOVE
      /* position canvas so it sticks up by ABOVE px */
      cv.style.top = `-${ABOVE}px`
      /* init wrist below canvas bottom */
      S_.current.wx = cv.width / 2
      S_.current.wy = cv.height + 80
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(wrap)
    return () => ro.disconnect()
  }, [])

  /* ── animation loop ── */
  useEffect(() => {
    const cv  = canvasRef.current
    const btn = btnRef.current
    if (!cv || !btn) return
    const ctx = cv.getContext('2d')
    const s   = S_.current
    const ABOVE = s.ABOVE

    /* get button centre in canvas-local coordinates */
    function btnCentre() {
      const wr = cv.getBoundingClientRect()
      const br = btn.getBoundingClientRect()
      return {
        x: br.left - wr.left + br.width  / 2,
        y: br.top  - wr.top  + br.height / 2,
      }
    }

    function frame(ts) {
      if (!s.lastTS) s.lastTS = ts
      const dt  = Math.min((ts - s.lastTS) / 1000, .05)
      s.lastTS  = ts
      s.animT  += dt
      const W   = cv.width
      const H   = cv.height

      const bc  = btnCentre()

      /* ── PHASE STATE MACHINE ── */
      switch (s.phase) {
        case 'idle': {
          /* wrist rests below canvas, gentle sway */
          s.targetWx = W / 2 + sn(s.animT, 0.8, 6)
          s.targetWy = H + 100
          s.wx       = lerp(s.wx, s.targetWx, .06)
          s.wy       = lerp(s.wy, s.targetWy, .06)
          s.stretch  = lerp(s.stretch, 1,   .08)
          s.squash   = lerp(s.squash,  1,   .08)
          s.hoverT   = lerp(s.hoverT,  0,   .1)
          break
        }
        case 'rising': {
          /* smooth cinematic rise — wrist stops below button so text stays readable */
          const tgtY = bc.y + 175
          s.wx      = lerp(s.wx, bc.x,  .07)
          s.wy      = lerp(s.wy, tgtY,  .07)
          s.stretch = lerp(s.stretch, 1.18, .08)
          s.squash  = lerp(s.squash,  0.88, .08)
          s.hoverT  = lerp(s.hoverT,  0,    .08)
          if (Math.abs(s.wy - tgtY) < 3 && Math.abs(s.wx - bc.x) < 3)
            s.phase = 'hovering'
          break
        }
        case 'hovering': {
          /* gentle idle bob — hand below the button, text always readable */
          const tgtY = bc.y + 170 + sn(s.animT, 1.6, 4)
          const tgtX = bc.x + sn(s.animT, 1.2, 3)
          s.wx       = lerp(s.wx, tgtX, .08)
          s.wy       = lerp(s.wy, tgtY, .08)
          s.stretch  = lerp(s.stretch, 1.06, .07)
          s.squash   = lerp(s.squash,  0.95, .07)
          s.hoverT   = lerp(s.hoverT,  1,    .08)
          s.pressT   = lerp(s.pressT,  0,    .1)
          break
        }
        case 'pressing': {
          /* slam up into button — only on actual click */
          s.pressT  += dt * 6
          const p    = clamp(s.pressT, 0, 1)
          /* wrist shoots from hover position up to button */
          const riseAmt = easeOut5(Math.min(p * 2, 1)) * 100
          s.wy       = bc.y + 170 - riseAmt
          s.stretch  = lerp(s.stretch, 0.80, .2)
          s.squash   = lerp(s.squash,  1.22, .2)
          s.hoverT   = 1
          if (p >= 1) { s.phase = 'recoil'; s.pressT = 1 }
          break
        }
        case 'recoil': {
          /* spring back down to hover position */
          s.pressT  -= dt * 4
          const pBack = clamp(1 - s.pressT, 0, 1)
          s.wy       = bc.y + 170 - (1 - easeOut3(pBack)) * 100
          s.stretch  = lerp(s.stretch, 1.1,  .1)
          s.squash   = lerp(s.squash,  0.93, .1)
          s.hoverT   = 1
          if (s.pressT <= 0) { s.phase = 'hovering'; s.pressT = 0 }
          break
        }
        case 'retreating': {
          /* glide back down */
          s.wx = lerp(s.wx, W / 2,    .07)
          s.wy = lerp(s.wy, H + 100,  .09)
          s.stretch  = lerp(s.stretch, 1,   .1)
          s.squash   = lerp(s.squash,  1,   .1)
          s.hoverT   = lerp(s.hoverT,  0,   .1)
          s.pressT   = lerp(s.pressT,  0,   .12)
          if (s.wy > H + 60) s.phase = 'idle'
          break
        }
      }

      /* button text always fully visible — hand stays below */
      if (btn) btn.style.opacity = '1'

      /* ── DRAW ── */
      ctx.clearRect(0, 0, W, H)

      const pressVal = s.phase === 'pressing' ? clamp(s.pressT,    0, 1)
                     : s.phase === 'recoil'   ? clamp(s.pressT,    0, 1)
                     : 0

      drawHand(ctx, s.wx, s.wy, s.stretch, s.squash, pressVal, s.hoverT, s.animT)

      rafRef.current = requestAnimationFrame(frame)
    }

    rafRef.current = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(rafRef.current)
      /* restore button opacity on unmount */
      if (btn) btn.style.opacity = '1'
    }
  }, [])

  /* ── EVENT HANDLERS ── */
  const onEnter = useCallback(() => {
    if (disabled) return
    const s   = S_.current
    const cv  = canvasRef.current
    const btn = btnRef.current
    if (!cv || !btn) return

    if (s.phase === 'idle' || s.phase === 'retreating') {
      const wr = cv.getBoundingClientRect()
      const br = btn.getBoundingClientRect()
      /* snap wrist to just below the visible canvas bottom — short travel = fast appear */
      s.wx      = (br.left - wr.left + br.width / 2) + (Math.random() - .5) * 20
      s.wy      = cv.height + 60   /* well below canvas — smooth rise from off screen */
      s.stretch = 1.0
      s.squash  = 1.0
      s.phase   = 'rising'
    }
  }, [disabled])

  const onLeave = useCallback(() => {
    const s = S_.current
    if (s.phase !== 'pressing') s.phase = 'retreating'
  }, [])

  const onDown = useCallback(() => {
    if (disabled) return
    const s = S_.current
    s.phase  = 'pressing'
    s.pressT = 0

    /* splat pop */
    const sp = splatRef.current
    if (sp) {
      sp.textContent    = splat
      sp.style.animation= 'none'
      void sp.offsetWidth
      sp.style.animation= 'rhbSplat .75s cubic-bezier(.34,1.56,.64,1) forwards'
    }
  }, [disabled, splat])

  const onUp = useCallback((e) => {
    if (disabled) return
    onClick?.(e)
  }, [disabled, onClick])

  /* ── STYLES ── */
  const base = {
    display:      'block',
    width:        '100%',
    fontFamily:   "'Boogaloo', cursive",
    fontSize:     variant === 'book' ? 18 : 16,
    letterSpacing:'.12em',
    textTransform:'uppercase',
    lineHeight:   1,
    border:       '3px solid #E8DFC8',
    borderRadius: variant === 'book'
      ? '8px 14px 8px 14px / 14px 8px 14px 8px'
      : '50px',
    cursor:       disabled ? 'not-allowed' : 'pointer',
    transition:   'box-shadow .15s',
    userSelect:   'none',
    position:     'relative',
    zIndex:       1,        /* below canvas */
    ...(variant === 'primary' ? {
      background: '#8B1A1A',
      color:      '#E8DFC8',
      padding:    '13px 34px',
      boxShadow:  '4px 5px 0 #E8DFC8',
    } : variant === 'ghost' ? {
      background: 'transparent',
      color:      '#E8DFC8',
      padding:    '13px 28px',
      border:     '3px solid rgba(232,223,200,.42)',
      boxShadow:  '3px 4px 0 rgba(232,223,200,.28)',
    } : {                          /* book */
      background: '#8B1A1A',
      color:      '#E8DFC8',
      padding:    '16px 32px',
      boxShadow:  '5px 5px 0 #E8DFC8',
    }),
    opacity:      disabled ? .5 : 1,
    ...style,
  }

  return (
    <>
      <style>{`
        @keyframes rhbSplat {
          0%   { opacity:0;   transform:translateX(-50%) scale(0)    rotate(-10deg); }
          35%  { opacity:1;   transform:translateX(-50%) scale(1.18) rotate(5deg);  }
          65%  { opacity:1;   transform:translateX(-50%) scale(0.96) rotate(-2deg); }
          100% { opacity:0;   transform:translateX(-50%) scale(0.88) rotate(2deg);  }
        }
      `}</style>

      {/*
        Wrapper: relative, sized to just the button.
        Canvas overflows upward — no overflow:hidden here!
        The hand canvas sits on top (z-index:2) of the button (z-index:1).
      */}
      <div
        ref={wrapRef}
        style={{
          position:   'relative',
          display:    variant === 'book' ? 'block' : 'inline-block',
        }}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
      >
        {/* actual button — z below canvas */}
        <button
          ref={btnRef}
          style={base}
          className={className}
          onMouseDown={onDown}
          onMouseUp={onUp}
          disabled={disabled}
        >
          {children}
        </button>

        {/* splat word — above everything */}
        <div
          ref={splatRef}
          style={{
            position:     'absolute',
            top:          '-40px',
            left:         '50%',
            transform:    'translateX(-50%) scale(0)',
            fontFamily:   "'Bebas Neue', sans-serif",
            fontSize:     28,
            letterSpacing:'.06em',
            color:        '#8B1A1A',
            textShadow:   '2px 2px 0 #E8DFC8, -1px -1px 0 #070504',
            pointerEvents:'none',
            whiteSpace:   'nowrap',
            zIndex:       4,
            opacity:      0,
          }}
        />

        {/*
          Canvas:
          - absolute, top = -ABOVE so it extends above the button
          - width = 100%, height = button height + ABOVE
          - z-index:2 so it renders IN FRONT of the button
          - pointer-events:none so mouse passes through to the wrapper
        */}
        <canvas
          ref={canvasRef}
          style={{
            position:     'absolute',
            left:         0,
            /* top is set dynamically in resize() = -ABOVE px */
            width:        '100%',
            pointerEvents:'none',
            zIndex:       2,
            willChange:   'contents',
          }}
        />
      </div>
    </>
  )
}
