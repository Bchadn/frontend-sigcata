// src/Peta.jsx
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Viewer, GeoJsonDataSource } from 'resium';
import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import '../styles/StylePeta.css';
import '../styles/StyleApp.css';

// Import komponen yang diperlukan
import LayerControl from '../components/LayerControl';
import LegendaPeta from '../components/LegendaPeta';
import Filter from '../components/Filter';
import Intersect from '../components/Intersect';

// Import CSS untuk setiap komponen
import '../styles/LayerControlStyle.css';
import '../styles/FilterStyle.css';
import '../styles/LegendaPetaStyle.css';
import '../styles/IntersectStyle.css';

// Set token Cesium Ion
Cesium.Ion.defaultAccessToken = import.meta.env.VITE_CESIUM_TOKEN;

function Peta() {
  // State untuk menyimpan data GeoJSON dari berbagai sumber
  const [znt2019, setZnt2019] = useState(null);
  const [znt2021, setZnt2021] = useState(null);
  const [znt2025, setZnt2025] = useState(null);
  const [batasAdmin, setBatasAdmin] = useState(null);
  const [sampelZNT2025, setSampelZNT2025] = useState(null);
  const [zonaawal2025, setZonaAwal2025] = useState(null);
  const [penggunaanLahan2019, setPenggunaanLahan2019] = useState(null);
  const [penggunaanLahan2021, setPenggunaanLahan2021] = useState(null);
  const [penggunaanLahan2025, setPenggunaanLahan2025] = useState(null);

  // State untuk data hasil interseksi
  const [intersectedData, setIntersectedData] = useState(null);

  // layerStates mengontrol visibilitas layer dasar
  const [layerStates, setLayerStates] = useState({
    batasadmin: { 'main': true },
    znt: { 'sampelZNT2025': false, 'zonaawal2025': false, '2019': false, '2021': false, '2025': false },
    penggunaanLahan: { '2019': false, '2021': false, '2025': false },
    buildings: { 'main': false },
    aerialImagery: { 'main': false },
    intersectedResult: { 'main': true },
  });

  // State untuk mengontrol visibilitas sidebar dan panel
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [intersectVisible, setIntersectVisible] = useState(false);

  // appliedFilters akan digunakan untuk memfilter data GEOJSON yang dirender
  const [appliedFilters, setAppliedFilters] = useState({
    dataType: '',
    years: [],
    minHarga: null,
    maxHarga: null,
    fungsiLahan: [],
  });

  // Referensi untuk objek Cesium Viewer dan 3D Tileset
  const viewerRef = useRef();
  const tilesetRef = useRef(null);
  const fotoUdaraLayerRef = useRef(null);

  // Callback untuk mengubah visibilitas layer
  const toggleLayer = useCallback((groupKey, subLayerKey) => {
    setLayerStates(prev => ({
      ...prev,
      [groupKey]: {
        ...prev[groupKey],
        [subLayerKey]: !prev[groupKey][subLayerKey],
      },
    }));
  }, []);

  // Callback untuk menerapkan filter dari komponen Filter
  const handleApplyFilter = useCallback((filters) => {
    // Jika resetAll adalah true, reset hanya appliedFilters
    if (filters.resetAll) {
      setAppliedFilters({
        dataType: '',
        years: [],
        minHarga: null,
        maxHarga: null,
        fungsiLahan: [],
      });
      return;
    }

    setAppliedFilters(filters);

    // Saat filter diterapkan, aktifkan layer yang difilter secara opsional
    setLayerStates(prev => {
      const newLayerStates = { ...prev };

      if (filters.dataType === 'znt') {
        newLayerStates.znt = { '2019': false, '2021': false, '2025': false };
        filters.years.forEach(year => {
          if (newLayerStates.znt[year] !== undefined) {
            newLayerStates.znt[year] = true;
          }
        });
      } else if (filters.dataType === 'penggunaanLahan') {
        newLayerStates.penggunaanLahan = { '2019': false, '2021': false, '2025': false };
        filters.years.forEach(year => {
          if (newLayerStates.penggunaanLahan[year] !== undefined) {
            newLayerStates.penggunaanLahan[year] = true;
          }
        });
      }
      return newLayerStates;
    });
  }, []);

  // Callback untuk menerima hasil interseksi dari komponen Intersect.jsx
  const handleApplyIntersectFilter = useCallback((data) => {
    setIntersectedData(data);
    setLayerStates(prev => {
      const newLayerStates = { ...prev };
      // Nonaktifkan layer ZNT dan Penggunaan Lahan yang asli saat hasil interseksi ditampilkan
      newLayerStates.znt = { '2019': false, '2021': false, '2025': false };
      newLayerStates.penggunaanLahan = { '2019': false, '2021': false, '2025': false };

      // Aktifkan 'intersectedResult' jika ada data, nonaktifkan jika data null
      newLayerStates.intersectedResult = { 'main': !!data };

      return newLayerStates;
    });

    // Terbang ke hasil interseksi jika ada
    if (viewerRef.current?.cesiumElement && data && data.features.length > 0) {
      const viewer = viewerRef.current.cesiumElement;
      const tempDataSource = new Cesium.GeoJsonDataSource();
      tempDataSource.load(data, {
        clampToGround: true,
        stroke: Cesium.Color.TRANSPARENT,
        fill: Cesium.Color.TRANSPARENT,
      }).then((ds) => {
        if (ds.entities.values.length > 0) {
          viewer.flyTo(ds.entities.values, { duration: 2.5 });
        }
        viewer.dataSources.remove(ds, true);
      });
    }
  }, []);

  // Efek samping untuk pengaturan awal Cesium Viewer
  useEffect(() => {
    const viewer = viewerRef.current?.cesiumElement;
    if (!viewer) return;

    const loadInitialSetup = async () => {
      try {
        const terrain = await Cesium.CesiumTerrainProvider.fromIonAssetId(1);
        viewer.terrainProvider = terrain;
        viewer.scene.globe.depthTestAgainstTerrain = true;
        viewer.scene.globe.enableLighting = true;

        viewer.scene.requestRenderMode = true;
        viewer.scene.maximumRenderTimeChange = Infinity;

        const imageryBounds = Cesium.Rectangle.fromDegrees(110.410, -7.005, 110.430, -6.995);
        viewer.scene.screenSpaceCameraController.rectangleConstraint = imageryBounds;

        viewer.scene.globe.tileLoadFailed.addEventListener(() => { });

        viewer.camera.setView({
          destination: Cesium.Cartesian3.fromDegrees(110.4203, -7.0000, 15000),
          orientation: {
            heading: Cesium.Math.toRadians(0.0),
            pitch: Cesium.Math.toRadians(-45.0),
            roll: 0.0,
          },
        });
      } catch (error) {
        console.error("Gagal memuat setup awal viewer:", error);
      }
    };

    loadInitialSetup();
  }, []);

  // Efek samping untuk mengelola layer Foto Udara
  useEffect(() => {
    const viewer = viewerRef.current?.cesiumElement;
    if (!viewer) return;

    const manageFotoUdaraLayer = async () => {
      const isFotoUdaraActive = layerStates.aerialImagery.main;

      if (isFotoUdaraActive) {
        if (!fotoUdaraLayerRef.current) {
          const originalConsoleError = console.error;
          console.error = (msg, ...args) => {
            if (typeof msg === 'string' && msg.includes('IonImageryProvider')) return;
            originalConsoleError(msg, ...args);
          };

          try {
            const ionImageryProvider = await Cesium.IonImageryProvider.fromAssetId(3573745);
            const layer = viewer.scene.imageryLayers.addImageryProvider(ionImageryProvider, 1);
            fotoUdaraLayerRef.current = layer;
            layer.show = true;
            layer.alpha = 0.8;
          } catch (error) {
            setLayerStates(prev => ({
              ...prev,
              aerialImagery: {
                ...prev.aerialImagery,
                main: false,
              },
            }));
          } finally {
            console.error = originalConsoleError;
          }
        } else {
          fotoUdaraLayerRef.current.show = true;
        }
      } else {
        if (fotoUdaraLayerRef.current) {
          fotoUdaraLayerRef.current.show = false;
        }
      }
    };

    manageFotoUdaraLayer();

    return () => {
      if (viewer && fotoUdaraLayerRef.current) {
        fotoUdaraLayerRef.current.show = false;
      }
    };
  }, [layerStates.aerialImagery.main]);

  // Efek samping untuk mengambil data GeoJSON Batas Administrasi
  useEffect(() => {
    fetch('https://backend-sigcata-education.up.railway.app/batasadmin')
      .then(res => {
        if (!res.ok) {
          throw new Error(`Kesalahan HTTP! status: ${res.status}`);
        }
        return res.json();
      })
      .then(setBatasAdmin)
      .catch((err) => console.error("Gagal memuat Batas Administrasi:", err));
  }, []);

  // Efek samping untuk mengambil data Sampel ZNT
  useEffect(() => {
    fetch('https://backend-sigcata-education.up.railway.app/sampelznt')
      .then(res => {
        if (!res.ok) {
          throw new Error(`Kesalahan HTTP! status: ${res.status}`);
        }
        return res.json();
      })
      .then(setSampelZNT2025)
      .catch((err) => console.error("Gagal memuat Sampel ZNT 2025:", err));
  }, []);

  // Efek samping untuk mengambil data Zona Awal 2025
  useEffect(() => {
    fetch('https://backend-sigcata-education.up.railway.app/zonaawal')
      .then(res => {
        if (!res.ok) {
          throw new Error(`Kesalahan HTTP! status: ${res.status}`);
        }
        return res.json();
      })
      .then(setZonaAwal2025)
      .catch((err) => console.error("Gagal memuat Zona Awal 2025:", err));
  }, []);

  // Efek samping untuk mengambil data ZNT secara dinamis
  useEffect(() => {
    fetch('https://backend-sigcata-education.up.railway.app/znt/2019')
      .then(res => {
        if (!res.ok) {
          throw new Error(`Kesalahan HTTP! status: ${res.status}`);
        }
        return res.json();
      })
      .then(setZnt2019)
      .catch((err) => console.error("Gagal memuat ZNT2019:", err));
  }, []);

  useEffect(() => {
    fetch('https://backend-sigcata-education.up.railway.app/znt/2021')
      .then(res => {
        if (!res.ok) {
          throw new Error(`Kesalahan HTTP! status: ${res.status}`);
        }
        return res.json();
      })
      .then(setZnt2021)
      .catch((err) => console.error("Gagal memuat ZNT2021:", err));
  }, []);

  useEffect(() => {
    fetch('https://backend-sigcata-education.up.railway.app/znt/2025')
      .then(res => {
        if (!res.ok) {
          throw new Error(`Kesalahan HTTP! status: ${res.status}`);
        }
        return res.json();
      })
      .then(setZnt2025)
      .catch((err) => console.error("Gagal memuat ZNT2025:", err));
  }, []);

  // Efek samping untuk mengambil data Penggunaan Lahan secara dinamis
  useEffect(() => {
    fetch('https://backend-sigcata-education.up.railway.app/pl/2019')
      .then(res => {
        if (!res.ok) {
          throw new Error(`Kesalahan HTTP! status: ${res.status}`);
        }
        return res.json();
      })
      .then(setPenggunaanLahan2019)
      .catch((err) => console.error("Gagal memuat Penggunaan Lahan 2019:", err));
  }, []);

  useEffect(() => {
    fetch('https://backend-sigcata-education.up.railway.app/pl/2021')
      .then(res => {
        if (!res.ok) {
          throw new Error(`Kesalahan HTTP! status: ${res.status}`);
        }
        return res.json();
      })
      .then(setPenggunaanLahan2021)
      .catch((err) => console.error("Gagal memuat Penggunaan Lahan 2021:", err));
  }, []);

  useEffect(() => {
    fetch('https://backend-sigcata-education.up.railway.app/pl/2025')
      .then(res => {
        if (!res.ok) {
          throw new Error(`Kesalahan HTTP! status: ${res.status}`);
        }
        return res.json();
      })
      .then(setPenggunaanLahan2025)
      .catch((err) => console.error("Gagal memuat Penggunaan Lahan 2025:", err));
  }, []);

  // Efek samping untuk mengelola Tileset 3D
  useEffect(() => {
    const viewer = viewerRef.current?.cesiumElement;
    if (!viewer) return;

    let handler;

    // Fungsi untuk menangani klik pada bangunan (3D Tiles)
    const setupClickHandler = () => {
      handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

      handler.setInputAction((movement) => {
        const pickedFeature = viewer.scene.pick(movement.position);

        if (!Cesium.defined(pickedFeature) || typeof pickedFeature.getProperty !== "function") {
          console.warn("Tidak ada feature yang valid diklik.");
          return;
        }

        // Ambil properti dari fitur
        const gmlId = pickedFeature.getProperty("gml:id") || "Tidak Tersedia";
        const buildingID = gmlId.split('_')[1] || gmlId;
        const heightRaw = pickedFeature.getProperty("Height");
        const height = typeof heightRaw === "number" ? heightRaw.toFixed(5) : "Tidak Tersedia";

        // Buat entitas terpilih dengan deskripsi
        viewer.selectedEntity = new Cesium.Entity({
          name: `3D Bangunan - ${buildingID}`,
          description: `
          <table class="cesium-infoBox-defaultTable">
            <tbody>
              <tr><th>No Bangunan</th><td>${buildingID}</td></tr>
              <tr><th>Tinggi Bangunan (m)</th><td>${height} m</td></tr>
            </tbody>
          </table>`,
          position: pickedFeature.boundingSphere?.center,
          point: new Cesium.PointGraphics({
            pixelSize: 10,
            color: Cesium.Color.RED.withAlpha(0.8),
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 1,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          }),
        });
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    };

    // Muat Tileset jika diaktifkan
    if (layerStates.buildings.main) {
      if (!tilesetRef.current) {
        const loadTileset = async () => {
          try {
            const tileset = await Cesium.Cesium3DTileset.fromUrl(
              "https://backend-sigcata-education.up.railway.app/tileset/gedung_a/tileset.json"
            );

            viewer.scene.primitives.add(tileset);
            tilesetRef.current = tileset;

            viewer.flyTo(tileset, {
              duration: 2.5,
              offset: new Cesium.HeadingPitchRange(
                Cesium.Math.toRadians(0.0),
                Cesium.Math.toRadians(-30.0),
                tileset.boundingSphere.radius * 2.0
              ),
            });

            // Setup handler setelah tileset berhasil dimuat
            setupClickHandler();
          } catch (error) {
            console.error("Gagal memuat 3D Tileset:", error);
            setLayerStates(prev => ({
              ...prev,
              buildings: {
                ...prev.buildings,
                main: false,
              },
            }));
          }
        };

        loadTileset();
      } else {
        setupClickHandler();
      }
    } else {
      // Hapus tileset dan handler jika layer dinonaktifkan
      if (tilesetRef.current) {
        viewer.scene.primitives.remove(tilesetRef.current);
        tilesetRef.current = null;
      }
      if (handler) {
        handler.destroy();
      }
    }

    // Cleanup handler saat komponen unmount atau berubah
    return () => {
      if (handler) {
        handler.destroy();
      }
    };
  }, [layerStates.buildings.main]);

  // Fungsi pembantu untuk menentukan warna berdasarkan harga ZNT
  const getColorByHarga = (Harga) => {
    if (Harga <= 100000) return Cesium.Color.fromCssColorString('#ffffb2');
    if (Harga <= 200000) return Cesium.Color.fromCssColorString('#fed976');
    if (Harga <= 500000) return Cesium.Color.fromCssColorString('#feb24c');
    if (Harga <= 1000000) return Cesium.Color.fromCssColorString('#fd8d3c');
    if (Harga <= 2000000) return Cesium.Color.fromCssColorString('#fc4e2a');
    if (Harga <= 5000000) return Cesium.Color.fromCssColorString('#e31a1c');
    return Cesium.Color.fromCssColorString('#b10026');
  };

  // Fungsi pembantu untuk menentukan warna berdasarkan fungsi lahan
  const getColorByfungsi = (fungsi) => {
    switch (fungsi?.toLowerCase()) {
      case 'pemukiman':
        return Cesium.Color.fromCssColorString('#c62828').withAlpha(0.65); // Merah Tua
      case 'perkebunan':
        return Cesium.Color.fromCssColorString('#6d4c41').withAlpha(0.65); // Coklat Tua
      case 'ladang':
        return Cesium.Color.fromCssColorString('#ffeb3b').withAlpha(0.65); // Kuning Cerah
      case 'sawah': // Diperbarui dari 'sawah dengan padi diselingi tanaman lain' dan 'sawah dengan padi terus-menerus'
        return Cesium.Color.fromCssColorString('#43a047').withAlpha(0.65); // Hijau Tua (representasi sawah umum)
      case 'semak belukar':
        return Cesium.Color.fromCssColorString('#a1887f').withAlpha(0.65); // Coklat Keabu-abuan
      case 'sungai':
        return Cesium.Color.fromCssColorString('#2196f3').withAlpha(0.7); // Biru Cerah
      case 'jalan': // Menambahkan 'jalan'
        return Cesium.Color.fromCssColorString('#757575').withAlpha(0.8); // Abu-abu Tua untuk jalan
      default:
        return Cesium.Color.fromCssColorString('#e0e0e0').withAlpha(0.4); // Abu-abu Muda untuk default/tidak diketahui
    }
  };

  // Fungsi untuk memfilter data GeoJSON berdasarkan kriteria
  const filterGeoJSON = (data, filters) => {
    if (!data || !data.features) return null;

    let filteredFeatures = data.features;

    if (filters.dataType === 'znt') {
      const min = filters.minHarga;
      const max = filters.maxHarga;
      if (min !== null || max !== null) {
        filteredFeatures = filteredFeatures.filter(feature => {
          const harga = feature.properties?.Harga;
          if (harga === undefined || harga === null) return false;
          const meetsMin = min === null || harga >= min;
          const meetsMax = max === null || harga <= max;
          return meetsMin && meetsMax;
        });
      }
    }

    if (filters.dataType === 'penggunaanLahan' && filters.fungsiLahan.length > 0) {
      filteredFeatures = filteredFeatures.filter(feature => {
        const fungsi = feature.properties?.["Fungsi Lahan"]?.toLowerCase();
        return filters.fungsiLahan.map(f => f.toLowerCase()).includes(fungsi);
      });
    }

    return {
      ...data,
      features: filteredFeatures,
    };
  };

  // Penentuan data GeoJSON mana yang akan dirender berdasarkan layerStates dan appliedFilters
  const isFilterActiveForZNT = appliedFilters.dataType === 'znt' && appliedFilters.years.length > 0;
  const isFilterActiveForPL = appliedFilters.dataType === 'penggunaanLahan' && appliedFilters.years.length > 0;

  const getRenderableZNTData = (year, originalData) => {
    if (layerStates.znt[year]) {
      if (isFilterActiveForZNT && appliedFilters.years.includes(year)) {
        return filterGeoJSON(originalData, appliedFilters);
      } else if (!isFilterActiveForZNT) {
        return originalData;
      }
    }
    return null;
  };

  const getRenderablePLData = (year, originalData) => {
    if (layerStates.penggunaanLahan[year]) {
      if (isFilterActiveForPL && appliedFilters.years.includes(year)) {
        return filterGeoJSON(originalData, appliedFilters);
      } else if (!isFilterActiveForPL) {
        return originalData;
      }
    }
    return null;
  };

  const renderableZnt2019 = getRenderableZNTData('2019', znt2019);
  const renderableZnt2021 = getRenderableZNTData('2021', znt2021);
  const renderableZnt2025 = getRenderableZNTData('2025', znt2025);

  const renderablePenggunaanLahan2019 = getRenderablePLData('2019', penggunaanLahan2019);
  const renderablePenggunaanLahan2021 = getRenderablePLData('2021', penggunaanLahan2021);
  const renderablePenggunaanLahan2025 = getRenderablePLData('2025', penggunaanLahan2025);

  // Penentuan kapan legenda harus ditampilkan
  const showPL2019 = layerStates.penggunaanLahan['2019'] && (isFilterActiveForPL ? appliedFilters.years.includes('2019') : true);
  const showPL2021 = layerStates.penggunaanLahan['2021'] && (isFilterActiveForPL ? appliedFilters.years.includes('2021') : true);
  const showPL2025 = layerStates.penggunaanLahan['2025'] && (isFilterActiveForPL ? appliedFilters.years.includes('2025') : true);

  const showZNT2019 = layerStates.znt['2019'] && (isFilterActiveForZNT ? appliedFilters.years.includes('2019') : true);
  const showZNT2021 = layerStates.znt['2021'] && (isFilterActiveForZNT ? appliedFilters.years.includes('2021') : true);
  const showZNT2025 = layerStates.znt['2025'] && (isFilterActiveForZNT ? appliedFilters.years.includes('2025') : true);

  return (
    <div className="beranda-container">
      <h1 className="judul">Peta</h1>
      <div className="map-container">
        {/* Tombol toggle sidebar Layer Control */}
        <div
          className="layer-toggle-button"
          onClick={() => setSidebarVisible(!sidebarVisible)}
        >
          <i className="fas fa-layer-group"></i>
        </div>

        {/* Tombol Filter */}
        <div
          className="filter-toggle-button"
          onClick={() => setFilterVisible(!filterVisible)}
        >
          <i className="fas fa-filter"></i>
        </div>
        {/* Tombol Intersect */}
        <div
          className="intersect-toggle-button"
          onClick={() => setIntersectVisible(!intersectVisible)}
        >
          <i className="fas fa-random"></i>
        </div>

        {/* Komponen LayerControl untuk mengelola visibilitas layer */}
        <LayerControl
          visible={sidebarVisible}
          onClose={() => setSidebarVisible(false)}
          layers={[
            {
              label: 'Batas Administrasi',
              groupKey: 'batasadmin',
              type: 'group',
              subLayers: [
                { key: 'main', label: 'Batas Administrasi', visible: layerStates.batasadmin['main'] },
              ],
            },
            {
              label: 'Zona Nilai Tanah',
              groupKey: 'znt',
              type: 'group',
              subLayers: [
                { key: 'sampelZNT2025', label: 'Sampel ZNT 2025', visible: layerStates.znt['sampelZNT2025'] },
                { key: 'zonaawal2025', label: 'Zona Awal 2025', visible: layerStates.znt['zonaawal2025'] },
                { key: '2019', label: 'Tahun 2019', visible: layerStates.znt['2019'] },
                { key: '2021', label: 'Tahun 2021', visible: layerStates.znt['2021'] },
                { key: '2025', label: 'Tahun 2025', visible: layerStates.znt['2025'] },
              ],
            },
            {
              label: 'Penggunaan Lahan',
              groupKey: 'penggunaanLahan',
              type: 'group',
              subLayers: [
                { key: '2019', label: 'Tahun 2019', visible: layerStates.penggunaanLahan['2019'] },
                { key: '2021', label: 'Tahun 2021', visible: layerStates.penggunaanLahan['2021'] },
                { key: '2025', label: 'Tahun 2025', visible: layerStates.penggunaanLahan['2025'] },
              ],
            },
            {
              label: '3D Kawasan Bangunan',
              groupKey: 'buildings',
              type: 'group',
              subLayers: [
                { key: 'main', label: '3D Bangunan', visible: layerStates.buildings['main'] },
              ],
            },
            {
              label: 'Foto Udara',
              groupKey: 'aerialImagery',
              type: 'group',
              subLayers: [
                { key: 'main', label: 'Foto Udara Campurejo & Tampingan', visible: layerStates.aerialImagery['main'] },
              ],
            },
            {
              label: 'Hasil Interseksi',
              groupKey: 'intersectedResult',
              type: 'group',
              subLayers: [
                { key: 'main', label: 'Tampilkan Hasil Interseksi', visible: layerStates.intersectedResult['main'] },
              ],
            },
          ]}
          toggleLayer={toggleLayer}
        />

        {/* Komponen Filter untuk memfilter data spasial */}
        <Filter
          visible={filterVisible}
          onClose={() => setFilterVisible(false)}
          onApplyFilter={handleApplyFilter}
          layerStates={layerStates}
          toggleLayer={toggleLayer}
        />

        {/* Komponen Intersect untuk melakukan operasi geoprocessing interseksi */}
        <Intersect
          visible={intersectVisible}
          onClose={() => setIntersectVisible(false)}
          onApplyIntersectFilter={handleApplyIntersectFilter}
          layerStates={layerStates}
        />

        {/* Cesium Viewer */}
        <Viewer
          ref={viewerRef}
          className="map"
          full
          baseLayerPicker={true}
          geocoder={true}
          homeButton={true}
          navigationHelpButton={true}
          sceneModePicker={true}
          timeline={false}
          animation={false}
          fullscreenButton={true}
        >
          {/* Render Batas Administrasi GeoJSON */}
          {batasAdmin && layerStates.batasadmin.main && (
            <GeoJsonDataSource
              data={batasAdmin}
              stroke={Cesium.Color.BLUE}
              strokeWidth={2}
              fill={Cesium.Color.WHITE.withAlpha(0.25)}
              clampToGround={true}
              onLoad={async (ds) => {
                ds.name = 'Batas Administrasi';
                const viewer = viewerRef.current?.cesiumElement;
                if (viewer) {
                  viewer.flyTo(ds, { duration: 2.5 });
                }
                ds.entities.values.forEach(entity => {
                  const props = entity.properties;
                  if (props) {
                    const desa = props.Desa?.getValue?.() || '';
                    const kecamatan = props.Kecamatan?.getValue?.() || '';
                    const kabupaten = props.Kabupaten?.getValue?.() || '';
                    const provinsi = props.Provinsi?.getValue?.() || '';
                    entity.name = "Batas Administrasi";
                    entity.description = `
                      <table class="cesium-infoBox-defaultTable">
                        <tbody>
                          <tr><th>Desa</th><td>${desa}</td></tr>
                          <tr><th>Kecamatan</th><td>${kecamatan}</td></tr>
                          <tr><th>Kabupaten</th><td>${kabupaten}</td></tr>
                          <tr><th>Provinsi</th><td>${provinsi}</td></tr>
                        </tbody>
                      </table>`;
                  }
                });
              }}
            />
          )}

          {/* Render Sampel ZNT 2025 GeoJSON */}
          {sampelZNT2025 && layerStates.znt.sampelZNT2025 && (
            <GeoJsonDataSource
              data={sampelZNT2025}
              clampToGround={true}
              onLoad={async (ds) => {
                ds.name = 'Sampel ZNT 2025';
                const viewer = viewerRef.current?.cesiumElement;
                if (viewer) viewer.flyTo(ds, { duration: 2.5 });

                ds.entities.values.forEach(entity => {
                  const props = entity.properties;
                  const noZona = props?.["No Zona"]?.getValue?.() ?? '';
                  const keterangan = props?.["Keterangan"]?.getValue?.() ?? '';
                  const x = props?.["Koordinat X"]?.getValue?.() ?? '';
                  const y = props?.["Koordinat Y"]?.getValue?.() ?? '';
                  const harga = props?.["Harga per m2"]?.getValue?.() ?? 0;

                  entity.name = `Sampel ZNT - Zona ${noZona}`;
                  entity.description = `
                  <table class="cesium-infoBox-defaultTable">
                     <tbody>
                        <tr><th>No Zona</th><td>${noZona}</td></tr>
                        <tr><th>Keterangan</th><td>${keterangan}</td></tr>
                        <tr><th>Koordinat X</th><td>${x}</td></tr>
                        <tr><th>Koordinat Y</th><td>${y}</td></tr>
                        <tr><th>Harga/m²</th><td>Rp ${harga.toLocaleString("id-ID")}</td></tr>
                      </tbody>
                  </table>`;

                  if (entity.position) {
                    entity.point = new Cesium.PointGraphics({
                      pixelSize: 10,
                      color: Cesium.Color.RED.withAlpha(0.8),
                      outlineColor: Cesium.Color.WHITE,
                      outlineWidth: 1,
                      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                    });
                  }
                });
              }}
            />
          )}

          {/* Render Zona Awal 2025 GeoJSON */}
          {zonaawal2025 && layerStates.znt.zonaawal2025 && (
            <GeoJsonDataSource
              data={zonaawal2025}
              stroke={Cesium.Color.BLACK}
              strokeWidth={1}
              fill={Cesium.Color.ORANGE.withAlpha(0.25)}
              clampToGround={true}
              onLoad={async (ds) => {
                ds.name = 'Zona Awal ZNT 2025';
                const viewer = viewerRef.current?.cesiumElement;
                if (viewer) viewer.flyTo(ds, { duration: 2.5 });

                ds.entities.values.forEach(entity => {
                  const props = entity.properties;
                  const noZona = props?.["No Zona"]?.getValue?.() ?? '';
                  entity.name = `Zona Awal ${noZona}`;
                  entity.description = `
                  <table class="cesium-infoBox-defaultTable">
                      <tbody>
                        <tr><th>No Zona</th><td>${noZona}</td></tr>
                      </tbody>
                   </table>`;

                  if (entity.polygon) {
                    entity.polygon.material = Cesium.Color.ORANGE.withAlpha(0.6);
                    entity.polygon.height = 0;
                    entity.polygon.heightReference = Cesium.HeightReference.CLAMP_TO_GROUND;
                    entity.polygon.perPositionHeight = false;
                    entity.polygon.outline = true;
                    entity.polygon.outlineColor = Cesium.Color.BLACK;
                  }
                });
              }}
            />
          )}

          {/* Render ZNT 2019 GeoJSON */}
          {renderableZnt2019 && (
            <GeoJsonDataSource
              data={renderableZnt2019}
              stroke={Cesium.Color.BLACK}
              strokeWidth={1}
              clampToGround={true}
              onLoad={async (ds) => {
                ds.name = 'ZNT2019';
                const viewer = viewerRef.current?.cesiumElement;
                if (viewer) {
                  viewer.flyTo(ds, { duration: 2.5 });
                }
                ds.entities.values.forEach(entity => {
                  const props = entity.properties;
                  const harga = props?.Harga?.getValue?.() ?? 0;
                  const zona = props?.["Nomor Zona"]?.getValue?.() ?? "";
                  const color = getColorByHarga(harga);

                  if (entity.polygon) {
                    entity.polygon.material = color.withAlpha(0.6);
                    entity.polygon.height = 0;
                    entity.polygon.heightReference = Cesium.HeightReference.CLAMP_TO_GROUND;
                    entity.polygon.perPositionHeight = false;
                    entity.polygon.outline = true;
                    entity.polygon.outlineColor = Cesium.Color.BLACK;
                  }

                  entity.name = "Zona Nilai Tanah 2019";
                  entity.description = `
                    <table class="cesium-infoBox-defaultTable">
                      <tbody>
                        <tr><th>Nomor Zona</th><td>${zona}</td></tr>
                        <tr><th>Harga</th><td>Rp ${harga.toLocaleString("id-ID")}</td></tr>
                      </tbody>
                    </table>`;
                });
              }}
            />
          )}

          {/* Render ZNT 2021 GeoJSON */}
          {renderableZnt2021 && (
            <GeoJsonDataSource
              data={renderableZnt2021}
              stroke={Cesium.Color.BLACK}
              strokeWidth={1}
              clampToGround={true}
              onLoad={async (ds) => {
                ds.name = 'ZNT2021';
                const viewer = viewerRef.current?.cesiumElement;
                if (viewer) {
                  viewer.flyTo(ds, { duration: 2.5 });
                }
                ds.entities.values.forEach(entity => {
                  const props = entity.properties;
                  const harga = props?.Harga?.getValue?.() ?? 0;
                  const zona = props?.["Nomor Zona"]?.getValue?.() ?? "";
                  const color = getColorByHarga(harga);

                  if (entity.polygon) {
                    entity.polygon.material = color.withAlpha(0.6);
                    entity.polygon.height = 0;
                    entity.polygon.heightReference = Cesium.HeightReference.CLAMP_TO_GROUND;
                    entity.polygon.perPositionHeight = false;
                    entity.polygon.outline = true;
                    entity.polygon.outlineColor = Cesium.Color.BLACK;
                  }

                  entity.name = "Zona Nilai Tanah 2021";
                  entity.description = `
                    <table class="cesium-infoBox-defaultTable">
                      <tbody>
                        <tr><th>Nomor Zona</th><td>${zona}</td></tr>
                        <tr><th>Harga</th><td>Rp ${harga.toLocaleString("id-ID")}</td></tr>
                      </tbody>
                    </table>`;
                });
              }}
            />
          )}

          {/* Render ZNT 2025 GeoJSON */}
          {renderableZnt2025 && (
            <GeoJsonDataSource
              data={renderableZnt2025}
              stroke={Cesium.Color.BLACK}
              strokeWidth={1}
              clampToGround={true}
              onLoad={async (ds) => {
                ds.name = 'ZNT2025';
                const viewer = viewerRef.current?.cesiumElement;
                if (viewer) {
                  viewer.flyTo(ds, { duration: 2.5 });
                }
                ds.entities.values.forEach(entity => {
                  const props = entity.properties;
                  const harga = props?.Harga?.getValue?.() ?? 0;
                  const zona = props?.["Nomor Zona"]?.getValue?.() ?? "";
                  const color = getColorByHarga(harga);

                  if (entity.polygon) {
                    entity.polygon.material = color.withAlpha(0.6);
                    entity.polygon.height = 0;
                    entity.polygon.heightReference = Cesium.HeightReference.CLAMP_TO_GROUND;
                    entity.polygon.perPositionHeight = false;
                    entity.polygon.outline = true;
                    entity.polygon.outlineColor = Cesium.Color.BLACK;
                  }

                  entity.name = "Zona Nilai Tanah 2025";
                  entity.description = `
                    <table class="cesium-infoBox-defaultTable">
                      <tbody>
                        <tr><th>Nomor Zona</th><td>${zona}</td></tr>
                        <tr><th>Harga</th><td>Rp ${harga.toLocaleString("id-ID")}</td></tr>
                      </tbody>
                    </table>`;
                });
              }}
            />
          )}

          {/* Render Penggunaan Lahan 2019 */}
          {renderablePenggunaanLahan2019 && (
            <GeoJsonDataSource
              data={renderablePenggunaanLahan2019}
              stroke={Cesium.Color.BLACK}
              strokeWidth={1}
              clampToGround={true}
              onLoad={async (ds) => {
                ds.name = 'Penggunaan Lahan 2019';
                const viewer = viewerRef.current?.cesiumElement;
                if (viewer) {
                  viewer.flyTo(ds, { duration: 2.5 });
                }

                ds.entities.values.forEach(entity => {
                  const props = entity.properties;
                  const fungsi = props?.["Fungsi Lahan"]?.getValue?.() ?? '';
                  const color = getColorByfungsi(fungsi);

                  if (entity.polygon) {
                    entity.polygon.material = color;
                    entity.polygon.height = 0;
                    entity.polygon.heightReference = Cesium.HeightReference.CLAMP_TO_GROUND;
                    entity.polygon.perPositionHeight = false;
                    entity.polygon.outline = true;
                    entity.polygon.outlineColor = Cesium.Color.BLACK;
                  }

                  entity.name = "Penggunaan Lahan 2019";
                  entity.description = `
          <table class="cesium-infoBox-defaultTable">
            <tbody>
              <tr><th>Fungsi</th><td>${fungsi}</td></tr>
            </tbody>
          </table>`;
                });
              }}
            />
          )}

          {/* Render Penggunaan Lahan 2021 */}
          {renderablePenggunaanLahan2021 && (
            <GeoJsonDataSource
              data={renderablePenggunaanLahan2021}
              stroke={Cesium.Color.BLACK}
              strokeWidth={1}
              clampToGround={true}
              onLoad={async (ds) => {
                ds.name = 'Penggunaan Lahan 2021';
                const viewer = viewerRef.current?.cesiumElement;
                if (viewer) {
                  viewer.flyTo(ds, { duration: 2.5 });
                }

                ds.entities.values.forEach(entity => {
                  const props = entity.properties;
                  const fungsi = props?.["Fungsi Lahan"]?.getValue?.() ?? '';
                  const color = getColorByfungsi(fungsi);

                  if (entity.polygon) {
                    entity.polygon.material = color;
                    entity.polygon.height = 0;
                    entity.polygon.heightReference = Cesium.HeightReference.CLAMP_TO_GROUND;
                    entity.polygon.perPositionHeight = false;
                    entity.polygon.outline = true;
                    entity.polygon.outlineColor = Cesium.Color.BLACK;
                  }

                  entity.name = "Penggunaan Lahan 2021";
                  entity.description = `
          <table class="cesium-infoBox-defaultTable">
            <tbody>
              <tr><th>Fungsi</th><td>${fungsi}</td></tr>
            </tbody>
          </table>`;
                });
              }}
            />
          )}

          {/* Render Penggunaan Lahan 2025 */}
          {renderablePenggunaanLahan2025 && (
            <GeoJsonDataSource
              data={renderablePenggunaanLahan2025}
              stroke={Cesium.Color.BLACK}
              strokeWidth={1}
              clampToGround={true}
              onLoad={async (ds) => {
                ds.name = 'Penggunaan Lahan 2025';
                const viewer = viewerRef.current?.cesiumElement;
                if (viewer) {
                  viewer.flyTo(ds, { duration: 2.5 });
                }

                ds.entities.values.forEach(entity => {
                  const props = entity.properties;
                  const fungsi = props?.["Fungsi Lahan"]?.getValue?.() ?? '';
                  const color = getColorByfungsi(fungsi);

                  if (entity.polygon) {
                    entity.polygon.material = color;
                    entity.polygon.height = 0;
                    entity.polygon.heightReference = Cesium.HeightReference.CLAMP_TO_GROUND;
                    entity.polygon.perPositionHeight = false;
                    entity.polygon.outline = true;
                    entity.polygon.outlineColor = Cesium.Color.BLACK;
                  }

                  entity.name = "Penggunaan Lahan 2025";
                  entity.description = `
          <table class="cesium-infoBox-defaultTable">
            <tbody>
              <tr><th>Fungsi</th><td>${fungsi}</td></tr>
            </tbody>
          </table>`;
                });
              }}
            />
          )}

          {/* Render Hasil Interseksi */}
          {layerStates.intersectedResult.main && intersectedData && (
            <GeoJsonDataSource
              data={intersectedData}
              clampToGround={true}
              onLoad={(ds) => {
                ds.name = 'Hasil Interseksi';
                ds.entities.values.forEach(entity => {
                  const props = entity.properties;
                  const fungsiLahan = props?.fungsi?.getValue?.() || 'Tidak Diketahui';
                  const hargaZNT = props?.harga?.getValue?.() || 0;
                  const noZona = props?.no_zona?.getValue?.() || 'Tidak Diketahui';

                  if (entity.polygon) {
                    entity.polygon.material = Cesium.Color.MAGENTA.withAlpha(0.6);
                    entity.polygon.height = 0;
                    entity.polygon.heightReference = Cesium.HeightReference.CLAMP_TO_GROUND;
                    entity.polygon.perPositionHeight = false;
                    entity.polygon.outline = true;
                    entity.polygon.outlineColor = Cesium.Color.WHITE;
                    entity.polygon.outlineWidth = 2;
                  }

                  entity.name = "Area Interseksi";
                  entity.description = `
                    <table class="cesium-infoBox-defaultTable">
                      <tbody>
                        <tr><th>Fungsi Lahan</th><td>${fungsiLahan}</td></tr>
                        <tr><th>Nomor Zona ZNT</th><td>${noZona}</td></tr>
                        <tr><th>Harga ZNT</th><td>Rp ${hargaZNT.toLocaleString("id-ID")}</td></tr>
                      </tbody>
                    </table>`;
                });
              }}
            />
          )}

        </Viewer>

        {/* Komponen LegendaPeta untuk menampilkan legenda berdasarkan layer yang aktif */}
        <LegendaPeta
          showFungsiLahan={showPL2019 || showPL2021 || showPL2025}
          showZNT={showZNT2019 || showZNT2021 || showZNT2025}
        />
      </div>
    </div>
  );
}

export default Peta;