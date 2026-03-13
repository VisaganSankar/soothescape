import mqtt from 'mqtt';
import { mqttConfig } from '../config/mqttConfig.js';

class MQTTBroker {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.subscribers = new Map();
    this.sensorData = {
      gsr: 0,
      heartRate: 0,
      timestamp: Date.now()
    };
    this.hasReceivedData = false;
    this.lastPublishedData = null;
    this.dataBuffer = {
      gsr: 0,
      heartRate: 0,
      timestamp: Date.now()
    };
    this.updateTimeout = null;
  }

  connect() {
    const options = {
      ...mqttConfig.options,
      clientId: `${mqttConfig.clientId}-${Math.random().toString(16).substr(2, 8)}`,
      username: mqttConfig.username,
      password: mqttConfig.password,
    };

    this.client = mqtt.connect(mqttConfig.brokerUrl, options);

    this.client.on('connect', () => {
      console.log('✅ MQTT Broker connected');
      this.isConnected = true;
      this.subscribeToTopics();
      this.startSensorDataSimulation();
    });

    this.client.on('error', (error) => {
      console.error('❌ MQTT Broker error:', error);
      this.isConnected = false;
    });

    this.client.on('close', () => {
      console.log('🔌 MQTT Broker disconnected');
      this.isConnected = false;
    });

    this.client.on('message', (topic, message) => {
      this.handleMessage(topic, message);
    });
  }

  subscribeToTopics() {
    const topics = [
      mqttConfig.topics.gsr,
      mqttConfig.topics.heartRate,
      mqttConfig.topics.status
    ];

    topics.forEach(topic => {
      this.client.subscribe(topic, (err) => {
        if (err) {
          console.error(`Failed to subscribe to ${topic}:`, err);
        } else {
          console.log(`📡 Subscribed to ${topic}`);
        }
      });
    });
  }

  handleMessage(topic, message) {
    try {
      const messageStr = message.toString();
      let value;
      
      // Arduino sends raw integers, not JSON
      if (messageStr.startsWith('{')) {
        // JSON format (fallback)
        const data = JSON.parse(messageStr);
        value = data.value;
      } else {
        // Raw integer format (Arduino)
        value = parseInt(messageStr);
      }
      
      const now = Date.now();
      
      this.hasReceivedData = true;
      
      switch (topic) {
        case mqttConfig.topics.gsr:
          this.dataBuffer.gsr = value;
          this.dataBuffer.timestamp = now;
          console.log(`📊 GSR from Arduino: ${value} (type: ${typeof value})`);
          this.debouncedPublish();
          break;
        case mqttConfig.topics.heartRate:
          this.dataBuffer.heartRate = value;
          this.dataBuffer.timestamp = now;
          console.log(`❤️ Heart Rate from Arduino: ${value} BPM (type: ${typeof value})`);
          this.debouncedPublish();
          break;
        case mqttConfig.topics.status:
          console.log('Sensor status:', messageStr);
          break;
      }
    } catch (error) {
      console.error('Error parsing MQTT message:', error);
    }
  }

  startSensorDataSimulation() {
    // No simulation - only real Arduino data
    console.log('📡 Waiting for real Arduino sensor data...');
    console.log('🚫 No simulation enabled - only real sensor data will be displayed');
  }

  publishSensorData(topic, data) {
    if (this.isConnected) {
      this.client.publish(topic, JSON.stringify(data), (err) => {
        if (err) {
          console.error(`Failed to publish to ${topic}:`, err);
        }
      });
    }
  }

  subscribeToSensorData(callback) {
    const id = Math.random().toString(36).substr(2, 9);
    this.subscribers.set(id, callback);
    return id;
  }

  unsubscribeFromSensorData(id) {
    this.subscribers.delete(id);
  }

  debouncedPublish() {
    // Publish immediately - no delay
    this.sensorData = { ...this.dataBuffer };
    console.log(`📤 Backend sending to frontend immediately: GSR=${this.sensorData.gsr}, HR=${this.sensorData.heartRate}`);
    this.publishToSubscribers('sensorData', this.sensorData);
  }

  publishToSubscribers(event, data) {
    // Always publish the latest data from Arduino
    this.subscribers.forEach(callback => {
      try {
        callback(event, data);
      } catch (error) {
        console.error('Error in subscriber callback:', error);
      }
    });
  }

  getCurrentSensorData() {
    // Only return data if we've received real Arduino data
    if (this.hasReceivedData) {
      return this.sensorData;
    } else {
      // Return zero values if no Arduino data received yet
      return {
        gsr: 0,
        heartRate: 0,
        timestamp: Date.now()
      };
    }
  }

  disconnect() {
    if (this.client) {
      this.client.end();
    }
  }
}

export default MQTTBroker;
