import React, { useState } from 'react';
import axios from 'axios';
import { QrCode, Smartphone, BellRing, ShieldCheck, ShieldAlert, AlertTriangle, MessageSquare, Zap, Volume2 } from 'lucide-react';

const API_URL = 'https://finacial-fraud-detection.onrender.com/api/soc';

const EndpointSimulator = () => {
  const [activeTab, setActiveTab] = useState('simulator'); // simulator, notification, sms, device
  const [step, setStep] = useState(1);
  const [upiId, setUpiId] = useState('');
  const [amount, setAmount] = useState('');
  const [merchantName, setMerchantName] = useState('');
  const [preVerifyResult, setPreVerifyResult] = useState(null);
  const [intentId, setIntentId] = useState(null);
  const [deviceHealth, setDeviceHealth] = useState({
    rooted: false,
    screenSharing: false,
    unknownApps: 0,
    batteryLevel: 85
  });
  const [postVerifyResult, setPostVerifyResult] = useState(null);
  const [isMismatchSim, setIsMismatchSim] = useState(false);
  const [loading, setLoading] = useState(false);

  // New state for real-world features
  const [notificationData, setNotificationData] = useState({
    amount: '',
    upi_id: '',
    merchant_name: ''
  });
  const [smsContent, setSmsContent] = useState('');
  const [gstVerification, setGstVerification] = useState(null);
  const [voiceAlerts, setVoiceAlerts] = useState([]);

  const reset = () => {
    setStep(1);
    setUpiId('');
    setAmount('');
    setMerchantName('');
    setPreVerifyResult(null);
    setIntentId(null);
    setPostVerifyResult(null);
    setDeviceHealth({ rooted: false, screenSharing: false, unknownApps: 0, batteryLevel: 85 });
    setIsMismatchSim(false);
    setNotificationData({ amount: '', upi_id: '', merchant_name: '' });
    setSmsContent('');
    setGstVerification(null);
  };

  // Real-World Data Ingestion: Notification Listener Simulation
  const simulateNotificationIngestion = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/ingest/notification`, {
        amount: parseFloat(notificationData.amount),
        upi_id: notificationData.upi_id,
        merchant_name: notificationData.merchant_name,
        deviceHealth,
        location: 'Mumbai'
      });
      setPreVerifyResult(response.data);
      setStep(2);
    } catch (error) {
      alert('Notification ingestion failed: ' + (error.response?.data?.error || error.message));
    }
    setLoading(false);
  };

  // SMS Parsing Simulation
  const simulateSMSIngestion = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/ingest/sms`, {
        smsContent
      });
      setPreVerifyResult(response.data);
      setStep(2);
    } catch (error) {
      alert('SMS parsing failed: ' + (error.response?.data?.error || error.message));
    }
    setLoading(false);
  };

  // GST Verification
  const verifyGST = async (upiId) => {
    try {
      const response = await axios.post(`${API_URL}/verify/gst`, { upi_id: upiId });
      setGstVerification(response.data);
      return response.data;
    } catch (error) {
      console.error('GST verification failed:', error);
      return null;
    }
  };

  // Enhanced Pre-payment Check
  const runPrePaymentCheck = async (overriddenUpi, overriddenMerchant) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/pre-payment/verify`, {
        upiId: overriddenUpi || upiId,
        merchantName: overriddenMerchant || merchantName
      });
      setPreVerifyResult(response.data);

      // Auto-trigger GST verification for known merchants
      if (response.data.status === 'Verified') {
        await verifyGST(overriddenUpi || upiId);
      }

      setStep(2);
    } catch (error) {
      alert('Error during pre-payment check: ' + (error.response?.data?.error || error.message));
    }
    setLoading(false);
  };

  // Enhanced QR Analysis with AI
  const analyzeQR = async (content) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/qr/analyze`, { qrContent: content });
      setPreVerifyResult(response.data);

      // If QR is valid, auto-verify GST
      if (response.data.status === 'Valid') {
        // Extract UPI ID from QR content (simplified)
        const upiMatch = content.match(/pa=([^&]+)/);
        if (upiMatch) {
          await verifyGST(upiMatch[1]);
        }
      }
      setStep(2);
    } catch (error) {
      alert('QR analysis failed: ' + (error.response?.data?.error || error.message));
    }
    setLoading(false);
  };

  const simulateTamperedQR = () => {
      reset();
      const fakeUrl = 'https://fake-gpay-reward.com/login';
      setUpiId(fakeUrl);
      setMerchantName('Phishing Redirect');
      setAmount('1.00'); // Default amount for simulation
      // Stay on Step 1 so user can click 'Scan & Verify'
      setStep(1);
  };

  const initiatePayment = async (customAmount, customReceiver) => {
    setLoading(true);
    const finalAmount = customAmount || amount;
    const finalReceiver = customReceiver || upiId;
    try {
      const intentRes = await axios.post(`${API_URL}/payment/intent`, {
        expectedAmount: finalAmount,
        expectedReceiver: finalReceiver
      });
      setIntentId(intentRes.data.intentId);

      setTimeout(async () => {
        // Module B: Notification Listener Simulation
        const postRes = await axios.post(`${API_URL}/transaction/detect`, {
          intent_id: intentRes.data.intentId,
          amount: isMismatchSim ? parseFloat(finalAmount) * 10 : finalAmount, // Cause mismatch if flag is set
          upi_id: finalReceiver,
          source: 'notification', // From Module B
          location: 'Mumbai',
          deviceHealth
        });
        setPostVerifyResult(postRes.data);
        setStep(3);
        setLoading(false);
      }, 1500);
    } catch (error) {
      alert('Payment failed');
      setLoading(false);
    }
  };

  const simulateFraud = () => {
      reset();
      setUpiId('scammer123@upi');
      setMerchantName('Known Scammer Account');
      setAmount('500');
      // Stay on Step 1 so user can click 'Scan & Verify'
      setStep(1);
  };

  const simulateMismatch = () => {
      reset();
      setUpiId('merchant@upi');
      setMerchantName('General Store');
      setAmount('500'); // User thinks they are paying 500
      setIsMismatchSim(true);
      setStep(1);
  };

  const simulateEDR = () => {
      reset();
      setDeviceHealth({ rooted: true, screenSharing: true });
      const fakeId = 'store@upi';
      setUpiId(fakeId);
      setMerchantName('Secure Store');
      setAmount('100');
      setStep(1);
  };

  return (
    <div className="simulator-container fade-in">
      <div style={{ marginRight: '3rem', maxWidth: '600px' }}>
        <h2>🔥 Legacy SOC Simulator</h2>
        <p className="text-secondary">Interactive legacy simulator for endpoint ingestion, fraud matching, and alert validation.</p>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <button
            className={`tab-button ${activeTab === 'simulator' ? 'active' : ''}`}
            onClick={() => setActiveTab('simulator')}
          >
            <Smartphone size={16} style={{ marginRight: '0.5rem' }} />
            Interactive Simulator
          </button>
          <button
            className={`tab-button ${activeTab === 'notification' ? 'active' : ''}`}
            onClick={() => setActiveTab('notification')}
          >
            <BellRing size={16} style={{ marginRight: '0.5rem' }} />
            Notification Listener
          </button>
          <button
            className={`tab-button ${activeTab === 'sms' ? 'active' : ''}`}
            onClick={() => setActiveTab('sms')}
          >
            <MessageSquare size={16} style={{ marginRight: '0.5rem' }} />
            SMS Parser
          </button>
          <button
            className={`tab-button ${activeTab === 'device' ? 'active' : ''}`}
            onClick={() => setActiveTab('device')}
          >
            <ShieldCheck size={16} style={{ marginRight: '0.5rem' }} />
            Device Health
          </button>
        </div>

        {/* Interactive Simulator Tab */}
        {activeTab === 'simulator' && (
          <div>
            <h3>🎮 Interactive Payment Simulation</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
              <div>
                <button className="btn" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', marginBottom: '0.3rem' }} onClick={simulateEDR}>
                    Simulate Compromised Device (EDR)
                </button>
                <p className="text-secondary" style={{ fontSize: '0.75rem', paddingLeft: '0.5rem' }}>• Checks OS integrity, Root access, and Screen overlays.</p>
              </div>

              <div>
                <button className="btn" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', marginBottom: '0.3rem' }} onClick={simulateTamperedQR}>
                    Simulate Tampered QR (Phishing)
                </button>
                <p className="text-secondary" style={{ fontSize: '0.75rem', paddingLeft: '0.5rem' }}>• Detects if QR redirects to fake websites instead of UPI apps.</p>
              </div>

              <div>
                <button className="btn" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', marginBottom: '0.3rem' }} onClick={simulateFraud}>
                    Simulate Known Scammer ID
                </button>
                <p className="text-secondary" style={{ fontSize: '0.75rem', paddingLeft: '0.5rem' }}>• Cross-checks receiver against global SOC blacklist.</p>
              </div>

              <div>
                <button className="btn" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', marginBottom: '0.3rem' }} onClick={simulateMismatch}>
                    Simulate Amount Mismatch
                </button>
                <p className="text-secondary" style={{ fontSize: '0.75rem', paddingLeft: '0.5rem' }}>• Detects if the bank notification amount differs from intent.</p>
              </div>
            </div>

            <button className="btn" style={{ marginTop: '1rem', background: 'var(--status-verified-bg)', color: 'var(--status-verified)' }} onClick={reset}>
                Reset Simulator
            </button>
          </div>
        )}

        {/* Notification Listener Tab */}
        {activeTab === 'notification' && (
          <div>
            <h3>📱 Passive Notification Monitoring</h3>
            <p className="text-secondary" style={{ marginBottom: '1rem' }}>
              Simulates Android NotificationListenerService that intercepts GPay/PhonePe notifications in real-time.
            </p>

            <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
              <div>
                <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>Transaction Amount (₹)</label>
                <input
                  type="number"
                  value={notificationData.amount}
                  onChange={(e) => setNotificationData({...notificationData, amount: e.target.value})}
                  placeholder="e.g., 299.00"
                  style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>UPI ID</label>
                <input
                  type="text"
                  value={notificationData.upi_id}
                  onChange={(e) => setNotificationData({...notificationData, upi_id: e.target.value})}
                  placeholder="e.g., zomato@upi"
                  style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>Merchant Name</label>
                <input
                  type="text"
                  value={notificationData.merchant_name}
                  onChange={(e) => setNotificationData({...notificationData, merchant_name: e.target.value})}
                  placeholder="e.g., Zomato Ltd"
                  style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
                />
              </div>
            </div>

            <button
              className="btn"
              onClick={simulateNotificationIngestion}
              disabled={loading || !notificationData.amount || !notificationData.upi_id}
              style={{ background: '#00d4aa' }}
            >
              {loading ? '🔄 Processing...' : '📲 Simulate Notification Ingestion'}
            </button>
          </div>
        )}

        {/* SMS Parser Tab */}
        {activeTab === 'sms' && (
          <div>
            <h3>💬 SMS-Based Transaction Monitoring</h3>
            <p className="text-secondary" style={{ marginBottom: '1rem' }}>
              Parses bank SMS messages using regex patterns to extract transaction details when notifications are disabled.
            </p>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>Bank SMS Content</label>
              <textarea
                value={smsContent}
                onChange={(e) => setSmsContent(e.target.value)}
                placeholder="e.g., Dear Customer, Rs. 299.00 has been debited from your account for payment to zomato@upi via UPI."
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  marginTop: '0.5rem',
                  minHeight: '100px',
                  fontFamily: 'monospace',
                  fontSize: '0.8rem'
                }}
              />
            </div>

            <button
              className="btn"
              onClick={simulateSMSIngestion}
              disabled={loading || !smsContent.trim()}
              style={{ background: '#6c5ce7' }}
            >
              {loading ? '🔄 Parsing...' : '📨 Parse SMS & Analyze'}
            </button>

            <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <strong>Example SMS formats:</strong><br/>
              "Rs. 299.00 debited to zomato@upi"<br/>
              "INR 150.00 paid to swiggy@upi via UPI"<br/>
              "Payment of Rs 500 to merchant@upi successful"
            </div>
          </div>
        )}

        {/* Device Health Tab */}
        {activeTab === 'device' && (
          <div>
            <h3>🔒 Advanced EDR Monitoring</h3>
            <p className="text-secondary" style={{ marginBottom: '1rem' }}>
              Comprehensive device security assessment with multi-tenant monitoring capabilities.
            </p>

            <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <input
                  type="checkbox"
                  id="rooted"
                  checked={deviceHealth.rooted}
                  onChange={(e) => setDeviceHealth({...deviceHealth, rooted: e.target.checked})}
                />
                <label htmlFor="rooted">🔓 Device Rooted/Jailbroken</label>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <input
                  type="checkbox"
                  id="screenSharing"
                  checked={deviceHealth.screenSharing}
                  onChange={(e) => setDeviceHealth({...deviceHealth, screenSharing: e.target.checked})}
                />
                <label htmlFor="screenSharing">📺 Screen Recording/Sharing Active</label>
              </div>

              <div>
                <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>Unknown Apps Count</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={deviceHealth.unknownApps}
                  onChange={(e) => setDeviceHealth({...deviceHealth, unknownApps: parseInt(e.target.value)})}
                  style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>Battery Level (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={deviceHealth.batteryLevel}
                  onChange={(e) => setDeviceHealth({...deviceHealth, batteryLevel: parseInt(e.target.value)})}
                  style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
                />
              </div>
            </div>

            <div style={{
              padding: '1rem',
              background: 'var(--bg-tertiary)',
              borderRadius: '8px',
              marginBottom: '1rem'
            }}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>Device Security Status</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem' }}>
                <div>Root Status: <span style={{ color: deviceHealth.rooted ? '#ff6b6b' : '#00d4aa' }}>
                  {deviceHealth.rooted ? 'COMPROMISED' : 'SECURE'}
                </span></div>
                <div>Screen: <span style={{ color: deviceHealth.screenSharing ? '#ff6b6b' : '#00d4aa' }}>
                  {deviceHealth.screenSharing ? 'SHARING' : 'PRIVATE'}
                </span></div>
                <div>Unknown Apps: <span style={{ color: deviceHealth.unknownApps > 2 ? '#ff6b6b' : '#00d4aa' }}>
                  {deviceHealth.unknownApps}
                </span></div>
                <div>Battery: <span style={{ color: deviceHealth.batteryLevel < 20 ? '#ff6b6b' : '#00d4aa' }}>
                  {deviceHealth.batteryLevel}%
                </span></div>
              </div>
            </div>
          </div>
        )}
        
            <div>
              <button className="btn" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', marginBottom: '0.3rem' }} onClick={simulateEDR}>
                  Simulate Compromised Device (EDR)
              </button>
              <p className="text-secondary" style={{ fontSize: '0.75rem', paddingLeft: '0.5rem' }}>• Checks OS integrity, Root access, and Screen overlays.</p>
            </div>

            <div>
              <button className="btn" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', marginBottom: '0.3rem' }} onClick={simulateTamperedQR}>
                  Simulate Tampered QR (Phishing)
              </button>
              <p className="text-secondary" style={{ fontSize: '0.75rem', paddingLeft: '0.5rem' }}>• Detects if QR redirects to fake websites instead of UPI apps.</p>
            </div>

            <div>
              <button className="btn" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', marginBottom: '0.3rem' }} onClick={simulateFraud}>
                  Simulate Known Scammer ID
              </button>
              <p className="text-secondary" style={{ fontSize: '0.75rem', paddingLeft: '0.5rem' }}>• Cross-checks receiver against global SOC blacklist.</p>
            </div>

            <div>
              <button className="btn" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', marginBottom: '0.3rem' }} onClick={simulateMismatch}>
                  Simulate Amount Mismatch
              </button>
              <p className="text-secondary" style={{ fontSize: '0.75rem', paddingLeft: '0.5rem' }}>• Detects if the bank notification amount differs from intent.</p>
            </div>

            <button className="btn" style={{ marginTop: '1rem', background: 'var(--status-verified-bg)', color: 'var(--status-verified)' }} onClick={reset}>
                Reset Simulator
            </button>
        </div>
      
        <div className="mobile-frame">
          <div className="mobile-screen">
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>UPI Security Module</div>
            <div style={{ fontWeight: '700' }}>Endpoint Protection Active</div>
          </div>

          {step === 1 && (
            <div className="fade-in">
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                  <QrCode size={48} />
                </div>
              </div>
              
              <div className="input-group">
                <label>Receiver UPI ID</label>
                <input type="text" value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="e.g. merchant@upi" />
              </div>

              <div className="input-group">
                <label>Merchant Name (Optional)</label>
                <input type="text" value={merchantName} onChange={e => setMerchantName(e.target.value)} placeholder="e.g. Grocery Store" />
              </div>

              <div className="input-group">
                <label>Amount (₹)</label>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" />
              </div>

              <button className="btn" onClick={() => runPrePaymentCheck()} disabled={!upiId || loading}>
                {loading ? 'Verifying...' : 'Scan & Verify'}
              </button>
            </div>
          )}

          {step === 2 && preVerifyResult && (
            <div className="fade-in">
              <div className={`alert-box ${
                preVerifyResult.status === 'Verified' ? 'badge-verified' : 
                preVerifyResult.status === 'Suspicious' ? 'badge-fraud' : 'badge-warning'
              }`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700' }}>
                   {preVerifyResult.status === 'Verified' ? <ShieldCheck size={20} /> : 
                    preVerifyResult.status === 'Suspicious' ? <ShieldAlert size={20} /> : <AlertTriangle size={20} />}
                   {preVerifyResult.status.toUpperCase()} MERCHANT
                </div>
                <div>{preVerifyResult.message}</div>
                <div style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>Risk Score: {preVerifyResult.riskScore}/100</div>
              </div>

              <div style={{ marginTop: '2rem' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Paying to</div>
                <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>{merchantName || upiId}</div>
                <div style={{ fontWeight: '700', fontSize: '1.5rem', marginTop: '0.5rem' }}>₹{amount}</div>
              </div>

              <div style={{ marginTop: '3rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <button className="btn" onClick={() => initiatePayment()} disabled={loading}>
                  {loading ? 'Processing...' : 'Confirm & Pay'}
                </button>
                <button className="btn" style={{ background: 'transparent', color: 'var(--text-secondary)' }} onClick={() => setStep(1)}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {step === 3 && postVerifyResult && (
            <div className="fade-in" style={{ textAlign: 'center' }}>
                <div style={{ marginTop: '2rem', marginBottom: '2rem' }}>
                    <div className="badge-verified" style={{ width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', marginBottom: '1rem' }}>
                        <ShieldCheck size={32} />
                    </div>
                    <h3>Payment Successful</h3>
                    <p className="text-secondary">Sent to {upiId}</p>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', color: 'var(--status-verified)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                        <BellRing size={16} /> Intercepting Notification...
                    </div>
                    
                    <div className={`alert-box ${
                        postVerifyResult.status === 'Verified Transaction' ? 'badge-verified' : 
                        postVerifyResult.status === 'Potential Fraud' ? 'badge-fraud' : 'badge-warning'
                    }`} style={{ textAlign: 'left' }}>
                        <div style={{ fontWeight: '700' }}>SOC ANALYSIS: {postVerifyResult.status}</div>
                        {postVerifyResult.alerts.map((a, i) => (
                            <div key={i} style={{ fontSize: '0.8rem' }}>• {a}</div>
                        ))}
                    </div>
                </div>

                <button className="btn" style={{ marginTop: '3rem' }} onClick={reset}>
                    New Payment
                </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EndpointSimulator;
