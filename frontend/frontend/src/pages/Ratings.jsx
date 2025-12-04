import { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Rate, Avatar, Progress, Tabs } from 'antd';
import { UserOutlined, StarOutlined, TrophyOutlined } from '@ant-design/icons';
import PageLayout from '../components/PageLayout';
import api from '../services/api';

const { TabPane } = Tabs;

export default function Ratings() {
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [feedbackStats, setFeedbackStats] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch doctors with appointment counts
      const doctorsRes = await api.get('/doctors');
      const appointmentsRes = await api.get('/appointments');
      const feedbackRes = await api.get('/feedback');
      const feedbackStatsRes = await api.get('/feedback/stats');

      // Calculate ratings for each doctor
      const doctorsWithRatings = doctorsRes.data.map(doctor => {
        const doctorAppointments = appointmentsRes.data.filter(a => a.doctor_id === doctor.id);
        const doctorFeedback = feedbackRes.data.filter(f => f.doctor_id === doctor.id);
        
        const avgRating = doctorFeedback.length > 0
          ? doctorFeedback.reduce((sum, f) => sum + f.rating, 0) / doctorFeedback.length
          : 0;

        return {
          ...doctor,
          totalAppointments: doctorAppointments.length,
          completedAppointments: doctorAppointments.filter(a => a.status === 'completed').length,
          feedbackCount: doctorFeedback.length,
          averageRating: avgRating,
          successRate: doctorAppointments.length > 0
            ? (doctorAppointments.filter(a => a.status === 'completed').length / doctorAppointments.length) * 100
            : 0
        };
      });

      // Sort by rating
      doctorsWithRatings.sort((a, b) => b.averageRating - a.averageRating);

      setDoctors(doctorsWithRatings);
      setFeedbackStats(feedbackStatsRes.data);

      // Fetch departments
      const deptRes = await api.get('/departments');
      setDepartments(deptRes.data);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const doctorColumns = [
    {
      title: 'Rank',
      key: 'rank',
      render: (_, __, index) => {
        if (index === 0) return <TrophyOutlined style={{ color: '#FFD700', fontSize: 20 }} />;
        if (index === 1) return <TrophyOutlined style={{ color: '#C0C0C0', fontSize: 20 }} />;
        if (index === 2) return <TrophyOutlined style={{ color: '#CD7F32', fontSize: 20 }} />;
        return index + 1;
      },
      width: 80,
    },
    {
      title: 'Doctor',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar icon={<UserOutlined />} style={{ marginRight: 8 }} />
          <div>
            <div style={{ fontWeight: 'bold' }}>{name}</div>
            <div style={{ fontSize: 12, color: '#888' }}>{record.specialization}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Rating',
      dataIndex: 'averageRating',
      key: 'averageRating',
      render: (rating) => (
        <div>
          <Rate disabled defaultValue={rating} allowHalf />
          <div style={{ fontSize: 12, color: '#888' }}>
            {rating.toFixed(1)} / 5.0
          </div>
        </div>
      ),
      sorter: (a, b) => a.averageRating - b.averageRating,
    },
    {
      title: 'Total Appointments',
      dataIndex: 'totalAppointments',
      key: 'totalAppointments',
      sorter: (a, b) => a.totalAppointments - b.totalAppointments,
    },
    {
      title: 'Completed',
      dataIndex: 'completedAppointments',
      key: 'completedAppointments',
      sorter: (a, b) => a.completedAppointments - b.completedAppointments,
    },
    {
      title: 'Success Rate',
      dataIndex: 'successRate',
      key: 'successRate',
      render: (rate) => (
        <Progress 
          percent={parseFloat(rate.toFixed(1))} 
          size="small"
          status={rate >= 80 ? 'success' : rate >= 60 ? 'normal' : 'exception'}
        />
      ),
      sorter: (a, b) => a.successRate - b.successRate,
    },
    {
      title: 'Feedback Count',
      dataIndex: 'feedbackCount',
      key: 'feedbackCount',
      sorter: (a, b) => a.feedbackCount - b.feedbackCount,
    },
  ];

  const departmentColumns = [
    {
      title: 'Department',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Total Doctors',
      dataIndex: 'doctor_count',
      key: 'doctor_count',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <span style={{ color: status === 'active' ? 'green' : 'red' }}>
          {status?.toUpperCase()}
        </span>
      ),
    },
  ];

  const topDoctors = doctors.slice(0, 3);

  return (
    <PageLayout
      title="Performance Ratings"
      subtitle="Doctor and department performance metrics"
    >
      <Row gutter={16} style={{ marginBottom: 24 }}>
        {topDoctors.map((doctor, index) => (
          <Col span={8} key={doctor.id}>
            <Card>
              <div style={{ textAlign: 'center' }}>
                {index === 0 && <TrophyOutlined style={{ color: '#FFD700', fontSize: 40 }} />}
                {index === 1 && <TrophyOutlined style={{ color: '#C0C0C0', fontSize: 40 }} />}
                {index === 2 && <TrophyOutlined style={{ color: '#CD7F32', fontSize: 40 }} />}
                <h3 style={{ marginTop: 16 }}>{doctor.name}</h3>
                <p style={{ color: '#888' }}>{doctor.specialization}</p>
                <Rate disabled defaultValue={doctor.averageRating} allowHalf />
                <p style={{ fontSize: 20, fontWeight: 'bold', marginTop: 8 }}>
                  {doctor.averageRating.toFixed(1)} / 5.0
                </p>
                <p style={{ color: '#888' }}>
                  {doctor.feedbackCount} reviews • {doctor.totalAppointments} appointments
                </p>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Tabs defaultActiveKey="1">
        <TabPane tab="Doctor Rankings" key="1">
          <Table
            columns={doctorColumns}
            dataSource={doctors}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
        </TabPane>

        <TabPane tab="Departments" key="2">
          <Table
            columns={departmentColumns}
            dataSource={departments}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
        </TabPane>

        <TabPane tab="Overall Statistics" key="3">
          {feedbackStats && (
            <Row gutter={16}>
              <Col span={8}>
                <Card>
                  <div style={{ textAlign: 'center' }}>
                    <StarOutlined style={{ fontSize: 40, color: '#faad14' }} />
                    <h3>Average Rating</h3>
                    <p style={{ fontSize: 32, fontWeight: 'bold' }}>
                      {parseFloat(feedbackStats.stats?.average_rating || 0).toFixed(1)}
                    </p>
                    <p style={{ color: '#888' }}>Out of 5.0</p>
                  </div>
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <div style={{ textAlign: 'center' }}>
                    <UserOutlined style={{ fontSize: 40, color: '#1890ff' }} />
                    <h3>Total Feedback</h3>
                    <p style={{ fontSize: 32, fontWeight: 'bold' }}>
                      {feedbackStats.stats?.total_feedback || 0}
                    </p>
                    <p style={{ color: '#888' }}>Reviews received</p>
                  </div>
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <div style={{ textAlign: 'center' }}>
                    <TrophyOutlined style={{ fontSize: 40, color: '#52c41a' }} />
                    <h3>Satisfaction Rate</h3>
                    <p style={{ fontSize: 32, fontWeight: 'bold' }}>
                      {feedbackStats.stats?.total_feedback > 0
                        ? ((feedbackStats.stats.positive_feedback / feedbackStats.stats.total_feedback) * 100).toFixed(1)
                        : 0}%
                    </p>
                    <p style={{ color: '#888' }}>Positive reviews</p>
                  </div>
                </Card>
              </Col>
            </Row>
          )}
        </TabPane>
      </Tabs>
    </PageLayout>
  );
}
