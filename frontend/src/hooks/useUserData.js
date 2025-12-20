import { useState, useEffect } from 'react';
import axiosClient from '../services/axios-client';

export const useUserData = (isAuthenticated) => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    const fetchUserInfo = async () => {
      try {
        const res = await axiosClient.get('/users/profile');
        if (isMounted) {
          setUserInfo(res.data);
        }
      } catch (error) {
        console.error('Lỗi không tìm thấy user', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchUserInfo();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, refreshKey]);

  const refreshUserData = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return {
    userInfo,
    loading,
    refreshUserData,
  };
};