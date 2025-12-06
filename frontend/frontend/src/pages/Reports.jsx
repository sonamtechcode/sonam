import { useState, useEffect } from 'react'
import { useHospital } from '../hooks/useHospital'
import { FileText, Download, TrendingUp, Users, Calendar, DollarSign } from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'

export default function Reports() {
  const { selectedHospital } = useHospital()
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    if (selectedHospital) {
      fetchDailySummary()
    }
  }, [selectedHospital])

  const fetchDailySummary = async () => {
    try {
      setLoading(true)
      const today = new Date().toISOString().split('T')[0]
      const response = await api.get(`/reports/daily-summary?hospital_id=${selectedHospital.id}&date=${today}`)
      setSummary(response.data.data || response.data)
    } catch (error) {
      console.error('Error fetching summary:', error)
      // Set default values if API fails
      setSummary({
        newPatients: 0,
        totalAppointments: 0,
        revenue: 0
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadReport = async () => {
    if (!startDate || !endDate) {
      toast.error('Please select both start and end dates')
      return
    }

    try {
      toast.success('Report generation started...')
      // Add your report download logic here
      console.log('Downloading report from', startDate, 'to', endDate)
    } catch (error) {
      toast.error('Failed to generate report')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reports...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">View and generate hospital reports</p>
        </div>
        <button 
          onClick={fetchDailySummary}
          className="btn-secondary flex items-center space-x-2"
        >
          <TrendingUp className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">New Patients Today</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{summary?.newPatients || 0}</p>
              <p className="text-xs text-gray-500 mt-1">Registered today</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Appointments</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{summary?.totalAppointments || 0}</p>
              <p className="text-xs text-gray-500 mt-1">Scheduled today</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenue Today</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">₹{summary?.revenue || 0}</p>
              <p className="text-xs text-gray-500 mt-1">Total earnings</p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Custom Report Generator */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <FileText className="w-5 h-5 text-gray-700" />
          <h3 className="text-lg font-semibold text-gray-900">Generate Custom Report</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-end">
            <button 
              onClick={handleDownloadReport}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
            >
              <Download className="w-5 h-5" />
              <span>Download Report</span>
            </button>
          </div>
        </div>

        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Select a date range to generate a detailed report including patient statistics, 
            appointments, revenue, and more.
          </p>
        </div>
      </div>

      {/* Quick Report Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left">
          <FileText className="w-8 h-8 text-blue-600 mb-2" />
          <h4 className="font-semibold text-gray-900">Patient Report</h4>
          <p className="text-sm text-gray-600 mt-1">View all patient records</p>
        </button>

        <button className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left">
          <Calendar className="w-8 h-8 text-green-600 mb-2" />
          <h4 className="font-semibold text-gray-900">Appointment Report</h4>
          <p className="text-sm text-gray-600 mt-1">View appointment history</p>
        </button>

        <button className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left">
          <DollarSign className="w-8 h-8 text-emerald-600 mb-2" />
          <h4 className="font-semibold text-gray-900">Financial Report</h4>
          <p className="text-sm text-gray-600 mt-1">View revenue & expenses</p>
        </button>

        <button className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left">
          <TrendingUp className="w-8 h-8 text-purple-600 mb-2" />
          <h4 className="font-semibold text-gray-900">Analytics Report</h4>
          <p className="text-sm text-gray-600 mt-1">View detailed analytics</p>
        </button>
      </div>
    </div>
  )
}
