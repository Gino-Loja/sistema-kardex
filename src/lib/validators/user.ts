import { z } from 'zod'

export const userListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z.enum(['all', 'active', 'banned']).optional()
})

export const userCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['admin', 'bodeguero'], {
    message: 'Role must be either admin or bodeguero'
  })
})

export const userUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name is too long').optional(),
  email: z.string().email('Invalid email address').optional(),
  role: z.enum(['admin', 'bodeguero'], {
    message: 'Role must be either admin or bodeguero'
  }).optional(),
  banned: z.boolean().optional(),
  banReason: z.string().optional()
})

export type UserListQuery = z.infer<typeof userListQuerySchema>
export type UserCreateInput = z.infer<typeof userCreateSchema>
export type UserUpdateInput = z.infer<typeof userUpdateSchema>
