import { Layout, Dropdown, Avatar, Button } from "antd";
import {
  StockOutlined,
  UserOutlined,
  LogoutOutlined,
  DownOutlined,
  TrophyOutlined,
  BulbOutlined,
  BulbFilled,
} from "@ant-design/icons";

const { Header } = Layout;

const AppHeader = ({
  userInfo,
  onLogout,
  onShowLeaderboard,
  isDarkMode,
  onToggleTheme,
}) => {
  const userMenu = {
    items: [
      {
        key: "1",
        label: "Hồ sơ cá nhân",
        icon: <UserOutlined />,
      },
      { type: "divider" },
      {
        key: "2",
        label: "Đăng xuất",
        icon: <LogoutOutlined />,
        danger: true,
        onClick: onLogout,
      },
    ],
  };

  return (
    <Header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "#001529",
        padding: "0 50px",
      }}
    >
      {/* Logo */}
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

      {/* Right side */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {/* Dark Mode Toggle */}
        <Button
          type="text"
          icon={
            isDarkMode ? (
              <BulbFilled style={{ color: "#faad14", fontSize: 20 }} />
            ) : (
              <BulbOutlined style={{ color: "white", fontSize: 20 }} />
            )
          }
          onClick={onToggleTheme}
          style={{ color: "white" }}
          //   title={isDarkMode ? "Light" : "Dark"}
        ></Button>
        {/* Leaderboard Button */}
        <Button
          type="text"
          icon={<TrophyOutlined style={{ color: "gold", fontSize: 20 }} />}
          onClick={onShowLeaderboard}
          style={{ color: "white" }}
        >
          Top Trader
        </Button>

        {/* User Dropdown */}
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
      </div>
    </Header>
  );
};

export default AppHeader;
