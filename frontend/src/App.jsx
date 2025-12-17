import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import {
  Table,
  Tag,
  Typography,
  Card,
  Modal,
  InputNumber,
  message,
  Button,
  Drawer,
  Statistic,
  Row,
  Col,
} from "antd";
import axios from "axios";
import {
  WalletOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  DesktopOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

function App() {
  const [stocks, setStocks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false); //Bien kiem soat popup mua hang
  const [selectedStock, setSelectedStock] = useState(null); //Bien luu xem ng dung dang dinh mua ma nao
  const [buyQuantity, setBuyQuantity] = useState(100); //Bien luu so luong ma ng dung muon mua (mac dinh 100)
  const [userInfo, setUserInfo] = useState(null); //Tien va danh muc co phieu
  const [isDrawerOpen, SetIsDrawerOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(false); //Chay lai useEffect - fetchUserInfo

  useEffect(() => {
    let isMounted = true; //Co ktra component con song ko

    const fetchUserInfo = async() => {
      try {
        const res = await axios.get("http://localhost:3000/users/1");
        if(isMounted) { //Chi set state khi component con
          setUserInfo(res.data);
        }
      } catch (error) {
        console.error("Loi khong tim thay user", error);
      }
    }
    fetchUserInfo();

    return () => {isMounted = false};
  },[refreshKey]);

  const showBuyModal = (stockRecord) => {
    setSelectedStock(stockRecord);
    setBuyQuantity(100);
    setIsModalOpen(true);
  };

  const handleOk = async () => {
    if (!selectedStock) return;

    try {
      const respone = await axios.post("http://localhost:3000/users/buy", {
        userId: 1,
        symbol: selectedStock.symbol,
        quantity: buyQuantity,
        price: selectedStock.price,
      });

      message.success(
        `Mua thanh cong. So du con lai: ${respone.data.currentBalance.toLocaleString()} VND`
      );

      setIsModalOpen(false);
      setRefreshKey(prev => !prev);
    } catch (error) {
      message.error(
        `That bai: ${error.respone?.data?.message || "Loi he thong"}`
      );
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    console.log("Dang ket noi...");

    const socket = io("http://localhost:3000");

    socket.on("market-update", (dataTuServerGuive) => {
      console.log("Nhan duoc gia moi: ", dataTuServerGuive);

      setStocks(dataTuServerGuive);
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  const columns = [
    {
      title: "Mã CK",
      dataIndex: "symbol",
      key: "symbol",
      render: (text) => (
        <Tag color="blue" style={{ fontSize: 16 }}>
          {text}
        </Tag>
      ), //chinh sua cach hien thi
    },
    {
      title: "Gia Thi Truong",
      dataIndex: "price",
      key: "price",
      render: (price) => {
        return (
          <Text strong style={{ fontSize: 16, color: "green" }}>
            {price.toFixed(2)}
          </Text>
        );
      },
    },
    {
      title: "Bien dong",
      key: "action",
      render: (_, record) => {
        const isUp = record.price > 50;

        return (
          <Tag color={isUp ? "green" : "red"}>
            {isUp ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            {isUp ? "Tang" : "Giam"}
          </Tag>
        );
      },
    },
    {
      title: "Hanh dong",
      key: "action",
      render: (_, record) => (
        <Button
          type="primary"
          size="medium"
          onClick={() => showBuyModal(record)}
        >
          Mua ngay
        </Button>
      ),
    },
  ];

  //Logic tinh toan danh muc
  //Portfolio lay tu API chi co gia von. Can map voi gtt (stocks) de tinh lai lo
  const portfolioData = userInfo?.portfolio?.map((item) => {
    // 1. Tim gia hien tai cua ma nay trong stocks (Real-time)
    const currentStock = stocks.find((s) => s.symbol === item.symbol);
    const marketPrice = currentStock? currentStock.price: item.avgPrice;

    // 2. Tinh lai lo: (Gia hien tai - Gia von)* SL
    const profit = (marketPrice - item.avgPrice)*item.quantity;
    const profitPercent = ((marketPrice-item.avgPrice)/item.avgPrice)*100;

    return {
      ...item,
      marketPrice,
      profit,
      profitPercent
    };
  })

  const portfolioColumns = [
    {title: 'Ma', dataIndex: 'symbol', key: 'symbol', render: t => <Tag color="orange">{t}</Tag>},
    {title: 'So luong', dataIndex: 'quantity', key: 'quantity'},
    {title: 'Gia von', dataIndex: 'avgPrice', key: 'avgPrice', render: p => Number(p).toLocaleString()},
    {
      title: 'Gia TT',
      dataIndex: 'marketPrice',
      key: 'marketPrice',
      render: (p) => <Text strong>{p.toLocaleString()}</Text>
    },
    {
      title: 'Lai/ Lo',
      key: 'profit',
      render: (_, record) => {
        const color = record.profit >= 0? 'green' : 'red';
        return(
          <span style={{color, fontWeight: 'bold'}}>
            {record.profit.toLocaleString()} ({record.profitPercent.toFixed(2)}%)
          </span>
        )
      }
    },
  ];
  return (
    <div style={{ padding: "50px", background: "#f0f2f5", minHeight: "100vh" }}>
      <Card
        style={{
          maxWidth: 900,
          margin: "0 auto",
          borderRadius: 12,
          boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
        }}
      >
        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 20}}>
          <Statistic
            title = "So du kha dung"
            value={userInfo?.balance}
            precision={0}
            suffix= "VND"
            style={{color: '#3f8600', fontSize: 18}}
          />
          <Button
            type="primary"
            icon={<WalletOutlined/>}
            onClick={() => SetIsDrawerOpen(true)}
            size="large"
          >
            Xem Danh Muc Cua Toi
          </Button>
        </div>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <Title level={2} style={{ color: "#1890ff" }}>
            <DesktopOutlined /> Sàn chứng khoán Real-time
          </Title>
          <Text type="secondary">
            Dữ liệu được cập nhật trực tiếp qua WebSockets
          </Text>
        </div>
        <Table
          dataSource={stocks}
          columns={columns}
          rowKey="symbol"
          pagination={false} // tat phan trang
          bordered
        />
        <Modal
          title={`Dat lenh MUA: ${selectedStock?.symbol}`}
          open={isModalOpen}
          onOk={handleOk}
          onCancel={handleCancel}
          okText="Xac nhan mua"
          cancelText="Huy"
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <p>
              Gia hien tai: <strong>{selectedStock?.price}</strong>
            </p>
            <div>
              <span>So luong mua: </span>
              <InputNumber
                min={10}
                max={10000}
                defaultValue={100}
                value={buyQuantity}
                onChange={(value) => setBuyQuantity(value)}
                style={{ width: "100%" }}
              />
            </div>
            <p style={{ marginTop: 10, color: "#1890ff" }}>
              Tong tien du tinh:{" "}
              <strong>
                {(selectedStock?.price * buyQuantity).toLocaleString()} VND
              </strong>
            </p>
          </div>
        </Modal>
        <Drawer
          title = "Danh Mục Đầu Tư (My Portfolio)"
          placement="right"
          size={600}
          onClose={() => SetIsDrawerOpen(false)}
          open={isDrawerOpen}
        >
          <Table
            dataSource={portfolioData}
            columns={portfolioColumns}
            rowKey="id"
            pagination={false}
          />
        </Drawer>
      </Card>
    </div>
  );
}

export default App;
