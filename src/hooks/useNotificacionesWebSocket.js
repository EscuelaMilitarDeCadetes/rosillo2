// src/hooks/useNotificacionesWebSocket.js
import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { notificacionRecibida } from '../features/notificaciones/notificacionesSlice';

const WS_BASE_URL = 'ws://localhost:8082';

export function useNotificacionesWebSocket() {
  const dispatch = useDispatch();
  const socketRef = useRef(null);

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) return;

    const socket = new WebSocket(`${WS_BASE_URL}/ws/notificaciones/?token=${accessToken}`);
    socketRef.current = socket;

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      dispatch(notificacionRecibida(data));
    };

    socket.onerror = (error) => {
      console.error('WebSocket de notificaciones — error:', error);
    };

    return () => {
      socket.close();
    };
  }, [dispatch]);

  return socketRef;
}