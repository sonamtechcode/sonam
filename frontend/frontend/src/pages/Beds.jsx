import { useState, useEffect } from 'react'
import { useHospital } from '../hooks/useHospital'
import { Bed } from 'lucide-react'
import api from '../services/api'

export default function Beds() {
  const { selectedHospital } = useHospital()
  const [beds, setBeds] = useState([])

  useEffect(() => {
    if (selectedHospital) {
      api.get(`/beds?hospital_id=${selectedHospital.id}`)
        .then(res => setBeds(res.data.data))
        .catch(err => console.error(err))
    }
  }, [selectedHospital])

  const getStatusColor = (status) => {
    return status === 'available' ? 'bg-green-100 text-green-700' : 
           status === 'occupied' ? 'bg-red-100 text-red-700' : 
           'bg-yellow-100 text-yellow-700'
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Beds & Wards</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {beds.map((bed) => (
          <div key={bed.id} className="card text-center">
            <Bed className="w-8 h-8 mx-auto mb-2 text-gray-600" />
            <p className="font-semibold text-gray-900">{bed.bed_number}</p>
            <p className="text-xs text-gray-600 mt-1">{bed.ward_name}</p>
            <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs ${getStatusColor(bed.status)}`}>
              {bed.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
