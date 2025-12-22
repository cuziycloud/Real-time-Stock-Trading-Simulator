import { useState, useEffect } from 'react';
import { Modal, InputNumber, Alert, Typography, Divider, Space, Tabs, message, Tag } from 'antd';
import axiosClient from '../../services/axios-client';
import { calculateExpectedProfit } from '../../utils/calculations';
import { ORDER_TYPES, MIN_SELL_QUANTITY, DEFAULT_SELL_QUANTITY } from '../../constants/config';
import { formatCurrency } from '../../utils/formatters';
import { InfoCircleOutlined } from '@ant-design/icons';

const {Text, Title} = Typography

const SellModal = ({ open, item, onClose, onSuccess }) => {
  const [orderType, setOrderType] = useState(ORDER_TYPES.MARKET);
  const [quantity, setQuantity] = useState(0);
  const [targetPrice, setTargetPrice] = useState(0);
  const [loading, setLoading] = useState(false);

  // State để quản lý trạng thái input (error/warning/null)
  const [quantityStatus, setQuantityStatus] = useState(''); // '' | 'error' | 'warning'
  const [quantityHelp, setQuantityHelp] = useState(''); // Text thông báo lỗi dưới ô input

  useEffect(() => {
    if (item && open) {
      setTargetPrice(item.price);
      setQuantity(item.quantity);
      setOrderType(ORDER_TYPES.MARKET);
      // Reset validation
      setQuantityStatus('');
      setQuantityHelp('');
    }
  }, [item, open]);

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
        setQuantityHelp('Số lượng phải là số nguyên (không được lẻ)');
        return;
    }
    if (val > item.quantity) {
        setQuantityStatus('warning');
        setQuantityHelp(`Vượt quá số lượng đang có (${item.quantity}). Sẽ tự động bán hết số hiện có.`);
        return;
    }
    setQuantityStatus('');
    setQuantityHelp('');
  }

  const handleSell = async () => {
    if (!item) return;

    // 1. Validate Số lượng
    if (!quantity || quantity <= 0) {
        message.error("Số lượng không hợp lệ!");
        return;
    }
    if (!Number.isInteger(quantity)) {
        message.error("Số lượng cổ phiếu phải là số nguyên!");
        return;
    }

    // 2. Auto-correct: Nếu nhập quá -> Lấy max
    let finalQuantity = quantity;
    if (quantity > item.quantity) {
        finalQuantity = item.quantity;
        message.warning(`Đã tự động điều chỉnh về số lượng tối đa: ${item.quantity}`);
    }

    // 3. Validate Giá (Nếu là Limit)
    if (orderType === ORDER_TYPES.LIMIT) {
        if (!targetPrice || targetPrice <= 0) {
            message.error("Giá đặt bán phải lớn hơn 0!");
            return;
        }
    }

    setLoading(true);
    try {
      if (orderType === ORDER_TYPES.MARKET) {
        // Bán ngay theo gtt
        const res = await axiosClient.post('/users/sell', {
          symbol: item.symbol,
          quantity: finalQuantity,
          price: item.marketPrice,
        });

        message.success(
          `Bán thành công! Số dư: ${formatCurrency(res.data.currentBalance)} VND`
        );
      } else {
        // Đặt lệnh chờ bán (Limit Order)
        if (targetPrice <= 0) {
          message.error('Vui lòng nhập giá mong muốn bán hợp lệ!');
          setLoading(false);
          return;
        }

        const res = await axiosClient.post('/orders/place', {
          symbol: item.symbol,
          direction: 'SELL',
          quantity: finalQuantity,
          targetPrice,
        });

        if (res.data.status === 'MATCHED') {
            message.success(`Khớp lệnh ngay lập tức! Đã bán ${quantity} ${item.symbol}`);
        } else {
            message.info('Đã đặt lệnh chờ mua thành công. Vui lòng theo dõi trong Sổ Lệnh.');
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

  if (!item) return null;

  // Tính toán hiển thị
  const revenuePrice = orderType === ORDER_TYPES.MARKET ? item.marketPrice : targetPrice;
  // Tính tiền dựa trên số lượng "Thực tế sẽ bán" (nếu nhập lố thì tính theo max)
  const calcQuantity = quantity > item.quantity ? item.quantity : quantity;
  
  const totalRevenue = revenuePrice * (calcQuantity || 0); // Handle null/0
  const expectedProfit = calculateExpectedProfit(revenuePrice, item.avgPrice, calcQuantity || 0);
  const isProfitable = expectedProfit >= 0;

  // Render Form Input dùng chung
  const renderFormContent = (isLimit) => (
    <Space orientation="vertical" style={{ width: '100%' }}>
        <Alert
            title={isLimit ? "Lệnh khớp khi giá thị trường TĂNG lên mức bạn đặt" : "Bán ngay lập tức với giá hiện tại"}
            type={isLimit ? "info" : "warning"}
            showIcon
        />
        
        <div style={{display: 'flex', gap: 10, marginBottom: 10}}>
            <Tag color="blue">Giá vốn: {formatCurrency(item.avgPrice)}</Tag>
            <Tag color={item.marketPrice >= item.avgPrice ? "green" : "red"}>
                Giá TT: {formatCurrency(item.marketPrice)}
            </Tag>
        </div>

        {/* Input Giá (Chỉ hiện nếu Limit) - CHO PHÉP SỐ THẬP PHÂN */}
        {isLimit && (
            <div>
                <Text>Giá muốn bán: </Text>
                <InputNumber
                    style={{ width: '100%', marginTop: 5 }}
                    value={targetPrice}
                    onChange={setTargetPrice}
                    min={0.01} // Cho phép số nhỏ
                    step={0.1} // Bước nhảy nhỏ
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value?.replace(/\$\s?|(,*)/g, '')}
                />
            </div>
        )}

        {/* Input Số lượng - CHỈ CHO SỐ NGUYÊN */}
        <div>
            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <Text>Số lượng bán:</Text>
                <Text type="secondary" style={{fontSize: 12}}>Có sẵn: {item.quantity}</Text>
            </div>
            
            <InputNumber
                min={1}
                // precision={0} // Bắt buộc số nguyên ở UI
                step={1}
                value={quantity}
                onChange={handleQuantityChange} 
                style={{ width: '100%', marginTop: 5 }}
                status={quantityStatus} // error hoặc warning
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value?.replace(/\$\s?|(,*)/g, '')}
            />
            
            {/* Hiển thị dòng thông báo lỗi/cảnh báo ngay dưới input */}
            {quantityHelp && (
                <div style={{ color: quantityStatus === 'error' ? '#ff4d4f' : '#faad14', fontSize: 12, marginTop: 4 }}>
                    {quantityStatus === 'error' ? <InfoCircleOutlined /> : '⚠️'} {quantityHelp}
                </div>
            )}
        </div>

        <Divider style={{ margin: '10px 0' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text>Tổng thu về:</Text>
            <Title level={4} style={{ margin: 0, color: '#008000' }}>
                {formatCurrency(totalRevenue)} VND
            </Title>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text>{isProfitable ? 'Lãi dự kiến:' : 'Lỗ dự kiến:'}</Text>
            <Title level={4} style={{ margin: 0, color: isProfitable ? '#3f8600' : '#cf1322' }}>
                {formatCurrency(expectedProfit)} VND
            </Title>
        </div>
    </Space>
  );

  return (
    <Modal
      title={`Bán Cổ Phiếu: ${item.symbol}`}
      open={open}
      onOk={handleSell}
      onCancel={onClose}
      okText={orderType === ORDER_TYPES.MARKET ? 'Bán Ngay' : 'Đặt Lệnh'}
      okButtonProps={{ danger: true, loading }}
      cancelText="Hủy"
    >
      <Tabs
        activeKey={orderType}
        onChange={(key) => {
          setOrderType(key);
          if (key === ORDER_TYPES.LIMIT) setTargetPrice(item.marketPrice);
        }}
        items={[
          { key: ORDER_TYPES.MARKET, label: 'Lệnh Thị Trường', children: renderFormContent(false) },
          { key: ORDER_TYPES.LIMIT, label: 'Lệnh Giới Hạn', children: renderFormContent(true) },
        ]}
      />
    </Modal>
  );
};

export default SellModal;