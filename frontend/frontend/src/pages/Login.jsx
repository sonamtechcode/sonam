import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Form, Input, Button, Card, Space } from 'antd'
import { 
  UserOutlined, 
  LockOutlined, 
  MedicineBoxOutlined,
  HeartOutlined,
  ExperimentOutlined,
  MedicineBoxFilled,
  PlusCircleOutlined,
  AlertOutlined
} from '@ant-design/icons'
import toast from 'react-hot-toast'

export default function Login() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [form] = Form.useForm()

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = async (values) => {
    try {
      await login(values.email, values.password)
      toast.success('Login successful!')
      // Force a full page reload to ensure all components re-render with new auth state
      window.location.href = '/'
    } catch (error) {
      toast.error('Invalid credentials')
    }
  }

  // Medical icons for background animation
  const medicalIcons = [
    { Icon: HeartOutlined, delay: 0 },
    { Icon: ExperimentOutlined, delay: 2 },
    { Icon: MedicineBoxFilled, delay: 4 },
    { Icon: PlusCircleOutlined, delay: 1 },
    { Icon: AlertOutlined, delay: 3 },
    { Icon: MedicineBoxOutlined, delay: 5 }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2c3e50] via-[#34495e] to-[#17a2b8] flex items-center justify-center p-2" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Animated Medical Icons Background */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.1; }
          50% { transform: translateY(-20px) rotate(10deg); opacity: 0.3; }
        }
        @keyframes float-reverse {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.1; }
          50% { transform: translateY(20px) rotate(-10deg); opacity: 0.3; }
        }
        .medical-icon {
          position: absolute;
          color: rgba(255, 255, 255, 0.15);
          pointer-events: none;
        }
        .medical-icon:nth-child(odd) {
          animation: float 6s ease-in-out infinite;
        }
        .medical-icon:nth-child(even) {
          animation: float-reverse 8s ease-in-out infinite;
        }
      `}</style>
      
      {/* Medical Icons scattered in background */}
      <HeartOutlined className="medical-icon" style={{ fontSize: '80px', top: '10%', left: '10%', animationDelay: '0s' }} />
      <ExperimentOutlined className="medical-icon" style={{ fontSize: '60px', top: '20%', right: '15%', animationDelay: '2s' }} />
      <MedicineBoxFilled className="medical-icon" style={{ fontSize: '70px', bottom: '15%', left: '8%', animationDelay: '4s' }} />
      <PlusCircleOutlined className="medical-icon" style={{ fontSize: '90px', top: '60%', right: '10%', animationDelay: '1s' }} />
      <AlertOutlined className="medical-icon" style={{ fontSize: '65px', bottom: '25%', right: '20%', animationDelay: '3s' }} />
      <MedicineBoxOutlined className="medical-icon" style={{ fontSize: '75px', top: '40%', left: '5%', animationDelay: '5s' }} />
      <HeartOutlined className="medical-icon" style={{ fontSize: '55px', bottom: '10%', right: '25%', animationDelay: '1.5s' }} />
      <ExperimentOutlined className="medical-icon" style={{ fontSize: '85px', top: '70%', left: '20%', animationDelay: '3.5s' }} />
      
      
      <Card 
        className="w-full max-w-md" 
        style={{ 
          borderRadius: '20px',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(240,253,255,0.95) 100%)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1), inset 0 1px 0 rgba(255,255,255,0.6)',
          border: '1px solid rgba(255,255,255,0.2)',
          transform: 'translateY(0)',
          transition: 'all 0.3s ease'
        }}
      >
        <Space direction="vertical" size="large" className="w-full" style={{ display: 'flex' }}>
          <div className="text-center">
            <div 
              className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4"
              style={{
                background: 'linear-gradient(135deg, #00bcd4 0%, #17a2b8 100%)',
                boxShadow: '0 8px 20px rgba(0,188,212,0.3), inset 0 1px 0 rgba(255,255,255,0.3)'
              }}
            >
              <MedicineBoxOutlined style={{ fontSize: '40px', color: '#ffffff' }} />
            </div>
            <h2 level={2} style={{ marginBottom: 2, color: '#2c3e50' }}>HealthHub Management</h2>
            <h6 type="secondary" style={{ fontSize: '14px', color: '#34495e' }}>Sign in to your account</h6>
          </div>

          <Form
            form={form}
            name="login"
            onFinish={handleSubmit}
            layout="vertical"
            size="medium"
            // initialValues={{ email: 'info@gmail.com', password: 'admin123' }}
            style={{margin: "-19px 0 0 0px"}}
          >
            <Form.Item
              label={<span style={{ fontSize: '16px' }}>Email Address</span>}
              name="email"
              rules={[
                { required: true, message: 'Please input your email!' },
                { type: 'email', message: 'Please enter a valid email!' }
              ]}
            >
              <Input 
                prefix={<UserOutlined />} 
                placeholder="Solvixo@gmail.com"
                style={{ fontSize: '16px' }}
              />
            </Form.Item>

            <Form.Item
              label={<span style={{ fontSize: '16px' }}>Password</span>}
              name="password"
              rules={[{ required: true, message: 'Please input your password!' }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="••••••••"
                style={{ fontSize: '16px' }}
              />
            </Form.Item>

            <div style={{ textAlign: 'right', marginBottom: '10px' }}>
              <Link to="/forgot-password" style={{ color: '#00bcd4', fontSize: '14px' }}>
                Forgot Password?
              </Link>
            </div>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                block 
                size="large" 
                style={{ 
                  height: '48px', 
                  fontSize: '18px', 
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #00bcd4 0%, #17a2b8 100%)',
                  border: 'none',
                  boxShadow: '0 4px 15px rgba(0,188,212,0.4)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,188,212,0.5)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,188,212,0.4)'
                }}
              >
                Sign In
              </Button>
            </Form.Item>
          </Form>

         
        </Space>
      </Card>
    </div>
  )
}
