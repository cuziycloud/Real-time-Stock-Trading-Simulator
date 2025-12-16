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
} from "antd";
import axios from "axios";
import {
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

  const showBuyModal = (stockRecord) => {
    setSelectedStock(stockRecord);
    setBuyQuantity(100);
    setIsModalOpen(true);
  };

  const handleOk = async () => {
    if (!selectedStock) return;

    try {
      const respone = await axios.post("http://localhost:3000/users/buy", {
        userId: 2,
        symbol: selectedStock.symbol,
        quantity: buyQuantity,
        price: selectedStock.price,
      });

      message.success(
        `Mua thanh cong. So du con lai: ${respone.data.currentBalance.toLocaleString()} VND`
      );

      setIsModalOpen(false);
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
      </Card>
    </div>
  );
}

export default App;
