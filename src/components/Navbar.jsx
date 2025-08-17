import { NavLink } from "react-router-dom";
import '../styles/StyleNavbar.css';

const Navbar = () => {
  const navItems = [
    { path: "/Beranda", label: "Beranda", icon: "fas fa-home" },
    { path: "/Peta", label: "Peta", icon: "fas fa-map" },
    { path: "/BandingPeta", label: "Bandingkan Peta", icon: "fas fa-exchange-alt" },
    { path: "/Tentang", label: "Tentang Kami", icon: "fas fa-users" },
  ];

  return (
    <nav className="sipeta-navbar">
      <div className="sipeta-brand">
        <i className="fas fa-globe fa-lg" />
        <span>SIGCATA</span>
      </div>

      <ul className="sipeta-nav-items">
        {navItems.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `sipeta-nav-link ${isActive ? "active" : ""}`
              }
              end
            >
              <i className={item.icon}></i>
              <span>{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navbar;
