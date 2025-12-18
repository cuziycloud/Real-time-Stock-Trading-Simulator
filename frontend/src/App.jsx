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
  Layout,
  Avatar,
  Space,
  Alert,
  Divider,
  Dropdown,
  Spin,
} from "antd";
import {
  UserOutlined,
  StockOutlined,
  WalletOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  DesktopOutlined,
  HistoryOutlined,
  ThunderboltFilled,
  LogoutOutlined,
  DownOutlined,
} from "@ant-design/icons";
import { Content, Footer, Header } from "antd/es/layout/layout";
import axiosClient from "./services/axios-client";
import LoginPage from "./components/LoginPage";

const { Title, Text } = Typography;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("access_token")
  );
  const [isAppLoading, setIsAppLoading] = useState(true); // State loading toàn App

  const [stocks, setStocks] = useState([]);
  const [userInfo, setUserInfo] = useState(null); // Tien va danh muc co phieu
  const [historyData, setHistoryData] = useState([]);

  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false); // Modal mua
  const [selectedBuyStock, setSelectedBuyStock] = useState(null); // Ma dang chon mua
  const [buyQuantity, setBuyQuantity] = useState(100); // Bien luu so luong ma ng dung muon mua (default: 100)

  const [isSellModalOpen, setIsSellModalOpen] = useState(false); // Modal ban
  const [selectedSellItem, setSelectedSellItem] = useState(null); // Item dang chon ban
  const [sellQuantity, setSellQuantity] = useState(0); // SL co phieu ban

  const [isDrawerOpen, setIsDrawerOpen] = useState(false); // Drawer Portfolio
  const [isHistoryOpen, setIsHistoryOpen] = useState(false); // Drawer Lịch sử

  const [refreshKey, setRefreshKey] = useState(false); // Chay lai useEffect - fetchUserInfo

  useEffect(() => {
    let isMounted = true; // Ktra component con song ko

    if (!isAuthenticated) return; // Chưa login => ko call api

    const fetchUserInfo = async () => {
      try {
        const res = await axiosClient.get("/users/profile");
        if (isMounted) {
          //Chi set state khi component con
          setUserInfo(res.data);
        }
      } catch (error) {
        console.error("Loi khong tim thay user", error);
        if (error.respone?.status === 401) setIsAuthenticated(false);
      } finally {
        setIsAppLoading(false);
      }
    };
    fetchUserInfo();

    return () => {
      isMounted = false;
    };
  }, [refreshKey, isAuthenticated]);

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
      const res = await axiosClient.post("/users/buy", {
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
      const res = await axiosClient.post("/users/sell", {
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

  const handleLogOut = () => {
    localStorage.removeItem("access_token");
    setUserInfo(null); // Xóa dl trong RAM
    setIsAuthenticated(false);
    message.info("Đăng xuất thành công");
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
      const res = await axiosClient.get("users/history");
      setHistoryData(res.data);
      setIsHistoryOpen(true);
    } catch {
      message.error("Không tải được lịch sử");
    }
  };

  // Logic tinh toan danh muc
  // Portfolio lay tu API chi co gia von. Can map voi gtt (stocks) de tinh lai lo
  const portfolioData = userInfo?.portfolio?.map((item) => {
    // 1. Tim gia hien tai cua ma nay trong stocks (Real-time)
    const currentStock = stocks.find((s) => s.symbol === item.symbol);
    const marketPrice = currentStock
      ? currentStock.price
      : Number(item.avgPrice);

    // 2. Tinh lai lo: (Gia hien tai - Gia von)* SL
    const profit = (marketPrice - item.avgPrice) * item.quantity;
    const profitPercent =
      item.avgPrice > 0
        ? ((marketPrice - item.avgPrice) / item.avgPrice) * 100
        : 0;

    return {
      ...item,
      marketPrice,
      profit,
      profitPercent,
    };
  });

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
      key: "change",
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

  // Dropdown
  const userMenu = {
    items: [
      { key: "1", label: "Hồ sơ cá nhân" },
      { type: "divider" },
      {
        type: "2",
        label: "Đăng xuất",
        icon: <LogoutOutlined />,
        danger: true,
        onClick: handleLogOut,
      },
    ],
  };

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  if (isAppLoading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#f0f2f5",
        }}
      >
        <Spin tip="Loading..." size="large">
          <div style={{ height: "100vh" }}></div>
        </Spin>
      </div>
    );
  }

  return (
    <Layout style={{ minHeight: "100vh", width: "100vw" }}>
      {/* 1. HEADER */}
      <Header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#001529",
        }}
      >
        {/* Ben trai: Logo + Ten */}
        <div
          style={{
            color: "white",
            fontSize: 20,
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <StockOutlined /> Stock Simulator
        </div>
        {/* Ben trai: Ten + Ava (dropdown) */}
        <Dropdown menu={userMenu} placement="bottomRight" arrow>
          <div
            style={{
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Avatar
              style={{ backgroundColor: "#1890ff" }}
              icon={<UserOutlined />}
            />
            <span style={{ color: "white" }}>
              {userInfo?.username || "Trader"}{" "}
              <DownOutlined style={{ fontSize: 10 }} />
            </span>
          </div>
        </Dropdown>
      </Header>

      {/* 2. CONTENT */}
      <Content style={{ padding: "30px 50px" }}>
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
          }}
        >
          <Row gutter={16} style={{ marginBottom: 20 }}>
            <Col span={10}>
              <Card
                style={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
              >
                <Statistic
                  title="Tài sản ròng (Net Worth)"
                  value={userInfo?.balance}
                  precision={0}
                  style={{
                    color: "#3f8600",
                    fontSize: 30,
                    fontWeight: "bold",
                  }}
                />
              </Card>
            </Col>
            <Col span={14}>
              <Card
                style={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
              >
                <Space size="large">
                  <Button
                    type="primary"
                    size="large"
                    icon={<WalletOutlined />}
                    onClick={() => setIsDrawerOpen(true)}
                  >
                    Quản lý Danh Mục
                  </Button>
                  <Button
                    size="large"
                    icon={<HistoryOutlined />}
                    onClick={fetchTradeHistory}
                  >
                    Lịch sử Giao Dịch
                  </Button>
                </Space>
              </Card>
            </Col>
          </Row>
        </div>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <Title level={2} style={{ color: "#1890ff" }}>
            <DesktopOutlined /> Sàn chứng khoán Real-time
          </Title>
        </div>
        <Card
          title={
            <span>
              <ThunderboltFilled style={{ color: "#faad14", marginRight: 8 }} />
              Bảng Giá Trực Tuyến (Real-time Market)
            </span>
          }
          variant="false"
          style={{ marginTop: 20, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
        >
          <Table
            dataSource={stocks}
            columns={columns}
            rowKey="symbol"
            pagination={false} // tat phan trang
            bordered
          />
        </Card>
        <Modal
          title={`Dat lenh MUA: ${selectedBuyStock?.symbol}`}
          open={isBuyModalOpen}
          onOk={handleBuyOk}
          onCancel={handleBuyCancel}
          okText="Xac nhan mua"
          cancelText="Huy"
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Alert
              title={`Giá thị trường: ${selectedBuyStock?.price}`}
              type="info"
              showIcon
            />
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

            <Divider style={{ margin: "5px 0" }} />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text> Tổng thanh toán: </Text>
              <Title level={4} style={{ margin: 0, color: "#1890ff" }}>
                {(selectedBuyStock?.price * buyQuantity).toLocaleString()} VND
              </Title>
            </div>
          </div>
        </Modal>
        <Drawer
          title="Danh Mục Đầu Tư (My Portfolio)"
          placement="right"
          size={600}
          onClose={() => setIsDrawerOpen(false)}
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
            <Alert
              title={`Giá thị trường hiện tại: ${selectedSellItem?.marketPrice} VND`}
              type="info"
              showIcon
            />
            <Alert
              title={`Giá vốn của bạn: ${Number(
                selectedSellItem?.avgPrice
              )} VND`}
              type="info"
              showIcon
            />
            <div>
              <span>So luong ban (Max: {selectedSellItem?.quantity}): </span>
              <InputNumber
                min={1}
                max={selectedSellItem?.quantity}
                value={sellQuantity}
                onChange={(value) => setSellQuantity(value)}
                style={{ width: "100%" }}
              />
            </div>
            <Divider style={{ margin: "5px 0" }} />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text>Tổng tiền thu về: </Text>
              <Title level={4} style={{ margin: 0, color: "#008000" }}>
                {(
                  selectedSellItem?.marketPrice * sellQuantity
                ).toLocaleString()}{" "}
                VND
              </Title>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text>
                {(selectedSellItem?.marketPrice - selectedSellItem?.avgPrice) *
                  sellQuantity >=
                0
                  ? "Lãi dự kiến:"
                  : "Lỗ dự kiến:"}
              </Text>
              <Title level={4} style={{ margin: 0, color: "#cf1322" }}>
                {(
                  (selectedSellItem?.marketPrice - selectedSellItem?.avgPrice) *
                  sellQuantity
                ).toLocaleString()}{" "}
                VND
              </Title>
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
      </Content>
      {/* 3. FOOTER */}
      <Footer style={{ textAlign: "center" }}>
        Stock App ©2025 Created by Cloudz
      </Footer>
    </Layout>
  );
}

export default App;
