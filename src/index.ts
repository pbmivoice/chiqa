import { BrokerClientContext, BrokerClient } from './client';
import { uuidv7 } from 'uuidv7';
export { BrokerClientContext, BrokerClient, uuidv7 };

export type Subscription =
  | {
      match: 'exactly' | 'has all' | 'has some';
      keys: { [key: string]: string };
    }
  | { match: 'any' };

export type Message = {
  uuid: string;
  topic: { [key: string]: string };
  payload?: any;
  subMessage?: Omit<Message, 'uuid'>;
  signature?: string;
};

export const WsMessageFactory = (message: Message | Subscription) => {
  return Buffer.from(JSON.stringify(message), 'utf8');
};

export const MessageParser = (message: string) => {
  const obj = JSON.parse(message);
  if ('match' in obj) {
    return obj as Subscription;
  }
  return obj as Message;
};
