const MAX_IMAGE_SIDE = 1800
const JPEG_QUALITY = 0.84

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    const objectUrl = URL.createObjectURL(file)
    image.onload = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('사진을 읽을 수 없어요. JPG 또는 PNG 사진을 사용해주세요.'))
    }
    image.src = objectUrl
  })
}

function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('사진을 변환하지 못했어요.'))),
      'image/jpeg',
      JPEG_QUALITY,
    )
  })
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('사진 데이터를 읽지 못했어요.'))
    reader.readAsDataURL(blob)
  })
}

export async function prepareImageForAnalysis(file) {
  if (!file?.type?.startsWith('image/')) throw new Error('이미지 파일만 올릴 수 있어요.')

  const image = await loadImage(file)
  const scale = Math.min(1, MAX_IMAGE_SIDE / Math.max(image.naturalWidth, image.naturalHeight))
  const width = Math.max(1, Math.round(image.naturalWidth * scale))
  const height = Math.max(1, Math.round(image.naturalHeight * scale))
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const context = canvas.getContext('2d')
  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, width, height)
  context.drawImage(image, 0, 0, width, height)

  const blob = await canvasToBlob(canvas)
  const dataUrl = await blobToDataUrl(blob)

  return {
    dataUrl,
    width,
    height,
    size: blob.size,
    captureDate: new Date(file.lastModified || Date.now()).toISOString().slice(0, 10),
  }
}
