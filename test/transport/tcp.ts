import { MCom } from '../../mcom'

const start = async () => {
  const tcp = await MCom({
    protocol: 'Buf',
    transport: 'Tcp',
    config: {
      ip: '192.168.0.138',
      port: 2222,
      type: 'server'
    }
  });

  console.log('connecting client...');
  const cli = await MCom({
    protocol: 'Buf',
    transport: 'Tcp',
    config: {
      ip: '192.168.0.138',
      port: 2222,
      type: 'client'
    }
  });

  tcp.on((data, ctx) => {
    setTimeout(() => {
      tcp.emit(Buffer.from(`reply: ${data.toString()}`), ctx);
    }, 500);
  });

  cli.emit(Buffer.from('hoi'));
  cli.on(data => {
    console.log(`received ${data.toString()}`);
    setTimeout(() => {
      cli.emit(Buffer.from('hoi'));
    }, 500);
  });
}
start();
