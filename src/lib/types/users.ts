export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'bodeguero'
  banned: boolean
  banReason: string | null
  banExpires: Date | null
  emailVerified: boolean
  createdAt: Date
  updatedAt: Date
  image: string | null
}

export interface UserListFilters {
  page?: number
  pageSize?: number
  search?: string
  status?: 'all' | 'active' | 'banned'
}

export interface UserListResult {
  users: User[]
  total: number
  page: number
  pageSize: number
}

export interface UserCreateInput {
  name: string
  email: string
  password: string
  role: 'admin' | 'bodeguero'
}

export interface UserUpdateInput {
  name?: string
  email?: string
  role?: 'admin' | 'bodeguero'
  banned?: boolean
  banReason?: string
}
