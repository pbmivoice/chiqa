import { createServer } from 'http';
import WebSocket from 'ws';
import dotenv from 'dotenv';
import { Subscription, MessageParser, WsMessageFactory } from '.';
import { assert } from 'console';

dotenv.config();
const { CHIQA_PORT } = process.env;
assert(CHIQA_PORT, 'CHIQA_PORT is required');

const server = createServer();
const wss = new WebSocket.Server({ server });

const sockets: { ws: WebSocket; subscriptions: Subscription[] }[] = [];

wss.on('connection', ws => {
  sockets.push({ ws, subscriptions: [] });

  ws.onmessage = message => {
    const msg = MessageParser(message.data.toString());
    if ('match' in msg) {
      sockets.find(s => s.ws === ws)?.subscriptions.push(msg);
      return;
    }
    sockets.forEach(s => {
      s.subscriptions.forEach(sub => {
        if (sub.match === 'any') {
          s.ws.send(WsMessageFactory(msg));
        } else {
          const msgKeys = Object.keys(msg.topic);
          const subKeys = Object.keys(sub.keys);
          const matches = subKeys.filter(
            key => msg.topic[key] === sub.keys[key],
          );
          const hasAll = matches.length === subKeys.length;
          const send =
            sub.match === 'exactly'
              ? hasAll && subKeys.length === msgKeys.length
              : sub.match === 'has all'
              ? hasAll
              : matches.length > 0;

          if (send) s.ws.send(WsMessageFactory(msg));
        }
      });
    });
  };

  ws.on('close', () => {
    const socketIdx = sockets.findIndex(s => s.ws === ws);
    sockets.splice(socketIdx, 1);
  });
});

server.listen(CHIQA_PORT, () => {
  console.log(`Chiqa on port ${CHIQA_PORT}`);
});
