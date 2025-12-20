import { useState, useEffect } from 'react';
import { Drawer, Table, message, Spin } from 'antd';
import { OrderedListOutlined } from '@ant-design/icons';
import axiosClient from '../../services/axios-client';
import { orderColumns } from '../../constants/tableColumns';

const OrdersDrawer = ({ open, onClose }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchOrders();
    }
  }, [open]);

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