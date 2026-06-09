import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

interface CrudService<T, TCreate, TUpdate> {
  list: (params?: Record<string, unknown>) => Promise<T[]>
  getById: (id: number) => Promise<T>
  create: (payload: TCreate) => Promise<T>
  update: (id: number, payload: TUpdate) => Promise<T>
  remove: (id: number) => Promise<void>
}

export function createCrudHooks<T, TCreate, TUpdate>(config: {
  queryKey: string
  service: CrudService<T, TCreate, TUpdate>
}) {
  const QUERY_KEY = [config.queryKey]

  function useList(params?: Record<string, unknown>, options?: { enabled?: boolean }) {
    return useQuery({
      queryKey: [...QUERY_KEY, params],
      queryFn: () => config.service.list(params),
      ...options,
    })
  }

  function useById(id: number) {
    return useQuery({
      queryKey: [...QUERY_KEY, id],
      queryFn: () => config.service.getById(id),
      enabled: id > 0,
    })
  }

  function useCreate() {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: (data: TCreate) => config.service.create(data),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
    })
  }

  function useUpdate(id: number) {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: (data: TUpdate) => config.service.update(id, data),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
    })
  }

  function useRemove() {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: (id: number) => config.service.remove(id),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
    })
  }

  return { useList, useById, useCreate, useUpdate, useRemove }
}
