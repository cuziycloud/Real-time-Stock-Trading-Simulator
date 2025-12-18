import axios from "axios";
import { message } from "antd";

const axiosClient = axios.create({
    baseURL: 'http://localhost:3000',
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosClient.interceptors.request.use(
    (config) => {
        // 1. Lấy token từ LocalStorage
        const token = localStorage.getItem('access_token');

        // 2. Nếu có token, gắn vào Header
        if(token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if(error.response && error.response.status === 401) {
            message.error('Phiên đăng nhập hết hạn');
            localStorage.removeItem('access_token');
            window.location.reload();
        }
        return Promise.reject(error);
    }
);

export default axiosClient;