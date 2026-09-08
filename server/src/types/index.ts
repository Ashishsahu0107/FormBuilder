export interface JwtPayload {
  id: string
  email: string
  role: string
  name: string
}

export interface PaginationQuery {
  page?: number
  limit?: number
}
