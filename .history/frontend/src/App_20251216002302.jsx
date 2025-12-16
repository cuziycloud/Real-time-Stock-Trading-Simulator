import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { Table, Tag, Typography, Card } from "antd";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  DesktopOutlined,
} from "@ant-design/icons";
import PurePanel from "antd/es/tooltip/PurePanel";

const { Title, Text } = Typography;

function App() {
  const [stocks, setStocks] = useState([]);

  useEffect(() => {
    console.log("Dang ket noi...");

    const socket = io("http://localhost:3000");

    socket.on("market-update", (dataTuServerGuive) => {
      console.log('Nhan duoc gia moi: ', dataTuServerGuive);
    });
    setStocks(dataTuServerGuive);
  });
}
