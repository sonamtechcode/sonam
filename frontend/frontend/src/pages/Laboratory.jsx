import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useHospital } from '../hooks/useHospital'
import { PlusOutlined } from '@ant-design/icons'
import { Tag, Select, DatePicker, Form } from 'antd'
import PageLayout from '../components/PageLayout'
import PageTitleHeader from '../components/PageTitleHeader'
import CompactTable from '../components/CompactTable'
import FilterDrawer from '../components/FilterDrawer'
import { countActiveFilters } from '../utils/filterHelpers'
import { exportToCSV } from '../utils/exportHelpers'
import api from '../services/api'

const { RangePicker } = DatePicker

export default function Laboratory() {
  const { selectedHospital } = useHospital()
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [search, setSearch] = useState('')
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)
  const [filters, setFilters] = useState({
    status: null,
    dateRange: null
  })

  useEffect(() => {
    if (selectedHospital) {
      fetchBookings()
    }
  }, [selectedHospital])

  const fetchBookings = () => {
    let queryParams = `hospital_id=${selectedHospital.id}`
    if (search) queryParams += `&search=${search}`
    if (filters.status) queryParams += `&status=${filters.status}`
    if (filters.dateRange) {
      queryParams += `&start_date=${filters.dateRange[0].format('YYYY-MM-DD')}`
      queryParams += `&end_date=${filters.dateRange[1].format('YYYY-MM-DD')}`
    }
    
    api.get(`/laboratory/bookings?${queryParams}`)
      .then(res => setBookings(res.data.data))
      .catch(err => console.error(err))
  }

  const handleApplyFilters = () => {
    setFilterDrawerOpen(false)
    fetchBookings()
  }

  const handleResetFilters = () => {
    setFilters({
      status: null,
      dateRange: null
    })
  }

  const getStatusColor = (status) => {
    if (status === 'completed') return 'success'
    if (status === 'sample_collected') return 'processing'
    return 'warning'
  }

  const handleExport = () => {
    const exportColumns = [
      { header: 'Patient', accessor: 'patient_name' },
      { header: 'Test Name', accessor: 'test_name' },
      { header: 'Status', accessor: 'status' },
      { header: 'Result', accessor: 'result_value' },
      { header: 'Date', accessor: 'created_at' }
    ]
    exportToCSV(bookings, 'laboratory_tests.csv', exportColumns)
  }

  const columns = [
    {
      header: 'Patient',
      accessor: 'patient_name',
      sortable: true,
      render: (value) => <span style={{ fontWeight: 500 }}>{value}</span>,
    },
    {
      header: 'Test Name',
      accessor: 'test_name',
      sortable: true,
    },
    {
      header: 'Status',
      accessor: 'status',
      sortable: true,
      width: '150px',
      render: (value) => (
        <Tag color={getStatusColor(value)} style={{ fontSize: '11px' }}>
          {value.replace('_', ' ').toUpperCase()}
        </Tag>
      ),
    },
    {
      header: 'Result',
      accessor: 'result_value',
      sortable: true,
      width: '120px',
      render: (value) => <span>{value || '-'}</span>,
    },
    {
      header: 'Date',
      accessor: 'created_at',
      sortable: true,
      width: '120px',
      render: (value) => <span>{new Date(value).toLocaleDateString()}</span>,
    },
  ]

  return (
    <PageLayout
      header={
        <>
          <PageTitleHeader
            title="Laboratory"
            subtitle={`Total Tests: ${bookings.length}`}
            showSearch={true}
            searchPlaceholder="Search Test"
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
                label: 'Book Test',
                type: 'primary',
                icon: <PlusOutlined />,
                onClick: () => navigate('/laboratory/add')
              }
            ]}
          />

          <FilterDrawer
            open={filterDrawerOpen}
            onClose={() => setFilterDrawerOpen(false)}
            title="Filter Tests"
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
                    { label: 'Completed', value: 'completed' },
                    { label: 'Sample Collected', value: 'sample_collected' },
                    { label: 'Pending', value: 'pending' }
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
        data={bookings}
        showCheckbox={true}
        showPagination={true}
        pageSize={10}
      />
    </PageLayout>
  )
}
