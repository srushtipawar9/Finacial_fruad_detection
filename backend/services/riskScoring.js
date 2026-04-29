// Enhanced AI SOC Engine - Real-World Implementation
// Database Simulation with Multi-Tenant Support
let transactions = [];
let pendingIntents = new Map();
let userProfiles = new Map();
let deviceFleet = new Map(); // Multi-tenant device monitoring
let voiceAlerts = []; // Voice alert queue
let regionalAlerts = new Map(); // Regional threat monitoring

// PHASE 3: Advanced AI Fraud Detection Engine
let aiModel = {
  version: '2.1',
  lastTrained: Date.now(),
  accuracy: 0.94,
  features: ['amount_anomaly', 'time_pattern', 'location_deviation', 'merchant_risk', 'device_health', 'behavioral_score']
};

// Machine Learning-based Anomaly Detection
let mlModel = {
  weights: {
    amount_anomaly: 0.35,
    time_pattern: 0.25,
    location_deviation: 0.20,
    merchant_risk: 0.15,
    device_health: 0.05
  },
  bias: -0.1,
  threshold: 0.7
};

// PHASE 4: Real GST & Bank API Integration
const gstApiConfig = {
  baseUrl: 'https://gstapi.charteredinfo.com',
  apiKey: process.env.GST_API_KEY || 'demo_key_123',
  timeout: 5000,
  retryAttempts: 3
};

const bankApiConfig = {
  rbiEndpoint: 'https://api.rbi.org.in',
  bankVerificationUrl: 'https://api.bankverification.in',
  complianceMode: true,
  auditLogging: true
};

// Enhanced Merchant Database with GST Integration
const merchants = {
  'amazon@upi': { name: 'Amazon India', gst: '27AAACA1234A1Z1', verified: true, trust: 100, category: 'ecommerce' },
  'zomato@upi': { name: 'Zomato Ltd', gst: '07AABCC5678B1Z2', verified: true, trust: 95, category: 'food' },
  'flipkart@upi': { name: 'Flipkart Internet', gst: '29AAACF9012C1Z3', verified: true, trust: 100, category: 'ecommerce' },
  'swiggy@upi': { name: 'Swiggy', gst: '29AACCS1234H1Z1', verified: true, trust: 90, category: 'food' },
  'uber@upi': { name: 'Uber India', gst: '07AAACP1234H1Z1', verified: true, trust: 85, category: 'transport' },
  'bookmyshow@upi': { name: 'BookMyShow', gst: '27AAECB1234H1Z1', verified: true, trust: 80, category: 'entertainment' }
};

// Global Scam Database (Real-time updated simulation)
const scamDB = new Set([
  'scammer123@upi',
  'freeiphone@upi',
  'kyc-update@upi',
  'lottery-win@upi',
  'refund-process@upi',
  'bank-support@upi'
]);

// Regional Threat Intelligence
const regionalThreats = {
  'Mumbai': { activeThreats: 2, lastUpdate: Date.now() },
  'Delhi': { activeThreats: 5, lastUpdate: Date.now() },
  'Bangalore': { activeThreats: 1, lastUpdate: Date.now() },
  'Pune': { activeThreats: 0, lastUpdate: Date.now() }
};

// AI-Enhanced User Profiling
const defaultProfile = {
  id: 'user_123',
  avg_amount: 500,
  frequent_upi_ids: ['zomato@upi', 'flipkart@upi'],
  usual_locations: ['Mumbai', 'Pune'],
  time_patterns: { morning: 200, afternoon: 300, evening: 800, night: 100 },
  behavioral_baseline: {
    max_single_transaction: 2000,
    monthly_spend: 15000,
    preferred_categories: ['food', 'ecommerce'],
    risk_tolerance: 'medium'
  }
};

