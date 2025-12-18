import { Button, Card, Form, Input, message, Tabs, Typography } from "antd";
import { useState } from "react";
import axiosClient from "../services/axios-client";
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  StockOutlined 
} from "@ant-design/icons";

const { Title, Text } = Typography;

const LoginPage = ({ onLoginSuccess }) => {
  const [loading, setLoading] = useState(false);

  // Login
  const handleLogin = async (values) => {
    setLoading(true);
    try {
        const res = await axiosClient.post('auth/login', values);
        localStorage.setItem('access_token', res.data.access_token);
        message.success('Đăng nhập thành công');
        onLoginSuccess();
    } catch (error) {
        message.error(error.response?.data?.message || 'Đăng nhập thất bại');
    } finally {
        setLoading(false);
    }
  }

  // Register
  const handleRegister = async(values) => {
    setLoading(true);
    try {
        await axiosClient.post('auth/register', values);
        message.success('Đăng ký thành công! Vui lòng đăng nhập.');
    } catch (error) {
        message.error(error.response?.data?.message || 'Lỗi đăng ký');
    } finally {
        setLoading(false);
    }
  }

  return (
    <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw', // Chiếm trọn chiều ngang viewport
        height: '100vh', // Chiếm trọn chiều cao viewport
        zIndex: 1000, // Nổi lên trên cùng
        
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', 
    }}>
        <Card 
            bordered={false}
            style={{ 
                width: 420, 
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)', 
                borderRadius: 12 
            }}
        >
            <div style={{textAlign: 'center', marginBottom: 30}}>
                <StockOutlined style={{fontSize: 40, color: '#1890ff'}}/>
                <Title level={2} style={{margin: '10px 0', color: '#001529'}}>Stock Simulator</Title>
                <Text type="secondary">Nền tảng giao dịch giả lập Real-time</Text>
            </div>
            
            <Tabs
                defaultActiveKey="login"
                centered 
                items={[
                    {
                        key: 'login',
                        label: 'Đăng Nhập',
                        children: (
                            <Form onFinish={handleLogin} layout="vertical" size="large">
                                <Form.Item name="email" rules={[{required: true, type: 'email', message: 'Vui lòng nhập email hợp lệ'}]}>
                                    <Input prefix={<MailOutlined />} placeholder="Email" />
                                </Form.Item>
                                <Form.Item name="password" rules={[{required: true, message: 'Vui lòng nhập mật khẩu'}]}>
                                    <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
                                </Form.Item>
                                <Button type="primary" htmlType="submit" block loading={loading} style={{height: 45}}>
                                    Đăng Nhập Ngay
                                </Button>
                            </Form>
                        )
                    },
                    {
                        key: 'register',
                        label: 'Đăng Ký',
                        children: (
                            <Form onFinish={handleRegister} layout="vertical" size="large">
                                <Form.Item name="username" rules={[{required: true, message: 'Nhập tên hiển thị'}]}>
                                    <Input prefix={<UserOutlined />} placeholder="Tên hiển thị (Name)"/>
                                </Form.Item>
                                <Form.Item name="email" rules={[{required: true, type: 'email', message: 'Email không hợp lệ'}]}>
                                    <Input prefix={<MailOutlined />} placeholder="Email" />
                                </Form.Item>
                                <Form.Item name="password" rules={[{required: true, min: 6, message: 'Mật khẩu tối thiểu 6 ký tự'}]}>
                                    <Input.Password prefix={<LockOutlined/>} placeholder="Mật khẩu" />
                                </Form.Item>
                                <Button type="dashed" htmlType="submit" block loading={loading} style={{height: 45}}>
                                    Tạo Tài Khoản
                                </Button>
                            </Form>
                        )
                    }
                ]}
            />
        </Card>
    </div>
  )
};

export default LoginPage;