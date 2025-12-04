import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import api from '../services/api'
import { Calendar, Plus, Check, X, Clock, FileText } from 'lucide-react'
import { Button, Table, Modal, Form, Input, Select, DatePicker, message } from 'antd'
import PageLayout from '../components/PageLayout'
import dayjs from 'dayjs'

const { RangePicker } = DatePicker
const { TextArea } = Input

export default function DoctorLeaves() {
  const { user } = useAuth()
  const [leaves, setLeaves] = useState([])
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    fetchLeaves()
    fetchDoctors()
  }, [])

  const fetchLeaves = async () => {
    try {
      setLoading(true)
      const response = await api.get('/doctors/leaves')
      setLeaves(response.data.data || [])
    } catch (error) {
      console.error('Error fetching leaves:', error)
      // Demo data for now
      setLeaves([
        {
          id: 1,
          doctor_name: 'Dr. Arun Mehta',
          leave_type: 'sick',
          start_date: '2025-12-05',
          end_date: '2025-12-07',
          reason: 'Fever and cold',
          status: 'pending',
          created_at: '2025-12-03'
        },
        {
          id: 2,
          doctor_name: 'Dr. Sneha Rao',
          leave_type: 'vacation',
          start_date: '2025-12-10',
          end_date: '2025-12-15',
          reason: 'Family vacation',
          status: 'approved',
          created_at: '2025-12-01'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const fetchDoctors = async () => {
    try {
      const response = await api.get('/doctors')
      setDoctors(response.data.data || [])
    } catch (error) {
      console.error('Error fetching doctors:', error)
    }
  }

  const handleApplyLeave = async (values) => {
    try {
      const leaveData = {
        doctor_id: values.doctor_id,
        leave_type: values.leave_type,
        start_date: values.dates[0].format('YYYY-MM-DD'),
        end_date: values.dates[1].format('YYYY-MM-DD'),
        reason: values.reason,
        status: 'pending'
      }

      await api.post('/doctors/leaves', leaveData)
      message.success('Leave application submitted successfully!')
      setIsModalOpen(false)
      form.resetFields()
      fetchLeaves()
    } catch (error) {
      message.error('Failed to submit leave application')
      console.error('Error:', error)
    }
  }

  const handleApprove = async (id) => {
    try {
      await api.put(`/doctors/leaves/${id}/status`, { status: 'approved' })
      message.success('Leave approved successfully!')
      fetchLeaves()
    } catch (error) {
      message.error('Failed to approve leave')
    }
  }

  const handleReject = async (id) => {
    try {
      await api.put(`/doctors/leaves/${id}/status`, { status: 'rejected' })
      message.success('Leave rejected')
      fetchLeaves()
    } catch (error) {
      message.error('Failed to reject leave')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getLeaveTypeLabel = (type) => {
    const types = {
      sick: 'Sick Leave',
      vacation: 'Vacation',
      emergency: 'Emergency',
      other: 'Other'
    }
    return types[type] || type
  }

  const columns = [
    {
      title: 'Doctor',
      dataIndex: 'doctor_name',
      key: 'doctor_name',
      render: (text) => <span className="font-medium">{text}</span>
    },
    {
      title: 'Leave Type',
      dataIndex: 'leave_type',
      key: 'leave_type',
      render: (type) => (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
          {getLeaveTypeLabel(type)}
        </span>
      )
    },
    {
      title: 'Start Date',
      dataIndex: 'start_date',
      key: 'start_date',
      render: (date) => dayjs(date).format('DD MMM YYYY')
    },
    {
      title: 'End Date',
      dataIndex: 'end_date',
      key: 'end_date',
      render: (date) => dayjs(date).format('DD MMM YYYY')
    },
    {
      title: 'Duration',
      key: 'duration',
      render: (_, record) => {
        const days = dayjs(record.end_date).diff(dayjs(record.start_date), 'day') + 1
        return `${days} day${days > 1 ? 's' : ''}`
      }
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: true
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      )
    },
    {
      title: 'Applied On',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => dayjs(date).format('DD MMM YYYY')
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div className="flex gap-2">
          {record.status === 'pending' && (
            <>
              <Button
                type="primary"
                size="small"
                icon={<Check className="w-4 h-4" />}
                onClick={() => handleApprove(record.id)}
              >
                Approve
              </Button>
              <Button
                danger
                size="small"
                icon={<X className="w-4 h-4" />}
                onClick={() => handleReject(record.id)}
              >
                Reject
              </Button>
            </>
          )}
          {record.status !== 'pending' && (
            <span className="text-gray-400 text-sm">No actions</span>
          )}
        </div>
      )
    }
  ]

  const stats = [
    {
      label: 'Total Leaves',
      value: leaves.length,
      icon: FileText,
      color: 'bg-blue-500'
    },
    {
      label: 'Pending',
      value: leaves.filter(l => l.status === 'pending').length,
      icon: Clock,
      color: 'bg-yellow-500'
    },
    {
      label: 'Approved',
      value: leaves.filter(l => l.status === 'approved').length,
      icon: Check,
      color: 'bg-green-500'
    },
    {
      label: 'Rejected',
      value: leaves.filter(l => l.status === 'rejected').length,
      icon: X,
      color: 'bg-red-500'
    }
  ]

  return (
    <PageLayout
      title="Doctor Leaves"
      subtitle="Manage doctor leave applications"
      action={
        <Button
          type="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setIsModalOpen(true)}
          size="large"
        >
          Apply Leave
        </Button>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-3xl font-bold mt-2">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Leaves Table */}
      <div className="bg-white rounded-lg shadow">
        <Table
          columns={columns}
          dataSource={leaves}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} leaves`
          }}
        />
      </div>

      {/* Apply Leave Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary-600" />
            <span>Apply for Leave</span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false)
          form.resetFields()
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleApplyLeave}
          className="mt-4"
        >
          <Form.Item
            label="Doctor"
            name="doctor_id"
            rules={[{ required: true, message: 'Please select a doctor' }]}
          >
            <Select
              placeholder="Select doctor"
              size="large"
              showSearch
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {doctors.map(doctor => (
                <Select.Option key={doctor.id} value={doctor.id}>
                  {doctor.name} - {doctor.specialization}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Leave Type"
            name="leave_type"
            rules={[{ required: true, message: 'Please select leave type' }]}
          >
            <Select placeholder="Select leave type" size="large">
              <Select.Option value="sick">Sick Leave</Select.Option>
              <Select.Option value="vacation">Vacation</Select.Option>
              <Select.Option value="emergency">Emergency</Select.Option>
              <Select.Option value="other">Other</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Leave Duration"
            name="dates"
            rules={[{ required: true, message: 'Please select dates' }]}
          >
            <RangePicker
              size="large"
              className="w-full"
              format="DD MMM YYYY"
              disabledDate={(current) => current && current < dayjs().startOf('day')}
            />
          </Form.Item>

          <Form.Item
            label="Reason"
            name="reason"
            rules={[{ required: true, message: 'Please provide a reason' }]}
          >
            <TextArea
              rows={4}
              placeholder="Enter reason for leave..."
              maxLength={500}
              showCount
            />
          </Form.Item>

          <Form.Item className="mb-0">
            <div className="flex gap-2 justify-end">
              <Button onClick={() => {
                setIsModalOpen(false)
                form.resetFields()
              }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Submit Application
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </PageLayout>
  )
}
