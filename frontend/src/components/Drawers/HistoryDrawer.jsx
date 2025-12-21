import { useState, useEffect } from 'react';
import { Drawer, Table, message, Spin } from 'antd';
import { HistoryOutlined } from '@ant-design/icons';
import axiosClient from '../../services/axios-client';
import { historyColumns } from '../../constants/tableColumns';

const HistoryDrawer = ({ open, onClose }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchHistory();
    }
  }, [open]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/users/history');
      setData(res.data);
    } catch {
      message.error('Không tải được lịch sử');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      title={
        <span>
          <HistoryOutlined style={{ marginRight: 8 }} />
          Lịch Sử Giao Dịch
        </span>
      }
      placement="left"
      size="large"
      onClose={onClose}
      open={open}
    >
      <Spin spinning={loading}>
        <Table
          dataSource={data}
          columns={historyColumns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          bordered
        />
      </Spin>
    </Drawer>
  );
};

export default HistoryDrawer;