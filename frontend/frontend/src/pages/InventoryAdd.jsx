import { useNavigate } from 'react-router-dom'
import { useHospital } from '../hooks/useHospital'
import { Form, Input, Select, Button, Card, Row, Col, Space, DatePicker } from 'antd'
import { AppstoreOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import PageLayout from '../components/PageLayout'
import api from '../services/api'
import toast from 'react-hot-toast'

const { Option } = Select
const { TextArea } = Input

export default function InventoryAdd() {
  const { selectedHospital } = useHospital()
  const navigate = useNavigate()
  const [form] = Form.useForm()

  const handleSubmit = async (values) => {
    try {
      const itemData = {
        ...values,
        hospital_id: selectedHospital.id,
        purchase_date: values.purchase_date ? values.purchase_date.format('YYYY-MM-DD') : null,
        warranty_expiry: values.warranty_expiry ? values.warranty_expiry.format('YYYY-MM-DD') : null
      }
      await api.post('/inventory', itemData)
      toast.success('Item added successfully')
      navigate('/inventory')
    } catch (error) {
      console.error('Failed to add item:', error)
      toast.error('Failed to add item')
    }
  }

  return (
    <PageLayout>
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <AppstoreOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
            <h1 className="text-2xl font-bold m-0">Add New Inventory Item</h1>
          </div>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/inventory')}>
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
                label="Item Name"
                name="item_name"
                rules={[{ required: true, message: 'Please enter item name' }]}
              >
                <Input placeholder="Enter item name" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Category"
                name="category"
                rules={[{ required: true, message: 'Please select category' }]}
              >
                <Select placeholder="Select category">
                  <Option value="Medical Equipment">Medical Equipment</Option>
                  <Option value="Furniture">Furniture</Option>
                  <Option value="Electronics">Electronics</Option>
                  <Option value="Supplies">Supplies</Option>
                  <Option value="Surgical Instruments">Surgical Instruments</Option>
                  <Option value="Diagnostic Equipment">Diagnostic Equipment</Option>
                  <Option value="Office Equipment">Office Equipment</Option>
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
                label="Unit"
                name="unit"
                rules={[{ required: true, message: 'Please enter unit' }]}
              >
                <Select placeholder="Select unit">
                  <Option value="pieces">Pieces</Option>
                  <Option value="boxes">Boxes</Option>
                  <Option value="units">Units</Option>
                  <Option value="sets">Sets</Option>
                  <Option value="kg">Kilograms</Option>
                  <Option value="liters">Liters</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Purchase Date"
                name="purchase_date"
              >
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Purchase Price (₹)"
                name="purchase_price"
              >
                <Input type="number" min={0} step="0.01" prefix="₹" placeholder="Enter purchase price" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Supplier Name"
                name="supplier_name"
              >
                <Input placeholder="Enter supplier name" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Supplier Contact"
                name="supplier_contact"
              >
                <Input placeholder="Enter supplier contact" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Warranty Expiry"
                name="warranty_expiry"
              >
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Location/Department"
                name="location"
              >
                <Input placeholder="e.g., ICU, OPD, Storage Room" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Serial Number"
                name="serial_number"
              >
                <Input placeholder="Enter serial number" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Condition"
                name="condition"
                initialValue="new"
              >
                <Select>
                  <Option value="new">New</Option>
                  <Option value="good">Good</Option>
                  <Option value="fair">Fair</Option>
                  <Option value="needs_repair">Needs Repair</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item label="Description" name="description">
                <TextArea rows={3} placeholder="Enter item description or specifications" />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item label="Notes" name="notes">
                <TextArea rows={2} placeholder="Additional notes (optional)" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" size="large">
                Add Item
              </Button>
              <Button size="large" onClick={() => navigate('/inventory')}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </PageLayout>
  )
}
