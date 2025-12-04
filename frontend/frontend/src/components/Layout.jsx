import { Outlet } from 'react-router-dom'
import SidebarNew from './SidebarNew'
import Header from './Header'

export default function Layout() {
  return (
    <div className="flex h-screen bg-gray-50">
      <SidebarNew />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
