import { noteLibrary } from '@/data/noteLibrary'
import { getStoredNote, getStoredNotes, saveStoredNote } from './noteStorage'

function createId() {
  if (globalThis.crypto?.randomUUID) return `note-${globalThis.crypto.randomUUID()}`
  return `note-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function toDateKey(dateISO, dateDisplay) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateISO || '')) {
    const [, month, day] = dateISO.split('-')
    return `${month}.${day}`
  }
  const match = String(dateDisplay || '').match(/(\d{1,2})\s*[/.]\s*(\d{1,2})/)
  return match ? `${match[1].padStart(2, '0')}.${match[2].padStart(2, '0')}` : '날짜 없음'
}

function sortNotes(notes) {
  return [...notes].sort((first, second) => {
    const firstDate = first.dateISO || first.createdAt || ''
    const secondDate = second.dateISO || second.createdAt || ''
    return secondDate.localeCompare(firstDate)
  })
}

export function createStoredNote(analysis, image, fileName) {
  const now = new Date().toISOString()
  const dateISO = analysis.dateISO || image.captureDate
  const id = createId()
  return {
    id,
    title: analysis.title || `${analysis.dateDisplay || '새'} 필기`,
    shortTitle: analysis.dateDisplay || analysis.title || '새 필기',
    subject: '자동 정리',
    dateKey: toDateKey(dateISO, analysis.dateDisplay),
    dateISO,
    date: analysis.dateDisplay || dateISO,
    pages: 1,
    image: image.dataUrl,
    excerpt: analysis.summary,
    summary: analysis.summary,
    rawText: analysis.rawText,
    topics: analysis.topics,
    sections: analysis.sections,
    uncertainItems: analysis.uncertainItems,
    confidence: analysis.confidence,
    originalFileName: fileName,
    createdAt: now,
    updatedAt: now,
    userCreated: true,
    route: `/notes/${id}`,
  }
}

export async function saveAnalyzedNote(analysis, image, fileName) {
  const note = createStoredNote(analysis, image, fileName)
  await saveStoredNote(note)
  return note
}

export async function getAllNotes() {
  const storedNotes = await getStoredNotes()
  return sortNotes([...storedNotes, ...noteLibrary])
}

export async function getNoteById(id) {
  const builtInNote = noteLibrary.find((note) => note.id === id)
  return builtInNote || getStoredNote(id)
}
