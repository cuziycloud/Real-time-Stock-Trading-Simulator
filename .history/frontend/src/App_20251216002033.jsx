import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { Table, Tag, Typography, Card } from "antd";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  DesktopOutlined,
} from "@ant-design/icons";

const {Title, Text } = Typography;

function App() {
  const [stocks, setStocks] = useState([]);

  use
}