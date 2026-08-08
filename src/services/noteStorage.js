const DATABASE_NAME = 'handwriting-notes'
const DATABASE_VERSION = 1
const NOTE_STORE = 'notes'

function requestToPromise(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error || new Error('저장소 요청에 실패했어요.'))
  })
}

function openDatabase() {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('이 브라우저에서는 노트 저장을 지원하지 않아요.'))
      return
    }

    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION)
    request.onupgradeneeded = () => {
      const database = request.result
      if (!database.objectStoreNames.contains(NOTE_STORE)) {
        const store = database.createObjectStore(NOTE_STORE, { keyPath: 'id' })
        store.createIndex('createdAt', 'createdAt')
        store.createIndex('dateISO', 'dateISO')
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error || new Error('노트 저장소를 열지 못했어요.'))
  })
}

async function withStore(mode, callback) {
  const database = await openDatabase()
  try {
    const transaction = database.transaction(NOTE_STORE, mode)
    const store = transaction.objectStore(NOTE_STORE)
    return await callback(store)
  } finally {
    database.close()
  }
}

export function saveStoredNote(note) {
  return withStore('readwrite', (store) => requestToPromise(store.put(note)))
}

export function getStoredNotes() {
  return withStore('readonly', (store) => requestToPromise(store.getAll()))
}

export function getStoredNote(id) {
  return withStore('readonly', (store) => requestToPromise(store.get(id)))
}

export function deleteStoredNote(id) {
  return withStore('readwrite', (store) => requestToPromise(store.delete(id)))
}
