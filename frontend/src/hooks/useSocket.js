// import { useEffect } from 'react';
// import { io } from 'socket.io-client';
// import { notification } from 'antd';
// import { SOCKET_URL } from '../constants/config';

// export const useSocket = (isAuthenticated, userInfo, onMarketUpdate, onOrderMatched) => {
//   useEffect(() => {
//     if (!isAuthenticated || !userInfo) return;

//     console.log('Đang kết nối socket...');
//     const socket = io(SOCKET_URL);

//     // Join room
//     socket.on('connect', () => {
//       socket.emit('join-room', userInfo.id);
//     });

//     // Lắng nghe khớp lệnh
//     socket.on('order-matched', (data) => {
//       notification.success({
//         message: 'Khớp Lệnh Thành Công',
//         description: `${data.message} (SL: ${data.quantity} - Giá: ${data.price})`,
//         placement: 'topRight',
//         duration: 4,
//       });
      
//       if (onOrderMatched) onOrderMatched();
//     });

//     // Lắng nghe cập nhật giá
//     socket.on('market-update', (data) => {
//       console.log('Nhận được giá mới:', data);
//       if (onMarketUpdate) onMarketUpdate(data);
//     });

//     return () => {
//       socket.disconnect();
//     };
//   }, [isAuthenticated, userInfo, onMarketUpdate, onOrderMatched]);
// };

import { notification } from "antd";
import { useEffect, useRef } from "react";
import { io } from 'socket.io-client';
import { SOCKET_URL } from '../constants/config';

export const useSocket = (
  isAuthenticated,
  userInfo,
  onMarketUpdate,
  onOrderMatched
) => {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated || !userInfo) return;
    if (socketRef.current) return; 

    // console.log("Kết nối socket 1 lần duy nhất");

    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join-room", userInfo.id);
    });

    socket.on("order-matched", (data) => {
      notification.success({
        title: "Khớp Lệnh Thành Công",
        description: `${data.message} (SL: ${data.quantity} - Giá: ${data.price})`,
        placement: "topRight",
        duration: 4,
      });
      onOrderMatched?.();
    });

    socket.on("market-update", (data) => {
      onMarketUpdate?.(data);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, userInfo?.id]); 
};
