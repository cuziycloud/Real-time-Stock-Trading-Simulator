import { Drawer, Table } from 'antd';
import { WalletOutlined } from '@ant-design/icons';
import { getPortfolioColumns } from '../../constants/tableColumns';

const PortfolioDrawer = ({ open, onClose, data, onSell }) => {
  const columns = getPortfolioColumns(onSell);

  return (
    <Drawer
      title={
        <span>
          <WalletOutlined style={{ marginRight: 8 }} />
          Danh Mục Đầu Tư (My Portfolio)
        </span>
      }
      placement="right"
      size="large"
      onClose={onClose}
      open={open}
    >
      <Table
        dataSource={data}
        columns={columns}
        rowKey="id"
        pagination={false}
        bordered
      />
    </Drawer>
  );
};

export default PortfolioDrawer;