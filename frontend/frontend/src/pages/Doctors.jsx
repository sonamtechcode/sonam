import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useHospital } from '../hooks/useHospital'
import { Tag, Button, Popconfirm, Select, Form, Tooltip } from 'antd'
import { EditOutlined, DeleteOutlined } from '@ant-design/icons'
import PageLayout from '../components/PageLayout'
import PageTitleHeader from '../components/PageTitleHeader'
import CompactTable from '../components/CompactTable'
import FilterDrawer from '../components/FilterDrawer'
import { countActiveFilters } from '../utils/filterHelpers'
import { exportToCSV } from '../utils/exportHelpers'
import AvatarColumn from '../components/AvatarColumn'
import api from '../services/api'
import toast from 'react-hot-toast'

export default function Doctors() {
  const { selectedHospital } = useHospital()
  const navigate = useNavigate()
  const [doctors, setDoctors] = useState([])
  const [search, setSearch] = useState('')
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)
  const [filters, setFilters] = useState({
    specialization: null,
    department: null,
    experience: null
  })

  useEffect(() => {
    if (selectedHospital) fetchDoctors()
  }, [selectedHospital, search])

  const fetchDoctors = async () => {
    try {
      let queryParams = `hospital_id=${selectedHospital.id}`
      if (search) queryParams += `&search=${search}`
      if (filters.specialization) queryParams += `&specialization=${filters.specialization}`
      if (filters.department) queryParams += `&department=${filters.department}`
      if (filters.experience) queryParams += `&experience=${filters.experience}`
      
      const response = await api.get(`/doctors?${queryParams}`)
      setDoctors(response.data.data)
    } catch (error) {
      console.error('Failed to fetch doctors:', error)
      toast.error('Failed to fetch doctors')
    }
  }

  const handleApplyFilters = () => {
    setFilterDrawerOpen(false)
    fetchDoctors()
  }

  const handleResetFilters = () => {
    setFilters({
      specialization: null,
      department: null,
      experience: null
    })
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/doctors/${id}`)
      toast.success('Doctor deleted successfully')
      fetchDoctors()
    } catch (error) {
      console.error('Failed to delete doctor:', error)
      toast.error('Failed to delete doctor')
    }
  }

  const handleExport = () => {
    const exportColumns = [
      { header: 'Name', accessor: 'name' },
      { header: 'Specialization', accessor: 'specialization' },
      { header: 'Department', accessor: 'department_name' },
      { header: 'Phone', accessor: 'phone' },
      { header: 'Email', accessor: 'email' },
      { header: 'Experience', accessor: 'experience' },
      { header: 'Consultation Fee', accessor: 'consultation_fee' }
    ]
    exportToCSV(doctors, 'doctors.csv', exportColumns)
  }

  const columns = [
    {
      header: 'Action',
      accessor: 'actions',
      sortable: false,
      width: '80px',
      render: (_, record) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Tooltip title="Edit">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined style={{ fontSize: '16px', color: '#1890ff' }} />}
              onClick={() => navigate(`/doctors/edit/${record.id}`)}
            />
          </Tooltip>
          <Popconfirm
            title="Deactivate doctor"
            description="This will mark the doctor as inactive. Continue?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Deactivate">
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
      header: 'Doctor Name',
      accessor: 'name',
      sortable: true,
      render: (value, record) => (
        <AvatarColumn 
          name={value} 
          subtitle={record.specialization}
        />
      ),
    },
    {
      header: 'Specialization',
      accessor: 'specialization',
      sortable: true,
      width: '150px',
      render: (value) => <span style={{ color: '#666', fontSize: '13px' }}>{value}</span>,
    },
    {
      header: 'Department',
      accessor: 'department_name',
      sortable: true,
      width: '150px',
      render: (value) => <Tag color="blue" style={{ fontSize: '11px' }}>{value || 'Not Assigned'}</Tag>,
    },
    {
      header: 'Phone',
      accessor: 'phone',
      sortable: true,
      width: '140px',
      render: (value) => <span style={{ color: '#666', fontSize: '13px' }}>{value}</span>,
    },
    {
      header: 'Experience',
      accessor: 'experience',
      sortable: true,
      width: '100px',
      render: (value) => <span style={{ color: '#666', fontSize: '13px' }}>{value} years</span>,
    },
    {
      header: 'Consultation Fee',
      accessor: 'consultation_fee',
      sortable: true,
      width: '130px',
      render: (value) => <span style={{ color: '#52c41a', fontSize: '13px', fontWeight: 600 }}>₹{value}</span>,
    },
  ]

  return (
    <PageLayout
      header={
        <>
          <PageTitleHeader
            title="Doctors"
            subtitle={`Total Doctors: ${doctors.length}`}
            showSearch={true}
            searchPlaceholder="Search Doctor"
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
                label: 'Add',
                type: 'primary',
                onClick: () => navigate('/doctors/add')
              }
            ]}
          />

          <FilterDrawer
            open={filterDrawerOpen}
            onClose={() => setFilterDrawerOpen(false)}
            title="Filter Doctors"
            onApply={handleApplyFilters}
            onReset={handleResetFilters}
          >
            <Form layout="vertical">
              <Form.Item label="Specialization">
                <Select
                  placeholder="Select specialization"
                  value={filters.specialization}
                  onChange={(value) => setFilters({ ...filters, specialization: value })}
                  allowClear
                  options={[
                    { label: 'Cardiology', value: 'cardiology' },
                    { label: 'Neurology', value: 'neurology' },
                    { label: 'Pediatrics', value: 'pediatrics' },
                    { label: 'Orthopedics', value: 'orthopedics' }
                  ]}
                />
              </Form.Item>

              <Form.Item label="Department">
                <Select
                  placeholder="Select department"
                  value={filters.department}
                  onChange={(value) => setFilters({ ...filters, department: value })}
                  allowClear
                  options={[
                    { label: 'Emergency', value: 'emergency' },
                    { label: 'ICU', value: 'icu' },
                    { label: 'OPD', value: 'opd' }
                  ]}
                />
              </Form.Item>

              <Form.Item label="Experience">
                <Select
                  placeholder="Select experience range"
                  value={filters.experience}
                  onChange={(value) => setFilters({ ...filters, experience: value })}
                  allowClear
                  options={[
                    { label: '0-5 years', value: '0-5' },
                    { label: '5-10 years', value: '5-10' },
                    { label: '10+ years', value: '10+' }
                  ]}
                />
              </Form.Item>
            </Form>
          </FilterDrawer>
        </>
      }
    >
      <CompactTable
        columns={columns}
        data={doctors}
        showCheckbox={true}
        showPagination={true}
        pageSize={10}
      />
    </PageLayout>
  )
}
