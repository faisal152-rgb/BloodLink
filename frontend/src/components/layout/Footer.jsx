import { Droplet, MapPin, Mail, Phone } from 'lucide-react';

const BrandIcons = {
  Whatsapp: (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.396.015 12.03c0 2.12.554 4.189 1.605 6.006L0 24l6.149-1.613a11.77 11.77 0 005.9 1.594h.005c6.634 0 12.032-5.396 12.035-12.03a11.75 11.75 0 00-3.486-8.503" />
    </svg>
  ),
  Facebook: (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  ),
  Instagram: (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.012 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.637.497 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.012 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.497-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.012-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.335.935 20.666.522 19.876.217c-.765-.297-1.636-.498-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.584-.071 4.85c-.055 1.17-.249 1.805-.415 2.227-.217.562-.477.96-.896 1.382-.42.419-.819.679-1.381.896-.422.164-1.057.36-2.227.413-1.266.057-1.646.07-4.85.07s-3.584-.015-4.85-.071c-1.17-.055-1.805-.249-2.227-.415-.562-.217-.96-.477-1.382-.896-.419-.42-.679-.819-.896-1.381-.164-.422-.36-1.057-.413-2.227-.057-1.266-.07-1.646-.07-4.85s.015-3.584.071-4.85c.055-1.17.249-1.805.415-2.227.217-.562.477-.96.896-1.382.42-.419.819-.679 1.381-.896.422-.164 1.057-.36 2.227-.413 1.266-.057 1.646-.07 4.85-.07zM12 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405a1.44 1.44 0 11-2.88 0 1.44 1.44 0 012.88 0z" />
    </svg>
  ),
  Twitter: (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
    </svg>
  )
};

const socialLinks = [
  {
    icon: BrandIcons.Whatsapp,
    url: import.meta.env.VITE_WHATSAPP_LINK || '',
    label: 'WhatsApp',
    color: '#25D366'
  },
  {
    icon: BrandIcons.Facebook,
    url: import.meta.env.VITE_FACEBOOK_LINK || '',
    label: 'Facebook',
    color: '#1877F2'
  },
  {
    icon: BrandIcons.Instagram,
    url: import.meta.env.VITE_INSTAGRAM_LINK || '',
    label: 'Instagram',
    color: '#C13584'
  },
  {
    icon: BrandIcons.Twitter,
    url: import.meta.env.VITE_TWITTER_LINK || '',
    label: 'X (Twitter)',
    color: '#000000'
  }
];

const Footer = ({ onAdminClick, onNavItemClick }) => (
  <footer className="app-footer">
    <div className="container">
      <div className="footer-grid">
        <div>
          <div className="footer-logo">
            <Droplet fill="#dc3545" size={40} />
            BloodLink
          </div>
          <p className="footer-text">
            A centralized platform for verified blood donation. Bridging the gap between recipients and donors ethically and efficiently.
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {socialLinks.map((social, idx) => (
              <a
                key={idx}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                title={social.label}
                className="social-icon-btn"
                style={{
                  color: '#666',
                  background: '#2a2a2a',
                  padding: '10px',
                  borderRadius: '50%',
                  display: 'flex',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#fff';
                  e.currentTarget.style.background = social.color;
                  e.currentTarget.style.transform = 'translateY(-3px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#666';
                  e.currentTarget.style.background = '#2a2a2a';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <social.icon style={{ width: '20px', height: '20px' }} />
              </a>
            ))}
          </div>
        </div>
        <div>
          <h4 className="footer-col-title">Quick Links</h4>
          <ul className="footer-links">
            <li><a href="/home" onClick={(e) => { e.preventDefault(); onNavItemClick('home'); }}>Home</a></li>
            <li><a href="/donor" onClick={(e) => { e.preventDefault(); onNavItemClick('donors'); }}>Donor Network</a></li>
            <li><a href="/request" onClick={(e) => { e.preventDefault(); onNavItemClick('request'); }}>Emergency Request</a></li>
          </ul>
        </div>
        <div>
          <h4 className="footer-col-title">Contact Support</h4>
          <ul className="footer-links">
            <li style={{ display: 'flex', gap: '10px' }}><MapPin size={18} /> IUB, Bahawalpur, Pakistan</li>
            <li style={{ display: 'flex', gap: '10px' }}><Mail size={18} /> support@bloodlink.org</li>
            <li style={{ display: 'flex', gap: '10px' }}><Phone size={18} /> +92 (300) 123 4567</li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2026 BloodLink Project. Designed for Ethics and Efficiency.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
