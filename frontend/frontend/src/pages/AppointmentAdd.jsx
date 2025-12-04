import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useHospital } from '../hooks/useHospital'
import { Form, Input, Select, Button, Card, Row, Col, Space, DatePicker, TimePicker } from 'antd'
import { CalendarOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import api from '../services/api'
import toast from 'react-hot-toast'

const { TextArea } = Input
const { Option } = Select

export default function AppointmentAdd() {
  const { selectedHospital } = useHospital()
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [patients, setPatients] = useState([])
  const [doctors, setDoctors] = useState([])

  useEffect(() => {
    if (selectedHospital) {
      fetchPatients()
      fetchDoctors()
    }
  }, [selectedHospital])

  const fetchPatients = async () => {
    try {
      const response = await api.get(`/patients?hospital_id=${selectedHospital.id}`)
      setPatients(response.data.data)
    } catch (error) {
      console.error('Failed to fetch patients')
    }
  }

  const fetchDoctors = async () => {
    try {
      const response = await api.get(`/doctors?hospital_id=${selectedHospital.id}`)
      setDoctors(response.data.data)
    } catch (error) {
      console.error('Failed to fetch doctors')
    }
  }

  const handleSubmit = async (values) => {
    try {
      const appointmentData = {
        ...values,
        hospital_id: selectedHospital.id,
        appointment_date: values.appointment_date.format('YYYY-MM-DD'),
        appointment_time: values.appointment_time.format('HH:mm:ss')
      }
      await api.post('/appointments', appointmentData)
      toast.success('Appointment booked successfully')
      navigate('/appointments')
    } catch (error) {
      toast.error('Failed to book appointment')
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <CalendarOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
            <h1 className="text-2xl font-bold m-0">Book New Appointment</h1>
          </div>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/appointments')}>
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
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
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
                label="Doctor"
                name="doctor_id"
                rules={[{ required: true, message: 'Please select doctor' }]}
              >
                <Select
                  showSearch
                  placeholder="Select doctor"
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {doctors.map(doctor => (
                    <Option key={doctor.id} value={doctor.id}>
                      Dr. {doctor.name} - {doctor.specialization}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Appointment Date"
                name="appointment_date"
                rules={[{ required: true, message: 'Please select date' }]}
              >
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Appointment Time"
                name="appointment_time"
                rules={[{ required: true, message: 'Please select time' }]}
              >
                <TimePicker style={{ width: '100%' }} format="HH:mm" />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item
                label="Reason for Visit"
                name="reason"
                rules={[{ required: true, message: 'Please enter reason' }]}
              >
                <TextArea rows={4} placeholder="Enter reason for appointment" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Status"
                name="status"
                initialValue="scheduled"
              >
                <Select>
                  <Option value="scheduled">Scheduled</Option>
                  <Option value="confirmed">Confirmed</Option>
                  <Option value="rescheduled">Rescheduled</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item label="Notes" name="notes">
                <TextArea rows={4} placeholder="Additional notes (optional)" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" size="large">
                Book Appointment
              </Button>
              <Button size="large" onClick={() => navigate('/appointments')}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}
