import { createLoader, parseAsInteger, parseAsString } from 'nuqs/server'

export const usersSearchParams = {
  page: parseAsInteger.withDefault(1),
  pageSize: parseAsInteger.withDefault(20),
  search: parseAsString,
  status: parseAsString
} as const

export const loadUsersSearchParams = createLoader(usersSearchParams)
