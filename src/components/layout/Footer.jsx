export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-inner">
          <span className="footer-mark">Barbershopnearme</span>
          <div className="footer-info">
            123 Noir Alley · Hattiesburg, MS 39401<br />
            Mon – Sat · 9am – 6pm · (601) 555-0199<br />
            © {new Date().getFullYear()} · All Rights Reserved
          </div>
        </div>
      </div>
    </footer>
  )
}
