import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Descriptions, Tag, Button, Spin, Tabs, Upload, Table, Empty, Row, Col, Statistic, Divider, Modal, Form, Input, Select } from 'antd'
import { 
  ArrowLeftOutlined, 
  EditOutlined, 
  UploadOutlined, 
  FileTextOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
  HeartOutlined,
  CalendarOutlined,
  ManOutlined,
  WomanOutlined,
  IdcardOutlined,
  ContactsOutlined,
  MedicineBoxOutlined
} from '@ant-design/icons'
import PageLayout from '../components/PageLayout'
import PageTitleHeader from '../components/PageTitleHeader'
import api from '../services/api'
import toast from 'react-hot-toast'

export default function PatientDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [patient, setPatient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('1')
  const [prescriptions, setPrescriptions] = useState([])
  const [reports, setReports] = useState([])
  const [prescriptionModalVisible, setPrescriptionModalVisible] = useState(false)
  const [doctors, setDoctors] = useState([])
  const [prescriptionForm] = Form.useForm()
  const [uploadLoading, setUploadLoading] = useState(false)

  useEffect(() => {
    fetchPatientDetails()
    fetchPrescriptions()
    fetchReports()
    fetchDoctors()
  }, [id])

  const fetchPatientDetails = async () => {
    setLoading(true)
    try {
      const response = await api.get(`/patients/${id}`)
      setPatient(response.data.data)
    } catch (error) {
      toast.error('Failed to fetch patient details')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPrescriptions = async () => {
    try {
      const response = await api.get(`/prescriptions/patient/${id}`)
      const formattedData = response.data.data.map(item => ({
        id: item.id,
        date: new Date(item.created_at).toLocaleDateString('en-GB'),
        doctor: item.doctor_name || 'N/A',
        medication: `${item.medication} ${item.dosage || ''}`,
        duration: item.duration || 'N/A'
      }))
      setPrescriptions(formattedData)
    } catch (error) {
      console.error('Failed to fetch prescriptions:', error)
    }
  }

  const fetchReports = async () => {
    try {
      const response = await api.get(`/patient-reports/patient/${id}`)
      const formattedData = response.data.data.map(item => ({
        id: item.id,
        name: item.file_name,
        date: new Date(item.created_at).toLocaleDateString('en-GB'),
        type: item.report_type || 'Medical Report',
        url: `/${item.file_path}`
      }))
      setReports(formattedData)
    } catch (error) {
      console.error('Failed to fetch reports:', error)
    }
  }

  const fetchDoctors = async () => {
    try {
      const response = await api.get('/doctors')
      setDoctors(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch doctors:', error)
    }
  }

  const handleAddPrescription = () => {
    prescriptionForm.resetFields()
    setPrescriptionModalVisible(true)
  }

  const handlePrescriptionSubmit = async (values) => {
    try {
      await api.post('/prescriptions', {
        patient_id: id,
        doctor_id: values.doctor_id,
        medication: values.medication,
        dosage: values.dosage,
        duration: values.duration,
        notes: values.notes
      })
      toast.success('Prescription added successfully')
      setPrescriptionModalVisible(false)
      prescriptionForm.resetFields()
      fetchPrescriptions()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add prescription')
      console.error('Failed to add prescription:', error)
    }
  }

  const handleUpload = async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('patient_id', id)
    formData.append('report_type', 'Medical Report')
    
    setUploadLoading(true)
    try {
      await api.post('/patient-reports', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      toast.success('Report uploaded successfully')
      fetchReports()
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error.response?.data?.message || 'Failed to upload report')
    } finally {
      setUploadLoading(false)
    }
    return false
  }

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-96">
          <Spin size="large" />
        </div>
      </PageLayout>
    )
  }

  if (!patient) {
    return (
      <PageLayout>
        <div className="flex flex-col items-center justify-center h-96">
          <p className="text-gray-500 mb-4">Patient not found</p>
          <Button onClick={() => navigate('/patients')}>Back to Patients</Button>
        </div>
      </PageLayout>
    )
  }

  const prescriptionColumns = [
    { title: 'Date', dataIndex: 'date', key: 'date' },
    { title: 'Doctor', dataIndex: 'doctor', key: 'doctor' },
    { title: 'Medication', dataIndex: 'medication', key: 'medication' },
    { title: 'Duration', dataIndex: 'duration', key: 'duration' }
  ]

  const reportColumns = [
    { title: 'Report Name', dataIndex: 'name', key: 'name' },
    { title: 'Date', dataIndex: 'date', key: 'date' },
    { title: 'Type', dataIndex: 'type', key: 'type' },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button type="link" href={record.url} target="_blank">View</Button>
      )
    }
  ]

  const getGenderIcon = () => {
    if (patient.gender?.toLowerCase() === 'male') return <ManOutlined style={{ color: '#1890ff' }} />
    if (patient.gender?.toLowerCase() === 'female') return <WomanOutlined style={{ color: '#eb2f96' }} />
    return <UserOutlined />
  }

  const getBloodGroupColor = (bloodGroup) => {
    const colors = {
      'A+': 'red',
      'A-': 'volcano',
      'B+': 'orange',
      'B-': 'gold',
      'AB+': 'magenta',
      'AB-': 'purple',
      'O+': 'geekblue',
      'O-': 'cyan'
    }
    return colors[bloodGroup] || 'default'
  }

  const tabItems = [
    {
      key: '1',
      label: (
        <span>
          <UserOutlined /> Overview
        </span>
      ),
      children: (
        <div className="space-y-6">
          {/* Quick Stats */}
          <Row gutter={16}>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Patient ID"
                  value={patient.patient_id}
                  prefix={<IdcardOutlined />}
                  valueStyle={{ fontSize: '20px', color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Age"
                  value={patient.age}
                  suffix="years"
                  prefix={<CalendarOutlined />}
                  valueStyle={{ fontSize: '20px', color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ fontSize: '24px' }}>{getGenderIcon()}</div>
                  <div>
                    <div style={{ color: 'rgba(0, 0, 0, 0.45)', fontSize: '14px' }}>Gender</div>
                    <div style={{ fontSize: '20px', fontWeight: 500 }}>{patient.gender}</div>
                  </div>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <HeartOutlined style={{ fontSize: '24px', color: '#ff4d4f' }} />
                  <div>
                    <div style={{ color: 'rgba(0, 0, 0, 0.45)', fontSize: '14px' }}>Blood Group</div>
                    <Tag color={getBloodGroupColor(patient.blood_group)} style={{ fontSize: '16px', padding: '4px 12px', marginTop: '4px' }}>
                      {patient.blood_group || 'N/A'}
                    </Tag>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>

          {/* Personal Information */}
          <Card 
            title={
              <span style={{ fontSize: '16px', fontWeight: 600 }}>
                <UserOutlined style={{ marginRight: '8px' }} />
                Personal Information
              </span>
            }
            style={{ borderRadius: '8px' }}
          >
            <Descriptions column={{ xs: 1, sm: 2, md: 2 }} layout="horizontal" colon={false}>
              <Descriptions.Item 
                label={<span style={{ fontWeight: 500, color: '#595959' }}>Full Name</span>}
              >
                <span style={{ fontSize: '15px' }}>{patient.name}</span>
              </Descriptions.Item>
              <Descriptions.Item 
                label={<span style={{ fontWeight: 500, color: '#595959' }}>Status</span>}
              >
                <Tag color="success" style={{ fontSize: '13px' }}>Active</Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Contact Information */}
          <Card 
            title={
              <span style={{ fontSize: '16px', fontWeight: 600 }}>
                <ContactsOutlined style={{ marginRight: '8px' }} />
                Contact Information
              </span>
            }
            style={{ borderRadius: '8px' }}
          >
            <Descriptions column={{ xs: 1, sm: 2, md: 2 }} layout="horizontal" colon={false}>
              <Descriptions.Item 
                label={
                  <span style={{ fontWeight: 500, color: '#595959' }}>
                    <PhoneOutlined style={{ marginRight: '6px' }} />
                    Phone
                  </span>
                }
              >
                <span style={{ fontSize: '15px' }}>{patient.phone || 'N/A'}</span>
              </Descriptions.Item>
              <Descriptions.Item 
                label={
                  <span style={{ fontWeight: 500, color: '#595959' }}>
                    <MailOutlined style={{ marginRight: '6px' }} />
                    Email
                  </span>
                }
              >
                <span style={{ fontSize: '15px' }}>{patient.email || 'N/A'}</span>
              </Descriptions.Item>
              <Descriptions.Item 
                label={
                  <span style={{ fontWeight: 500, color: '#595959' }}>
                    <HomeOutlined style={{ marginRight: '6px' }} />
                    Address
                  </span>
                }
                span={2}
              >
                <span style={{ fontSize: '15px' }}>{patient.address || 'N/A'}</span>
              </Descriptions.Item>
            </Descriptions>

            <Divider style={{ margin: '20px 0' }} />

            <div style={{ marginBottom: '12px', fontSize: '15px', fontWeight: 600, color: '#262626' }}>
              Emergency Contact
            </div>
            <Descriptions column={{ xs: 1, sm: 2, md: 2 }} layout="horizontal" colon={false}>
              <Descriptions.Item 
                label={<span style={{ fontWeight: 500, color: '#595959' }}>Contact Name</span>}
              >
                <span style={{ fontSize: '15px' }}>{patient.emergency_contact_name || 'N/A'}</span>
              </Descriptions.Item>
              <Descriptions.Item 
                label={<span style={{ fontWeight: 500, color: '#595959' }}>Contact Phone</span>}
              >
                <span style={{ fontSize: '15px' }}>{patient.emergency_contact || 'N/A'}</span>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </div>
      )
    },
    {
      key: '2',
      label: (
        <span>
          <MedicineBoxOutlined /> Medical Details
        </span>
      ),
      children: (
        <div className="space-y-6">
          <Card 
            title={
              <span style={{ fontSize: '16px', fontWeight: 600 }}>
                <FileTextOutlined style={{ marginRight: '8px' }} />
                Medical History
              </span>
            }
            style={{ borderRadius: '8px' }}
          >
            <div style={{ 
              padding: '16px', 
              backgroundColor: '#fafafa', 
              borderRadius: '6px',
              fontSize: '15px',
              lineHeight: '1.6',
              minHeight: '80px'
            }}>
              {patient.medical_history || (
                <span style={{ color: '#8c8c8c', fontStyle: 'italic' }}>
                  No medical history recorded
                </span>
              )}
            </div>
          </Card>

          <Card 
            title={
              <span style={{ fontSize: '16px', fontWeight: 600 }}>
                <MedicineBoxOutlined style={{ marginRight: '8px' }} />
                Prescriptions
              </span>
            }
            extra={<Button type="primary" onClick={handleAddPrescription}>Add Prescription</Button>}
            style={{ borderRadius: '8px' }}
          >
            {prescriptions.length > 0 ? (
              <Table 
                columns={prescriptionColumns} 
                dataSource={prescriptions} 
                rowKey="id"
                pagination={false}
                size="middle"
              />
            ) : (
              <Empty 
                description="No prescriptions found" 
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>

          <Card 
            title={
              <span style={{ fontSize: '16px', fontWeight: 600 }}>
                <FileTextOutlined style={{ marginRight: '8px' }} />
                Medical Reports
              </span>
            }
            extra={
              <Upload
                beforeUpload={handleUpload}
                showUploadList={false}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              >
                <Button icon={<UploadOutlined />} type="primary" loading={uploadLoading}>
                  Upload Report
                </Button>
              </Upload>
            }
            style={{ borderRadius: '8px' }}
          >
            {reports.length > 0 ? (
              <Table 
                columns={reportColumns} 
                dataSource={reports} 
                rowKey="id"
                pagination={false}
                size="middle"
              />
            ) : (
              <Empty 
                description="No reports uploaded" 
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>
        </div>
      )
    }
  ]

  return (
    <PageLayout
      header={
        <PageTitleHeader
          title="Patient Details"
          subtitle={`Patient ID: ${patient.patient_id}`}
          actions={[
            {
              label: 'Back',
              icon: <ArrowLeftOutlined />,
              type: 'default',
              onClick: () => navigate('/patients')
            },
            {
              label: 'Edit',
              icon: <EditOutlined />,
              type: 'primary',
              onClick: () => navigate(`/patients/edit/${patient.id}`)
            }
          ]}
        />
      }
    >
      <Card>
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab} 
          items={tabItems}
          size="large"
        />
      </Card>

      {/* Add Prescription Modal */}
      <Modal
        title="Add Prescription"
        open={prescriptionModalVisible}
        onCancel={() => setPrescriptionModalVisible(false)}
        onOk={() => prescriptionForm.submit()}
        width={600}
        okText="Add Prescription"
      >
        <Form
          form={prescriptionForm}
          layout="vertical"
          onFinish={handlePrescriptionSubmit}
        >
          <Form.Item
            name="doctor_id"
            label="Doctor"
            rules={[{ required: true, message: 'Please select a doctor' }]}
          >
            <Select
              placeholder="Select doctor"
              showSearch
              optionFilterProp="children"
            >
              {doctors.map(doctor => (
                <Select.Option key={doctor.id} value={doctor.id}>
                  Dr. {doctor.name} - {doctor.specialization}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="medication"
            label="Medication"
            rules={[{ required: true, message: 'Please enter medication name' }]}
          >
            <Input placeholder="Enter medication name" />
          </Form.Item>

          <Form.Item
            name="dosage"
            label="Dosage"
            rules={[{ required: true, message: 'Please enter dosage' }]}
          >
            <Input placeholder="e.g., 500mg, 2 tablets" />
          </Form.Item>

          <Form.Item
            name="duration"
            label="Duration"
            rules={[{ required: true, message: 'Please enter duration' }]}
          >
            <Input placeholder="e.g., 7 days, 2 weeks" />
          </Form.Item>

          <Form.Item
            name="notes"
            label="Notes"
          >
            <Input.TextArea 
              rows={3} 
              placeholder="Additional instructions or notes" 
            />
          </Form.Item>
        </Form>
      </Modal>
    </PageLayout>
  )
}
