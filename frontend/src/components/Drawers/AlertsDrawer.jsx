import { Drawer, Table, Button, Tag, message, Empty } from "antd";
import { DeleteOutlined, BellOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import axiosClient from "../../services/axios-client";
import { getAlertColumns } from "../../constants/tableColumns";

const AlertsDrawer = ({ open, onClose, refreshTrigger }) => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch danh sách alert mỗi khi mở drawer hoặc khi mới tạo xong (refreshTrigger)
  useEffect(() => {
    if (open) {
      fetchAlerts();
    }
  }, [open, refreshTrigger]);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get("/alerts");
      setAlerts(res.data);
    } catch {
      message.error("Lỗi tải danh sách cảnh báo");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosClient.delete(`/alerts/${id}`);
      message.success("Đã xóa cảnh báo");
      fetchAlerts(); // Reload lại sau khi xóa
    } catch {
      message.error("Xóa thất bại");
    }
  };

  const alertColumns = getAlertColumns(handleDelete);



  return (
    <Drawer
      title={<span><BellOutlined /> Danh Sách Cảnh Báo Giá</span>}
      size={600}
      onClose={onClose}
      open={open}
    >
      <Table
        dataSource={alerts}
        columns={alertColumns}
        rowKey="id"
        pagination={false}
        loading={loading}
        locale={{ emptyText: <Empty description="Chưa có cảnh báo nào" /> }}
      />
    </Drawer>
  );
};

export default AlertsDrawer;