import { uuidv7 } from 'uuidv7';
import { Message, MessageParser, Subscription, WsMessageFactory } from '.';

export type BrokerClientContext = {
  subscribe: (subscription: Subscription) => void;
  send: (message: Omit<Message, 'uuid'>) => void;
};

export const BrokerClient = (
  url: `ws://${string}:${number}`,
  onReady: (ctx: BrokerClientContext) => void,
  onMessage: (message: Message, ctx: BrokerClientContext) => Promise<void>,
  onError?: (error: unknown) => void,
) => {
  const ws = new WebSocket(url);

  const context: BrokerClientContext = {
    subscribe: subscription => ws.send(WsMessageFactory(subscription)),
    send: message => {
      const uuid = uuidv7();
      ws.send(WsMessageFactory({ ...message, uuid }));
    },
  };

  ws.onmessage = async message => {
    const parsed = MessageParser(await message.data.text());
    if ('match' in parsed) return;
    try {
      await onMessage(parsed, context);
    } catch (e) {
      onError?.(e);
    }
  };

  ws.onopen = () => onReady(context);

  return context;
};
