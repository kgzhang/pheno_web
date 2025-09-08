import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Settings, LogOut, User } from 'lucide-react'
import { useUserStore } from '@/stores/userStore'

interface UserInfoComponentProps {
  showButton?: boolean
}

const UserInfoComponent: React.FC<UserInfoComponentProps> = ({ showButton = false }) => {
  const navigate = useNavigate()
  const { username, logout, isLoggedIn } = useUserStore()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (!isLoggedIn()) {
    return showButton ? (
      <Button variant="default" onClick={() => navigate('/login')}>
        登录
      </Button>
    ) : null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground cursor-pointer">
          <User className="h-4 w-4" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex items-center gap-2 p-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <User className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{username}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/setting')}>
          <Settings className="mr-2 h-4 w-4" />
          <span>设置</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>退出登录</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default UserInfoComponent
