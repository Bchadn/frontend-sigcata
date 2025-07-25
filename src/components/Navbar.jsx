import { Link, useLocation } from "react-router-dom";
import '../styles/StyleNavbar.css';

const Navbar = () => {
  const location = useLocation();

  const navItems = [
    { path: "/beranda", label: "Beranda", icon: "fas fa-home" },
    { path: "/peta", label: "Peta", icon: "fas fa-map" },
    { path: "/BandingPeta", label: "Bandingkan Peta", icon: "fas fa-exchange-alt" },
    { path: "/tentang", label: "Tentang Kami", icon: "fas fa-users" },
  ];

  return (
    <nav className="sipeta-navbar">
      <div className="sipeta-brand">
        <i className="fas fa-globe fa-lg" />
        <span>SIGCATA</span>
      </div>

      <ul className="sipeta-nav-items">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`sipeta-nav-link ${isActive ? "active" : ""}`}
              >
                <i className={item.icon}></i>
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default Navbar;
