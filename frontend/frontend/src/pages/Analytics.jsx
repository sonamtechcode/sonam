import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, DatePicker, Select } from 'antd';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarOutlined, UserOutlined, CalendarOutlined, MedicineBoxOutlined } from '@ant-design/icons';
import PageLayout from '../components/PageLayout';
import api from '../services/api';

const { RangePicker } = DatePicker;
const { Option } = Select;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function Analytics() {
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.get('/analytics/dashboard', {
        params: { period }
      });
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Doctor Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Specialization',
      dataIndex: 'specialization',
      key: 'specialization',
    },
    {
      title: 'Total Appointments',
      dataIndex: 'appointment_count',
      key: 'appointment_count',
    },
    {
      title: 'Completed',
      dataIndex: 'completed_count',
      key: 'completed_count',
    },
  ];

  return (
    <PageLayout
      title="Analytics Dashboard"
      subtitle="Business insights and performance metrics"
    >
      <div style={{ marginBottom: 16 }}>
        <Select value={period} onChange={setPeriod} style={{ width: 200 }}>
          <Option value="week">Last 7 Days</Option>
          <Option value="month">Last 30 Days</Option>
          <Option value="year">Last 12 Months</Option>
        </Select>
      </div>

      {analytics && (
        <>
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Total Patients"
                  value={analytics.patientStats?.total_patients || 0}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Today's Patients"
                  value={analytics.patientStats?.today_patients || 0}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Total Appointments"
                  value={analytics.appointmentStats?.total_appointments || 0}
                  prefix={<CalendarOutlined />}
                  valueStyle={{ color: '#cf1322' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Completed"
                  value={analytics.appointmentStats?.completed || 0}
                  prefix={<MedicineBoxOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={12}>
              <Card title="Revenue Trend" loading={loading}>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.revenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col span={12}>
              <Card title="Department Distribution" loading={loading}>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.departmentStats}
                      dataKey="patient_count"
                      nameKey="department"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {analytics.departmentStats?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>

          <Card title="Top Performing Doctors" loading={loading}>
            <Table
              columns={columns}
              dataSource={analytics.topDoctors}
              rowKey="name"
              pagination={false}
            />
          </Card>
        </>
      )}
    </PageLayout>
  );
}
