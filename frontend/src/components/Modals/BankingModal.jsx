import { useState } from "react";
import {
  Modal,
  InputNumber,
  Space,
  Alert,
  Typography,
  Tag,
  message,
  Tabs,
  Button,
} from "antd";
import axiosClient from "../../services/axios-client";
import { CreditCardOutlined, QrcodeOutlined, ThunderboltOutlined } from "@ant-design/icons";

const { Text } = Typography;

const BankingModal = ({ open, type, onClose, onSuccess, userInfo }) => {
  const [amount, setAmount] = useState(100000);
  const [loading, setLoading] = useState(false);
  const [depositMethod, setDepositMethod] = useState("VNPAY"); // VNPAY, VIETQR

  const isDeposit = type === "DEPOSIT";

  // VNPAY
  const handleVNPAY = async () => {
    try {
      const res = await axiosClient.post("/payment/create_url", { amount });

      if (res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (error) {
      message.error(error.response?.data?.message || "Lỗi nạp tiền");
    }
  };

  // VIETQR(SIMULATOR)
  const handleVietQRSimulate = async () => {
    // Lấy Key từ .env (Frontend)
    const SECRET_TOKEN = import.meta.env.VITE_CASSO_SECRET_TOKEN;
    if (!SECRET_TOKEN) return message.error("Thiếu Config Secret Token");

    setLoading(true);
    try {
      // Nd ck: NAPTIEN USER_{ID}
      const transferContent = `NAPTIEN USER_${userInfo?.id}`;

      // Gọi Webhook giả lập
      await axiosClient.post(
        "/payment/webhook",
        {
          amount: amount,
          content: transferContent,
        },
        {
          headers: { "x-secure-token": SECRET_TOKEN },
        }
      );

      message.success(
        `Tíng tìng! Đã nạp thành công ${amount.toLocaleString()} VND`
      );
      onSuccess();
      onClose();
    } catch (error) {
      message.error(
        "Lỗi giả lập: " + (error.response?.data?.message || "Hệ thống")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    setLoading(true);
    try {
      await axiosClient.post("/users/withdraw", { amount });
      message.success(`Rút thành công ${amount.toLocaleString()} VND`);

      onSuccess();
      onClose();
    } catch (error) {
      message.error(error.response?.data?.message || "Lỗi rút tiền");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (!isDeposit) {
      handleWithdraw();
    } else {
      if (depositMethod === "VNPAY") {
        handleVNPAY();
      }
    }
  };

  // Cấu hình VietQR ảnh
  const BANK_ID = "MB";
  const ACCOUNT_NO = "9704229238687888";
  const transferContent = `NAPTIEN USER_${userInfo?.id}`;
  const qrUrl = `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-compact.png?amount=${amount}&addInfo=${transferContent}`;

  const quickAmounts = [50000, 100000, 200000, 500000, 1000000];

  // FORM NHẬP TIỀN (Dùng chung)
  const renderAmountInput = () => (
    <>
      <div style={{ marginTop: 10 }}>
        <Text>Nhập số tiền: </Text>
        <InputNumber
          style={{ width: "100%", marginTop: 8 }}
          size="large"
          value={amount}
          onChange={setAmount}
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
          parser={(value) => value?.replace(/\$\s?|(,*)/g, "")}
          min={10000}
        />
      </div>
      <Space wrap style={{ marginTop: 10 }}>
        {quickAmounts.map((amt) => (
          <Tag
            color="blue"
            style={{ cursor: "pointer" }}
            onClick={() => setAmount(amt)}
            key={amt}
          >
            +{amt.toLocaleString()}
          </Tag>
        ))}
      </Space>
    </>
  );

  return (
    <Modal
      title={isDeposit ? "Nạp Tiền Vào Tài Khoản" : "Rút Tiền Về Ngân Hàng"}
      open={open}
      onOk={handleSubmit}
      onCancel={onClose}
      // VietQR: ẩn nút OK mặc định (dùng nút Giả lập riêng)
      footer={isDeposit && depositMethod === "VIETQR" ? null : undefined}
      okText={!isDeposit ? "Rút Ngay" : "Thanh Toán"}
      okButtonProps={{ danger: !isDeposit, loading }}
    >
      {/* 1. RÚT TIỀN */}
      {!isDeposit && (
        <Space orientation="vertical" style={{ width: "100%" }}>
          <Alert
            title="Tiền sẽ bị trừ khỏi tài khoản ngay lập tức"
            type="warning"
            showIcon
          />
          {renderAmountInput()}
        </Space>
      )}

      {/* 2. NẠP TIỀN: Tabs */}
      {isDeposit && (
        <Tabs
          defaultActiveKey="VNPAY"
          onChange={setDepositMethod}
          items={[
            {
              key: "VNPAY",
              label: (
                <span>
                  <CreditCardOutlined /> Cổng VNPAY
                </span>
              ),
              children: (
                <Space orientation="vertical" style={{ width: "100%" }}>
                  <Alert
                    title="Sử dụng thẻ ATM/Visa/Mastercard qua cổng VNPAY Sandbox."
                    type="success"
                    showIcon
                  />
                  {renderAmountInput()}
                </Space>
              ),
            },
            {
              key: "VIETQR",
              label: (
                <span>
                  <QrcodeOutlined /> Chuyển Khoản QR
                </span>
              ),
              children: (
                <Space
                  orientation="vertical"
                  style={{ width: "100%", alignItems: "center" }}
                >
                  <Alert
                    title="Chế độ Giả lập (Simulation) - Không cần chuyển thật."
                    type="info"
                    showIcon
                    style={{ width: "100%" }}
                  />

                  {/* Input tiền */}
                  <div style={{ width: "100%" }}>{renderAmountInput()}</div>

                  {/* QR Image */}
                  <div
                    style={{
                      border: "1px solid #ddd",
                      padding: 10,
                      borderRadius: 8,
                      marginTop: 10,
                    }}
                  >
                    <img src={qrUrl} alt="VietQR" style={{ width: 250 }} />
                  </div>
                  <Text>
                    Chủ tài khoản: TRAN MY VAN
                  </Text>
                  <Text type="secondary" style={{ fontSize: 14 }}>
                    Nội dung: {transferContent}
                  </Text>

                  {/* Nút Giả Lập */}
                  <Button
                    type="primary"
                    danger
                    block
                    size="large"
                    icon={<ThunderboltOutlined />}
                    loading={loading}
                    onClick={handleVietQRSimulate}
                    style={{ marginTop: 10 }}
                  >
                    GIẢ LẬP CHUYỂN KHOẢN
                  </Button>
                </Space>
              ),
            },
          ]}
        />
      )}
    </Modal>
  );
};

export default BankingModal;
