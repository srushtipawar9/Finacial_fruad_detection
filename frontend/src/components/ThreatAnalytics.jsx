import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid, Legend, AreaChart, Area } from 'recharts';
import { BarChart2, PieChart as PieChartIcon, Activity } from 'lucide-react';

const API_URL = 'https://finacial-fruad-detection.onrender.com/api/soc';

const ThreatAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_URL}/dashboard/stats`);
        setData(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="text-secondary" style={{ padding: '2rem' }}>Loading Analytics...</div>;

  const regions = data.overview.regions || [];
  
  // Process data for charts
  const barData = regions.map(r => ({ name: r.name, cases: r.risk })).sort((a,b) => b.cases - a.cases);

  // Derive risk levels based on count values
  let high = 0, medium = 0, low = 0;
  regions.forEach(r => {
    if (r.risk > 15) high += r.risk;
    else if (r.risk > 8) medium += r.risk;
    else low += r.risk;
  });

  const pieData = [
    { name: 'High/Critical', value: high, color: '#ef4444' }, // var(--status-fraud)
    { name: 'Medium', value: medium, color: '#f59e0b' },      // var(--status-warning)
    { name: 'Low', value: low, color: '#10b981' }             // var(--status-verified)
  ];

  // Dummy timeline data for trend visualization
  const timelineData = [
    { time: '00:00', threats: Math.floor(Math.random() * 20) + 10 },
    { time: '04:00', threats: Math.floor(Math.random() * 20) + 5 },
    { time: '08:00', threats: Math.floor(Math.random() * 40) + 20 },
    { time: '12:00', threats: Math.floor(Math.random() * 60) + 30 },
    { time: '16:00', threats: Math.floor(Math.random() * 50) + 25 },
    { time: '20:00', threats: Math.floor(Math.random() * 30) + 15 },
    { time: '24:00', threats: Math.floor(Math.random() * 20) + 10 },
  ];

  return (
    <div className="fade-in">
      <header style={{ marginBottom: '2rem' }}>
        <h1>Threat Visualization & Analytics</h1>
        <p className="text-secondary">Visual breakdown of threat logs by city, severity level, and historical trends.</p>
      </header>

      <div className="dashboard-grid">
        
        {/* Severity Pie Chart */}
        <div className="glass-panel col-span-4" style={{ minHeight: '400px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <PieChartIcon size={22} className="text-warning" /> Severity Distribution
          </h3>
          <p className="text-secondary" style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>Overall threat logs categorized by risk level (High, Medium, Low).</p>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f0f14', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} 
                itemStyle={{ color: '#fff' }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Region Bar Chart */}
        <div className="glass-panel col-span-8" style={{ minHeight: '400px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <BarChart2 size={22} className="text-verified" /> Threats by Region (City/Country)
          </h3>
          <p className="text-secondary" style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>Active threat volume segmented by geographical location.</p>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" stroke="#a0a0b0" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#a0a0b0" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.05)' }} 
                contentStyle={{ backgroundColor: '#0f0f14', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} 
              />
              <Bar dataKey="cases" fill="url(#colorCases)" radius={[4, 4, 0, 0]} maxBarSize={50} />
              <defs>
                <linearGradient id="colorCases" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Timeline Area Chart */}
        <div className="glass-panel col-span-12" style={{ minHeight: '350px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <Activity size={22} className="text-fraud" /> Daily Threat Trend
          </h3>
          <p className="text-secondary" style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>Volume of blocked threat attempts over the last 24 hours.</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={timelineData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorThreats" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="#a0a0b0" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#a0a0b0" fontSize={12} tickLine={false} axisLine={false} />
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f0f14', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} 
              />
              <Area type="monotone" dataKey="threats" stroke="#ef4444" fillOpacity={1} fill="url(#colorThreats)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
};

export default ThreatAnalytics;
