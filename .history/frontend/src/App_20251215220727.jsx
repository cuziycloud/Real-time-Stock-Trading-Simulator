import { useEffect, useState } from 'react';
import { Table, Tag, Typography, Card } from 'antd'; // Import giao diện đẹp
import axios from 'axios';
import { RiseOutlined, FallOutlined } from '@ant-design/icons';

const { Title } = Typography;

function App() {
  const [stocks, setStocks] = useState([]); // Biến chứa danh sách cổ phiếu
  const [loading, setLoading] = useState(false);

  // Hàm gọi API lấy dữ liệu từ Backend NestJS
  const fetchStocks = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3000/stocks');
      setStocks(response.data);
    } catch (error) {
      console.error("Lỗi không lấy được dữ liệu", error);
    } finally {
      setLoading(false);
    }
  };

  // Gọi hàm này 1 lần khi web vừa load xong
  useEffect(() => {
    fetchStocks();
  }, []);

  // Cấu hình các cột cho bảng
  const columns = [
    {
      title: 'Mã CK',
      dataIndex: 'symbol',
      key: 'symbol',
      render: (text) => <Tag color="blue" style={{fontWeight: 'bold'}}>{text}</Tag>,
    },
    {
      title: 'Công ty',
      dataIndex: 'companyName',
      key: 'companyName',
    },
    {
      title: 'Giá hiện tại',
      dataIndex: 'price',
      key: 'price',
      render: (price) => (
        <span style={{ color: price > 50 ? 'green' : 'red', fontWeight: 'bold' }}>
          {price * 1000} VND {price > 50 ? <RiseOutlined /> : <FallOutlined />}
        </span>
      ),
    },
  ];

  return (
    <div style={{ padding: '50px', background: '#f0f2f5', minHeight: '100vh' }}>
      <Card style={{ maxWidth: 800, margin: '0 auto', borderRadius: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <Title level={2} style={{ textAlign: 'center', color: '#1890ff' }}>
          📈 Bảng Giá Trực Tuyến
        </Title>
        <Table 
          dataSource={stocks} 
          columns={columns} 
          loading={loading}
          rowKey="id"
          pagination={false}
        />
      </Card>
    </div>
  );
}

export default App;