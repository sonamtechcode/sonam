import { useNavigate, useParams } from 'react-router-dom'
import { useEffect } from 'react'
import { useHospital } from '../hooks/useHospital'
import { Form, Input, Select, Button, Card, Row, Col, Space, Switch } from 'antd'
import { UserOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import PageLayout from '../components/PageLayout'
import api from '../services/api'
import toast from 'react-hot-toast'

const { Option } = Select

export default function UserAdd() {
  const { selectedHospital } = useHospital()
  const navigate = useNavigate()
  const { id } = useParams()
  const [form] = Form.useForm()
  const isEdit = !!id

  useEffect(() => {
    if (isEdit && id) {
      fetchUser()
    }
  }, [id])

  const fetchUser = async () => {
    try {
      const response = await api.get(`/users/${id}`)
      form.setFieldsValue(response.data.data)
    } catch (error) {
      console.error('Failed to fetch user:', error)
      toast.error('Failed to fetch user')
    }
  }

  const handleSubmit = async (values) => {
    try {
      const userData = { ...values, hospital_id: selectedHospital.id }
      
      if (isEdit) {
        await api.put(`/users/${id}`, userData)
        toast.success('User updated successfully')
      } else {
        await api.post('/users', userData)
        toast.success('User created successfully')
      }
      navigate('/users')
    } catch (error) {
      console.error('Failed to save user:', error)
      toast.error(error.response?.data?.message || 'Failed to save user')
    }
  }

  return (
    <PageLayout>
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <UserOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
            <h1 className="text-2xl font-bold m-0">{isEdit ? 'Edit User' : 'Add New User'}</h1>
          </div>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/users')}>
            Back to List
          </Button>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ is_active: true }}
        >
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Full Name"
                name="name"
                rules={[{ required: true, message: 'Please enter name' }]}
              >
                <Input placeholder="Enter full name" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: 'Please enter email' },
                  { type: 'email', message: 'Please enter valid email' }
                ]}
              >
                <Input placeholder="Enter email address" disabled={isEdit} />
              </Form.Item>
            </Col>

            {!isEdit && (
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Password"
                  name="password"
                  rules={[
                    { required: true, message: 'Please enter password' },
                    { min: 6, message: 'Password must be at least 6 characters' }
                  ]}
                >
                  <Input.Password placeholder="Enter password" />
                </Form.Item>
              </Col>
            )}

            <Col xs={24} sm={12}>
              <Form.Item
                label="Phone Number"
                name="phone"
                rules={[
                  { pattern: /^[0-9]{10}$/, message: 'Please enter valid 10-digit phone number' }
                ]}
              >
                <Input placeholder="Enter phone number" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Role"
                name="role"
                rules={[{ required: true, message: 'Please select role' }]}
              >
                <Select placeholder="Select role">
                  <Option value="admin">Admin</Option>
                  <Option value="doctor">Doctor</Option>
                  <Option value="nurse">Nurse</Option>
                  <Option value="receptionist">Receptionist</Option>
                  <Option value="pharmacist">Pharmacist</Option>
                  <Option value="lab_technician">Lab Technician</Option>
                  <Option value="staff">Staff</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Status"
                name="is_active"
                valuePropName="checked"
              >
                <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" size="large">
                {isEdit ? 'Update User' : 'Create User'}
              </Button>
              <Button size="large" onClick={() => navigate('/users')}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </PageLayout>
  )
}
