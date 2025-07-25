import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxCompare from 'mapbox-gl-compare';
import 'mapbox-gl/dist/mapbox-gl.css';
import 'mapbox-gl-compare/dist/mapbox-gl-compare.css';
import '../styles/BandingPetaStyle.css'; // Pastikan import ini benar

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

// Legenda ZNT (berdasarkan harga)
const zntLegendClasses = [
    { label: "≤ Rp 100.000", color: "#ffffb2" },
    { label: "Rp 100.001 – 200.000", color: "#fed976" },
    { label: "Rp 200.001 – 500.000", color: "#feb24c" },
    { label: "Rp 500.001 – 1.000.000", color: "#fd8d3c" },
    { label: "Rp 1.000.001 – 2.000.000", color: "#fc4e2a" },
    { label: "Rp 2.000.001 – 5.000.000", color: "#e31a1c" },
    { label: "Rp > 5.000.000", color: "#b10026" }
];

// Legenda PL (berdasarkan fungsi lahan)
const plLegendClasses = [
    { label: "Pemukiman", color: "#c62828" },
    { label: "Perkebunan", color: "#6d4c41" },
    { label: "Ladang", color: "#ffeb3b" },
    { label: "Sawah", color: "#43a047" },
    { label: "Semak Belukar", color: "#a1887f" },
    { label: "Sungai", color: "#2196f3" },
    { label: "Jalan", color: "#757575" },
];

const getColorByHarga = (Harga) => {
    if (Harga <= 100000) return '#ffffb2';
    if (Harga <= 200000) return '#fed976';
    if (Harga <= 500000) return '#feb24c';
    if (Harga <= 1000000) return '#fd8d3c';
    if (Harga <= 2000000) return '#fc4e2a';
    if (Harga <= 5000000) return '#e31a1c';
    return '#b10026';
};

const getColorByfungsi = (fungsi) => {
    switch (fungsi?.toLowerCase()) {
        case 'pemukiman': return '#c62828';
        case 'perkebunan': return '#6d4c41';
        case 'ladang': return '#ffeb3b';
        case 'sawah': return '#43a047';
        case 'semak belukar': return '#a1887f';
        case 'sungai': return '#2196f3';
        case 'jalan': return '#757575';
        default: return '#e0e0e0';
    }
};

// Fungsi pembantu untuk memformat angka menjadi format mata uang Rupiah
const formatRupiah = (amount) => {
    if (typeof amount !== 'number') {
        return amount; // Mengembalikan nilai asli jika bukan angka
    }
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0, // Tidak ada desimal untuk rupiah
        maximumFractionDigits: 0,
    }).format(amount);
};


