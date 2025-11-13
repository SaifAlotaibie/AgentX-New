/**
 * ElevenLabs Text-to-Speech Utility
 * Uses ElevenLabs API with custom Arabic voice
 * Voice ID: 3nav5pHC1EYvWOd5LmnA
 * Enhanced for natural Arabic speech
 */

// Track current audio playback
let currentAudio: HTMLAudioElement | null = null

/**
 * Speak text using ElevenLabs TTS (custom voice)
 * @param text - Text to speak (Arabic or English)
 * @param onEndCallback - Optional callback when speech ends
 */
export async function speakArabic(text: string, onEndCallback?: () => void) {
  if (!text || text.trim().length === 0) {
    console.warn('⚠️ No text provided')
    if (onEndCallback) onEndCallback()
    return
  }

  try {
    // Stop any ongoing speech
    if (currentAudio) {
      currentAudio.pause()
      currentAudio = null
    }

    console.log('🎤 Requesting TTS for:', text.substring(0, 50) + '...')

    // Call OpenAI TTS API
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    })

    if (!response.ok) {
      throw new Error(`TTS API error: ${response.status}`)
    }

    // Get audio blob
    const audioBlob = await response.blob()
    const audioUrl = URL.createObjectURL(audioBlob)

    // Create and play audio
    currentAudio = new Audio(audioUrl)
    
    currentAudio.onplay = () => {
      console.log('🗣️ Speaking:', text.substring(0, 30) + '...')
    }

    currentAudio.onended = () => {
      URL.revokeObjectURL(audioUrl)
      currentAudio = null
      if (onEndCallback) onEndCallback()
    }

    currentAudio.onerror = (error) => {
      console.error('❌ Audio playback error:', error)
      URL.revokeObjectURL(audioUrl)
      currentAudio = null
      if (onEndCallback) onEndCallback()
    }

    await currentAudio.play()

  } catch (error: any) {
    console.error('❌ TTS Error:', error.message)
    if (onEndCallback) onEndCallback()
  }
}

/**
 * Stop any ongoing speech immediately
 */
export function stopSpeaking() {
  if (currentAudio) {
    currentAudio.pause()
    currentAudio = null
    console.log('🛑 Stopped speaking')
  }
}

/**
 * Get current TTS info (for debugging)
 */
export function getVoiceInfo() {
  return {
    provider: 'ElevenLabs',
    model: 'eleven_multilingual_v2',
    voiceId: '3nav5pHC1EYvWOd5LmnA',
    isPlaying: currentAudio !== null && !currentAudio.paused
  }
}
