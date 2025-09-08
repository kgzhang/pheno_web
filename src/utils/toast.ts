import { toast as shadcnToast } from '@/components/ui/use-toast'

export const message = {
  success: (content: string) => {
    shadcnToast({
      title: '成功',
      description: content,
      variant: 'default'
    })
  },
  error: (content: string) => {
    shadcnToast({
      title: '错误',
      description: content,
      variant: 'destructive'
    })
  },
  info: (content: string) => {
    shadcnToast({
      title: '信息',
      description: content,
      variant: 'default'
    })
  },
  warning: (content: string) => {
    shadcnToast({
      title: '警告',
      description: content,
      variant: 'default'
    })
  },
  loading: (content: string) => {
    shadcnToast({
      title: '加载中',
      description: content,
      variant: 'default'
    })
  }
}

export const notification = {
  success: (config: { message: string; description?: string }) => {
    shadcnToast({
      title: config.message,
      description: config.description,
      variant: 'default'
    })
  },
  error: (config: { message: string; description?: string }) => {
    shadcnToast({
      title: config.message,
      description: config.description,
      variant: 'destructive'
    })
  },
  info: (config: { message: string; description?: string }) => {
    shadcnToast({
      title: config.message,
      description: config.description,
      variant: 'default'
    })
  },
  warning: (config: { message: string; description?: string }) => {
    shadcnToast({
      title: config.message,
      description: config.description,
      variant: 'default'
    })
  }
}

export const toast = {
  success: (message: string) => shadcnToast({ title: '成功', description: message }),
  error: (message: string) =>
    shadcnToast({ title: '错误', description: message, variant: 'destructive' }),
  info: (message: string) => shadcnToast({ title: '信息', description: message }),
  warning: (message: string) => shadcnToast({ title: '警告', description: message }),
  loading: (message: string) => shadcnToast({ title: '加载中', description: message })
}
