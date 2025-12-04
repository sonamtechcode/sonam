import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Space, Tag, Tabs } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CarOutlined } from '@ant-design/icons';
import PageLayout from '../components/PageLayout';
import api from '../services/api';

const { Option } = Select;
const { TabPane } = Tabs;

export default function Ambulance() {
  const [loading, setLoading] = useState(false);
  const [ambulances, setAmbulances] = useState([]);
  const [trips, setTrips] = useState([]);
  const [patients, setPatients] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [tripModalVisible, setTripModalVisible] = useState(false);
  const [selectedAmbulance, setSelectedAmbulance] = useState(null);
  const [form] = Form.useForm();
  const [tripForm] = Form.useForm();

  useEffect(() => {
    fetchAmbulances();
    fetchTrips();
    fetchPatients();
  }, []);

  const fetchAmbulances = async () => {
    try {
      setLoading(true);
      const response = await api.get('/ambulances');
      setAmbulances(response.data);
    } catch (error) {
      message.error('Failed to fetch ambulances');
    } finally {
      setLoading(false);
    }
  };

  const fetchTrips = async () => {
    try {
      const response = await api.get('/ambulances/trips');
      setTrips(response.data);
    } catch (error) {
      console.error('Error fetching trips:', error);
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

  const handleAdd = () => {
    form.resetFields();
    setSelectedAmbulance(null);
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setSelectedAmbulance(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/ambulances/${id}`);
      message.success('Ambulance deleted successfully');
      fetchAmbulances();
    } catch (error) {
      message.error('Failed to delete ambulance');
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (selectedAmbulance) {
        await api.put(`/ambulances/${selectedAmbulance.id}`, values);
        message.success('Ambulance updated successfully');
      } else {
        await api.post('/ambulances', values);
        message.success('Ambulance added successfully');
      }
      setModalVisible(false);
      fetchAmbulances();
    } catch (error) {
      message.error('Failed to save ambulance');
    }
  };

  const handleCreateTrip = () => {
    tripForm.resetFields();
    setTripModalVisible(true);
  };

  const handleTripSubmit = async (values) => {
    try {
      await api.post('/ambulances/trips', values);
      message.success('Trip created successfully');
      setTripModalVisible(false);
      fetchTrips();
      fetchAmbulances();
    } catch (error) {
      message.error('Failed to create trip');
    }
  };

  const handleUpdateTripStatus = async (tripId, status) => {
    try {
      await api.put(`/ambulances/trips/${tripId}/status`, { status });
      message.success('Trip status updated');
      fetchTrips();
      fetchAmbulances();
    } catch (error) {
      message.error('Failed to update trip status');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      available: 'green',
      in_use: 'blue',
      maintenance: 'orange',
      out_of_service: 'red'
    };
    return colors[status] || 'default';
  };

  const ambulanceColumns = [
    {
      title: 'Vehicle Number',
      dataIndex: 'vehicle_number',
      key: 'vehicle_number',
    },
    {
      title: 'Vehicle Type',
      dataIndex: 'vehicle_type',
      key: 'vehicle_type',
    },
    {
      title: 'Driver Name',
      dataIndex: 'driver_name',
      key: 'driver_name',
    },
    {
      title: 'Driver Phone',
      dataIndex: 'driver_phone',
      key: 'driver_phone',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status?.toUpperCase().replace('_', ' ')}
        </Tag>
      ),
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

  const tripColumns = [
    {
      title: 'Vehicle Number',
      dataIndex: 'vehicle_number',
      key: 'vehicle_number',
    },
    {
      title: 'Patient',
      dataIndex: 'patient_name',
      key: 'patient_name',
    },
    {
      title: 'Pickup Location',
      dataIndex: 'pickup_location',
      key: 'pickup_location',
    },
    {
      title: 'Dropoff Location',
      dataIndex: 'dropoff_location',
      key: 'dropoff_location',
    },
    {
      title: 'Trip Type',
      dataIndex: 'trip_type',
      key: 'trip_type',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'completed' ? 'green' : 'blue'}>
          {status?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          {record.status !== 'completed' && (
            <Button 
              size="small" 
              type="primary"
              onClick={() => handleUpdateTripStatus(record.id, 'completed')}
            >
              Complete
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <PageLayout
      title="Ambulance Management"
      subtitle="Manage ambulances and track trips"
    >
      <Tabs defaultActiveKey="1">
        <TabPane tab="Ambulances" key="1">
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleAdd}
            style={{ marginBottom: 16 }}
          >
            Add Ambulance
          </Button>
          <Table
            columns={ambulanceColumns}
            dataSource={ambulances}
            rowKey="id"
            loading={loading}
          />
        </TabPane>

        <TabPane tab="Trips" key="2">
          <Button 
            type="primary" 
            icon={<CarOutlined />} 
            onClick={handleCreateTrip}
            style={{ marginBottom: 16 }}
          >
            Create Trip
          </Button>
          <Table
            columns={tripColumns}
            dataSource={trips}
            rowKey="id"
            loading={loading}
          />
        </TabPane>
      </Tabs>

      <Modal
        title={selectedAmbulance ? 'Edit Ambulance' : 'Add Ambulance'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="vehicle_number" label="Vehicle Number" rules={[{ required: true }]}>
            <Input placeholder="e.g., MH-01-AB-1234" />
          </Form.Item>

          <Form.Item name="vehicle_type" label="Vehicle Type" rules={[{ required: true }]}>
            <Select placeholder="Select vehicle type">
              <Option value="Basic">Basic</Option>
              <Option value="Advanced">Advanced (ALS)</Option>
              <Option value="ICU">ICU Ambulance</Option>
              <Option value="Neonatal">Neonatal</Option>
            </Select>
          </Form.Item>

          <Form.Item name="driver_name" label="Driver Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="driver_phone" label="Driver Phone" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="equipment" label="Equipment">
            <Input.TextArea rows={3} placeholder="List available equipment" />
          </Form.Item>

          <Form.Item name="status" label="Status" rules={[{ required: true }]}>
            <Select placeholder="Select status">
              <Option value="available">Available</Option>
              <Option value="in_use">In Use</Option>
              <Option value="maintenance">Maintenance</Option>
              <Option value="out_of_service">Out of Service</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {selectedAmbulance ? 'Update' : 'Add'}
              </Button>
              <Button onClick={() => setModalVisible(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Create Ambulance Trip"
        open={tripModalVisible}
        onCancel={() => setTripModalVisible(false)}
        footer={null}
      >
        <Form form={tripForm} layout="vertical" onFinish={handleTripSubmit}>
          <Form.Item name="ambulance_id" label="Ambulance" rules={[{ required: true }]}>
            <Select placeholder="Select ambulance">
              {ambulances.filter(a => a.status === 'available').map(a => (
                <Option key={a.id} value={a.id}>
                  {a.vehicle_number} - {a.vehicle_type}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="patient_id" label="Patient">
            <Select placeholder="Select patient" showSearch optionFilterProp="children">
              {patients.map(p => (
                <Option key={p.id} value={p.id}>{p.name}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="pickup_location" label="Pickup Location" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="dropoff_location" label="Dropoff Location" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="trip_type" label="Trip Type" rules={[{ required: true }]}>
            <Select placeholder="Select trip type">
              <Option value="emergency">Emergency</Option>
              <Option value="transfer">Transfer</Option>
              <Option value="discharge">Discharge</Option>
              <Option value="routine">Routine</Option>
            </Select>
          </Form.Item>

          <Form.Item name="emergency_level" label="Emergency Level">
            <Select placeholder="Select emergency level">
              <Option value="critical">Critical</Option>
              <Option value="high">High</Option>
              <Option value="medium">Medium</Option>
              <Option value="low">Low</Option>
            </Select>
          </Form.Item>

          <Form.Item name="notes" label="Notes">
            <Input.TextArea rows={2} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">Create Trip</Button>
              <Button onClick={() => setTripModalVisible(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </PageLayout>
  );
}
