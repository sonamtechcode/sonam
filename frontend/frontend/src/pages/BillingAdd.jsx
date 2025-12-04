import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useHospital } from '../hooks/useHospital'
import { Form, Input, Select, Button, Card, Row, Col, Space, Table } from 'antd'
import { DollarOutlined, ArrowLeftOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import PageLayout from '../components/PageLayout'
import api from '../services/api'
import toast from 'react-hot-toast'

const { Option } = Select
const { TextArea } = Input

export default function BillingAdd() {
  const { selectedHospital } = useHospital()
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [patients, setPatients] = useState([])
  const [items, setItems] = useState([])

  useEffect(() => {
    if (selectedHospital) {
      fetchPatients()
    }
  }, [selectedHospital])

  const fetchPatients = async () => {
    try {
      const response = await api.get(`/patients?hospital_id=${selectedHospital.id}`)
      setPatients(response.data.data)
    } catch (error) {
      console.error('Failed to fetch patients:', error)
    }
  }

  const addItem = () => {
    setItems([...items, { id: Date.now(), description: '', quantity: 1, rate: 0, amount: 0 }])
  }

  const removeItem = (id) => {
    setItems(items.filter(item => item.id !== id))
  }

  const updateItem = (id, field, value) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value }
        if (field === 'quantity' || field === 'rate') {
          updated.amount = (updated.quantity || 0) * (updated.rate || 0)
        }
        return updated
      }
      return item
    }))
  }

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.amount || 0), 0)
  }

  const handleSubmit = async (values) => {
    try {
      if (items.length === 0) {
        toast.error('Please add at least one item')
        return
      }

      const billData = {
        ...values,
        hospital_id: selectedHospital.id,
        items: items,
        total_amount: calculateTotal()
      }
      
      await api.post('/billing', billData)
      toast.success('Bill created successfully')
      navigate('/billing')
    } catch (error) {
      console.error('Failed to create bill:', error)
      toast.error('Failed to create bill')
    }
  }

  const columns = [
    {
      title: 'Description',
      dataIndex: 'description',
      render: (_, record) => (
        <Input
          placeholder="Item description"
          value={record.description}
          onChange={(e) => updateItem(record.id, 'description', e.target.value)}
        />
      )
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      width: 100,
      render: (_, record) => (
        <Input
          type="number"
          min={1}
          value={record.quantity}
          onChange={(e) => updateItem(record.id, 'quantity', Number.parseFloat(e.target.value) || 0)}
        />
      )
    },
    {
      title: 'Rate',
      dataIndex: 'rate',
      width: 120,
      render: (_, record) => (
        <Input
          type="number"
          min={0}
          prefix="₹"
          value={record.rate}
          onChange={(e) => updateItem(record.id, 'rate', Number.parseFloat(e.target.value) || 0)}
        />
      )
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      width: 120,
      render: (_, record) => <span>₹{record.amount.toFixed(2)}</span>
    },
    {
      title: 'Action',
      width: 80,
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => removeItem(record.id)}
        />
      )
    }
  ]

  return (
    <PageLayout>
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <DollarOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
            <h1 className="text-2xl font-bold m-0">Create New Bill</h1>
          </div>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/billing')}>
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
                label="Patient"
                name="patient_id"
                rules={[{ required: true, message: 'Please select patient' }]}
              >
                <Select
                  showSearch
                  placeholder="Select patient"
                  optionFilterProp="children"
                >
                  {patients.map(patient => (
                    <Option key={patient.id} value={patient.id}>
                      {patient.name} - {patient.patient_id}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Payment Method"
                name="payment_method"
                rules={[{ required: true, message: 'Please select payment method' }]}
              >
                <Select placeholder="Select payment method">
                  <Option value="cash">Cash</Option>
                  <Option value="card">Card</Option>
                  <Option value="upi">UPI</Option>
                  <Option value="insurance">Insurance</Option>
                  <Option value="bank_transfer">Bank Transfer</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Payment Status"
                name="payment_status"
                initialValue="pending"
              >
                <Select>
                  <Option value="paid">Paid</Option>
                  <Option value="pending">Pending</Option>
                  <Option value="partial">Partial</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item label="Notes" name="notes">
                <TextArea rows={2} placeholder="Additional notes (optional)" />
              </Form.Item>
            </Col>
          </Row>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">Bill Items</h3>
              <Button type="dashed" icon={<PlusOutlined />} onClick={addItem}>
                Add Item
              </Button>
            </div>
            <Table
              columns={columns}
              dataSource={items}
              rowKey="id"
              pagination={false}
              locale={{ emptyText: 'No items added. Click "Add Item" to start.' }}
            />
            <div className="mt-4 text-right">
              <h2 className="text-xl font-bold">
                Total: ₹{calculateTotal().toFixed(2)}
              </h2>
            </div>
          </div>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" size="large">
                Create Bill
              </Button>
              <Button size="large" onClick={() => navigate('/billing')}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </PageLayout>
  )
}
