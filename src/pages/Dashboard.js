import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import mqttService from '../services/mqttService';

const Dashboard = () => {
  const { username } = useAuth();
  const [gsrValue, setGsrValue] = useState(0);
  const [hrValue, setHrValue] = useState(0);
  const [stressLevel, setStressLevel] = useState('Low');
  const [gsrData, setGsrData] = useState(Array.from({length: 30}, () => 0));
  const [hrData, setHrData] = useState(Array.from({length: 30}, () => 0));
  const [mqttConnected, setMqttConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [lastValidData, setLastValidData] = useState({
    gsr: 0,
    heartRate: 0,
    timestamp: Date.now()
  });

  // MQTT data subscription
  useEffect(() => {
    // Connect to MQTT service
    mqttService.connect();
    
    // Subscribe to sensor data updates
    const subscriptionId = mqttService.subscribe((event, data) => {
      if (event === 'sensorData') {
        const { gsr, heartRate, timestamp } = data;
        
        // Process only real Arduino data - no random values
        console.log(`📊 Dashboard received raw data: GSR=${gsr}, HR=${heartRate}`);
        
        // Convert to numbers and handle null/undefined
        const gsrNum = gsr !== undefined && gsr !== null && !isNaN(gsr) ? Number(gsr) : 0;
        const hrNum = heartRate !== undefined && heartRate !== null && !isNaN(heartRate) ? Number(heartRate) : 0;
        
        // Filter out "no connection" values (GSR 183-195, HR 0)
        if ((gsrNum >= 183 && gsrNum <= 195) && hrNum === 0) {
          console.log('🚫 No connection detected, skipping update');
          return;
        }
        
        const newData = {
          gsr: gsrNum,
          heartRate: hrNum,
          timestamp: timestamp || Date.now()
        };
        
        console.log(`📊 Dashboard processing real Arduino data: GSR=${newData.gsr}, HR=${newData.heartRate}`);
        
        // Update immediately - no delay
        console.log(`📊 Dashboard updating display immediately: GSR=${newData.gsr}, HR=${newData.heartRate}`);
        setGsrValue(newData.gsr);
        setHrValue(newData.heartRate);
        setLastUpdate(new Date(newData.timestamp));
        setLastValidData(newData);
        
        // Updated stress calculation based on Arduino logic
        let gsrStatus, hrStatus;
        
        // GSR status (Arduino logic: 185-195 = no connection, <446 = relaxed, <=542 = moderate, >542 = stressed)
        const gsrVal = newData.gsr;
        const hrVal = newData.heartRate;
      
        if (gsrVal >= 185 && gsrVal <= 195) gsrStatus = "No connection";
        else if (gsrVal < 446) gsrStatus = "Relaxed";
        else if (gsrVal <= 542) gsrStatus = "Moderate";
        else gsrStatus = "Stressed";
        
        // Heart rate status
        if (hrVal === 0) hrStatus = "No connection";
        else if (hrVal < 80) hrStatus = "Relaxed";
        else if (hrVal <= 90) hrStatus = "Moderate";
        else if (hrVal > 100) hrStatus = "Stressed";
        else hrStatus = "Moderate";
        
        // Final stress level calculation
        let newStressLevel;
        if (gsrStatus === "No connection" || hrStatus === "No connection") {
          newStressLevel = "No connection detected";
        } else if (gsrStatus === "Relaxed" && hrStatus === "Relaxed") {
          newStressLevel = "Relaxed";
        } else if ((gsrStatus === "Moderate" && hrStatus === "Moderate")) {
          newStressLevel = "Moderate Stress";
        } else if (gsrStatus === "Stressed" || hrStatus === "Stressed") {
          newStressLevel = "High Stress";
        } else {
          newStressLevel = "Moderate Stress";
        }
        
        setStressLevel(newStressLevel);
        
        // Update chart data with real Arduino values only
        setGsrData(prev => {
          const chartData = [...prev, newData.gsr];
          return chartData.slice(-30);
        });
        setHrData(prev => {
          const chartData = [...prev, newData.heartRate];
          return chartData.slice(-30);
        });
      } else if (event === 'connected') {
        setMqttConnected(data.connected);
      } else if (event === 'error') {
        setMqttConnected(false);
        console.error('MQTT connection error:', data.error);
      }
    });

    // Cleanup on unmount
    return () => {
      mqttService.unsubscribe(subscriptionId);
    };
  }, []);

  // Fallback: fetch initial data if MQTT is not connected
  useEffect(() => {
    if (!mqttConnected) {
      const fetchData = async () => {
        const data = await mqttService.fetchSensorData();
        if (data) {
          // Set values with fallback to 0 for null/undefined
          setGsrValue(data.gsr !== undefined && data.gsr !== null && !isNaN(data.gsr) ? data.gsr : 0);
          setHrValue(data.heartRate !== undefined && data.heartRate !== null && !isNaN(data.heartRate) ? data.heartRate : 0);
          setLastUpdate(new Date(data.timestamp));
        }
      };
      fetchData();
    }
  }, [mqttConnected]);


  const getStressColor = (level) => {
    switch(level) {
      case 'High': return '#ef4444';
      case 'Medium': return '#f59e0b';
      default: return '#22c55e';
    }
  };

  // Build smooth area chart path (SVG) – no extra deps
  const buildAreaPath = (data, height, yMax, yMin = 0) => {
    const arr = data.slice(-24);
    const n = arr.length;
    if (n < 2) return { path: '', linePath: '' };
    const w = 360;
    const h = height - 16;
    const pad = 8;
    const range = yMax - yMin || 1;
    const x = i => pad + (i / (n - 1)) * (w - pad * 2);
    const y = v => pad + (h - 2 * pad) - ((v - yMin) / range) * (h - 2 * pad);
    let linePath = `M ${x(0)} ${y(arr[0])}`;
    for (let i = 1; i < n; i++) {
      const x0 = x(i - 1), x1 = x(i);
      const y0 = y(arr[i - 1]), y1 = y(arr[i]);
      const cpX = (x0 + x1) / 2;
      linePath += ` Q ${cpX} ${y0}, ${x1} ${y1}`;
    }
    const areaPath = `${linePath} L ${x(n - 1)} ${h - pad} L ${x(0)} ${h - pad} Z`;
    return { path: areaPath, linePath };
  };

  const gsrMax = Math.max(600, ...gsrData);
  const hrMax = Math.max(120, ...hrData);
  const hrMin = Math.min(60, ...hrData.filter(Boolean)) || 60;
  const gsrChart = buildAreaPath(gsrData, 200, gsrMax, 0);
  const hrChart = buildAreaPath(hrData, 200, hrMax, hrMin);

  return (
    <div className="section">
      <div className="container">
        <div style={{textAlign: 'center', marginBottom: '48px'}}>
          <h1 style={{fontSize: '48px', fontWeight: '700', marginBottom: '16px'}}>
            Welcome to your Dashboard, {username}!
          </h1>
          <p style={{fontSize: '18px', color: 'var(--muted)', marginBottom: '16px'}}>
            Monitor your wellness metrics and access mental health tools
          </p>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: mqttConnected ? '#22c55e' : '#ef4444'
            }}></div>
            <span style={{fontSize: '14px', color: 'var(--muted)'}}>
              {mqttConnected ? 'MQTT Connected' : 'MQTT Disconnected'}
            </span>
            {lastUpdate && (
              <span style={{fontSize: '12px', color: 'var(--muted)', marginLeft: '16px'}}>
                Last update: {lastUpdate.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>

        {/* KPI Cards */}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '48px'}}>
          <div className="card" style={{textAlign: 'center', padding: '24px'}}>
            <h3 style={{margin: '0 0 8px', color: 'var(--text)'}}>Stress Level</h3>
            <div style={{fontSize: '32px', fontWeight: '700', color: getStressColor(stressLevel)}}>
              {stressLevel}
            </div>
            <p style={{margin: '8px 0 0', fontSize: '14px', color: 'var(--muted)'}}>Current Status</p>
          </div>
          
          <div className="card" style={{textAlign: 'center', padding: '24px'}}>
            <h3 style={{margin: '0 0 8px', color: 'var(--text)'}}>GSR</h3>
            <div style={{fontSize: '32px', fontWeight: '700', color: 'var(--accent)'}}>
              {gsrValue.toFixed(0)}
            </div>
            <p style={{margin: '8px 0 0', fontSize: '14px', color: 'var(--muted)'}}>Ω (Ohms)</p>
          </div>
          
          <div className="card" style={{textAlign: 'center', padding: '24px'}}>
            <h3 style={{margin: '0 0 8px', color: 'var(--text)'}}>Heart Rate</h3>
            <div style={{fontSize: '32px', fontWeight: '700', color: 'var(--primary)'}}>
              {Math.round(hrValue)}
            </div>
            <p style={{margin: '8px 0 0', fontSize: '14px', color: 'var(--muted)'}}>BPM</p>
          </div>
        </div>

        {/* Charts Section – smooth area charts */}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '48px'}}>
          <div className="card" style={{padding: '24px', overflow: 'hidden'}}>
            <h3 style={{margin: '0 0 16px', color: 'var(--text)'}}>GSR Over Time</h3>
            <div style={{height: '200px', background: 'var(--surface)', borderRadius: '12px', padding: '16px'}}>
              <svg width="100%" height="200" viewBox="0 0 360 200" preserveAspectRatio="xMidYMid meet" style={{display: 'block'}}>
                <defs>
                  <linearGradient id="gsrGrad" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor="rgba(34, 211, 238, 0.35)" />
                    <stop offset="100%" stopColor="rgba(34, 211, 238, 0.02)" />
                  </linearGradient>
                </defs>
                <path fill="url(#gsrGrad)" d={gsrChart.path} />
                <path fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d={gsrChart.linePath} />
              </svg>
            </div>
          </div>
          <div className="card" style={{padding: '24px', overflow: 'hidden'}}>
            <h3 style={{margin: '0 0 16px', color: 'var(--text)'}}>Heart Rate Over Time</h3>
            <div style={{height: '200px', background: 'var(--surface)', borderRadius: '12px', padding: '16px'}}>
              <svg width="100%" height="200" viewBox="0 0 360 200" preserveAspectRatio="xMidYMid meet" style={{display: 'block'}}>
                <defs>
                  <linearGradient id="hrGrad" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor="rgba(59, 130, 246, 0.4)" />
                    <stop offset="100%" stopColor="rgba(59, 130, 246, 0.03)" />
                  </linearGradient>
                </defs>
                <path fill="url(#hrGrad)" d={hrChart.path} />
                <path fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d={hrChart.linePath} />
              </svg>
            </div>
          </div>
        </div>


        {/* Feature Cards */}
        <div className="cards" style={{gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))'}}>
          <div className="card" style={{textAlign: 'center', padding: '32px'}}>
            <div style={{fontSize: '48px', marginBottom: '16px'}}>🎵</div>
            <h3>Music Therapy</h3>
            <p style={{marginBottom: '24px'}}>Relaxing music to help calm your mind and reduce stress</p>
            <Link className="btn btn-primary" to="/music">Open Music</Link>
          </div>

          <div className="card" style={{textAlign: 'center', padding: '32px'}}>
            <div style={{fontSize: '48px', marginBottom: '16px'}}>🤖</div>
            <h3>AI Chatbot - Aimee</h3>
            <p style={{marginBottom: '24px'}}>Talk to our friendly AI companion for emotional support</p>
            <Link className="btn btn-primary" to="/chatbot">Chat with Aimee</Link>
          </div>

          <div className="card" style={{textAlign: 'center', padding: '32px'}}>
            <div style={{fontSize: '48px', marginBottom: '16px'}}>🧘</div>
            <h3>Meditation & Yoga</h3>
            <p style={{marginBottom: '24px'}}>Guided meditation and yoga sessions for mindfulness</p>
            <Link className="btn btn-primary" to="/meditation-yoga">Start Session</Link>
          </div>

          <div className="card" style={{textAlign: 'center', padding: '32px'}}>
            <div style={{fontSize: '48px', marginBottom: '16px'}}>💆</div>
            <h3>Relaxation Exercises</h3>
            <p style={{marginBottom: '24px'}}>Breathing exercises and relaxation techniques</p>
            <Link className="btn btn-primary" to="/relaxation-exercises">Try Exercises</Link>
          </div>

          <div className="card" style={{textAlign: 'center', padding: '32px'}}>
            <div style={{fontSize: '48px', marginBottom: '16px'}}>👨‍⚕️</div>
            <h3>Meet a Counselor</h3>
            <p style={{marginBottom: '24px'}}>Connect with professional mental health counselors</p>
            <Link className="btn btn-primary" to="/meet-counselor">Find Counselor</Link>
          </div>
        </div>

        <div style={{textAlign: 'center', marginTop: '48px'}}>
          <Link to="/" className="btn btn-outline">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
