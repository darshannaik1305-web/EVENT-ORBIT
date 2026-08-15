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
        position="top-center"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#12182B',
            color: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
            borderRadius: '1rem',
            padding: '12px 20px',
            fontSize: '0.875rem',
            fontWeight: '600',
          },
        }}
      />
    </AuthProvider>
  )
}
