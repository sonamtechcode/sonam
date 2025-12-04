import { useState, useEffect } from 'react'
import { Card, Select, Button, Checkbox, Table } from 'antd'
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import toast from 'react-hot-toast'
import './Permissions.css'

const { Option } = Select

export default function Permissions() {
  const navigate = useNavigate()
  const [permissions, setPermissions] = useState([])
  const [selectedRole, setSelectedRole] = useState('admin')
  const [rolePermissions, setRolePermissions] = useState([])
  const [loading, setLoading] = useState(false)

  const roles = [
    { value: 'admin', label: 'Admin' },
    { value: 'doctor', label: 'Doctor' },
    { value: 'nurse', label: 'Nurse' },
    { value: 'receptionist', label: 'Receptionist' },
    { value: 'pharmacist', label: 'Pharmacist' },
    { value: 'lab_technician', label: 'Lab Technician' },
    { value: 'staff', label: 'Staff' }
  ]

  useEffect(() => {
    fetchAllPermissions()
  }, [])

  useEffect(() => {
    if (selectedRole) {
      fetchRolePermissions()
    }
  }, [selectedRole])

  const fetchAllPermissions = async () => {
    try {
      const response = await api.get('/permissions')
      setPermissions(response.data.data)
    } catch (error) {
      console.error('Failed to fetch permissions:', error)
      toast.error('Failed to fetch permissions')
    }
  }

  const fetchRolePermissions = async () => {
    setLoading(true)
    try {
      const response = await api.get(`/permissions/role/${selectedRole}`)
      const permIds = response.data.data.map(p => p.id)
      setRolePermissions(permIds)
    } catch (error) {
      console.error('Failed to fetch role permissions:', error)
      toast.error('Failed to fetch role permissions')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      await api.put(`/permissions/role/${selectedRole}`, {
        permissionIds: rolePermissions
      })
      toast.success('Permissions updated successfully')
    } catch (error) {
      console.error('Failed to update permissions:', error)
      toast.error('Failed to update permissions')
    } finally {
      setLoading(false)
    }
  }

  // Group permissions by module
  const groupedPermissions = permissions.reduce((acc, perm) => {
    if (!acc[perm.module]) {
      acc[perm.module] = []
    }
    acc[perm.module].push(perm)
    return acc
  }, {})

  // Extract action types from permission names
  const getActionType = (permName) => {
    if (permName.startsWith('create_')) return 'create'
    if (permName.startsWith('view_')) return 'view'
    if (permName.startsWith('edit_')) return 'edit'
    if (permName.startsWith('delete_')) return 'delete'
    if (permName.startsWith('export_')) return 'export'
    return 'other'
  }

  // Build table data
  const tableData = Object.keys(groupedPermissions).map(module => {
    const modulePerms = groupedPermissions[module]
    const row = {
      key: module,
      module: module,
      permissions: {}
    }

    modulePerms.forEach(perm => {
      const action = getActionType(perm.name)
      row.permissions[action] = perm.id
    })

    return row
  })

  const handleCheckboxChange = (permissionId, checked) => {
    if (checked) {
      setRolePermissions([...rolePermissions, permissionId])
    } else {
      setRolePermissions(rolePermissions.filter(id => id !== permissionId))
    }
  }

  const handleSelectAllModule = (checked) => {
    if (checked) {
      const allPermIds = permissions.map(p => p.id)
      setRolePermissions(allPermIds)
    } else {
      setRolePermissions([])
    }
  }

  const columns = [
    {
      title: (
        <Checkbox
          checked={rolePermissions.length === permissions.length && permissions.length > 0}
          indeterminate={rolePermissions.length > 0 && rolePermissions.length < permissions.length}
          onChange={(e) => handleSelectAllModule(e.target.checked)}
        />
      ),
      dataIndex: 'select',
      key: 'select',
      width: 50,
      render: (_, record) => {
        const modulePerms = groupedPermissions[record.module]
        const modulePermIds = modulePerms.map(p => p.id)
        const allChecked = modulePermIds.every(id => rolePermissions.includes(id))
        const someChecked = modulePermIds.some(id => rolePermissions.includes(id))

        return (
          <Checkbox
            checked={allChecked}
            indeterminate={someChecked && !allChecked}
            onChange={(e) => {
              if (e.target.checked) {
                setRolePermissions([...new Set([...rolePermissions, ...modulePermIds])])
              } else {
                setRolePermissions(rolePermissions.filter(id => !modulePermIds.includes(id)))
              }
            }}
          />
        )
      }
    },
    {
      title: 'Modules',
      dataIndex: 'module',
      key: 'module',
      width: 200,
      render: (text) => (
        <span style={{ fontWeight: 500, textTransform: 'capitalize' }}>
          {text.replace(/_/g, ' ')}
        </span>
      )
    },
    {
      title: 'Create',
      dataIndex: 'create',
      key: 'create',
      align: 'center',
      width: 100,
      render: (_, record) => {
        const permId = record.permissions.create
        return permId ? (
          <Checkbox
            checked={rolePermissions.includes(permId)}
            onChange={(e) => handleCheckboxChange(permId, e.target.checked)}
          />
        ) : null
      }
    },
    {
      title: 'View',
      dataIndex: 'view',
      key: 'view',
      align: 'center',
      width: 100,
      render: (_, record) => {
        const permId = record.permissions.view
        return permId ? (
          <Checkbox
            checked={rolePermissions.includes(permId)}
            onChange={(e) => handleCheckboxChange(permId, e.target.checked)}
          />
        ) : null
      }
    },
    {
      title: 'Edit',
      dataIndex: 'edit',
      key: 'edit',
      align: 'center',
      width: 100,
      render: (_, record) => {
        const permId = record.permissions.edit
        return permId ? (
          <Checkbox
            checked={rolePermissions.includes(permId)}
            onChange={(e) => handleCheckboxChange(permId, e.target.checked)}
          />
        ) : null
      }
    },
    {
      title: 'Delete',
      dataIndex: 'delete',
      key: 'delete',
      align: 'center',
      width: 100,
      render: (_, record) => {
        const permId = record.permissions.delete
        return permId ? (
          <Checkbox
            checked={rolePermissions.includes(permId)}
            onChange={(e) => handleCheckboxChange(permId, e.target.checked)}
          />
        ) : null
      }
    },
    {
      title: 'Import',
      dataIndex: 'import',
      key: 'import',
      align: 'center',
      width: 100,
      render: () => null // Not used in current permissions
    },
    {
      title: 'Export',
      dataIndex: 'export',
      key: 'export',
      align: 'center',
      width: 100,
      render: (_, record) => {
        const permId = record.permissions.export
        return permId ? (
          <Checkbox
            checked={rolePermissions.includes(permId)}
            onChange={(e) => handleCheckboxChange(permId, e.target.checked)}
          />
        ) : null
      }
    }
  ]

  return (
    <div className="permissions-page">
      <Card className="permissions-card">
        <div className="permissions-header">
          <div className="header-left">
            <h2 className="page-title">Role Permissions</h2>
            <div className="role-selector">
              <span className="view-label">View</span>
              <Select
                value={selectedRole}
                onChange={setSelectedRole}
                style={{ width: 200 }}
                size="large"
              >
                {roles.map(role => (
                  <Option key={role.value} value={role.value}>
                    {role.label}
                  </Option>
                ))}
              </Select>
              <span className="permissions-label">Permissions</span>
            </div>
          </div>
          <div className="header-actions">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(-1)}
              size="large"
            >
              Back
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSave}
              loading={loading}
              size="large"
            >
              Save
            </Button>
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={tableData}
          pagination={false}
          loading={loading}
          bordered
          className="permissions-table"
        />
      </Card>
    </div>
  )
}
