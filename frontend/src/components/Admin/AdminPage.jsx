import {
  Card,
  message,
  Table,
  Typography,
  Row,
  Col,
  Statistic,
  Button,
  Tabs,
} from "antd";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import axiosClient from "../../services/axios-client";
import { stocksColumns, usersColumns } from "../../constants/tableColumns";
import {
  TeamOutlined,
  DollarCircleOutlined,
  UserAddOutlined,
  StockOutlined,
  PlusOutlined,
  UserOutlined,
} from "@ant-design/icons";

import CreateUserModal from "./Modals/CreateUserModal";
import EditUserModal from "./Modals/EditUserModal";
import CreateStockModal from "./Modals/CreateStockModal";
import EditStockModal from "./Modals/EditStockModal"; 

const { Title } = Typography;

const AdminPage = () => {
  // DỮ LIỆU 
  const [users, setUsers] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBots: 0,
    totalMoney: 0,
  });
  const [loading, setLoading] = useState(true);

  // MODALS USER
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // MODALS STOCK 
  const [isCreateStockModalOpen, setIsCreateStockModalOpen] = useState(false);
  const [editingStock, setEditingStock] = useState(null); // [MỚI] State lưu stock đang sửa

  // --- 1. INITIAL FETCH ---
  useEffect(() => {
    fetchAllData();
  }, []);

  // --- 2. DYNAMIC UPDATES (POLLING & SOCKET) ---
  useEffect(() => {
    // A. POLLING: Cập nhật User & Stats mỗi 10s
    const intervalId = setInterval(() => {
        fetchUsersAndStatsOnly();
    }, 10000);

    // B. SOCKET: Cập nhật giá Stock Real-time
    const socket = io("http://localhost:3000");
    
    socket.on("market-update", (data) => {
        // Cập nhật giá mới vào ds stocks hiện có
        setStocks(prevStocks => {
            return prevStocks.map(stock => {
                const update = data.find(s => s.symbol === stock.symbol);
                // Nếu có giá mới thì update giá, giữ nguyên tên cty/id
                if (update) {
                    return { ...stock, price: update.price };
                }
                return stock;
            });
        });
    });

    return () => {
        clearInterval(intervalId);
        socket.disconnect();
    };
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [resUser, resStats, resStocks] = await Promise.all([
        axiosClient.get("admin/users"),
        axiosClient.get("admin/stats"),
        axiosClient.get("/stocks"),
      ]);
      setUsers(resUser.data);
      setStats(resStats.data);
      setStocks(resStocks.data);
    } catch {
      message.error("Lỗi tải dữ liệu quản trị");
    } finally {
      setLoading(false);
    }
  };

  // Hàm chạy ngầm cho Polling
  const fetchUsersAndStatsOnly = async () => {
    try {
      const [resUser, resStats] = await Promise.all([
        axiosClient.get("admin/users"),
        axiosClient.get("admin/stats"),
      ]);
      setUsers(resUser.data);
      setStats(resStats.data);
    } catch (e) { console.error("Polling error", e); }
  };

  // HANDLERS USER
  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      await axiosClient.patch(`admin/users/${userId}/ban`, {
        isActive: !currentStatus,
      });
      message.success(`Đã cập nhật trạng thái user ${userId}`);
      fetchUsersAndStatsOnly(); 
    } catch {
      message.error("Thao tác thất bại");
    }
  };

  // HANDLERS STOCK 
  const handleDeleteStock = async (id, symbol) => {
    try {
      await axiosClient.delete(`/stocks/${id}`);
      message.success(`Đã hủy niêm yết mã ${symbol}`);
      const res = await axiosClient.get("/stocks");
      setStocks(res.data);
    } catch {
      message.error("Không thể xóa (Có thể do đang có lệnh treo)");
    }
  };

  const getUsersColumns = usersColumns(handleToggleStatus, setEditingUser);
  const getStocksColumns = stocksColumns(handleDeleteStock, setEditingStock); 

  // TAB
  const tabItems = [
    {
      key: '1',
      label: <span><UserOutlined /> Quản Lý Người Dùng</span>,
      children: (
        <>
          <div style={{ marginBottom: 16, textAlign: 'right' }}>
            <Button type="primary" icon={<UserAddOutlined />} onClick={() => setIsCreateUserModalOpen(true)}>
              Thêm Người Dùng
            </Button>
          </div>
          <Table dataSource={users} columns={getUsersColumns} rowKey="id" loading={loading} pagination={{ pageSize: 8 }} bordered />
        </>
      )
    },
    {
      key: '2',
      label: <span><StockOutlined /> Quản Lý Cổ Phiếu</span>,
      children: (
        <>
          <div style={{ marginBottom: 16, textAlign: 'right' }}>
            <Button type="primary" icon={<PlusOutlined />} style={{ backgroundColor: '#faad14', borderColor: '#faad14' }} onClick={() => setIsCreateStockModalOpen(true)}>
              Niêm Yết Mã Mới
            </Button>
          </div>
          <Table dataSource={stocks} columns={getStocksColumns} rowKey="id" loading={loading} pagination={{ pageSize: 8 }} bordered />
        </>
      )
    }
  ];

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: 20 }}>
      <Title level={2} style={{ marginBottom: 30 }}>Dashboard Quản Trị Viên 🛡️</Title>

      {/* STATS */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Card variant={false} style={{boxShadow: '0 2px 8px rgba(0,0,0,0.05)'}}>
            <Row gutter={16}>
              <Col span={12}><Statistic title="Tổng User" value={stats.totalUsers} prefix={<TeamOutlined />} valueStyle={{ color: "#3f8600" }} /></Col>
              <Col span={12}><Statistic title="Tổng Bot" value={stats.totalBots} prefix={<TeamOutlined />} valueStyle={{ color: "#faad14" }} /></Col>
            </Row>
          </Card>
        </Col>
        <Col span={12}>
          <Card variant={false} style={{boxShadow: '0 2px 8px rgba(0,0,0,0.05)'}}>
            <Statistic title="Tổng Tiền Hệ Thống (VND)" value={stats.totalMoney} precision={0} prefix={<DollarCircleOutlined />} valueStyle={{ color: "#cf1322" }} />
          </Card>
        </Col>
      </Row>

      {/* CONTENT TABS */}
      <Card variant={false} style={{boxShadow: '0 2px 8px rgba(0,0,0,0.05)'}}>
         <Tabs defaultActiveKey="1" items={tabItems} size="large" />
      </Card>

      {/*MODALS */}
      <CreateUserModal 
        open={isCreateUserModalOpen} 
        onClose={() => setIsCreateUserModalOpen(false)} 
        onSuccess={fetchUsersAndStatsOnly} 
      />
      {editingUser && (
        <EditUserModal 
          open={!!editingUser} 
          user={editingUser} 
          onClose={() => setEditingUser(null)} 
          onSuccess={fetchUsersAndStatsOnly} 
        />
      )}

      <CreateStockModal 
        open={isCreateStockModalOpen} 
        onClose={() => setIsCreateStockModalOpen(false)} 
        onSuccess={() => { fetchAllData(); }} // Reload tất cả để socket nhận mã mới
      />
      
      {editingStock && (
        <EditStockModal
          open={!!editingStock}
          stock={editingStock}
          onClose={() => setEditingStock(null)}
          onSuccess={() => { fetchAllData(); }}
        />
      )}

    </div>
  );
};

export default AdminPage;