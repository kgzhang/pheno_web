import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { message } from '@/utils/toast'

const TestComponent: React.FC = () => {
  const handleClick = () => {
    message.success('按钮点击成功！')
  }

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">组件测试</h2>

      <div className="space-y-2">
        <Label htmlFor="test-input">测试输入框</Label>
        <Input id="test-input" placeholder="请输入内容" />
      </div>

      <div className="space-x-2">
        <Button onClick={handleClick}>主要按钮</Button>
        <Button variant="secondary">次要按钮</Button>
        <Button variant="outline">轮廓按钮</Button>
        <Button variant="destructive">危险按钮</Button>
      </div>

      <div className="space-x-2">
        <Button size="sm">小按钮</Button>
        <Button size="default">默认按钮</Button>
        <Button size="lg">大按钮</Button>
      </div>
    </div>
  )
}

export default TestComponent
