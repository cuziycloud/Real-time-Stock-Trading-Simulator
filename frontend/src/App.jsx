import { useState } from "react";
import {
  Row,
  Col,
  Layout,
  Spin,
  Card,
  Table,
  Typography,
  Space,
  Button,
  ConfigProvider,
  theme as antTheme,
} from "antd";
import {
  BellOutlined,
  DesktopOutlined,
  HistoryOutlined,
  ThunderboltFilled,
  UnorderedListOutlined,
} from "@ant-design/icons";

// Hooks
import { useAuth } from "./hooks/useAuth";
import { useSocket } from "./hooks/useSocket";
import { useUserData } from "./hooks/useUserData";
import { useTheme } from "./hooks/useTheme";

// Components
import LoginPage from "./components/LoginPage";
import AppHeader from "./components/Layout/AppHeader";
import AppFooter from "./components/Layout/AppFooter";
import StatsCard from "./components/Dashboard/StatsCard";
import ActionButtons from "./components/Dashboard/ActionButtons";
import BuyModal from "./components/Modals/BuyModal";
import SellModal from "./components/Modals/SellModal";
import BankingModal from "./components/Modals/BankingModal";
import LeaderboardModal from "./components/Modals/LeaderboardModal";
import StockChartModal from "./components/Modals/StockChartModal";
import PortfolioDrawer from "./components/Drawers/PortfolioDrawer";
import HistoryDrawer from "./components/Drawers/HistoryDrawer";
import OrdersDrawer from "./components/Drawers/OrdersDrawer";

// Utils & Constants
import { getStockColumns } from "./constants/tableColumns";
import { calculatePortfolioData } from "./utils/calculations";

// Styles
import "./App.css";
import AlertsDrawer from "./components/Drawers/AlertsDrawer";
import AddAlertModal from "./components/Modals/AddAlertModal";
import TelegramModal from "./components/Modals/TelegramModal";
import AdminPage from "./components/Admin/AdminPage";

const { Content } = Layout;
const { Title } = Typography;

