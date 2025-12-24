import { useState, useEffect } from 'react';
import { Drawer, Table, message, Spin } from 'antd';
import { OrderedListOutlined } from '@ant-design/icons';
import axiosClient from '../../services/axios-client';
import { getOrderColumns } from '../../constants/tableColumns';

const OrdersDrawer = ({ open, onClose, refreshTrigger }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchOrders();
    }
  }, [open, refreshTrigger]); // Reload khi mở drawer / có lệnh khớp mới

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/orders/my-orders');
      setData(res.data);
    } catch {
      message.error('Lỗi tải danh sách lệnh');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      await axiosClient.delete(`/orders/cancel-order/${orderId}`);
      message.success("Đã hủy lệnh thành công");
      
      // Reload lại ds để thấy trạng thái đổi
      fetchOrders(); 
    } catch (error) {
      message.error(error.response?.data?.message || "Hủy thất bại");
    }
  };

  const orderColumns = getOrderColumns(handleCancelOrder);

  return (
    <Drawer
      title={
        <span>
          <OrderedListOutlined style={{ marginRight: 8 }} />
          Sổ Lệnh (Order Book)
        </span>
      }
      placement="right"
      size="large"
      onClose={onClose}
      open={open}
    >
      <Spin spinning={loading}>
        <Table
          dataSource={data}
          columns={orderColumns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          bordered
        />
      </Spin>
    </Drawer>
  );
};

export default OrdersDrawer;