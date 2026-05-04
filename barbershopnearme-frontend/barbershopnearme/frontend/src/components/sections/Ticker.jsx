const ITEMS = Array(2).fill([
  'Walk In Dangerous','Walk Out Sharp',
  'Plano TX','Est. 2024',
  'Cold Steel','Hot Towel',
  'Book Online 24/7','Precision Fades',
  'Clean Lineups','Beard Trims',
  'Kids Cutz',"The City's Best Blade",
]).flat()

export default function Ticker() {
  return (
    <div className="ticker">
      <div className="ticker-track">
        {ITEMS.map((text, i) => (
          <span key={i} className="ticker-item">
            {text}
            <span className="ticker-dot"/>
          </span>
        ))}
      </div>
    </div>
  )
}
