import { Modal, Form, Input, Select, Button, message, InputNumber } from "antd";
import { useState, useEffect } from "react";
import { UserOutlined, MailOutlined } from "@ant-design/icons";
import axiosClient from "../../../services/axios-client";

const EditUserModal = ({ open, onClose, onSuccess, user }) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  // Khi mở modal và có user, điền dữ liệu cũ vào form
  useEffect(() => {
    if (open && user) {
      form.setFieldsValue({
        username: user.username,
        email: user.email,
        role: user.role,
        balance: user.balance,
        // Password để trống, nhập mới đổi, ko nhập thì thôi
      });
    }
  }, [open, user, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // Lọc bỏ password nếu user không nhập (để không hash chuỗi rỗng)
      if (!values.password) delete values.password;

      await axiosClient.patch(`/admin/users/${user.id}`, values);

      message.success(`Đã cập nhật thông tin user ${user.username}`);
      onSuccess();
      onClose();
    } catch (error) {
      message.error(error.response?.data?.message || "Lỗi cập nhật");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={`Chỉnh sửa: ${user?.username}`}
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      confirmLoading={loading}
      okText="Lưu Thay Đổi"
    >
      <Form form={form} layout="vertical">
        <Form.Item name="username" label="Tên hiển thị">
          <Input prefix={<UserOutlined />} />
        </Form.Item>

        <Form.Item name="email" label="Email">
          <Input prefix={<MailOutlined />} disabled /> 
          {/* Email không cho sửa */}
        </Form.Item>

        <Form.Item 
            name="password" 
            label="Mật khẩu mới (Để trống nếu không đổi)"
        >
          <Input.Password placeholder="Nhập pass mới..." />
        </Form.Item>

        <div style={{display: 'flex', gap: 20}}>
            <Form.Item name="role" label="Phân quyền" style={{flex: 1}}>
            <Select>
                <Select.Option value="USER">USER</Select.Option>
                <Select.Option value="ADMIN">ADMIN</Select.Option>
            </Select>
            </Form.Item>

            <Form.Item name="balance" label="Số dư (VND)" style={{flex: 1}}>
                <InputNumber 
                    style={{width: '100%'}} 
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value?.replace(/\$\s?|(,*)/g, '')}
                />
            </Form.Item>
        </div>
      </Form>
    </Modal>
  );
};

export default EditUserModal;