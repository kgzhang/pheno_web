import React from 'react'
import { useParams } from 'react-router-dom'
import AgentChatComponent from '@/components/AgentChatComponent'
import UserInfoComponent from '@/components/UserInfoComponent'

const AgentSingleView: React.FC = () => {
  const { agentId } = useParams<{ agentId: string }>()

  return (
    <div className="flex flex-col h-screen">
      <AgentChatComponent agentId={agentId} singleMode={true}>
        <div slot="header-right">
          <UserInfoComponent />
        </div>
      </AgentChatComponent>
    </div>
  )
}

export default AgentSingleView
