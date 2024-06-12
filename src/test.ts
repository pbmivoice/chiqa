import { BrokerClient, BrokerClientContext, Message } from '.';

const onReady = (ctx: BrokerClientContext) => {
  ctx.subscribe({ match: 'has all', keys: { type: 'test' } });
  setTimeout(() => {
    ctx.send({
      topic: { type: 'test' },
      payload: { message: 'hello world' },
    });
  }, 1000);
};

const onMessage = async (message: Message) => {
  console.log('message received:', message);
};

BrokerClient('ws://localhost:3000', onReady, onMessage);
