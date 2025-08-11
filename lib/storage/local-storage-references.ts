interface ImageReference {
    id: string
    sessionId: string
    questionId: string
    supabasePath: string
    uploadedAt: number
    metadata?: {
        name?: string
        size?: number
        fileType?: string
    }
}

interface SessionImageReferences {
    [sessionId: string]: {
        [questionId: string]: ImageReference[]
    }
}

const STORAGE_KEY = 'adam-image-references'

export function storeImageReference(
    sessionId: string,
    questionId: string,
    imageId: string,
    supabasePath: string,
    metadata?: { name?: string; size?: number; fileType?: string }
): void {
    const references = getImageReferences()

    if (!references[sessionId]) {
        references[sessionId] = {}
    }

    if (!references[sessionId][questionId]) {
        references[sessionId][questionId] = []
    }

    const imageReference: ImageReference = {
        id: imageId,
        sessionId,
        questionId,
        supabasePath,
        uploadedAt: Date.now(),
        metadata
    }

    references[sessionId][questionId].push(imageReference)

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(references))
    } catch (error) {
        console.error('Failed to store image reference in localStorage:', error)
    }
}

export function getImageReference(
    sessionId: string,
    questionId: string,
    imageId: string
): ImageReference | null {
    const references = getImageReferences()

    const questionRefs = references[sessionId]?.[questionId]
    if (!questionRefs) return null

    return questionRefs.find(ref => ref.id === imageId) || null
}

export function getImageReferencesForSession(sessionId: string): ImageReference[] {
    const references = getImageReferences()
    const sessionRefs = references[sessionId]

    if (!sessionRefs) return []

    return Object.values(sessionRefs).flat()
}

export function removeImageReference(
    sessionId: string,
    questionId: string,
    imageId: string
): void {
    const references = getImageReferences()

    if (references[sessionId]?.[questionId]) {
        references[sessionId][questionId] = references[sessionId][questionId]
            .filter(ref => ref.id !== imageId)

        if (references[sessionId][questionId].length === 0) {
            delete references[sessionId][questionId]
        }

        if (Object.keys(references[sessionId]).length === 0) {
            delete references[sessionId]
        }

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(references))
        } catch (error) {
            console.error('Failed to update image references in localStorage:', error)
        }
    }
}

export function removeSessionImageReferences(sessionId: string): ImageReference[] {
    const references = getImageReferences()
    const sessionRefs = getImageReferencesForSession(sessionId)

    delete references[sessionId]

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(references))
    } catch (error) {
        console.error('Failed to remove session image references from localStorage:', error)
    }

    return sessionRefs
}

export function cleanupOldImageReferences(maxAgeMs: number = 24 * 60 * 60 * 1000): ImageReference[] {
    const references = getImageReferences()
    const cutoffTime = Date.now() - maxAgeMs
    const removedReferences: ImageReference[] = []

    Object.keys(references).forEach(sessionId => {
        Object.keys(references[sessionId]).forEach(questionId => {
            const questionRefs = references[sessionId][questionId]
            const oldRefs = questionRefs.filter(ref => ref.uploadedAt < cutoffTime)

            if (oldRefs.length > 0) {
                references[sessionId][questionId] = questionRefs.filter(ref => ref.uploadedAt >= cutoffTime)
                removedReferences.push(...oldRefs)

                if (references[sessionId][questionId].length === 0) {
                    delete references[sessionId][questionId]
                }
            }
        })

        if (Object.keys(references[sessionId]).length === 0) {
            delete references[sessionId]
        }
    })

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(references))
    } catch (error) {
        console.error('Failed to cleanup old image references from localStorage:', error)
    }

    return removedReferences
}

function getImageReferences(): SessionImageReferences {
    try {
        const stored = localStorage.getItem(STORAGE_KEY)
        return stored ? JSON.parse(stored) : {}
    } catch (error) {
        console.error('Failed to parse image references from localStorage:', error)
        return {}
    }
}