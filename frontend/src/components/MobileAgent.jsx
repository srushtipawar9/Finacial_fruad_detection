import React, { useState } from 'react';
import axios from 'axios';
import { Smartphone, ShieldCheck, BellRing, Zap, CheckCircle, Lock, ClipboardList, ChevronRight, AlertCircle, Signal, FileDown, RefreshCw } from 'lucide-react';

const API = 'https://finacial-fruad-detection.onrender.com/api/soc';

const walkthroughText = `MOBILE AGENT SIMULATION — WALKTHROUGH
======================================
Financial AI SOC | UPI Fraud Detection System

OVERVIEW
--------
The Mobile Agent Simulation layer demonstrates how an on-device SOC agent
protects users from UPI fraud, phishing, and compromised environments.

NEW FEATURES
------------
1. Immersive Mobile Agent (MobileAgent.jsx)
   - Interactive Camera with scanning animation & shutter effect
   - Agentic Monitoring Bar: Real-time EDR, OS Integrity, Screen Recording
   - Notification Center: Slide-down alerts for bank transactions & SOC detections

2. Merchant QR Generation
   - Valid QR: Generates a standard merchant payment link
   - Malicious QR: Generates a phishing link triggering SOC URL analysis

3. Agentic Workflow
   - Pre-scan Check: Monitors device health before scanning
   - Deep Link Analysis: Intercepts URL and queries backend for phishing detection
   - Post-Transaction Verification: Verifies final amount against original intent

HOW TO TEST
-----------
Step 1 → Go to the Mobile Agent tab in the sidebar
Step 2 → Go to Legacy Simulator → click Malicious QR in Generator section
Step 3 → Copy the malicious URL
Step 4 → Paste URL in Mock QR URL input on Mobile Agent page
Step 5 → Click Scan Any QR and observe camera detecting the threat
Step 6 → Observe SOC Alert sliding down from the top of the mobile screen

TECHNICAL IMPLEMENTATION
------------------------
Frontend:  React + Lucide Icons + CSS Animations
Backend:   /qr/analyze and /transaction/detect (socRoutes.js)
State Mgmt: Real-time feedback loop between device health and risk scoring

Core Modules:
  QR Validator       - Decodes & validates UPI IDs from QR codes
  Notification Parser - Listens for GPay, PhonePe, BHIM alerts
  SMS Analyzer       - Parses bank SMS, detects OTP phishing
  Risk Engine        - Real-time ML fraud probability scoring
  Geo-Tracker        - Detects impossible travel & VPN patterns
  Alert Manager      - Encrypted push notifications to SOC dashboard

DEPLOYMENT
----------
Platform:  Android 8+
Status:    Live — Passive monitoring active
Coverage:  2,340 Devices | 12 Regions | 99.4% Uptime | 15.2M daily txns
`;

