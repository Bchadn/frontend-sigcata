import React from 'react';
import '../styles/StyleFooter.css';

function Footer() {
    return (
        <footer className="sigcata-footer"> {/* Pastikan kelas ini sudah benar */}
            <div className="container my-auto">
                <div className="copyright text-center my-auto">
                    <span className="footer-text">© 2025 SIGCATA | Campurejo & Tampingan | Teknik Geodesi UNDIP</span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
