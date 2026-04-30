import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BellRing, Volume2, VolumeX, ShieldAlert, CheckCircle } from 'lucide-react';

const API_URL = 'https://finacial-fruad-detection.onrender.com/api/soc';

const AlertsManager = () => {
  const [alerts, setAlerts] = useState([]);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [lastTxId, setLastTxId] = useState(null);

  const announceThreat = (status, location) => {
    if (!isVoiceEnabled || !('speechSynthesis' in window)) {
      window.speechSynthesis.cancel();
      return;
    }
    
    window.speechSynthesis.cancel(); // Clear queue before new alert
    const msg = new SpeechSynthesisUtterance();
    msg.text = `Attention: ${status} detected in ${location} endpoint. Please respond.`;
    msg.rate = 0.9;
    window.speechSynthesis.speak(msg);
  };

  const fetchAlerts = async () => {
    try {
      const response = await axios.get(`${API_URL}/dashboard/stats`);
      const recent = response.data.recentTransactions;
      const threats = recent.filter(tx => tx.status !== 'Verified Transaction');
      setAlerts(threats);

      if (threats.length > 0) {
        const latest = threats[0];
        if (latest.id !== lastTxId) {
          announceThreat(latest.status, latest.location || 'Mumbai');
          setLastTxId(latest.id);
        }
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 3000);
    return () => clearInterval(interval);
  }, [isVoiceEnabled]);

  const handleConfirmBlock = async (upi_id, tx_id) => {
    try {
      await axios.post(`${API_URL}/blacklist`, { upi_id });
      await axios.post(`${API_URL}/resolve`, { tx_id });
      fetchAlerts(); // Refresh list
    } catch (error) {
      console.error('Error blacklisting:', error);
    }
  };

  const handleDismiss = async (tx_id) => {
    try {
      await axios.post(`${API_URL}/resolve`, { tx_id });
      fetchAlerts(); // Refresh list
    } catch (error) {
      console.error('Error dismissing alert:', error);
    }
  };

  const handleStopVoice = () => {
    setIsVoiceEnabled(false);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      // Double check to clear any remaining queue
      setTimeout(() => window.speechSynthesis.cancel(), 50);
    }
  };

  return (
    <div className="fade-in">
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Threat Alerts Manager</h1>
          <p className="text-secondary">Real-time voice-activated response system</p>
        </div>
        <button 
          className="btn" 
          style={{ width: 'auto', background: isVoiceEnabled ? 'var(--status-fraud-bg)' : 'var(--bg-tertiary)' }}
          onClick={() => {
            if (isVoiceEnabled) {
              handleStopVoice();
            } else {
              setIsVoiceEnabled(true);
              setLastTxId(null); // Force announcement of current threat on enable
            }
          }}
        >
          {isVoiceEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          {isVoiceEnabled ? 'Voice Alerts ON' : 'Voice Alerts OFF'}
        </button>
      </header>

      <div className="glass-panel">
        <h3>Active Threats ({alerts.length})</h3>
        <div className="transaction-list" style={{ marginTop: '1.5rem' }}>
          {alerts.length === 0 && <p className="text-secondary">No active threats detected. System secure.</p>}
          {alerts.map(alert => (
            <div key={alert.id} className="transaction-item" style={{ borderLeft: '4px solid var(--status-fraud)' }}>
              <div className="tx-info">
                <ShieldAlert className="text-fraud" size={24} />
                <div>
                  <div style={{ fontWeight: '700' }}>{alert.status}</div>
                  <div className="text-secondary" style={{ fontSize: '0.8rem' }}>Location: {alert.location || 'Mumbai'} • ID: {alert.id}</div>
                  <div style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Alerts: {alert.alerts.join(', ')}</div>
                </div>
              </div>
              <div className="alert-actions" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <button 
                  className="btn" 
                  style={{ width: 'auto', padding: '0.5rem 1rem', background: 'var(--status-verified)' }}
                  onClick={() => handleConfirmBlock(alert.upi_id, alert.id)}
                >
                  Confirm & Block
                </button>
                <button 
                  className="btn" 
                  style={{ width: 'auto', padding: '0.5rem 1rem', background: 'var(--bg-tertiary)' }}
                  onClick={() => handleDismiss(alert.id)}
                >
                  Dismiss
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AlertsManager;
