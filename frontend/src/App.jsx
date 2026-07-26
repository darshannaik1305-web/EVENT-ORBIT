import React from 'react'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/context/AuthContext'
import AuthInitializer from '@/components/auth/AuthInitializer'
import AppRoutes from '@/routes/AppRoutes'

export default function App() {
  return (
    <AuthProvider>
      <AuthInitializer>
        <AppRoutes />
      </AuthInitializer>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#0f172a',
            color: '#f8fafc',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
        }}
      />
    </AuthProvider>
  )
}
