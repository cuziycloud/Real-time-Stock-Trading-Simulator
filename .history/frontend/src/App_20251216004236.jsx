import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { Table, Tag, Typography, Card } from "antd";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  DesktopOutlined,
} from "@ant-design/icons";
import PurePanel from "antd/es/tooltip/PurePanel";

const { Title, Text } = Typography;

function App() {
  const [stocks, setStocks] = useState([]);

  useEffect(() => {
    console.log("Dang ket noi...");

    const socket = io("http://localhost:3000");

    socket.on("market-update", (dataTuServerGuive) => {
      console.log('Nhan duoc gia moi: ', dataTuServerGuive);

      setStocks(dataTuServerGuive);
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  const columns = [
    {
      title: 'Mã CK',
      dataIndex: 'symbol',
      key: 'symbol',
      render: (text) => <Tag color="blue" style={{fontSize: 16}}>{text}</Tag>
    },
    {
      title: 'Gia Thi Truong',
      dataIndex: 'price',
      key: 'price',
      render: (price) => {
        return <Text strong style={{fontSize: 16}}>{price.toFixed(2)}</Text>
      }
    },
    {
      title: 'Bien dong',
      dataIndex: 'action',
      key: 'action',
      render: (_, record) => {
        const isUp = record.price > 50;

        return (
          <Tag color={isUp? 'green': 'red'}>
            {isUp ? <ArrowUpOutlined/>: <ArrowDownOutlined/>}
            {isUp ? 'Tang': 'Giam'}
          </Tag>
        )
      }
    }
  ];

  return (
    <div style={{padding: '50px', background: '#f0f2f5', minHeight: '100vh'}}>
      <Card style={{maxWidth: 900, margin: '0 auto', borderRadius: 12, boxShadow: '0 4px 10px rgba(0,0,0,0.1)'}}>
        <div style={{ textAlign: 'center', marginBottom: 20}}>
          <Title level={2} style={{color: '#1890ff'}}>
            <DesktopOutlined/> Sàn chứng khoán Real-time
          </Title>
          <Text type="secondary">Dữ liệu được cập nhật trực tiếp qua WebSockets</Text>
        </div>
        <Table
          dataSource={stocks}
          columns={columns}
          rowKey="symbol"
          
        />
      </Card>
    </div>
  );
};
