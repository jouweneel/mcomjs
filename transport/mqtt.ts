import { connect as mqttConnect, IClientOptions, MqttClient } from 'mqtt'
import { emitter } from '../util';
import { Transport, TransportFn } from './types'

type MqttConfig = IClientOptions & {
  url: string
  topics?: string[]
}

interface MqttContext {
  qos?: number
  topic: string
}

export const Mqtt: TransportFn<MqttConfig, MqttContext> = async ({
  url, topics, ...opts
}) => {
  let client: MqttClient = null;
  const { emit, on } = emitter();

  const mqttEmit: Transport['emit'] = (
    data, { qos, topic }
  ) => new Promise((resolve, reject) => {
    client.publish(topic, data, { qos: qos || 1 }, e => e ? reject(e) : resolve());
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
    connect,
    emit: mqttEmit,
    on
  }
}
