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
  Tabs,
  notification,
  Tooltip,
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
  OrderedListOutlined,
  PlusCircleOutlined,
  MinusCircleOutlined,
  TrophyOutlined,
  LineChartOutlined,
} from "@ant-design/icons";
import { Content, Footer, Header } from "antd/es/layout/layout";
import axiosClient from "./services/axios-client";
import LoginPage from "./components/LoginPage";
import StockChartModal from "./components/StockChartModal";

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

  const [orderType, setOrderType] = useState("MARKET"); // Loại lệnh: MARKET/ LIMIT
  const [targetPrice, setTargetPrice] = useState(0); // Giá mục tiêu cho lệnh Limit

  const [isOrdersDrawerOpen, setIsOrdersDrawerOpen] = useState(false); // Drawer quản lý lệnh chờ
  const [myOrders, setMyOrders] = useState([]);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false); // Drawer Portfolio
  const [isHistoryOpen, setIsHistoryOpen] = useState(false); // Drawer Lịch sử

  const [isBankingModalOpen, setIsBankingModalOpen] = useState(false);
  const [bankingType, setBankingType] = useState(""); // DEPOST - WITHDRAW
  const [bankingAmount, setBankingAmount] = useState(100000);

  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState([]);

  const [isChartModalOpen, setIsChartModalOpen] = useState(false);
  const [chartStock, setChartStock] = useState(null); // Mã CK đang được chọn => xem biểu đồ tương ứng

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

  useEffect(() => {
    if (!isAuthenticated || !userInfo) return; // Cần userInfo để biết ID mà join room
    console.log("Dang ket noi...");

    const socket = io("http://localhost:3000");

    // 1. Join room khi vừa kết nối
    socket.on("connect", () => {
      // Gửi ID của mình lên để BE nhốt vào phòng
      socket.emit("join-room", userInfo.id);
    });

    // 2. Lắng nghe sk khớp lệnh
    socket.on("order-matched", (data) => {
      notification.success({
        title: "Khớp Lệnh Thành Công",
        description: `${data.message} (SL: ${data.quantity} - Giá: ${data.price})`,
        placement: "topRight",
        duration: 4,
      });
      // Tự động reload lại
      setRefreshKey((prev) => !prev);

      fetchMyOrders();
    });

    // 3. Lắng nghe gtt
    socket.on("market-update", (dataTuServerGuive) => {
      console.log("Nhan duoc gia moi: ", dataTuServerGuive);

      setStocks(dataTuServerGuive);
    });
    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated, userInfo]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const vnpStatus = urlParams.get("vnp_status");

    if (vnpStatus) {
      window.history.replaceState({}, document.title, "/");
      if (vnpStatus === "success") {
        message.success("Nạp tiền VNPAY thành công");

        setTimeout(() => {
          setRefreshKey((prev) => !prev);
        }, 500);
      } else if (vnpStatus === "fail") {
        message.error("Giao dịch VNPAY thất bại hoặc bị hủy.");
      }
    }
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const res = await axiosClient.get("users/leaderboard");
      setLeaderboardData(res.data);
      setIsLeaderboardOpen(true);
    } catch {
      message.error("Lỗi tải bảng xếp hạng");
    }
  };

  const showChart = (stockRecord) => {
    setChartStock(stockRecord);
    setIsChartModalOpen(true);
  };

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
      if (orderType === "MARKET") {
        const res = await axiosClient.post("/users/buy", {
          symbol: selectedBuyStock.symbol,
          quantity: buyQuantity,
          price: selectedBuyStock.price, // Giá của mã đang chọn - mua luôn ko cần khớp
        });

        message.success(
          `Mua khớp lệnh ngay thành công. Số dư còn lại: ${res.data.currentBalance.toLocaleString()} VND`
        );
      } else {
        if (targetPrice <= 0) {
          message.error("Vui lòng nhập giá muốn mua hợp lệ!");
          return;
        }

        await axiosClient.post("/orders/place", {
          symbol: selectedBuyStock.symbol,
          direction: "BUY",
          quantity: buyQuantity,
          targetPrice: targetPrice, // Giá mà bản thân mong muốn - khớp mới mua
        });
        message.success("Đã đặt lệnh chờ mua thành công");
      }

      setIsBuyModalOpen(false);
      setRefreshKey((prev) => !prev);
    } catch (error) {
      message.error(`That bai: ${error.res?.data?.message || "Loi he thong"}`);
    }
  };

  const handleSellOk = async () => {
    if (!selectedSellItem) return;

    try {
      if (orderType === "MARKET") {
        const res = await axiosClient.post("/users/sell", {
          symbol: selectedSellItem.symbol,
          quantity: sellQuantity,
          price: selectedSellItem.marketPrice, // Ban theo gtt
        });

        message.success(
          `Bán ngay thành công. Số dư còn lại: ${res.data.currentBalance.toLocaleString()} VND`
        );
      } else {
        if (targetPrice <= 0) {
          message.error("Vui lòng nhập giá mong muốn bán hợp lệ!");
        }

        await axiosClient.post("/orders/place", {
          symbol: selectedSellItem.symbol,
          direction: "SELL",
          quantity: sellQuantity,
          targetPrice: targetPrice, // Gtt lên cao - khớp mới bán
        });
        message.success(`Đã đặt lệnh chờ bán thành công`);
      }

      setIsSellModalOpen(false);
      setRefreshKey((prev) => !prev);
    } catch (error) {
      message.error(`That bai: ${error.res?.data?.message || "Loi he thong"}`);
    }
  };

  const handleLogOut = () => {
    localStorage.removeItem("access_token");
    setUserInfo(null); // Xóa dl trong RAM
    setIsAuthenticated(false);
    message.info("Đăng xuất thành công");
  };

  // Nạp/ Rút
  const handleDeposit = async () => {
    try {
      const res = await axiosClient.post("/payment/create_url", {
        amount: bankingAmount,
      });

      // Chuyển hướng
      if (res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (error) {
      message.error(error.respone?.data?.message || "Lỗi nạp tiền");
    }
  };

  const handleWithdraw = async () => {
    try {
      await axiosClient.post("users/withdraw", { amount: bankingAmount });
      message.success(`Rút thành công ${bankingAmount.toLocaleString()} VND`);

      setIsBankingModalOpen(false);
      setRefreshKey((prev) => !prev);
    } catch (error) {
      message.error(error.respone?.data?.message || "Lỗi rút tiền");
    }
  };

  // Hàm điều phối do nạp/ rút chung modal
  const onBankingSubmit = () => {
    if (bankingType === "DEPOSIT") {
      handleDeposit();
    } else {
      handleWithdraw();
    }
  };

  const fetchTradeHistory = async () => {
    try {
      const res = await axiosClient.get("users/history");
      setHistoryData(res.data);
      setIsHistoryOpen(true);
    } catch {
      message.error("Không tải được lịch sử");
    }
  };

  const fetchMyOrders = async () => {
    try {
      const res = await axiosClient.get("/orders/my-orders");
      setMyOrders(res.data);
      setIsOrdersDrawerOpen(true);
    } catch {
      message.error("Lỗi tải danh sách lệnh");
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
      title: "Mã Chứng Khoán",
      dataIndex: "symbol",
      key: "symbol",
      align: "center",
      render: (text) => (
        <Tag color="blue" style={{ fontSize: 16 }}>
          {text}
        </Tag>
      ), //chinh sua cach hien thi
    },
    {
      title: "Giá Thị Trường",
      dataIndex: "price",
      key: "price",
      align: "center",
      render: (price) => {
        return (
          <Text strong style={{ fontSize: 16, color: "green" }}>
            {price.toFixed(2)}
          </Text>
        );
      },
    },
    {
      title: "Biến Động",
      key: "change",
      align: "center",
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
      title: "Hành Động",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Space>
          <Tooltip>
            <Button
              icon={<LineChartOutlined />}
              onClick={() => showChart(record)}
            ></Button>
          </Tooltip>

          <Button
            type="primary"
            size="medium"
            onClick={() => showBuyModal(record)}
          >
            Mua ngay
          </Button>
        </Space>
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

  const OrderColumns = [
    {
      title: "Thời gian",
      dataIndex: "createdAt",
      render: (d) => new Date(d).toLocaleString("vi-VN"),
    },
    { title: "Mã", dataIndex: "symbol", render: (t) => <b>{t}</b> },
    {
      title: "Loại",
      dataIndex: "direction",
      render: (t) => <Tag color={t === "BUY" ? "blue" : "volcano"}>{t}</Tag>,
    },
    { title: "SL", dataIndex: "quantity" },
    {
      title: "Giá đặt",
      dataIndex: "targetPrice",
      render: (p) => Number(p).toLocaleString(),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (s) => {
        let color = "default";
        if (s === "MATCHED") color = "success";
        if (s === "PENDING") color = "processing";
        if (s === "CANCELLED") color = "error";
        return <Tag color={color}>{s}</Tag>;
      },
    },
  ];

  const leaderboardColumns = [
    {
      title: "Hạng",
      key: "rank",
      render: (_, __, index) => {
        // Top 1, 2, 3 có icon huy chương
        if (index === 0) return <span style={{ fontSize: 20 }}>🥇</span>;
        if (index === 1) return <span style={{ fontSize: 20 }}>🥈</span>;
        if (index === 2) return <span style={{ fontSize: 20 }}>🥉</span>;
        return <Tag>{index + 1}</Tag>;
      },
    },
    {
      title: "Nhà đầu tư",
      dataIndex: "username",
      render: (name, record) => (
        <span>
          <Avatar
            style={{ backgroundColor: "#87d068", marginRight: 8 }}
            icon={<UserOutlined />}
          />
          {name} {record.id === userInfo?.id && <Tag color="blue">Bạn</Tag>}
        </span>
      ),
    },
    {
      title: "Tổng Tài Sản",
      dataIndex: "totalNetWorth",
      render: (v) => (
        <Text strong style={{ color: "#cf1322", fontSize: 16 }}>
          {Number(v).toLocaleString()}
        </Text>
      ),
      sorter: (a, b) => a.totalNetWorth - b.totalNetWorth,
      defaultSortOrder: "descend",
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
    return <Spin fullscreen tip="Loading..." size="large" />;
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
        {/* Ben phai: Ten + Ava (dropdown) */}
        <Button
          type="text"
          icon={<TrophyOutlined style={{ color: "gold", fontSize: 20 }} />}
          onClick={fetchLeaderboard}
          style={{ color: "white" }}
        >
          Top Trader
        </Button>
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
      <Content
        style={{
          padding: "16px 24px",
          width: "100%",
          maxWidth: "100%",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            maxWidth: "1400px", // Giới hạn max width cho desktop
            margin: "0 auto",
            width: "100%",
          }}
        >
          <Row gutter={16} style={{ marginBottom: 20 }}>
            <Col xs={24} md={10}>
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
                <div style={{ marginTop: 15, display: "flex", gap: 10 }}>
                  <Button
                    type="primary"
                    icon={<PlusCircleOutlined />}
                    onClick={() => {
                      setBankingType("DEPOSIT"), setIsBankingModalOpen(true);
                    }}
                  >
                    {" "}
                    Nạp{" "}
                  </Button>
                  <Button
                    danger
                    icon={<MinusCircleOutlined />}
                    onClick={() => {
                      setBankingType("WITHDRAW"), setIsBankingModalOpen(true);
                    }}
                  >
                    {" "}
                    Rút{" "}
                  </Button>
                </div>
              </Card>
            </Col>
            <Col xs={24} md={14}>
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
                  <Button
                    size="large"
                    icon={<OrderedListOutlined />}
                    onClick={fetchMyOrders}
                  >
                    Sổ Lệnh
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
          style={{
            marginTop: 20,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            textAlign: "center",
          }}
        >
          <Table
            scroll={{ x: "max-content" }}
            dataSource={stocks}
            columns={columns}
            rowKey="symbol"
            pagination={false} // tat phan trang
            bordered
          />
        </Card>

        {/* Modal */}
        <Modal
          title={`Đặt Lệnh Mua: ${selectedBuyStock?.symbol}`}
          open={isBuyModalOpen}
          onOk={handleBuyOk}
          onCancel={() => setIsBuyModalOpen(false)}
          okText={orderType === "MARKET" ? "Mua Ngay" : "Đặt Lệnh Chờ"}
        >
          <Tabs
            defaultActiveKey="MARKET"
            onChange={(key) => {
              setOrderType(key);
              if (key === "LIMIT") setTargetPrice(selectedBuyStock?.price); // Đổi tab limit => điền sẵn giá mong muốn = gtt hiện tại
            }}
            items={[
              {
                key: "MARKET",
                label: "Lệnh Thị Trường (Market Price)",
                children: (
                  <Space orientation="vertical" style={{ width: "100%" }}>
                    <Alert
                      title="Lệnh sẽ khớp ngay lập tức với giá hiện tại"
                      type="warning"
                      showIcon
                    />
                    <div>
                      <InputNumber
                        min={10}
                        value={buyQuantity}
                        onChange={setBuyQuantity}
                        style={{ width: "100%" }}
                      />
                      <div style={{ textAlign: "right", marginTop: 10 }}>
                        <Text>Tổng tiền dự kiến: </Text>
                        <Text strong style={{ color: "#1890ff", fontSize: 16 }}>
                          {(
                            selectedBuyStock?.price * buyQuantity
                          ).toLocaleString()}{" "}
                          VND
                        </Text>
                      </div>
                    </div>
                  </Space>
                ),
              },
              {
                key: "LIMIT",
                label: "Lệnh Giới Hạn (Limit Order)",
                children: (
                  <Space orientation="vertical" style={{ width: "100%" }}>
                    <Alert
                      title="Lệnh chỉ khớp khi giá thị trường CHẠM mức giá bạn đặt"
                      type="info"
                      showIcon
                    />

                    <div style={{ marginTop: 10 }}>
                      <Text>Giá muốn mua (Target Price): </Text>
                      <InputNumber
                        style={{ width: "100%" }}
                        value={targetPrice}
                        onChange={setTargetPrice}
                      />
                    </div>
                    <InputNumber
                      min={10}
                      value={buyQuantity}
                      onChange={setBuyQuantity}
                      style={{ width: "100%" }}
                    />
                    <div style={{ textAlign: "right", marginTop: 10 }}>
                      <Text>Tổng tiền dự kiến: </Text>
                      <Text strong style={{ color: "#1890ff", fontSize: 16 }}>
                        {(targetPrice * buyQuantity).toLocaleString()} VND
                      </Text>
                    </div>
                  </Space>
                ),
              },
            ]}
          />
        </Modal>
        <Modal
          title={`Đặt Lệnh Bán: ${selectedSellItem?.symbol}`}
          open={isSellModalOpen}
          onOk={handleSellOk}
          onCancel={() => setIsSellModalOpen(false)}
          okText={orderType === "MARKET" ? "Bán Ngay" : "Đặt Lệnh Chờ"}
        >
          <Tabs
            defaultActiveKey="MARKET"
            onChange={(key) => {
              setOrderType(key);
              if (key === "LIMIT") setTargetPrice(selectedSellItem?.marketPrice); // Đổi tab limit => điền sẵn giá mong muốn = gtt hiện tại
            }}
            items={[
              {
                key: "MARKET",
                label: "Lệnh Thị Trường (Market Price)",
                children: (
                  <Space orientation="vertical" style={{ width: "100%" }}>
                    <Alert
                      title="Lệnh sẽ khớp ngay lập tức với giá hiện tại"
                      type="warning"
                      showIcon
                    />
                    <div>
                      <InputNumber
                        min={10}
                        value={sellQuantity}
                        onChange={setSellQuantity}
                        style={{ width: "100%" }}
                      />
                      <div style={{ textAlign: "right", marginTop: 10 }}>
                        <Text>Tổng tiền dự kiến: </Text>
                        <Text strong style={{ color: "#1890ff", fontSize: 16 }}>
                          {(
                            selectedSellItem?.marketPrice * sellQuantity
                          ).toLocaleString()}{" "}
                          VND
                        </Text>
                      </div>
                    </div>
                  </Space>
                ),
              },
              {
                key: "LIMIT",
                label: "Lệnh Giới Hạn (Limit Order)",
                children: (
                  <Space orientation="vertical" style={{ width: "100%" }}>
                    <Alert
                      title="Lệnh chỉ khớp khi giá thị trường CHẠM mức giá bạn đặt"
                      type="info"
                      showIcon
                    />

                    <div style={{ marginTop: 10 }}>
                      <Text>Giá muốn bán (Target Price): </Text>
                      <InputNumber
                        style={{ width: "100%" }}
                        value={targetPrice}
                        onChange={setTargetPrice}
                      />
                    </div>
                    <InputNumber
                      min={10}
                      value={sellQuantity}
                      onChange={setSellQuantity}
                      style={{ width: "100%" }}
                    />
                    <div style={{ textAlign: "right", marginTop: 10 }}>
                      <Text>Tổng tiền dự kiến: </Text>
                      <Text strong style={{ color: "#1890ff", fontSize: 16 }}>
                        {(targetPrice * sellQuantity).toLocaleString()} VND
                      </Text>
                    </div>
                  </Space>
                ),
              },
            ]}
          />
        </Modal>
        <Modal
          title={
            bankingType === "DEPOSIT"
              ? "Nạp Tiền Vào Tài Khoản"
              : "Rút Tiền Về Ngân Hàng"
          }
          open={isBankingModalOpen}
          onOk={onBankingSubmit}
          onCancel={() => setIsBankingModalOpen(false)}
          okText="Xác Nhận"
          okButtonProps={{ danger: bankingType === "WITHDRAW" }}
        >
          <Space orientation="vertical" style={{ width: "100%" }}>
            <Alert
              title={
                bankingType === "DEPOSIT"
                  ? "Tiền sẽ được cộng ngay vào tài khoản"
                  : "Tiền sẽ bị trừ khỏi tài khoản ngay lập tức"
              }
              type={bankingType === "DEPOSIT" ? "success" : "warning"}
              showIcon
            />

            <div style={{ marginTop: 10 }}>
              <Text>Nhập số tiền: </Text>
              <InputNumber
                style={{ width: "100%" }}
                size="large"
                value={bankingAmount}
                onChange={setBankingAmount}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => value?.replace(/\$\s?|(,*)/g, "")}
                min={10000}
              />
            </div>
            <Space wrap>
              {[50000, 100000, 200000, 500000].map((amt) => (
                <Tag
                  color="blue"
                  style={{ cursor: "pointer" }}
                  onClick={() => setBankingAmount(amt)}
                  key={amt}
                >
                  +{amt.toLocaleString()}
                </Tag>
              ))}
            </Space>
          </Space>
        </Modal>
        <Modal
          title={<span>Bảng Xếp Hạng</span>}
          open={isLeaderboardOpen}
          onCancel={() => setIsLeaderboardOpen(false)}
          footer={null}
          width={800}
        >
          <Table
            dataSource={leaderboardData}
            columns={leaderboardColumns}
            pagination={false}
            rowKey="id"
          />
        </Modal>

        {isChartModalOpen && (
          <StockChartModal
            open={isChartModalOpen}
            onClose={() => setIsChartModalOpen(false)}
            stockSymbol={chartStock?.symbol}
            currentPrice={chartStock?.price}
          />
        )}
        {/* Drawer */}
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
        <Drawer
          title="Sổ Lệnh (Order Book)"
          placement="right"
          size={600}
          onClose={() => setIsOrdersDrawerOpen(false)}
          open={isOrdersDrawerOpen}
        >
          <Table
            dataSource={myOrders}
            columns={OrderColumns}
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