const MobileAgent = () => {
  // phone states: wallet | scanning | verifying | result | confirm | success
  const [phoneState, setPhoneState]   = useState('wallet');
  const [mockUrl, setMockUrl]         = useState(() => localStorage.getItem('mobileAgent_mockUrl') || 'zomato@upi');
  const [isRooted, setIsRooted]       = useState(false);
  const [isRec, setIsRec]             = useState(false);
  const [edrStatus, setEdrStatus]     = useState('safe');
  const [scanResult, setScanResult]   = useState(null);
  const [scanError, setScanError]     = useState(null);
  const [txLog, setTxLog]             = useState(() => {
    const saved = localStorage.getItem('mobileAgent_txLog');
    return saved ? JSON.parse(saved) : [];
  });
  const [showSms, setShowSms]         = useState(false);
  const [showSocAlert, setShowSocAlert] = useState(false);
  const [txId]                        = useState('TX_' + Math.floor(Math.random() * 900000 + 100000));
  
  const playAlertSound = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); 
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      console.error("Audio beep failed:", e);
    }
  };

  const announceThreat = (status, location) => {
    playAlertSound();
    if (!('speechSynthesis' in window)) return;
    
    try {
      window.speechSynthesis.cancel(); // Clear queue before new alert
      const msg = new SpeechSynthesisUtterance();
      msg.text = `Attention: ${status} detected in ${location} endpoint. Please respond.`;
      msg.rate = 0.9;
      msg.lang = 'en-US';
      window.speechSynthesis.speak(msg);
    } catch (e) {
      console.error("Speech synthesis failed:", e);
    }
  };
  
  React.useEffect(() => {
    localStorage.setItem('mobileAgent_mockUrl', mockUrl);
  }, [mockUrl]);

  React.useEffect(() => {
    localStorage.setItem('mobileAgent_txLog', JSON.stringify(txLog));
  }, [txLog]);
  const PAY_AMOUNT                    = 500;

  /* ── Open scanner ── */
  const openApp = () => {
    setEdrStatus('checking');
    setScanResult(null);
    setScanError(null);
    setShowSms(false);
    setShowSocAlert(false);
    setPhoneState('scanning');
    
    // Unlock audio for mobile
    if ('speechSynthesis' in window) {
      const unlock = new SpeechSynthesisUtterance('');
      window.speechSynthesis.speak(unlock);
    }
    
    setTimeout(() => setEdrStatus('safe'), 1600);
  };

  /* ── Simulate ML Kit QR detect → call backend verify ── */
  const handleScan = async () => {
    setPhoneState('verifying');
    try {
      const { data } = await axios.post(`${API}/qr/analyze`, { qrContent: mockUrl });
      const isSafe = data.isSafe !== false && (data.riskScore ?? 100) < 50;
      setScanResult(data);
      setPhoneState('result');
      // Trigger SOC alert if phishing
      if (!isSafe) {
        setTimeout(() => {
          setShowSocAlert(true);
          announceThreat('PHISHING THREAT', data.location || 'Mumbai');
          setTimeout(() => setShowSocAlert(false), 5000);
        }, 400);
      }
      // Add to live scan log
      setTxLog(prev => [{
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        merchant: data.merchantName || mockUrl.split('@')[0] || 'Unknown',
        upi: data.upiId || mockUrl,
        risk: data.riskScore ?? (isSafe ? 12 : 87),
        safe: isSafe,
        paid: false,
      }, ...prev].slice(0, 8));
    } catch (err) {
      setScanError('Backend unreachable. Showing simulated result.');
      const isSafe = !mockUrl.toLowerCase().includes('phish') && !mockUrl.toLowerCase().includes('fake');
      const result = {
        isSafe,
        riskScore: isSafe ? 12 : 87,
        merchantName: mockUrl.split('@')[0] || 'Unknown Merchant',
        upiId: mockUrl,
        alerts: [],
      };
      setScanResult(result);
      setPhoneState('result');
      if (!isSafe) {
        setTimeout(() => {
          setShowSocAlert(true);
          announceThreat('SIMULATED THREAT', 'Mumbai');
          setTimeout(() => setShowSocAlert(false), 5000);
        }, 400);
      }
      setTxLog(prev => [{
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        merchant: result.merchantName,
        upi: result.upiId,
        risk: result.riskScore,
        safe: isSafe,
        paid: false,
      }, ...prev].slice(0, 8));
    }
  };

  /* ── Confirm payment ── */
  const handlePay = () => {
    setPhoneState('success');
    // Mark last log entry as paid
    setTxLog(prev => prev.map((e, i) => i === 0 ? { ...e, paid: true, amount: PAY_AMOUNT } : e));
    // SMS slide-in after 1.5s
    setTimeout(() => {
      setShowSms(true);
      setTimeout(() => setShowSms(false), 5000);
    }, 1500);
  };

  const goBack = () => {
    setPhoneState('wallet');
    setScanResult(null);
    setScanError(null);
    setShowSms(false);
    setShowSocAlert(false);
  };

  const handleDownload = () => {
    const blob = new Blob([walkthroughText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Mobile_Agent_Walkthrough.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fade-in">
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Mobile SOC Agent</h1>
          <p className="text-secondary">Live Android UPI security agent with real-time fraud detection, merchant validation & device threat monitoring.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <button
            onClick={handleDownload}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.5rem 1.1rem',
              borderRadius: '8px',
              border: '1px solid rgba(99,102,241,0.45)',
              background: 'linear-gradient(135deg, rgba(99,102,241,0.18) 0%, rgba(167,139,250,0.12) 100%)',
              color: '#a78bfa',
              fontWeight: '600',
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              backdropFilter: 'blur(8px)',
              letterSpacing: '0.01em',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(99,102,241,0.35) 0%, rgba(167,139,250,0.25) 100%)';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(99,102,241,0.3)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(99,102,241,0.18) 0%, rgba(167,139,250,0.12) 100%)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <FileDown size={15} />
            Download Walkthrough
          </button>
          <span className="badge badge-verified" style={{ gap: '0.5rem' }}>
            <Signal size={14} />
            Active
          </span>
        </div>
      </header>

      {/* ── Main layout: Phone LEFT | Agent Settings RIGHT ── */}
      <div className="mobile-agent-main-layout" style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', marginBottom: '3rem' }}>
        {/* Android UI Mockup */}
        <div className="android-mockup">
          <div className="phone-frame">
            <div className="phone-notch"></div>
            <div className="phone-screen" style={{ position: 'relative' }}>
              {/* ── SOC ALERT slide-down overlay ── */}
              <style>{`
                @keyframes slideDown { from { transform: translateY(-100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                @keyframes slideUp   { from { transform: translateY(0); opacity: 1; } to { transform: translateY(-100%); opacity: 0; } }
                @keyframes scanMove  { 0%,100% { top: 8%; } 50% { top: 82%; } }
                @keyframes spin      { to { transform: rotate(360deg); } }
                @keyframes smsFadeIn { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
              `}</style>

              {showSocAlert && (
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
                  background: 'linear-gradient(135deg,#dc2626,#b91c1c)',
                  padding: '8px 10px', borderRadius: '0 0 8px 8px',
                  animation: 'slideDown 0.4s ease',
                  boxShadow: '0 4px 20px rgba(239,68,68,0.5)',
                }}>
                  <div style={{ fontSize: '9px', fontWeight: '800', color: '#fff', marginBottom: '2px' }}>🚨 SOC ALERT — PHISHING DETECTED</div>
                  <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.85)' }}>Transaction blocked. URL flagged by AI engine.</div>
                </div>
              )}

              {/* ── SMS intercept notification ── */}
              {showSms && (
                <div style={{
                  position: 'absolute', top: '36px', left: '8px', right: '8px', zIndex: 20,
                  background: '#1a1a2e', border: '1px solid rgba(16,185,129,0.35)',
                  borderRadius: '10px', padding: '8px 10px',
                  animation: 'smsFadeIn 0.35s ease',
                  boxShadow: '0 6px 24px rgba(0,0,0,0.6)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px' }}>📱</span>
                    <span style={{ fontSize: '9px', fontWeight: '800', color: '#10b981' }}>HDFC Bank</span>
                    <span style={{ fontSize: '8px', color: '#9ca3af', marginLeft: 'auto' }}>now</span>
                  </div>
                  <div style={{ fontSize: '9px', color: '#e5e7eb', lineHeight: 1.5 }}>
                    Rs.{PAY_AMOUNT} debited from a/c **1234. UPI:{txId}.
                  </div>
                  <div style={{ fontSize: '8px', color: '#6366f1', marginTop: '4px', fontWeight: '700' }}>
                    ✓ SOC Agent verified — amount matches intent
                  </div>
                </div>
              )}
              {/* Status Bar */}
              <div className="status-bar">
                <span style={{ fontSize: '12px' }}>9:41</span>
                <div style={{ display: 'flex', gap: '4px', fontSize: '10px' }}>
                  <Signal size={12} />📶
                </div>
              </div>

              {/* App Header */}
              <div className="app-header">
                <h4 style={{ margin: 0 }}>AI SOC Guardian</h4>
                <span style={{ fontSize: '11px', color: '#10b981' }}>● Protected</span>
              </div>

              {/* Quick Status */}
              <div className="quick-status">
                <div className="status-item alert">
                  <AlertCircle size={18} />
                  <div>
                    <p style={{ fontSize: '12px', marginBottom: '2px' }}>Alert</p>
                    <p style={{ fontSize: '10px', color: '#a0a0b0' }}>1 pending</p>
                  </div>
                </div>
                <div className="status-item safe">
                  <ShieldCheck size={18} />
                  <div>
                    <p style={{ fontSize: '12px', marginBottom: '2px' }}>Protected</p>
                    <p style={{ fontSize: '10px', color: '#a0a0b0' }}>All clear</p>
                  </div>
                </div>
              </div>

              {/* Recent Transaction */}
              <div className="transaction-preview">
                <h5 style={{ margin: '0 0 10px 0', fontSize: '13px' }}>Recent Activity</h5>
                <div style={{ background: '#0f0f14', padding: '10px', borderRadius: '8px', fontSize: '11px', lineHeight: '1.4' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span>UPI Transfer</span>
                    <span style={{ color: '#10b981' }}>✓ Verified</span>
                  </div>
                  <div style={{ color: '#a0a0b0' }}>INR 2,500 → Merchant QR</div>
                  <div style={{ color: '#a0a0b0', fontSize: '10px', marginTop: '4px' }}>2 min ago</div>
                </div>
              </div>

              {/* ── CTA / Scanner states ── */}
              <style>{`
                @keyframes scanMove {
                  0%   { top: 8%; }
                  50%  { top: 82%; }
                  100% { top: 8%; }
                }
              `}</style>

              {/* WALLET state */}
              {phoneState === 'wallet' && (
                <button className="mobile-cta" onClick={openApp}>
                  Open App <ChevronRight size={14} />
                </button>
              )}

              {/* SCANNING state */}
              {phoneState === 'scanning' && (
                <>
                  <div style={{ padding: '6px 12px 4px', fontSize: '12px', fontWeight: '700' }}>Scan QR Code</div>
                  <div style={{
                    margin: '4px 12px', height: '130px',
                    background: '#050508', borderRadius: '10px',
                    position: 'relative', overflow: 'hidden',
                  }}>
                    {/* Corner marks */}
                    {[
                      { top: '18%', left: '18%', borderTop: '2px solid #10b981', borderLeft: '2px solid #10b981' },
                      { top: '18%', right: '18%', borderTop: '2px solid #10b981', borderRight: '2px solid #10b981' },
                      { bottom: '18%', left: '18%', borderBottom: '2px solid #10b981', borderLeft: '2px solid #10b981' },
                      { bottom: '18%', right: '18%', borderBottom: '2px solid #10b981', borderRight: '2px solid #10b981' },
                    ].map((s, i) => (
                      <div key={i} style={{ position: 'absolute', width: '14px', height: '14px', ...s }} />
                    ))}
                    {/* QR detected box */}
                    <div style={{
                      position: 'absolute', top: '50%', left: '50%',
                      transform: 'translate(-50%,-50%)',
                      width: '72px', height: '72px',
                      border: '2px solid #10b981', borderRadius: '4px',
                    }}>
                      <span style={{
                        position: 'absolute', top: '-10px', left: '50%',
                        transform: 'translateX(-50%)',
                        background: '#10b981', color: '#000',
                        fontSize: '7px', fontWeight: '800',
                        padding: '2px 5px', borderRadius: '3px', whiteSpace: 'nowrap',
                      }}>QR DETECTED</span>
                    </div>
                    {/* Scan line */}
                    <div style={{
                      position: 'absolute', left: 0, right: 0, height: '2px',
                      background: 'linear-gradient(90deg,transparent,#10b981,transparent)',
                      animation: 'scanMove 2s linear infinite',
                    }} />
                  </div>
                  <button onClick={handleScan} style={{
                    margin: '8px 12px 0', width: 'calc(100% - 24px)',
                    padding: '9px', borderRadius: '8px', border: 'none',
                    background: 'linear-gradient(135deg,#10b981,#059669)',
                    color: '#fff', fontWeight: '700', fontSize: '12px', cursor: 'pointer',
                  }}>Scan Merchant</button>
                  <button onClick={goBack} style={{
                    display: 'block', margin: '6px auto 0',
                    background: 'none', border: 'none', color: '#9ca3af',
                    fontSize: '11px', cursor: 'pointer',
                  }}>Cancel</button>
                </>
              )}

              {/* VERIFYING state */}
              {phoneState === 'verifying' && (
                <div style={{ textAlign: 'center', padding: '24px 12px' }}>
                  <RefreshCw size={28} color="#6366f1" style={{ animation: 'spin 1s linear infinite' }} />
                  <p style={{ fontSize: '11px', marginTop: '10px', color: '#a0a0b0' }}>Verifying with SOC Engine...</p>
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
              )}

              {/* RESULT state */}
              {phoneState === 'result' && scanResult && (() => {
                const safe = scanResult.isSafe !== false && (scanResult.riskScore ?? 100) < 50;
                const risk = scanResult.riskScore ?? (safe ? 15 : 82);
                const merchant = scanResult.merchantName || scanResult.upiId?.split('@')[0] || 'Unknown';
                return (
                  <>
                    {scanError && (
                      <div style={{ margin: '6px 12px', padding: '5px 8px', borderRadius: '6px', background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.3)', fontSize: '9px', color: '#eab308' }}>
                        ⚠ {scanError}
                      </div>
                    )}
                    {/* Risk banner */}
                    <div style={{
                      margin: '6px 12px',
                      padding: '7px 10px',
                      borderRadius: '8px',
                      background: safe ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                      border: `1px solid ${safe ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                    }}>
                      <div style={{ fontSize: '10px', fontWeight: '800', color: safe ? '#10b981' : '#ef4444' }}>
                        {safe ? '✓ VALID LINK' : '✗ THREAT DETECTED'}
                      </div>
                      <div style={{ fontSize: '9px', color: safe ? '#10b981' : '#ef4444', marginTop: '2px' }}>
                        {safe ? 'QR structure valid.' : 'Phishing risk detected.'}
                      </div>
                    </div>
                    {/* Merchant info */}
                    <div style={{ padding: '8px 12px' }}>
                      <div style={{ fontSize: '9px', color: '#9ca3af', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Merchant</div>
                      <div style={{ fontSize: '14px', fontWeight: '800', marginBottom: '6px', textTransform: 'capitalize' }}>{merchant}</div>
                      <div style={{ fontSize: '9px', color: '#9ca3af', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>UPI ID</div>
                      <div style={{ fontSize: '10px', color: '#a0a0b0', marginBottom: '8px', fontFamily: 'monospace' }}>{scanResult.upiId || mockUrl}</div>
                      {/* Risk score bar */}
                      <div style={{ fontSize: '9px', color: '#9ca3af', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Risk Score</span><span style={{ fontWeight: '700', color: safe ? '#10b981' : '#ef4444' }}>{risk}/100</span>
                      </div>
                      <div style={{ height: '5px', borderRadius: '3px', background: 'rgba(255,255,255,0.08)' }}>
                        <div style={{
                          height: '100%', borderRadius: '3px', width: `${risk}%`,
                          background: safe ? '#10b981' : risk > 70 ? '#ef4444' : '#eab308',
                          transition: 'width 0.6s ease',
                        }} />
                      </div>
                    </div>
                    {/* Pay button if safe, Block if threat */}
                    {(() => {
                      const s = scanResult.isSafe !== false && (scanResult.riskScore ?? 100) < 50;
                      return s ? (
                        <button onClick={() => setPhoneState('confirm')} style={{
                          margin: '4px 12px 0', width: 'calc(100% - 24px)',
                          padding: '8px', borderRadius: '8px', border: 'none',
                          background: 'linear-gradient(135deg,#10b981,#059669)',
                          color: '#fff', fontWeight: '700', fontSize: '12px', cursor: 'pointer',
                        }}>Pay ₹{PAY_AMOUNT} →</button>
                      ) : (
                        <button onClick={goBack} style={{
                          margin: '4px 12px 0', width: 'calc(100% - 24px)',
                          padding: '8px', borderRadius: '8px', border: 'none',
                          background: 'linear-gradient(135deg,#dc2626,#b91c1c)',
                          color: '#fff', fontWeight: '700', fontSize: '12px', cursor: 'pointer',
                        }}>🚫 Transaction Blocked</button>
                      );
                    })()}
                  </>
                );
              })()}

              {/* CONFIRM state */}
              {phoneState === 'confirm' && scanResult && (() => {
                const merchant = scanResult.merchantName || scanResult.upiId?.split('@')[0] || 'Unknown';
                return (
                  <>
                    <div style={{ margin: '8px 12px', padding: '7px 10px', borderRadius: '8px', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)' }}>
                      <div style={{ fontSize: '10px', fontWeight: '800', color: '#10b981' }}>✓ VALID LINK</div>
                      <div style={{ fontSize: '9px', color: '#10b981', marginTop: '2px' }}>QR structure valid.</div>
                    </div>
                    <div style={{ textAlign: 'center', padding: '10px 12px' }}>
                      <div style={{ fontSize: '10px', color: '#9ca3af', marginBottom: '2px' }}>Paying to</div>
                      <div style={{ fontSize: '17px', fontWeight: '800', marginBottom: '8px', textTransform: 'capitalize' }}>{merchant}</div>
                      <div style={{ fontSize: '30px', fontWeight: '900', color: '#6366f1' }}>₹{PAY_AMOUNT}</div>
                    </div>
                    <button onClick={handlePay} style={{
                      margin: '0 12px', width: 'calc(100% - 24px)',
                      padding: '9px', borderRadius: '8px', border: 'none',
                      background: 'linear-gradient(135deg,#3b82f6,#6366f1)',
                      color: '#fff', fontWeight: '700', fontSize: '12px', cursor: 'pointer',
                    }}>Confirm Payment</button>
                    <button onClick={goBack} style={{ display: 'block', margin: '6px auto 0', background: 'none', border: 'none', color: '#9ca3af', fontSize: '11px', cursor: 'pointer' }}>Decline</button>
                  </>
                );
              })()}

              {/* SUCCESS state */}
              {phoneState === 'success' && (
                <>
                  <div style={{ textAlign: 'center', padding: '16px 12px 8px' }}>
                    <div style={{
                      width: '52px', height: '52px', borderRadius: '50%',
                      background: 'rgba(16,185,129,0.15)', border: '2px solid rgba(16,185,129,0.4)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px',
                    }}>
                      <ShieldCheck size={26} color="#10b981" />
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: '800' }}>Payment Sent</div>
                    <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '4px' }}>Transaction ID: {txId}</div>
                  </div>
                  <div style={{ margin: '6px 12px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '8px', padding: '8px 10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#10b981', fontSize: '9px', fontWeight: '800', marginBottom: '4px' }}>
                      <RefreshCw size={10} /> SOC AGENT MONITORING
                    </div>
                    <p style={{ fontSize: '9px', color: '#9ca3af', margin: 0, lineHeight: 1.5 }}>
                      Agent intercepted bank SMS and verified ₹{PAY_AMOUNT} matches original intent.
                    </p>
                  </div>
                  <button onClick={goBack} style={{
                    margin: '8px 12px 0', width: 'calc(100% - 24px)',
                    padding: '8px', borderRadius: '8px', border: 'none',
                    background: 'linear-gradient(135deg,#3b82f6,#6366f1)',
                    color: '#fff', fontWeight: '700', fontSize: '12px', cursor: 'pointer',
                  }}>Back to Wallet</button>
                </>
              )}
            </div>
            <div className="phone-home"></div>
          </div>
        </div>

        {/* ── Agent Settings + Feature cards ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Agent Settings Panel */}
          <div className="glass-panel" style={{ border: '1px solid rgba(99,102,241,0.2)' }}>
            <h3 style={{ margin: '0 0 1.25rem', fontSize: '0.95rem', fontWeight: '700', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Agent Settings (Simulator Controls)</span>
              <button onClick={() => {
                if(window.confirm('Clear stored simulator data?')) {
                  setMockUrl('zomato@upi');
                  setTxLog([]);
                  localStorage.removeItem('mobileAgent_mockUrl');
                  localStorage.removeItem('mobileAgent_txLog');
                }
              }} style={{
                background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '6px', padding: '4px 8px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: '600'
              }}>Clear Data</button>
            </h3>

            <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.3rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Mock QR URL</label>
            <input
              value={mockUrl}
              onChange={e => setMockUrl(e.target.value)}
              placeholder="e.g. zomato@upi or phishing.xyz/pay"
              style={{
                width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                color: 'inherit', fontSize: '0.88rem', boxSizing: 'border-box', outline: 'none',
              }}
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.35rem 0 1rem' }}>
              Simulates what Flutter Camera + ML Kit QR extracts from the QR code.
            </p>

            <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '0.75rem' }}>
              {[
                { label: 'Toggle Root',       active: isRooted, onClick: () => setIsRooted(r => !r) },
                { label: 'Toggle Screen Rec', active: isRec,    onClick: () => setIsRec(r => !r) },
              ].map(({ label, active, onClick }) => (
                <button key={label} onClick={onClick} style={{
                  flex: 1, padding: '0.5rem', borderRadius: '8px',
                  border: `1px solid ${active ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.1)'}`,
                  background: active ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.04)',
                  color: active ? '#ef4444' : 'inherit',
                  cursor: 'pointer', fontWeight: '600', fontSize: '0.82rem', transition: 'all 0.2s',
                }}>{label}</button>
              ))}
            </div>

            {/* EDR pill status */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {[
                { label: edrStatus === 'checking' ? 'EDR: CHECKING' : 'EDR: SAFE', ok: edrStatus === 'safe', danger: false },
                { label: isRooted ? 'OS: ROOTED' : 'OS: SECURE', ok: !isRooted, danger: isRooted },
                { label: `REC ${isRec ? 'ON' : 'OFF'}`, ok: false, danger: isRec },
              ].map(({ label, ok, danger }) => (
                <span key={label} style={{
                  padding: '3px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '700',
                  background: danger ? 'rgba(239,68,68,0.15)' : ok ? 'rgba(16,185,129,0.15)' : 'rgba(156,163,175,0.12)',
                  color: danger ? '#ef4444' : ok ? '#10b981' : '#9ca3af',
                  border: `1px solid ${danger ? 'rgba(239,68,68,0.3)' : ok ? 'rgba(16,185,129,0.3)' : 'rgba(156,163,175,0.2)'}`,
                }}>{label}</span>
              ))}
            </div>
          </div>

          {/* ── Live Scan Log ── */}
          {txLog.length > 0 && (
            <div className="glass-panel" style={{ border: '1px solid rgba(99,102,241,0.2)' }}>
              <h3 style={{ margin: '0 0 1rem', fontSize: '0.95rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <RefreshCw size={16} /> Live Scan Log
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {txLog.map((entry, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '7px 10px', borderRadius: '8px',
                    background: entry.safe ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)',
                    border: `1px solid ${entry.safe ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'}`,
                  }}>
                    <span style={{ fontSize: '14px' }}>{entry.safe ? '✅' : '🚨'}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '12px', fontWeight: '700', textTransform: 'capitalize', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{entry.merchant}</div>
                      <div style={{ fontSize: '10px', color: '#9ca3af', fontFamily: 'monospace', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{entry.upi}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: '12px', fontWeight: '800', color: entry.safe ? '#10b981' : '#ef4444' }}>{entry.risk}/100</div>
                      {entry.paid && <div style={{ fontSize: '9px', color: '#6366f1', fontWeight: '700' }}>₹{entry.amount} paid</div>}
                      <div style={{ fontSize: '9px', color: '#9ca3af' }}>{entry.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Feature cards */}
          <div className="glass-panel">
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div className="feature-icon verified"><ShieldCheck size={28} /></div>
              <div>
                <h4 style={{ margin: '0 0 0.5rem 0' }}>Real-Time UPI Validation</h4>
                <p className="text-secondary" style={{ margin: 0, fontSize: '0.9rem' }}>Scans QR codes and validates UPI merchant IDs before payment confirmation. Checks against blacklists and GST registry in real-time.</p>
              </div>
            </div>
          </div>

          <div className="glass-panel">
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div className="feature-icon warning"><BellRing size={28} /></div>
              <div>
                <h4 style={{ margin: '0 0 0.5rem 0' }}>Passive Notification Listener</h4>
                <p className="text-secondary" style={{ margin: 0, fontSize: '0.9rem' }}>Intercepts and analyzes payment notifications from GPay, PhonePe, WhatsApp, and SMS alerts. Detects mismatch between initiation and confirmation.</p>
              </div>
            </div>
          </div>

          <div className="glass-panel">
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div className="feature-icon fraud"><Zap size={28} /></div>
              <div>
                <h4 style={{ margin: '0 0 0.5rem 0' }}>ML-Based Risk Scoring</h4>
                <p className="text-secondary" style={{ margin: 0, fontSize: '0.9rem' }}>Combines device health, merchant reputation, location anomalies, and transaction velocity to score fraud probability instantly.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Agent Capabilities */}
        <div className="glass-panel" style={{ gridColumn: 'span 6' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1.5rem 0' }}>
            <Smartphone size={24} /> Capabilities
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div className="capability-item">
              <CheckCircle size={20} className="text-verified" />
              <span>QR-based verification</span>
            </div>
            <div className="capability-item">
              <CheckCircle size={20} className="text-verified" />
              <span>Merchant trust scoring</span>
            </div>
            <div className="capability-item">
              <CheckCircle size={20} className="text-verified" />
              <span>SMS/Notification parsing</span>
            </div>
            <div className="capability-item">
              <CheckCircle size={20} className="text-verified" />
              <span>Device threat telemetry</span>
            </div>
            <div className="capability-item">
              <CheckCircle size={20} className="text-verified" />
              <span>Geo-anomaly detection</span>
            </div>
            <div className="capability-item">
              <CheckCircle size={20} className="text-verified" />
              <span>Real-time alert triggers</span>
            </div>
          </div>
        </div>

        {/* Permissions & Limitations */}
        <div className="glass-panel" style={{ gridColumn: 'span 6' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1.5rem 0' }}>
            <Lock size={24} /> Android Permissions
          </h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div className="permission-item">
              <span style={{ fontWeight: '600', display: 'block', marginBottom: '0.25rem' }}>Notification Access</span>
              <span className="text-secondary" style={{ fontSize: '0.85rem' }}>Required for payment app monitoring</span>
            </div>
            <div className="permission-item">
              <span style={{ fontWeight: '600', display: 'block', marginBottom: '0.25rem' }}>SMS Read</span>
              <span className="text-secondary" style={{ fontSize: '0.85rem' }}>Bank alert & OTP analysis</span>
            </div>
            <div className="permission-item">
              <span style={{ fontWeight: '600', display: 'block', marginBottom: '0.25rem' }}>Device State & Location</span>
              <span className="text-secondary" style={{ fontSize: '0.85rem' }}>Risk scoring & anomaly detection</span>
            </div>
          </div>
        </div>

        {/* Mobile SOC Modules */}
        <div className="glass-panel" style={{ gridColumn: 'span 12' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1.5rem 0' }}>
            <Zap size={24} /> Core Modules
          </h3>
          <div className="mobile-agent-grid">
            <div className="mobile-module-card">
              <div style={{ fontSize: '28px', marginBottom: '0.5rem' }}>🔐</div>
              <h4>QR Validator</h4>
              <p>Decodes & validates UPI IDs from static/dynamic QR codes. Cross-checks against merchant registry.</p>
            </div>
            <div className="mobile-module-card">
              <div style={{ fontSize: '28px', marginBottom: '0.5rem' }}>📱</div>
              <h4>Notification Parser</h4>
              <p>Listens for GPay, PhonePe, BHIM alerts. Extracts amount, merchant, timestamp. Flags mismatches.</p>
            </div>
            <div className="mobile-module-card">
              <div style={{ fontSize: '28px', marginBottom: '0.5rem' }}>📨</div>
              <h4>SMS Analyzer</h4>
              <p>Parses bank SMS alerts for OTP, amount confirmation. Detects SMS-spoofing & OTP phishing.</p>
            </div>
            <div className="mobile-module-card">
              <div style={{ fontSize: '28px', marginBottom: '0.5rem' }}>⚡</div>
              <h4>Risk Engine</h4>
              <p>Real-time ML scoring of fraud probability based on merchant, amount, location & device state.</p>
            </div>
            <div className="mobile-module-card">
              <div style={{ fontSize: '28px', marginBottom: '0.5rem' }}>📍</div>
              <h4>Geo-Tracker</h4>
              <p>Detects impossible travel, location spoofing, VPN usage patterns. Flags regional anomalies.</p>
            </div>
            <div className="mobile-module-card">
              <div style={{ fontSize: '28px', marginBottom: '0.5rem' }}>🚨</div>
              <h4>Alert Manager</h4>
              <p>Sends encrypted push notifications & silent alerts to SOC dashboard. Voice confirmation mode.</p>
            </div>
          </div>
        </div>

        {/* Deployment Info */}
        <div className="glass-panel" style={{ gridColumn: 'span 12' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1.5rem 0' }}>
            <ClipboardList size={24} /> Deployment & Coverage
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
            <div className="deployment-card">
              <h5 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Platform</h5>
              <div className="text-primary" style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>Android 8+</div>
              <p className="text-secondary" style={{ fontSize: '0.85rem' }}>Supports all major UPI apps and devices. iOS coverage limited to notification-based parsing.</p>
            </div>
            <div className="deployment-card">
              <h5 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Agent Status</h5>
              <div className="text-verified" style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>● Live</div>
              <p className="text-secondary" style={{ fontSize: '0.85rem' }}>Passive monitoring active on enrolled user devices. Real-time telemetry streaming to SOC backend.</p>
            </div>
            <div className="deployment-card">
              <h5 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Coverage</h5>
              <div className="text-warning" style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>2,340 Devices</div>
              <p className="text-secondary" style={{ fontSize: '0.85rem' }}>Active monitoring across 12 regions with 99.4% uptime. Covering 15.2M daily transactions.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MobileAgent;
