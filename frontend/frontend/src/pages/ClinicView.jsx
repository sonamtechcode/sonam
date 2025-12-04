import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Button, Row, Col, Statistic, Tag, Spin } from 'antd';
import { ArrowLeftOutlined, EditOutlined, ShopOutlined, UserOutlined, MedicineBoxOutlined, CalendarOutlined } from '@ant-design/icons';
import PageLayout from '../components/PageLayout';
import PageTitleHeader from '../components/PageTitleHeader';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function ClinicView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [clinic, setClinic] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClinicDetails();
    fetchClinicStats();
  }, [id]);

  const fetchClinicDetails = async () => {
    try {
      const response = await api.get(`/hospitals/${id}`);
      setClinic(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch clinic details');
    } finally {
      setLoading(false);
    }
  };

  const fetchClinicStats = async () => {
    try {
      const response = await api.get(`/hospitals/${id}/stats`);
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to fetch stats');
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
          <Spin size="large" />
        </div>
      </PageLayout>
    );
  }

  if (!clinic) {
    return (
      <PageLayout>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
          <p style={{ color: '#8c8c8c', marginBottom: 16 }}>Clinic not found</p>
          <Button onClick={() => navigate('/clinics')}>Back to Clinics</Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      header={
        <PageTitleHeader
          title={clinic.name}
          subtitle={`Registration No: ${clinic.registration_no} • ${clinic.is_active ? 'Active' : 'Inactive'}`}
          actions={[
            {
              label: 'Back',
              icon: <ArrowLeftOutlined />,
              type: 'default',
              onClick: () => navigate('/clinics')
            },
            {
              label: 'Edit',
              icon: <EditOutlined />,
              type: 'primary',
              onClick: () => navigate(`/clinics/edit/${id}`)
            }
          ]}
        />
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Statistics */}
        {stats && (
          <Row gutter={16}>
            <Col span={6}>
              <Card bordered={false}>
                <Statistic
                  title="Total Patients"
                  value={stats.total_patients}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card bordered={false}>
                <Statistic
                  title="Total Doctors"
                  value={stats.total_doctors}
                  prefix={<MedicineBoxOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card bordered={false}>
                <Statistic
                  title="Total Appointments"
                  value={stats.total_appointments}
                  prefix={<CalendarOutlined />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card bordered={false}>
                <Statistic
                  title="Available Beds"
                  value={`${stats.available_beds}/${stats.total_beds}`}
                  prefix={<ShopOutlined />}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
          </Row>
        )}

        {/* Basic Information */}
        <Card title="Basic Information" bordered={false}>
          <Descriptions column={2} bordered>
            <Descriptions.Item label="Clinic Name">{clinic.name}</Descriptions.Item>
            <Descriptions.Item label="Registration No">{clinic.registration_no}</Descriptions.Item>
            <Descriptions.Item label="Phone">{clinic.phone}</Descriptions.Item>
            <Descriptions.Item label="Email">{clinic.email}</Descriptions.Item>
            <Descriptions.Item label="City">{clinic.city}</Descriptions.Item>
            <Descriptions.Item label="State">{clinic.state}</Descriptions.Item>
            <Descriptions.Item label="Pincode">{clinic.pincode}</Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={clinic.is_active ? 'success' : 'error'}>
                {clinic.is_active ? 'ACTIVE' : 'INACTIVE'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Address" span={2}>
              {clinic.address || 'N/A'}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Branding Settings */}
        <Card title="Branding Settings" bordered={false}>
          {clinic.settings ? (
            <Descriptions column={2} bordered>
              <Descriptions.Item label="Logo URL" span={2}>
                {clinic.settings.logo_url ? (
                  <a href={clinic.settings.logo_url} target="_blank" rel="noopener noreferrer">
                    {clinic.settings.logo_url}
                  </a>
                ) : (
                  'Not set'
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Primary Color">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      backgroundColor: clinic.settings.primary_color,
                      border: '1px solid #d9d9d9',
                      borderRadius: 4
                    }}
                  />
                  {clinic.settings.primary_color}
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Secondary Color">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      backgroundColor: clinic.settings.secondary_color,
                      border: '1px solid #d9d9d9',
                      borderRadius: 4
                    }}
                  />
                  {clinic.settings.secondary_color}
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Header Text" span={2}>
                {clinic.settings.header_text || 'Not set'}
              </Descriptions.Item>
              <Descriptions.Item label="Footer Text" span={2}>
                {clinic.settings.footer_text || 'Not set'}
              </Descriptions.Item>
            </Descriptions>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#8c8c8c' }}>
              No branding settings configured
            </div>
          )}
        </Card>

        {/* Dates */}
        <Card title="System Information" bordered={false}>
          <Descriptions column={2} bordered>
            <Descriptions.Item label="Created Date">
              {new Date(clinic.created_at).toLocaleDateString('en-GB')}
            </Descriptions.Item>
            <Descriptions.Item label="Last Updated">
              {new Date(clinic.updated_at).toLocaleDateString('en-GB')}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </div>
    </PageLayout>
  );
}
