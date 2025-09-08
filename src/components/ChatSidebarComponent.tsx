import React from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { PanelLeftClose, MessageSquarePlus, MoreHorizontal, Edit, Trash2 } from 'lucide-react'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import relativeTime from 'dayjs/plugin/relativeTime'
import { confirm } from '@/utils/confirm'
import './ChatSidebarComponent.less'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

interface ChatSidebarComponentProps {
  currentChatId: string | null
  chatsList: any[]
  isSidebarOpen: boolean
  agents: any
  selectedAgentId: string | null
  onCreateChat: () => void
  onSelectChat: (chatId: string) => void
  onDeleteChat: (chatId: string) => void
  onRenameChat: (data: { chatId: string; title: string }) => void
  onToggleSidebar: () => void
  onOpenAgentModal: () => void
}

const ChatSidebarComponent: React.FC<ChatSidebarComponentProps> = (props) => {
  const {
    currentChatId,
    chatsList,
    isSidebarOpen,
    agents,
    selectedAgentId,
    onCreateChat,
    onSelectChat,
    onDeleteChat,
    onRenameChat,
    onToggleSidebar,
    onOpenAgentModal
  } = props

  const selectedAgentName = selectedAgentId ? agents[selectedAgentId]?.name : ''

  const groupedChats = React.useMemo(() => {
    const groups: Record<string, any[]> = { 今天: [], 七天内: [], 三十天内: [] }
    const sortedChats = [...chatsList].sort((a, b) => dayjs(b.create_at).diff(dayjs(a.create_at)))
    sortedChats.forEach((chat) => {
      const chatDate = dayjs(chat.create_at)
      if (chatDate.isAfter(dayjs().startOf('day'))) groups['今天'].push(chat)
      else if (chatDate.isAfter(dayjs().subtract(7, 'day'))) groups['七天内'].push(chat)
      else if (chatDate.isAfter(dayjs().subtract(30, 'day'))) groups['三十天内'].push(chat)
      else {
        const monthKey = chatDate.format('YYYY-MM')
        if (!groups[monthKey]) groups[monthKey] = []
        groups[monthKey].push(chat)
      }
    })
    return Object.fromEntries(Object.entries(groups).filter(([, value]) => value.length > 0))
  }, [chatsList])

  const handleRename = async (chatId: string) => {
    const chat = chatsList.find((c) => c.id === chatId)
    if (!chat) return

    const result = await confirm({
      title: '重命名对话',
      content: `请输入新的对话标题: ${chat.title}`
    })

    if (result) {
      const newTitle = prompt('请输入新的对话标题:', chat.title)
      if (newTitle && newTitle.trim()) {
        onRenameChat({ chatId, title: newTitle.trim() })
      }
    }
  }

  return (
    <div className={`chat-sidebar ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      <div className="sidebar-header">
        <div className="header-title" onClick={onOpenAgentModal}>
          {selectedAgentName || '选择智能体'}
        </div>
        <Button variant="ghost" size="icon" onClick={onToggleSidebar}>
          <PanelLeftClose className="h-4 w-4" />
        </Button>
      </div>
      <div className="conversation-list-top">
        <Button onClick={onCreateChat}>
          <MessageSquarePlus className="h-4 w-4 mr-2" />
          创建新对话
        </Button>
      </div>
      <div className="conversation-list">
        {Object.entries(groupedChats).map(([groupName, group]) => (
          <div key={groupName} className="chat-group">
            <div className="chat-group-title">{groupName}</div>
            {group.map((chat) => (
              <div
                key={chat.id}
                className={`conversation-item ${currentChatId === chat.id ? 'active' : ''}`}
                onClick={() => onSelectChat(chat.id)}
              >
                <div className="conversation-title">{chat.title || '新的对话'}</div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleRename(chat.id)}>
                      <Edit className="h-4 w-4 mr-2" />
                      重命名
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDeleteChat(chat.id)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      删除
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default ChatSidebarComponent
