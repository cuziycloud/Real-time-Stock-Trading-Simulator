import { useState, useEffect } from 'react';
import { Modal, InputNumber, Alert, Typography, Divider, Space, Tabs, message } from 'antd';
import axiosClient from '../../services/axios-client';
import { calculateExpectedProfit } from '../../utils/calculations';
import { ORDER_TYPES, MIN_SELL_QUANTITY, DEFAULT_SELL_QUANTITY } from '../../constants/config';
import { formatCurrency } from '../../utils/formatters';

const {Text, Title} = Typography

const SellModal = ({ open, item, onClose, onSuccess }) => {
  const [orderType, setOrderType] = useState(ORDER_TYPES.MARKET);
  const [quantity, setQuantity] = useState(0);
  const [targetPrice, setTargetPrice] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (item && open) {
      setTargetPrice(item.price);
      setQuantity(DEFAULT_SELL_QUANTITY);
      setOrderType(ORDER_TYPES.MARKET);
    }
  }, [item, open]);

  const handleSell = async () => {
    if (!item) return;

    setLoading(true);
    try {
      if (orderType === ORDER_TYPES.MARKET) {
        // Bán ngay theo giá thị trường
        const res = await axiosClient.post('/users/sell', {
          symbol: item.symbol,
          quantity,
          price: item.marketPrice,
        });

        message.success(
          `Bán thành công! Số dư: ${formatCurrency(res.data.currentBalance)} VND`
        );
      } else {
        // Đặt lệnh chờ bán (Limit Order)
        if (targetPrice <= 0) {
          message.error('Vui lòng nhập giá mong muốn bán hợp lệ!');
          return;
        }

        await axiosClient.post('/orders/place', {
          symbol: item.symbol,
          direction: 'SELL',
          quantity,
          targetPrice,
        });

        message.success('Đã đặt lệnh chờ bán thành công');
      }

      onSuccess();
      onClose();
    } catch (error) {
      message.error(error.response?.data?.message || 'Lỗi hệ thống');
    } finally {
      setLoading(false);
    }
  };

  if (!item) return null;

  // Tính toán cho Market Order
  const marketRevenue = item.marketPrice * quantity;
  const marketProfit = calculateExpectedProfit(
    item.marketPrice,
    item.avgPrice,
    quantity
  );

  // Tính toán cho Limit Order
  const limitRevenue = targetPrice * quantity;
  const limitProfit = calculateExpectedProfit(
    targetPrice,
    item.avgPrice,
    quantity
  );

  const isProfitable = orderType === ORDER_TYPES.MARKET 
    ? marketProfit >= 0 
    : limitProfit >= 0;

  const totalRevenue = orderType === ORDER_TYPES.MARKET 
    ? marketRevenue 
    : limitRevenue;

  const expectedProfit = orderType === ORDER_TYPES.MARKET 
    ? marketProfit 
    : limitProfit;

  return (
    <Modal
      title={`Đặt Lệnh Bán: ${item.symbol}`}
      open={open}
      onOk={handleSell}
      onCancel={onClose}
      okText={orderType === ORDER_TYPES.MARKET ? 'Bán Ngay' : 'Đặt Lệnh Chờ'}
      cancelText="Hủy"
      confirmLoading={loading}
    >
      <Tabs
        activeKey={orderType}
        onChange={(key) => {
          setOrderType(key);
          if (key === ORDER_TYPES.LIMIT) setTargetPrice(item.marketPrice);
        }}
        items={[
          {
            key: ORDER_TYPES.MARKET,
            label: 'Lệnh Thị Trường',
            children: (
              <Space orientation="vertical" style={{ width: '100%' }}>
                <Alert
                  title="Lệnh sẽ bán ngay với giá thị trường hiện tại"
                  type="warning"
                  showIcon
                />
                <Alert
                  title={`Giá thị trường: ${formatCurrency(item.marketPrice)} VND`}
                  type="info"
                  showIcon
                />
                <Alert
                  title={`Giá vốn của bạn: ${formatCurrency(item.avgPrice)} VND`}
                  type="info"
                  showIcon
                />

                <div>
                  <Text>Số lượng bán (Max: {item.quantity}): </Text>
                  <InputNumber
                    min={1}
                    max={item.quantity}
                    value={quantity}
                    onChange={(value) => setQuantity(value)}
                    style={{ width: '100%', marginTop: 8 }}
                  />
                </div>

                <Divider style={{ margin: '10px 0' }} />

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Text>Tổng tiền thu về: </Text>
                  <Title level={4} style={{ margin: 0, color: '#008000' }}>
                    {formatCurrency(totalRevenue)} VND
                  </Title>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text>{isProfitable ? 'Lãi dự kiến:' : 'Lỗ dự kiến:'}</Text>
                  <Title
                    level={4}
                    style={{
                      margin: 0,
                      color: isProfitable ? '#3f8600' : '#cf1322',
                    }}
                  >
                    {formatCurrency(expectedProfit)} VND
                  </Title>
                </div>
              </Space>
            ),
          },
          {
            key: ORDER_TYPES.LIMIT,
            label: 'Lệnh Giới Hạn',
            children: (
              <Space orientation="vertical" style={{ width: '100%' }}>
                <Alert
                  title="Lệnh chỉ khớp khi giá thị trường CHẠM mức giá bạn đặt"
                  type="info"
                  showIcon
                />
                <Alert
                  title={`Giá vốn của bạn: ${formatCurrency(item.avgPrice)} VND`}
                  type="info"
                  showIcon
                />

                <div>
                  <Text>Giá muốn bán (Target Price): </Text>
                  <InputNumber
                    style={{ width: '100%', marginTop: 8 }}
                    value={targetPrice}
                    onChange={setTargetPrice}
                    min={0}
                  />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Lệnh sẽ khớp khi giá thị trường ≥ {formatCurrency(targetPrice)} VND
                  </Text>
                </div>

                <div>
                  <Text>Số lượng bán (Max: {item.quantity}): </Text>
                  <InputNumber
                    min={1}
                    max={item.quantity}
                    value={quantity}
                    onChange={(value) => setQuantity(value)}
                    style={{ width: '100%', marginTop: 8 }}
                  />
                </div>

                <Divider style={{ margin: '10px 0' }} />

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Text>Tổng tiền dự kiến: </Text>
                  <Title level={4} style={{ margin: 0, color: '#008000' }}>
                    {formatCurrency(totalRevenue)} VND
                  </Title>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text>{isProfitable ? 'Lãi dự kiến:' : 'Lỗ dự kiến:'}</Text>
                  <Title
                    level={4}
                    style={{
                      margin: 0,
                      color: isProfitable ? '#3f8600' : '#cf1322',
                    }}
                  >
                    {formatCurrency(expectedProfit)} VND
                  </Title>
                </div>
              </Space>
            ),
          },
        ]}
      />
    </Modal>
  );
};

export default SellModal;