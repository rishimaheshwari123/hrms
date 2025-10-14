import { useEffect } from "react";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.VITE_SOCKET_BASE_URL; // e.g., "http://localhost:8000"

const useSocket = () => {
  useEffect(() => {
    const socket = io(BASE_URL);

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return null;
};

export default useSocket;
