import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * ElevenLabs Text-to-Speech API Endpoint
 * Voice ID: 3nav5pHC1EYvWOd5LmnA (Custom Arabic voice)
 * Model: eleven_multilingual_v2 (supports Arabic)
 */
export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      )
    }

    const apiKey = process.env.ELEVENLABS_API_KEY
    if (!apiKey) {
      console.error('❌ ELEVENLABS_API_KEY not set')
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      )
    }

    const voiceId = '3nav5pHC1EYvWOd5LmnA' // Your custom voice

    console.log('🎤 Generating speech for:', text.substring(0, 50) + '...')

    // Call ElevenLabs API
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            speed: 1.2, // ⚠️ الحد الأدنى: 0.7 | عادي: 1.0 | الحد الأقصى: 1.2 (أسرع ما يمكن)
          },
        }),
      }
    )

    if (!response.ok) {
      const error = await response.text()
      console.error('❌ ElevenLabs Error:', error)
      throw new Error(`ElevenLabs API error: ${response.status}`)
    }

    // Get audio buffer
    const audioBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(audioBuffer)

    console.log('✅ Audio generated:', buffer.length, 'bytes')

    // Return audio as MP3
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': buffer.length.toString(),
      },
    })
  } catch (error: any) {
    console.error('❌ TTS Error:', error.message)
    return NextResponse.json(
      { error: 'Failed to generate speech', details: error.message },
      { status: 500 }
    )
  }
}

