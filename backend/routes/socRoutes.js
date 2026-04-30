const express = require('express');
const router = express.Router();
const riskScoring = require('../services/riskScoring');
const TransactionModel = require('../models/Transaction');

// Module 1: Transaction Ingestion API (Part 2)
// POST /transaction/detect
router.post('/transaction/detect', async (req, res) => {
  try {
    const { user_id, amount, upi_id, source, location, intent_id, deviceHealth } = req.body;

    if (!amount || !upi_id) {
      return res.status(400).json({ error: 'amount and upi_id are required' });
    }

    const result = await riskScoring.ingestTransaction({
      user_id,
      amount: parseFloat(amount),
      upi_id,
      source: source || 'notification',
      location,
      intent_id,
      deviceHealth
    });

    res.json(result);
  } catch (error) {
    console.error('Transaction detection error:', error);
    res.status(500).json({ error: 'Internal server error during transaction analysis' });
  }
});

// QR Scan Verification (Module A - Android App Report)
router.post('/qr/analyze', (req, res) => {
  const { qrContent } = req.body;
  const result = riskScoring.analyzeQRContent(qrContent || '');
  res.json(result);
});

// Legacy Pre-payment check (aliased to ingest but without finalizing)
router.post('/pre-payment/verify', async (req, res) => {
  try {
    const { upiId } = req.body;
    const result = await riskScoring.ingestTransaction({ upi_id: upiId, amount: 0, source: 'manual_check' });
    res.json({
      status: result.riskScore > 70 ? 'Verified' : 'Suspicious',
      riskScore: result.riskScore,
      message: result.alerts[0] || 'Merchant checked.'
    });
  } catch (error) {
    console.error('Pre-payment verification error:', error);
    res.status(500).json({ error: 'Internal server error during verification' });
  }
});

// Payment Intent Registration
router.post('/payment/intent', (req, res) => {
  const { expectedAmount, expectedReceiver } = req.body;
  const intentId = `intent_${Date.now()}`;
  riskScoring.registerIntent(intentId, parseFloat(expectedAmount), expectedReceiver);
  res.json({ intentId, message: 'Intent registered' });
});

// Real-Time Data Ingestion (Android Agent Simulation)
router.post('/ingest/notification', async (req, res) => {
  try {
    const { amount, upi_id, merchant_name, deviceHealth, location } = req.body;

    if (!amount || !upi_id) {
      return res.status(400).json({ error: 'amount and upi_id are required' });
    }

    const result = await riskScoring.ingestTransaction({
      user_id: 'user_123',
      amount: parseFloat(amount),
      upi_id,
      merchant_name,
      source: 'notification',
      location: location || 'Mumbai',
      deviceHealth
    });

    res.json({
      ...result,
      ingested_via: 'Notification Listener',
      processing_time: '50ms'
    });
  } catch (error) {
    console.error('Notification ingestion error:', error);
    res.status(500).json({ error: 'Internal server error during notification processing' });
  }
});

// SMS Parsing Simulation
router.post('/ingest/sms', async (req, res) => {
  try {
    const { smsContent } = req.body;

    // Simulate SMS parsing with regex
    const amountMatch = smsContent.match(/Rs\.?\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i) ||
                        smsContent.match(/INR\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i);
    const upiMatch = smsContent.match(/to\s+([a-zA-Z0-9@.-]+)/i);

    if (!amountMatch || !upiMatch) {
      return res.status(400).json({ error: 'Could not parse amount or UPI ID from SMS' });
    }

    const amount = parseFloat(amountMatch[1].replace(/,/g, ''));
    const upi_id = upiMatch[1].toLowerCase();

    const result = await riskScoring.ingestTransaction({
      user_id: 'user_123',
      amount,
      upi_id,
      source: 'sms',
      location: 'Mumbai'
    });

    res.json({
      ...result,
      parsed_from_sms: true,
      extracted_amount: amount,
      extracted_upi: upi_id
    });
  } catch (error) {
    console.error('SMS ingestion error:', error);
    res.status(500).json({ error: 'Internal server error during SMS processing' });
  }
});

// GST Verification API (Real-world simulation)
router.post('/verify/gst', (req, res) => {
  const { upi_id } = req.body;

  if (!upi_id) {
    return res.status(400).json({ error: 'upi_id is required' });
  }

  // Simulate GST portal API call
  const verification = riskScoring.verifyGST ? riskScoring.verifyGST(upi_id) : {
    verified: false,
    details: 'GST verification service unavailable'
  };

  res.json({
    upi_id,
    gst_verified: verification.verified,
    gst_number: verification.gst_number,
    verification_details: verification.details,
    api_response_time: '120ms'
  });
});

