export interface ModuleCreate {
  course_id: number
  title: string
  order_index: number
}

export interface ModuleUpdate {
  title?: string
  order_index?: number
}

export interface Module {
  id: number
  course_id: number
  title: string
  order_index: number
}
