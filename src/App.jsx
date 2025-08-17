import { Routes, Route, Navigate } from "react-router-dom";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import './styles/StyleApp.css';

//PAGES
import Beranda from './pages/Beranda';
import Peta from './pages/Peta';
import BandingPeta from './pages/BandingPeta';
import Tentangkami from './pages/Tentangkami';
function App() {
  return (
    <div>
      <Navbar />

      <Routes>
        <Route path="/Beranda" element={<Beranda />} />
        <Route path="/Peta" element={<Peta />} />
        <Route path="/BandingPeta" element={<BandingPeta />} />
        <Route path="/Tentang" element={<Tentangkami />} />
        <Route path="/" element={<Navigate to="/Beranda" replace />} />
      </Routes>

      <Footer />
    </div>
  );
}

export default App;
