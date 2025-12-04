// Backup of original main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'

// Simple test to verify React is working
const TestApp = () => {
  return (
    <div style={{ 
      padding: '40px', 
      fontFamily: 'Arial', 
      backgroundColor: '#f0f0f0',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#1890ff' }}>✅ React is Working!</h1>
      <p>If you see this, React is rendering correctly.</p>
      <p>Server: Running on port 3000</p>
      <p>Time: {new Date().toLocaleString()}</p>
    </div>
  )
}

console.log('🚀 Starting React App...');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <TestApp />
  </React.StrictMode>
)
