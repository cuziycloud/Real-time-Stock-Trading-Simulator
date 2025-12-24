import {
  Modal,
  Form,
  Input,
  Select,
  Switch,
  Button,
  message,
  InputNumber,
} from "antd";
import { useState } from "react";
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import axiosClient from "../../../services/axios-client";

const CreateUserModal = ({ open, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm(); // Hook để điều khiển form (reset, validate)

  const handleOk = async () => {
    try {
      // 1. Validate dữ liệu form
      const values = await form.validateFields();
      //console.log(values);
      setLoading(true);

      // 2. Gọi API Backend
      await axiosClient.post("/admin/create-user", values);

      message.success("Tạo người dùng mới thành công!");

      // 3. Reset form và đóng modal
      form.resetFields();
      onSuccess(); // Báo cho cha (AdminPage) biết để reload bảng
      onClose();
    } catch (error) {
      message.error(error.response?.data?.message || "Lỗi tạo người dùng");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Tạo Người Dùng Mới (Admin Create)"
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      confirmLoading={loading}
      okText="Tạo Ngay"
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ role: "USER", isBot: false }} // mặc định
      >
        <Form.Item
          name="username"
          label="Tên hiển thị"
          rules={[{ required: true, message: "Vui lòng nhập tên" }]}
        >
          <Input prefix={<UserOutlined />} placeholder="Ví dụ: Nguyen Van A" />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email đăng nhập"
          rules={[
            { required: true, type: "email", message: "Email không hợp lệ" },
          ]}
        >
          <Input prefix={<MailOutlined />} placeholder="admin@example.com" />
        </Form.Item>

        <Form.Item
          name="password"
          label="Mật khẩu"
          rules={[{ required: true, min: 6, message: "Tối thiểu 6 ký tự" }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Nhập mật khẩu"
          />
        </Form.Item>

        <Form.Item
          name="balance"
          label="Số dư"
          rules={[
            { required: true, message: "Vui lòng nhập số dư" },
            { type: "number", min: 0, message: "Số dư phải ≥ 0" },
          ]}
        >
          <InputNumber
            style={{ width: "100%" }}
            min={0}
            step={1000}
            prefix={<DollarOutlined />}
            formatter={(value) =>
              value !== undefined
                ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                : ""
            }
            parser={(value) => (value ? Number(value.replace(/,/g, "")) : 0)}
            placeholder="Ví dụ: 1,000,000"
          />
        </Form.Item>

        <div style={{ display: "flex", gap: 20 }}>
          <Form.Item name="role" label="Phân quyền" style={{ flex: 1 }}>
            <Select>
              <Select.Option value="USER">USER (Người dùng)</Select.Option>
              <Select.Option value="ADMIN">ADMIN (Quản trị)</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="isBot" label="Là Bot?" valuePropName="checked">
            <Switch checkedChildren="Phải" unCheckedChildren="Không" />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateUserModal;
