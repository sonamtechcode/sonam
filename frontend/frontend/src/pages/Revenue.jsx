import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Select, DatePicker, Table } from 'antd';
import { DollarOutlined, RiseOutlined, FallOutlined, WalletOutlined } from '@ant-design/icons';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import PageLayout from '../components/PageLayout';
import api from '../services/api';
import moment from 'moment';

const { Option } = Select;
const { RangePicker } = DatePicker;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function Revenue() {
  const [loading, setLoading] = useState(false);
  const [revenueData, setRevenueData] = useState(null);
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    fetchRevenueData();
  }, [period]);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/analytics/revenue', {
        params: { period }
      });
      setRevenueData(response.data);
    } catch (error) {
      console.error('Error fetching revenue data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    if (!revenueData?.revenue) return { total: 0, paid: 0, pending: 0 };
    
    return revenueData.revenue.reduce((acc, item) => ({
      total: acc.total + parseFloat(item.total_revenue || 0),
      paid: acc.paid + parseFloat(item.paid_revenue || 0),
      pending: acc.pending + parseFloat(item.pending_revenue || 0)
    }), { total: 0, paid: 0, pending: 0 });
  };

  const totals = calculateTotals();

  const columns = [
    {
      title: 'Period',
      dataIndex: 'period',
      key: 'period',
      render: (period) => moment(period).format('DD MMM YYYY'),
    },
    {
      title: 'Total Revenue',
      dataIndex: 'total_revenue',
      key: 'total_revenue',
      render: (amount) => `₹${parseFloat(amount).toFixed(2)}`,
    },
    {
      title: 'Paid',
      dataIndex: 'paid_revenue',
      key: 'paid_revenue',
      render: (amount) => `₹${parseFloat(amount).toFixed(2)}`,
    },
    {
      title: 'Pending',
      dataIndex: 'pending_revenue',
      key: 'pending_revenue',
      render: (amount) => `₹${parseFloat(amount).toFixed(2)}`,
    },
    {
      title: 'Transactions',
      dataIndex: 'transaction_count',
      key: 'transaction_count',
    },
  ];

  return (
    <PageLayout
      title="Revenue Analytics"
      subtitle="Financial performance and revenue tracking"
    >
      <div style={{ marginBottom: 16 }}>
        <Select value={period} onChange={setPeriod} style={{ width: 200 }}>
          <Option value="week">Last 7 Days</Option>
          <Option value="month">Last 30 Days</Option>
          <Option value="year">Last 12 Months</Option>
        </Select>
      </div>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Revenue"
              value={totals.total}
              precision={2}
              prefix={<DollarOutlined />}
              suffix="₹"
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Paid Amount"
              value={totals.paid}
              precision={2}
              prefix={<WalletOutlined />}
              suffix="₹"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Pending Amount"
              value={totals.pending}
              precision={2}
              prefix={<RiseOutlined />}
              suffix="₹"
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={16}>
          <Card title="Revenue Trend" loading={loading}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData?.revenue || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="period" 
                  tickFormatter={(value) => moment(value).format('DD MMM')}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => moment(value).format('DD MMM YYYY')}
                  formatter={(value) => `₹${parseFloat(value).toFixed(2)}`}
                />
                <Legend />
                <Line type="monotone" dataKey="total_revenue" stroke="#8884d8" name="Total Revenue" />
                <Line type="monotone" dataKey="paid_revenue" stroke="#82ca9d" name="Paid" />
                <Line type="monotone" dataKey="pending_revenue" stroke="#ffc658" name="Pending" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col span={8}>
          <Card title="Payment Methods" loading={loading}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={revenueData?.paymentMethods || []}
                  dataKey="total"
                  nameKey="payment_method"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(entry) => `${entry.payment_method}: ₹${parseFloat(entry.total).toFixed(0)}`}
                >
                  {revenueData?.paymentMethods?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `₹${parseFloat(value).toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Card title="Revenue Details" loading={loading}>
        <Table
          columns={columns}
          dataSource={revenueData?.revenue || []}
          rowKey="period"
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </PageLayout>
  );
}
