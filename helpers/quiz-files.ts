export interface FileData {
  name: string
  size: number
  type: string
  data: string // base64 data URL (e.g., "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...")
}

/**
 * Extract file data from quiz responses (client-side)
 * @param quizResponses - The quiz responses object
 * @returns Object with questionId as key and FileData[] as value for questions that have file uploads
 */
export function extractFileDataFromQuizResponses(quizResponses: Record<string, any>): Record<string, FileData[]> {
  const fileData: Record<string, FileData[]> = {}
  
  for (const [questionId, answer] of Object.entries(quizResponses)) {
    if (Array.isArray(answer) && answer.length > 0 && 
        typeof answer[0] === 'object' && 
        answer[0].data && 
        answer[0].name &&
        typeof answer[0].data === 'string' &&
        answer[0].data.startsWith('data:')) {
      // This is file data
      fileData[questionId] = answer as FileData[]
    }
  }
  
  return fileData
}

/**
 * Convert base64 data URL to a File object (for browser use)
 * @param fileData - The file data with base64 content
 * @returns File object that can be used in FormData
 */
export function base64ToFile(fileData: FileData): File {
  // Extract base64 data without the data URL prefix
  const base64Data = fileData.data.split(',')[1]
  const byteCharacters = atob(base64Data)
  const byteNumbers = new Array(byteCharacters.length)
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }
  
  const byteArray = new Uint8Array(byteNumbers)
  return new File([byteArray], fileData.name, { type: fileData.type })
}

/**
 * Create FormData with files for uploading to external services
 * @param filesData - Array of file data objects
 * @param fieldName - The field name to use in FormData (default: 'files')
 * @returns FormData ready for upload
 */
export function createFormDataFromFiles(filesData: FileData[], fieldName: string = 'files'): FormData {
  const formData = new FormData()
  
  filesData.forEach((fileData, index) => {
    const file = base64ToFile(fileData)
    formData.append(`${fieldName}[${index}]`, file)
  })
  
  return formData
}

/**
 * Get quiz file data from localStorage (client-side only)
 * @returns Record<string, FileData[]> - File data grouped by question ID
 */
export function getQuizFilesFromLocalStorage(): Record<string, FileData[]> {
  try {
    const savedQuiz = localStorage.getItem('clinical-quiz-state')
    if (!savedQuiz) return {}
    
    const quizState = JSON.parse(savedQuiz)
    if (!quizState.answers) return {}
    
    return extractFileDataFromQuizResponses(quizState.answers)
  } catch (error) {
    console.error('Error getting quiz files from localStorage:', error)
    return {}
  }
}