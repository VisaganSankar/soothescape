export const mqttConfig = {
  apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  
  // CHANGE THIS LINE: Use your IPv4 address
  brokerUrl: process.env.REACT_APP_MQTT_BROKER_URL || 'mqtt://10.228.247.68:1883',
  
  clientId: process.env.REACT_APP_MQTT_CLIENT_ID || 'soothescape-frontend',
  topics: {
    gsr: 'sensors/gsr',
    heartRate: 'sensors/hr',
    status: 'sensors/status'
  },
  reconnectInterval: 5000,
  maxReconnectAttempts: 10
};