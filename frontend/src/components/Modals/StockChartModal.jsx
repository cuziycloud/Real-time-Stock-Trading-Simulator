import { useEffect, useRef, useState } from 'react';
import { Modal, Spin, message, Typography } from 'antd';
import ReactApexChart from 'react-apexcharts';
import axiosClient from '../../services/axios-client';

const { Text } = Typography;

const StockChartModal = ({ open, onClose, stockSymbol }) => {
  // ApexCharts cần dữ liệu đầu vào là một mảng các series
  // Format: [{ data: [{x: ngày, y: [O,H,L,C]}, ...] }]
  const [series, setSeries] = useState([]);  // lưu trữ dl biểu đồ
  const [loading, setLoading] = useState(true);

   const timerRef = useRef(null);
  // CẤU HÌNH BIỂU ĐỒ (CHART OPTIONS)
  const chartOptions = {
    chart: {
      type: 'candlestick',
      height: 350,
      toolbar: { show: false }, // Ẩn thanh công cụ mặc định
    },
    xaxis: {
      type: 'datetime', // Thời gian
      labels: {
        datetimeUTC: false,  // Không theo giờ utc, theo giờ trên mt
        datetimeFormatter: {
            year: 'yyyy',
            month: 'MMM \'yy',
            day: 'dd MMM',
            hour: 'HH:mm', // Hiển thị HH:mm vì là nến 1 phút
        }
      }
    },
    yaxis: { // Giá
      tooltip: {
        enabled: true, // Di chuột vào sẽ hiện giá chi tiết
      },
      labels: {
        formatter: (value) => value.toFixed(2)
      }
    },
    plotOptions: {
      candlestick: {
        colors: {
          upward: '#3f8600',   // Nến Tăng: Màu Xanh lá (giá đóng cửa cao hơn giá mở cửa)
          downward: '#cf1322'  // Nến Giảm: Màu Đỏ (giá đóng thấp hơn giá mở)
        },
        wick: {
          useFillColor: true, // Râu nến trùng màu thân nến
        }
      }
    },
    tooltip: {
      theme: 'dark',
    }
  };

  useEffect(() => {
    if (open && stockSymbol) {
      // 1. Lấy dữ liệu lần đầu ngay lập tức
      fetchCandles(true);

      // 2. Thiết lập cơ chế "quẹt" dữ liệu mới mỗi 5s
      timerRef.current = setInterval(() => {
        fetchCandles(false); // false để nó cập nhật ngầm, chỉ loading lần đầu
      }, 5000);

      // 3. Clean: đóng modal, đổi mã => xóa timer
      return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
    }
  }, [open, stockSymbol]);

  const fetchCandles = async (isFirstLoad = false) => {
    if (isFirstLoad) setLoading(true); // Chỉ hiện xoay xoay ở lần đầu tiên
    try {
      const res = await axiosClient.get(`/stocks/candles/${stockSymbol}`);
      
      // Be trả về: { x: '2023-12-24T10:00:00', y: [10, 12, 9, 11] }
      // ApexCharts cần x: timestamp/ Date object, y: mảng số
      // Dl từ be đã chuẩn format y: [O, H, L, C], chỉ cần map x
      const chartData = res.data.map(item => ({
        x: new Date(item.x), // Chuyển string ngày tháng => Date Object
        y: item.y 
      }));

      setSeries([{
        name: 'Giá',
        data: chartData
      }]);

    } catch {
      message.error("Không tải được dữ liệu nến");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <span>
            Biểu đồ kỹ thuật: <b style={{color: '#1890ff', fontSize: 18}}>{stockSymbol} (1 phút)</b> 
        </span>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={800} // Rộng của chart
      centered
    >
      {loading ? (
        <div style={{ height: 350, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Spin tip="Đang tải dữ liệu thị trường..." size="large" />
        </div>
      ) : (
        <div style={{ width: '100%', height: 380 }}>
          {series.length > 0 && series[0].data.length > 0 ? (
             <ReactApexChart 
                options={chartOptions} 
                series={series} 
                type="candlestick" 
                height={350} 
             />
          ) : (
             <div style={{textAlign: 'center', marginTop: 100, color: '#888'}}>
                Chưa có dữ liệu nến cho mã này (Chờ server chạy 1 lát nhé...)
             </div>
          )}
        </div>
      )}
    </Modal>
  );
};

export default StockChartModal;