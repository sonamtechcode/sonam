import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { ClipboardList, Plus, Eye, Printer, Download } from 'lucide-react'
import { Button, Table, Tag, Input, Select, DatePicker } from 'antd'
import PageLayout from '../components/PageLayout'
import dayjs from 'dayjs'

export default function Prescriptions() {
  const navigate = useNavigate()
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({})

  useEffect(() => {
    fetchPrescriptions()
  }, [filters])

  const fetchPrescriptions = async () => {
    try {
      setLoading(true)
      const response = await api.get('/prescriptions', { params: filters })
      setPrescriptions(response.data.data || [])
    } catch (error) {
      console.error('Error:', error)
      // Demo data
      setPrescriptions([
        {
          id: 1,
          patient_name: 'Rajesh Kumar',
          doctor_name: 'Dr. Arun Mehta',
          prescription_date: '2025-12-03',
          diagnosis: 'Hypertension',
          medicines_count: 3,
          status: 'issued'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      title: 'Prescription ID',
      dataIndex: 'id',
      key: 'id',
      render: (id) => `RX-${String(id).padStart(4, '0')}`
    },
    {
      title: 'Patient',
      dataIndex: 'patient_name',
      key: 'patient_name'
    },
    {
      title: 'Doctor',
      dataIndex: 'doctor_name',
      key: 'doctor_name'
    },
    {
      title: 'Date',
      dataIndex: 'prescription_date',
      key: 'prescription_date',
      render: (date) => dayjs(date).format('DD MMM YYYY')
    },
    {
      title: 'Diagnosis',
      dataIndex: 'diagnosis',
      key: 'diagnosis'
    },
    {
      title: 'Medicines',
      dataIndex: 'medicines_count',
      key: 'medicines_count',
      render: (count) => `${count} items`
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'issued' ? 'green' : status === 'draft' ? 'orange' : 'blue'}>
          {status.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div className="flex gap-2">
          <Button size="small" icon={<Eye className="w-4 h-4" />}>View</Button>
          <Button size="small" icon={<Printer className="w-4 h-4" />}>Print</Button>
          <Button size="small" icon={<Download className="w-4 h-4" />}>Download</Button>
        </div>
      )
    }
  ]

  return (
    <PageLayout
      title="Digital Prescriptions"
      subtitle="Manage patient prescriptions"
      action={
        <Button type="primary" icon={<Plus className="w-4 h-4" />} size="large">
          New Prescription
        </Button>
      }
    >
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b flex gap-4">
          <Input.Search placeholder="Search prescriptions..." style={{ width: 300 }} />
          <Select placeholder="Status" style={{ width: 150 }} allowClear>
            <Select.Option value="issued">Issued</Select.Option>
            <Select.Option value="draft">Draft</Select.Option>
            <Select.Option value="dispensed">Dispensed</Select.Option>
          </Select>
          <DatePicker.RangePicker />
        </div>
        <Table columns={columns} dataSource={prescriptions} rowKey="id" loading={loading} />
      </div>
    </PageLayout>
  )
}
