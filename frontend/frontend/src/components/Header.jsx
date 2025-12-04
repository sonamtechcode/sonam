import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useHospital } from '../hooks/useHospital'
import { LogOut, Building2 } from 'lucide-react'
import NotificationBell from './NotificationBell'
import api from '../services/api'
import toast from 'react-hot-toast'

export default function Header() {
  const { user, logout } = useAuth()
  const { selectedHospital, setSelectedHospital } = useHospital()
  const [hospitals, setHospitals] = useState([])

  useEffect(() => {
    fetchHospitals()
  }, [])

  const fetchHospitals = async () => {
    try {
      const response = await api.get('/hospitals')
      setHospitals(response.data.data)
      
      if (!selectedHospital && response.data.data.length > 0) {
        setSelectedHospital(response.data.data[0])
      }
    } catch (error) {
      toast.error('Failed to load hospitals')
    }
  }

  const handleHospitalChange = (e) => {
    const hospital = hospitals.find(h => h.id === parseInt(e.target.value))
    setSelectedHospital(hospital)
    toast.success(`Switched to ${hospital.name}`)
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <Building2 className="w-6 h-6 text-primary-600" />
          <select
            value={selectedHospital?.id || ''}
            onChange={handleHospitalChange}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          >
            {hospitals.map(hospital => (
              <option key={hospital.id} value={hospital.id}>
                {hospital.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
          <div className="p-2">
            <NotificationBell />
          </div>
          <button
            onClick={logout}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  )
}
