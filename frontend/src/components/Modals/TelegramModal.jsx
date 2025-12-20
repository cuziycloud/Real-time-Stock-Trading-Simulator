import { Modal, Button, Typography, Steps, QRCode, Space, Spin, message, Alert } from "antd";
import { useEffect, useState } from "react";
import axiosClient from "../../services/axios-client";
import { SendOutlined, CopyOutlined, CheckCircleOutlined } from "@ant-design/icons";


const { Text, Title } = Typography;

const TelegramModal = ({ open, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [linkData, setLinkData] = useState(null); // Chứa {link: '...', code: '...'}

  // Mở modal = lấy link
  useEffect(() => {
    if (open) {
      fetchTelegramLink();
    }
  }, [open]);

  const fetchTelegramLink = async () => {
    try {
      const res = await axiosClient.post("/users/telegram-link");
      setLinkData(res.data);
    } catch {
        message.error("Không lấy được mã kết nối Telegram");
    } finally {
      setLoading(false);
    }
  };

  // Copy mã 
  const handleCopyCode = () => {
    if(linkData?.code) {
        navigator.clipboard.writeText(`/start ${linkData.code}`);
        message.success("Đã copy lệnh start");
    }
  }

  return (
    <Modal
      title="Kết nối Trợ lý ảo Telegram"
      open={open}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      {loading ? (
        <div style={{ textAlign: "center", padding: 50 }}>
          <Spin size="large" tip="Đang tạo mã bí mật..." />
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
          
          {/* 1. Mã QR */}
          <div style={{ background: 'white', padding: 15, borderRadius: 10, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
             <QRCode value={linkData?.link || ""} size={200} icon="https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg" />
          </div>

          <Title level={4} style={{ margin: 0, color: '#0088cc' }}>
             Mã kết nối: <Text code style={{ fontSize: 20 }}>{linkData?.code}</Text>
          </Title>

          {/* 2. Hướng dẫn */}
          <Steps
            orientation="vertical"
            current={-1}
            items={[
              {
                title: 'Bước 1',
                description: 'Mở ứng dụng Telegram trên điện thoại hoặc máy tính.',
              },
              {
                title: 'Bước 2',
                description: (
                    <span>
                        Quét mã QR trên <b style={{color: 'red'}}>HOẶC</b> bấm nút bên dưới.
                    </span>
                ),
              },
              {
                title: 'Bước 3',
                description: 'Bấm nút "Start" trong khung chat với Bot để hoàn tất.',
              },
            ]}
          />

          {/* 3. Nút hành động */}
          <Space wrap>
            <Button 
                type="primary" 
                icon={<SendOutlined />} 
                size="large" 
                href={linkData?.link} 
                target="_blank"
                style={{ backgroundColor: '#0088cc' }}
            >
              Mở Telegram Ngay
            </Button>
            
            <Button icon={<CopyOutlined />} size="large" onClick={handleCopyCode}>
              Copy Lệnh
            </Button>
          </Space>

          <Alert
            title="Bot sẽ giúp bạn nhận cảnh báo giá và biến động thị trường ngay lập tức!" 
            type="info" 
            showIcon 
            style={{marginTop: 10}}
          />
        </div>
      )}
    </Modal>
  );
};

export default TelegramModal;
