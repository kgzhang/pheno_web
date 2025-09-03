import React from 'react'
import { useParams } from 'react-router-dom'
import AgentChatComponent from '@/components/AgentChatComponent'
import UserInfoComponent from '@/components/UserInfoComponent'
import './AgentSingleView.less'

const AgentSingleView: React.FC = () => {
  const { agent_id } = useParams<{ agent_id: string }>()

  return (
    <div className="agent-single-view">
      <AgentChatComponent agentId={agent_id} singleMode={true}>
        <template slot="header-right">
          <UserInfoComponent />
        </template>
      </AgentChatComponent>
    </div>
  )
}

export default AgentSingleView
