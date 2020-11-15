import { connect as mqttConnect, IClientOptions, MqttClient } from 'mqtt'

import { Transport, TransportFn } from './types'
import { emitter } from '../util'

type MqttConfig = IClientOptions & {
  url: string
  topics?: string[]
}

interface MqttContext {
  qos?: number
  topic: string
}

export const mqtt: TransportFn<MqttConfig, MqttContext> = async ({
  url, topics, ...opts
}) => {
  let client: MqttClient = null;
  const { emit, on } = emitter();

  const mqttEmit: Transport['emit'] = (
    data, { qos, topic }
  ) => new Promise((resolve, reject) => {
    client.publish(topic, data, { qos: qos || 0, retain: false }, (e, p) => e ? reject(e) : resolve(p.length));
  });

  const connect: Transport['connect'] = () => new Promise((resolve, reject) => {
    client = mqttConnect(url, opts);
    client.on('error', reject);
    client.on('message', (topic, data) => {
      emit('data', data, { topic });
    });
    client.on('connect', () => {
      for (const topic of topics) {
        client.subscribe(topic);
      }
      resolve();
    });
  });

  await connect();

  return {
    context: true,
    connect,
    emit: mqttEmit,
    on
  }
}
