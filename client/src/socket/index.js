import { io } from 'socket.io-client';

const URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8888';

export const socket = io(URL, { autoConnect: false });