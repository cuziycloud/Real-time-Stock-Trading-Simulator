import {
  Tag,
  Typography,
  Button,
  Space,
  Tooltip,
  Avatar,
  Switch,
  Popconfirm,
} from "antd";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  LineChartOutlined,
  BellOutlined,
  DeleteOutlined,
  RobotOutlined,
  UserOutlined,
  EditOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

export const getStockColumns = (showChart, showBuyModal, addAlert) => [
  {
    title: "Mã Chứng Khoán",
    dataIndex: "symbol",
    key: "symbol",
    align: "center",
    render: (text) => (
      <Tag color="blue" style={{ fontSize: 16 }}>
        {text}
      </Tag>
    ),
  },
  {
    title: "Giá Thị Trường",
    dataIndex: "price",
    key: "price",
    align: "center",
    render: (price) => (
      <Text strong style={{ fontSize: 16, color: "green" }}>
        {price.toFixed(2)}
      </Text>
    ),
  },
  {
    title: "Biến Động",
    key: "change",
    align: "center",
    render: (_, record) => {
      const isUp = record.price > 50;
      return (
        <Tag color={isUp ? "green" : "red"}>
          {isUp ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
          {isUp ? "Tăng" : "Giảm"}
        </Tag>
      );
    },
  },
  {
    title: "Hành Động",
    key: "action",
    align: "center",
    render: (_, record) => (
      <Space>
        <Tooltip title="Xem biểu đồ">
          <Button
            icon={<LineChartOutlined />}
            onClick={() => showChart(record)}
          />
        </Tooltip>
        <Tooltip title="Báo giá">
          <Button icon={<BellOutlined />} onClick={() => addAlert(record)} />
        </Tooltip>
        <Button type="primary" onClick={() => showBuyModal(record)}>
          Mua ngay
        </Button>
      </Space>
    ),
  },
];

export const getPortfolioColumns = (showSellModal) => [
  {
    title: "Mã",
    dataIndex: "symbol",
    key: "symbol",
    render: (t) => <Tag color="orange">{t}</Tag>,
  },
  {
    title: "Số lượng",
    dataIndex: "quantity",
    key: "quantity",
  },
  {
    title: "Giá vốn",
    dataIndex: "avgPrice",
    key: "avgPrice",
    render: (p) => Number(p).toLocaleString(),
  },
  {
    title: "Giá TT",
    dataIndex: "marketPrice",
    key: "marketPrice",
    render: (p) => <Text strong>{p.toLocaleString()}</Text>,
  },
  {
    title: "Lãi/Lỗ",
    key: "profit",
    render: (_, record) => {
      const color = record.profit >= 0 ? "green" : "red";
      return (
        <span style={{ color, fontWeight: "bold" }}>
          {record.profit.toLocaleString()} ({record.profitPercent.toFixed(2)}%)
        </span>
      );
    },
  },
  {
    title: "Hành động",
    key: "action",
    render: (_, record) => (
      <Button type="primary" onClick={() => showSellModal(record)}>
        Bán
      </Button>
    ),
  },
];

export const historyColumns = [
  {
    title: "Thời gian",
    dataIndex: "createdAt",
    key: "createdAt",
    render: (date) => new Date(date).toLocaleString("vi-VN"),
  },
  {
    title: "Loại",
    dataIndex: "type",
    key: "type",
    render: (type) => {
      const map = {
        BUY: { label: "MUA", color: "blue" },
        SELL: { label: "BÁN", color: "volcano" },
        DEPOSIT: { label: "NẠP", color: "green" },
        WITHDRAW: { label: "RÚT", color: "red" },
      };

      const config = map[type] || { label: type, color: "default" };

      return <Tag color={config.color}>{config.label}</Tag>;
    },
  },
  {
    title: "Mã",
    dataIndex: "symbol",
    key: "symbol",
    render: (t) => <b>{t}</b>,
  },
  {
    title: "Số lượng",
    dataIndex: "quantity",
    key: "quantity",
  },
  {
    title: "Giá khớp",
    dataIndex: "price",
    key: "price",
    render: (p) => Number(p).toLocaleString(),
  },
  {
    title: "Tổng tiền",
    key: "total",
    render: (_, record) => (
      <Text type={record.type === "BUY" ? "secondary" : "success"}>
        {(record.price * record.quantity).toLocaleString()}
      </Text>
    ),
  },
];

export const getOrderColumns = (handleCancelOrder) => [
  {
    title: "Thời gian",
    dataIndex: "createdAt",
    render: (d) => new Date(d).toLocaleString("vi-VN"),
  },
  {
    title: "Mã",
    dataIndex: "symbol",
    render: (t) => <b>{t}</b>,
  },
  {
    title: "Loại",
    dataIndex: "direction",
    render: (t) => <Tag color={t === "BUY" ? "blue" : "volcano"}>{t}</Tag>,
  },
  {
    title: "SL",
    dataIndex: "quantity",
  },
  {
    title: "Giá đặt",
    dataIndex: "targetPrice",
    render: (p) => Number(p).toLocaleString(),
  },
  {
    title: "Trạng thái",
    dataIndex: "status",
    render: (s) => {
      let color = "default";
      if (s === "MATCHED") color = "success";
      if (s === "PENDING") color = "processing";
      if (s === "CANCELLED") color = "error";
      return <Tag color={color}>{s}</Tag>;
    },
  },
  {
    title: "",
    key: "action",
    render: (_, record) => {
      // Chỉ hiện nút Hủy nếu trạng thái là PENDING
      if (record.status === "PENDING") {
        return (
          <Popconfirm
            title="Hủy lệnh này?"
            description="Bạn có chắc chắn muốn hủy lệnh chờ này không?"
            onConfirm={() => handleCancelOrder(record.id)}
            okText="Hủy ngay"
            cancelText="Không"
            okButtonProps={{ danger: true }}
          >
            <Button danger type="text" icon={<DeleteOutlined />} />
          </Popconfirm>
        );
      }
      return null; // Các trạng thái khác không làm gì được
    },
  },
];

export const getLeaderboardColumns = (currentUserId) => [
  {
    title: "Hạng",
    key: "rank",
    render: (_, __, index) => {
      if (index === 0) return <span style={{ fontSize: 20 }}>🥇</span>;
      if (index === 1) return <span style={{ fontSize: 20 }}>🥈</span>;
      if (index === 2) return <span style={{ fontSize: 20 }}>🥉</span>;
      return <Tag>{index + 1}</Tag>;
    },
  },
  {
    title: "Nhà đầu tư",
    dataIndex: "username",
    render: (name, record) => (
      <span>
        {name} {record.id === currentUserId && <Tag color="blue">Bạn</Tag>}
      </span>
    ),
  },
  {
    title: "Tổng Tài Sản",
    dataIndex: "totalNetWorth",
    render: (v) => (
      <Text strong style={{ color: "#cf1322", fontSize: 16 }}>
        {Number(v).toLocaleString()}
      </Text>
    ),
    sorter: (a, b) => a.totalNetWorth - b.totalNetWorth,
    defaultSortOrder: "descend",
  },
];

export const getAlertColumns = (handleDelete) => [
  {
    title: "Mã",
    dataIndex: "symbol",
    render: (t) => <b>{t}</b>,
  },
  {
    title: "Điều kiện",
    dataIndex: "condition",
    render: (c) => (
      <Tag color={c === "ABOVE" ? "green" : "red"}>
        {c === "ABOVE" ? "≥ (Lớn hơn)" : "≤ (Nhỏ hơn)"}
      </Tag>
    ),
  },
  {
    title: "Giá Mục Tiêu",
    dataIndex: "targetPrice",
    render: (p) => (
      <b style={{ color: "#1890ff" }}>{Number(p).toLocaleString()}</b>
    ),
  },
  {
    title: "Trạng thái",
    dataIndex: "isActive",
    render: (active) =>
      active ? <Tag color="processing">Đang chờ</Tag> : <Tag>Đã tắt</Tag>,
  },
  {
    title: "Hành động",
    render: (_, record) => (
      <Button
        danger
        type="text"
        icon={<DeleteOutlined />}
        onClick={() => handleDelete(record.id)}
      />
    ),
  },
];

export const usersColumns = (handleToggleStatus, setEditingUser) => [
  {
    title: "ID",
    dataIndex: "id",
    width: 60,
    align: "center",
  },
  {
    title: "Người dùng",
    dataIndex: "username",
    render: (name, record) => (
      <Space>
        <Avatar
          icon={record.isBot ? <RobotOutlined /> : <UserOutlined />}
          style={{
            backgroundColor: record.isBot
              ? "#faad14"
              : record.role === "ADMIN"
              ? "#f5222d"
              : "#1890ff",
          }}
        />
        <div>
          <Text strong>{name}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.email}
          </Text>
        </div>
      </Space>
    ),
  },
  {
    title: "Vai trò",
    dataIndex: "role",
    render: (role, record) => (
      <Space orientation="vertical" size={0}>
        {record.isBot ? (
          <Tag color="gold">BOT</Tag>
        ) : role === "ADMIN" ? (
          <Tag color="red">ADMIN</Tag>
        ) : (
          <Tag color="blue">USER</Tag>
        )}
      </Space>
    ),
  },
  {
    title: "Tài sản (VND)",
    dataIndex: "balance",
    align: "right",
    render: (val) => <Text>{Number(val).toLocaleString()}</Text>,
    sorter: (a, b) => a.balance - b.balance,
  },
  {
    title: "Hành động",
    key: "action",
    align: "center",
    render: (_, record) => (
      <Space>
        {/* Nút Switch Ban/Unban */}
        <Switch
          checked={record.isActive}
          onChange={() => handleToggleStatus(record.id, record.isActive)}
          disabled={record.role === "ADMIN"}
          size="small"
        />

        {/* Nút Edit Mới */}
        <Button
          type="primary"
          ghost
          size="small"
          icon={<EditOutlined />}
          onClick={() => setEditingUser(record)} // Set user và mở modal
        >
          Sửa
        </Button>
      </Space>
    ),
  },
];

