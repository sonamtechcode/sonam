import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useHospital } from '../hooks/useHospital'
import { Form, Input, Select, Button, Card, Row, Col, Space } from 'antd'
import { ExperimentOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import PageLayout from '../components/PageLayout'
import api from '../services/api'
import toast from 'react-hot-toast'

const { Option } = Select
const { TextArea } = Input

export default function LaboratoryAdd() {
  const { selectedHospital } = useHospital()
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [patients, setPatients] = useState([])

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

  const handleSubmit = async (values) => {
    try {
      const testData = {
        hospital_id: selectedHospital.id,
        patient_id: values.patient_id,
        test_name: values.test_name,
        doctor_id: values.doctor_id || null
      }
      await api.post('/laboratory/bookings', testData)
      toast.success('Lab test booked successfully')
      navigate('/laboratory')
    } catch (error) {
      console.error('Failed to book test:', error)
      toast.error('Failed to book test')
    }
  }

  return (
    <PageLayout>
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <ExperimentOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
            <h1 className="text-2xl font-bold m-0">Book Laboratory Test</h1>
          </div>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/laboratory')}>
            Back to List
          </Button>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ status: 'pending' }}
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
                label="Test Name"
                name="test_name"
                rules={[{ required: true, message: 'Please select test' }]}
              >
                <Select placeholder="Select test">
                  <Option value="Complete Blood Count (CBC)">Complete Blood Count (CBC)</Option>
                  <Option value="Blood Sugar">Blood Sugar</Option>
                  <Option value="Lipid Profile">Lipid Profile</Option>
                  <Option value="Liver Function Test">Liver Function Test</Option>
                  <Option value="Kidney Function Test">Kidney Function Test</Option>
                  <Option value="Thyroid Profile">Thyroid Profile</Option>
                  <Option value="Urine Analysis">Urine Analysis</Option>
                  <Option value="X-Ray">X-Ray</Option>
                  <Option value="ECG">ECG</Option>
                  <Option value="Ultrasound">Ultrasound</Option>
                  <Option value="CT Scan">CT Scan</Option>
                  <Option value="MRI">MRI</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Referring Doctor (Optional)"
                name="doctor_id"
              >
                <Input placeholder="Enter doctor ID if applicable" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" size="large">
                Book Test
              </Button>
              <Button size="large" onClick={() => navigate('/laboratory')}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </PageLayout>
  )
}
