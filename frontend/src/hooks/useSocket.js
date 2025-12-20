import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { notification } from 'antd';
import { SOCKET_URL } from '../constants/config';

export const useSocket = (isAuthenticated, userInfo, onMarketUpdate, onOrderMatched) => {
  useEffect(() => {
    if (!isAuthenticated || !userInfo) return;

    console.log('Đang kết nối socket...');
    const socket = io(SOCKET_URL);

    // Join room
    socket.on('connect', () => {
      socket.emit('join-room', userInfo.id);
    });

    // Lắng nghe khớp lệnh
    socket.on('order-matched', (data) => {
      notification.success({
        message: 'Khớp Lệnh Thành Công',
        description: `${data.message} (SL: ${data.quantity} - Giá: ${data.price})`,
        placement: 'topRight',
        duration: 4,
      });
      
      if (onOrderMatched) onOrderMatched();
    });

    // Lắng nghe cập nhật giá
    socket.on('market-update', (data) => {
      console.log('Nhận được giá mới:', data);
      if (onMarketUpdate) onMarketUpdate(data);
    });

    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated, userInfo, onMarketUpdate, onOrderMatched]);
};