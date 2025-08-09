interface ImageData {
  id: string
  sessionId: string
  questionId: string
  data: string | File // base64 string or File object
  timestamp: number
}

class ImageStorageService {
  private dbName = 'adam-quiz-images'
  private dbVersion = 1
  private storeName = 'images'
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' })
          store.createIndex('sessionId', 'sessionId', { unique: false })
          store.createIndex('questionId', 'questionId', { unique: false })
          store.createIndex('timestamp', 'timestamp', { unique: false })
        }
      }
    })
  }

  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.init()
    }
    return this.db!
  }

  async storeImage(sessionId: string, questionId: string, imageData: string | File): Promise<string> {
    const db = await this.ensureDB()
    const imageId = `${sessionId}_${questionId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const imageRecord: ImageData = {
      id: imageId,
      sessionId,
      questionId,
      data: imageData,
      timestamp: Date.now()
    }

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.put(imageRecord)

      request.onsuccess = () => resolve(imageId)
      request.onerror = () => reject(request.error)
    })
  }

  async getImage(imageId: string): Promise<string | File | null> {
    const db = await this.ensureDB()
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      const request = store.get(imageId)

      request.onsuccess = () => {
        const result = request.result
        resolve(result ? result.data : null)
      }
      request.onerror = () => reject(request.error)
    })
  }

  async getImagesBySession(sessionId: string): Promise<Record<string, string | File>> {
    const db = await this.ensureDB()
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      const index = store.index('sessionId')
      const request = index.getAll(sessionId)

      request.onsuccess = () => {
        const images: Record<string, string | File> = {}
        request.result.forEach((imageRecord: ImageData) => {
          images[imageRecord.id] = imageRecord.data
        })
        resolve(images)
      }
      request.onerror = () => reject(request.error)
    })
  }

  async deleteImage(imageId: string): Promise<void> {
    const db = await this.ensureDB()
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.delete(imageId)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async deleteImagesBySession(sessionId: string): Promise<void> {
    const db = await this.ensureDB()
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const index = store.index('sessionId')
      const request = index.getAll(sessionId)

      request.onsuccess = () => {
        const deletePromises = request.result.map((imageRecord: ImageData) => {
          return new Promise<void>((deleteResolve, deleteReject) => {
            const deleteRequest = store.delete(imageRecord.id)
            deleteRequest.onsuccess = () => deleteResolve()
            deleteRequest.onerror = () => deleteReject(deleteRequest.error)
          })
        })

        Promise.all(deletePromises)
          .then(() => resolve())
          .catch(reject)
      }
      request.onerror = () => reject(request.error)
    })
  }

  async cleanupOldImages(maxAgeMs: number = 24 * 60 * 60 * 1000): Promise<void> {
    const db = await this.ensureDB()
    const cutoffTime = Date.now() - maxAgeMs
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const index = store.index('timestamp')
      const request = index.openCursor(IDBKeyRange.upperBound(cutoffTime))

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result
        if (cursor) {
          cursor.delete()
          cursor.continue()
        } else {
          resolve()
        }
      }
      request.onerror = () => reject(request.error)
    })
  }

  async getStorageStats(): Promise<{ count: number; estimatedSize: number }> {
    const db = await this.ensureDB()
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      const request = store.getAll()

      request.onsuccess = () => {
        const images = request.result
        let estimatedSize = 0
        
        images.forEach((imageRecord: ImageData) => {
          if (typeof imageRecord.data === 'string') {
            // Base64 string size estimation
            estimatedSize += imageRecord.data.length * 0.75 // Base64 is ~33% larger than binary
          } else if (imageRecord.data instanceof File) {
            estimatedSize += imageRecord.data.size
          }
        })

        resolve({
          count: images.length,
          estimatedSize
        })
      }
      request.onerror = () => reject(request.error)
    })
  }
}

// Singleton instance
const imageStorage = new ImageStorageService()

export default imageStorage