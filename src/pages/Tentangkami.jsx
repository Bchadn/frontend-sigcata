import React from 'react';
import '../styles/TentangKamiStyles.css';
import foto1 from '../assets/bachtiar.jpg';
import foto2 from '../assets/farhan.jpg';
import foto3 from '../assets/adnan.jpg';

function Tentangkami() {
    const tim = [
        {
            nama: "Bachtiar Adino Anugrah Jati",
            deskripsi: "bachtiaradino@gmail.com",
            foto: foto1
        },
        {
            nama: "Muhammad Farhan Fauzy",
            deskripsi: "farhanfauzy744@gmail.com",
            foto: foto2
        },
        {
            nama: "Muhammad Adnan Asyam",
            deskripsi: "adnanasyam10@gmail.com",
            foto: foto3
        }
    ];

    return (
        <div className="beranda-container">
            <h1 className="judul">Tentang Kami</h1>
            <div className="tentang-kami-section">
                {/* Section 1: Deskripsi Umum */}
                <section className="deskripsi-section">
                    <p className="deskripsi-text">
                        <strong>SIGCATA</strong> (Sistem Informasi Geospasial Campurejo dan Tampingan) merupakan platform WebGIS yang dibuat dengan tujuan untuk menyajikan integrasi data pertanahan seperti Zona Nilai Tanah (ZNT), penggunaan lahan yang dilengkapi pemodelan bangunan 3D di koridor jalan. Webgis ini dibuat dengan menggunakan bahasa pemrograman JavaScript dan framework React JS serta penggunaan dua library Cesium JS dan Mapbox GL JS dalam visualisasi peta. Website ini merupakan hasil kolaborasi TUGAS AKHIR dari Mahasiswa Angkatan 2021 Teknik Geodesi UNDIP yang terdiri antara lain sebagai berikut:
                    </p>
                </section>

                {/* Section 2: Profil Tim */}
                <section className="tim-wrapper">
                    {tim.map((anggota, index) => (
                        <div className="kartu-tim" key={index}>
                            <img src={anggota.foto} alt={anggota.nama} className="foto-tim" />
                            <h3 className="nama-tim">{anggota.nama}</h3>
                            <p className="deskripsi-tim">{anggota.deskripsi}</p>
                        </div>
                    ))}
                </section>
            </div>
        </div>
    );
}

export default Tentangkami;
