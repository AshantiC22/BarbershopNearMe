/*
  RubberHoseButton — simplified
  Keeps all the rubber hose styling but removes the hand animation
  that was covering the button text.
*/

export default function RubberHoseButton({
  variant   = 'primary',
  onClick,
  children,
  style     = {},
  className = '',
  splat,
  disabled  = false,
}) {
  const base = {
    display:       variant === 'book' ? 'block' : 'inline-block',
    width:         variant === 'book' ? '100%' : undefined,
    fontFamily:    "'Boogaloo', cursive",
    fontSize:      variant === 'book' ? 18 : 16,
    letterSpacing: '.12em',
    textTransform: 'uppercase',
    lineHeight:    1,
    border:        '3px solid #E8DFC8',
    cursor:        disabled ? 'not-allowed' : 'pointer',
    userSelect:    'none',
    transition:    'transform .2s cubic-bezier(.34,1.56,.64,1), box-shadow .2s',
    opacity:       disabled ? .5 : 1,
    ...(variant === 'primary' ? {
      background:   '#8B1A1A',
      color:        '#E8DFC8',
      padding:      '13px 34px',
      borderRadius: '50px',
      boxShadow:    '4px 5px 0 #E8DFC8',
    } : variant === 'ghost' ? {
      background:   'transparent',
      color:        '#E8DFC8',
      padding:      '13px 28px',
      borderRadius: '50px',
      border:       '3px solid rgba(232,223,200,.42)',
      boxShadow:    '3px 4px 0 rgba(232,223,200,.28)',
    } : {
      background:   '#8B1A1A',
      color:        '#E8DFC8',
      padding:      '16px 32px',
      borderRadius: '8px 14px 8px 14px / 14px 8px 14px 8px',
      boxShadow:    '5px 5px 0 #E8DFC8',
    }),
    ...style,
  }

  return (
    <button
      style={base}
      className={className}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      onMouseEnter={e => {
        if (disabled) return
        e.currentTarget.style.transform = 'scale(1.05) rotate(-.4deg)'
        e.currentTarget.style.boxShadow = '6px 7px 0 #E8DFC8'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'none'
        e.currentTarget.style.boxShadow = base.boxShadow
      }}
      onMouseDown={e => {
        if (disabled) return
        e.currentTarget.style.transform = 'scale(.97) rotate(.2deg)'
        e.currentTarget.style.boxShadow = '2px 3px 0 #E8DFC8'
      }}
      onMouseUp={e => {
        if (disabled) return
        e.currentTarget.style.transform = 'scale(1.05) rotate(-.4deg)'
        e.currentTarget.style.boxShadow = '6px 7px 0 #E8DFC8'
      }}
    >
      {children}
    </button>
  )
}
