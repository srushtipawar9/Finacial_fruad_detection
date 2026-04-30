import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, ShieldAlert, CheckCircle, AlertTriangle, Smartphone, Volume2, MapPin, Brain } from 'lucide-react';

const API_URL = 'https://finacial-fruad-detection.onrender.com/api/soc';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voiceAlerts, setVoiceAlerts] = useState([]);
  const [history, setHistory] = useState([]);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/dashboard/stats`);
      setStats(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setLoading(false);
    }
  };

  const fetchVoiceAlerts = async () => {
    try {
      const response = await axios.get(`${API_URL}/voice/alerts`);
      setVoiceAlerts(response.data.pending_alerts || []);
    } catch (error) {
      console.error('Error fetching voice alerts:', error);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`${API_URL}/history`);
      setHistory(response.data || []);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchVoiceAlerts();
    fetchHistory();
    const interval = setInterval(() => {
      fetchStats();
      fetchVoiceAlerts();
      fetchHistory();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !stats) {
    return <div className="text-secondary">Loading SOC metrics...</div>;
  }

  const { overview, recentTransactions, regionalThreats } = stats;

  return (
    <div className="fade-in">
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>AI SOC Overview</h1>
          <p className="text-secondary">Global Financial Threat Detection Intelligence</p>
          <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span className="badge badge-verified" style={{ fontSize: '0.7rem', whiteSpace: 'nowrap' }}>AI Learning Mode Active</span>
            <input 
              type="number" 
              placeholder="Set New Limit (₹)" 
              style={{ padding: '0.3rem', fontSize: '0.8rem', width: '120px' }}
              onKeyDown={async (e) => {
                if (e.key === 'Enter') {
                  await axios.post(`${API_URL}/train`, { newRangeMax: e.target.value });
                  alert('AI Model Updated: New normal range learned.');
                }
              }}
            />
          </div>
        </div>
        <a href="https://finacial-fruad-detection.onrender.com/api/soc/export" download className="btn" style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.875rem', whiteSpace: 'nowrap', alignSelf: 'flex-start', flexShrink: 0 }}>
          Export Audit Logs
        </a>
      </header>

      <div className="dashboard-grid">
        {/* Core SOC Metrics */}
        <div className="glass-panel stat-card">
          <div className="stat-label">Total Detections</div>
          <div className="stat-value">{overview.totalTransactions}</div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-label">Verified Payments</div>
          <div className="stat-value text-verified">{overview.verified}</div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-label">Blocked Fraud</div>
          <div className="stat-value text-fraud">{overview.potentialFraud}</div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-label">QR Tampering</div>
          <div className="stat-value text-warning">{overview.tamperingAttempts || 0}</div>
        </div>

        {/* AI & Device Monitoring */}
        <div className="glass-panel stat-card">
          <div className="stat-label">AI Confidence</div>
          <div className="stat-value" style={{ color: '#00d4aa' }}>{overview.aiConfidence || 85}%</div>
          <Brain size={16} style={{ marginTop: '0.5rem', opacity: 0.7 }} />
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-label">Active Devices</div>
          <div className="stat-value">{overview.deviceStats?.activeMonitoring || 0}</div>
          <Smartphone size={16} style={{ marginTop: '0.5rem', opacity: 0.7 }} />
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-label">Voice Alerts</div>
          <div className="stat-value" style={{ color: '#ff6b6b' }}>{overview.voiceStats?.pendingAlerts || 0}</div>
          <Volume2 size={16} style={{ marginTop: '0.5rem', opacity: 0.7 }} />
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-label">Regional Threats</div>
          <div className="stat-value text-warning">{regionalThreats?.length || 0}</div>
          <MapPin size={16} style={{ marginTop: '0.5rem', opacity: 0.7 }} />
        </div>

        {/* Voice Alerts Panel */}
        {voiceAlerts.length > 0 && (
          <div className="glass-panel col-span-12" style={{ marginTop: '1rem' }}>
            <h4 style={{ color: '#ff6b6b', marginBottom: '1rem' }}>🚨 Active Voice Alerts</h4>
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {voiceAlerts.slice(0, 3).map((alert) => (
                <div key={alert.id} style={{
                  padding: '0.5rem',
                  marginBottom: '0.5rem',
                  background: alert.severity === 'critical' ? 'rgba(255, 107, 107, 0.1)' : 'rgba(255, 193, 7, 0.1)',
                  borderRadius: '4px',
                  borderLeft: `3px solid ${alert.severity === 'critical' ? '#ff6b6b' : '#ffc107'}`
                }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: '600' }}>{alert.message}</div>
                  <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>{new Date(alert.timestamp).toLocaleTimeString()}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Regional Threat Map */}
        {regionalThreats && regionalThreats.length > 0 && (
          <div className="glass-panel col-span-12" style={{ marginTop: '1rem' }}>
            <h4 style={{ color: '#ffc107', marginBottom: '1rem' }}>🌍 Regional Threat Intelligence</h4>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              {regionalThreats.map((region) => (
                <div key={region.name} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.5rem',
                  background: region.activeThreats > 3 ? 'rgba(255, 107, 107, 0.1)' : 'rgba(255, 193, 7, 0.1)',
                  borderRadius: '4px'
                }}>
                  <span>{region.name}</span>
                  <span style={{
                    color: region.activeThreats > 3 ? '#ff6b6b' : '#ffc107',
                    fontWeight: '600'
                  }}>
                    {region.activeThreats} threats
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Transaction Feed */}
        <div className="glass-panel col-span-12" style={{ marginTop: '1rem' }}>
          <h3>🔍 Real-Time Transaction Intelligence Feed</h3>
          <div className="transaction-list" style={{ marginTop: '1.5rem' }}>
            {recentTransactions.length === 0 && (
              <div className="text-secondary">No recent activity detected.</div>
            )}
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="transaction-item">
                <div className="tx-info">
                  <div className={`tx-icon ${
                    tx.status === 'Verified Transaction' ? 'badge-verified' : 
                    tx.status === 'Potential Fraud' ? 'badge-fraud' : 'badge-warning'
                  }`}>
                    {tx.status === 'Verified Transaction' ? <CheckCircle size={20} /> : 
                     tx.status === 'Potential Fraud' ? <ShieldAlert size={20} /> : <AlertTriangle size={20} />}
                  </div>
                  <div>
                    <div style={{ fontWeight: '600' }}>
                      ₹{tx.amount} → {tx.merchant_name || tx.upi_id}
                      {tx.ai_insights && tx.ai_insights.length > 0 && (
                        <span style={{ fontSize: '0.7rem', marginLeft: '0.5rem', color: '#00d4aa' }}>
                          🤖 AI Analyzed
                        </span>
                      )}
                    </div>
                    <div className="text-secondary" style={{ fontSize: '0.8rem' }}>
                      {new Date(tx.timestamp).toLocaleTimeString()} • {tx.location || 'Mumbai'} • Risk: {tx.riskScore}/100
                      {tx.confidence && (
                        <span style={{ marginLeft: '0.5rem', color: '#00d4aa' }}>
                          Confidence: {Math.round(tx.confidence * 100)}%
                        </span>
                      )}
                    </div>
                    {tx.alerts && tx.alerts.length > 0 && (
                      <div style={{ fontSize: '0.7rem', color: '#ff6b6b', marginTop: '0.25rem' }}>
                        ⚠️ {tx.alerts[0]}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 7 Days History Feed */}
        <div className="glass-panel col-span-12" style={{ marginTop: '1rem' }}>
          <h3>📅 Transaction History (Last 7 Days)</h3>
          <p className="text-secondary" style={{ fontSize: '0.8rem', marginBottom: '1rem' }}>
            Automatically synced from secure database.
          </p>
          <div className="transaction-list" style={{ marginTop: '0.5rem', maxHeight: '400px', overflowY: 'auto' }}>
            {history.length === 0 && (
              <div className="text-secondary">No historical data available.</div>
            )}
            {history.map((tx) => (
              <div key={tx._id} className="transaction-item" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <div className="tx-info">
                  <div className={`tx-icon ${
                    tx.threatType === 'Verified Transaction' ? 'badge-verified' : 
                    tx.threatType === 'Potential Fraud' ? 'badge-fraud' : 'badge-warning'
                  }`}>
                    {tx.threatType === 'Verified Transaction' ? <CheckCircle size={16} /> : 
                     tx.threatType === 'Potential Fraud' ? <ShieldAlert size={16} /> : <AlertTriangle size={16} />}
                  </div>
                  <div style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '600', fontSize: '0.9rem' }}>
                      <span>₹{tx.details?.amount} → {tx.details?.merchant_name || tx.details?.upi_id}</span>
                      <span className="text-secondary" style={{ fontSize: '0.8rem' }}>
                        {new Date(tx.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-secondary" style={{ fontSize: '0.8rem', display: 'flex', gap: '1rem', marginTop: '0.25rem' }}>
                      <span>📍 {tx.location || 'Mumbai'}</span>
                      <span>🛡️ Risk: {tx.riskScore}/100</span>
                      <span style={{ color: tx.action === 'Blocked' ? '#ff6b6b' : '#00d4aa' }}>
                        Action: {tx.action}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