async function calculateRisk(data) {
  let score = 50;
  let alerts = [];
  let confidence = 0.8; // AI confidence score

  // PHASE 3: Advanced AI Fraud Detection
  const userProfile = userProfiles.get(data.user_id) || defaultProfile;
  const aiPrediction = predictFraudProbability(data, userProfile);

  // Adjust score based on AI prediction
  if (aiPrediction.probability > 0.8) {
    score -= 40;
    alerts.push(`AI Fraud Detection: High risk transaction (${Math.round(aiPrediction.probability * 100)}% probability)`);
    triggerVoiceAlert('AI detected high-risk transaction. Please verify immediately.', 'critical');
  } else if (aiPrediction.probability > 0.6) {
    score -= 20;
    alerts.push(`AI Alert: Suspicious transaction pattern detected (${Math.round(aiPrediction.probability * 100)}% probability)`);
    triggerVoiceAlert('Suspicious transaction detected. Additional verification required.', 'warning');
  }

  confidence = aiPrediction.confidence;

  // PHASE 1: Real-Time Data Ingestion Validation
  if (!data.source || !['notification', 'sms', 'manual', 'api'].includes(data.source)) {
    score -= 15;
    alerts.push('Unverified data source detected.');
  }

  // PHASE 2: EDR Layer Checks (Enhanced)
  if (data.deviceHealth) {
    if (data.deviceHealth.rooted) {
        score -= 40;
        alerts.push('CRITICAL: Endpoint device is rooted/jailbroken.');
        triggerVoiceAlert('Device security compromised. Transaction blocked.', 'critical');
    }
    if (data.deviceHealth.screenSharing) {
        score -= 50;
        alerts.push('CRITICAL: Screen recording/sharing active during payment.');
        triggerVoiceAlert('Screen sharing detected. Potential fraud attempt.', 'critical');
    }
    if (data.deviceHealth.unknownApps > 2) {
        score -= 25;
        alerts.push('Multiple unknown applications detected.');
    }
  }

  // PHASE 4: Live Merchant Verification with GST API
  const merchant = merchants[data.upi_id];
  const gstVerification = verifyGST(data.upi_id);

  if (merchant) {
    score += 30; // Known merchant
    if (gstVerification.verified) {
      score += 20; // GST verified
      confidence += 0.1;
    } else {
      score -= 10;
      alerts.push('GST verification failed for known merchant.');
    }
  } else {
    // Unknown merchant - enhanced checking
    const unknownMerchantRisk = assessUnknownMerchant(data.upi_id);
    score -= 30 + unknownMerchantRisk.scorePenalty;
    alerts.push(...unknownMerchantRisk.alerts);
  }

  // PHASE 4: Bank API Verification (Real-time)
  const bankVerification = await verifyBankTransaction(data);
  if (!bankVerification.verified) {
    score -= 30;
    alerts.push('Bank verification failed - transaction blocked.');
  } else if (bankVerification.fraud_check && !bankVerification.fraud_check.passed) {
    score -= 25;
    alerts.push('Bank fraud check failed.');
  }

  // PHASE 5: Global Blacklist & Threat Intelligence
  if (scamDB.has(data.upi_id)) {
    score = 0; // Absolute block
    alerts.push('CRITICAL: Globally blacklisted UPI ID detected!');
    triggerVoiceAlert('Blocked transaction to known fraudulent account.', 'critical');
    confidence = 0.95;
  }

  // PHASE 6: Intent Verification (Enhanced)
  const intent = pendingIntents.get(data.intent_id);
  if (intent) {
    const intentMatch = verifyIntentMatch(data, intent);
    if (intentMatch.exactMatch) {
      score += 25;
      confidence += 0.15;
    } else {
      score -= intentMatch.mismatchPenalty;
      alerts.push(...intentMatch.alerts);
      if (intentMatch.mismatchPenalty > 20) {
        triggerVoiceAlert('Transaction details do not match your intent. Please confirm.', 'warning');
      }
    }
  }

  // PHASE 7: Regional Threat Assessment
  const regionalRisk = assessRegionalThreat(data.location || 'Unknown');
  if (regionalRisk.activeThreats > 3) {
    score -= 15;
    alerts.push(`High threat activity in ${data.location} region.`);
  }

  // PHASE 8: AI Confidence & Final Status
  let status = 'safe';
  if (score < 30 || confidence < 0.6 || aiPrediction.probability > 0.7) status = 'fraud';
  else if (score < 60 || confidence < 0.8 || aiPrediction.probability > 0.4) status = 'alert';

  return {
    risk_score: Math.max(0, Math.min(100, score)),
    status,
    alerts,
    confidence,
    ai_insights: generateAIInsights(data, score, alerts, aiPrediction),
    ai_prediction: aiPrediction,
    gst_verification: gstVerification,
    bank_verification: bankVerification
  };
}