export const stocksColumns = (onDelete, onEdit) => [
  { title: "ID", dataIndex: "id", width: 60, align: "center" },
  {
    title: "Mã CK",
    dataIndex: "symbol",
    render: (t) => (
      <Tag color="blue" style={{ fontSize: 14 }}>
        {t}
      </Tag>
    ),
  },
  { title: "Tên Công Ty", dataIndex: "companyName" },
  {
    title: "Giá Hiện Tại",
    dataIndex: "price", // Hoặc currentPrice tùy BE trả về
    render: (p) => (
      <b style={{ color: "#3f8600" }}>{Number(p).toLocaleString()}</b>
    ),
  },
  {
    title: "Giá Gốc",
    dataIndex: "initialPrice",
    render: (p) => Number(p).toLocaleString(),
  },
  {
    title: "Hành động",
    key: "action",
    align: "center",
    render: (_, record) => (
      <Space>
        <Tooltip title="Chỉnh sửa thông tin">
          <Button
            type="primary"
            ghost
            size="small"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
          />
        </Tooltip>
        <Popconfirm
          title="Hủy niêm yết?"
          description={`Bạn có chắc chắn muốn xóa mã ${record.symbol} khỏi sàn?`}
          onConfirm={() => onDelete(record.id, record.symbol)}
          okText="Xóa Ngay"
          okButtonProps={{ danger: true }}
          cancelText="Không"
        >
          <Button danger icon={<DeleteOutlined />} size="small">
            Hủy Niêm Yết
          </Button>
        </Popconfirm>
      </Space>
    ),
  },
];
