import { useState, useEffect } from 'react';
import { Modal, InputNumber, Space, Alert, Tabs, Typography } from 'antd';
import { message } from 'antd';
import axiosClient from '../../services/axios-client';
import { ORDER_TYPES, MIN_BUY_QUANTITY, DEFAULT_BUY_QUANTITY } from '../../constants/config';
import { formatCurrency } from '../../utils/formatters';

const {Text} = Typography

const BuyModal = ({ 
  open, 
  stock, 
  onClose, 
  onSuccess 
}) => {
  const [orderType, setOrderType] = useState(ORDER_TYPES.MARKET);
  const [quantity, setQuantity] = useState(DEFAULT_BUY_QUANTITY);
  const [targetPrice, setTargetPrice] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (stock && open) {
      setTargetPrice(stock.price);
      setQuantity(DEFAULT_BUY_QUANTITY);
      setOrderType(ORDER_TYPES.MARKET);
    }
  }, [stock, open]);

  const handleBuy = async () => {
    if (!stock) return;

    setLoading(true);
    try {
      if (orderType === ORDER_TYPES.MARKET) { // Mua ngay
        const res = await axiosClient.post('/users/buy', {
          symbol: stock.symbol,
          quantity,
          price: stock.price,
        });

        message.success(
          `Mua thành công! Số dư: ${formatCurrency(res.data.currentBalance)} VND`
        );
      } else { // Đặt lệnh
        if (targetPrice <= 0) { 
          message.error('Vui lòng nhập giá hợp lệ!');
          setLoading(false);
          return;
        }

        const res = await axiosClient.post('/orders/place', {
          symbol: stock.symbol,
          direction: 'BUY',
          quantity,
          targetPrice,
        });

        if (res.data.status === 'MATCHED') {
            message.success(`Khớp lệnh ngay lập tức! Đã mua ${quantity} ${stock.symbol}`);
        } else {
            message.info('Đã đặt lệnh chờ. Vui lòng theo dõi trong Sổ Lệnh.');
        }
      }

      onSuccess();
      onClose();
    } catch (error) {
      message.error(error.response?.data?.message || 'Lỗi hệ thống');
    } finally {
      setLoading(false);
    }
  };

  const total = orderType === ORDER_TYPES.MARKET 
    ? stock?.price * quantity 
    : targetPrice * quantity;

  return (
    <Modal
      title={`Đặt Lệnh Mua: ${stock?.symbol}`}
      open={open}
      onOk={handleBuy}
      onCancel={onClose}
      okText={orderType === ORDER_TYPES.MARKET ? 'Mua Ngay' : 'Đặt Lệnh Chờ'}
      confirmLoading={loading}
    >
      <Tabs
        activeKey={orderType}
        onChange={(key) => {
          setOrderType(key);
          if (key === ORDER_TYPES.LIMIT) setTargetPrice(stock?.price);
        }}
        items={[
          {
            key: ORDER_TYPES.MARKET,
            label: 'Lệnh Thị Trường',
            children: (
              <Space orientation="vertical" style={{ width: '100%' }}>
                <Alert
                  title="Lệnh sẽ khớp ngay với giá hiện tại"
                  type="warning"
                  showIcon
                />
                <div>
                  <Text>Số lượng:</Text>
                  <InputNumber
                    min={MIN_BUY_QUANTITY}
                    value={quantity}
                    onChange={setQuantity}
                    style={{ width: '100%', marginTop: 8 }}
                  />
                </div>
                <div style={{ textAlign: 'right', marginTop: 10 }}>
                  <Text>Tổng tiền: </Text>
                  <Text strong style={{ color: '#1890ff', fontSize: 16 }}>
                    {formatCurrency(total)} VND
                  </Text>
                </div>
              </Space>
            ),
          },
          {
            key: ORDER_TYPES.LIMIT,
            label: 'Lệnh Giới Hạn',
            children: (
              <Space direction="vertical" style={{ width: '100%' }}>
                <Alert
                  message="Lệnh chỉ khớp khi giá chạm mức bạn đặt"
                  type="info"
                  showIcon
                />
                <div>
                  <Text>Giá muốn mua:</Text>
                  <InputNumber
                    value={targetPrice}
                    onChange={setTargetPrice}
                    style={{ width: '100%', marginTop: 8 }}
                  />
                </div>
                <div>
                  <Text>Số lượng:</Text>
                  <InputNumber
                    min={MIN_BUY_QUANTITY}
                    value={quantity}
                    onChange={setQuantity}
                    style={{ width: '100%', marginTop: 8 }}
                  />
                </div>
                <div style={{ textAlign: 'right', marginTop: 10 }}>
                  <Text>Tổng tiền: </Text>
                  <Text strong style={{ color: '#1890ff', fontSize: 16 }}>
                    {formatCurrency(total)} VND
                  </Text>
                </div>
              </Space>
            ),
          },
        ]}
      />
    </Modal>
  );
};

export default BuyModal;