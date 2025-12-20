import { Card, Statistic, Button } from 'antd';
import { PlusCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';

const StatsCard = ({ balance, onDeposit, onWithdraw }) => {
  return (
    <Card
      style={{
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        textAlign: 'center',
      }}
    >
      <Statistic
        title="Tài sản ròng (Net Worth)"
        value={balance || 0}
        precision={0}
        style={{
          color: '#3f8600',
          fontSize: 30,
          fontWeight: 'bold',
        }}
      />
      <div style={{ marginTop: 20, display: 'flex', gap: 10, justifyContent: 'center' }}>
        <Button
          type="primary"
          icon={<PlusCircleOutlined />}
          size="large"
          onClick={onDeposit}
        >
          Nạp Tiền
        </Button>
        <Button
          danger
          icon={<MinusCircleOutlined />}
          size="large"
          onClick={onWithdraw}
        >
          Rút Tiền
        </Button>
      </div>
    </Card>
  );
};

export default StatsCard;