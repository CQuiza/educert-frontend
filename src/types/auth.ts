export interface Token {
  access_token: string
  refresh_token?: string | null
  token_type: string
}

export interface TokenPayload {
  sub: string
  exp?: number
}

export interface LoginRequest {
  username: string
  password: string
}
