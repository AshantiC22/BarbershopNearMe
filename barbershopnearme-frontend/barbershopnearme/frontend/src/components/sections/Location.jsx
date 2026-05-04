import { useRef } from 'react'
import useReveal from '@/hooks/useReveal.js'

const SHOP = {
  address: '910 W Parker Rd Bld 300, Plano, TX 75023',
  phone: '(601) 307-1023',
  phone_raw: '+16013071023',
  hours: [
    { day: 'Mon–Fri', time: '9AM–6PM' },
    { day: 'Saturday', time: '9AM–4PM' },
    { day: 'Sunday', time: 'Closed' },
  ],
  map_url:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3346!2d-96.6989!3d33.0198!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x864c3c8e3d3f3f3f%3A0x0!2s910+W+Parker+Rd%2C+Plano%2C+TX+75023!5e0!3m2!1sen!2sus!4v1000000000000!5m2!1sen!2sus',
}

const T = {
  ink: '#070504',
  ink2: '#0F0B09',
  bone: '#E8DFC8',
  blood: '#8B1A1A',
  blood2: '#6B0F0F',
  dim1: 'rgba(232,223,200,.55)',
  dim2: 'rgba(232,223,200,.14)',
}

export default function Location() {
  const ref = useRef()
  useReveal(ref)

  return (
    <section className="section" ref={ref}>
      <div className="container">
        <div className="section-eyebrow reveal">
          <span className="t-eyebrow-num">06</span>
          <div className="section-eyebrow-rule" />
          <span className="t-label">Find Us</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(232,223,200,.08)' }} />
        </div>

        {/* ── TITLE ── */}
        <h2 className="t-title reveal" style={{ marginBottom: 24 }}>
          Come See <span style={{ color: 'var(--color-blood)' }}>Us.</span>
        </h2>

        {/* ── MAP — full width, short ── */}
        <div
          className="reveal"
          style={{
            border: `3px solid ${T.bone}`,
            borderRadius: '12px 8px 12px 8px / 8px 12px 8px 12px',
            overflow: 'hidden',
            boxShadow: `5px 5px 0 rgba(139,26,26,.25)`,
            marginBottom: 20,
            width: '100%',
            maxWidth: '100%',
          }}
        >
          {/* sprocket */}
          <div
            style={{
              height: 12,
              background: T.ink,
              borderBottom: `2px solid ${T.bone}`,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              padding: '0 4px',
              overflow: 'hidden',
            }}
          >
            {Array.from({ length: 50 }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: 8,
                  height: 7,
                  flexShrink: 0,
                  border: `1px solid ${T.bone}`,
                  borderRadius: 1,
                  background: T.ink,
                }}
              />
            ))}
          </div>
          {/* map — fixed height, no padding-top trick */}
          <div style={{ width: '100%', height: 200, position: 'relative' }}>
            <iframe
              src={SHOP.map_url}
              title="Location"
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                border: 'none',
                filter: 'invert(90%) hue-rotate(180deg) saturate(0.6) brightness(0.85)',
              }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          {/* sprocket */}
          <div
            style={{
              height: 12,
              background: T.ink,
              borderTop: `2px solid ${T.bone}`,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              padding: '0 4px',
              overflow: 'hidden',
            }}
          >
            {Array.from({ length: 50 }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: 8,
                  height: 7,
                  flexShrink: 0,
                  border: `1px solid ${T.bone}`,
                  borderRadius: 1,
                  background: T.ink,
                }}
              />
            ))}
          </div>
        </div>

        {/* ── INFO ROW — hours + contact side by side on desktop, stacked on mobile ── */}
        <div
          className="reveal"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 16,
            marginBottom: 16,
          }}
        >
          {/* hours */}
          <div
            style={{
              background: T.ink2,
              border: `2px solid ${T.dim2}`,
              borderRadius: '10px 6px 10px 6px',
              padding: '14px 16px',
            }}
          >
            <p
              style={{
                fontFamily: "'Courier Prime',monospace",
                fontSize: 9,
                letterSpacing: '.28em',
                textTransform: 'uppercase',
                color: T.dim1,
                marginBottom: 10,
              }}
            >
              Hours
            </p>
            {SHOP.hours.map((h) => (
              <div
                key={h.day}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  padding: '6px 0',
                  borderBottom: `1px solid ${T.dim2}`,
                  gap: 8,
                }}
              >
                <span
                  style={{
                    fontFamily: "'Courier Prime',monospace",
                    fontSize: 11,
                    color: T.dim1,
                    flexShrink: 0,
                  }}
                >
                  {h.day}
                </span>
                <span
                  style={{
                    fontFamily: "'Bebas Neue',sans-serif",
                    fontSize: 14,
                    letterSpacing: '.04em',
                    color: h.time === 'Closed' ? 'rgba(248,113,113,.65)' : T.bone,
                    flexShrink: 0,
                  }}
                >
                  {h.time}
                </span>
              </div>
            ))}
          </div>

          {/* contact */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(SHOP.address)}`}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'flex',
                gap: 10,
                alignItems: 'flex-start',
                background: T.ink2,
                border: `2px solid ${T.dim2}`,
                borderRadius: '6px 10px 6px 10px',
                padding: '12px 14px',
                textDecoration: 'none',
                flex: 1,
                minWidth: 0,
                transition: 'border-color .2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = T.blood)}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = T.dim2)}
            >
              <span style={{ fontSize: 16, flexShrink: 0 }}>📍</span>
              <div style={{ minWidth: 0 }}>
                <p
                  style={{
                    fontFamily: "'Courier Prime',monospace",
                    fontSize: 8,
                    letterSpacing: '.25em',
                    textTransform: 'uppercase',
                    color: T.dim1,
                    marginBottom: 3,
                  }}
                >
                  Address
                </p>
                <p
                  style={{
                    fontFamily: "'Boogaloo',cursive",
                    fontSize: 12,
                    color: T.bone,
                    lineHeight: 1.4,
                    wordBreak: 'break-word',
                    margin: 0,
                  }}
                >
                  {SHOP.address}
                </p>
              </div>
            </a>
            <a
              href={`tel:${SHOP.phone_raw}`}
              style={{
                display: 'flex',
                gap: 10,
                alignItems: 'center',
                background: T.ink2,
                border: `2px solid ${T.dim2}`,
                borderRadius: '10px 6px 10px 6px',
                padding: '12px 14px',
                textDecoration: 'none',
                transition: 'border-color .2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = T.blood)}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = T.dim2)}
            >
              <span style={{ fontSize: 16, flexShrink: 0 }}>📞</span>
              <div>
                <p
                  style={{
                    fontFamily: "'Courier Prime',monospace",
                    fontSize: 8,
                    letterSpacing: '.25em',
                    textTransform: 'uppercase',
                    color: T.dim1,
                    marginBottom: 2,
                  }}
                >
                  Phone
                </p>
                <p
                  style={{
                    fontFamily: "'Bebas Neue',sans-serif",
                    fontSize: 16,
                    color: T.bone,
                    margin: 0,
                    letterSpacing: '.04em',
                  }}
                >
                  {SHOP.phone}
                </p>
              </div>
            </a>
          </div>
        </div>

        {/* directions button */}
        <div className="reveal">
          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(SHOP.address)}`}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'block',
              textAlign: 'center',
              fontFamily: "'Boogaloo',cursive",
              fontSize: 16,
              letterSpacing: '.12em',
              textTransform: 'uppercase',
              background: T.blood,
              color: T.bone,
              border: `3px solid ${T.bone}`,
              borderRadius: '50px',
              padding: '13px 24px',
              textDecoration: 'none',
              boxShadow: `5px 5px 0 ${T.bone}`,
              transition: 'all .25s cubic-bezier(.34,1.56,.64,1)',
              width: '100%',
              boxSizing: 'border-box',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02) rotate(-.3deg)'
              e.currentTarget.style.background = T.blood2
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none'
              e.currentTarget.style.background = T.blood
            }}
          >
            📍 Get Directions
          </a>
        </div>
      </div>

      {/* ── MOBILE: stack info grid to single column ── */}
      <style>{`
        @media(max-width:500px){
          .loc-info-grid{grid-template-columns:1fr!important;}
        }
      `}</style>
    </section>
  )
}