const MapboxCompareComponent = () => {
    const leftMapContainer = useRef(null);
    const rightMapContainer = useRef(null);
    const compareContainer = useRef(null);

    const [leftSelection, setLeftSelection] = useState('znt2021');
    const [rightSelection, setRightSelection] = useState('znt2021');
    const [leftMapData, setLeftMapData] = useState(null);
    const [rightMapData, setRightMapData] = useState(null);

    const maps = useRef({});
    const initialCenter = [110.292350, -7.096395];
    const initialZoom = 13;

    const dataOptions = [
        { value: 'znt2019', label: 'Zona Nilai Tanah 2019', type: 'ZNT', year: '2019' },
        { value: 'znt2021', label: 'Zona Nilai Tanah 2021', type: 'ZNT', year: '2021' },
        { value: 'znt2025', label: 'Zona Nilai Tanah 2025', type: 'ZNT', year: '2025' },
        { value: 'pl2019', label: 'Penggunaan Lahan 2019', type: 'PL', year: '2019' },
        { value: 'pl2021', label: 'Penggunaan Lahan 2021', type: 'PL', year: '2021' },
        { value: 'pl2025', label: 'Penggunaan Lahan 2025', type: 'PL', year: '2025' },
    ];

    const fetchData = async (selection, setData) => {
        const selectedOption = dataOptions.find(opt => opt.value === selection);
        if (!selectedOption) return setData(null);
        try {
            const url = `https://backend-sigcata-education.up.railway.app/${selectedOption.type.toLowerCase()}/${selectedOption.year}`;
            const res = await fetch(url);
            const data = await res.json();
            if (!data || data.type !== 'FeatureCollection') throw new Error('Invalid GeoJSON');
            setData({ data, type: selectedOption.type });
        } catch (err) {
            console.error(err);
            setData(null);
        }
    };

    useEffect(() => { fetchData(leftSelection, setLeftMapData); }, [leftSelection]);
    useEffect(() => { fetchData(rightSelection, setRightMapData); }, [rightSelection]);

    useEffect(() => {
        if (!leftMapContainer.current || !rightMapContainer.current || !compareContainer.current) return;

        if (!maps.current.leftMap) {
            maps.current.leftMap = new mapboxgl.Map({
                container: leftMapContainer.current,
                style: 'mapbox://styles/mapbox/satellite-streets-v12', // Ganti dengan style yang Anda inginkan
                center: initialCenter,
                zoom: initialZoom,
                attributionControl: false
            });

            maps.current.rightMap = new mapboxgl.Map({
                container: rightMapContainer.current,
                style: 'mapbox://styles/mapbox/satellite-streets-v12', // Ganti dengan style yang Anda inginkan
                center: initialCenter,
                zoom: initialZoom,
                attributionControl: false
            });

            maps.current.leftMap.addControl(new mapboxgl.NavigationControl(), 'top-left');
            maps.current.rightMap.addControl(new mapboxgl.NavigationControl(), 'top-right');

            maps.current.compare = new MapboxCompare(
                maps.current.leftMap,
                maps.current.rightMap,
                compareContainer.current
            );
        }

        const addLayerToMap = (map, mapData, id) => {
            const sourceId = `${id}-source`;
            const layerId = `${id}-layer`;

            const cleanUpMapLayers = (m) => {
                if (m.getLayer(layerId)) m.removeLayer(layerId);
                if (m.getSource(sourceId)) m.removeSource(sourceId);
            };

            const performAddLayer = () => {
                cleanUpMapLayers(map);

                if (!mapData?.data?.features?.length) return;

                mapData.data.features.forEach(f => {
                    if (!f.properties) f.properties = {};
                    if (mapData.type === 'ZNT') {
                        f.properties.fillColor = getColorByHarga(f.properties.Harga);
                    } else {
                        f.properties.fillColor = getColorByfungsi(f.properties['Fungsi Lahan']);
                    }
                });

                map.addSource(sourceId, { type: 'geojson', data: mapData.data });
                map.addLayer({
                    id: layerId,
                    type: 'fill',
                    source: sourceId,
                    paint: {
                        'fill-color': ['get', 'fillColor'],
                        'fill-opacity': 0.7,
                        'fill-outline-color': '#333'
                    }
                });

                // Add click event listener for the layer
                map.on('click', layerId, (e) => {
                    const features = e.features;
                    if (features && features.length > 0) {
                        const clickedFeature = features[0];
                        const properties = clickedFeature.properties;

                        // Mulai membuat konten popup dengan format tabel
                        let popupContent = '<table class="feature-info-table">';
                        popupContent += '<thead><tr><th colspan="2">Properti Fitur</th></tr></thead>';
                        popupContent += '<tbody>';
                        for (const key in properties) {
                            // Hindari menampilkan 'fillColor' yang merupakan properti internal
                            if (key !== 'fillColor') {
                                let displayValue = properties[key];
                                // Cek jika key adalah 'Harga' dan dataMap adalah ZNT
                                if (key === 'Harga' && mapData.type === 'ZNT') {
                                    displayValue = formatRupiah(properties[key]);
                                }
                                popupContent += `<tr><td><b>${key}:</b></td><td>${displayValue}</td></tr>`;
                            }
                        }
                        popupContent += '</tbody></table>';

                        new mapboxgl.Popup()
                            .setLngLat(e.lngLat)
                            .setHTML(popupContent)
                            .addTo(map);
                    }
                });

                // Change the cursor to a pointer when the mouse is over the layer.
                map.on('mouseenter', layerId, () => {
                    map.getCanvas().style.cursor = 'pointer';
                });

                // Change the cursor back to a grab when it leaves the layer.
                map.on('mouseleave', layerId, () => {
                    map.getCanvas().style.cursor = '';
                });
            };

            if (map.isStyleLoaded()) {
                performAddLayer();
            } else {
                map.once('styledata', performAddLayer);
            }
        };

        addLayerToMap(maps.current.leftMap, leftMapData, 'left');
        addLayerToMap(maps.current.rightMap, rightMapData, 'right');

        return () => {
            if (maps.current.compare) maps.current.compare.remove();
            if (maps.current.leftMap) maps.current.leftMap.remove();
            if (maps.current.rightMap) maps.current.rightMap.remove();
            maps.current = {};
        };
    }, [leftMapData, rightMapData]);

    const getLegendByType = (type) => {
        if (type === 'ZNT') return zntLegendClasses;
        if (type === 'PL') return plLegendClasses;
        return [];
    };

    const getLegendType = (selection) => {
        const found = dataOptions.find(opt => opt.value === selection);
        return found ? found.type : null;
    };

    return (
        <div className="beranda-container">
            <h1 className="judul">Bandingkan Peta</h1> {/* Menggunakan .judul dari StyleApp.css */}

            <div className="map-controls-wrapper">
                <div className="map-control-column">
                    <label htmlFor="left-map-data-select">Menu Layer Kiri</label>
                    <select id="left-map-data-select" value={leftSelection} onChange={e => setLeftSelection(e.target.value)}>
                        {dataOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                </div>
                <div className="map-control-column">
                    <label htmlFor="right-map-data-select">Menu Layer Kanan</label>
                    <select id="right-map-data-select" value={rightSelection} onChange={e => setRightSelection(e.target.value)}>
                        {dataOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                </div>
            </div>

            <div className="map-wrapper">
                <div ref={compareContainer} className="compare-map-wrapper">
                    <div ref={leftMapContainer} className="left-map" />
                    <div ref={rightMapContainer} className="right-map" />

                    <div className="legends-wrapper">
                        <div className="legend-column">
                            <h5>Legenda Layer Kiri</h5>
                            <ul>
                                {getLegendByType(getLegendType(leftSelection)).map((item, i) => (
                                    <li key={i} className="legend-item"> {/* Menggunakan .legend-item */}
                                        <span className="legend-color-box" style={{ backgroundColor: item.color }} /> {/* Menggunakan .legend-color-box */}
                                        <span>{item.label}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="legend-column">
                            <h5>Legenda Layer Kanan</h5>
                            <ul>
                                {getLegendByType(getLegendType(rightSelection)).map((item, i) => (
                                    <li key={i} className="legend-item"> {/* Menggunakan .legend-item */}
                                        <span className="legend-color-box" style={{ backgroundColor: item.color }} /> {/* Menggunakan .legend-color-box */}
                                        <span>{item.label}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default MapboxCompareComponent;