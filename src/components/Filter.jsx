// src/components/Filter.jsx
import React, { useState, useEffect } from 'react';
import '../styles/FilterStyle.css'; // Pastikan ini mengarah ke FilterStyle.css yang baru

function Filter({ visible, onClose, onApplyFilter, layerStates }) { // Menambahkan 'visible' dan 'onClose' sebagai props
    const [selectedDataType, setSelectedDataType] = useState(''); // 'znt' atau 'penggunaanLahan'
    const [selectedYears, setSelectedYears] = useState([]);
    const [multiYear, setMultiYear] = useState(false);
    const [minHarga, setMinHarga] = useState('');
    const [maxHarga, setMaxHarga] = useState('');
    const [selectedFungsiLahan, setSelectedFungsiLahan] = useState([]);

    // Fungsi untuk mereset semua filter ke kondisi awal
    const resetFilters = () => {
        setSelectedDataType('');
        setSelectedYears([]);
        setMultiYear(false);
        setMinHarga('');
        setMaxHarga('');
        setSelectedFungsiLahan([]);
        // Juga nonaktifkan semua layer ZNT dan Penggunaan Lahan di peta
        onApplyFilter({
            dataType: '',
            years: [],
            minHarga: null,
            maxHarga: null,
            fungsiLahan: [],
            resetAll: true // Indikator untuk mereset visibilitas layer
        });
        // onClose(); // Opsional: tutup panel setelah reset, tergantung UX yang diinginkan
    };

    const handleDataTypeChange = (type) => {
        setSelectedDataType(type);
        setSelectedYears([]); // Reset tahun saat jenis data berubah
        setMinHarga(''); // Reset filter harga
        setMaxHarga('');
        setSelectedFungsiLahan([]); // Reset filter fungsi lahan
    };

    const handleYearChange = (year) => {
        if (multiYear) {
            setSelectedYears(prev =>
                prev.includes(year) ? prev.filter(y => y !== year) : [...prev, year].sort()
            );
        } else {
            setSelectedYears([year]);
        }
    };

    const handleMultiYearChange = () => {
        setMultiYear(prev => !prev);
        setSelectedYears([]); // Hapus tahun terpilih saat beralih multi-tahun
    };

    const handleFungsiLahanChange = (fungsi) => {
        setSelectedFungsiLahan(prev =>
            prev.includes(fungsi) ? prev.filter(f => f !== fungsi) : [...prev, fungsi]
        );
    };

    const handleApply = () => {
        const filters = {
            dataType: selectedDataType,
            years: selectedYears,
            minHarga: minHarga === '' ? null : Number(minHarga),
            maxHarga: maxHarga === '' ? null : Number(maxHarga),
            fungsiLahan: selectedFungsiLahan,
            resetAll: false, // Bukan reset total
        };
        onApplyFilter(filters);
        onClose(); // Tutup panel filter setelah menerapkan
    };

    return (
        <div className={`filter-panel ${visible ? 'visible' : ''}`}> {/* Menambahkan kelas 'visible' secara kondisional */}
            <div className="filter-header">
                <h3> ☰ Filter Panel</h3>
                <button className="close-button" onClick={onClose}> {/* Menggunakan onClose dari props untuk menutup panel */}
                    &times;
                </button>
            </div>

            <div className="filter-content">
                <section>
                    <h4>Jenis Data:</h4>
                    <label>
                        <input
                            type="radio"
                            name="dataType"
                            value="znt"
                            checked={selectedDataType === 'znt'}
                            onChange={() => handleDataTypeChange('znt')}
                        />
                        Zona Nilai Tanah
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="dataType"
                            value="penggunaanLahan"
                            checked={selectedDataType === 'penggunaanLahan'}
                            onChange={() => handleDataTypeChange('penggunaanLahan')}
                        />
                        Penggunaan Lahan
                    </label>
                </section>

                <section>
                    <h4>Tahun Data:</h4>
                    {['2019', '2021', '2025'].map(year => (
                        <label key={year}>
                            <input
                                type={multiYear ? "checkbox" : "radio"}
                                name="tahunData"
                                value={year}
                                checked={selectedYears.includes(year)}
                                onChange={() => handleYearChange(year)}
                                disabled={!selectedDataType}
                            />
                            {year}
                        </label>
                    ))}
                    <label>
                        <input
                            type="checkbox"
                            checked={multiYear}
                            onChange={handleMultiYearChange}
                            disabled={!selectedDataType}
                        />
                        Multi Tahun
                    </label>
                </section>

                {selectedDataType === 'znt' && (
                    <section>
                        <h4>Filter Harga:</h4>
                        <input
                            type="number"
                            placeholder="Min: (≥ 0)"
                            value={minHarga}
                            onChange={(e) => setMinHarga(e.target.value)}
                            min="0"
                        />
                        <input
                            type="number"
                            placeholder="Max: (≤ 6.000.000)"
                            value={maxHarga}
                            onChange={(e) => setMaxHarga(e.target.value)}
                            max="6000000"
                        />
                    </section>
                )}

                {selectedDataType === 'penggunaanLahan' && (
                    <section>
                        <h4>Fungsi Lahan:</h4>
                        <div className="fungsi-lahan-grid"> {/* Menggunakan fungsi-lahan-grid */}
                            {[
                                'Pemukiman',
                                'Perkebunan',
                                'Ladang',
                                'Sawah',
                                'Semak Belukar',
                                'Sungai',
                                'Jalan',
                            ].map(fungsi => (
                                <label key={fungsi}>
                                    <input
                                        type="checkbox"
                                        value={fungsi}
                                        checked={selectedFungsiLahan.includes(fungsi)}
                                        onChange={() => handleFungsiLahanChange(fungsi)}
                                    />
                                    {fungsi}
                                </label>
                            ))}
                        </div>
                    </section>
                )}

                <div className="filter-actions">
                    <button className="refresh-button" onClick={resetFilters}>
                        RESET
                    </button>
                    <button className="cari-button" onClick={handleApply}>
                        TERAPKAN
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Filter;