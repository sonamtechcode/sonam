import { useNavigate, useParams } from 'react-router-dom'
import { useHospital } from '../hooks/useHospital'
import { Form, Input, Select, Button, Card, Row, Col, Space } from 'antd'
import { MedicineBoxOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { useEffect, useState } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'

const { TextArea } = Input
const { Option } = Select

export default function DoctorAdd() {
  const { selectedHospital } = useHospital()
  const navigate = useNavigate()
  const { id } = useParams()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const isEditMode = Boolean(id)

  useEffect(() => {
    if (isEditMode) {
      fetchDoctor()
    }
  }, [id])

  const fetchDoctor = async () => {
    try {
      const response = await api.get(`/doctors/${id}`)
      form.setFieldsValue(response.data.data)
    } catch (error) {
      toast.error('Failed to fetch doctor details')
      navigate('/doctors')
    }
  }

  const handleSubmit = async (values) => {
    setLoading(true)
    try {
      if (isEditMode) {
        await api.put(`/doctors/${id}`, values)
        toast.success('Doctor updated successfully')
      } else {
        await api.post('/doctors', { ...values, hospital_id: selectedHospital.id })
        toast.success('Doctor added successfully')
      }
      navigate('/doctors')
    } catch (error) {
      toast.error(`Failed to ${isEditMode ? 'update' : 'add'} doctor`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <MedicineBoxOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
            <h1 className="text-2xl font-bold m-0">{isEditMode ? 'Edit Doctor' : 'Add New Doctor'}</h1>
          </div>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/doctors')}>
            Back to List
          </Button>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label="Full Name"
                name="name"
                rules={[{ required: true, message: 'Please enter doctor name' }]}
              >
                <Input placeholder="Enter full name" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label="Specialization"
                name="specialization"
                rules={[{ required: true, message: 'Please enter specialization' }]}
              >
                <Select placeholder="Select specialization">
                  <Option value="Cardiology">Cardiology</Option>
                  <Option value="Neurology">Neurology</Option>
                  <Option value="Pediatrics">Pediatrics</Option>
                  <Option value="Orthopedics">Orthopedics</Option>
                  <Option value="Dermatology">Dermatology</Option>
                  <Option value="General Medicine">General Medicine</Option>
                  <Option value="Surgery">Surgery</Option>
                  <Option value="Gynecology">Gynecology</Option>
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
                rules={[
                  { required: true, message: 'Please enter email' },
                  { type: 'email', message: 'Please enter valid email' }
                ]}
              >
                <Input placeholder="Enter email address" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label="Experience (Years)"
                name="experience"
                rules={[{ required: true, message: 'Please enter experience' }]}
              >
                <Input type="number" placeholder="Enter years of experience" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label="Consultation Fee"
                name="consultation_fee"
                rules={[{ required: true, message: 'Please enter consultation fee' }]}
              >
                <Input type="number" prefix="₹" placeholder="Enter consultation fee" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label="License Number"
                name="license_number"
              >
                <Input placeholder="Enter medical license number" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label="Department"
                name="department_id"
              >
                <Select placeholder="Select department">
                  <Option value="1">Emergency</Option>
                  <Option value="2">ICU</Option>
                  <Option value="3">OPD</Option>
                  <Option value="4">Surgery</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label="Qualification"
                name="qualification"
              >
                <Input placeholder="e.g., MBBS, MD" />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item label="Address" name="address">
                <TextArea rows={3} placeholder="Enter complete address" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" size="large" loading={loading}>
                {isEditMode ? 'Update Doctor' : 'Add Doctor'}
              </Button>
              <Button size="large" onClick={() => navigate('/doctors')}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}
