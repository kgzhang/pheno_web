import React from 'react'
import { Button } from '@/components/ui/button'
import { Book } from 'lucide-react'
interface RefsSidebarProps {
  isOpen?: boolean
  onClose?: () => void
  references?: any[]
}

const RefsSidebar: React.FC<RefsSidebarProps> = ({ isOpen = false, onClose, references = [] }) => {
  return (
    <div className={`refs-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <h3>参考资料</h3>
        <Button variant="ghost" onClick={onClose}>
          关闭
        </Button>
      </div>
      <div className="sidebar-content">
        {references.map((ref, index) => (
          <div key={index} className="ref-item">
            <Book className="h-4 w-4" />
            <div className="ref-details">
              <div className="ref-title">{ref.title}</div>
              <div className="ref-source">{ref.source}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default RefsSidebar
