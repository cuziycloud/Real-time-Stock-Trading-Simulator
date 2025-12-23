import { Modal, Form, Input, InputNumber, message } from "antd";
import { useState, useEffect } from "react";
import axiosClient from "../../../services/axios-client";

const EditStockModal = ({ open, stock, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  // Load dữ liệu cũ vào form khi mở modal
  useEffect(() => {
    if (open && stock) {
      form.setFieldsValue({
        symbol: stock.symbol,
        companyName: stock.companyName,
        price: stock.price, // Giá hiện tại
        initialPrice: stock.initialPrice // Giá tham chiếu
      });
    }
  }, [open, stock, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      await axiosClient.patch(`/stocks/${stock.id}`, {
        companyName: values.companyName,
        price: values.price, 
      });

      message.success(`Cập nhật mã ${stock.symbol} thành công!`);
      onSuccess(); // Reload bảng
      onClose();
    } catch (error) {
      message.error(error.response?.data?.message || "Lỗi cập nhật");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={`Chỉnh sửa mã: ${stock?.symbol}`}
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      confirmLoading={loading}
      okText="Lưu Thay Đổi"
    >
      <Form form={form} layout="vertical">
        <Form.Item name="symbol" label="Mã Cổ Phiếu">
          <Input disabled /> {/* Mã CK là định danh, ko cho sửa */}
        </Form.Item>

        <Form.Item
          name="companyName"
          label="Tên Công Ty"
          rules={[{ required: true, message: "Vui lòng nhập tên công ty" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="price"
          label="Điều chỉnh Giá Hiện Tại (God Mode)"
          rules={[{ required: true }]}
        >
          <InputNumber
            style={{ width: "100%" }}
            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            parser={(value) => value?.replace(/\$\s?|(,*)/g, "")}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditStockModal;