import { useNavigate } from 'react-router-dom'
import { useHospital } from '../hooks/useHospital'
import { Form, Input, Button, Card, Row, Col, Space } from 'antd'
import { BankOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import PageLayout from '../components/PageLayout'
import api from '../services/api'
import toast from 'react-hot-toast'

const { TextArea } = Input

export default function DepartmentAdd() {
  const { selectedHospital } = useHospital()
  const navigate = useNavigate()
  const [form] = Form.useForm()

  const handleSubmit = async (values) => {
    try {
      await api.post('/departments', { ...values, hospital_id: selectedHospital.id })
      toast.success('Department added successfully')
      navigate('/departments')
    } catch (error) {
      console.error('Failed to add department:', error)
      toast.error('Failed to add department')
    }
  }

  return (
    <PageLayout>
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <BankOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
            <h1 className="text-2xl font-bold m-0">Add New Department</h1>
          </div>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/departments')}>
            Back to List
          </Button>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Department Name"
                name="name"
                rules={[{ required: true, message: 'Please enter department name' }]}
              >
                <Input placeholder="e.g., Cardiology, Emergency, ICU" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Department Code"
                name="code"
              >
                <Input placeholder="e.g., CARD, EMER, ICU" />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item
                label="Description"
                name="description"
                rules={[{ required: true, message: 'Please enter description' }]}
              >
                <TextArea rows={4} placeholder="Enter department description" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Head of Department"
                name="head_name"
              >
                <Input placeholder="Enter HOD name" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Contact Number"
                name="contact_number"
              >
                <Input placeholder="Enter contact number" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Floor Number"
                name="floor"
              >
                <Input placeholder="e.g., 1st Floor, Ground Floor" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Total Beds"
                name="total_beds"
              >
                <Input type="number" placeholder="Enter total beds" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" size="large">
                Add Department
              </Button>
              <Button size="large" onClick={() => navigate('/departments')}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </PageLayout>
  )
}
