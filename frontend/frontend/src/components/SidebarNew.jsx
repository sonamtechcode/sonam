import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { usePermissions } from '../hooks/usePermissions.jsx'
import { useAuth } from '../hooks/useAuth'
import {
  ChevronDown, ChevronRight,
  LayoutDashboard, Users, Stethoscope, Calendar, Building,
  Bed, CreditCard, Pill, FlaskConical, UserCog, Package,
  AlertCircle, FileText, Settings, Shield, Lock, Activity, LogOut, Menu, X, Building2
} from 'lucide-react'

const menuStructure = [
  {
    path: '/',
    icon: LayoutDashboard,
    label: 'Dashboard',
    permission: 'view_dashboard',
    color: '#667eea'
  },
  {
    label: 'Patient Management',
    icon: Activity,
    permission: 'view_patients',
    color: '#f56565',
    children: [
      { path: '/patients', icon: Users, label: 'Patients', permission: 'view_patients', color: '#f56565' },
      { path: '/appointments', icon: Calendar, label: 'Appointments', permission: 'view_appointments', color: '#ed8936' },
      { path: '/emergency', icon: AlertCircle, label: 'Emergency', permission: 'view_emergency', color: '#e53e3e' }
    ]
  },
  {
    label: 'Medical Staff',
    icon: Stethoscope,
    permission: 'view_doctors',
    color: '#48bb78',
    children: [
      { path: '/doctors', icon: Stethoscope, label: 'Doctors', permission: 'view_doctors', color: '#48bb78' },
      { path: '/staff', icon: UserCog, label: 'Staff', permission: 'view_dashboard', color: '#38b2ac' }
    ]
  },
  {
    label: 'Hospital Resources',
    icon: Building,
    permission: 'view_departments',
    color: '#4299e1',
    children: [
      { path: '/departments', icon: Building, label: 'Departments', permission: 'view_departments', color: '#4299e1' },
      { path: '/beds', icon: Bed, label: 'Beds & Wards', permission: 'view_dashboard', color: '#3182ce' },
      { path: '/inventory', icon: Package, label: 'Inventory', permission: 'view_inventory', color: '#2b6cb0' }
    ]
  },
  {
    label: 'Clinical Services',
    icon: FlaskConical,
    permission: 'view_pharmacy',
    color: '#9f7aea',
    children: [
      { path: '/pharmacy', icon: Pill, label: 'Pharmacy', permission: 'view_pharmacy', color: '#9f7aea' },
      { path: '/laboratory', icon: FlaskConical, label: 'Laboratory', permission: 'view_laboratory', color: '#805ad5' }
    ]
  },
  {
    label: 'Finance',
    icon: CreditCard,
    permission: 'view_billing',
    color: '#ed8936',
    children: [
      { path: '/billing', icon: CreditCard, label: 'Billing', permission: 'view_billing', color: '#ed8936' },
      { path: '/reports', icon: FileText, label: 'Reports', permission: 'view_reports', color: '#dd6b20' }
    ]
  },
  {
    label: 'Administration',
    icon: Shield,
    permission: 'view_users',
    color: '#718096',
    children: [
      { path: '/clinics', icon: Building2, label: 'Clinics', roleRequired: 'super_admin', color: '#0ea5e9' },
      { path: '/users', icon: Shield, label: 'Users', permission: 'view_users', color: '#718096' },
      { path: '/permissions', icon: Lock, label: 'Permissions', roleRequired: 'super_admin', color: '#4a5568' },
      { path: '/settings', icon: Settings, label: 'Settings', permission: 'view_settings', color: '#2d3748' }
    ]
  }
]

function MenuItem({ item, isChild = false, isCollapsed = false }) {
  const { hasPermission, userRole } = usePermissions()
  const [isOpen, setIsOpen] = useState(false)

  // Check if item should be visible
  const isVisible = () => {
    if (item.roleRequired) {
      return userRole === item.roleRequired
    }
    if (item.permission) {
      return hasPermission(item.permission)
    }
    return true
  }

  if (!isVisible()) return null

  // If item has children (submenu)
  if (item.children) {
    const visibleChildren = item.children.filter(child => {
      if (child.roleRequired) return userRole === child.roleRequired
      if (child.permission) return hasPermission(child.permission)
      return true
    })

    if (visibleChildren.length === 0) return null

    if (isCollapsed) {
      // Show only icon in collapsed mode
      return (
        <div className="mb-1" title={item.label}>
          <div className="flex items-center justify-center px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
            <item.icon className="w-5 h-5" style={{ color: item.color }} />
          </div>
        </div>
      )
    }

    return (
      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg mb-1 text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <item.icon className="w-5 h-5" style={{ color: item.color }} />
            <span className="text-sm font-medium">{item.label}</span>
          </div>
          {isOpen ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
        {isOpen && (
          <div className="ml-4 border-l-2 border-gray-200 pl-2">
            {visibleChildren.map((child, index) => (
              <MenuItem key={index} item={child} isChild={true} isCollapsed={isCollapsed} />
            ))}
          </div>
        )}
      </div>
    )
  }

  // Regular menu item with link
  return (
    <NavLink
      to={item.path}
      end={item.path === '/'}
      title={isCollapsed ? item.label : ''}
      className={({ isActive }) =>
        `flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-3 py-2 rounded-lg mb-1 transition-colors ${
          isChild ? 'text-sm' : ''
        } ${
          isActive
            ? 'bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-700 font-medium border-l-4 border-purple-600'
            : 'text-gray-700 hover:bg-gray-50'
        }`
      }
    >
      <item.icon 
        className={isChild ? 'w-4 h-4' : 'w-5 h-5'} 
        style={{ color: item.color }}
      />
      {!isCollapsed && <span>{item.label}</span>}
    </NavLink>
  )
}

export default function SidebarNew() {
  const { logout } = useAuth()
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-white border-r border-gray-200 overflow-y-auto flex flex-col transition-all duration-300`}>
      <div className="p-6 flex items-center justify-between">
        {!isCollapsed && (
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#00D9FF' }}>Solvixo</h1>
            <p className="text-xs text-gray-500 mt-1">Hospital Management</p>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
        </button>
      </div>

      <nav className="px-3 pb-6 flex-1">
        {menuStructure.map((item, index) => (
          <MenuItem key={index} item={item} isCollapsed={isCollapsed} />
        ))}
      </nav>

      <div className="px-3 pb-6 border-t border-gray-200 pt-4">
        <button
          onClick={logout}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors`}
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
          {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  )
}
