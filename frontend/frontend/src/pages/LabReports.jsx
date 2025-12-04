import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, DatePicker, Select, message, Space, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import PageLayout from '../components/PageLayout';
import api from '../services/api';
import moment from 'moment';

const { TextArea } = Input;
const { Option } = Select;

export default function LabReports() {
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchReports();
    fetchPatients();
    fetchDoctors();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await api.get('/lab-reports');
      setReports(response.data);
    } catch (error) {
      message.error('Failed to fetch lab reports');
    } finally {
      setLoading(false);
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
    setSelectedReport(null);
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setSelectedReport(record);
    form.setFieldsValue({
      ...record,
      sample_collected_at: record.sample_collected_at ? moment(record.sample_collected_at) : null
    });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/lab-reports/${id}`);
      message.success('Lab report deleted successfully');
      fetchReports();
    } catch (error) {
      message.error('Failed to delete lab report');
    }
  };

  const handleSubmit = async (values) => {
    try {
      const data = {
        ...values,
        sample_collected_at: values.sample_collected_at?.format('YYYY-MM-DD HH:mm:ss')
      };

      if (selectedReport) {
        await api.put(`/lab-reports/${selectedReport.id}`, data);
        message.success('Lab report updated successfully');
      } else {
        await api.post('/lab-reports', data);
        message.success('Lab report added successfully');
      }

      setModalVisible(false);
      fetchReports();
    } catch (error) {
      message.error('Failed to save lab report');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'orange',
      in_progress: 'blue',
      completed: 'green',
      cancelled: 'red'
    };
    return colors[status] || 'default';
  };

  const columns = [
    {
      title: 'Patient Name',
      dataIndex: 'patient_name',
      key: 'patient_name',
    },
    {
      title: 'Test Name',
      dataIndex: 'test_name',
      key: 'test_name',
    },
    {
      title: 'Test Type',
      dataIndex: 'test_type',
      key: 'test_type',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Sample Collected',
      dataIndex: 'sample_collected_at',
      key: 'sample_collected_at',
      render: (date) => date ? moment(date).format('DD MMM YYYY HH:mm') : '-',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Button icon={<DeleteOutlined />} danger onClick={() => handleDelete(record.id)} />
        </Space>
      ),
    },
  ];

  return (
    <PageLayout
      title="Lab Reports"
      subtitle="Manage laboratory test reports"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Add Report
        </Button>
      }
    >
      <Table
        columns={columns}
        dataSource={reports}
        rowKey="id"
        loading={loading}
      />

      <Modal
        title={selectedReport ? 'Edit Lab Report' : 'Add Lab Report'}
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

          <Form.Item name="test_name" label="Test Name" rules={[{ required: true }]}>
            <Input placeholder="e.g., Complete Blood Count" />
          </Form.Item>

          <Form.Item name="test_type" label="Test Type" rules={[{ required: true }]}>
            <Select placeholder="Select test type">
              <Option value="Blood Test">Blood Test</Option>
              <Option value="Urine Test">Urine Test</Option>
              <Option value="X-Ray">X-Ray</Option>
              <Option value="CT Scan">CT Scan</Option>
              <Option value="MRI">MRI</Option>
              <Option value="Ultrasound">Ultrasound</Option>
              <Option value="ECG">ECG</Option>
              <Option value="Other">Other</Option>
            </Select>
          </Form.Item>

          <Form.Item name="sample_collected_at" label="Sample Collection Time">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="results" label="Results">
            <TextArea rows={4} placeholder="Enter test results" />
          </Form.Item>

          <Form.Item name="normal_range" label="Normal Range">
            <Input placeholder="e.g., 4.5-11.0 x10^9/L" />
          </Form.Item>

          <Form.Item name="remarks" label="Remarks">
            <TextArea rows={2} />
          </Form.Item>

          <Form.Item name="status" label="Status" rules={[{ required: true }]}>
            <Select placeholder="Select status">
              <Option value="pending">Pending</Option>
              <Option value="in_progress">In Progress</Option>
              <Option value="completed">Completed</Option>
              <Option value="cancelled">Cancelled</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {selectedReport ? 'Update' : 'Add'}
              </Button>
              <Button onClick={() => setModalVisible(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </PageLayout>
  );
}