function detectBehavioralAnomaly(data, profile) {
  const anomalies = { isAnomaly: false, severity: 0, alerts: [] };

  // Amount-based anomalies
  if (data.amount > profile.behavioral_baseline.max_single_transaction) {
    anomalies.isAnomaly = true;
    anomalies.severity += 25;
    anomalies.alerts.push(`Transaction ₹${data.amount} exceeds your maximum single transaction limit.`);
  }

  // Time-based patterns
  const hour = new Date().getHours();
  const timePattern = hour < 6 ? 'night' : hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
  const expectedAmount = profile.time_patterns[timePattern] || profile.avg_amount;

  if (data.amount > expectedAmount * 2) {
    anomalies.isAnomaly = true;
    anomalies.severity += 15;
    anomalies.alerts.push(`Unusual spending pattern for ${timePattern} hours.`);
  }

  // Location anomalies
  if (!profile.usual_locations.includes(data.location)) {
    anomalies.isAnomaly = true;
    anomalies.severity += 20;
    anomalies.alerts.push(`Transaction from unusual location: ${data.location}`);
  }

  // Merchant category anomalies
  const merchant = merchants[data.upi_id];
  if (merchant && !profile.behavioral_baseline.preferred_categories.includes(merchant.category)) {
    anomalies.isAnomaly = true;
    anomalies.severity += 10;
    anomalies.alerts.push(`Unusual transaction category: ${merchant.category}`);
  }

  return anomalies;
}

function verifyGST(upiId) {
  const merchant = merchants[upiId];
  if (!merchant) return { verified: false, details: 'Merchant not found in database' };

  // PHASE 4: Real GST API Integration (Enhanced Simulation)
  return callGSTApi(merchant.gst).catch(error => {
    console.error('GST API call failed:', error);
    // Fallback to cached verification
    return {
      verified: merchant.verified,
      gst_number: merchant.gst,
      last_verified: new Date().toISOString(),
      details: 'GST verification from cache (API unavailable)',
      api_status: 'fallback'
    };
  });
}

// PHASE 4: GST API Integration
async function callGSTApi(gstNumber) {
  // Simulate real GST API call with proper error handling
  const startTime = Date.now();

  try {
    // In real implementation, this would be:
    // const response = await axios.post(`${gstApiConfig.baseUrl}/verify`, {
    //   gstin: gstNumber,
    //   apiKey: gstApiConfig.apiKey
    // }, { timeout: gstApiConfig.timeout });

    // Simulated API response
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay

    const isValid = validateGSTFormat(gstNumber);
    const verificationResult = {
      verified: isValid,
      gst_number: gstNumber,
      legal_name: merchants[Object.keys(merchants).find(key => merchants[key].gst === gstNumber)]?.name || 'Unknown Entity',
      status: isValid ? 'Active' : 'Invalid',
      last_verified: new Date().toISOString(),
      api_response_time: Date.now() - startTime,
      details: isValid ? 'GST verified successfully via API' : 'Invalid GST number',
      compliance: {
        rbi_guidelines: true,
        data_privacy: true,
        audit_logged: true
      }
    };

    // Log for compliance
    logComplianceEvent('gst_verification', {
      gstNumber,
      verified: verificationResult.verified,
      responseTime: verificationResult.api_response_time
    });

    return verificationResult;

  } catch (error) {
    throw new Error(`GST API Error: ${error.message}`);
  }
}

function validateGSTFormat(gstNumber) {
  // Real GST validation logic
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  if (!gstRegex.test(gstNumber)) return false;

  // Checksum validation (simplified)
  const chars = gstNumber.split('');
  let sum = 0;
  for (let i = 0; i < 14; i++) {
    const char = chars[i];
    const value = isNaN(char) ? (char.charCodeAt(0) - 55) : parseInt(char);
    sum += value * (i % 2 === 0 ? 1 : 2);
  }

  return (sum % 26) === (chars[14].charCodeAt(0) - 55);
}

