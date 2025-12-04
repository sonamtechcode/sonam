import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Form, Input, Button, Card, Typography, Space } from 'antd'
import { UserOutlined, LockOutlined, MedicineBoxOutlined } from '@ant-design/icons'
import toast from 'react-hot-toast'

const { Title, Text } = Typography

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
      navigate('/')
    } catch (error) {
      toast.error('Invalid credentials')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl" style={{ borderRadius: '16px' }}>
        <Space direction="vertical" size="large" className="w-full" style={{ display: 'flex' }}>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4">
              <MedicineBoxOutlined style={{ fontSize: '40px', color: '#3b82f6' }} />
            </div>
            <Title level={2} style={{ marginBottom: 8 }}>Hospital Management</Title>
            <Text type="secondary" style={{ fontSize: '16px' }}>Sign in to your account</Text>
          </div>

          <Form
            form={form}
            name="login"
            onFinish={handleSubmit}
            layout="vertical"
            size="large"
            initialValues={{ email: 'sonamwork73@gmail.com', password: 'admin123' }}
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

            <div style={{ textAlign: 'right', marginBottom: '16px' }}>
              <Link to="/forgot-password" style={{ color: '#3b82f6', fontSize: '14px' }}>
                Forgot Password?
              </Link>
            </div>

            <Form.Item>
              <Button type="primary" htmlType="submit" block size="large" style={{ height: '48px', fontSize: '18px', fontWeight: 600 }}>
                Sign In
              </Button>
            </Form.Item>
          </Form>

         
        </Space>
      </Card>
    </div>
  )
}
