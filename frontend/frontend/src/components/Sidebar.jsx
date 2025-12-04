import { NavLink } from 'react-router-dom'
import { usePermissions } from '../hooks/usePermissions.jsx'
import { useAuth } from '../hooks/useAuth'
import {
  LayoutDashboard, Users, Stethoscope, Calendar, Building,
  Bed, CreditCard, Pill, FlaskConical, UserCog, Package,
  AlertCircle, FileText, Settings, Shield, Lock, LogOut,
  ClipboardList, Activity, Heart, FileHeart, Bell, Star,
  TrendingUp, Clock, UserCheck, Briefcase, MessageSquare,
  BarChart3, PieChart, LineChart, Hospital, Ambulance
} from 'lucide-react'

// Organized menu with sections
const menuSections = [
  {
    title: 'Main',
    items: [
      { path: '/', icon: LayoutDashboard, label: 'Dashboard', permission: 'view_dashboard' },
      { path: '/analytics', icon: TrendingUp, label: 'Analytics', permission: 'view_reports', badge: 'New' },
    ]
  },
  {
    title: 'Patient Care',
    items: [
      { path: '/patients', icon: Users, label: 'Patients', permission: 'view_patients' },
      { path: '/appointments', icon: Calendar, label: 'Appointments', permission: 'view_appointments' },
      { path: '/prescriptions', icon: ClipboardList, label: 'Prescriptions', permission: 'view_patients', badge: 'New' },
      { path: '/patient-vitals', icon: Activity, label: 'Vitals', permission: 'view_patients', badge: 'New' },
      { path: '/medical-history', icon: FileHeart, label: 'Medical History', permission: 'view_patients', badge: 'New' },
    ]
  },
  {
    title: 'Clinical',
    items: [
      { path: '/doctors', icon: Stethoscope, label: 'Doctors', permission: 'view_doctors' },
      { path: '/doctor-schedule', icon: Clock, label: 'Doctor Schedule', permission: 'view_doctors', badge: 'New' },
      { path: '/doctor-leaves', icon: UserCheck, label: 'Doctor Leaves', permission: 'view_doctors', badge: 'New' },
      { path: '/departments', icon: Building, label: 'Departments', permission: 'view_departments' },
    ]
  },
  {
    title: 'Services',
    items: [
      { path: '/laboratory', icon: FlaskConical, label: 'Laboratory', permission: 'view_laboratory' },
      { path: '/lab-reports', icon: FileText, label: 'Lab Reports', permission: 'view_laboratory', badge: 'New' },
      { path: '/pharmacy', icon: Pill, label: 'Pharmacy', permission: 'view_pharmacy' },
      { path: '/medicine-alerts', icon: Bell, label: 'Medicine Alerts', permission: 'view_pharmacy', badge: 'New' },
    ]
  },
  {
    title: 'Operations',
    items: [
      { path: '/beds', icon: Bed, label: 'Beds & Wards', permission: 'view_dashboard' },
      { path: '/emergency', icon: AlertCircle, label: 'Emergency', permission: 'view_emergency' },
      { path: '/ambulance', icon: Ambulance, label: 'Ambulance', permission: 'view_emergency', badge: 'New' },
      { path: '/inventory', icon: Package, label: 'Inventory', permission: 'view_inventory' },
    ]
  },
  {
    title: 'Finance',
    items: [
      { path: '/billing', icon: CreditCard, label: 'Billing', permission: 'view_billing' },
      { path: '/revenue', icon: BarChart3, label: 'Revenue', permission: 'view_reports', badge: 'New' },
    ]
  },
  {
    title: 'Management',
    items: [
      { path: '/staff', icon: UserCog, label: 'Staff', permission: 'view_dashboard' },
      { path: '/users', icon: Shield, label: 'Users', permission: 'view_users' },
      { path: '/clinics', icon: Hospital, label: 'Clinics', roleRequired: 'super_admin' },
    ]
  },
  {
    title: 'Feedback & Reports',
    items: [
      { path: '/feedback', icon: MessageSquare, label: 'Patient Feedback', permission: 'view_dashboard', badge: 'New' },
      { path: '/ratings', icon: Star, label: 'Ratings', permission: 'view_reports', badge: 'New' },
      { path: '/reports', icon: FileText, label: 'Reports', permission: 'view_reports' },
    ]
  },
  {
    title: 'System',
    items: [
      { path: '/permissions', icon: Lock, label: 'Permissions', roleRequired: 'super_admin' },
      { path: '/audit-logs', icon: Briefcase, label: 'Audit Logs', roleRequired: 'super_admin', badge: 'New' },
      { path: '/settings', icon: Settings, label: 'Settings', permission: 'view_settings' },
    ]
  },
]

export default function Sidebar() {
  const { hasPermission, userRole } = usePermissions()
  const { logout } = useAuth()

  const checkItemVisibility = (item) => {
    // If roleRequired is specified, check if user has that role
    if (item.roleRequired) {
      return userRole === item.roleRequired
    }
    // If permission is specified, check if user has that permission
    if (item.permission) {
      // For development, show all items. In production, uncomment the line below:
      // return hasPermission(item.permission)
      return true // Show all items for now
    }
    // Show item by default if no restrictions
    return true
  }

  return (
    <aside className="w-64 bg-white border-r border-gray-200 overflow-y-auto flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-primary-600">Hospital MS</h1>
        <p className="text-xs text-gray-500 mt-1">Multi-Clinic Management</p>
      </div>

      {/* Navigation */}
      <nav className="px-3 py-4 flex-1">
        {menuSections.map((section) => {
          const visibleItems = section.items.filter(checkItemVisibility)
          
          if (visibleItems.length === 0) return null

          return (
            <div key={section.title} className="mb-6">
              {/* Section Title */}
              <h3 className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {section.title}
              </h3>

              {/* Section Items */}
              {visibleItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2.5 rounded-lg mb-1 transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`
                  }
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className="w-5 h-5" />
                    <span className="text-sm">{item.label}</span>
                  </div>
                  
                  {/* Badge for new features */}
                  {item.badge && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          )
        })}
      </nav>

      {/* Logout Button */}
      <div className="px-3 pb-6 border-t border-gray-200 pt-4">
        <button
          onClick={logout}
          className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  )
}
