import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useHospital } from '../hooks/useHospital'
import { AlertCircle, Plus } from 'lucide-react'
import api from '../services/api'

export default function Emergency() {
  const { selectedHospital } = useHospital()
  const navigate = useNavigate()
  const [cases, setCases] = useState([])

  useEffect(() => {
    if (selectedHospital) {
      api.get(`/emergency?hospital_id=${selectedHospital.id}`)
        .then(res => setCases(res.data.data))
        .catch(err => console.error(err))
    }
  }, [selectedHospital])

  const getSeverityColor = (severity) => {
    const colors = {
      low: 'bg-green-100 text-green-700',
      medium: 'bg-yellow-100 text-yellow-700',
      high: 'bg-orange-100 text-orange-700',
      critical: 'bg-red-100 text-red-700'
    }
    return colors[severity] || 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Emergency / Casualty</h1>
        <button 
          className="btn-primary flex items-center space-x-2"
          onClick={() => navigate('/emergency/add')}
        >
          <Plus className="w-5 h-5" />
          <span>Register Emergency</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {cases.map((emergencyCase) => (
          <div key={emergencyCase.id} className="card hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="bg-red-100 p-3 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{emergencyCase.patient_name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{emergencyCase.complaint}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(emergencyCase.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(emergencyCase.severity)}`}>
                  {emergencyCase.severity}
                </span>
                <p className="text-xs text-gray-600 mt-2 capitalize">{emergencyCase.status}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
