import { useState, useEffect } from 'react'
import api from '../services/api'
import { Activity, Plus, TrendingUp, Heart } from 'lucide-react'
import { Button, Table, Modal, Form, InputNumber, Select, DatePicker, message } from 'antd'
import PageLayout from '../components/PageLayout'
import dayjs from 'dayjs'

export default function PatientVitals() {
  const [vitals, setVitals] = useState([])
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    fetchVitals()
    fetchPatients()
  }, [])

  const fetchVitals = async () => {
    try {
      setLoading(true)
      const response = await api.get('/vitals')
      setVitals(response.data.data || [])
    } catch (error) {
      setVitals([
        {
          id: 1,
          patient_name: 'Rajesh Kumar',
          blood_pressure_systolic: 120,
          blood_pressure_diastolic: 80,
          pulse_rate: 72,
          temperature: 98.6,
          oxygen_saturation: 98,
          weight: 70,
          recorded_at: '2025-12-03T10:30:00'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const fetchPatients = async () => {
    try {
      const response = await api.get('/patients')
      setPatients(response.data.data || [])
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleSaveVitals = async (values) => {
    try {
      await api.post('/vitals', values)
      message.success('Vitals recorded successfully!')
      setIsModalOpen(false)
      form.resetFields()
      fetchVitals()
    } catch (error) {
      message.error('Failed to record vitals')
    }
  }

  const columns = [
    {
      title: 'Patient',
      dataIndex: 'patient_name',
      key: 'patient_name'
    },
    {
      title: 'BP',
      key: 'bp',
      render: (_, record) => `${record.blood_pressure_systolic}/${record.blood_pressure_diastolic}`
    },
    {
      title: 'Pulse',
      dataIndex: 'pulse_rate',
      key: 'pulse_rate',
      render: (rate) => `${rate} bpm`
    },
    {
      title: 'Temp',
      dataIndex: 'temperature',
      key: 'temperature',
      render: (temp) => `${temp}°F`
    },
    {
      title: 'SpO2',
      dataIndex: 'oxygen_saturation',
      key: 'oxygen_saturation',
      render: (spo2) => `${spo2}%`
    },
    {
      title: 'Weight',
      dataIndex: 'weight',
      key: 'weight',
      render: (weight) => weight ? `${weight} kg` : '-'
    },
    {
      title: 'Recorded At',
      dataIndex: 'recorded_at',
      key: 'recorded_at',
      render: (date) => dayjs(date).format('DD MMM YYYY HH:mm')
    }
  ]

  return (
    <PageLayout
      title="Patient Vitals"
      subtitle="Record and track patient vital signs"
      action={
        <Button type="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setIsModalOpen(true)} size="large">
          Record Vitals
        </Button>
      }
    >
      <div className="bg-white rounded-lg shadow">
        <Table columns={columns} dataSource={vitals} rowKey="id" loading={loading} />
      </div>

      <Modal
        title="Record Patient Vitals"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleSaveVitals} className="mt-4">
          <Form.Item label="Patient" name="patient_id" rules={[{ required: true }]}>
            <Select placeholder="Select patient" size="large" showSearch>
              {patients.map(p => (
                <Select.Option key={p.id} value={p.id}>{p.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="BP Systolic" name="blood_pressure_systolic" rules={[{ required: true }]}>
              <InputNumber min={60} max={200} size="large" className="w-full" placeholder="120" />
            </Form.Item>
            <Form.Item label="BP Diastolic" name="blood_pressure_diastolic" rules={[{ required: true }]}>
              <InputNumber min={40} max={130} size="large" className="w-full" placeholder="80" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="Pulse Rate (bpm)" name="pulse_rate" rules={[{ required: true }]}>
              <InputNumber min={40} max={200} size="large" className="w-full" placeholder="72" />
            </Form.Item>
            <Form.Item label="Temperature (°F)" name="temperature" rules={[{ required: true }]}>
              <InputNumber min={95} max={106} step={0.1} size="large" className="w-full" placeholder="98.6" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="SpO2 (%)" name="oxygen_saturation">
              <InputNumber min={70} max={100} size="large" className="w-full" placeholder="98" />
            </Form.Item>
            <Form.Item label="Weight (kg)" name="weight">
              <InputNumber min={1} max={300} step={0.1} size="large" className="w-full" placeholder="70" />
            </Form.Item>
          </div>

          <Form.Item className="mb-0">
            <div className="flex gap-2 justify-end">
              <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">Save Vitals</Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </PageLayout>
  )
}
