import { useState } from 'react';
import { Modal, InputNumber, Space, Alert, Typography, Tag, message } from 'antd';
import axiosClient from '../../services/axios-client';

const {Text} = Typography;

const BankingModal = ({ open, type, onClose, onSuccess }) => {
  const [amount, setAmount] = useState(100000);
  const [loading, setLoading] = useState(false);

  const isDeposit = type === 'DEPOSIT';

  const handleDeposit = async () => {
    try {
      const res = await axiosClient.post('/payment/create_url', { amount });

      if (res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Lỗi nạp tiền');
    }
  };

  const handleWithdraw = async () => {
    setLoading(true);
    try {
      await axiosClient.post('/users/withdraw', { amount });
      message.success(`Rút thành công ${amount.toLocaleString()} VND`);

      onSuccess();
      onClose();
    } catch (error) {
      message.error(error.response?.data?.message || 'Lỗi rút tiền');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (isDeposit) {
      handleDeposit();
    } else {
      handleWithdraw();
    }
  };

  const quickAmounts = [50000, 100000, 200000, 500000];

  return (
    <Modal
      title={isDeposit ? 'Nạp Tiền Vào Tài Khoản' : 'Rút Tiền Về Ngân Hàng'}
      open={open}
      onOk={handleSubmit}
      onCancel={onClose}
      okText="Xác Nhận"
      okButtonProps={{ danger: !isDeposit, loading }}
    >
      <Space orientation="vertical" style={{ width: '100%' }}>
        <Alert
          title ={
            isDeposit
              ? 'Tiền sẽ được cộng ngay vào tài khoản'
              : 'Tiền sẽ bị trừ khỏi tài khoản ngay lập tức'
          }
          type={isDeposit ? 'success' : 'warning'}
          showIcon
        />

        <div style={{ marginTop: 10 }}>
          <Text>Nhập số tiền: </Text>
          <InputNumber
            style={{ width: '100%', marginTop: 8 }}
            size="large"
            value={amount}
            onChange={setAmount}
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
            }
            parser={(value) => value?.replace(/\$\s?|(,*)/g, '')}
            min={10000}
          />
        </div>

        <Space wrap style={{ marginTop: 10 }}>
          {quickAmounts.map((amt) => (
            <Tag
              color="blue"
              style={{ cursor: 'pointer', fontSize: 14, padding: '4px 12px' }}
              onClick={() => setAmount(amt)}
              key={amt}
            >
              +{amt.toLocaleString()}
            </Tag>
          ))}
        </Space>
      </Space>
    </Modal>
  );
};

export default BankingModal;