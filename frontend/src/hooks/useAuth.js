import { useState } from 'react';
import { message } from 'antd';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem('access_token')
  );

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setIsAuthenticated(false);
    message.info('Đăng xuất thành công');
  };

  return {
    isAuthenticated,
    handleLogin,
    handleLogout,
  };
};