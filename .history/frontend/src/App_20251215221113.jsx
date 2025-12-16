import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Layout, Menu, Typography, Table, Tag, Card, Row, Col, Statistic, Avatar, Input, Button 
} from 'antd';
import { 
  DesktopOutlined, PieChartOutlined, UserOutlined, 
  StockOutlined, BellOutlined, SearchOutlined, 
  ArrowUpOutlined, ArrowDownOutlined 
} from '@ant-design/icons';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;

// --- Dữ liệu giả lập cho Biểu đồ (Để giao diện nhìn chuyên nghiệp) ---
const mockChartData = [
  { time: '9:00', price: 1200 },
  { time: '10:00', price: 1215 },
  { time: '11:00', price: 1208 },
  { time: '13:00', price: 1225 },
  { time: '14:00', price: 1230 },
  { time: '14:45', price: 1245 },
];

const App = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(false);

  // Gọi API từ Backend NestJS
  const fetchStocks = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3000/stocks');
      setStocks(response.data);
    } catch (error) {
      console.error("Lỗi kết nối Backend", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStocks();
    // Tự động refresh dữ liệu mỗi 30 giây (giống bảng điện thật)
    const interval = setInterval(fetchStocks, 30000);
    return () => clearInterval(interval);
  }, []);

  // Cấu hình cột cho bảng
  const columns = [
    {
      title: 'Mã CK',
      dataIndex: 'symbol',
      key: 'symbol',
      render: (text) => <Tag color="#108ee9" style={{ fontSize: '14px', fontWeight: 'bold' }}>{text}</Tag>,
    },
    {
      title: 'Công Ty',
      dataIndex: 'companyName',
      key: 'companyName',
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Giá Khớp (VND)',
      dataIndex: 'price',
      key: 'price',
      sorter: (a, b) => a.price - b.price,
      render: (price) => {
        // Giả lập logic: Giá > 50 thì xanh, < 50 thì đỏ (Demo thôi)
        const isUp = price > 50; 
        return (
          <Text style={{ color: isUp ? '#3f8600' : '#cf1322', fontWeight: 'bold' }}>
            {(price * 1000).toLocaleString()} {isUp ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
          </Text>
        );
      },
    },
    {
      title: 'Thay đổi',
      key: 'change',
      render: (_, record) => {
         // Giả lập % thay đổi ngẫu nhiên để nhìn cho sinh động
         const randomChange = (Math.random() * 5 * (record.price > 50 ? 1 : -1)).toFixed(2);
         const isPositive = randomChange > 0;
         return (
           <Text style={{ color: isPositive ? '#3f8600' : '#cf1322' }}>
             {isPositive ? '+' : ''}{randomChange}%
           </Text>
         )
      }
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* --- SIDEBAR TRÁI --- */}
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)} theme="dark">
        <div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)', borderRadius: 6, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Text style={{color: 'white', fontWeight: 'bold'}}>{collapsed ? 'PHS' : 'PHS TRADING'}</Text>
        </div>
        <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">
          <Menu.Item key="1" icon={<DesktopOutlined />}>Dashboard</Menu.Item>
          <Menu.Item key="2" icon={<StockOutlined />}>Thị Trường</Menu.Item>
          <Menu.Item key="3" icon={<PieChartOutlined />}>Danh Mục</Menu.Item>
          <Menu.Item key="4" icon={<UserOutlined />}>Tài Khoản</Menu.Item>
        </Menu>
      </Sider>

      <Layout className="site-layout">
        {/* --- HEADER TRÊN CÙNG --- */}
        <Header style={{ padding: '0 24px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{display: 'flex', alignItems: 'center'}}>
             <Title level={4} style={{ margin: 0, marginRight: 20 }}>Market Overview</Title>
             <Input placeholder="Tìm mã CK (VNM, FPT...)" prefix={<SearchOutlined />} style={{width: 250, borderRadius: 20}} />
          </div>
          <div>
            <Button type="text" icon={<BellOutlined style={{ fontSize: '18px' }} />} />
            <Avatar style={{ backgroundColor: '#87d068', marginLeft: 15 }} icon={<UserOutlined />} />
            <Text strong style={{marginLeft: 10}}>Intern Developer</Text>
          </div>
        </Header>

        {/* --- NỘI DUNG CHÍNH --- */}
        <Content style={{ margin: '16px' }}>
          
          {/* Hàng 1: Các thẻ chỉ số (Cards) */}
          <Row gutter={16} style={{marginBottom: 24}}>
            <Col span={8}>
              <Card hoverable bordered={false} style={{borderRadius: 10}}>
                <Statistic 
                  title="VN-INDEX" 
                  value={1245.32} 
                  precision={2} 
                  valueStyle={{ color: '#3f8600' }} 
                  prefix={<ArrowUpOutlined />} 
                  suffix="+1.2%"
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card hoverable bordered={false} style={{borderRadius: 10}}>
                <Statistic 
                  title="Tổng Tài Sản (VND)" 
                  value={150000000} 
                  precision={0} 
                  valueStyle={{ color: '#1890ff', fontWeight: 'bold' }} 
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card hoverable bordered={false} style={{borderRadius: 10}}>
                <Statistic 
                  title="Thanh Khoản Thị Trường" 
                  value={"15,400 Tỷ"} 
                  valueStyle={{ color: '#cf1322' }} 
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={16}>
            {/* Cột Trái: Bảng giá cổ phiếu (Lấy từ Backend thật) */}
            <Col span={16}>
              <Card title="📈 Bảng Giá Trực Tuyến" bordered={false} style={{ borderRadius: 10, minHeight: 400 }}>
                <Table 
                  dataSource={stocks} 
                  columns={columns} 
                  loading={loading}
                  rowKey="id"
                  pagination={{ pageSize: 6 }}
                />
              </Card>
            </Col>

            {/* Cột Phải: Biểu đồ (Mockup) */}
            <Col span={8}>
              <Card title="📊 Biến Động VN-Index (Trong ngày)" bordered={false} style={{ borderRadius: 10, minHeight: 400 }}>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={mockChartData}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="time" />
                    <YAxis domain={['dataMin - 10', 'dataMax + 10']} />
                    <Tooltip />
                    <Area type="monotone" dataKey="price" stroke="#8884d8" fillOpacity={1} fill="url(#colorPrice)" />
                  </AreaChart>
                </ResponsiveContainer>
                <div style={{marginTop: 20}}>
                    <Text type="secondary">Biểu đồ thể hiện xu hướng thị trường chung.</Text>
                </div>
              </Card>
            </Col>
          </Row>

        </Content>
      </Layout>
    </Layout>
  );
};

export default App;