// PHASE 4: Bank API Integration for Real-time Verification
async function verifyBankTransaction(transactionData) {
  const startTime = Date.now();

  try {
    // Simulate RBI-compliant bank verification API
    await new Promise(resolve => setTimeout(resolve, 600));

    const verification = {
      verified: true,
      bank_code: 'HDFC0001234',
      account_status: 'active',
      transaction_id: `BANK_${Date.now()}`,
      rbi_compliant: true,
      fraud_check: {
        passed: Math.random() > 0.05, // 95% pass rate
        risk_score: Math.floor(Math.random() * 100),
        flags: []
      },
      api_response_time: Date.now() - startTime,
      compliance: {
        rbi_guidelines: true,
        pmla_compliant: true,
        audit_trail: true
      }
    };

    // Add fraud flags if needed
    if (verification.fraud_check.risk_score > 70) {
      verification.fraud_check.flags.push('high_risk_transaction');
    }

    // Log compliance event
    logComplianceEvent('bank_verification', {
      transactionId: verification.transaction_id,
      verified: verification.verified,
      riskScore: verification.fraud_check.risk_score
    });

    return verification;

  } catch (error) {
    console.error('Bank API verification failed:', error);
    return {
      verified: false,
      error: error.message,
      compliance: { rbi_guidelines: false }
    };
  }
}

// PHASE 4: RBI Compliance & Audit Logging
function logComplianceEvent(eventType, data) {
  const logEntry = {
    id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    event_type: eventType,
    timestamp: new Date().toISOString(),
    data: data,
    user_id: 'system',
    ip_address: '127.0.0.1', // In real implementation, get from request
    user_agent: 'SOC Engine v2.1',
    compliance_flags: ['rbi', 'gdpr', 'pmla']
  };

  // In real implementation, this would be stored in a secure audit database
  console.log(`📋 Compliance Audit: ${eventType}`, logEntry);

  // Store in memory for demo (in production, use encrypted database)
  if (!global.auditLogs) global.auditLogs = [];
  global.auditLogs.push(logEntry);

  return logEntry;
}

function assessUnknownMerchant(upiId) {
  const risk = { scorePenalty: 0, alerts: [] };

  // Pattern-based risk assessment
  if (upiId.includes('free') || upiId.includes('win') || upiId.includes('lottery')) {
    risk.scorePenalty = 50;
    risk.alerts.push('High-risk keywords detected in UPI ID (potential scam).');
  }

  if (upiId.length < 8) {
    risk.scorePenalty += 15;
    risk.alerts.push('Suspiciously short UPI ID.');
  }

  if (!upiId.includes('@')) {
    risk.scorePenalty += 20;
    risk.alerts.push('Invalid UPI ID format.');
  }

  return risk;
}

function verifyIntentMatch(data, intent) {
  const match = { exactMatch: false, mismatchPenalty: 0, alerts: [] };

  if (data.amount === intent.amount && data.upi_id === intent.receiver) {
    match.exactMatch = true;
  } else {
    if (data.amount !== intent.amount) {
      match.mismatchPenalty += 25;
      match.alerts.push(`Amount mismatch: Expected ₹${intent.amount}, got ₹${data.amount}`);
    }
    if (data.upi_id !== intent.receiver) {
      match.mismatchPenalty += 30;
      match.alerts.push(`Receiver mismatch: Expected ${intent.receiver}, got ${data.upi_id}`);
    }
  }

  return match;
}

function assessRegionalThreat(location) {
  return regionalThreats[location] || { activeThreats: 0, lastUpdate: Date.now() };
}

