import { createId } from '@/utils/id'

export interface CrudRepository<T extends { id: string }> {
  list(): Promise<T[]>
  get(id: string): Promise<T | undefined>
  create(payload: Omit<T, 'id'>): Promise<T>
  update(id: string, payload: Partial<T>): Promise<T>
  remove(id: string): Promise<void>
}

export const createMemoryRepository = <T extends { id: string }>(
  prefix: string,
  seed: T[],
): CrudRepository<T> => {
  let items = [...seed]

  return {
    async list() {
      return [...items]
    },
    async get(id) {
      return items.find((item) => item.id === id)
    },
    async create(payload) {
      const item = { ...payload, id: createId(prefix) } as T
      items = [item, ...items]
      return item
    },
    async update(id, payload) {
      const item = items.find((entry) => entry.id === id)
      if (!item) throw new Error('Record not found')
      const updated = { ...item, ...payload }
      items = items.map((entry) => (entry.id === id ? updated : entry))
      return updated
    },
    async remove(id) {
      items = items.filter((item) => item.id !== id)
    },
  }
}
