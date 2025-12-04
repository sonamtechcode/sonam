import { Card, Row, Col, Descriptions, Tag, Button, Timeline, Table, Empty, Statistic, Space } from 'antd';
import { PlusOutlined, DownloadOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../services/api';
import toast from 'react-hot-toast';

// Overview Tab
export function OverviewTab({ basicInfo, medicalDetails, latestVitals, billingSummary, followups, openModal }) {
  return (
    <Row gutter={[16, 16]}>
      {/* Basic Information */}
      <Col span={12}>
        <Card title="Basic Information" size="small">
          <Descriptions column={1} size="small">
            <Descriptions.Item label="Patient ID">{basicInfo.patient_id}</Descriptions.Item>
            <Descriptions.Item label="Date of Birth">
              {basicInfo.date_of_birth ? dayjs(basicInfo.date_of_birth).format('DD MMM YYYY') : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Age">{basicInfo.calculated_age || basicInfo.age} years</Descriptions.Item>
            <Descriptions.Item label="Gender">{basicInfo.gender}</Descriptions.Item>
            <Descriptions.Item label="Blood Group">{basicInfo.blood_group || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Marital Status">{basicInfo.marital_status || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Phone">{basicInfo.phone}</Descriptions.Item>
            {basicInfo.alternate_phone && (
              <Descriptions.Item label="Alternate Phone">{basicInfo.alternate_phone}</Descriptions.Item>
            )}
            <Descriptions.Item label="Email">{basicInfo.email || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Address">
              {basicInfo.address}
              {basicInfo.city && `, ${basicInfo.city}`}
              {basicInfo.state && `, ${basicInfo.state}`}
              {basicInfo.pincode && ` - ${basicInfo.pincode}`}
            </Descriptions.Item>
            <Descriptions.Item label="Emergency Contact">
              {basicInfo.emergency_contact_name} ({basicInfo.emergency_relation})<br />
              {basicInfo.emergency_contact}
            </Descriptions.Item>
            {basicInfo.referred_by && (
              <Descriptions.Item label="Referred By">
                {basicInfo.referred_by} ({basicInfo.referred_type})
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Registration Date">
              {dayjs(basicInfo.created_at).format('DD MMM YYYY')}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </Col>

      {/* Medical Details */}
      <Col span={12}>
        <Card 
          title="Medical Details" 
          size="small"
          extra={<Button size="small" onClick={() => openModal('medical')}>Update</Button>}
        >
          {medicalDetails ? (
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Height">{medicalDetails.height} cm</Descriptions.Item>
              <Descriptions.Item label="Weight">{medicalDetails.weight} kg</Descriptions.Item>
              <Descriptions.Item label="BMI">
                {medicalDetails.bmi} 
                <Tag color={medicalDetails.bmi < 18.5 ? 'orange' : medicalDetails.bmi > 25 ? 'red' : 'green'} style={{ marginLeft: 8 }}>
                  {medicalDetails.bmi < 18.5 ? 'Underweight' : medicalDetails.bmi > 25 ? 'Overweight' : 'Normal'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Allergies">{medicalDetails.allergies || 'None'}</Descriptions.Item>
              <Descriptions.Item label="Current Medications">{medicalDetails.current_medications || 'None'}</Descriptions.Item>
              <Descriptions.Item label="Chronic Diseases">{medicalDetails.chronic_diseases || 'None'}</Descriptions.Item>
              <Descriptions.Item label="Smoking">{medicalDetails.smoking}</Descriptions.Item>
              <Descriptions.Item label="Alcohol">{medicalDetails.alcohol}</Descriptions.Item>
              <Descriptions.Item label="Exercise">{medicalDetails.exercise}</Descriptions.Item>
            </Descriptions>
          ) : (
            <Empty description="No medical details recorded" />
          )}
        </Card>
      </Col>

      {/* Latest Vitals */}
      <Col span={12}>
        <Card 
          title="Latest Vitals" 
          size="small"
          extra={<Button size="small" icon={<PlusOutlined />} onClick={() => openModal('vitals')}>Record</Button>}
        >
          {latestVitals ? (
            <>
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic title="BP" value={`${latestVitals.bp_systolic}/${latestVitals.bp_diastolic}`} suffix="mmHg" />
                </Col>
                <Col span={8}>
                  <Statistic title="Pulse" value={latestVitals.pulse} suffix="bpm" />
                </Col>
                <Col span={8}>
                  <Statistic title="Temp" value={latestVitals.temperature} suffix="°F" />
                </Col>
              </Row>
              <Row gutter={16} style={{ marginTop: 16 }}>
                <Col span={8}>
                  <Statistic title="SpO2" value={latestVitals.spo2} suffix="%" />
                </Col>
                <Col span={8}>
                  <Statistic title="Respiration" value={latestVitals.respiration} suffix="/min" />
                </Col>
                {latestVitals.rbs && (
                  <Col span={8}>
                    <Statistic title="RBS" value={latestVitals.rbs} suffix="mg/dL" />
                  </Col>
                )}
              </Row>
              <div style={{ marginTop: 12, fontSize: '12px', color: '#8c8c8c' }}>
                Recorded: {dayjs(latestVitals.recorded_at).format('DD MMM YYYY, hh:mm A')}
              </div>
            </>
          ) : (
            <Empty description="No vitals recorded" />
          )}
        </Card>
      </Col>

      {/* Billing Summary */}
      <Col span={12}>
        <Card title="Billing Summary" size="small">
          <Row gutter={16}>
            <Col span={8}>
              <Statistic 
                title="Total Amount" 
                value={billingSummary?.total_amount || 0} 
                prefix="₹"
                valueStyle={{ color: '#1890ff' }}
              />
            </Col>
            <Col span={8}>
              <Statistic 
                title="Paid" 
                value={billingSummary?.paid_amount || 0} 
                prefix="₹"
                valueStyle={{ color: '#52c41a' }}
              />
            </Col>
            <Col span={8}>
              <Statistic 
                title="Due" 
                value={billingSummary?.due_amount || 0} 
                prefix="₹"
                valueStyle={{ color: billingSummary?.due_amount > 0 ? '#ff4d4f' : '#52c41a' }}
              />
            </Col>
          </Row>
        </Card>
      </Col>

      {/* Upcoming Follow-ups */}
      <Col span={24}>
        <Card 
          title="Upcoming Follow-ups" 
          size="small"
          extra={<Button size="small" icon={<PlusOutlined />} onClick={() => openModal('followup')}>Schedule</Button>}
        >
          {followups && followups.length > 0 ? (
            <Timeline>
              {followups.map(followup => (
                <Timeline.Item key={followup.id} color="blue">
                  <div style={{ fontSize: '13px' }}>
                    <strong>{dayjs(followup.followup_date).format('DD MMM YYYY')}</strong>
                    {followup.followup_time && ` at ${followup.followup_time}`}
                    <div style={{ color: '#8c8c8c', marginTop: 4 }}>{followup.reason}</div>
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
          ) : (
            <Empty description="No upcoming follow-ups" />
          )}
        </Card>
      </Col>
    </Row>
  );
}

// Visits Tab
export function VisitsTab({ visits, openModal }) {
  const columns = [
    {
      title: 'Date & Time',
      dataIndex: 'visit_date',
      key: 'visit_date',
      render: (date, record) => (
        <div>
          <div>{dayjs(date).format('DD MMM YYYY')}</div>
          <div style={{ fontSize: '11px', color: '#8c8c8c' }}>{record.visit_time}</div>
        </div>
      )
    },
    {
      title: 'Doctor',
      dataIndex: 'doctor_name',
      key: 'doctor_name',
      render: (name, record) => (
        <div>
          <div>{name}</div>
          <div style={{ fontSize: '11px', color: '#8c8c8c' }}>{record.specialization}</div>
        </div>
      )
    },
    {
      title: 'Type',
      dataIndex: 'visit_type',
      key: 'visit_type',
      render: type => <Tag color={type === 'new' ? 'blue' : type === 'followup' ? 'green' : 'red'}>{type}</Tag>
    },
    {
      title: 'Reason',
      dataIndex: 'reason_for_visit',
      key: 'reason_for_visit',
      ellipsis: true
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: status => (
        <Tag color={status === 'completed' ? 'success' : status === 'scheduled' ? 'processing' : 'default'}>
          {status}
        </Tag>
      )
    },
    {
      title: 'Payment',
      dataIndex: 'payment_status',
      key: 'payment_status',
      render: status => (
        <Tag color={status === 'paid' ? 'success' : status === 'pending' ? 'warning' : 'processing'}>
          {status}
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button size="small" type="link">View</Button>
          <Button size="small" type="link" icon={<DownloadOutlined />}>Download</Button>
        </Space>
      )
    }
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, textAlign: 'right' }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal('visit')}>
          New Visit
        </Button>
      </div>
      <Table 
        columns={columns} 
        dataSource={visits} 
        rowKey="id"
        size="small"
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
}

// Prescriptions Tab
export function PrescriptionsTab({ prescriptions, openModal }) {
  const columns = [
    {
      title: 'Date',
      dataIndex: 'prescription_date',
      key: 'prescription_date',
      render: date => dayjs(date).format('DD MMM YYYY')
    },
    {
      title: 'Doctor',
      dataIndex: 'doctor_name',
      key: 'doctor_name'
    },
    {
      title: 'Medicines',
      dataIndex: 'medicines',
      key: 'medicines',
      render: medicines => {
        const meds = typeof medicines === 'string' ? JSON.parse(medicines) : medicines;
        return (
          <div>
            {meds.slice(0, 2).map((med, idx) => (
              <div key={idx} style={{ fontSize: '12px' }}>• {med.name}</div>
            ))}
            {meds.length > 2 && <div style={{ fontSize: '11px', color: '#8c8c8c' }}>+{meds.length - 2} more</div>}
          </div>
        );
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: () => (
        <Space>
          <Button size="small" type="link">View</Button>
          <Button size="small" type="link" icon={<DownloadOutlined />}>Download</Button>
        </Space>
      )
    }
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, textAlign: 'right' }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal('prescription')}>
          Add Prescription
        </Button>
      </div>
      <Table 
        columns={columns} 
        dataSource={prescriptions} 
        rowKey="id"
        size="small"
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
}

// Lab Reports Tab
export function LabReportsTab({ labReports }) {
  const columns = [
    {
      title: 'Test Name',
      dataIndex: 'test_name',
      key: 'test_name',
      render: (name, record) => (
        <div>
          <div>{name}</div>
          <div style={{ fontSize: '11px', color: '#8c8c8c' }}>{record.test_code}</div>
        </div>
      )
    },
    {
      title: 'Doctor',
      dataIndex: 'doctor_name',
      key: 'doctor_name'
    },
    {
      title: 'Sample Date',
      dataIndex: 'sample_collection_date',
      key: 'sample_collection_date',
      render: date => date ? dayjs(date).format('DD MMM YYYY') : 'N/A'
    },
    {
      title: 'Result Date',
      dataIndex: 'result_date',
      key: 'result_date',
      render: date => date ? dayjs(date).format('DD MMM YYYY') : 'N/A'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: status => (
        <Tag color={status === 'completed' ? 'success' : status === 'sample_collected' ? 'processing' : 'default'}>
          {status}
        </Tag>
      )
    },
    {
      title: 'Result',
      dataIndex: 'result_value',
      key: 'result_value'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          {record.report_pdf && (
            <Button size="small" type="link" icon={<DownloadOutlined />}>Download</Button>
          )}
        </Space>
      )
    }
  ];

  return (
    <Table 
      columns={columns} 
      dataSource={labReports} 
      rowKey="id"
      size="small"
      pagination={{ pageSize: 10 }}
    />
  );
}

// Procedures Tab
export function ProceduresTab({ procedures, openModal }) {
  const columns = [
    {
      title: 'Procedure',
      dataIndex: 'procedure_name',
      key: 'procedure_name'
    },
    {
      title: 'Date',
      dataIndex: 'procedure_date',
      key: 'procedure_date',
      render: date => dayjs(date).format('DD MMM YYYY')
    },
    {
      title: 'Doctor',
      dataIndex: 'doctor_name',
      key: 'doctor_name'
    },
    {
      title: 'Cost',
      dataIndex: 'cost',
      key: 'cost',
      render: cost => `₹${cost}`
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: status => (
        <Tag color={status === 'completed' ? 'success' : status === 'scheduled' ? 'processing' : 'default'}>
          {status}
        </Tag>
      )
    },
    {
      title: 'Follow-up',
      dataIndex: 'follow_up_required',
      key: 'follow_up_required',
      render: (required, record) => required ? dayjs(record.follow_up_date).format('DD MMM YYYY') : 'No'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: () => (
        <Space>
          <Button size="small" type="link">View</Button>
        </Space>
      )
    }
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, textAlign: 'right' }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal('procedure')}>
          Add Procedure
        </Button>
      </div>
      <Table 
        columns={columns} 
        dataSource={procedures} 
        rowKey="id"
        size="small"
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
}

// Documents Tab
export function DocumentsTab({ documents, openModal, patientId, fetchProfile }) {
  const handleDelete = async (documentId) => {
    try {
      await api.delete(`/patient-profile/documents/${documentId}`);
      toast.success('Document deleted');
      fetchProfile();
    } catch (error) {
      toast.error('Failed to delete document');
    }
  };

  const columns = [
    {
      title: 'Document Name',
      dataIndex: 'document_name',
      key: 'document_name'
    },
    {
      title: 'Type',
      dataIndex: 'document_type',
      key: 'document_type',
      render: type => <Tag>{type.replace('_', ' ')}</Tag>
    },
    {
      title: 'Upload Date',
      dataIndex: 'upload_date',
      key: 'upload_date',
      render: date => dayjs(date).format('DD MMM YYYY')
    },
    {
      title: 'Size',
      dataIndex: 'file_size',
      key: 'file_size',
      render: size => `${(size / 1024).toFixed(2)} KB`
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button size="small" type="link" icon={<DownloadOutlined />} href={record.file_url} target="_blank">
            Download
          </Button>
          <Button size="small" type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>
            Delete
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, textAlign: 'right' }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal('document')}>
          Upload Document
        </Button>
      </div>
      <Table 
        columns={columns} 
        dataSource={documents} 
        rowKey="id"
        size="small"
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
}

// Billing Tab
export function BillingTab({ billingSummary, transactions }) {
  const columns = [
    {
      title: 'Date',
      dataIndex: 'transaction_date',
      key: 'transaction_date',
      render: date => dayjs(date).format('DD MMM YYYY')
    },
    {
      title: 'Type',
      dataIndex: 'transaction_type',
      key: 'transaction_type',
      render: type => <Tag>{type}</Tag>
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: 'Debit',
      dataIndex: 'debit',
      key: 'debit',
      render: amount => amount > 0 ? `₹${amount}` : '-'
    },
    {
      title: 'Credit',
      dataIndex: 'credit',
      key: 'credit',
      render: amount => amount > 0 ? `₹${amount}` : '-'
    },
    {
      title: 'Balance',
      dataIndex: 'balance',
      key: 'balance',
      render: balance => (
        <span style={{ color: balance > 0 ? '#ff4d4f' : '#52c41a', fontWeight: 600 }}>
          ₹{Math.abs(balance)}
        </span>
      )
    },
    {
      title: 'Payment Mode',
      dataIndex: 'payment_mode',
      key: 'payment_mode',
      render: mode => <Tag>{mode}</Tag>
    }
  ];

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic 
              title="Total Amount" 
              value={billingSummary?.total_amount || 0} 
              prefix="₹"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic 
              title="Paid Amount" 
              value={billingSummary?.paid_amount || 0} 
              prefix="₹"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic 
              title="Due Amount" 
              value={billingSummary?.due_amount || 0} 
              prefix="₹"
              valueStyle={{ color: billingSummary?.due_amount > 0 ? '#ff4d4f' : '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>
      <Table 
        columns={columns} 
        dataSource={transactions} 
        rowKey="id"
        size="small"
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
}

// Communications Tab
export function CommunicationsTab({ communications }) {
  return (
    <Timeline>
      {communications && communications.length > 0 ? (
        communications.map(comm => (
          <Timeline.Item 
            key={comm.id}
            color={comm.status === 'delivered' ? 'green' : comm.status === 'failed' ? 'red' : 'blue'}
          >
            <div style={{ fontSize: '13px' }}>
              <Tag>{comm.communication_type}</Tag>
              <strong>{dayjs(comm.sent_at).format('DD MMM YYYY, hh:mm A')}</strong>
              <div style={{ marginTop: 8, color: '#595959' }}>{comm.message}</div>
              <Tag color={comm.status === 'delivered' ? 'success' : comm.status === 'failed' ? 'error' : 'processing'} style={{ marginTop: 8 }}>
                {comm.status}
              </Tag>
            </div>
          </Timeline.Item>
        ))
      ) : (
        <Empty description="No communications logged" />
      )}
    </Timeline>
  );
}

// Consents Tab
export function ConsentsTab({ consents, openModal }) {
  const columns = [
    {
      title: 'Consent Title',
      dataIndex: 'consent_title',
      key: 'consent_title'
    },
    {
      title: 'Type',
      dataIndex: 'consent_type',
      key: 'consent_type',
      render: type => <Tag>{type}</Tag>
    },
    {
      title: 'Date',
      dataIndex: 'consent_date',
      key: 'consent_date',
      render: date => date ? dayjs(date).format('DD MMM YYYY') : 'N/A'
    },
    {
      title: 'Status',
      dataIndex: 'agreed',
      key: 'agreed',
      render: agreed => (
        <Tag color={agreed ? 'success' : 'default'}>
          {agreed ? 'Agreed' : 'Pending'}
        </Tag>
      )
    },
    {
      title: 'Witness',
      dataIndex: 'witness_name',
      key: 'witness_name'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: () => (
        <Button size="small" type="link">View</Button>
      )
    }
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, textAlign: 'right' }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal('consent')}>
          Add Consent
        </Button>
      </div>
      <Table 
        columns={columns} 
        dataSource={consents} 
        rowKey="id"
        size="small"
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
}
