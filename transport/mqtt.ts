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
  const { emit, on, off } = emitter();

  const mqttEmit: Transport['emit'] = (
    data, { qos, topic }
  ) => new Promise((resolve, reject) => {
    client.publish(topic, data, { qos: qos || 0, retain: false }, e => e ? reject(e) : resolve(data.length));
  });

  const onMessage = (topic: string, data: Buffer) => {
    emit('data', data, { topic });
  };

  const connect: Transport['connect'] = () => new Promise((resolve, reject) => {
    client = mqttConnect(url, opts);
    client.on('error', reject);
    client.on('message', onMessage);

    const onConnect = () => {
      client.subscribe(topics);

      client.off('connect', onConnect);
      client.off('error', reject);
      resolve();
    }

    client.on('connect', onConnect);
  });

  const disconnect: Transport['disconnect'] = () => new Promise(resolve => {
    client.unsubscribe(topics);
    client.off('message', onMessage);
    client.end(true, null, resolve);
  });

  return {
    context: true,
    connect, disconnect,
    emit: mqttEmit, on, off
  }
}
