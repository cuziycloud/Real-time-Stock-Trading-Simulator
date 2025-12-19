import { useState, useEffect } from "react";
import axiosClient from "../services/axios-client";
import { message, Modal, Typography, Spin } from "antd";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

const { Text } = Typography;

const StockChartModal = ({ open, onClose, stockSymbol, currentPrice }) => {
  const [data, setData] = useState([]); // Lưu dl ls giá
  const [loading, setLoading] = useState(true); // Trạng thái tải dl

  useEffect(() => {
    if (open && stockSymbol) {
      fetchHistory();
    }
  }, [open, stockSymbol]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get(`/market/history/${stockSymbol}`);
      const formattedData = res.data.map((item) => ({
        price: item.price,
        time: new Date(item.time).toLocaleDateString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      }));

      setData(formattedData);
    } catch (error) {
      message.error("Không lấy được dữ liệu biểu đồ");
      console.error("Lỗi fetch lịch sử giá: ", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <span>
          Biểu đồ biến động: <b style={{ color: "#1890ff" }}>{stockSymbol}</b>
        </span>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      {loading ? ( // Nếu đang tải: Spin
        <div
          style={{
            height: 350,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Spin fullscreen tip="Loading..." size="large" />
        </div>
      ) : (
        // Ngược lại: biểu đồ
        <div style={{ width: "100%", height: 350 }}>
          <ResponsiveContainer>
            {" "}
            {/* Giúp biểu đồ tự co giãn */}
            <AreaChart
              data={data}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1890ff" stopOpacity={0.8} />
                  <stop offset="5%" stopColor="#1890ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical="false" />{" "}
              {/* Lưới */}
              <XAxis dataKey="time" minTickGap={30} tick={{ fontSize: 12 }} />
              <YAxis
                domain={["auto", "auto"]}
                orientation="right"
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: "none",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15",
                }}
                formatter={(value) => [
                  `${Number(value).toLocaleString()} VND`,
                  "Giá",
                ]}
              />
              <Area 
                type="monotone"
                dataKey="price"
                stroke="#1890ff"
                fillOpacity={1}
                fill="url(#colorPrice)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </Modal>
  );
};

export default StockChartModal;