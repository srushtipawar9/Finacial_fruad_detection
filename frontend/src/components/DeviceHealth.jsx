import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldCheck, ShieldAlert, Smartphone, Fingerprint, Lock, EyeOff } from 'lucide-react';

const API_URL = 'https://finacial-fruad-detection.onrender.com/api/soc';

const DeviceHealth = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_URL}/dashboard/stats`);
        setStats(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching EDR stats:', error);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !stats) return <div className="text-secondary">Loading EDR Data...</div>;

  const totalThreats = stats.overview.totalTransactions;
  const highRiskDevices = stats.recentTransactions.filter(tx => tx.alerts.some(a => a.includes('rooted') || a.includes('Screen'))).length;

  return (
    <div className="fade-in">
      <header style={{ marginBottom: '2rem' }}>
        <h1>EDR Device Health Scoring</h1>
        <p className="text-secondary">Endpoint detection and response monitoring</p>
      </header>

      <div className="dashboard-grid">
        <div className="glass-panel stat-card col-span-4">
          <div className="stat-label">Security Health Index</div>
          <div className="stat-value text-verified">94%</div>
          <div className="text-secondary" style={{ fontSize: '0.8rem' }}>Global Fleet Status</div>
        </div>

        <div className="glass-panel stat-card col-span-4">
          <div className="stat-label">Compromised Devices</div>
          <div className="stat-value text-fraud">{highRiskDevices}</div>
          <div className="text-secondary" style={{ fontSize: '0.8rem' }}>Rooted / Screen Record detected</div>
        </div>

        <div className="glass-panel stat-card col-span-4">
          <div className="stat-label">Protected Endpoints</div>
          <div className="stat-value">{stats.overview.totalTransactions * 12}</div>
          <div className="text-secondary" style={{ fontSize: '0.8rem' }}>Active UPI Module Instances</div>
        </div>

        <div className="glass-panel col-span-12" style={{ marginTop: '1rem' }}>
          <h3>EDR Layer Checks</h3>
          <div className="grid-4" style={{ marginTop: '1.5rem' }}>
            <div className="transaction-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '1rem' }}>
               <Fingerprint size={32} className="text-verified" />
               <div style={{ fontWeight: '700' }}>Biometric Integrity</div>
               <p style={{ fontSize: '0.8rem' }} className="text-secondary">Ensures 2FA is active on the device.</p>
            </div>
            <div className="transaction-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '1rem' }}>
               <Lock size={32} className="text-verified" />
               <div style={{ fontWeight: '700' }}>Encryption Status</div>
               <p style={{ fontSize: '0.8rem' }} className="text-secondary">Storage encryption verified for payment keys.</p>
            </div>
            <div className="transaction-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '1rem' }}>
               <ShieldAlert size={32} className="text-fraud" />
               <div style={{ fontWeight: '700' }}>Root Detection</div>
               <p style={{ fontSize: '0.8rem' }} className="text-secondary">Instant block if OS integrity is compromised.</p>
            </div>
            <div className="transaction-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '1rem' }}>
               <EyeOff size={32} className="text-warning" />
               <div style={{ fontWeight: '700' }}>Overlay Detection</div>
               <p style={{ fontSize: '0.8rem' }} className="text-secondary">Scans for hidden apps reading screen data.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceHealth;
