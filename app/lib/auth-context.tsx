'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import axios from 'axios'

interface User {
  id: number
  email: string
  role: string
  full_name?: string
  can_create_records?: boolean
  can_create_staff?: boolean
  can_edit_records?: boolean
  can_delete_records?: boolean
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const API_URL = process.env.NEXT_PUBLIC_API_URL || ''

const api = axios.create({
  baseURL: API_URL,
})

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    if (err.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.clear()
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token')
      if (storedToken) {
        try {
          setToken(storedToken)
          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`
          const response = await api.get('/health')
          if (response.success || response) {
            setUser({ id: 1, email: 'admin@pticlinic.com', role: 'ADMIN', full_name: 'Admin User' })
          }
        } catch (err) {
          localStorage.removeItem('token')
          setToken(null)
        }
      }
      setIsLoading(false)
    }

    initAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      // Try API
      try {
        const response = await api.post('/api/auth/login', { email, password })
        if (response?.success && response?.token) {
          const newToken = response.token
          localStorage.setItem('token', newToken)
          api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
          setToken(newToken)
          setUser(response.user || { id: 1, email, role: 'ADMIN', full_name: email })
          return
        }
      } catch (apiError: any) {
        console.log('[v0] API login error:', apiError?.response?.data?.error || apiError.message)
        throw new Error(apiError?.response?.data?.error || 'Login failed')
      }
    } catch (error: any) {
      throw error || new Error('Login failed')
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    delete api.defaults.headers.common['Authorization']
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        isAuthenticated: !!token && !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const apiClient = api
