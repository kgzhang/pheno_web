import React from 'react'
import { Outlet } from 'react-router-dom'

const BlankLayout: React.FC = () => {
  return (
    <div>
      <Outlet />
    </div>
  )
}

export default BlankLayout
