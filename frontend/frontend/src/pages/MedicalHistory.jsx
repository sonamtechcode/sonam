import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, DatePicker, Select, message, Space, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import PageLayout from '../components/PageLayout';
import api from '../services/api';
import moment from 'moment';

const { TextArea } = Input;
const { Option } = Select;

export default function MedicalHistory() {
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchHistory();
    fetchPatients();
    fetchDoctors();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get('/medical-history');
      setHistory(response.data);
    } catch (error) {
      message.error('Failed to fetch medical history');
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
    setSelectedRecord(null);
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setSelectedRecord(record);
    form.setFieldsValue({
      ...record,
      visit_date: moment(record.visit_date)
    });
    setModalVisible(true);
  };

  const handleView = (record) => {
    setSelectedRecord(record);
    setViewModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/medical-history/${id}`);
      message.success('Medical history deleted successfully');
      fetchHistory();
    } catch (error) {
      message.error('Failed to delete medical history');
    }
  };

  const handleSubmit = async (values) => {
    try {
      const data = {
        ...values,
        visit_date: values.visit_date.format('YYYY-MM-DD')
      };

      if (selectedRecord) {
        await api.put(`/medical-history/${selectedRecord.id}`, data);
        message.success('Medical history updated successfully');
      } else {
        await api.post('/medical-history', data);
        message.success('Medical history added successfully');
      }

      setModalVisible(false);
      fetchHistory();
    } catch (error) {
      message.error('Failed to save medical history');
    }
  };

  const columns = [
    {
      title: 'Patient Name',
      dataIndex: 'patient_name',
      key: 'patient_name',
    },
    {
      title: 'Doctor',
      dataIndex: 'doctor_name',
      key: 'doctor_name',
    },
    {
      title: 'Visit Date',
      dataIndex: 'visit_date',
      key: 'visit_date',
      render: (date) => moment(date).format('DD MMM YYYY'),
    },
    {
      title: 'Diagnosis',
      dataIndex: 'diagnosis',
      key: 'diagnosis',
      ellipsis: true,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => handleView(record)} />
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Button icon={<DeleteOutlined />} danger onClick={() => handleDelete(record.id)} />
        </Space>
      ),
    },
  ];

  return (
    <PageLayout
      title="Medical History"
      subtitle="Complete medical records of patients"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Add Record
        </Button>
      }
    >
      <Table
        columns={columns}
        dataSource={history}
        rowKey="id"
        loading={loading}
      />

      <Modal
        title={selectedRecord ? 'Edit Medical History' : 'Add Medical History'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="patient_id" label="Patient" rules={[{ required: true }]}>
            <Select placeholder="Select patient" showSearch optionFilterProp="children">
              {patients.map(p => (
                <Option key={p.id} value={p.id}>{p.name}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="doctor_id" label="Doctor" rules={[{ required: true }]}>
            <Select placeholder="Select doctor" showSearch optionFilterProp="children">
              {doctors.map(d => (
                <Option key={d.id} value={d.id}>{d.name} - {d.specialization}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="visit_date" label="Visit Date" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="diagnosis" label="Diagnosis" rules={[{ required: true }]}>
            <TextArea rows={3} />
          </Form.Item>

          <Form.Item name="symptoms" label="Symptoms">
            <TextArea rows={2} />
          </Form.Item>

          <Form.Item name="treatment" label="Treatment">
            <TextArea rows={2} />
          </Form.Item>

          <Form.Item name="medications" label="Medications">
            <TextArea rows={2} />
          </Form.Item>

          <Form.Item name="allergies" label="Allergies">
            <Input />
          </Form.Item>

          <Form.Item name="chronic_conditions" label="Chronic Conditions">
            <Input />
          </Form.Item>

          <Form.Item name="family_history" label="Family History">
            <TextArea rows={2} />
          </Form.Item>

          <Form.Item name="notes" label="Additional Notes">
            <TextArea rows={2} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {selectedRecord ? 'Update' : 'Add'}
              </Button>
              <Button onClick={() => setModalVisible(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Medical History Details"
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={<Button onClick={() => setViewModalVisible(false)}>Close</Button>}
        width={800}
      >
        {selectedRecord && (
          <div>
            <p><strong>Visit Date:</strong> {moment(selectedRecord.visit_date).format('DD MMM YYYY')}</p>
            <p><strong>Diagnosis:</strong> {selectedRecord.diagnosis}</p>
            <p><strong>Symptoms:</strong> {selectedRecord.symptoms}</p>
            <p><strong>Treatment:</strong> {selectedRecord.treatment}</p>
            <p><strong>Medications:</strong> {selectedRecord.medications}</p>
            <p><strong>Allergies:</strong> {selectedRecord.allergies}</p>
            <p><strong>Chronic Conditions:</strong> {selectedRecord.chronic_conditions}</p>
            <p><strong>Family History:</strong> {selectedRecord.family_history}</p>
            <p><strong>Notes:</strong> {selectedRecord.notes}</p>
          </div>
        )}
      </Modal>
    </PageLayout>
  );
}
