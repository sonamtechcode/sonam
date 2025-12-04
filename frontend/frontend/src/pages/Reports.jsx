import { useState, useEffect } from 'react'
import { useHospital } from '../hooks/useHospital'
import { FileText, Download } from 'lucide-react'
import api from '../services/api'

export default function Reports() {
  const { selectedHospital } = useHospital()
  const [summary, setSummary] = useState(null)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    if (selectedHospital) {
      const today = new Date().toISOString().split('T')[0]
      api.get(`/reports/daily-summary?hospital_id=${selectedHospital.id}&date=${today}`)
        .then(res => setSummary(res.data.data))
        .catch(err => console.error(err))
    }
  }, [selectedHospital])

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">New Patients Today</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{summary?.newPatients || 0}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Appointments</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{summary?.totalAppointments || 0}</p>
            </div>
            <FileText className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Revenue Today</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">₹{summary?.revenue || 0}</p>
            </div>
            <FileText className="w-8 h-8 text-emerald-500" />
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Generate Custom Report</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="label">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="input-field"
            />
          </div>
          <div className="flex items-end">
            <button className="btn-primary w-full flex items-center justify-center space-x-2">
              <Download className="w-5 h-5" />
              <span>Download Report</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
