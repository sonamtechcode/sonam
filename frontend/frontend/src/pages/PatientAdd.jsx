import { useNavigate, useParams } from 'react-router-dom'
import { useHospital } from '../hooks/useHospital'
import { Form, Input, Select, Button, Card, Row, Col, Space, Spin } from 'antd'
import { UserOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { useState, useEffect } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'

const { TextArea } = Input
const { Option } = Select

export default function PatientAdd() {
  const { selectedHospital } = useHospital()
  const navigate = useNavigate()
  const { id } = useParams()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const isEditMode = !!id

  useEffect(() => {
    if (isEditMode) {
      fetchPatientData()
    }
  }, [id])

  const fetchPatientData = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/patients/${id}`)
      form.setFieldsValue(response.data.data)
    } catch (error) {
      toast.error('Failed to fetch patient data')
      navigate('/patients')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (values) => {
    try {
      if (isEditMode) {
        await api.put(`/patients/${id}`, values)
        toast.success('Patient updated successfully')
      } else {
        await api.post('/patients', { ...values, hospital_id: selectedHospital.id })
        toast.success('Patient registered successfully')
      }
      navigate('/patients')
    } catch (error) {
      toast.error(isEditMode ? 'Failed to update patient' : 'Failed to register patient')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <UserOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
            <h1 className="text-2xl font-bold m-0">
              {isEditMode ? 'Edit Patient' : 'Register New Patient'}
            </h1>
          </div>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/patients')}>
            Back to List
          </Button>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ gender: 'male' }}
        >
          <Row gutter={16}>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label="Full Name"
                name="name"
                rules={[{ required: true, message: 'Please enter patient name' }]}
              >
                <Input placeholder="Enter full name" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label="Age"
                name="age"
                rules={[{ required: true, message: 'Please enter age' }]}
              >
                <Input type="number" placeholder="Enter age" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label="Gender"
                name="gender"
                rules={[{ required: true, message: 'Please select gender' }]}
              >
                <Select>
                  <Option value="male">Male</Option>
                  <Option value="female">Female</Option>
                  <Option value="other">Other</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label="Phone Number"
                name="phone"
                rules={[
                  { required: true, message: 'Please enter phone number' },
                  { pattern: /^[0-9]{10}$/, message: 'Please enter valid 10-digit phone number' }
                ]}
              >
                <Input placeholder="Enter phone number" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label="Email"
                name="email"
                rules={[{ type: 'email', message: 'Please enter valid email' }]}
              >
                <Input placeholder="Enter email address" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Form.Item label="Blood Group" name="blood_group">
                <Select placeholder="Select blood group">
                  <Option value="A+">A+</Option>
                  <Option value="A-">A-</Option>
                  <Option value="B+">B+</Option>
                  <Option value="B-">B-</Option>
                  <Option value="AB+">AB+</Option>
                  <Option value="AB-">AB-</Option>
                  <Option value="O+">O+</Option>
                  <Option value="O-">O-</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item label="Address" name="address">
                <TextArea rows={3} placeholder="Enter complete address" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item label="Emergency Contact Name" name="emergency_contact_name">
                <Input placeholder="Enter emergency contact name" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item label="Emergency Contact Phone" name="emergency_contact">
                <Input placeholder="Enter emergency contact phone" />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item label="Medical History" name="medical_history">
                <TextArea rows={4} placeholder="Enter any relevant medical history" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" size="large">
                {isEditMode ? 'Update Patient' : 'Register Patient'}
              </Button>
              <Button size="large" onClick={() => navigate('/patients')}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}
