import { Link } from 'react-router-dom'

const T = { ink:'#070504',ink2:'#0F0B09',bone:'#E8DFC8',blood:'#8B1A1A',dim1:'rgba(232,223,200,.55)',dim2:'rgba(232,223,200,.14)',dim3:'rgba(232,223,200,.06)' }

const TERMS = [
  { id:'appointments', title:'Appointments', emoji:'✂️', items:[
    'All appointments must be booked through the Barbershopnearme platform. Walk-ins are welcome but subject to availability.',
    'Booked time slots are held for 15 minutes past the scheduled time. After 15 minutes the slot may be released.',
    'You must be a registered client to book online. Keep your login credentials secure.',
  ]},
  { id:'cancellations', title:'Cancellations & Rescheduling', emoji:'📅', items:[
    'You may cancel or reschedule up to 2 hours before your appointment through your dashboard.',
    'Cancellations within 2 hours must be handled by calling the shop directly.',
    'Repeated no-shows will result in a deposit requirement for future bookings.',
  ]},
  { id:'payments', title:'Payments', emoji:'💈', items:[
    'Online payments are processed securely through Stripe. We do not store card information.',
    'Pay-in-shop appointments are paid at time of service. Cash and card accepted.',
    'All prices are in USD. The price shown at booking is the price charged.',
  ]},
  { id:'conduct', title:'Code of Conduct', emoji:'⚡', items:[
    'Barbershopnearme reserves the right to refuse service consistent with applicable law.',
    'All clients are expected to treat staff with respect. Disruptive behavior may result in removal.',
    'Children under 12 must be accompanied by an adult.',
  ]},
  { id:'accounts', title:'Your Account', emoji:'🔑', items:[
    'You are responsible for all activity under your account.',
    'You may delete your account by contacting the shop directly.',
    'We reserve the right to suspend accounts that violate these terms.',
  ]},
]

const radii = ['14px 8px 12px 10px/10px 12px 8px 14px','8px 14px 10px 12px/12px 8px 14px 10px','12px 10px 14px 8px/8px 14px 10px 12px']

export default function TermsPage(){
  return (
    <div style={{ minHeight:'100vh',background:T.ink,animation:'pageEntry .55s cubic-bezier(.16,1,.3,1) both' }}>
      <style>{`@keyframes pageEntry{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}} @keyframes floatBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}`}</style>

      <nav style={{ position:'sticky',top:0,zIndex:100,background:T.ink,borderBottom:`3px solid ${T.bone}`,height:62,display:'flex',alignItems:'center' }}>
        <div style={{ width:'100%',maxWidth:860,margin:'0 auto',padding:'0 32px',display:'flex',alignItems:'center',justifyContent:'space-between' }}>
          <Link to="/" style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:18,letterSpacing:'.22em',textTransform:'uppercase',color:T.bone,textDecoration:'none' }}>Barbershopnearme</Link>
          <Link to="/" style={{ fontFamily:"'Boogaloo',cursive",fontSize:13,letterSpacing:'.1em',textTransform:'uppercase',color:T.dim1,textDecoration:'none' }}>← Home</Link>
        </div>
      </nav>

      <div style={{ maxWidth:860,margin:'0 auto',padding:'48px 32px' }}>

        <div style={{ marginBottom:48 }}>
          <span style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:11,color:T.blood,letterSpacing:'.2em' }}>LEGAL</span>
          <h1 style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:'clamp(44px,8vw,72px)',lineHeight:.9,letterSpacing:'.04em',textTransform:'uppercase',color:T.bone,textShadow:`4px 4px 0 ${T.blood}`,marginTop:8 }}>
            Terms of<br/><span style={{ color:T.blood }}>Service</span>
          </h1>
          <p style={{ fontFamily:"'Courier Prime',monospace",fontSize:12,letterSpacing:'.12em',color:T.dim1,marginTop:16 }}>
            Last updated: {new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}
          </p>
        </div>

        <div style={{ display:'flex',flexDirection:'column',gap:24 }}>
          {TERMS.map((section,i) => (
            <div key={section.id} style={{
              background:T.ink2, border:`3px solid ${T.dim2}`,
              borderTop:`4px solid ${T.blood}`,
              borderRadius:radii[i%3],
              padding:'28px 28px 24px',
              boxShadow:`5px 5px 0 rgba(139,26,26,.1)`,
            }}>
              <div style={{ display:'flex',alignItems:'center',gap:14,marginBottom:20 }}>
                <span style={{ fontSize:28,animation:`floatBob ${3+i*.4}s ease-in-out ${i*.3}s infinite` }}>{section.emoji}</span>
                <h2 style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:24,letterSpacing:'.06em',textTransform:'uppercase',color:T.bone,margin:0 }}>
                  {section.title}
                </h2>
              </div>
              <ul style={{ listStyle:'none',padding:0,margin:0,display:'flex',flexDirection:'column',gap:12 }}>
                {section.items.map((item,j) => (
                  <li key={j} style={{ display:'flex',gap:14,alignItems:'flex-start' }}>
                    <span style={{ color:T.blood,flexShrink:0,marginTop:3 }}>✂</span>
                    <span style={{ fontFamily:"'Courier Prime',monospace",fontSize:13,lineHeight:1.8,color:T.dim1 }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div style={{ marginTop:48,textAlign:'center' }}>
          <Link to="/" style={{ fontFamily:"'Boogaloo',cursive",fontSize:16,letterSpacing:'.12em',textTransform:'uppercase',background:T.blood,color:T.bone,border:`3px solid ${T.bone}`,borderRadius:50,padding:'12px 32px',textDecoration:'none',boxShadow:`4px 4px 0 ${T.bone}` }}>
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
