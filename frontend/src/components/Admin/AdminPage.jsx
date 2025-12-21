import { Card, message, Table, Tag, Typography } from "antd";
import { useEffect, useState } from "react";
import axiosClient from "../../services/axios-client";
import { usersColumns } from "../../constants/tableColumns";
import { SafetyCertificateOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all users khi vào trang
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get("admin/users");
      setUsers(res.data);
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
      fetchUsers(); //Load lại ds users
    } catch {
      message.error("Thao tác ban/ unban thất bại");
    }
  };

  const getUsersColumns = usersColumns(handleToggleStatus);

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: 20 }}>
      <Card
        title={
          <span>
            <SafetyCertificateOutlined style={{ color: "#f5222d" }} /> Quản Trị
            Hệ Thống
          </span>
        }
        extra={<Tag color="purple">{users.length} Users</Tag>}
      >
        <Table
          dataSource={users}
          columns={getUsersColumns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 8 }}
        />
      </Card>
    </div>
  );
};

export default AdminPage;
