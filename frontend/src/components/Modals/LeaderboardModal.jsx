import { useState, useEffect } from 'react';
import { Modal, Table, message, Spin } from 'antd';
import { TrophyOutlined } from '@ant-design/icons';
import axiosClient from '../../services/axios-client';
import { getLeaderboardColumns } from '../../constants/tableColumns';

const LeaderboardModal = ({ open, onClose, currentUserId }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchLeaderboard();
    }
  }, [open]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/users/leaderboard');
      setData(res.data);
    } catch {
      message.error('Lỗi tải bảng xếp hạng');
    } finally {
      setLoading(false);
    }
  };

  const columns = getLeaderboardColumns(currentUserId);

  return (
    <Modal
      title={
        <span>
          <TrophyOutlined style={{ color: 'gold', marginRight: 8 }} />
          Bảng Xếp Hạng Top Trader
        </span>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      <Spin spinning={loading}>
        <Table
          dataSource={data}
          columns={columns}
          pagination={false}
          rowKey="id"
        />
      </Spin>
    </Modal>
  );
};

export default LeaderboardModal;