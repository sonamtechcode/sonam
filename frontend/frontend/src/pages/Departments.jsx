import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useHospital } from '../hooks/useHospital'
import { Plus, Building } from 'lucide-react'
import api from '../services/api'

export default function Departments() {
  const { selectedHospital } = useHospital()
  const navigate = useNavigate()
  const [departments, setDepartments] = useState([])

  useEffect(() => {
    if (selectedHospital) {
      api.get(`/departments?hospital_id=${selectedHospital.id}`)
        .then(res => setDepartments(res.data.data))
        .catch(err => console.error(err))
    }
  }, [selectedHospital])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Departments</h1>
        <button 
          className="btn-primary flex items-center space-x-2"
          onClick={() => navigate('/departments/add')}
        >
          <Plus className="w-5 h-5" />
          <span>Add Department</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((dept) => (
          <div key={dept.id} className="card hover:shadow-lg transition-shadow">
            <div className="flex items-start space-x-3">
              <div className="bg-primary-100 p-3 rounded-lg">
                <Building className="w-6 h-6 text-primary-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{dept.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{dept.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
