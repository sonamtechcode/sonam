import { useEffect, useState } from 'react'
import { useHospital } from '../hooks/useHospital'
import { Row, Col, Card, Statistic, Avatar, Tag, Progress, Calendar, Badge, Button } from 'antd'
import {
  DollarOutlined,
  UserOutlined,
  CalendarOutlined,
  HomeOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  MoreOutlined,
  PlusOutlined,
} from '@ant-design/icons'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import api from '../services/api'

export default function Dashboard() {
  const { selectedHospital } = useHospital()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (selectedHospital) {
      fetchDashboardStats()
    }
  }, [selectedHospital])

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get(`/dashboard/stats?hospital_id=${selectedHospital.id}`)
      setStats(response.data.data)
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
      setLoading(false)
    }
  }

  // Sample data for charts
  const patientOverviewData = [
    { date: '4 Jul', child: 80, adult: 120, elderly: 40 },
    { date: '5 Jul', child: 60, adult: 105, elderly: 35 },
    { date: '6 Jul', child: 90, adult: 132, elderly: 45 },
    { date: '7 Jul', child: 70, adult: 95, elderly: 38 },
    { date: '8 Jul', child: 85, adult: 110, elderly: 42 },
    { date: '9 Jul', child: 95, adult: 125, elderly: 48 },
    { date: '10 Jul', child: 100, adult: 140, elderly: 50 },
    { date: '11 Jul', child: 88, adult: 132, elderly: 46 },
  ]

  const revenueData = [
    { day: 'Sun', income: 1200, expense: 800 },
    { day: 'Mon', income: 1300, expense: 900 },
    { day: 'Tue', income: 1400, expense: 850 },
    { day: 'Wed', income: 1495, expense: 920 },
    { day: 'Thu', income: 1350, expense: 880 },
    { day: 'Fri', income: 1400, expense: 900 },
    { day: 'Sat', income: 1300, expense: 850 },
  ]

  const departmentData = [
    { name: 'Emergency Medicine', value: 35, color: '#1890ff' },
    { name: 'General Medicine', value: 28, color: '#52c41a' },
    { name: 'Internal Medicine', value: 20, color: '#faad14' },
    { name: 'Other Departments', value: 17, color: '#d9d9d9' },
  ]

  const doctors = [
    { name: 'Dr. Petra Winsburry', specialty: 'General Medicine', status: 'Available', time: '09:00 AM - 12:00 PM', avatar: '#f56a00' },
    { name: 'Dr. Ameena Karim', specialty: 'Orthopedics', status: 'Unavailable', time: '', avatar: '#7265e6' },
    { name: 'Dr. Olivia Martinez', specialty: 'Cardiology', status: 'Available', time: '10:00 AM - 01:00 PM', avatar: '#ffbf00' },
    { name: 'Dr. Damian Sanchez', specialty: 'Pediatrics', status: 'Available', time: '11:00 AM - 02:00 PM', avatar: '#00a2ae' },
    { name: 'Dr. Chloe Harrington', specialty: 'Dermatology', status: 'Unavailable', time: '', avatar: '#ff85c0' },
  ]

  const reports = [
    { title: 'Room Cleaning Needed', time: '1 minutes ago', icon: '🧹', color: '#e6f7ff' },
    { title: 'Equipment Maintenance', time: '3 minutes ago', icon: '🔧', color: '#f6ffed' },
    { title: 'Medication Restock', time: '5 minutes ago', icon: '💊', color: '#fff7e6' },
    { title: 'HVAC System Issue', time: '1 hour ago', icon: '❄️', color: '#e6f7ff' },
    { title: 'Patient Transport Required', time: 'Yesterday', icon: '🚑', color: '#fff1f0' },
  ]

  const appointments = [
    { time: '08:00 AM - 10:00 AM', title: 'Morning Staff Meeting', color: '#b7eb8f' },
    { time: '10:00 AM - 12:00 PM', title: 'Patient Consultation - General Medicine', color: '#91d5ff' },
    { time: '01:00 PM - 03:00 PM', title: 'Surgery - Orthopedics', color: '#b7eb8f' },
    { time: '04:00 PM - 06:00 PM', title: 'Training Session', color: '#ffd591' },
  ]

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading...</div>
  }

  return (
    <div style={{ padding: '6px', background: '#f5f5f5', minHeight: '100vh' }}>
      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#999', marginBottom: 8 }}>
                  <DollarOutlined style={{ marginRight: 6 }} />
                  Today's Revenue
                </div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#1a1a1a' }}>
                  ₹{stats?.todayRevenue || 0}
                </div>
              </div>
              <MoreOutlined style={{ fontSize: '16px', color: '#999' }} />
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#999', marginBottom: 8 }}>
                  <UserOutlined style={{ marginRight: 6 }} />
                  Total Patients
                </div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#1a1a1a' }}>
                  {stats?.totalPatients || 0}
                </div>
              </div>
              <MoreOutlined style={{ fontSize: '16px', color: '#999' }} />
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#999', marginBottom: 8 }}>
                  <CalendarOutlined style={{ marginRight: 6 }} />
                  Today's Appointments
                </div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#1a1a1a' }}>
                  {stats?.todayAppointments || 0}
                </div>
              </div>
              <MoreOutlined style={{ fontSize: '16px', color: '#999' }} />
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#999', marginBottom: 8 }}>
                  <HomeOutlined style={{ marginRight: 6 }} />
                  Available Beds
                </div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#1a1a1a' }}>
                  {stats?.availableBeds || 0}/{stats?.totalBeds || 0}
                </div>
              </div>
              <MoreOutlined style={{ fontSize: '16px', color: '#999' }} />
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Doctors Schedule */}
        <Col xs={24} lg={8}>
          <Card 
            bordered={false} 
            style={{ borderRadius: '12px', height: '100%' }}
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a' }}>Doctors' Schedule</div>
                <MoreOutlined style={{ fontSize: '16px', color: '#999' }} />
              </div>
            }
          >
            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
              {doctors.map((doctor, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 16, borderBottom: index < doctors.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 500, color: '#1a1a1a' }}>{doctor.name}</div>
                      <div style={{ fontSize: '11px', color: '#999' }}>{doctor.specialty}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <Tag color={doctor.status === 'Available' ? 'success' : 'error'} style={{ fontSize: '10px', marginBottom: 4 }}>
                      {doctor.status}
                    </Tag>
                    {doctor.time && <div style={{ fontSize: '10px', color: '#999' }}>{doctor.time}</div>}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>

        {/* Reports */}
        <Col xs={24} lg={8}>
          <Card 
            bordered={false} 
            style={{ borderRadius: '12px', height: '100%' }}
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a' }}>Report</div>
                <MoreOutlined style={{ fontSize: '16px', color: '#999' }} />
              </div>
            }
          >
            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
              {reports.map((report, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, padding: 12, background: report.color, borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ fontSize: '24px' }}>{report.icon}</div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 500, color: '#1a1a1a' }}>{report.title}</div>
                      <div style={{ fontSize: '11px', color: '#999' }}>{report.time}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '16px', color: '#999' }}>→</div>
                </div>
              ))}
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card
            bordered={false}
            style={{ borderRadius: '12px', height: '100%' }} 
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a' }}>Appointments</div>
                <MoreOutlined style={{ fontSize: '16px', color: '#999' }} />
              </div>
            }
          >
            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
              {appointments.map((appointment, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, padding: 12, background: appointment.color, borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ fontSize: '24px' }}>📅</div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 500, color: '#1a1a1a' }}>{appointment.title}</div>
                      <div style={{ fontSize: '11px', color: '#999' }}>{appointment.time}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '16px', color: '#999' }}>→</div>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
