"use client"
import React from 'react'
import { Button } from '../ui/button'
import { apiInstance } from '@/lib/config/axios'
import { toast } from 'sonner'

const LogoutButton = () => {
  const handleLogout = async () => {
    try {
      const response = await apiInstance.post('/users/logout');
      if(response.status === 200){
        console.log('User logged out successfully')
        toast.success('User logged out successfully')
      }
    } catch (error) {
      console.error('Error occurred while logging out:', error)
      toast.error('Error occurred while logging out')
    }
  }
  return (
    <Button onClick={handleLogout}>
      Logout
    </Button>
  )
}

export default LogoutButton