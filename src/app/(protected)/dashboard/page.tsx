'use client'
import { useUser } from '@clerk/nextjs'
import React from 'react'

const DashboardPage = () => {
    const {user} = useUser()

  return (
    <div>Dashboard Page {user?.firstName}</div>
  )
}

export default DashboardPage