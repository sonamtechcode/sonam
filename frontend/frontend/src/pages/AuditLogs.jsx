import { useState, useEffect } from 'react';
import { Table, Card, Row, Col, Statistic, DatePicker, Select, Input, Button, Space, Tag } from 'antd';
import { FileTextOutlined, UserOutlined, ClockCircleOutlined, DownloadOutlined } from '@ant-design/icons';
import PageLayout from '../components/PageLayout';
import api from '../services/api';
import moment from 'moment';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Search } = Input;

export default function AuditLogs() {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({
    action: null,
    module: null,
    startDate: null,
    endDate: null
  });

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, [filters]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/audit-logs', { params: filters });
      setLogs(response.data);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/audit-logs/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleDateChange = (dates) => {
    setFilters({
      ...filters,
      startDate: dates ? dates[0].format('YYYY-MM-DD') : null,
      endDate: dates ? dates[1].format('YYYY-MM-DD') : null
    });
  };

  const handleExport = async () => {
    try {
      const response = await api.get('/audit-logs/export', { params: filters });
      // Create CSV and download
      const csv = convertToCSV(response.data.data);
      downloadCSV(csv, 'audit-logs.csv');
    } catch (error) {
      console.error('Error exporting logs:', error);
    }
  };

  const convertToCSV = (data) => {
    const headers = ['Date', 'User', 'Action', 'Module', 'IP Address', 'Details'];
    const rows = data.map(log => [
      moment(log.created_at).format('YYYY-MM-DD HH:mm:ss'),
      log.user_name || 'System',
      log.action,
      log.module,
      log.ip_address,
      log.details
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const downloadCSV = (csv, filename) => {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  };

  const getActionColor = (action) => {
    const colors = {
      create: 'green',
      update: 'blue',
      delete: 'red',
      login: 'cyan',
      logout: 'default',
      view: 'purple'
    };
    return colors[action] || 'default';
  };

  const columns = [
    {
      title: 'Timestamp',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => moment(date).format('DD MMM YYYY HH:mm:ss'),
      width: 180,
    },
    {
      title: 'User',
      dataIndex: 'user_name',
      key: 'user_name',
      render: (name, record) => (
        <div>
          <div>{name || 'System'}</div>
          <div style={{ fontSize: 12, color: '#888' }}>{record.user_email}</div>
        </div>
      ),
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (action) => (
        <Tag color={getActionColor(action)}>
          {action?.toUpperCase()}
        </Tag>
      ),
      filters: [
        { text: 'Create', value: 'create' },
        { text: 'Update', value: 'update' },
        { text: 'Delete', value: 'delete' },
        { text: 'Login', value: 'login' },
        { text: 'Logout', value: 'logout' },
        { text: 'View', value: 'view' },
      ],
      onFilter: (value, record) => record.action === value,
    },
    {
      title: 'Module',
      dataIndex: 'module',
      key: 'module',
      filters: [
        { text: 'Patients', value: 'patients' },
        { text: 'Doctors', value: 'doctors' },
        { text: 'Appointments', value: 'appointments' },
        { text: 'Billing', value: 'billing' },
        { text: 'Users', value: 'users' },
      ],
      onFilter: (value, record) => record.module === value,
    },
    {
      title: 'IP Address',
      dataIndex: 'ip_address',
      key: 'ip_address',
    },
    {
      title: 'Details',
      dataIndex: 'details',
      key: 'details',
      ellipsis: true,
      render: (details) => {
        try {
          const parsed = JSON.parse(details);
          return JSON.stringify(parsed, null, 2);
        } catch {
          return details;
        }
      },
    },
  ];

  return (
    <PageLayout
      title="Audit Logs"
      subtitle="System activity tracking and monitoring"
    >
      <Space style={{ marginBottom: 16 }} wrap>
        <RangePicker onChange={handleDateChange} />
        <Select
          placeholder="Filter by action"
          style={{ width: 150 }}
          allowClear
          onChange={(value) => setFilters({ ...filters, action: value })}
        >
          <Option value="create">Create</Option>
          <Option value="update">Update</Option>
          <Option value="delete">Delete</Option>
          <Option value="login">Login</Option>
          <Option value="logout">Logout</Option>
        </Select>
        <Select
          placeholder="Filter by module"
          style={{ width: 150 }}
          allowClear
          onChange={(value) => setFilters({ ...filters, module: value })}
        >
          <Option value="patients">Patients</Option>
          <Option value="doctors">Doctors</Option>
          <Option value="appointments">Appointments</Option>
          <Option value="billing">Billing</Option>
          <Option value="users">Users</Option>
        </Select>
        <Button icon={<DownloadOutlined />} onClick={handleExport}>
          Export
        </Button>
      </Space>

      {stats && (
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={8}>
            <Card>
              <Statistic
                title="Total Activities (30 days)"
                value={stats.dailyActivity?.reduce((sum, d) => sum + d.count, 0) || 0}
                prefix={<FileTextOutlined />}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Active Users"
                value={stats.userStats?.length || 0}
                prefix={<UserOutlined />}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Today's Activities"
                value={stats.dailyActivity?.[0]?.count || 0}
                prefix={<ClockCircleOutlined />}
              />
            </Card>
          </Col>
        </Row>
      )}

      <Card>
        <Table
          columns={columns}
          dataSource={logs}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 50 }}
          scroll={{ x: 1200 }}
        />
      </Card>
    </PageLayout>
  );
}
