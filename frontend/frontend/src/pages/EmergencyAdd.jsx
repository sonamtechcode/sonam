import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useHospital } from '../hooks/useHospital'
import { Form, Input, Select, Button, Card, Row, Col, Space } from 'antd'
import { WarningOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import PageLayout from '../components/PageLayout'
import api from '../services/api'
import toast from 'react-hot-toast'

const { Option } = Select
const { TextArea } = Input

export default function EmergencyAdd() {
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
      await api.post('/emergency', { ...values, hospital_id: selectedHospital.id })
      toast.success('Emergency case registered successfully')
      navigate('/emergency')
    } catch (error) {
      console.error('Failed to register emergency:', error)
      toast.error('Failed to register emergency')
    }
  }

  return (
    <PageLayout>
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <WarningOutlined style={{ fontSize: '24px', color: '#ff4d4f' }} />
            <h1 className="text-2xl font-bold m-0">Register Emergency Case</h1>
          </div>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/emergency')}>
            Back to List
          </Button>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ severity: 'medium', status: 'admitted' }}
        >
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Patient"
                name="patient_id"
              >
                <Select
                  showSearch
                  placeholder="Select existing patient or leave empty for new"
                  optionFilterProp="children"
                  allowClear
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
                label="Patient Name"
                name="patient_name"
                rules={[{ required: true, message: 'Please enter patient name' }]}
              >
                <Input placeholder="Enter patient name" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Age"
                name="age"
              >
                <Input type="number" placeholder="Enter age" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Gender"
                name="gender"
              >
                <Select placeholder="Select gender">
                  <Option value="male">Male</Option>
                  <Option value="female">Female</Option>
                  <Option value="other">Other</Option>
                </Select>
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
                label="Severity Level"
                name="severity"
                rules={[{ required: true, message: 'Please select severity' }]}
              >
                <Select>
                  <Option value="low">Low - Non-urgent</Option>
                  <Option value="medium">Medium - Moderate</Option>
                  <Option value="high">High - Urgent</Option>
                  <Option value="critical">Critical - Life-threatening</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item
                label="Chief Complaint"
                name="complaint"
                rules={[{ required: true, message: 'Please enter complaint' }]}
              >
                <TextArea rows={3} placeholder="Describe the emergency condition" />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item
                label="Symptoms"
                name="symptoms"
              >
                <TextArea rows={3} placeholder="List all symptoms" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Blood Pressure"
                name="blood_pressure"
              >
                <Input placeholder="e.g., 120/80" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Heart Rate"
                name="heart_rate"
              >
                <Input placeholder="e.g., 72 bpm" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Temperature"
                name="temperature"
              >
                <Input placeholder="e.g., 98.6°F" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Oxygen Level"
                name="oxygen_level"
              >
                <Input placeholder="e.g., 98%" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Status"
                name="status"
              >
                <Select>
                  <Option value="admitted">Admitted</Option>
                  <Option value="under_observation">Under Observation</Option>
                  <Option value="treated">Treated</Option>
                  <Option value="discharged">Discharged</Option>
                  <Option value="referred">Referred</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Attending Doctor"
                name="doctor_name"
              >
                <Input placeholder="Enter doctor name" />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item label="Initial Treatment" name="initial_treatment">
                <TextArea rows={3} placeholder="Describe initial treatment provided" />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item label="Notes" name="notes">
                <TextArea rows={2} placeholder="Additional notes" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" size="large" danger>
                Register Emergency
              </Button>
              <Button size="large" onClick={() => navigate('/emergency')}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </PageLayout>
  )
}
