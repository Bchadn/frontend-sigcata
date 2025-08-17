// LayerControl.jsx
import React from 'react';
import '../styles/LayerControlStyle.css';

function LayerControl({ visible, onClose, layers, toggleLayer }) {
  if (!visible) return null;

  return (
    <div className="layer-control">
      <div className="layer-header">
        <strong>LAYER CONTROL</strong>
        <button onClick={onClose} className="close-btn">
          <i className="fas fa-xmark"></i>
        </button>
      </div>
      <div className="layer-body">
        {layers.map((layerGroup, index) => (
          <div key={index} className="layer-group-container">
            {layerGroup.type === 'group' ? (
              <>
                <div className="layer-group-header">
                  <strong>{layerGroup.label}</strong>
                </div>
                {layerGroup.subLayers.map((layer) => (
                  <div key={layer.key} className="layer-item">
                    <label>
                      <input
                        type="checkbox"
                        checked={layer.visible}
                        onChange={() => toggleLayer(layerGroup.groupKey, layer.key)}
                      />
                      {layer.label}
                    </label>
                  </div>
                ))}
              </>
            ) : (
              <div key={layerGroup.key} className="layer-item single-layer">
                <label>
                  <input
                    type="checkbox"
                    checked={layerGroup.visible}
                    onChange={() => toggleLayer(layerGroup.groupKey || layerGroup.key)}
                  />
                  {layerGroup.label}
                </label>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default LayerControl;