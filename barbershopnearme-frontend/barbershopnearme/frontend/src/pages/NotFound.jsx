export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, textAlign: 'center', padding: 32 }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(80px,16vw,160px)', lineHeight: .88, color: 'var(--color-blood)', textShadow: '3px 3px 0 var(--color-bone)' }}>404</h1>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: 24, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--color-bone)' }}>Wrong Chair</p>
      <p style={{ fontSize: 12, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--color-bone-dim)', marginBottom: 24 }}>That page doesn't exist in this shop.</p>
      <a href="/" className="btn-ink">Back to the Shop</a>
    </div>
  )
}
