import { useState, useEffect } from 'react'
import { useHospital } from '../hooks/useHospital'
import { UserCog } from 'lucide-react'
import api from '../services/api'

export default function Staff() {
  const { selectedHospital } = useHospital()
  const [staff, setStaff] = useState([])

  useEffect(() => {
    if (selectedHospital) {
      api.get(`/staff?hospital_id=${selectedHospital.id}`)
        .then(res => setStaff(res.data.data))
        .catch(err => console.error(err))
    }
  }, [selectedHospital])

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staff.map((member) => (
          <div key={member.id} className="card">
            <div className="flex items-start space-x-3">
              <div className="bg-primary-100 p-3 rounded-full">
                <UserCog className="w-6 h-6 text-primary-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
                <p className="text-sm text-gray-600 capitalize">{member.role}</p>
                <p className="text-sm text-gray-500 mt-2">{member.email}</p>
                <p className="text-sm text-gray-500">{member.phone}</p>
                <span className={`inline-block mt-3 px-2 py-1 rounded-full text-xs ${
                  member.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {member.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
