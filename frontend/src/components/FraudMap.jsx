import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Map as MapIcon, ShieldAlert, TrendingUp, MapPin, AlertTriangle } from 'lucide-react';

const API_URL = 'https://finacial-fruad-detection.onrender.com/api/soc';

// World map coordinates (country centers for pin placement)
const COUNTRY_COORDS = {
  'India': { x: 65, y: 28 },
  'Pakistan': { x: 69, y: 30 },
  'Bangladesh': { x: 90, y: 24 },
  'Nepal': { x: 84, y: 28 },
  'Sri Lanka': { x: 81, y: 7 },
  'UAE': { x: 54, y: 24 },
  'Saudi Arabia': { x: 45, y: 24 },
  'UK': { x: -3, y: 54 },
  'USA': { x: -95, y: 37 },
  'China': { x: 105, y: 35 },
};

// Convert lat/lng to SVG coordinates (simple mercator projection approximation)
const projectCoords = (lat, lng, width = 960, height = 600) => {
  const x = ((lng + 180) / 360) * width;
  const y = ((90 - lat) / 180) * height;
  return { x, y };
};

const FraudMap = () => {
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState(null);

  useEffect(() => {
    const fetchMapData = async () => {
      try {
        const response = await axios.get(`${API_URL}/dashboard/stats`);
        const fetchedRegions = response.data.overview.regions;
        setRegions(fetchedRegions);
        setLoading(false);
        if (fetchedRegions.length > 0) {
          setSelectedRegion(prev => prev || fetchedRegions[0]);
        }
      } catch (error) {
        console.error('Error fetching map data:', error);
      }
    };
    fetchMapData();
    const interval = setInterval(fetchMapData, 3000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="text-secondary">Loading Map Data...</div>;

  // Calculate max risk for scaling
  const maxRisk = Math.max(...regions.map(r => r.risk), 1);

  return (
    <div className="fade-in">
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1>Global Fraud Heatmap</h1>
          <p className="text-secondary">Real-time geospatial fraud detection & regional threat intelligence across transaction networks.</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span className="badge badge-fraud" style={{ marginBottom: '0.5rem', gap: '0.5rem' }}>
            <TrendingUp size={14} />
            Live Global View
          </span>
        </div>
      </header>

      <div className="dashboard-grid">
        {/* World Map SVG */}
        <div className="glass-panel world-map-container" style={{ gridColumn: 'span 8', minHeight: '500px', padding: '1.5rem' }}>
          <svg viewBox="0 0 960 600" className="world-map-svg" style={{ width: '100%', height: '100%', minHeight: '300px' }}>
            {/* Simplified World Map Background */}
            <defs>
              <linearGradient id="mapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(8, 12, 20, 0.8)" />
                <stop offset="100%" stopColor="rgba(12, 15, 28, 0.9)" />
              </linearGradient>
            </defs>
            
            {/* Map background */}
            <rect width="960" height="600" fill="url(#mapGradient)" />
            
            {/* Grid lines */}
            {[...Array(7)].map((_, i) => (
              <line key={`v${i}`} x1={i * 160} y1="0" x2={i * 160} y2="600" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
            ))}
            {[...Array(4)].map((_, i) => (
              <line key={`h${i}`} x1="0" y1={i * 200} x2="960" y2={i * 200} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
            ))}

            {/* Plot regions on map */}
            {regions.map((region, idx) => {
              const coords = COUNTRY_COORDS[region.name] || { x: 50 + (idx * 10), y: 25 + (idx * 5) };
              const pos = projectCoords(coords.y, coords.x);
              const riskIntensity = Math.min(region.risk / maxRisk, 1);
              const size = 25 + (riskIntensity * 35);
              const color = region.risk > 0 ? `rgba(239, 68, 68, ${0.4 + riskIntensity * 0.6})` : 'rgba(59, 130, 246, 0.5)';
              const borderColor = region.risk > 0 ? 'rgba(239, 68, 68, 0.8)' : 'rgba(59, 130, 246, 0.8)';

              return (
                <g key={region.name}>
                  {/* Pulse ring */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={size * 1.3}
                    fill="none"
                    stroke={borderColor}
                    strokeWidth="1"
                    opacity="0.3"
                  />
                  {/* Main pin */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={size}
                    fill={color}
                    stroke={borderColor}
                    strokeWidth="2"
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelectedRegion(region)}
                  />
                  {/* Risk count */}
                  <text
                    x={pos.x}
                    y={pos.y}
                    textAnchor="middle"
                    dy="0.3em"
                    fill="white"
                    fontSize="14"
                    fontWeight="700"
                  >
                    {region.risk}
                  </text>
                  {/* Region label */}
                  <text
                    x={pos.x}
                    y={pos.y + size + 20}
                    textAnchor="middle"
                    fill="rgba(255,255,255,0.8)"
                    fontSize="11"
                    fontWeight="500"
                  >
                    {region.name}
                  </text>
                </g>
              );
            })}
          </svg>

          <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', gap: '2rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.8)' }}></div>
                <span>High Risk Zones</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.8)' }}></div>
                <span>Low Risk Zones</span>
              </div>
            </div>
          </div>
        </div>

        {/* Regional Details Panel */}
        <div className="glass-panel" style={{ gridColumn: 'span 4', height: 'fit-content' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '0 0 1.5rem 0' }}>
            <MapPin size={24} />
            {selectedRegion ? `${selectedRegion.name} Details` : 'Select a Region'}
          </h3>
          
          {selectedRegion ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="region-stat">
                <span className="text-secondary" style={{ fontSize: '0.85rem', textTransform: 'uppercase' }}>Cases Detected</span>
                <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--status-fraud)' }}>{selectedRegion.risk}</div>
              </div>

              <div className="region-stat">
                <span className="text-secondary" style={{ fontSize: '0.85rem', textTransform: 'uppercase' }}>Risk Level</span>
                <div style={{ fontSize: '1.1rem', fontWeight: '600', marginTop: '0.5rem' }}>
                  {selectedRegion.risk > 15 ? (
                    <span className="text-fraud" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <AlertTriangle size={18} /> Critical
                    </span>
                  ) : selectedRegion.risk > 8 ? (
                    <span className="text-warning" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <AlertTriangle size={18} /> High
                    </span>
                  ) : (
                    <span className="text-verified" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      ✓ Low
                    </span>
                  )}
                </div>
              </div>

              <div className="region-stat">
                <span className="text-secondary" style={{ fontSize: '0.85rem', textTransform: 'uppercase' }}>Last Detection</span>
                <span style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>2 minutes ago</span>
              </div>

              <button className="btn" style={{ width: '100%', marginTop: '1rem' }}>View Details</button>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem 0' }}>
              <MapIcon size={48} style={{ opacity: 0.3, margin: '0 auto 1rem' }} />
              <p>Click on a region to view detailed threat information</p>
            </div>
          )}
        </div>

        {/* Regional Threat List */}
        <div className="glass-panel" style={{ gridColumn: 'span 12', marginTop: '1rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '0 0 1.5rem 0' }}>
            <TrendingUp size={24} />
            All Active Threat Zones
          </h3>

          {regions.length > 0 && (
            <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem', padding: '1.25rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ flex: 1 }}>
                <span className="text-secondary" style={{ fontSize: '0.85rem', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <TrendingUp size={14} className="text-fraud" /> Highest Threat Region
                </span>
                <div style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--status-fraud)', marginTop: '0.5rem' }}>
                  {regions.reduce((max, r) => r.risk > max.risk ? r : max, regions[0]).name}
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginLeft: '0.5rem', fontWeight: 'normal' }}>
                    ({Math.max(...regions.map(r => r.risk))} active cases)
                  </span>
                </div>
              </div>
              <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
              <div style={{ flex: 1 }}>
                <span className="text-secondary" style={{ fontSize: '0.85rem', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldAlert size={14} className="text-verified" /> Lowest Threat Region
                </span>
                <div style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--status-verified)', marginTop: '0.5rem' }}>
                  {regions.reduce((min, r) => r.risk < min.risk ? r : min, regions[0]).name}
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginLeft: '0.5rem', fontWeight: 'normal' }}>
                    ({Math.min(...regions.map(r => r.risk))} active cases)
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            {regions.map(region => (
              <div key={region.name} className="threat-zone-card" onClick={() => setSelectedRegion(region)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                  <h4 style={{ margin: 0, fontSize: '1rem' }}>{region.name}</h4>
                  <span className={`badge ${region.risk > 8 ? 'badge-fraud' : 'badge-warning'}`}>
                    {region.risk > 15 ? 'Critical' : region.risk > 8 ? 'High' : 'Medium'}
                  </span>
                </div>
                
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span className="text-secondary" style={{ fontSize: '0.85rem' }}>Cases</span>
                    <span style={{ fontWeight: '600' }}>{region.risk}</span>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${Math.min((region.risk / maxRisk) * 100, 100)}%`,
                        background: region.risk > 8 ? 'var(--status-fraud)' : 'var(--status-warning)',
                        transition: 'width 0.5s ease'
                      }}
                    ></div>
                  </div>
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  Click to view
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FraudMap;
