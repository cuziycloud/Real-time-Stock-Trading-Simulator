import {
  Card,
  message,
  Table,
  Typography,
  Row,
  Col,
  Statistic,
  Button,
} from "antd";
import { useEffect, useState } from "react";
import axiosClient from "../../services/axios-client";
import { usersColumns } from "../../constants/tableColumns";
import {
  TeamOutlined,
  DollarCircleOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import CreateUserModal from "../Modals/CreateUserModal";

const { Title, Text } = Typography;

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBots: 0,
    totalMoney: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Fetch all users khi vào trang
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resUser, resStats] = await Promise.all([
        axiosClient.get("admin/users"),
        axiosClient.get("admin/stats"),
      ]);
      setUsers(resUser.data);
      setStats(resStats.data);
      //console.log(resStats.data);
    } catch {
      message.error("Lỗi tải danh sách người dùng (Bạn có phải Admin không?)");
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý Ban/ Unban
  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      await axiosClient.patch(`admin/users/${userId}/ban`, {
        isActive: !currentStatus,
      });

      message.success(
        `Đã ${!currentStatus ? "mở khóa" : "khóa"} tài khoản ${userId}`
      );
      fetchData(); //Load lại
    } catch {
      message.error("Thao tác ban/ unban thất bại");
    }
  };

  const getUsersColumns = usersColumns(handleToggleStatus);

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: 20 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Title level={2} style={{ marginBottom: 30 }}>
          Trang chủ Quản trị viên
        </Title>
        <Button
          type="primary"
          icon={<UserAddOutlined />}
          size="large"
          onClick={() => setIsCreateModalOpen(true)}
        >
          Thêm Người Dùng
        </Button>
      </div>

      {/* THỐNG KÊ HỆ THỐNG */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Card variant={false}>
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="Tổng User"
                  value={stats.totalUsers}
                  prefix={<TeamOutlined />}
                  style={{ color: "#3f8600" }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Tổng Bot"
                  value={stats.totalBots}
                  prefix={<TeamOutlined />}
                  style={{ color: "#3f8600" }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
        <Col span={12}>
          <Card variant={false}>
            <Statistic
              title="Tổng Tiền Hệ Thống (VND) - Trừ Admin và Bot"
              value={stats.totalMoney}
              precision={0}
              prefix={<DollarCircleOutlined />}
              style={{ color: "#cf1322" }}
            />
          </Card>
        </Col>
      </Row>
      {/* BẢNG DS USER */}
      <Card title="Danh sách người dùng" variant={false}>
        <Table
          dataSource={users}
          columns={getUsersColumns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 8 }}
        />
      </Card>

      {/* Modal */}
      <CreateUserModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchData} // Reload lại bảng khi tạo xong
      />
    </div>
  );
};

export default AdminPage;
