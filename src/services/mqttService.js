import { mqttConfig } from '../config/mqttConfig.js';

class MQTTService {
  constructor() {
    this.isConnected = false;
    this.eventSource = null;
    this.subscribers = new Map();
    this.sensorData = {
      gsr: 0,
      heartRate: 0,
      timestamp: Date.now()
    };
  }

  connect() {
    try {
      // Use Server-Sent Events for real-time data streaming
      this.eventSource = new EventSource(`${mqttConfig.apiUrl}/api/sensor-stream`);
      
      this.eventSource.onopen = () => {
        console.log('✅ MQTT Service connected via SSE');
        this.isConnected = true;
        this.notifySubscribers('connected', { connected: true });
      };

      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          // Keep exact Arduino values - handle null/undefined properly
          const safeData = {
            gsr: data.gsr !== undefined && data.gsr !== null ? data.gsr : 0,
            heartRate: data.heartRate !== undefined && data.heartRate !== null ? data.heartRate : 0,
            timestamp: data.timestamp || Date.now()
          };
          
          // Always update with latest Arduino data
          this.sensorData = safeData;
          console.log(`📥 Frontend received: GSR=${safeData.gsr}, HR=${safeData.heartRate}`);
          this.notifySubscribers('sensorData', safeData);
        } catch (error) {
          console.error('Error parsing sensor data:', error);
        }
      };

      this.eventSource.onerror = (error) => {
        console.error('❌ MQTT Service error:', error);
        this.isConnected = false;
        this.notifySubscribers('error', { error: 'Connection failed' });
        
        // Attempt to reconnect after 5 seconds
        setTimeout(() => {
          if (!this.isConnected) {
            this.connect();
          }
        }, 5000);
      };

    } catch (error) {
      console.error('Failed to connect to MQTT service:', error);
      this.isConnected = false;
    }
  }

  subscribe(callback) {
    const id = Math.random().toString(36).substr(2, 9);
    this.subscribers.set(id, callback);
    
    // Send current data immediately if available
    if (this.sensorData.gsr > 0 || this.sensorData.heartRate > 0) {
      callback('sensorData', this.sensorData);
    }
    
    return id;
  }

  unsubscribe(id) {
    this.subscribers.delete(id);
  }

  notifySubscribers(event, data) {
    this.subscribers.forEach(callback => {
      try {
        callback(event, data);
      } catch (error) {
        console.error('Error in subscriber callback:', error);
      }
    });
  }

  getCurrentSensorData() {
    return this.sensorData;
  }

  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.isConnected = false;
    this.subscribers.clear();
  }

  // Fallback method to fetch data via REST API
  async fetchSensorData() {
    try {
      const response = await fetch(`${mqttConfig.apiUrl}/api/sensor-data`);
      if (response.ok) {
        const data = await response.json();
        // Keep exact Arduino values - handle null/undefined properly
        const safeData = {
          gsr: data.gsr !== undefined && data.gsr !== null ? data.gsr : 0,
          heartRate: data.heartRate !== undefined && data.heartRate !== null ? data.heartRate : 0,
          timestamp: data.timestamp || Date.now()
        };
        
        // Always update with latest data
        this.sensorData = safeData;
        this.notifySubscribers('sensorData', safeData);
        return safeData;
      }
    } catch (error) {
      console.error('Failed to fetch sensor data:', error);
    }
    return null;
  }
}

// Create singleton instance
const mqttService = new MQTTService();

export default mqttService;