// Voice Alert Management
router.get('/voice/alerts', (req, res) => {
  const pendingAlerts = riskScoring.getVoiceAlerts ? riskScoring.getVoiceAlerts() : [];
  res.json({
    pending_alerts: pendingAlerts.filter(a => !a.delivered),
    recent_alerts: pendingAlerts.slice(0, 10)
  });
});

router.post('/voice/alert/deliver', (req, res) => {
  const { alert_id } = req.body;
  // Mark alert as delivered
  const alert = riskScoring.voiceAlerts?.find(a => a.id === alert_id);
  if (alert) {
    alert.delivered = true;
    res.json({ message: 'Voice alert marked as delivered', alert_id });
  } else {
    res.status(404).json({ error: 'Alert not found' });
  }
});

// Multi-Tenant Device Monitoring
router.post('/device/register', (req, res) => {
  const { device_id, device_info } = req.body;

  if (!device_id) {
    return res.status(400).json({ error: 'device_id is required' });
  }

  const device = {
    id: device_id,
    info: device_info,
    registered_at: new Date().toISOString(),
    lastSeen: Date.now(),
    compromised: false,
    monitoring_active: true
  };

  // Simulate device registration
  riskScoring.deviceFleet?.set(device_id, device) || {};

  res.json({
    device_id,
    status: 'registered',
    monitoring_enabled: true,
    fleet_size: riskScoring.deviceFleet?.size || 1
  });
});

router.get('/device/fleet', (req, res) => {
  const fleet = riskScoring.deviceFleet ? Array.from(riskScoring.deviceFleet.values()) : [];
  res.json({
    total_devices: fleet.length,
    active_devices: fleet.filter(d => d.monitoring_active).length,
    compromised_devices: fleet.filter(d => d.compromised).length,
    devices: fleet.slice(0, 50) // Limit for performance
  });
});

// Regional Threat Intelligence
router.get('/threats/regional', (req, res) => {
  const threats = riskScoring.regionalThreats || {};
  res.json({
    regions: Object.entries(threats).map(([region, data]) => ({
      region,
      active_threats: data.activeThreats,
      last_update: new Date(data.lastUpdate).toISOString(),
      risk_level: data.activeThreats > 5 ? 'high' : data.activeThreats > 2 ? 'medium' : 'low'
    })),
    global_threat_level: 'medium',
    last_updated: new Date().toISOString()
  });
});

// AI Anomaly Detection Testing
router.post('/ai/analyze', (req, res) => {
  const { transaction_data } = req.body;

  if (!transaction_data) {
    return res.status(400).json({ error: 'transaction_data is required' });
  }

  // Simulate AI analysis
  const analysis = {
    behavioral_anomaly_score: Math.random() * 100,
    predicted_risk: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
    confidence: 0.85 + Math.random() * 0.1,
    ai_insights: [
      'Transaction pattern deviates from user baseline',
      'Location anomaly detected',
      'Time-based spending pattern unusual'
    ],
    recommended_action: Math.random() > 0.8 ? 'block' : Math.random() > 0.5 ? 'verify' : 'allow'
  };

  res.json({
    analysis,
    processing_time: '45ms',
    model_version: 'AI-SOC-v2.1'
  });
});

// Export Compliance Logs
router.get('/export', (req, res) => {
    const stats = riskScoring.getDashboardStats();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=soc_audit_logs.json');
    res.send(JSON.stringify(stats.recentTransactions, null, 2));
});

// Dashboard Stats Endpoint
router.get('/dashboard/stats', (req, res) => {
  const stats = riskScoring.getDashboardStats();
  res.json(stats);
});

// AI Behavior Training
router.post('/train', (req, res) => {
    const { newRangeMax } = req.body;
    res.json(riskScoring.trainProfile(newRangeMax));
});

// Blacklist Merchant
router.post('/blacklist', (req, res) => {
    const { upi_id } = req.body;
    res.json(riskScoring.addToBlacklist(upi_id));
});

// Resolve/Dismiss Alert
router.post('/resolve', (req, res) => {
    const { tx_id } = req.body;
    res.json(riskScoring.resolveAlert(tx_id));
});

// Dashboard Stats Endpoint
router.get('/dashboard/stats', (req, res) => {
  const stats = riskScoring.getDashboardStats();
  res.json(stats);
});

// Fetch Last 7 Days Transaction History
router.get('/history', async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const history = await TransactionModel.find({ timestamp: { $gte: sevenDaysAgo } }).sort({ timestamp: -1 });
    res.json(history);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Internal server error fetching history' });
  }
});

module.exports = router;
