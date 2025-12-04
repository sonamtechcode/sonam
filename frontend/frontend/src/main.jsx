import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { ConfigProvider } from 'antd'
import { PermissionsProvider } from './hooks/usePermissions.jsx'
import App from './App'
import ErrorBoundary from './ErrorBoundary'
import 'antd/dist/reset.css'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
})

console.log('🚀 Starting React App...');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ConfigProvider
        theme={{
        token: {
          colorPrimary: '#1890ff',
          fontSize: 13,
          borderRadius: 6,
          colorBgContainer: '#ffffff',
          colorBorder: '#e8e8e8',
        },
        components: {
          Button: {
            controlHeight: 32,
            fontSize: 13,
            borderRadius: 6,
          },
          Input: {
            controlHeight: 36,
            fontSize: 13,
            borderRadius: 6,
          },
          Table: {
            fontSize: 13,
            cellPaddingBlock: 12,
            cellPaddingInline: 16,
          },
        },
      }}
      >
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <PermissionsProvider>
            <App />
            <Toaster position="top-right" toastOptions={{ style: { fontSize: '16px' } }} />
          </PermissionsProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ConfigProvider>
    </ErrorBoundary>
  </React.StrictMode>
)
