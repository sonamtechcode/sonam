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

export default function Billing() {
  const { selectedHospital } = useHospital()
  const navigate = useNavigate()
  const [bills, setBills] = useState([])
  const [search, setSearch] = useState('')
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)
  const [filters, setFilters] = useState({
    paymentStatus: null,
    paymentMethod: null,
    dateRange: null
  })

  useEffect(() => {
    if (selectedHospital) {
      fetchBills()
    }
  }, [selectedHospital])

  const fetchBills = () => {
    let queryParams = `hospital_id=${selectedHospital.id}`
    if (search) queryParams += `&search=${search}`
    if (filters.paymentStatus) queryParams += `&payment_status=${filters.paymentStatus}`
    if (filters.paymentMethod) queryParams += `&payment_method=${filters.paymentMethod}`
    if (filters.dateRange) {
      queryParams += `&start_date=${filters.dateRange[0].format('YYYY-MM-DD')}`
      queryParams += `&end_date=${filters.dateRange[1].format('YYYY-MM-DD')}`
    }
    
    api.get(`/billing?${queryParams}`)
      .then(res => setBills(res.data.data))
      .catch(err => console.error(err))
  }

  const handleApplyFilters = () => {
    setFilterDrawerOpen(false)
    fetchBills()
  }

  const handleResetFilters = () => {
    setFilters({
      paymentStatus: null,
      paymentMethod: null,
      dateRange: null
    })
  }

  const handleExport = () => {
    const exportColumns = [
      { header: 'Bill Number', accessor: 'bill_number' },
      { header: 'Patient', accessor: 'patient_name' },
      { header: 'Amount', accessor: 'total_amount' },
      { header: 'Payment Method', accessor: 'payment_method' },
      { header: 'Status', accessor: 'payment_status' },
      { header: 'Date', accessor: 'created_at' }
    ]
    exportToCSV(bills, 'billing.csv', exportColumns)
  }

  const columns = [
    {
      header: 'Bill No',
      accessor: 'bill_number',
      sortable: true,
      width: '120px',
      render: (value) => <span style={{ fontWeight: 500 }}>{value}</span>,
    },
    {
      header: 'Patient',
      accessor: 'patient_name',
      sortable: true,
    },
    {
      header: 'Amount',
      accessor: 'total_amount',
      sortable: true,
      width: '120px',
      render: (value) => <span style={{ color: '#52c41a', fontWeight: 600 }}>₹{value}</span>,
    },
    {
      header: 'Payment Method',
      accessor: 'payment_method',
      sortable: true,
      width: '140px',
      render: (value) => <span style={{ textTransform: 'capitalize' }}>{value}</span>,
    },
    {
      header: 'Status',
      accessor: 'payment_status',
      sortable: true,
      width: '100px',
      render: (value) => (
        <Tag color={value === 'paid' ? 'success' : 'warning'} style={{ fontSize: '11px' }}>
          {value.toUpperCase()}
        </Tag>
      ),
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
            title="Billing & Payments"
            subtitle={`Total Bills: ${bills.length}`}
            showSearch={true}
            searchPlaceholder="Search Bill"
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
                label: 'Create Bill',
                type: 'primary',
                icon: <PlusOutlined />,
                onClick: () => navigate('/billing/add')
              }
            ]}
          />

          <FilterDrawer
            open={filterDrawerOpen}
            onClose={() => setFilterDrawerOpen(false)}
            title="Filter Bills"
            onApply={handleApplyFilters}
            onReset={handleResetFilters}
          >
            <Form layout="vertical">
              <Form.Item label="Payment Status">
                <Select
                  placeholder="Select payment status"
                  value={filters.paymentStatus}
                  onChange={(value) => setFilters({ ...filters, paymentStatus: value })}
                  allowClear
                  options={[
                    { label: 'Paid', value: 'paid' },
                    { label: 'Pending', value: 'pending' },
                    { label: 'Overdue', value: 'overdue' }
                  ]}
                />
              </Form.Item>

              <Form.Item label="Payment Method">
                <Select
                  placeholder="Select payment method"
                  value={filters.paymentMethod}
                  onChange={(value) => setFilters({ ...filters, paymentMethod: value })}
                  allowClear
                  options={[
                    { label: 'Cash', value: 'cash' },
                    { label: 'Card', value: 'card' },
                    { label: 'UPI', value: 'upi' },
                    { label: 'Insurance', value: 'insurance' }
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
        data={bills}
        showCheckbox={true}
        showPagination={true}
        pageSize={10}
      />
    </PageLayout>
  )
}
