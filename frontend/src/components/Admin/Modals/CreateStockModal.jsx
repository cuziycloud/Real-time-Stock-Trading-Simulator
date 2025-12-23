import { Modal, Form, Input, InputNumber, message, Alert } from "antd";
import { useState } from "react";
import axiosClient from "../../../services/axios-client";

const CreateStockModal = ({ open, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      await axiosClient.post("/stocks", {
        symbol: values.symbol.toUpperCase(), // Luôn viết hoa mã CK
        companyName: values.companyName,
        price: values.price,
      });

      message.success(`Đã niêm yết mã ${values.symbol.toUpperCase()} thành công!`);
      form.resetFields();
      onSuccess(); // Reload lại danh sách
      onClose();
    } catch (error) {
      message.error(error.response?.data?.message || "Lỗi tạo mã chứng khoán");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Niêm Yết Mã Chứng Khoán Mới (IPO) 📈"
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      confirmLoading={loading}
      okText="Niêm Yết Ngay"
    >
      <Alert 
        title="Mã mới sẽ xuất hiện ngay lập tức trên bảng điện tử Real-time." 
        type="warning" 
        showIcon 
        style={{marginBottom: 20}}
      />
      
      <Form form={form} layout="vertical">
        <Form.Item
          name="symbol"
          label="Mã Cổ Phiếu"
          rules={[
            { required: true, message: "Vui lòng nhập mã" },
            { max: 5, message: "Mã tối đa 5 ký tự" }
          ]}
        >
          <Input placeholder="Ví dụ: TESLA" style={{ textTransform: "uppercase" }} />
        </Form.Item>

        <Form.Item
          name="companyName"
          label="Tên Công Ty"
          rules={[{ required: true, message: "Vui lòng nhập tên công ty" }]}
        >
          <Input placeholder="Ví dụ: Tesla Inc." />
        </Form.Item>

        <Form.Item
          name="price"
          label="Giá Tham Chiếu (VND)"
          rules={[{ required: true, message: "Nhập giá khởi điểm" }]}
        >
          <InputNumber
            style={{ width: "100%" }}
            min={1}
            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            parser={(value) => value?.replace(/\$\s?|(,*)/g, "")}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateStockModal;