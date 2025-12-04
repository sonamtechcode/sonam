import { useState, useEffect } from 'react';
import { Table, Card, Row, Col, Statistic, Tag, Alert, Space } from 'antd';
import { WarningOutlined, ExclamationCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import PageLayout from '../components/PageLayout';
import api from '../services/api';
import moment from 'moment';

export default function MedicineAlerts() {
  const [loading, setLoading] = useState(false);
  const [medicines, setMedicines] = useState([]);
  const [stats, setStats] = useState({
    expired: 0,
    expiringSoon: 0,
    lowStock: 0,
    outOfStock: 0
  });

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const response = await api.get('/pharmacy');
      const data = response.data;

      // Calculate alerts
      const today = moment();
      const thirtyDaysLater = moment().add(30, 'days');

      const expired = data.filter(m => moment(m.expiry_date).isBefore(today));
      const expiringSoon = data.filter(m => 
        moment(m.expiry_date).isAfter(today) && 
        moment(m.expiry_date).isBefore(thirtyDaysLater)
      );
      const lowStock = data.filter(m => m.quantity > 0 && m.quantity <= (m.min_stock_level || 10));
      const outOfStock = data.filter(m => m.quantity === 0);

      setStats({
        expired: expired.length,
        expiringSoon: expiringSoon.length,
        lowStock: lowStock.length,
        outOfStock: outOfStock.length
      });

      // Combine all alerts
      const alerts = [
        ...expired.map(m => ({ ...m, alertType: 'expired', priority: 'high' })),
        ...expiringSoon.map(m => ({ ...m, alertType: 'expiring', priority: 'medium' })),
        ...outOfStock.map(m => ({ ...m, alertType: 'out_of_stock', priority: 'high' })),
        ...lowStock.map(m => ({ ...m, alertType: 'low_stock', priority: 'medium' }))
      ];

      setMedicines(alerts);
    } catch (error) {
      console.error('Error fetching medicines:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAlertTag = (alertType) => {
    const tags = {
      expired: <Tag color="red">EXPIRED</Tag>,
      expiring: <Tag color="orange">EXPIRING SOON</Tag>,
      out_of_stock: <Tag color="red">OUT OF STOCK</Tag>,
      low_stock: <Tag color="orange">LOW STOCK</Tag>
    };
    return tags[alertType];
  };

  const columns = [
    {
      title: 'Medicine Name',
      dataIndex: 'medicine_name',
      key: 'medicine_name',
    },
    {
      title: 'Alert Type',
      dataIndex: 'alertType',
      key: 'alertType',
      render: (type) => getAlertTag(type),
    },
    {
      title: 'Current Stock',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (qty) => (
        <span style={{ color: qty === 0 ? 'red' : qty <= 10 ? 'orange' : 'green' }}>
          {qty}
        </span>
      ),
    },
    {
      title: 'Expiry Date',
      dataIndex: 'expiry_date',
      key: 'expiry_date',
      render: (date) => {
        const expiryDate = moment(date);
        const daysUntilExpiry = expiryDate.diff(moment(), 'days');
        const color = daysUntilExpiry < 0 ? 'red' : daysUntilExpiry < 30 ? 'orange' : 'green';
        
        return (
          <span style={{ color }}>
            {expiryDate.format('DD MMM YYYY')}
            {daysUntilExpiry >= 0 && ` (${daysUntilExpiry} days)`}
          </span>
        );
      },
    },
    {
      title: 'Batch Number',
      dataIndex: 'batch_number',
      key: 'batch_number',
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `₹${price}`,
    },
  ];

  return (
    <PageLayout
      title="Medicine Alerts"
      subtitle="Expiry and stock level alerts"
    >
      <Alert
        message="Medicine Alert System"
        description="Monitor expired medicines, expiring soon items, and low stock levels"
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Expired Medicines"
              value={stats.expired}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Expiring Soon (30 days)"
              value={stats.expiringSoon}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Out of Stock"
              value={stats.outOfStock}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Low Stock"
              value={stats.lowStock}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="All Alerts">
        <Table
          columns={columns}
          dataSource={medicines}
          rowKey="id"
          loading={loading}
          rowClassName={(record) => {
            if (record.alertType === 'expired' || record.alertType === 'out_of_stock') {
              return 'alert-row-high';
            }
            return 'alert-row-medium';
          }}
        />
      </Card>

      <style jsx>{`
        .alert-row-high {
          background-color: #fff1f0;
        }
        .alert-row-medium {
          background-color: #fffbe6;
        }
      `}</style>
    </PageLayout>
  );
}
