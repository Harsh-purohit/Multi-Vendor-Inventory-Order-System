import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:3000"; // change if your backend is elsewhere

const socket = io(SOCKET_URL, {
  transports: ["websocket"],
  autoConnect: true
});

export default socket;
