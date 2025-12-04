import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useHospital } from '../hooks/useHospital'
import { Tag, Button, Popconfirm, Select, Form } from 'antd'
import { UserOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import PageLayout from '../components/PageLayout'
import PageTitleHeader from '../components/PageTitleHeader'
import CompactTable from '../components/CompactTable'
import FilterDrawer from '../components/FilterDrawer'
import { countActiveFilters } from '../utils/filterHelpers'
import { exportToCSV } from '../utils/exportHelpers'
import AvatarColumn from '../components/AvatarColumn'
import api from '../services/api'
import toast from 'react-hot-toast'

export default function Users() {
  const { selectedHospital } = useHospital()
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)
  const [filters, setFilters] = useState({
    role: null,
    status: null
  })

  useEffect(() => {
    if (selectedHospital) fetchUsers()
  }, [selectedHospital, search])

  const fetchUsers = async () => {
    try {
      let queryParams = `hospital_id=${selectedHospital.id}`
      if (search) queryParams += `&search=${search}`
      if (filters.role) queryParams += `&role=${filters.role}`
      if (filters.status) queryParams += `&is_active=${filters.status}`
      
      const response = await api.get(`/users?${queryParams}`)
      setUsers(response.data.data)
    } catch (error) {
      console.error('Failed to fetch users:', error)
      toast.error('Failed to fetch users')
    }
  }

  const handleApplyFilters = () => {
    setFilterDrawerOpen(false)
    fetchUsers()
  }

  const handleResetFilters = () => {
    setFilters({
      role: null,
      status: null
    })
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/users/${id}`)
      toast.success('User deleted successfully')
      fetchUsers()
    } catch (error) {
      console.error('Failed to delete user:', error)
      toast.error('Failed to delete user')
    }
  }

  const handleExport = () => {
    const exportColumns = [
      { header: 'Name', accessor: 'name' },
      { header: 'Email', accessor: 'email' },
      { header: 'Role', accessor: 'role' },
      { header: 'Phone', accessor: 'phone' },
      { header: 'Status', accessor: 'is_active' }
    ]
    exportToCSV(users, 'users.csv', exportColumns)
  }

  const getRoleColor = (role) => {
    const colors = {
      super_admin: 'red',
      admin: 'purple',
      doctor: 'blue',
      nurse: 'cyan',
      receptionist: 'green',
      pharmacist: 'orange',
      lab_technician: 'geekblue',
      staff: 'default'
    }
    return colors[role] || 'default'
  }

  const columns = [
    {
      header: 'User',
      accessor: 'name',
      sortable: true,
      render: (value, record) => (
        <AvatarColumn 
          name={value} 
          subtitle={record.email}
        />
      ),
    },
    {
      header: 'Role',
      accessor: 'role',
      sortable: true,
      width: '150px',
      render: (value) => (
        <Tag color={getRoleColor(value)} style={{ fontSize: '11px' }}>
          {value.replace('_', ' ').toUpperCase()}
        </Tag>
      ),
    },
    {
      header: 'Phone',
      accessor: 'phone',
      sortable: true,
      width: '140px',
      render: (value) => <span style={{ color: '#666', fontSize: '13px' }}>{value || 'N/A'}</span>,
    },
    {
      header: 'Status',
      accessor: 'is_active',
      sortable: true,
      width: '100px',
      render: (value) => (
        <Tag color={value ? 'success' : 'error'} style={{ fontSize: '11px' }}>
          {value ? 'ACTIVE' : 'INACTIVE'}
        </Tag>
      ),
    },
    {
      header: 'Created',
      accessor: 'created_at',
      sortable: true,
      width: '120px',
      render: (value) => <span style={{ color: '#666', fontSize: '13px' }}>
        {new Date(value).toLocaleDateString()}
      </span>,
    },
    {
      header: 'Actions',
      accessor: 'actions',
      sortable: false,
      width: '100px',
      render: (_, record) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => navigate(`/users/edit/${record.id}`)}
          />
          <Popconfirm
            title="Delete user"
            description="Are you sure?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </div>
      ),
    },
  ]

  return (
    <PageLayout
      header={
        <>
          <PageTitleHeader
            title="User Management"
            subtitle={`Total Users: ${users.length}`}
            showSearch={true}
            searchPlaceholder="Search User"
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
                label: 'Add User',
                type: 'primary',
                icon: <UserOutlined />,
                onClick: () => navigate('/users/add')
              }
            ]}
          />

          <FilterDrawer
            open={filterDrawerOpen}
            onClose={() => setFilterDrawerOpen(false)}
            title="Filter Users"
            onApply={handleApplyFilters}
            onReset={handleResetFilters}
          >
            <Form layout="vertical">
              <Form.Item label="Role">
                <Select
                  placeholder="Select role"
                  value={filters.role}
                  onChange={(value) => setFilters({ ...filters, role: value })}
                  allowClear
                  options={[
                    { label: 'Super Admin', value: 'super_admin' },
                    { label: 'Admin', value: 'admin' },
                    { label: 'Doctor', value: 'doctor' },
                    { label: 'Nurse', value: 'nurse' },
                    { label: 'Receptionist', value: 'receptionist' },
                    { label: 'Pharmacist', value: 'pharmacist' },
                    { label: 'Lab Technician', value: 'lab_technician' },
                    { label: 'Staff', value: 'staff' }
                  ]}
                />
              </Form.Item>

              <Form.Item label="Status">
                <Select
                  placeholder="Select status"
                  value={filters.status}
                  onChange={(value) => setFilters({ ...filters, status: value })}
                  allowClear
                  options={[
                    { label: 'Active', value: '1' },
                    { label: 'Inactive', value: '0' }
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
        data={users}
        showCheckbox={true}
        showPagination={true}
        pageSize={10}
      />
    </PageLayout>
  )
}
