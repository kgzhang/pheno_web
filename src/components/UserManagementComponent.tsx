import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { useUserStore } from '@/stores/userStore'
import { toast } from '@/utils/toast'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import './UserManagementComponent.less'

const userSchema = z.object({
  username: z.string().min(1, '请输入用户名'),
  password: z.string().optional(),
  role: z.string().min(1, '请选择角色')
})

const UserManagementComponent: React.FC = () => {
  const { getUsers, createUser, updateUser, deleteUser, isSuperAdmin } = useUserStore()
  const [users, setUsers] = useState<any[]>([])
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingUser, setEditingUser] = useState<any | null>(null)

  const form = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: '',
      password: '',
      role: 'user'
    }
  })

  const fetchUsers = async () => {
    try {
      const data = await getUsers()
      setUsers(data.users)
    } catch (error: any) {
      toast.error(error.message || '获取用户列表失败')
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleAddUser = () => {
    setEditingUser(null)
    form.reset()
    setIsModalVisible(true)
  }

  const handleEditUser = (user: any) => {
    setEditingUser(user)
    form.reset({
      username: user.username,
      password: '',
      role: user.role
    })
    setIsModalVisible(true)
  }

  const handleDeleteUser = async (userId: number) => {
    try {
      await deleteUser(userId)
      toast.success('删除成功')
      fetchUsers()
    } catch (error: any) {
      toast.error(error.message || '删除失败')
    }
  }

  const handleSubmit = async (values: z.infer<typeof userSchema>) => {
    try {
      if (editingUser) {
        await updateUser(editingUser.id, values)
        toast.success('更新成功')
      } else {
        await createUser(values)
        toast.success('创建成功')
      }
      setIsModalVisible(false)
      fetchUsers()
    } catch (error: any) {
      toast.error(error.message || '操作失败')
    }
  }

  return (
    <div className="user-management-container">
      <h3>用户管理</h3>
      <Button onClick={handleAddUser} className="mb-4">
        添加用户
      </Button>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>用户名</TableHead>
            <TableHead>角色</TableHead>
            <TableHead>操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.id}</TableCell>
              <TableCell>{user.username}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)}>
                    编辑
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={() => {
                      if (confirm('确定删除吗?')) {
                        handleDeleteUser(user.id)
                      }
                    }}
                  >
                    删除
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={isModalVisible} onOpenChange={setIsModalVisible}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUser ? '编辑用户' : '添加用户'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>用户名</FormLabel>
                    <FormControl>
                      <Input placeholder="请输入用户名" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>密码</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder={editingUser ? '留空则不修改' : '请输入密码'}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>角色</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="请选择角色" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        {isSuperAdmin() && <SelectItem value="superadmin">SuperAdmin</SelectItem>}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsModalVisible(false)}>
                  取消
                </Button>
                <Button type="submit">{editingUser ? '更新' : '创建'}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default UserManagementComponent
