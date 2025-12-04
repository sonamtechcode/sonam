import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Space, Tag, Card, Row, Col, Statistic, Rate } from 'antd';
import { PlusOutlined, StarOutlined, SmileOutlined, MehOutlined, FrownOutlined } from '@ant-design/icons';
import PageLayout from '../components/PageLayout';
import api from '../services/api';
import moment from 'moment';

const { TextArea } = Input;
const { Option } = Select;

export default function PatientFeedback() {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState([]);
  const [stats, setStats] = useState(null);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchFeedback();
    fetchStats();
    fetchPatients();
    fetchDoctors();
  }, []);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const response = await api.get('/feedback');
      setFeedback(response.data);
    } catch (error) {
      message.error('Failed to fetch feedback');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/feedback/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await api.get('/patients');
      setPatients(response.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await api.get('/doctors');
      setDoctors(response.data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const handleAdd = () => {
    form.resetFields();
    setModalVisible(true);
  };

  const handleSubmit = async (values) => {
    try {
      await api.post('/feedback', values);
      message.success('Feedback submitted successfully');
      setModalVisible(false);
      fetchFeedback();
      fetchStats();
    } catch (error) {
      message.error('Failed to submit feedback');
    }
  };

  const handleRespond = async (id, response) => {
    try {
      await api.put(`/feedback/${id}/status`, {
        status: 'responded',
        response
      });
      message.success('Response sent successfully');
      fetchFeedback();
    } catch (error) {
      message.error('Failed to send response');
    }
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return 'green';
    if (rating >= 3) return 'orange';
    return 'red';
  };

  const columns = [
    {
      title: 'Patient',
      dataIndex: 'patient_name',
      key: 'patient_name',
    },
    {
      title: 'Doctor',
      dataIndex: 'doctor_name',
      key: 'doctor_name',
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating) => (
        <Tag color={getRatingColor(rating)}>
          <StarOutlined /> {rating}/5
        </Tag>
      ),
    },
    {
      title: 'Service Quality',
      dataIndex: 'service_quality',
      key: 'service_quality',
      render: (rating) => <Rate disabled defaultValue={rating} count={5} />,
    },
    {
      title: 'Comments',
      dataIndex: 'comments',
      key: 'comments',
      ellipsis: true,
    },
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => moment(date).format('DD MMM YYYY'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'responded' ? 'green' : 'blue'}>
          {status?.toUpperCase()}
        </Tag>
      ),
    },
  ];

  return (
    <PageLayout
      title="Patient Feedback"
      subtitle="Collect and manage patient feedback"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Add Feedback
        </Button>
      }
    >
      {stats && (
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Feedback"
                value={stats.stats?.total_feedback || 0}
                prefix={<StarOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Average Rating"
                value={parseFloat(stats.stats?.average_rating || 0).toFixed(1)}
                suffix="/ 5"
                prefix={<StarOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Positive Feedback"
                value={stats.stats?.positive_feedback || 0}
                prefix={<SmileOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Negative Feedback"
                value={stats.stats?.negative_feedback || 0}
                prefix={<FrownOutlined />}
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      <Table
        columns={columns}
        dataSource={feedback}
        rowKey="id"
        loading={loading}
      />

      <Modal
        title="Add Patient Feedback"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="patient_id" label="Patient" rules={[{ required: true }]}>
            <Select placeholder="Select patient" showSearch optionFilterProp="children">
              {patients.map(p => (
                <Option key={p.id} value={p.id}>{p.name}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="doctor_id" label="Doctor">
            <Select placeholder="Select doctor" showSearch optionFilterProp="children">
              {doctors.map(d => (
                <Option key={d.id} value={d.id}>{d.name} - {d.specialization}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="rating" label="Overall Rating" rules={[{ required: true }]}>
            <Rate />
          </Form.Item>

          <Form.Item name="service_quality" label="Service Quality" rules={[{ required: true }]}>
            <Rate />
          </Form.Item>

          <Form.Item name="cleanliness" label="Cleanliness" rules={[{ required: true }]}>
            <Rate />
          </Form.Item>

          <Form.Item name="staff_behavior" label="Staff Behavior" rules={[{ required: true }]}>
            <Rate />
          </Form.Item>

          <Form.Item name="comments" label="Comments">
            <TextArea rows={4} placeholder="Share your experience..." />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">Submit Feedback</Button>
              <Button onClick={() => setModalVisible(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </PageLayout>
  );
}
