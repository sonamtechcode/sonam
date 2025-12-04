import { useState, useEffect } from 'react'
import api from '../services/api'
import { Calendar, Clock, Plus, Edit, Trash2, Save } from 'lucide-react'
import { Button, Table, Modal, Form, Select, TimePicker, InputNumber, Switch, message } from 'antd'
import PageLayout from '../components/PageLayout'
import dayjs from 'dayjs'

export default function DoctorSchedule() {
  const [schedules, setSchedules] = useState([])
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState(null)
  const [form] = Form.useForm()

  useEffect(() => {
    fetchSchedules()
    fetchDoctors()
  }, [])

  const fetchSchedules = async () => {
    try {
      setLoading(true)
      const response = await api.get('/doctors/schedules')
      setSchedules(response.data.data || [])
    } catch (error) {
      console.error('Error fetching schedules:', error)
      // Demo data
      setSchedules([
        {
          id: 1,
          doctor_name: 'Dr. Arun Mehta',
          specialization: 'Cardiologist',
          day_of_week: 'monday',
          start_time: '09:00:00',
          end_time: '17:00:00',
          slot_duration: 15,
          max_patients: 20,
          is_active: true
        },
        {
          id: 2,
          doctor_name: 'Dr. Sneha Rao',
          specialization: 'Neurologist',
          day_of_week: 'monday',
          start_time: '10:00:00',
          end_time: '18:00:00',
          slot_duration: 20,
          max_patients: 15,
          is_active: true
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

  const handleSaveSchedule = async (values) => {
    try {
      const scheduleData = {
        doctor_id: values.doctor_id,
        day_of_week: values.day_of_week,
        start_time: values.times[0].format('HH:mm:ss'),
        end_time: values.times[1].format('HH:mm:ss'),
        slot_duration: values.slot_duration,
        max_patients: values.max_patients,
        is_active: values.is_active !== false
      }

      if (editingSchedule) {
        await api.put(`/doctors/schedules/${editingSchedule.id}`, scheduleData)
        message.success('Schedule updated successfully!')
      } else {
        await api.post('/doctors/schedules', scheduleData)
        message.success('Schedule created successfully!')
      }

      setIsModalOpen(false)
      setEditingSchedule(null)
      form.resetFields()
      fetchSchedules()
    } catch (error) {
      message.error('Failed to save schedule')
      console.error('Error:', error)
    }
  }

  const handleEdit = (schedule) => {
    setEditingSchedule(schedule)
    form.setFieldsValue({
      doctor_id: schedule.doctor_id,
      day_of_week: schedule.day_of_week,
      times: [
        dayjs(schedule.start_time, 'HH:mm:ss'),
        dayjs(schedule.end_time, 'HH:mm:ss')
      ],
      slot_duration: schedule.slot_duration,
      max_patients: schedule.max_patients,
      is_active: schedule.is_active
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/doctors/schedules/${id}`)
      message.success('Schedule deleted successfully!')
      fetchSchedules()
    } catch (error) {
      message.error('Failed to delete schedule')
    }
  }

  const handleToggleActive = async (id, isActive) => {
    try {
      await api.put(`/doctors/schedules/${id}`, { is_active: !isActive })
      message.success(`Schedule ${!isActive ? 'activated' : 'deactivated'}`)
      fetchSchedules()
    } catch (error) {
      message.error('Failed to update schedule')
    }
  }

  const daysOfWeek = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' }
  ]

  const columns = [
    {
      title: 'Doctor',
      dataIndex: 'doctor_name',
      key: 'doctor_name',
      render: (text, record) => (
        <div>
          <div className="font-medium">{text}</div>
          <div className="text-sm text-gray-500">{record.specialization}</div>
        </div>
      )
    },
    {
      title: 'Day',
      dataIndex: 'day_of_week',
      key: 'day_of_week',
      render: (day) => (
        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
          {day.charAt(0).toUpperCase() + day.slice(1)}
        </span>
      )
    },
    {
      title: 'Time',
      key: 'time',
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-400" />
          <span>{dayjs(record.start_time, 'HH:mm:ss').format('hh:mm A')} - {dayjs(record.end_time, 'HH:mm:ss').format('hh:mm A')}</span>
        </div>
      )
    },
    {
      title: 'Slot Duration',
      dataIndex: 'slot_duration',
      key: 'slot_duration',
      render: (duration) => `${duration} min`
    },
    {
      title: 'Max Patients',
      dataIndex: 'max_patients',
      key: 'max_patients'
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive, record) => (
        <Switch
          checked={isActive}
          onChange={() => handleToggleActive(record.id, isActive)}
          checkedChildren="Active"
          unCheckedChildren="Inactive"
        />
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div className="flex gap-2">
          <Button
            type="text"
            icon={<Edit className="w-4 h-4" />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Button
            type="text"
            danger
            icon={<Trash2 className="w-4 h-4" />}
            onClick={() => handleDelete(record.id)}
          >
            Delete
          </Button>
        </div>
      )
    }
  ]

  // Group schedules by day
  const schedulesByDay = daysOfWeek.map(day => ({
    day: day.label,
    schedules: schedules.filter(s => s.day_of_week === day.value && s.is_active)
  }))

  return (
    <PageLayout
      title="Doctor Schedule"
      subtitle="Manage doctor weekly schedules"
      action={
        <Button
          type="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => {
            setEditingSchedule(null)
            form.resetFields()
            setIsModalOpen(true)
          }}
          size="large"
        >
          Add Schedule
        </Button>
      }
    >
      {/* Weekly Calendar View */}
      <div className="bg-white rounded-lg shadow mb-6 p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Weekly Schedule Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {schedulesByDay.map((dayData, index) => (
            <div key={index} className="border rounded-lg p-3">
              <div className="font-semibold text-sm mb-2 text-center pb-2 border-b">
                {dayData.day}
              </div>
              <div className="space-y-2 mt-2">
                {dayData.schedules.length > 0 ? (
                  dayData.schedules.map((schedule, idx) => (
                    <div key={idx} className="bg-blue-50 p-2 rounded text-xs">
                      <div className="font-medium truncate">{schedule.doctor_name}</div>
                      <div className="text-gray-600">
                        {dayjs(schedule.start_time, 'HH:mm:ss').format('HH:mm')} - {dayjs(schedule.end_time, 'HH:mm:ss').format('HH:mm')}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-400 text-xs text-center py-4">No schedule</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Schedules Table */}
      <div className="bg-white rounded-lg shadow">
        <Table
          columns={columns}
          dataSource={schedules}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} schedules`
          }}
        />
      </div>

      {/* Add/Edit Schedule Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary-600" />
            <span>{editingSchedule ? 'Edit Schedule' : 'Add Schedule'}</span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false)
          setEditingSchedule(null)
          form.resetFields()
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveSchedule}
          className="mt-4"
          initialValues={{
            slot_duration: 15,
            max_patients: 20,
            is_active: true
          }}
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
            label="Day of Week"
            name="day_of_week"
            rules={[{ required: true, message: 'Please select a day' }]}
          >
            <Select placeholder="Select day" size="large">
              {daysOfWeek.map(day => (
                <Select.Option key={day.value} value={day.value}>
                  {day.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Working Hours"
            name="times"
            rules={[{ required: true, message: 'Please select working hours' }]}
          >
            <TimePicker.RangePicker
              size="large"
              className="w-full"
              format="hh:mm A"
              minuteStep={15}
            />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label="Slot Duration (minutes)"
              name="slot_duration"
              rules={[{ required: true, message: 'Required' }]}
            >
              <InputNumber
                min={5}
                max={60}
                step={5}
                size="large"
                className="w-full"
              />
            </Form.Item>

            <Form.Item
              label="Max Patients"
              name="max_patients"
              rules={[{ required: true, message: 'Required' }]}
            >
              <InputNumber
                min={1}
                max={100}
                size="large"
                className="w-full"
              />
            </Form.Item>
          </div>

          <Form.Item
            label="Active"
            name="is_active"
            valuePropName="checked"
          >
            <Switch checkedChildren="Yes" unCheckedChildren="No" />
          </Form.Item>

          <Form.Item className="mb-0">
            <div className="flex gap-2 justify-end">
              <Button onClick={() => {
                setIsModalOpen(false)
                setEditingSchedule(null)
                form.resetFields()
              }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" icon={<Save className="w-4 h-4" />}>
                {editingSchedule ? 'Update' : 'Create'} Schedule
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </PageLayout>
  )
}
