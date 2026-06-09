import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../organisms/Sidebar'
import { Menu } from 'lucide-react'

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-neutral-50">
      <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex flex-1 flex-col overflow-y-auto">
        <div className="sticky top-0 z-20 flex items-center gap-3 border-b border-neutral-200 bg-white px-4 py-1 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="rounded-lg p-1.5 text-neutral-600 hover:bg-neutral-100 transition-colors">
            <Menu className="h-6 w-6" />
          </button>
          <img src="/logo.png" alt="EduCert" className="h-14 w-60 object-contain" />
        </div>
        <Outlet />
      </main>

      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  )
}
