export type Image = {
  name: string
  data: string
  thumbnail: string // API return value
  id?: number // API return value
  item_id?: number // API return value
}

export type Item = {
  id: number
  text: string
  created_time: number
  updated_time?: number
  images?: Image[]
  owner_id?: number
  deleted_at?: number | null
}

export type User = {
  id: number
  name: string
  total_items: number
  created_time: number
  token: string
}

export type LocalItem = {
  id: number // timestamp
  text: string
  images: Image[] // Image with data of type base64 or data url
  created_time: number
  updated_time?: number
}

export type LocalItemStr = {
  id: number // timestamp
  text: string
  images: string[] // raw string from localStorage
  created_time: number
  updated_time?: number
}

export type LoginResponse = {
  access_token: string
  token_type: string
}
