import { Alert, Form, Input, InputNumber, message, Modal, Select } from "antd";
import { useEffect, useState } from "react";
import axiosClient from "../../services/axios-client";

const AddAlertModal = ({ open, onClose, defaultSymbol, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm(); // Hook đk form

  // Khi modal mở, tự động điền mã CK
  useEffect(() => {
    if (open && defaultSymbol) {
      form.setFieldsValue({ symbol: defaultSymbol });
    }

    if (!open) {
      form.resetFields();
    }
  }, [open, defaultSymbol, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields(); // validate dl
      setLoading(true);

      // Gọi api tạo alert
      await axiosClient.post("/alerts", {
        symbol: values.symbol,
        targetPrice: values.targetPrice,
        condition: values.condition,
      });

      message.success(`Đã đặt cảnh báo cho ${values.symbol}`);
      onSuccess(); // Reload ds
      onClose();
    } catch {
      message.error("Lỗi tạo cảnh báo (Có thể do chưa nhập đủ)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Tạo Cảnh Báo Giá Mới"
      open={open}
      forceRender
      onOk={handleOk}
      onCancel={onClose}
      confirmLoading={loading}
      okText="Tạo Cảnh Báo"
    >
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
          rules={[{ required: true, message: "Vui lòng nhập mã ck" }]}
        >
          <Input
            placeholder="Ví dụ: FPT, VNM, PHS, ..."
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
              <Select.Option value="ABOVE">Giá Tăng Vượt</Select.Option>
              <Select.Option value="BELOW">Giá Giảm Nhanh</Select.Option>
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
    </Modal>
  );
};

export default AddAlertModal;
