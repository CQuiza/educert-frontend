import api from './api'

export interface CrudConfig {
  basePath: string
}

export function createCrudService<T, TCreate = T, TUpdate = T>(config: CrudConfig) {
  return {
    list: async (params?: Record<string, unknown>): Promise<T[]> => {
      const { data } = await api.get<T[]>(config.basePath, { params })
      return data
    },
    getById: async (id: number): Promise<T> => {
      const { data } = await api.get<T>(`${config.basePath}/${id}`)
      return data
    },
    create: async (payload: TCreate): Promise<T> => {
      const { data } = await api.post<T>(config.basePath, payload)
      return data
    },
    update: async (id: number, payload: TUpdate): Promise<T> => {
      const { data } = await api.patch<T>(`${config.basePath}/${id}`, payload)
      return data
    },
    remove: async (id: number): Promise<void> => {
      await api.delete(`${config.basePath}/${id}`)
    },
  }
}

export function createReadonlyService<T>(config: CrudConfig) {
  return {
    list: async (params?: Record<string, unknown>): Promise<T[]> => {
      const { data } = await api.get<T[]>(config.basePath, { params })
      return data
    },
  }
}
