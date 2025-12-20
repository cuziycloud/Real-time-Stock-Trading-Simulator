import { Card, Space, Button } from 'antd';
import {
  WalletOutlined,
  HistoryOutlined,
  OrderedListOutlined,
} from '@ant-design/icons';

const ActionButtons = ({ onShowPortfolio, onShowHistory, onShowOrders }) => {
  return (
    <Card
      style={{
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        textAlign: 'center',
      }}
    >
      <Space size="large" wrap>
        <Button
          type="primary"
          size="large"
          icon={<WalletOutlined />}
          onClick={onShowPortfolio}
        >
          Quản lý Danh Mục
        </Button>
        <Button
          size="large"
          icon={<HistoryOutlined />}
          onClick={onShowHistory}
        >
          Lịch sử Giao Dịch
        </Button>
        <Button
          size="large"
          icon={<OrderedListOutlined />}
          onClick={onShowOrders}
        >
          Sổ Lệnh
        </Button>
      </Space>
    </Card>
  );
};

export default ActionButtons;