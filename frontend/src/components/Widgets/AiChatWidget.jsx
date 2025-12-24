import { useState, useRef, useEffect } from 'react';
import { Button, Input, Card, List, Avatar, Spin } from 'antd';
import { RobotOutlined, SendOutlined, CloseOutlined, UserOutlined } from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import axiosClient from '../../services/axios-client';

const AiChatWidget = () => {
  const [visible, setVisible] = useState(false); // Ẩn/hiện cửa sổ chat
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Xin chào! Tôi là trợ lý ảo AI. Tôi có thể giúp gì cho danh mục đầu tư của bạn?' }
  ]); // Lịch sử chat (lưu RAM)
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Ref để tự động cuộn xuống cuối khi có tn mới
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (visible) {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, visible]);

  const handleSend = async () => {
    if (!input.trim()) return; // gửi space

    const userQuestion = input;
    
    // 1. câu hỏi của User (hiện ngay lập tức)
    setMessages(prev => [...prev, { role: 'user', content: userQuestion }]);
    setInput('');
    setLoading(true);

    try {
      const res = await axiosClient.post('/ai/chat', { question: userQuestion });
      
      // Câu trả lời của AI
      setMessages(prev => [...prev, { role: 'ai', content: res.data.answer }]);
    } catch {
      setMessages(prev => [...prev, { role: 'ai', content: 'Lỗi kết nối. Vui lòng thử lại sau.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* NÚT NỔI (FAB) - Luôn hiển thị */}
      <Button
        type="primary"
        shape="circle"
        icon={<RobotOutlined style={{ fontSize: 24 }} />}
        size="large"
        style={{
          position: 'fixed',
          bottom: 30,
          right: 30,
          width: 60,
          height: 60,
          zIndex: 9999,
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: 'none'
        }}
        onClick={() => setVisible(!visible)}
      />

      {/* CỬA SỔ CHAT */}
      {visible && (
        <Card
          title={<span><RobotOutlined /> Trợ Lý Tài Chính AI</span>}
          extra={<Button type="text" icon={<CloseOutlined />} onClick={() => setVisible(false)} />}
          style={{
            position: 'fixed',
            bottom: 100,
            right: 30,
            width: 380,
            height: 500,
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 16,
            boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
          }}
          bodyStyle={{ flex: 1, overflowY: 'auto', padding: 15, background: '#f5f7fa', display: 'flex', flexDirection: 'column' }}
        >
          {/* Danh sách tin nhắn */}
          <div style={{flex: 1}}>
              <List
                dataSource={messages}
                split={false}
                renderItem={(item) => (
                  <List.Item style={{ justifyContent: item.role === 'user' ? 'flex-end' : 'flex-start', padding: '8px 0' }}>
                    <div style={{
                        display: 'flex', 
                        flexDirection: item.role === 'user' ? 'row-reverse' : 'row',
                        alignItems: 'flex-start',
                        gap: 10, 
                        maxWidth: '90%'
                    }}>
                        <Avatar 
                            icon={item.role === 'user' ? <UserOutlined /> : <RobotOutlined />} 
                            style={{ backgroundColor: item.role === 'user' ? '#1890ff' : '#764ba2', flexShrink: 0 }} 
                        />
                        <div style={{
                            background: item.role === 'user' ? '#1890ff' : '#fff',
                            color: item.role === 'user' ? 'white' : '#333',
                            padding: '8px 12px',
                            borderRadius: 12,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                            fontSize: 14,
                            wordBreak: 'break-word'
                        }}>
                            {/* Render Markdown cho đẹp */}
                            {item.role === 'ai' 
                                ? <ReactMarkdown>{item.content}</ReactMarkdown> 
                                : item.content
                            }
                        </div>
                    </div>
                  </List.Item>
                )}
              />
              {loading && <div style={{textAlign: 'center', color: '#999', marginTop: 10}}><Spin size="small" /> AI đang phân tích...</div>}
              <div ref={messagesEndRef} />
          </div>

          {/* Ô nhập liệu */}
          <div style={{ marginTop: 10, display: 'flex', gap: 10 }}>
            <Input 
                placeholder="Hỏi gì đó (VD: Tôi nên mua FPT không?)..." 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onPressEnter={handleSend}
                disabled={loading}
            />
            <Button type="primary" icon={<SendOutlined />} onClick={handleSend} loading={loading} />
          </div>
        </Card>
      )}
    </>
  );
};

export default AiChatWidget;