import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { message } from '@/utils/toast'
import { agentApi } from '@/apis/agent_api'
import { modelIcons } from '@/utils/modelIcon'
const ModelProvidersComponent: React.FC = () => {
  const [providers, setProviders] = useState<any>({})
  const [loading, setLoading] = useState(false)

  const fetchModels = async () => {
    setLoading(true)
    try {
      const data = await agentApi.getProviderModels('')
      setProviders(data.providers)
    } catch (error: any) {
      message.error(error.message || '获取模型列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchModels()
  }, [])

  const handleUpdate = async (provider: string, models: string[]) => {
    try {
      await agentApi.updateProviderModels(provider, models)
      message.success('更新成功')
      fetchModels()
    } catch (error: any) {
      message.error(error.message || '更新失败')
    }
  }

  const providerList = Object.values(providers)

  return (
    <div className="model-providers-container">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Provider</TableHead>
            <TableHead>Enabled Models</TableHead>
            <TableHead>Available Models</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {providerList.map((provider: any) => (
            <TableRow key={provider.provider}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <img
                    src={modelIcons[provider.provider] || modelIcons.default}
                    alt={provider.provider}
                    className="provider-icon h-6 w-6"
                  />
                  {provider.provider}
                </div>
              </TableCell>
              <TableCell>{provider.enabled_models?.join(', ') || 'None'}</TableCell>
              <TableCell>{provider.available_models?.join(', ') || 'None'}</TableCell>
              <TableCell>
                <Button
                  onClick={() => handleUpdate(provider.provider, provider.available_models || [])}
                  variant="outline"
                  size="sm"
                >
                  Enable All
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {loading && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  )
}

export default ModelProvidersComponent
