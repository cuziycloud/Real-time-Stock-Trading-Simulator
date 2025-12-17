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

  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false); // Modal mua
  const [selectedBuyStock, setSelectedBuyStock] = useState(null); // Ma dang chon mua
  const [buyQuantity, setBuyQuantity] = useState(100); // Bien luu so luong ma ng dung muon mua (default: 100)

  const [userInfo, setUserInfo] = useState(null); // Tien va danh muc co phieu
  const [isDrawerOpen, SetIsDrawerOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(false); // Chay lai useEffect - fetchUserInfo

  const [isSellModalOpen, setIsSellModalOpen] = useState(false); // Modal ban
  const [selectedSellItem, setSelectedSellItem] = useState(null); // Item dang chon ban
  const [sellQuantity, setSellQuantity] = useState(0); // SL co phieu ban

  // State quản lý Drawer Lịch sử
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyData, setHistoryData] = useState([]);

  useEffect(() => {
    let isMounted = true; //Co ktra component con song ko

    const fetchUserInfo = async () => {
      try {
        const res = await axios.get("http://localhost:3000/users/1");
        if (isMounted) {
          //Chi set state khi component con
          setUserInfo(res.data);
        }
      } catch (error) {
        console.error("Loi khong tim thay user", error);
      }
    };
    fetchUserInfo();

    return () => {
      isMounted = false;
    };
  }, [refreshKey]);

  const showBuyModal = (stockRecord) => {
    setSelectedBuyStock(stockRecord);
    setBuyQuantity(100);
    setIsBuyModalOpen(true);
  };

  const showSellModal = (portfolioItem) => {
    setSelectedSellItem(portfolioItem);
    setSellQuantity(portfolioItem.quantity);
    setIsSellModalOpen(true);
  };

  const handleBuyOk = async () => {
    if (!selectedBuyStock) return;

    try {
      const res = await axios.post("http://localhost:3000/users/buy", {
        userId: 1,
        symbol: selectedBuyStock.symbol,
        quantity: buyQuantity,
        price: selectedBuyStock.price,
      });

      message.success(
        `Mua thanh cong. So du con lai: ${res.data.currentBalance.toLocaleString()} VND`
      );

      setIsBuyModalOpen(false);
      setRefreshKey((prev) => !prev);
    } catch (error) {
      message.error(`That bai: ${error.res?.data?.message || "Loi he thong"}`);
    }
  };

  const handleBuyCancel = () => {
    setIsBuyModalOpen(false);
  };

  const handleSellOk = async () => {
    if (!selectedSellItem) return;

    try {
      const res = await axios.post("http://localhost:3000/users/sell", {
        userId: 1,
        symbol: selectedSellItem.symbol,
        quantity: sellQuantity,
        price: selectedSellItem.marketPrice, // Ban theo gtt
      });

      message.success(
        `Ban thanh cong. So du con lai: ${res.data.currentBalance.toLocaleString()} VND`
      );

      setIsSellModalOpen(false);
      setRefreshKey((prev) => !prev);
    } catch (error) {
      message.error(`That bai: ${error.res?.data?.message || "Loi he thong"}`);
    }
  };

  const handleSellCancel = () => {
    setIsSellModalOpen(false);
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

  const fetchTradeHistory = async () => {
    try {
      const res = await axios.get("http://localhost:3000/users/1/history");
      setHistoryData(res.data);
      setIsHistoryOpen(true);
    } catch {
      message.error("Không tải được lịch sử");
    }
  };

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

  // Logic tinh toan danh muc
  // Portfolio lay tu API chi co gia von. Can map voi gtt (stocks) de tinh lai lo
  const portfolioData = userInfo?.portfolio?.map((item) => {
    // 1. Tim gia hien tai cua ma nay trong stocks (Real-time)
    const currentStock = stocks.find((s) => s.symbol === item.symbol);
    const marketPrice = currentStock ? currentStock.price : item.avgPrice;

    // 2. Tinh lai lo: (Gia hien tai - Gia von)* SL
    const profit = (marketPrice - item.avgPrice) * item.quantity;
    const profitPercent = ((marketPrice - item.avgPrice) / item.avgPrice) * 100;

    return {
      ...item,
      marketPrice,
      profit,
      profitPercent,
    };
  });

  const portfolioColumns = [
    {
      title: "Ma",
      dataIndex: "symbol",
      key: "symbol",
      render: (t) => <Tag color="orange">{t}</Tag>,
    },
    { title: "So luong", dataIndex: "quantity", key: "quantity" },
    {
      title: "Gia von",
      dataIndex: "avgPrice",
      key: "avgPrice",
      render: (p) => Number(p).toLocaleString(),
    },
    {
      title: "Gia TT",
      dataIndex: "marketPrice",
      key: "marketPrice",
      render: (p) => <Text strong>{p.toLocaleString()}</Text>,
    },
    {
      title: "Lai/ Lo",
      key: "profit",
      render: (_, record) => {
        const color = record.profit >= 0 ? "green" : "red";
        return (
          <span style={{ color, fontWeight: "bold" }}>
            {record.profit.toLocaleString()} ({record.profitPercent.toFixed(2)}
            %)
          </span>
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
          onClick={() => showSellModal(record)}
        >
          Bán
        </Button>
      ),
    },
  ];

  const historyColumns = [
    {
      title: "Thời gian",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleString("vi-VN"),
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      render: (type) => (
        <Tag color={type === "BUY" ? "blue" : "volcano"}>
          {type === "BUY" ? "MUA" : "BÁN"}
        </Tag>
      ),
    },
    {
      title: "Mã",
      dataIndex: "symbol",
      key: "symbol",
      render: (t) => <b>{t}</b>,
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Giá khớp",
      dataIndex: "price",
      key: "price",
      render: (p) => Number(p).toLocaleString(),
    },
    {
      title: "Tổng tiền",
      key: "total",
      render: (_, record) => (
        <Text type={record.type === "BUY" ? "secondary" : "success"}>
          {(record.price * record.quantity).toLocaleString()}
        </Text>
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
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <Statistic
            title="So du kha dung"
            value={userInfo?.balance}
            precision={0}
            suffix="VND"
            style={{ color: "#3f8600", fontSize: 18 }}
          />
          <Button
            type="primary"
            icon={<WalletOutlined />}
            onClick={() => SetIsDrawerOpen(true)}
            size="large"
          >
            Xem Danh Muc Cua Toi
          </Button>
        </div>
        <div>
          <Button size="large" onClick={fetchTradeHistory} icon={<WalletOutlined />}>
            Lịch sử GD
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
          title={`Dat lenh MUA: ${selectedBuyStock?.symbol}`}
          open={isBuyModalOpen}
          onOk={handleBuyOk}
          onCancel={handleBuyCancel}
          okText="Xac nhan mua"
          cancelText="Huy"
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <p>
              Gia hien tai: <strong>{selectedBuyStock?.price}</strong>
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
                {(selectedBuyStock?.price * buyQuantity).toLocaleString()} VND
              </strong>
            </p>
          </div>
        </Modal>
        <Drawer
          title="Danh Mục Đầu Tư (My Portfolio)"
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
        <Modal
          title={`Dat lenh BAN: ${selectedSellItem?.symbol}`}
          open={isSellModalOpen}
          onOk={handleSellOk}
          onCancel={handleSellCancel}
          okText="Xac nhan ban"
          cancelText="Huy"
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <p>
              Gia thi truong hien tai:{" "}
              <strong>{selectedSellItem?.price}</strong>
            </p>
            <p>
              Gia von cua ban:{" "}
              <strong>{Number(selectedSellItem?.avgPrice)}</strong>
            </p>
            <div>
              <span>So luong ban (Max: {selectedSellItem?.quantity}): </span>
              <InputNumber
                min={10}
                max={selectedSellItem?.quantity}
                value={sellQuantity}
                onChange={(value) => setSellQuantity(value)}
                style={{ width: "100%" }}
              />
            </div>
            <div
              style={{
                marginTop: 10,
                padding: 10,
                color: "#cf1322",
                borderRadius: 5,
              }}
            >
              <p style={{ margin: 0 }}>
                Tong tien thu ve:{" "}
                <strong>
                  {(
                    selectedSellItem?.marketPrice * sellQuantity
                  ).toLocaleString()}{" "}
                  VND
                </strong>
              </p>
              <p style={{ margin: 0, fontSize: 12, color: "#cf1322" }}>
                {(selectedSellItem?.marketPrice - selectedSellItem?.avgPrice) *
                  sellQuantity >=
                0
                  ? `Lai du kien: ${(
                      (selectedSellItem?.marketPrice -
                        selectedSellItem?.avgPrice) *
                      sellQuantity
                    ).toLocaleString()} VND`
                  : `Lo du kien: ${(
                      (selectedSellItem?.marketPrice -
                        selectedSellItem?.avgPrice) *
                      sellQuantity
                    ).toLocaleString()} VND`}
              </p>
            </div>
          </div>
        </Modal>
        <Drawer
          title="Lịch Sử Giao Dịch"
          placement="left"
          size={600}
          onClose={() => setIsHistoryOpen(false)}
          open={isHistoryOpen}
        >
          <Table
            dataSource={historyData}
            columns={historyColumns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          ></Table>
        </Drawer>
      </Card>
    </div>
  );
}

export default App;
