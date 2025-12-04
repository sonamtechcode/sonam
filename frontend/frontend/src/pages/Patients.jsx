import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useHospital } from '../hooks/useHospital'
import { usePermissions } from '../hooks/usePermissions.jsx'
import { Button, Tag, Select, DatePicker, Form, Tooltip, Popconfirm } from 'antd'
import { UserOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import PageLayout from '../components/PageLayout'
import PageTitleHeader from '../components/PageTitleHeader'
import CompactTable from '../components/CompactTable'
import FilterDrawer from '../components/FilterDrawer'
import { countActiveFilters } from '../utils/filterHelpers'
import { exportToCSV } from '../utils/exportHelpers'
import api from '../services/api'
import toast from 'react-hot-toast'

const { RangePicker } = DatePicker

export default function Patients() {
  const { selectedHospital } = useHospital()
  const { canCreate, canExport } = usePermissions()
  const navigate = useNavigate()
  const [patients, setPatients] = useState([])
  const [search, setSearch] = useState('')
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)
  
  // Filter states
  const [filters, setFilters] = useState({
    gender: null,
    blood_group: null,
    dateRange: null
  })

  useEffect(() => {
    if (selectedHospital) fetchPatients()
  }, [selectedHospital, search, filters])

  const fetchPatients = async () => {
    try {
      // Build query params with filters
      let queryParams = `hospital_id=${selectedHospital.id}&search=${search}`
      if (filters.gender) queryParams += `&gender=${filters.gender}`
      if (filters.blood_group) queryParams += `&blood_group=${filters.blood_group}`
      if (filters.dateRange && filters.dateRange[0] && filters.dateRange[1]) {
        queryParams += `&start_date=${filters.dateRange[0].format('YYYY-MM-DD')}`
        queryParams += `&end_date=${filters.dateRange[1].format('YYYY-MM-DD')}`
      }
      
      const response = await api.get(`/patients?${queryParams}`)
      setPatients(response.data.data)
    } catch (error) {
      console.error('Failed to fetch patients:', error)
      toast.error('Failed to fetch patients')
    }
  }

  const handleExport = () => {
    const exportColumns = [
      { header: 'Patient ID', accessor: 'patient_id' },
      { header: 'Name', accessor: 'name' },
      { header: 'Age', accessor: 'age' },
      { header: 'Gender', accessor: 'gender' },
      { header: 'Blood Group', accessor: 'blood_group' },
      { header: 'Phone', accessor: 'phone' },
      { header: 'Email', accessor: 'email' },
      { header: 'Created At', accessor: 'created_at' }
    ]
    exportToCSV(patients, 'patients.csv', exportColumns)
  }

  const handleApplyFilters = () => {
    setFilterDrawerOpen(false)
    fetchPatients()
  }

  const handleResetFilters = () => {
    setFilters({
      gender: null,
      blood_group: null,
      dateRange: null
    })
    setFilterDrawerOpen(false)
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/patients/${id}`)
      toast.success('Patient deleted successfully')
      fetchPatients()
    } catch (error) {
      console.error('Failed to delete patient:', error)
      toast.error('Failed to delete patient')
    }
  }

  const columns = [
    {
      header: 'Action',
      accessor: 'action',
      sortable: false,
      width: '100px',
      render: (_, record) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Tooltip title="View">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined style={{ fontSize: '16px', color: '#52c41a' }} />}
              onClick={() => navigate(`/patients/view/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined style={{ fontSize: '16px', color: '#1890ff' }} />}
              onClick={() => navigate(`/patients/edit/${record.id}`)}
            />
          </Tooltip>
          <Popconfirm
            title="Delete patient"
            description="Are you sure you want to delete this patient?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <Button
                type="text"
                size="small"
                icon={<DeleteOutlined style={{ fontSize: '16px', color: '#ff4d4f' }} />}
              />
            </Tooltip>
          </Popconfirm>
        </div>
      ),
    },
    {
      header: 'Patient Id',
      accessor: 'patient_id',
      sortable: true,
      render: (value) => <span>{value}</span>,
    },
    {
      header: 'Patient Name',
      accessor: 'name',
      sortable: true,
      render: (value) => <span>{value}</span>,
    },
    {
      header: 'Phone',
      accessor: 'phone',
      sortable: true,
      render: (value) => <span>{value}</span>,
    },
    {
      header: 'Age',
      accessor: 'age',
      sortable: true,
      render: (value) => <span>{value ??'N/A'}</span>,
    },
   
    
     
    
    {
      header: 'Blood Group',
      accessor: 'blood_group',
      sortable: true,
     render: (value) => <span>{value ?? 'N/A'}</span>,
    },
    {
      header: 'Status',
      accessor: 'status',
      sortable: true,
      render: () => (
        <Tag color="success">
          Active
        </Tag>
      ),
    },
    {
      header: 'Email',
      accessor: 'email',
      sortable: true,
        render: (value) => <span>{value ?? 'N/A'}</span>,
    },
    {
      header: 'Address',
      accessor: 'address',
      sortable: true,
        render: (value) => <span>{value ?? 'N/A'}</span>,
    },
    {
      header: 'Created At',
      accessor: 'created_at',
      sortable: true,
      render: (value) => {
        const date = new Date(value)
        return <span>{date.toLocaleDateString('en-GB')}</span>
      },
    },
    {
      header: 'Updated At',
      accessor: 'updated_at',
      sortable: true,
      render: (value) => {
        const date = new Date(value)
        return <span>{date.toLocaleDateString('en-GB')}</span>
      },
    },
  ]

  return (
    <PageLayout
      header={
        <>
          <PageTitleHeader
            title="Patients"
            subtitle={`All Patients: ${patients.length}`}
            showSearch={true}
            searchPlaceholder="Search Patient"
            searchValue={search}
            onSearchChange={(e) => setSearch(e.target.value)}
            searchSize="default"
            showFilter={true}
            onFilterClick={() => setFilterDrawerOpen(true)}
            activeFilterCount={countActiveFilters(filters)}
            actions={[
              canExport('patients') && {
                label: 'Export',
                icon: <UserOutlined />,
                type: 'default',
                onClick: handleExport
              },
              canCreate('patient') && {
                label: 'Add',
                type: 'primary',
                onClick: () => navigate('/patients/add')
              },
            ].filter(Boolean)}
          />

          {/* Filter Drawer */}
          <FilterDrawer
            open={filterDrawerOpen}
            onClose={() => setFilterDrawerOpen(false)}
            title="Filter Patients"
            onApply={handleApplyFilters}
            onReset={handleResetFilters}
          >
            <Form layout="vertical">
              <Form.Item label="Gender">
                <Select
                  placeholder="Select gender"
                  value={filters.gender}
                  onChange={(value) => setFilters({ ...filters, gender: value })}
                  allowClear
                  options={[
                    { label: 'Male', value: 'male' },
                    { label: 'Female', value: 'female' },
                    { label: 'Other', value: 'other' }
                  ]}
                />
              </Form.Item>

              <Form.Item label="Blood Group">
                <Select
                  placeholder="Select blood group"
                  value={filters.blood_group}
                  onChange={(value) => setFilters({ ...filters, blood_group: value })}
                  allowClear
                  options={[
                    { label: 'A+', value: 'A+' },
                    { label: 'A-', value: 'A-' },
                    { label: 'B+', value: 'B+' },
                    { label: 'B-', value: 'B-' },
                    { label: 'O+', value: 'O+' },
                    { label: 'O-', value: 'O-' },
                    { label: 'AB+', value: 'AB+' },
                    { label: 'AB-', value: 'AB-' }
                  ]}
                />
              </Form.Item>

              <Form.Item label="Registration Date Range">
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
        data={patients}
        showCheckbox={true}
        showPagination={true}
        pageSize={10}
      />
    </PageLayout>
  )
}
