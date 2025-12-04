import { Avatar } from 'antd'

// Generate avatar color based on name
const getAvatarColor = (name) => {
  const colors = ['#f56a00', '#7265e6', '#ffbf00', '#00a2ae', '#87d068', '#ff85c0']
  const index = name.charCodeAt(0) % colors.length
  return colors[index]
}

export default function AvatarColumn({ name, subtitle }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <Avatar 
        size={40} 
        style={{ 
          backgroundColor: getAvatarColor(name),
          fontSize: '14px',
          fontWeight: 600
        }}
      >
        {name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
      </Avatar>
      <div>
        <div style={{ color: '#333', fontWeight: 500, fontSize: '13px' }}>{name}</div>
        {subtitle && <div style={{ color: '#999', fontSize: '12px' }}>{subtitle}</div>}
      </div>
    </div>
  )
}
