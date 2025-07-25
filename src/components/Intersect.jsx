// Intersect.jsx
import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types'; // Import PropTypes

function Intersect({ visible, onClose, onApplyIntersectFilter, layerStates }) {
    // State untuk Jenis Data
    const [dataTypeZNT, setDataTypeZNT] = useState(false);
    const [dataTypePenggunaanLahan, setDataTypePenggunaanLahan] = useState(false);

    // State untuk Tahun Data
    const [yearZNT, setYearZNT] = useState('');
    const [yearPenggunaanLahan, setYearPenggunaanLahan] = useState('');

    // State untuk Pilih Fungsi Lahan (checkboxes)
    const [selectedFungsiLahan, setSelectedFungsiLahan] = useState([]);

    // State untuk Filter Harga ZNT
    const [minHarga, setMinHarga] = useState('');
    const [maxHarga, setMaxHarga] = useState('');

    // Opsi fungsi lahan yang tersedia
    const fungsiLahanOptions = [
        'Pemukiman',
        'Perkebunan',
        'Ladang',
        'Sawah',
        'Semak Belukar',
        'Sungai',
        'Jalan',
    ];

    // Efek samping untuk mereset form setiap kali panel terlihat
    useEffect(() => {
        if (visible) {
            resetForm(true); // Panggil dengan true untuk mereset form saja tanpa menghilangkan hasil di peta saat panel dibuka
        }
    }, [visible]);

    // Fungsi untuk mereset semua state form
    // Tambahkan parameter `clearMap` untuk mengontrol apakah peta juga harus direset
    const resetForm = (isInitialLoad = false) => {
        setDataTypeZNT(false);
        setDataTypePenggunaanLahan(false);
        setYearZNT('');
        setYearPenggunaanLahan('');
        setSelectedFungsiLahan([]);
        setMinHarga('');
        setMaxHarga('');

        // Jika ini bukan saat panel pertama kali dimuat, panggil onApplyIntersectFilter(null)
        // untuk menghapus hasil dari peta
        if (!isInitialLoad) {
            onApplyIntersectFilter(null);
        }
    };

    // Handler untuk checkbox Fungsi Lahan
    const handleFungsiLahanChange = (e) => {
        const { value, checked } = e.target;
        setSelectedFungsiLahan(prev =>
            checked ? [...prev, value] : prev.filter(f => f !== value)
        );
    };

    // Handler saat tombol "CARI DATA INTERSECTION" diklik
    const handleApply = async () => {
        // Validasi dasar
        if (!dataTypeZNT && !dataTypePenggunaanLahan) {
            alert("Harap pilih setidaknya satu jenis data (Zona Nilai Tanah atau Penggunaan Lahan).");
            return;
        }

        if (dataTypeZNT && !yearZNT) {
            alert("Harap pilih tahun data untuk Zona Nilai Tanah.");
            return;
        }

        if (dataTypePenggunaanLahan && !yearPenggunaanLahan) {
            alert("Harap pilih tahun data untuk Penggunaan Lahan.");
            return;
        }

        if (dataTypePenggunaanLahan && selectedFungsiLahan.length === 0) {
            alert("Harap pilih setidaknya satu Fungsi Lahan.");
            return;
        }

        if (dataTypeZNT) {
            if (minHarga === '' || maxHarga === '') {
                alert("Harap masukkan rentang harga ZNT (Min dan Max).");
                return;
            }
            if (parseFloat(minHarga) < 0 || parseFloat(maxHarga) > 10000000) {
                alert("Rentang harga ZNT tidak valid. Min ≥ 0, Max ≤ 10.000.000.");
                return;
            }
            if (parseFloat(minHarga) > parseFloat(maxHarga)) {
                alert("Harga Minimum tidak boleh lebih besar dari Harga Maksimum.");
                return;
            }
        }

        // Siapkan parameter filter untuk dikirim ke backend
        const intersectFilters = {
            dataTypeZNT,
            dataTypePenggunaanLahan,
            yearZNT: dataTypeZNT ? yearZNT : null,
            yearPenggunaanLahan: dataTypePenggunaanLahan ? yearPenggunaanLahan : null,
            fungsiLahan: dataTypePenggunaanLahan ? selectedFungsiLahan : [],
            minHarga: dataTypeZNT ? parseFloat(minHarga) : null,
            maxHarga: dataTypeZNT ? parseFloat(maxHarga) : null,
        };

        console.log("Menerapkan Filter Interseksi:", intersectFilters);

        try {
            // Mengirim permintaan ke backend untuk melakukan query interseksi
            // Sesuaikan URL endpoint Anda. Contoh: https://backend-sigcata-education.up.railway.app/intersect-data
            const response = await fetch('https://backend-sigcata-education.up.railway.app/intersect-data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(intersectFilters),
            });

            if (!response.ok) {
                throw new Error(`Kesalahan HTTP! status: ${response.status}`);
            }

            const resultGeoJSON = await response.json();
            console.log("Hasil Interseksi (GeoJSON):", resultGeoJSON);

            // Meneruskan hasil interseksi ke komponen Peta.jsx
            onApplyIntersectFilter(resultGeoJSON);
            onClose(); // Tutup panel interseksi setelah filter diterapkan
        } catch (error) {
            console.error("Gagal melakukan pencarian interseksi:", error);
            alert("Terjadi kesalahan saat mencari data interseksi. Silakan coba lagi.");
        }
    };

    // Komponen tidak akan dirender jika 'visible' adalah false
    if (!visible) {
        return null;
    }

    return (
        <div className="intersect-panel">
            <div className="intersect-header">
                <h3> ☰ Filter Pencarian Spasial (Intersection)</h3>
                <button className="close-button" onClick={onClose}>&times;</button>
            </div>
            <div className="intersect-content">
                {/* Jenis Data */}
                <div className="filter-section">
                    <h4>Jenis Data:</h4>
                    <div>
                        <label>
                            <input
                                type="checkbox"
                                checked={dataTypeZNT}
                                onChange={() => setDataTypeZNT(!dataTypeZNT)}
                            /> Zona Nilai Tanah
                        </label>
                        <label>
                            <input
                                type="checkbox"
                                checked={dataTypePenggunaanLahan}
                                onChange={() => setDataTypePenggunaanLahan(!dataTypePenggunaanLahan)}
                            /> Penggunaan Lahan
                        </label>
                    </div>
                </div>

                {/* Tahun Data (Zona Nilai Tanah) */}
                <div className="filter-section">
                    <h4>Tahun Data (Zona Nilai Tanah):</h4>
                    <div className="radio-group">
                        <label>
                            <input
                                type="radio"
                                value="2019"
                                checked={yearZNT === '2019'}
                                onChange={(e) => setYearZNT(e.target.value)}
                                disabled={!dataTypeZNT}
                            /> 2019
                        </label>
                        <label>
                            <input
                                type="radio"
                                value="2021"
                                checked={yearZNT === '2021'}
                                onChange={(e) => setYearZNT(e.target.value)}
                                disabled={!dataTypeZNT}
                            /> 2021
                        </label>
                        <label>
                            <input
                                type="radio"
                                value="2025"
                                checked={yearZNT === '2025'}
                                onChange={(e) => setYearZNT(e.target.value)}
                                disabled={!dataTypeZNT}
                            /> 2025
                        </label>
                    </div>
                </div>

                {/* Tahun Data (Penggunaan Lahan) */}
                <div className="filter-section">
                    <h4>Tahun Data (Penggunaan Lahan):</h4>
                    <div className="radio-group">
                        <label>
                            <input
                                type="radio"
                                value="2019"
                                checked={yearPenggunaanLahan === '2019'}
                                onChange={(e) => setYearPenggunaanLahan(e.target.value)}
                                disabled={!dataTypePenggunaanLahan}
                            /> 2019
                        </label>
                        <label>
                            <input
                                type="radio"
                                value="2021"
                                checked={yearPenggunaanLahan === '2021'}
                                onChange={(e) => setYearPenggunaanLahan(e.target.value)}
                                disabled={!dataTypePenggunaanLahan}
                            /> 2021
                        </label>
                        <label>
                            <input
                                type="radio"
                                value="2025"
                                checked={yearPenggunaanLahan === '2025'}
                                onChange={(e) => setYearPenggunaanLahan(e.target.value)}
                                disabled={!dataTypePenggunaanLahan}
                            /> 2025
                        </label>
                    </div>
                </div>

                {/* Pilih Fungsi Lahan */}
                <div className="filter-section">
                    <h4>Pilih Fungsi Lahan:</h4>
                    <div className="checkbox-group">
                        {fungsiLahanOptions.map(option => (
                            <label key={option}>
                                <input
                                    type="checkbox"
                                    value={option}
                                    checked={selectedFungsiLahan.includes(option)}
                                    onChange={handleFungsiLahanChange}
                                    disabled={!dataTypePenggunaanLahan}
                                /> {option}
                            </label>
                        ))}
                    </div>
                </div>

                {/* Filter Harga ZNT */}
                <div className="filter-section">
                    <h4>Filter Harga ZNT:</h4>
                    <div className="input-group">
                        Min:
                        <input
                            type="number"
                            value={minHarga}
                            onChange={(e) => setMinHarga(e.target.value)}
                            min="0"
                            placeholder="≥ 0"
                            disabled={!dataTypeZNT}
                        />
                    </div>
                    <div className="input-group">
                        Max:
                        <input
                            type="number"
                            value={maxHarga}
                            onChange={(e) => setMaxHarga(e.target.value)}
                            max="10000000"
                            placeholder="≤ 10.000.000"
                            disabled={!dataTypeZNT}
                        />
                    </div>
                </div>

                {/* Tombol Aksi */}
                <div className="filter-actions">
                    {/* Perbarui pemanggilan resetForm */}
                    <button onClick={() => resetForm(false)} className="reset-button">RESET</button>
                    <button onClick={handleApply} className="apply-button">TERAPKAN</button>
                </div>
            </div>
        </div>
    );
}

// Menambahkan PropTypes untuk validasi props
Intersect.propTypes = {
    visible: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onApplyIntersectFilter: PropTypes.func.isRequired,
    layerStates: PropTypes.object.isRequired,
};

export default Intersect;
