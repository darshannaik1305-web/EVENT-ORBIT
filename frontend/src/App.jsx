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
            background: '#FFFFFF',
            color: '#202020',
            border: '1px solid #E5E1DC',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
            borderRadius: '12px',
            padding: '12px 20px',
            fontSize: '0.875rem',
            fontWeight: '600',
          },
          success: {
            iconTheme: {
              primary: '#287A4B',
              secondary: '#FFFFFF',
            },
          },
          error: {
            iconTheme: {
              primary: '#B42318',
              secondary: '#FFFFFF',
            },
          },
        }}
      />
    </AuthProvider>
  )
}
