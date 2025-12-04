import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Input, Button, Card, Row, Col, Steps, message, Divider } from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import api from '../services/api';
import toast from 'react-hot-toast';

const { Step } = Steps;

export default function ClinicAdd() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const isEdit = !!id;

  useEffect(() => {
    if (isEdit) {
      fetchClinic();
    }
  }, [id]);

  const fetchClinic = async () => {
    try {
      const response = await api.get(`/hospitals/${id}`);
      const clinic = response.data.data;
      form.setFieldsValue({
        ...clinic,
        ...clinic.settings
      });
    } catch (error) {
      toast.error('Failed to fetch clinic details');
    }
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      if (isEdit) {
        await api.put(`/hospitals/${id}`, values);
        toast.success('Clinic updated successfully');
      } else {
        const response = await api.post('/hospitals', values);
        toast.success('Clinic created successfully!');
        
        // Show credentials
        const { admin_email, admin_password } = response.data.data;
        message.success({
          content: (
            <div>
              <div><strong>Clinic Created!</strong></div>
              <div>Admin Email: {admin_email}</div>
              <div>Password: {admin_password}</div>
              <div style={{ marginTop: 8, fontSize: '11px', color: '#8c8c8c' }}>
                Please save these credentials
              </div>
            </div>
          ),
          duration: 10
        });
      }

      navigate('/clinics');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save clinic');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    {
      title: 'Basic Info',
      content: (
        <>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Clinic Name"
                rules={[{ required: true, message: 'Please enter clinic name' }]}
              >
                <Input placeholder="e.g., City Dental Clinic" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="registration_no"
                label="Registration Number"
                rules={[{ required: true, message: 'Please enter registration number' }]}
              >
                <Input placeholder="e.g., REG002" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="Phone"
                rules={[{ required: true, message: 'Please enter phone number' }]}
              >
                <Input placeholder="e.g., 022-12345678" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Please enter email' },
                  { type: 'email', message: 'Please enter valid email' }
                ]}
              >
                <Input placeholder="e.g., info@clinic.com" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="address"
            label="Address"
            rules={[{ required: true, message: 'Please enter address' }]}
          >
            <Input.TextArea rows={2} placeholder="Full address" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="city"
                label="City"
                rules={[{ required: true, message: 'Please enter city' }]}
              >
                <Input placeholder="e.g., Mumbai" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="state"
                label="State"
                rules={[{ required: true, message: 'Please enter state' }]}
              >
                <Input placeholder="e.g., Maharashtra" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="pincode"
                label="Pincode"
                rules={[{ required: true, message: 'Please enter pincode' }]}
              >
                <Input placeholder="e.g., 400001" />
              </Form.Item>
            </Col>
          </Row>
        </>
      )
    },
    {
      title: 'Admin User',
      content: (
        <>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="admin_name"
                label="Admin Name"
                rules={[{ required: !isEdit, message: 'Please enter admin name' }]}
              >
                <Input placeholder="e.g., Dr. Rajesh Kumar" disabled={isEdit} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="admin_phone"
                label="Admin Phone"
                rules={[{ required: !isEdit, message: 'Please enter admin phone' }]}
              >
                <Input placeholder="e.g., 9876543210" disabled={isEdit} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="admin_email"
                label="Admin Email"
                rules={[
                  { required: !isEdit, message: 'Please enter admin email' },
                  { type: 'email', message: 'Please enter valid email' }
                ]}
              >
                <Input placeholder="e.g., admin@clinic.com" disabled={isEdit} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="admin_password"
                label="Admin Password"
                extra={isEdit ? "Cannot change password here" : "Leave blank for default: admin123"}
              >
                <Input.Password placeholder="Default: admin123" disabled={isEdit} />
              </Form.Item>
            </Col>
          </Row>

          {isEdit && (
            <div style={{ padding: '12px', background: '#f0f0f0', borderRadius: '8px', fontSize: '12px' }}>
              <strong>Note:</strong> Admin user details cannot be changed here. 
              Please go to Users section to manage admin account.
            </div>
          )}
        </>
      )
    },
    {
      title: 'Branding',
      content: (
        <>
          <Form.Item
            name="logo_url"
            label="Logo URL"
            extra="Enter the URL of your clinic logo"
          >
            <Input placeholder="https://example.com/logo.png" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="primary_color"
                label="Primary Color"
                extra="Main brand color (hex code)"
              >
                <Input placeholder="#3b82f6" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="secondary_color"
                label="Secondary Color"
                extra="Secondary brand color (hex code)"
              >
                <Input placeholder="#1d4ed8" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="header_text"
            label="Header Text"
            extra="Welcome message or tagline"
          >
            <Input placeholder="e.g., Welcome to City Dental Clinic" />
          </Form.Item>

          <Form.Item
            name="footer_text"
            label="Footer Text"
            extra="Footer message or copyright"
          >
            <Input.TextArea rows={2} placeholder="e.g., Quality Dental Care Since 2020" />
          </Form.Item>
        </>
      )
    }
  ];

  return (
    <div style={{ padding: '6px' }}>
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/clinics')} />
            <span>{isEdit ? 'Edit Clinic' : 'Add New Clinic'}</span>
          </div>
        }
        style={{ borderRadius: '12px' }}
      >
        <Steps current={currentStep} style={{ marginBottom: 32 }}>
          {steps.map(item => (
            <Step key={item.title} title={item.title} />
          ))}
        </Steps>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            primary_color: '#3b82f6',
            secondary_color: '#1d4ed8'
          }}
        >
          <div style={{ minHeight: '400px' }}>
            {steps[currentStep].content}
          </div>

          <Divider />

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              {currentStep > 0 && (
                <Button onClick={() => setCurrentStep(currentStep - 1)}>
                  Previous
                </Button>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button onClick={() => navigate('/clinics')}>
                Cancel
              </Button>
              {currentStep < steps.length - 1 && (
                <Button type="primary" onClick={() => setCurrentStep(currentStep + 1)}>
                  Next
                </Button>
              )}
              {currentStep === steps.length - 1 && (
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  icon={<SaveOutlined />}
                >
                  {isEdit ? 'Update Clinic' : 'Create Clinic'}
                </Button>
              )}
            </div>
          </div>
        </Form>
      </Card>
    </div>
  );
}
