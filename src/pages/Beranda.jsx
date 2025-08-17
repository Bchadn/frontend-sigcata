import React from 'react';
import '../styles/BerandaStyle.css';
import slide1 from '../assets/camtam.png';

function Beranda() {
  return (
    <div className="beranda-container">
      <h1 className="judul">Beranda</h1>

      <div className="beranda-section-grid">
        <div className="beranda-left">
          <h2 className="judul-deskripsi">
            WebGIS Integrasi Data Pertanahan dan Pemodelan 3D di Desa Campurejo dan Tampingan
          </h2>
          <div className="deskripsi-beranda">
            <p>
              Website ini merupakan sebuah platform WebGIS interaktif yang dikembangkan untuk menyajikan integrasi data pertanahan secara spasial dan visual. Data yang ditampilkan mencakup informasi Zona Nilai Tanah (ZNT), penggunaan lahan, serta pemodelan tiga dimensi bangunan pada Level of Detail 1 (LoD1) untuk tahun 2019, 2021, dan 2025. Platform ini diberi nama <strong>SIGCATA</strong>, akronim dari Sistem Informasi Geografis Campurejo dan Tampingan, yang bertujuan untuk mengetahui hubungan spasial terhadap perubahan nilai tanah dan penggunaan lahan.
            </p>

            <p>
              Wilayah studi mencakup dua desa, yakni Desa Campurejo dan Desa Tampingan, yang terletak di Kecamatan Boja, Kabupaten Kendal, Provinsi Jawa Tengah. Desa Campurejo berjarak sekitar 3 km dari pusat Kecamatan Boja dan 32 km dari Ibu Kota Kabupaten Kendal. Desa ini memiliki luas wilayah 3.272 hektar dan dihuni oleh 8.226 jiwa. Sementara itu, Desa Tampingan terletak di bagian selatan Kecamatan Boja, sekitar 27 km dari Ibu Kota Kabupaten Kendal, dengan luas wilayah 193,64 hektar. Desa ini memiliki potensi lahan produktif yang didominasi oleh area persawahan. Kedua desa ini ditampilkan melalui tampilan peta interaktif dan visualisasi 3D bangunan, sehingga pengguna dapat memperoleh gambaran menyeluruh mengenai perubahan yang terjadi di wilayah studi ini.
            </p>
          </div>

          <a href="https://drive.google.com/drive/folders/1_fxwYBGjJvkWyL3faGSU4JQKSXCet1DW?usp=drive_link" target="_blank" rel="noopener noreferrer">
            <p className="highlight-beranda">
              Download Data/Panduan WebGIS
            </p>
          </a>
        </div>

        <div className="beranda-right">
          <img src={slide1} alt="Ilustrasi WebGIS" className="beranda-image" />
        </div>
      </div>
    </div>
  );
}

export default Beranda;
