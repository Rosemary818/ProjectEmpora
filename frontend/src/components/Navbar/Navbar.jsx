import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './Navbar.css'

const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'Features', href: '#features' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
]

function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const closeMenu = () => setMenuOpen(false)

  return (
    <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__container container">
        <a href="#home" className="navbar__logo" onClick={closeMenu}>
          <span className="navbar__logo-icon">
            <svg viewBox="0 0 48 32" fill="currentColor" aria-hidden="true">
              <circle cx="12" cy="14" r="5" />
              <path d="M3 32 C3 25, 8 22, 12 22 C16 22, 21 25, 21 32 Z" />

              <circle cx="36" cy="14" r="5" />
              <path d="M27 32 C27 25, 32 22, 36 22 C40 22, 45 25, 45 32 Z" />

              <circle cx="24" cy="11" r="6.5" />
              <path d="M12 32 C12 21, 17 17, 24 17 C31 17, 36 21, 36 32 Z" />
            </svg>
          </span>
          <div className="navbar__logo-text-group">
            <span className="navbar__logo-text">EMPORA</span>
            <span className="navbar__logo-subtext">Work. Connect. Grow.</span>
          </div>
        </a>

        <nav className={`navbar__nav ${menuOpen ? 'navbar__nav--open' : ''}`}>
          <ul className="navbar__links">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="navbar__link" onClick={closeMenu}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="navbar__actions">
            <Link to="/login" className="btn btn-secondary navbar__btn-login" onClick={closeMenu}>
              Login
            </Link>
            <Link to="/candidate-register" className="btn btn-primary navbar__btn-cta" onClick={closeMenu}>
              Get Started
            </Link>
          </div>
        </nav>

        <button
          className={`navbar__toggle ${menuOpen ? 'navbar__toggle--open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  )
}

export default Navbar
