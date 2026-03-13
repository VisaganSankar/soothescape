export const mqttConfig = {
  // Default to a public test broker (no need to run Mosquitto on your PC)
  // You can override via MQTT_BROKER_URL in backend environment.
  brokerUrl: process.env.MQTT_BROKER_URL || 'mqtt://test.mosquitto.org:1883',
  clientId: process.env.MQTT_CLIENT_ID || 'soothescape-backend',
  username: process.env.MQTT_USERNAME || '',
  password: process.env.MQTT_PASSWORD || '',
  topics: {
    // Match the topics your ESP8266 publishes in your Arduino code
    gsr: 'project/stress/gsr_score',
    heartRate: 'project/stress/heartrate',
    status: 'project/stress/status'
  },
  options: {
    clean: true,
    reconnectPeriod: 1000,
    connectTimeout: 30 * 1000,
    keepalive: 60,
    qos: 1
  }
};