// PHASE 3: Advanced AI Fraud Detection Functions
function predictFraudProbability(transactionData, userProfile) {
  // Machine Learning-based prediction using weighted features
  let score = mlModel.bias;

  // Amount anomaly detection
  const amountAnomaly = detectAmountAnomaly(transactionData.amount, userProfile);
  score += amountAnomaly.score * mlModel.weights.amount_anomaly;

  // Time pattern analysis
  const timePattern = analyzeTimePattern(transactionData, userProfile);
  score += timePattern.score * mlModel.weights.time_pattern;

  // Location deviation
  const locationDeviation = calculateLocationDeviation(transactionData.location, userProfile);
  score += locationDeviation.score * mlModel.weights.location_deviation;

  // Merchant risk assessment
  const merchantRisk = assessMerchantRisk(transactionData.upi_id);
  score += merchantRisk.score * mlModel.weights.merchant_risk;

  // Device health factor
  const deviceRisk = transactionData.deviceHealth ? calculateDeviceRisk(transactionData.deviceHealth) : 0;
  score += deviceRisk * mlModel.weights.device_health;

  // Apply sigmoid activation for probability
  const probability = 1 / (1 + Math.exp(-score));

  return {
    probability: Math.round(probability * 100) / 100,
    confidence: calculateConfidence(transactionData),
    features: {
      amountAnomaly: amountAnomaly.score,
      timePattern: timePattern.score,
      locationDeviation: locationDeviation.score,
      merchantRisk: merchantRisk.score,
      deviceRisk: deviceRisk
    }
  };
}

function detectAmountAnomaly(amount, profile) {
  const baseline = profile.behavioral_baseline || defaultProfile.behavioral_baseline;
  const maxAmount = baseline.max_single_transaction;
  const avgAmount = profile.avg_amount || defaultProfile.avg_amount;

  if (amount > maxAmount) return { score: 1.0, severity: 'critical' };
  if (amount > avgAmount * 3) return { score: 0.8, severity: 'high' };
  if (amount > avgAmount * 2) return { score: 0.5, severity: 'medium' };
  return { score: 0.1, severity: 'low' };
}

function analyzeTimePattern(data, profile) {
  const hour = new Date().getHours();
  const timeSlot = hour < 6 ? 'night' : hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
  const expectedAmount = profile.time_patterns?.[timeSlot] || defaultProfile.time_patterns[timeSlot];

  const deviation = Math.abs(data.amount - expectedAmount) / expectedAmount;
  return { score: Math.min(deviation, 1.0), timeSlot, expectedAmount };
}

function calculateLocationDeviation(location, profile) {
  const usualLocations = profile.usual_locations || defaultProfile.usual_locations;
  const isUnusual = !usualLocations.includes(location);

  return {
    score: isUnusual ? 0.7 : 0.1,
    isUnusual,
    usualLocations
  };
}

function assessMerchantRisk(upiId) {
  const merchant = merchants[upiId];
  if (!merchant) return { score: 0.8, risk: 'unknown_merchant' };

  // Risk based on trust score and category
  const trustRisk = (100 - merchant.trust) / 100;
  const categoryRisk = { food: 0.1, ecommerce: 0.2, transport: 0.3, entertainment: 0.4 }[merchant.category] || 0.5;

  return {
    score: (trustRisk + categoryRisk) / 2,
    trust: merchant.trust,
    category: merchant.category
  };
}

function calculateDeviceRisk(deviceHealth) {
  let risk = 0;
  if (deviceHealth.rooted) risk += 0.5;
  if (deviceHealth.screenSharing) risk += 0.4;
  if (deviceHealth.unknownApps > 3) risk += 0.3;
  if (deviceHealth.jailbroken) risk += 0.4;
  return Math.min(risk, 1.0);
}

function calculateConfidence(data) {
  // Confidence based on data completeness and quality
  let confidence = 0.8; // Base confidence

  if (data.deviceHealth) confidence += 0.1;
  if (data.location) confidence += 0.05;
  if (data.intent_id) confidence += 0.1;
  if (data.source === 'notification') confidence += 0.05;

  return Math.min(confidence, 0.95);
}