function App() {
  // Theme
  const { isDarkMode, toggleTheme } = useTheme();

  // Auth
  const { isAuthenticated, handleLogin, handleLogout } = useAuth();

  // User Data
  const { userInfo, loading, refreshUserData } = useUserData(isAuthenticated);

  // Stocks & Real-time
  const [stocks, setStocks] = useState([]);

  // Socket connection
  useSocket(
    isAuthenticated,
    userInfo,
    (data) => setStocks(data), // onMarketUpdate
    () => refreshUserData() // onOrderMatched
  );

  // Modals
  const [buyModal, setBuyModal] = useState({ open: false, stock: null });
  const [sellModal, setSellModal] = useState({ open: false, item: null });
  const [bankingModal, setBankingModal] = useState({ open: false, type: "" });
  const [leaderboardModal, setLeaderboardModal] = useState(false);
  const [chartModal, setChartModal] = useState({ open: false, stock: null });
  const [telegramModal, setTelegramModal] = useState(false);
  const [addAlertModal, setAddAlertModal] = useState({
    open: false,
    symbol: null,
  });

  // Drawers
  const [portfolioDrawer, setPortfolioDrawer] = useState(false);
  const [historyDrawer, setHistoryDrawer] = useState(false);
  const [ordersDrawer, setOrdersDrawer] = useState(false);
  const [alertsDrawer, setAlertsDrawer] = useState(false);

  // Admin
  const [isAdminMode, setIsAdminMode] = useState(false);

  // Handlers
  const showBuyModal = (stock) => setBuyModal({ open: true, stock });
  const showSellModal = (item) => setSellModal({ open: true, item });
  const showChart = (stock) => setChartModal({ open: true, stock });
  const showAddAlert = (stockRecord) => {
    setAddAlertModal({ open: true, symbol: stockRecord.symbol });
  };

  // Portfolio calculation
  const portfolioData = calculatePortfolioData(userInfo?.portfolio, stocks);

  // Stock columns
  const stockColumns = getStockColumns(showChart, showBuyModal, showAddAlert);

  // Guard: Not authenticated
  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLogin} />;
  }

  // Guard: Loading
  if (loading) {
    return <Spin fullscreen tip="Đang tải..." size="large" />;
  }

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode
          ? antTheme.darkAlgorithm
          : antTheme.defaultAlgorithm,
      }}
    >
      <Layout style={{ minHeight: "100vh" }}>
        {/* Header */}
        <AppHeader
          userInfo={userInfo}
          isAdminMode={isAdminMode}
          onToggleAdminMode={() => setIsAdminMode(!isAdminMode)}
          onLogout={handleLogout}
          onShowLeaderboard={() => setLeaderboardModal(true)}
          onConnectTelegram={() => setTelegramModal(true)}
          isDarkMode={isDarkMode}
          onToggleTheme={toggleTheme}
        />

        {/* Content */}
        <Content style={{ padding: "24px" }}>
          {isAdminMode ? (
            <AdminPage />
          ) : (
            <div style={{ maxWidth: 1200, margin: "0 auto" }}>
              {/* Stats & Actions */}
              <Row gutter={[16, 16]}>
                <Col xs={24} lg={10}>
                  <StatsCard
                    balance={userInfo?.balance}
                    onDeposit={() =>
                      setBankingModal({ open: true, type: "DEPOSIT" })
                    }
                    onWithdraw={() =>
                      setBankingModal({ open: true, type: "WITHDRAW" })
                    }
                  />
                </Col>
                <Col xs={24} lg={14}>
                  <Card
                    style={{
                      height: "100%",
                      borderRadius: 12,
                    }}
                  >
                    <Typography.Text
                      type="secondary"
                      style={{
                        fontSize: 20,
                        marginBottom: 20,
                        display: "flex",
                        justifyContent: "center",
                        fontWeight: "bold",
                      }}
                    >
                      Chức năng nhanh
                    </Typography.Text>

                    <Row gutter={[16, 16]}>
                      <Col xs={12} md={6}>
                        <Button
                          block
                          size="large"
                          //type="primary"
                          icon={<DesktopOutlined />}
                          onClick={() => setPortfolioDrawer(true)}
                        >
                          Danh mục
                        </Button>
                      </Col>

                      <Col xs={12} md={6}>
                        <Button
                          block
                          size="large"
                          icon={<BellOutlined />}
                          onClick={() => setAlertsDrawer(true)}
                        >
                          Cảnh báo
                        </Button>
                      </Col>

                      <Col xs={12} md={6}>
                        <Button
                          block
                          size="large"
                          icon={<HistoryOutlined />}
                          onClick={() => setHistoryDrawer(true)}
                        >
                          Lịch sử
                        </Button>
                      </Col>

                      <Col xs={12} md={6}>
                        <Button
                          block
                          size="large"
                          icon={<UnorderedListOutlined />}
                          onClick={() => setOrdersDrawer(true)}
                        >
                          Sổ lệnh
                        </Button>
                      </Col>
                    </Row>
                  </Card>
                </Col>
              </Row>

              {/* Title */}
              <div style={{ textAlign: "center", margin: "40px 0 20px" }}>
                <Title level={2}>
                  <DesktopOutlined /> Sàn Chứng Khoán Real-time
                </Title>
              </div>

              {/* Table Card */}
              <Card
                variant={false}
                style={{
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                }}
                title={
                  <span>
                    <ThunderboltFilled
                      style={{ color: "#faad14", marginRight: 8 }}
                    />
                    Bảng Giá Trực Tuyến
                  </span>
                }
              >
                <Table
                  dataSource={stocks}
                  columns={stockColumns}
                  rowKey="symbol"
                  pagination={{ pageSize: 10 }}
                  scroll={{ x: "max-content" }}
                />
              </Card>
            </div>
          )}
        </Content>

        {/* Footer */}
        <AppFooter />

        {/* Modals */}
        <BuyModal
          open={buyModal.open}
          stock={buyModal.stock}
          onClose={() => setBuyModal({ open: false, stock: null })}
          onSuccess={refreshUserData}
        />

        <SellModal
          open={sellModal.open}
          item={sellModal.item}
          onClose={() => setSellModal({ open: false, item: null })}
          onSuccess={refreshUserData}
        />

        <BankingModal
          open={bankingModal.open}
          type={bankingModal.type}
          onClose={() => setBankingModal({ open: false, type: "" })}
          onSuccess={refreshUserData}
        />

        <LeaderboardModal
          open={leaderboardModal}
          onClose={() => setLeaderboardModal(false)}
          currentUserId={userInfo?.id}
        />

        <TelegramModal
          open={telegramModal}
          onClose={() => setTelegramModal(false)}
          onSuccess={refreshUserData} 
        />

        <AddAlertModal
          open={addAlertModal.open}
          defaultSymbol={addAlertModal.symbol}
          onClose={() => setAddAlertModal({ open: false, symbol: null })}
          onSuccess={() => {}}
          userInfo={userInfo}
          onOpenTelegram={() => setTelegramModal(true)}
        />

        <AlertsDrawer
          open={alertsDrawer}
          onClose={() => setAlertsDrawer(false)}
        />

        {chartModal.open && (
          <StockChartModal
            open={chartModal.open}
            onClose={() => setChartModal({ open: false, stock: null })}
            stockSymbol={chartModal.stock?.symbol}
            currentPrice={chartModal.stock?.price}
          />
        )}

        {/* Drawers */}
        <PortfolioDrawer
          open={portfolioDrawer}
          onClose={() => setPortfolioDrawer(false)}
          data={portfolioData}
          onSell={showSellModal}
        />

        <HistoryDrawer
          open={historyDrawer}
          onClose={() => setHistoryDrawer(false)}
        />

        <OrdersDrawer
          open={ordersDrawer}
          onClose={() => setOrdersDrawer(false)}
        />
      </Layout>
    </ConfigProvider>
  );
}

export default App;
