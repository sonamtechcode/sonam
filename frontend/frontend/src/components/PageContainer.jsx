import { Card } from 'antd'

export default function PageContainer({ children }) {
  return (
    <div style={{ padding: '20px', background: '#f5f5f5', minHeight: '100vh' }}>
      <Card bordered={false} style={{ marginBottom: 0 }}>
        {children}
      </Card>
    </div>
  )
}
