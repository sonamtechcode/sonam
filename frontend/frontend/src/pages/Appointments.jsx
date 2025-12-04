import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useHospital } from '../hooks/useHospital'
import { Tag, Select, DatePicker, Form } from 'antd'
import PageLayout from '../components/PageLayout'
import PageTitleHeader from '../components/PageTitleHeader'
import CompactTable from '../components/CompactTable'
import FilterDrawer from '../components/FilterDrawer'
import { countActiveFilters } from '../utils/filterHelpers'
import { exportToCSV } from '../utils/exportHelpers'
import AvatarColumn from '../components/AvatarColumn'
import api from '../services/api'
import toast from 'react-hot-toast'

const { RangePicker } = DatePicker

export default function Appointments() {
  const { selectedHospital } = useHospital()
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState([])
  const [search, setSearch] = useState('')
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)
  const [filters, setFilters] = useState({
    status: null,
    dateRange: null
  })

  useEffect(() => {
    if (selectedHospital) fetchAppointments()
  }, [selectedHospital, search, filters])

  const fetchAppointments = async () => {
    try {
      let queryParams = `hospital_id=${selectedHospital.id}`
      if (search) queryParams += `&search=${search}`
      if (filters.status) queryParams += `&status=${filters.status}`
      if (filters.dateRange && filters.dateRange[0] && filters.dateRange[1]) {
        queryParams += `&start_date=${filters.dateRange[0].format('YYYY-MM-DD')}`
        queryParams += `&end_date=${filters.dateRange[1].format('YYYY-MM-DD')}`
      }
      
      const response = await api.get(`/appointments?${queryParams}`)
      setAppointments(response.data.data)
    } catch (error) {
      console.error('Failed to fetch appointments:', error)
      toast.error('Failed to fetch appointments')
    }
  }

  const handleApplyFilters = () => {
    setFilterDrawerOpen(false)
    fetchAppointments()
  }

  const handleResetFilters = () => {
    setFilters({
      status: null,
      dateRange: null
    })
    setFilterDrawerOpen(false)
  }

  const getStatusColor = (status) => {
    const colors = {
      scheduled: 'blue',
      completed: 'green',
      cancelled: 'red',
      rescheduled: 'orange'
    }
    return colors[status] || 'default'
  }

  const handleExport = () => {
    const exportColumns = [
      { header: 'Patient Name', accessor: 'patient_name' },
      { header: 'Doctor', accessor: 'doctor_name' },
      { header: 'Appointment Date', accessor: 'appointment_date' },
      { header: 'Time', accessor: 'appointment_time' },
      { header: 'Reason', accessor: 'reason' },
      { header: 'Status', accessor: 'status' }
    ]
    exportToCSV(appointments, 'appointments.csv', exportColumns)
  }

  const columns = [
    {
      header: 'Patient Name',
      accessor: 'patient_name',
      sortable: true,
      render: (value) => <AvatarColumn name={value} />,
    },
    {
      header: 'Doctor',
      accessor: 'doctor_name',
      sortable: true,
      width: '150px',
      render: (value) => <span style={{ color: '#666', fontSize: '13px' }}>Dr. {value}</span>,
    },
    {
      header: 'Appointment Date',
      accessor: 'appointment_date',
      sortable: true,
      width: '150px',
      render: (value) => {
        const date = new Date(value)
        return <span style={{ color: '#666', fontSize: '13px' }}>
          {date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
        </span>
      },
    },
    {
      header: 'Time',
      accessor: 'appointment_time',
      sortable: true,
      width: '100px',
      render: (value) => <span style={{ color: '#666', fontSize: '13px' }}>{value}</span>,
    },
    {
      header: 'Reason',
      accessor: 'reason',
      sortable: true,
      render: (value) => <span style={{ color: '#666', fontSize: '13px' }}>{value || 'General checkup'}</span>,
    },
    {
      header: 'Status',
      accessor: 'status',
      sortable: true,
      width: '120px',
      render: (value) => (
        <Tag color={getStatusColor(value)} style={{ fontSize: '11px' }}>
          {value.toUpperCase()}
        </Tag>
      ),
    },
  ]

  return (
    <PageLayout
      header={
        <>
          <PageTitleHeader
            title="Appointments"
            subtitle={`Total Appointments: ${appointments.length}`}
            showSearch={true}
            searchPlaceholder="Search Appointment"
            searchValue={search}
            onSearchChange={(e) => setSearch(e.target.value)}
            searchSize="default"
            showFilter={true}
            onFilterClick={() => setFilterDrawerOpen(true)}
            activeFilterCount={countActiveFilters(filters)}
            actions={[
              {
                label: 'Export',
                type: 'default',
                onClick: handleExport
              },
              {
                label: 'Book Appointment',
                type: 'primary',
                onClick: () => navigate('/appointments/add')
              }
            ]}
          />

          <FilterDrawer
            open={filterDrawerOpen}
            onClose={() => setFilterDrawerOpen(false)}
            title="Filter Appointments"
            onApply={handleApplyFilters}
            onReset={handleResetFilters}
          >
            <Form layout="vertical">
              <Form.Item label="Status">
                <Select
                  placeholder="Select status"
                  value={filters.status}
                  onChange={(value) => setFilters({ ...filters, status: value })}
                  allowClear
                  options={[
                    { label: 'Scheduled', value: 'scheduled' },
                    { label: 'Completed', value: 'completed' },
                    { label: 'Cancelled', value: 'cancelled' },
                    { label: 'Rescheduled', value: 'rescheduled' }
                  ]}
                />
              </Form.Item>

              <Form.Item label="Date Range">
                <RangePicker
                  value={filters.dateRange}
                  onChange={(dates) => setFilters({ ...filters, dateRange: dates })}
                  style={{ width: '100%' }}
                  format="YYYY-MM-DD"
                />
              </Form.Item>
            </Form>
          </FilterDrawer>
        </>
      }
    >
      <CompactTable
        columns={columns}
        data={appointments}
        showCheckbox={true}
        showPagination={true}
        pageSize={10}
      />
    </PageLayout>
  )
}
