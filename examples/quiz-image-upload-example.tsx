// Example: How to use the simplified session-based image storage in a quiz component

import React, { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import simpleImageStorage from '@/lib/storage/simple-image-storage'
import { getBrowserSessionId, setSessionData, getSessionData } from '@/lib/utils/browser-session'

interface QuizImageUploadProps {
    questionId: string
    onImageUploaded: (imageReference: any) => void
}

export function QuizImageUpload({ questionId, onImageUploaded }: QuizImageUploadProps) {
    const { user } = useAuth()
    const [uploading, setUploading] = useState(false)
    const [uploadedImage, setUploadedImage] = useState<string | null>(null)

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        setUploading(true)
        
        try {
            // Upload image (automatically handles session for anonymous users)
            const imagePath = await simpleImageStorage.uploadImage(
                questionId,
                file,
                user?.id // undefined for anonymous users
            )
            
            // Create image reference for questionnaire response
            const imageReference = simpleImageStorage.createImageReference(
                questionId,
                imagePath,
                {
                    name: file.name,
                    size: file.size,
                    fileType: file.type
                }
            )
            
            // Store in appropriate location based on user type
            if (user) {
                // Authenticated user: store in regular localStorage
                const responses = JSON.parse(localStorage.getItem('quiz-responses') || '{}')
                responses[questionId] = imageReference
                localStorage.setItem('quiz-responses', JSON.stringify(responses))
            } else {
                // Anonymous user: store with session-specific key
                const responses = getSessionData('quiz-responses') || {}
                responses[questionId] = imageReference
                setSessionData('quiz-responses', responses)
            }
            
            setUploadedImage(imagePath)
            onImageUploaded(imageReference)
            
            console.log('✅ Image uploaded and reference stored:', {
                path: imagePath,
                isAuthenticated: !!user,
                sessionId: !user ? getBrowserSessionId() : 'N/A'
            })
            
        } catch (error) {
            console.error('❌ Image upload failed:', error)
            alert('Failed to upload image. Please try again.')
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="image-upload-component">
            <h3>Upload Photo for {questionId}</h3>
            
            <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
            />
            
            {uploading && <p>Uploading image...</p>}
            
            {uploadedImage && (
                <div>
                    <p>✅ Image uploaded successfully!</p>
                    <p>Path: {uploadedImage}</p>
                    {!user && (
                        <p>Session: {getBrowserSessionId()}</p>
                    )}
                </div>
            )}
        </div>
    )
}

// Example: Signup integration with image migration
export function SignupWithImageMigration() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [signingUp, setSigningUp] = useState(false)

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setSigningUp(true)

        try {
            // 1. Create user account
            const { data: authData } = await supabase.auth.signUp({
                email,
                password
            })
            
            const userId = authData.user?.id
            
            if (userId) {
                // 2. Check if current session has anonymous images
                const sessionId = getBrowserSessionId()
                const hasImages = await ImageMigrationService.hasAnonymousImages(sessionId)
                
                if (hasImages) {
                    console.log('📸 Migrating questionnaire images...')
                    
                    // 3. Migrate server-side images and database references
                    const migrationResult = await ImageMigrationService.migrateAnonymousImagesToUser(
                        userId, 
                        sessionId
                    )
                    
                    if (migrationResult.success) {
                        console.log(`✅ Migrated ${migrationResult.migratedCount} images`)
                        
                        // 4. Update browser localStorage to match migrated paths
                        const sessionResponses = getSessionData('quiz-responses')
                        if (sessionResponses) {
                            // Replace anonymous/sessionId/ paths with userId/
                            const updatedResponses = JSON.stringify(sessionResponses)
                                .replace(new RegExp(`anonymous/${sessionId}/`, 'g'), `${userId}/`)
                            
                            // Move from session-specific to regular storage
                            localStorage.setItem('quiz-responses', updatedResponses)
                        }
                        
                        // 5. Clear session-specific data
                        clearSessionData()
                        clearBrowserSession()
                        
                        console.log('✅ Image migration completed successfully')
                    }
                }
            }
            
            alert('Signup successful! Images have been migrated to your account.')
            
        } catch (error) {
            console.error('❌ Signup failed:', error)
            alert('Signup failed. Please try again.')
        } finally {
            setSigningUp(false)
        }
    }

    return (
        <form onSubmit={handleSignup}>
            <h2>Sign Up</h2>
            
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
            
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            
            <button type="submit" disabled={signingUp}>
                {signingUp ? 'Signing up...' : 'Sign Up'}
            </button>
        </form>
    )
}

// Example: How to retrieve images later (for eMed submission)
export async function retrieveQuestionnaireImages(userId: string): Promise<any[]> {
    const responses = JSON.parse(localStorage.getItem('quiz-responses') || '{}')
    const imageReferences = []
    
    for (const [questionId, response] of Object.entries(responses)) {
        if (response?.type === 'image_reference' && response?.supabasePath) {
            try {
                // Download and decrypt the image
                const imageBuffer = await simpleImageStorage.downloadImage(response.supabasePath)
                const base64 = imageBuffer.toString('base64')
                
                imageReferences.push({
                    questionId,
                    supabasePath: response.supabasePath,
                    dataBase64: base64,
                    size: imageBuffer.length,
                    metadata: response.metadata
                })
                
            } catch (error) {
                console.error(`Failed to retrieve image for ${questionId}:`, error)
            }
        }
    }
    
    return imageReferences
}