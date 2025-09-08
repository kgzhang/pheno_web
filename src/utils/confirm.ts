export const confirm = (options: {
  title?: string
  content?: string | React.ReactNode
  onConfirm?: () => void
}): Promise<boolean> => {
  return new Promise((resolve) => {
    // For React elements, we can't use window.confirm directly
    // We'll use a simple confirm for now, but in a real app you'd want a custom modal
    const message = typeof options.content === 'string' ? options.content : '确定要执行此操作吗？'
    if (window.confirm(message)) {
      resolve(true)
      if (options.onConfirm) {
        options.onConfirm()
      }
    } else {
      resolve(false)
    }
  })
}
