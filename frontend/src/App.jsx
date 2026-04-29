import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Shield, Smartphone, Activity, BellRing, Map as MapIcon, ShieldCheck, Wrench } from 'lucide-react';
import Dashboard from './components/Dashboard';
import EndpointSimulator from './components/EndpointSimulator';
import AlertsManager from './components/AlertsManager';
import FraudMap from './components/FraudMap';
import DeviceHealth from './components/DeviceHealth';
import MobileAgent from './components/MobileAgent';
import ThreatAnalytics from './components/ThreatAnalytics';
import { PieChart as PieChartIcon } from 'lucide-react';

function Sidebar() {
  const location = useLocation();
  
  return (
    <div className="sidebar">
      <div className="brand">
        <Shield size={28} className="text-verified" />
        <div style={{ lineHeight: 1.1 }}>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)', fontWeight: '500' }}>Financial</div>
          <div style={{ fontSize: '1.1rem', fontWeight: '800', letterSpacing: '-0.02em' }}>AI SOC</div>
        </div>
      </div>
      
      <div className="nav-links">
        <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>
          <Activity size={20} />
          <span>Overview</span>
        </Link>
        <Link to="/alerts" className={`nav-item ${location.pathname === '/alerts' ? 'active' : ''}`}>
          <BellRing size={20} />
          <span>Threat Alerts</span>
        </Link>
        <Link to="/map" className={`nav-item ${location.pathname === '/map' ? 'active' : ''}`}>
          <MapIcon size={20} />
          <span>Global Heatmap</span>
        </Link>
        <Link to="/edr" className={`nav-item ${location.pathname === '/edr' ? 'active' : ''}`}>
          <ShieldCheck size={20} />
          <span>EDR Health</span>
        </Link>
        <Link to="/analytics" className={`nav-item ${location.pathname === '/analytics' ? 'active' : ''}`}>
          <PieChartIcon size={20} />
          <span>Threat Analytics</span>
        </Link>
        <Link to="/mobile-agent" className={`nav-item ${location.pathname === '/mobile-agent' ? 'active' : ''}`}>
          <Smartphone size={20} />
          <span>Mobile Agent</span>
        </Link>
        <Link to="/simulator" className={`nav-item ${location.pathname === '/simulator' ? 'active' : ''}`}>
          <Wrench size={20} />
          <span>Legacy Simulator</span>
        </Link>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/alerts" element={<AlertsManager />} />
            <Route path="/map" element={<FraudMap />} />
            <Route path="/edr" element={<DeviceHealth />} />
            <Route path="/analytics" element={<ThreatAnalytics />} />
            <Route path="/mobile-agent" element={<MobileAgent />} />
            <Route path="/simulator" element={<EndpointSimulator />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
