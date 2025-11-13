import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type')
    
    // Handle greeting request
    if (contentType?.includes('application/json')) {
      const body = await request.json()
      
      if (body.action === 'greeting') {
        return NextResponse.json({
          userText: '',
          aiText: 'مرحباً بك، معك خدمة عملاء وزارة الموارد البشرية والتنمية الاجتماعية. كيف يمكنني مساعدتك؟',
          audio: null,
        })
      }
    }

    // Process voice input
    const formData = await request.formData()
    const audioFile = formData.get('audio') as Blob
    const user_id = formData.get('user_id') as string
    
    if (!audioFile) {
      return NextResponse.json(
        { error: 'لم يتم العثور على ملف الصوت' },
        { status: 400 }
      )
    }

    const arrayBuffer = await audioFile.arrayBuffer()
    const audioBuffer = Buffer.from(arrayBuffer)

    if (audioBuffer.byteLength === 0) {
      return NextResponse.json({
        userText: '',
        aiText: 'الصوت المُرسَل فارغ. تأكد من تشغيل الميكروفون.',
        audio: null,
      })
    }

    // Speech-to-Text using OpenAI Whisper
    const client = new OpenAI({
      baseURL: "https://api.openai.com/v1",
      apiKey: process.env.OPENAI_API_KEY,
    })

    const transcription = await client.audio.transcriptions.create({
      file: new File([audioBuffer], "recording.webm", { type: "audio/webm" }),
      model: "whisper-1",
      language: "ar",
    })

    const userText = transcription.text?.trim() || ""
    
    console.log('🎤', userText || 'EMPTY')

    if (!userText) {
      return NextResponse.json({
        userText: '',
        aiText: 'لم أتمكن من سماعك بوضوح.',
        audio: null,
      })
    }

    // Send to SILMA assistant
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    
    const chatResponse = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: userText,
        user_id: user_id,
        isVoiceRequest: true,
      }),
    })

    if (!chatResponse.ok) {
      throw new Error('Chat API failed')
    }

    const chatData = await chatResponse.json()
    const aiText = chatData.response || 'عذراً، لم أتمكن من الرد.'

    console.log('🤖', aiText.substring(0, 40) + '...')

    return NextResponse.json({
      userText,
      aiText,
      audio: null,
    })

  } catch (error: any) {
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.error('❌ Voice API error:', error.message)
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    const errorMessage = 'عذراً، حدث خطأ في معالجة طلبك. يرجى المحاولة مرة أخرى.'
    
    return NextResponse.json({
      userText: '',
      aiText: errorMessage,
      audio: null,
    }, { status: 200 })
  }
}
