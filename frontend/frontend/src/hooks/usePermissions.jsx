import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
import api from '../services/api'

const PermissionsContext = createContext()

export function PermissionsProvider({ children }) {
  const [permissions, setPermissions] = useState([])
  const [userRole, setUserRole] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchPermissions = useCallback(async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'))
      if (user) {
        setUserRole(user.role)
        const response = await api.get('/permissions/my-permissions')
        setPermissions(response.data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch permissions:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPermissions()
  }, [fetchPermissions])

  const hasPermission = useCallback((permissionName) => {
    if (userRole === 'super_admin') return true
    return permissions.includes(permissionName)
  }, [userRole, permissions])

  const hasAnyPermission = useCallback((permissionNames) => {
    if (userRole === 'super_admin') return true
    return permissionNames.some(name => permissions.includes(name))
  }, [userRole, permissions])

  const hasAllPermissions = useCallback((permissionNames) => {
    if (userRole === 'super_admin') return true
    return permissionNames.every(name => permissions.includes(name))
  }, [userRole, permissions])

  const canView = useCallback((module) => hasPermission(`view_${module}`), [hasPermission])
  const canCreate = useCallback((module) => hasPermission(`create_${module}`), [hasPermission])
  const canEdit = useCallback((module) => hasPermission(`edit_${module}`), [hasPermission])
  const canDelete = useCallback((module) => hasPermission(`delete_${module}`), [hasPermission])
  const canExport = useCallback((module) => hasPermission(`export_${module}`), [hasPermission])

  const value = useMemo(() => ({
    permissions,
    userRole,
    loading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canView,
    canCreate,
    canEdit,
    canDelete,
    canExport,
    refreshPermissions: fetchPermissions
  }), [permissions, userRole, loading, hasPermission, hasAnyPermission, hasAllPermissions, canView, canCreate, canEdit, canDelete, canExport, fetchPermissions])

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  )
}

export function usePermissions() {
  const context = useContext(PermissionsContext)
  if (!context) {
    throw new Error('usePermissions must be used within PermissionsProvider')
  }
  return context
}
