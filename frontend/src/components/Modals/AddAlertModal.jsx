import {
  Alert,
  Button,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Result,
  Select,
} from "antd";
import { useEffect, useState } from "react";
import axiosClient from "../../services/axios-client";

const AddAlertModal = ({
  open,
  onClose,
  defaultSymbol,
  onSuccess,
  userInfo,
  onOpenTelegram,
}) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const isTelegramConnected = !!userInfo?.telegramChatId;

  useEffect(() => {
    // Chỉ thao tác với Form khi Modal mở + đã kết nối Telegram (Lúc này Form mới đc render)
    if (open && isTelegramConnected) {
      if (defaultSymbol) {
        form.setFieldsValue({ symbol: defaultSymbol });
      } else {
        form.resetFields();
      }
    }
  }, [open, defaultSymbol, form, isTelegramConnected]);
  // ---------------------

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      await axiosClient.post("/alerts", {
        symbol: values.symbol,
        targetPrice: values.targetPrice,
        condition: values.condition,
      });

      message.success(`Đã đặt cảnh báo cho ${values.symbol}`);
      onSuccess();
      onClose();
    } catch {
      message.error("Lỗi tạo cảnh báo (Có thể do chưa nhập đủ)");
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    // TRƯỜNG HỢP 1: CHƯA LIÊN KẾT -> Hiện thông báo yêu cầu
    if (!isTelegramConnected) {
      return (
        <Result
          status="warning"
          title="Chưa kết nối Telegram"
          subTitle="Để nhận cảnh báo giá về điện thoại, bạn cần kết nối với Bot Telegram trước"
          extra={
            <Button
              type="primary"
              onClick={() => {
                onClose();
                onOpenTelegram();
              }}
            >
              Kết nối ngay
            </Button>
          }
        />
      );
    }

    // TRƯỜNG HỢP 2: ĐÃ LIÊN KẾT -> HIỆN FORM
    return (
      <>
        <Alert
          title="Bot Telegram sẽ nhắn tin cho bạn khi giá chạm ngưỡng này"
          type="info"
          showIcon
          style={{ marginBottom: 20 }}
        />
        <Form
          form={form}
          layout="vertical"
          initialValues={{ condition: "ABOVE" }}
        >
          <Form.Item
            name="symbol"
            label="Mã cổ phiếu"
            rules={[{ required: true }]}
          >
            <Input
              placeholder="Ví dụ: FPT"
              style={{ textTransform: "uppercase" }}
            />
          </Form.Item>
          <div style={{ display: "flex", gap: 10 }}>
            <Form.Item
              name="condition"
              label="Điều kiện"
              style={{ flex: 1 }}
              rules={[{ required: true }]}
            >
              <Select>
                <Select.Option value="ABOVE">Giá Tăng Vượt </Select.Option>
                <Select.Option value="BELOW">Giá Giảm Xuống </Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="targetPrice"
              label="Giá Mục Tiêu"
              style={{ flex: 1 }}
              rules={[{ required: true }]}
            >
              <InputNumber
                style={{ width: "100%" }}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => value?.replace(/\$\s?|(,*)/g, "")}
              />
            </Form.Item>
          </div>
        </Form>
      </>
    );
  };

  return (
    <Modal
      title={isTelegramConnected ? "Tạo Cảnh Báo Giá Mới" : "Yêu Cầu Kết Nối"}
      open={open}
      forceRender
      onOk={handleOk}
      onCancel={onClose}
      confirmLoading={loading}
      okText="Tạo Cảnh Báo"
      // Nếu chưa kết nối thì ẩn nút OK, chỉ để nút Cancel (undefined = hiện mặc định)
      footer={!isTelegramConnected ? null : undefined}
    >
      {renderContent()}
    </Modal>
  );
};

export default AddAlertModal;
