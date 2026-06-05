'use client';

import Cookies from 'js-cookie';
import { io } from 'socket.io-client';

let socketInstance = null;
let socketToken = null;

export function getSocket() {
  const token = Cookies.get('accessToken');
  if (!token) return null;

  if (!socketInstance) {
    socketInstance = io('/', {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      auth: { token },
    });
    socketToken = token;
  }

  if (socketToken !== token) {
    socketInstance.auth = { token };
    socketToken = token;
    if (socketInstance.connected) {
      socketInstance.disconnect();
    }
  }

  if (!socketInstance.connected) {
    socketInstance.connect();
  }

  return socketInstance;
}

export function closeSocket() {
  if (!socketInstance) return;
  socketInstance.disconnect();
  socketInstance = null;
  socketToken = null;
}
