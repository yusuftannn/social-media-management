import { createId } from '@/utils/id'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  type DocumentData,
  type Firestore,
  type UpdateData,
} from 'firebase/firestore'

export interface CrudRepository<T extends { id: string }> {
  list(): Promise<T[]>
  get(id: string): Promise<T | undefined>
  create(payload: Omit<T, 'id'>): Promise<T>
  update(id: string, payload: Partial<T>): Promise<T>
  remove(id: string): Promise<void>
}

const withId = <T extends { id: string }>(id: string, data: Record<string, unknown>): T => ({
  id,
  ...data,
}) as T

const withCreatedAt = <T extends Record<string, unknown>>(payload: T): T => {
  if ('createdAt' in payload && typeof payload.createdAt === 'string' && payload.createdAt) {
    return payload
  }

  return { ...payload, createdAt: new Date().toISOString() } as T
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
      const item = withCreatedAt({ ...payload, id: createId(prefix) } as Record<string, unknown>) as T
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

export const createFirestoreRepository = <T extends { id: string }>(
  db: Firestore,
  collectionName: string,
): CrudRepository<T> => {
  const collectionRef = collection(db, collectionName)

  return {
    async list() {
      const snapshot = await getDocs(query(collectionRef, orderBy('createdAt', 'desc')))
      return snapshot.docs.map((entry) => withId(entry.id, entry.data()))
    },
    async get(id) {
      const snapshot = await getDoc(doc(db, collectionName, id))
      if (!snapshot.exists()) return undefined
      return withId(snapshot.id, snapshot.data())
    },
    async create(payload) {
      const record = withCreatedAt(payload as Record<string, unknown>)
      const snapshot = await addDoc(collectionRef, record)
      return withId<T>(snapshot.id, record)
    },
    async update(id, payload) {
      const docRef = doc(db, collectionName, id)
      await updateDoc(docRef, payload as UpdateData<DocumentData>)
      const snapshot = await getDoc(docRef)
      if (!snapshot.exists()) throw new Error('Record not found')
      return withId(snapshot.id, snapshot.data())
    },
    async remove(id) {
      await deleteDoc(doc(db, collectionName, id))
    },
  }
}
