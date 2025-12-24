import { useState, useEffect } from 'react';
import { Modal, InputNumber, Space, Alert, Tabs, Typography, message, Divider } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import axiosClient from '../../services/axios-client';
import { ORDER_TYPES, DEFAULT_BUY_QUANTITY } from '../../constants/config';
import { formatCurrency } from '../../utils/formatters';

const { Text, Title } = Typography;

const BuyModal = ({ open, stock, onClose, onSuccess }) => {
  const [orderType, setOrderType] = useState(ORDER_TYPES.MARKET);
  const [quantity, setQuantity] = useState(DEFAULT_BUY_QUANTITY);
  const [targetPrice, setTargetPrice] = useState(0);
  const [loading, setLoading] = useState(false);

  // State validation
  const [quantityStatus, setQuantityStatus] = useState(''); // '' | 'error'
  const [quantityHelp, setQuantityHelp] = useState('');

  // Reset form khi mở modal
  useEffect(() => {
    if (stock && open) {
      setTargetPrice(stock.price);
      setQuantity(DEFAULT_BUY_QUANTITY);
      setOrderType(ORDER_TYPES.MARKET);
      // Reset lỗi
      setQuantityStatus('');
      setQuantityHelp('');
    }
  }, [stock, open]);

  // VALIDATE
  const handleQuantityChange = (val) => {
    setQuantity(val);

    if (val === null || val === undefined) {
        setQuantityStatus('error');
        setQuantityHelp('Vui lòng nhập số lượng');
        return;
    }
    if (val <= 0) {
        setQuantityStatus('error');
        setQuantityHelp('Số lượng phải lớn hơn 0');
        return;
    }
    if (!Number.isInteger(val)) {
        setQuantityStatus('error');
        setQuantityHelp('Số lượng phải là số nguyên');
        return;
    }
    // Nếu OK
    setQuantityStatus('');
    setQuantityHelp('');
  };

  const handleBuy = async () => {
    if (!stock) return;

    // VALIDATE TRƯỚC KHI GỬI
    if (!quantity || quantity <= 0 || !Number.isInteger(quantity)) {
        message.error("Số lượng mua không hợp lệ!");
        return;
    }

    if (orderType === ORDER_TYPES.LIMIT && (!targetPrice || targetPrice <= 0)) {
        message.error("Giá đặt mua phải lớn hơn 0!");
        return;
    }

    setLoading(true);
    try {
      // 1. MARKET ORDER
      if (orderType === ORDER_TYPES.MARKET) {
        const res = await axiosClient.post('/users/buy', { 
          symbol: stock.symbol,
          quantity,
          price: stock.price,
        });

        message.success(
          `Mua thành công! Số dư mới: ${formatCurrency(res.data.currentBalance)} VND`
        );
      } 
      
      // 2. LIMIT ORDER
      else {
        const res = await axiosClient.post('/orders/place', {
          symbol: stock.symbol,
          direction: 'BUY',
          quantity,
          targetPrice,
        });
        if (res.data.status === 'MATCHED') {
            message.success(`Khớp lệnh ngay lập tức! Đã mua ${quantity} ${stock.symbol}`);
        } else {
            message.info('Đã đặt lệnh chờ mua. Vui lòng kiểm tra Sổ Lệnh.');
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

  // Tính tổng tiền dự kiến
  const calcPrice = orderType === ORDER_TYPES.MARKET ? stock?.price : targetPrice;
  const total = calcPrice * (quantity || 0);

  // Render Form Input dùng chung
  const renderFormContent = (isLimit) => (
    <Space orientation="vertical" style={{ width: '100%' }}>
        <Alert
            title={isLimit ? "Lệnh khớp khi giá thị trường GIẢM xuống mức bạn đặt" : "Mua ngay lập tức với giá hiện tại"}
            type={isLimit ? "info" : "warning"}
            showIcon
        />
        
        {/* Hiển thị giá hiện tại */}
        <div style={{marginTop: 5}}>
            <Text type="secondary">Giá thị trường: </Text>
            <Text strong style={{color: '#1890ff'}}>{formatCurrency(stock?.price)} VND</Text>
        </div>

        {/* Input Giá (Chỉ hiện nếu Limit) */}
        {isLimit && (
            <div>
                <Text>Giá muốn mua:</Text>
                <InputNumber
                    style={{ width: '100%', marginTop: 5 }}
                    value={targetPrice}
                    onChange={setTargetPrice}
                    min={0.01}
                    step={0.1}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value?.replace(/\$\s?|(,*)/g, '')}
                />
            </div>
        )}

        {/* Input Số lượng */}
        <div>
            <Text>Số lượng mua:</Text>
            <InputNumber
                min={1}
                step={1}
                value={quantity}
                onChange={handleQuantityChange}
                style={{ width: '100%', marginTop: 5 }}
                status={quantityStatus}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value?.replace(/\$\s?|(,*)/g, '')}
            />
            {quantityHelp && (
                <div style={{ color: '#ff4d4f', fontSize: 12, marginTop: 4 }}>
                    <InfoCircleOutlined /> {quantityHelp}
                </div>
            )}
        </div>

        <Divider style={{ margin: '10px 0' }} />

        {/* Tổng tiền */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text>Tổng thanh toán dự kiến:</Text>
            <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
                {formatCurrency(total)} VND
            </Title>
        </div>
    </Space>
  );

  return (
    <Modal
      title={`Đặt Lệnh Mua: ${stock?.symbol}`}
      open={open}
      onOk={handleBuy}
      onCancel={onClose}
      okText={orderType === ORDER_TYPES.MARKET ? 'Mua Ngay' : 'Đặt Lệnh'}
      confirmLoading={loading}
    >
      <Tabs
        activeKey={orderType}
        onChange={(key) => {
          setOrderType(key);
          if (key === ORDER_TYPES.LIMIT) setTargetPrice(stock?.price);
        }}
        items={[
          { key: ORDER_TYPES.MARKET, label: 'Lệnh Thị Trường', children: renderFormContent(false) },
          { key: ORDER_TYPES.LIMIT, label: 'Lệnh Giới Hạn', children: renderFormContent(true) },
        ]}
      />
    </Modal>
  );
};

export default BuyModal;