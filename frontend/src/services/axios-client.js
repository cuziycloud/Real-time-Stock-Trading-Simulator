import axios from "axios";
import { message } from "antd";

const axiosClient = axios.create({
  baseURL: "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.request.use(
  (config) => {
    // 1. Lấy token từ LocalStorage
    const token = localStorage.getItem("access_token");

    // 2. Nếu có token, gắn vào Header
    if (token) {
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
    const { response, config } = error;
    if (response && response.status === 401) {
      //console.log(config.url);
      const isAuthApi =
        config.url.includes("auth/login") ||
        config.url.includes("auth/register");

      if (!isAuthApi) {
        // Gọi API khác (/profile, /orders) mà bị 401 là "Hết hạn phiên" thật sự
        message.error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại.");
        // Chuyển hướng ra login:
        setTimeout(() => {
          window.location.href = "/";
        }, 1000);
      }
      localStorage.removeItem("access_token");
      //window.location.reload();
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
