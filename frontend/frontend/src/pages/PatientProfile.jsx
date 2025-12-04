import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, Tabs, Tag, Button, Space, Avatar, Row, Col, Modal, Form
} from 'antd';
import {
  UserOutlined, PhoneOutlined, MailOutlined, CalendarOutlined,
  PlusOutlined, PrinterOutlined
} from '@ant-design/icons';
import { useHospital } from '../hooks/useHospital';
import api from '../services/api';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import {
  OverviewTab, VisitsTab, PrescriptionsTab, LabReportsTab,
  ProceduresTab, DocumentsTab, BillingTab, CommunicationsTab, ConsentsTab
} from '../components/PatientProfileTabs';
import {
  VitalsForm, VisitForm, PrescriptionForm, ProcedureForm,
  FollowupForm, DocumentForm, ConsentForm
} from '../components/PatientProfileForms';

const { TabPane } = Tabs;

export default function PatientProfile() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { selectedHospital } = useHospital();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('');
  const [form] = Form.useForm();

  useEffect(() => {
    if (selectedHospital && patientId) {
      fetchPatientProfile();
    }
  }, [selectedHospital, patientId]);

  const fetchPatientProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/patient-profile/${patientId}?hospital_id=${selectedHospital.id}`);
      setProfileData(response.data.data);
    } catch (error) {
      toast.error('Failed to load patient profile');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (type) => {
    setModalType(type);
    setModalVisible(true);
    form.resetFields();
  };

  const handleModalSubmit = async () => {
    try {
      const values = await form.validateFields();
      values.hospital_id = selectedHospital.id;

      let endpoint = '';
      switch (modalType) {
        case 'vitals':
          endpoint = `/patient-profile/${patientId}/vitals`;
          break;
        case 'visit':
          endpoint = `/patient-profile/${patientId}/visits`;
          break;
        case 'prescription':
          endpoint = `/patient-profile/${patientId}/prescriptions`;
          values.medicines = JSON.parse(values.medicines || '[]');
          break;
        case 'procedure':
          endpoint = `/patient-profile/${patientId}/procedures`;
          break;
        case 'followup':
          endpoint = `/patient-profile/${patientId}/followups`;
          break;
        case 'document':
          endpoint = `/patient-profile/${patientId}/documents`;
          break;
        case 'consent':
          endpoint = `/patient-profile/${patientId}/consents`;
          break;
        default:
          return;
      }

      await api.post(endpoint, values);
      toast.success('Record added successfully');
      setModalVisible(false);
      fetchPatientProfile();
    } catch (error) {
      toast.error('Failed to add record');
      console.error(error);
    }
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading patient profile...</div>;
  }

  if (!profileData) {
    return <div style={{ padding: '20px' }}>Patient not found</div>;
  }

  const { basicInfo, medicalDetails, latestVitals, visits, prescriptions, 
          procedures, labReports, documents, billingSummary, recentTransactions,
          followups, communications, consents, feedback } = profileData;

  return (
    <div style={{ padding: '6px' }}>
      {/* Header Section */}
      <Card style={{ marginBottom: 16, borderRadius: '12px' }}>
        <Row gutter={24} align="middle">
          <Col>
            <Avatar 
              size={80} 
              src={basicInfo.photo_url} 
              icon={<UserOutlined />}
              style={{ backgroundColor: '#3b82f6' }}
            />
          </Col>
          <Col flex="auto">
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>
              {basicInfo.name}
              <Tag color="blue" style={{ marginLeft: 12 }}>
                {basicInfo.patient_id}
              </Tag>
            </h2>
            <Space size="large" style={{ marginTop: 8 }}>
              <span><PhoneOutlined /> {basicInfo.phone}</span>
              {basicInfo.email && <span><MailOutlined /> {basicInfo.email}</span>}
              <span>{basicInfo.calculated_age} years • {basicInfo.gender}</span>
              {basicInfo.blood_group && <Tag color="red">{basicInfo.blood_group}</Tag>}
            </Space>
          </Col>
          <Col>
            <Space>
              <Button icon={<CalendarOutlined />} onClick={() => navigate(`/appointments/add?patient=${patientId}`)}>
                Book Appointment
              </Button>
              <Button icon={<PlusOutlined />} type="primary" onClick={() => openModal('visit')}>
                New Visit
              </Button>
              <Button icon={<PrinterOutlined />}>Print Summary</Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Main Content Tabs */}
      <Card style={{ borderRadius: '12px' }}>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Overview" key="overview">
            <OverviewTab 
              basicInfo={basicInfo}
              medicalDetails={medicalDetails}
              latestVitals={latestVitals}
              billingSummary={billingSummary}
              followups={followups}
              openModal={openModal}
            />
          </TabPane>

          <TabPane tab="Visits" key="visits">
            <VisitsTab visits={visits} openModal={openModal} />
          </TabPane>

          <TabPane tab="Prescriptions" key="prescriptions">
            <PrescriptionsTab prescriptions={prescriptions} openModal={openModal} />
          </TabPane>

          <TabPane tab="Lab Reports" key="lab">
            <LabReportsTab labReports={labReports} />
          </TabPane>

          <TabPane tab="Procedures" key="procedures">
            <ProceduresTab procedures={procedures} openModal={openModal} />
          </TabPane>

          <TabPane tab="Documents" key="documents">
            <DocumentsTab documents={documents} openModal={openModal} patientId={patientId} fetchProfile={fetchPatientProfile} />
          </TabPane>

          <TabPane tab="Billing" key="billing">
            <BillingTab billingSummary={billingSummary} transactions={recentTransactions} />
          </TabPane>

          <TabPane tab="Communications" key="communications">
            <CommunicationsTab communications={communications} />
          </TabPane>

          <TabPane tab="Consents" key="consents">
            <ConsentsTab consents={consents} openModal={openModal} />
          </TabPane>
        </Tabs>
      </Card>

      {/* Modal for Adding Records */}
      <Modal
        title={getModalTitle(modalType)}
        open={modalVisible}
        onOk={handleModalSubmit}
        onCancel={() => setModalVisible(false)}
        width={700}
      >
        {renderModalForm(modalType, form)}
      </Modal>
    </div>
  );
}

// Helper function to get modal title
function getModalTitle(type) {
  const titles = {
    vitals: 'Record Vitals',
    visit: 'Create New Visit',
    prescription: 'Add Prescription',
    procedure: 'Add Procedure',
    followup: 'Schedule Follow-up',
    document: 'Upload Document',
    consent: 'Add Consent Form'
  };
  return titles[type] || 'Add Record';
}

// Helper function to render modal forms
function renderModalForm(type, form) {
  switch (type) {
    case 'vitals':
      return <VitalsForm form={form} />;
    case 'visit':
      return <VisitForm form={form} />;
    case 'prescription':
      return <PrescriptionForm form={form} />;
    case 'procedure':
      return <ProcedureForm form={form} />;
    case 'followup':
      return <FollowupForm form={form} />;
    case 'document':
      return <DocumentForm form={form} />;
    case 'consent':
      return <ConsentForm form={form} />;
    default:
      return null;
  }
}
