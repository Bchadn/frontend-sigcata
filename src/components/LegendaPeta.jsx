import '../styles/LegendaPetaStyle.css';


const legendaFungsiLahan = [
    { warna: 'rgba(198, 40, 40, 0.65)', label: 'Pemukiman' },
    { warna: 'rgba(62, 39, 35, 0.65)', label: 'Perkebunan' },
    { warna: 'rgba(255, 235, 59, 0.65)', label: 'Ladang' },
    { warna: 'rgba(43, 160, 71, 0.65)', label: 'Sawah' },
    { warna: 'rgba(188, 138, 93, 0.65)', label: 'Semak Belukar' },
    { warna: 'rgba(33, 150, 243, 0.7)', label: 'Sungai' },
    { warna: 'rgba(117, 117, 117, 0.8)', label: 'Jalan' },
];

const legendaZNT = [
    { warna: 'rgba(177, 0, 38, 0.6)', label: 'Rp > 5.000.000' },
    { warna: 'rgba(227, 26, 28, 0.6)', label: 'Rp 2.000.001 – 5.000.000' },
    { warna: 'rgba(252, 78, 42, 0.6)', label: 'Rp 1.000.001 – 2.000.000' },
    { warna: 'rgba(253, 141, 60, 0.6)', label: 'Rp 500.001 – 1.000.000' },
    { warna: 'rgba(254, 178, 76, 0.6)', label: 'Rp 200.001 – 500.000' },
    { warna: 'rgba(254, 217, 118, 0.6)', label: 'Rp 100.001 – 200.000' },
    { warna: 'rgba(255, 255, 178, 0.6)', label: '≤ Rp 100.000' },
];

const LegendaBox = ({ title, items }) => (
    <div className="legendaBox">
        <strong className="legendaBoxTitle">{title}</strong>
        <ul className="legendaList">
            {items.map(({ warna, label }) => (
                <li key={label} className="legendaListItem">
                    <span
                        className="legendaColorBox"
                        style={{ backgroundColor: warna }}
                    />
                    <span className="legendaLabel">{label}</span>
                </li>
            ))}
        </ul>
    </div>
);

const LegendaPeta = ({ showFungsiLahan, showZNT }) => {
    if (!showFungsiLahan && !showZNT) return null;

    return (
        <div className="legendaContainer">
            {showFungsiLahan && <LegendaBox title="Fungsi Lahan" items={legendaFungsiLahan} />}
            {showZNT && <LegendaBox title="Zona Nilai Tanah (ZNT)" items={legendaZNT} />}
        </div>
    );
};

export default LegendaPeta;