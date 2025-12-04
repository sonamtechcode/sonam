import { useNavigate } from 'react-router-dom'
import { useHospital } from '../hooks/useHospital'
import { Form, Input, Select, Button, Card, Row, Col, Space, DatePicker } from 'antd'
import { MedicineBoxOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import PageLayout from '../components/PageLayout'
import api from '../services/api'
import toast from 'react-hot-toast'

const { Option } = Select

export default function PharmacyAdd() {
  const { selectedHospital } = useHospital()
  const navigate = useNavigate()
  const [form] = Form.useForm()

  const handleSubmit = async (values) => {
    try {
      const medicineData = {
        ...values,
        hospital_id: selectedHospital.id,
        expiry_date: values.expiry_date.format('YYYY-MM-DD')
      }
      await api.post('/pharmacy/medicines', medicineData)
      toast.success('Medicine added successfully')
      navigate('/pharmacy')
    } catch (error) {
      console.error('Failed to add medicine:', error)
      toast.error('Failed to add medicine')
    }
  }

  return (
    <PageLayout>
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <MedicineBoxOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
            <h1 className="text-2xl font-bold m-0">Add New Medicine</h1>
          </div>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/pharmacy')}>
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
                label="Medicine Name"
                name="name"
                rules={[{ required: true, message: 'Please enter medicine name' }]}
              >
                <Input placeholder="Enter medicine name" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Generic Name"
                name="generic_name"
                rules={[{ required: true, message: 'Please enter generic name' }]}
              >
                <Input placeholder="Enter generic name" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Batch Number"
                name="batch_no"
                rules={[{ required: true, message: 'Please enter batch number' }]}
              >
                <Input placeholder="Enter batch number" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Manufacturer"
                name="manufacturer"
              >
                <Input placeholder="Enter manufacturer name" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Category"
                name="category"
                rules={[{ required: true, message: 'Please select category' }]}
              >
                <Select placeholder="Select category">
                  <Option value="tablet">Tablet</Option>
                  <Option value="capsule">Capsule</Option>
                  <Option value="syrup">Syrup</Option>
                  <Option value="injection">Injection</Option>
                  <Option value="ointment">Ointment</Option>
                  <Option value="drops">Drops</Option>
                  <Option value="inhaler">Inhaler</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Quantity"
                name="quantity"
                rules={[{ required: true, message: 'Please enter quantity' }]}
              >
                <Input type="number" min={0} placeholder="Enter quantity" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Unit Price (₹)"
                name="price"
                rules={[{ required: true, message: 'Please enter price' }]}
              >
                <Input type="number" min={0} step="0.01" prefix="₹" placeholder="Enter price" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Reorder Level"
                name="reorder_level"
                rules={[{ required: true, message: 'Please enter reorder level' }]}
              >
                <Input type="number" min={0} placeholder="Minimum stock level" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Expiry Date"
                name="expiry_date"
                rules={[{ required: true, message: 'Please select expiry date' }]}
              >
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Rack/Shelf Number"
                name="rack_number"
              >
                <Input placeholder="e.g., A-12, B-05" />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item label="Description" name="description">
                <Input.TextArea rows={3} placeholder="Enter medicine description or usage instructions" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" size="large">
                Add Medicine
              </Button>
              <Button size="large" onClick={() => navigate('/pharmacy')}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </PageLayout>
  )
}