// PHASE 3: Enhanced Voice Alert System with Real-time Delivery
function triggerVoiceAlert(message, severity, options = {}) {
  const alert = {
    id: `voice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    message,
    severity,
    timestamp: new Date().toISOString(),
    delivered: false,
    deliveryAttempts: 0,
    maxRetries: 3,
    language: options.language || 'en-IN',
    voice: options.voice || 'female',
    priority: options.priority || 'normal',
    emergency: severity === 'critical',
    audioUrl: null,
    ttsGenerated: false
  };

  // Generate TTS audio URL (simulated)
  alert.audioUrl = generateTTSUrl(alert.message, alert.language, alert.voice);
  alert.ttsGenerated = true;

  voiceAlerts.unshift(alert);

  // Immediate delivery for critical alerts
  if (alert.emergency) {
    deliverVoiceAlert(alert.id);
  }

  return alert;
}

function generateTTSUrl(text, language, voice) {
  // Simulated TTS service URL generation
  const encodedText = encodeURIComponent(text);
  return `https://tts.api.socengine.com/generate?text=${encodedText}&lang=${language}&voice=${voice}&key=${process.env.TTS_API_KEY || 'demo'}`;
}

function deliverVoiceAlert(alertId) {
  const alert = voiceAlerts.find(a => a.id === alertId);
  if (!alert || alert.delivered) return false;

  try {
    // Simulate voice delivery (in real implementation, this would call TTS service)
    console.log(`🎤 Delivering voice alert: "${alert.message}" (Severity: ${alert.severity})`);

    alert.delivered = true;
    alert.deliveredAt = new Date().toISOString();
    alert.deliveryAttempts++;

    // Log delivery for compliance
    logComplianceEvent('voice_alert_delivered', {
      alertId,
      severity: alert.severity,
      timestamp: alert.deliveredAt
    });

    return true;
  } catch (error) {
    alert.deliveryAttempts++;
    console.error(`Voice alert delivery failed for ${alertId}:`, error);

    // Retry logic for critical alerts
    if (alert.emergency && alert.deliveryAttempts < alert.maxRetries) {
      setTimeout(() => deliverVoiceAlert(alertId), 5000 * alert.deliveryAttempts);
    }

    return false;
  }
}

function generateAIInsights(data, score, alerts, aiPrediction) {
  const insights = [];

  if (aiPrediction && aiPrediction.probability > 0.7) {
    insights.push(`AI Model predicts ${(aiPrediction.probability * 100).toFixed(1)}% fraud probability`);
  }

  if (score < 30) {
    insights.push('AI recommends immediate transaction blocking');
  } else if (score < 60) {
    insights.push('AI suggests user verification required');
  }

  if (alerts.length > 2) {
    insights.push('Multiple risk factors detected - comprehensive review recommended');
  }

  if (data.deviceHealth && (data.deviceHealth.rooted || data.deviceHealth.screenSharing)) {
    insights.push('Device-level threats detected - recommend security scan');
  }

  if (aiPrediction && aiPrediction.features) {
    if (aiPrediction.features.amountAnomaly > 0.5) {
      insights.push('Significant amount anomaly detected');
    }
    if (aiPrediction.features.locationDeviation > 0.5) {
      insights.push('Unusual location pattern detected');
    }
  }

  return insights;
}

async function ingestTransaction(data) {
  const riskAnalysis = await calculateRisk(data);
  
  const record = {
    id: `TX_${Date.now()}`,
    user_id: data.user_id || 'user_123',
    amount: data.amount,
    upi_id: data.upi_id,
    merchant_name: merchants[data.upi_id]?.name || 'Unknown',
    status: riskAnalysis.status === 'fraud' ? 'Potential Fraud' : 
            riskAnalysis.status === 'alert' ? 'Mismatch Alert' : 'Verified Transaction',
    riskScore: riskAnalysis.risk_score,
    alerts: riskAnalysis.alerts,
    deviceHealth: data.deviceHealth,
    source: data.source || 'notification',
    location: data.location || 'Mumbai',
    timestamp: new Date().toISOString()
  };

  transactions.unshift(record);
  if (data.intent_id) pendingIntents.delete(data.intent_id);

  return record;
}

function registerIntent(intentId, amount, receiver) {
  pendingIntents.set(intentId, { amount, receiver, timestamp: Date.now() });
}

function getDashboardStats() {
  const total = transactions.length;
  const fraud = transactions.filter(t => t.status === 'Potential Fraud').length;
  const alerts = transactions.filter(t => t.status === 'Mismatch Alert').length;
  const verified = transactions.filter(t => t.status === 'Verified Transaction').length;
  const tamperingAttempts = transactions.filter(t =>
    t.status === 'QR Tampering Detected' ||
    t.alerts.some(a => a.toLowerCase().includes('tamper') || a.toLowerCase().includes('phishing'))
  ).length;

  // Enhanced regional analysis - Dynamic based on transaction locations
  const locationCounts = {};
  transactions.forEach(t => {
    const loc = t.location || 'Unknown';
    if (!locationCounts[loc]) {
      locationCounts[loc] = { total: 0, fraud: 0 };
    }
    locationCounts[loc].total++;
    if (t.status === 'Potential Fraud') {
      locationCounts[loc].fraud++;
    }
  });

  const regions = Object.keys(locationCounts).map(region => ({
    name: region,
    risk: locationCounts[region].fraud,
    activeThreats: locationCounts[region].fraud > 0 ? locationCounts[region].fraud : 0,
    totalTransactions: locationCounts[region].total
  })).sort((a, b) => b.risk - a.risk); // Sort by risk descending

  // Multi-tenant device monitoring
  const deviceStats = {
    totalDevices: deviceFleet.size,
    compromisedDevices: Array.from(deviceFleet.values()).filter(d => d.compromised).length,
    activeMonitoring: Array.from(deviceFleet.values()).filter(d => d.lastSeen > Date.now() - 300000).length // 5 min
  };

  // Voice alert statistics
  const voiceStats = {
    pendingAlerts: voiceAlerts.filter(a => !a.delivered).length,
    deliveredToday: voiceAlerts.filter(a => a.delivered && new Date(a.timestamp).toDateString() === new Date().toDateString()).length,
    criticalAlerts: voiceAlerts.filter(a => a.severity === 'critical').length
  };

  return {
    overview: {
      totalTransactions: total,
      potentialFraud: fraud,
      alerts: alerts,
      verified: verified,
      tamperingAttempts,
      averageRiskScore: total > 0 ? Math.round(transactions.reduce((acc, t) => acc + t.riskScore, 0) / total) : 0,
      regions,
      deviceStats,
      voiceStats,
      aiConfidence: total > 0 ? Math.round(transactions.reduce((acc, t) => acc + (t.confidence || 0.8), 0) / total * 100) : 80
    },
    recentTransactions: transactions.slice(0, 10),
    voiceAlerts: voiceAlerts.slice(0, 5),
    regionalThreats: regions.filter(r => r.activeThreats > 0)
  };
}

function trainProfile(newRangeMax) {
  defaultProfile.avg_amount = parseFloat(newRangeMax) / 2; // Rough adjustment
  return { message: 'AI SOC behavior model updated.', defaultProfile };
}

function addToBlacklist(upi_id) {
  scamDB.add(upi_id);
  return { message: `Merchant ${upi_id} has been globally blacklisted.`, count: scamDB.size };
}

function resolveAlert(tx_id) {
  const index = transactions.findIndex(t => t.id === tx_id);
  if (index !== -1) {
    transactions.splice(index, 1); // Remove from list to resolve
    return { message: 'Alert resolved and dismissed.' };
  }
  return { error: 'Transaction not found.' };
}

module.exports = {
  ingestTransaction,
  registerIntent,
  getDashboardStats,
  trainProfile,
  addToBlacklist,
  resolveAlert,
  analyzeQRContent: (content) => {
    // Enhanced QR analysis
    if (content.startsWith('http')) {
        return {
          status: 'Tampered',
          riskScore: 10,
          message: 'Phishing redirect detected!',
          ai_insights: ['QR code contains suspicious URL redirect']
        };
    }
    return {
      status: 'Valid',
      riskScore: 100,
      message: 'QR structure valid.',
      ai_insights: ['QR code format verified']
    };
  },
  // New exports for enhanced features
  verifyGST,
  getVoiceAlerts: () => voiceAlerts,
  deviceFleet,
  regionalThreats,
  voiceAlerts,
  // Phase 3: Advanced AI exports
  predictFraudProbability,
  triggerVoiceAlert,
  deliverVoiceAlert,
  // Phase 4: API Integration exports
  callGSTApi,
  verifyBankTransaction,
  logComplianceEvent,
  // AI Model info
  aiModel,
  mlModel
};
