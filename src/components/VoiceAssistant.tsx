'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MicrophoneIcon, SpeakerWaveIcon, XMarkIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline'
import GoogleGenAI from '@google/genai'

// Extend window interface for speech recognition
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition
    webkitSpeechRecognition: typeof SpeechRecognition
  }
}

// Initialize Gemini AI
const getGeminiAI = () => {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
  if (!apiKey || apiKey === '') {
    console.warn(
      'Gemini API key not found. Please set NEXT_PUBLIC_GEMINI_API_KEY in your .env file.'
    )
    return null
  }
  return new GoogleGenAI(apiKey)
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface VoiceAssistantProps {
  isOpen: boolean
  onClose: () => void
  contextData?: {
    currentPage?: string
    userData?: any
    projectContext?: string
  }
}

export default function VoiceAssistant({ isOpen, onClose, contextData }: VoiceAssistantProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your AI assistant for the Mortgage Helper project. I can help you with leads, referrers, checklist templates, and any other aspects of your mortgage application management system. What would you like to work on?",
      timestamp: new Date()
    }
  ])
  const [currentInput, setCurrentInput] = useState('')
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [recognitionError, setRecognitionError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recognitionRef = useRef<any>(null)
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null)

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Speech Recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = false
        recognitionRef.current.interimResults = false
        recognitionRef.current.lang = 'en-US'

        recognitionRef.current.onresult = (event) => {
          const transcript = event.results[0][0].transcript
          setCurrentInput(transcript)
          handleSendMessage(transcript)
        }

        recognitionRef.current.onend = () => {
          setIsRecording(false)
        }

        recognitionRef.current.onerror = (event: any) => {
          if (event.error === 'no-speech') {
            setRecognitionError("I didn't hear anything. Please try speaking again.")
          } else {
            console.error('Speech recognition error:', event.error)
            setRecognitionError(`An error occurred: ${event.error}`)
          }
          setIsRecording(false)
        }
      }

      // Speech Synthesis
      speechSynthesisRef.current = window.speechSynthesis
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (speechSynthesisRef.current) {
        speechSynthesisRef.current.cancel()
      }
    }
  }, [])

  const startRecording = async () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser.')
      return
    }

    try {
      setRecognitionError(null) // Clear previous errors
      setIsRecording(true)
      recognitionRef.current.start()
    } catch (error) {
      console.error('Error starting recording:', error)
      setIsRecording(false)
    }
  }

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsRecording(false)
  }

  const speakText = (text: string) => {
    if (!speechSynthesisRef.current) return

    // Cancel any ongoing speech
    speechSynthesisRef.current.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9
    utterance.pitch = 1
    utterance.volume = 0.8

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    speechSynthesisRef.current.speak(utterance)
  }

  const handleSendMessage = async (messageText: string) => {
    if (!messageText.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setCurrentInput('')
    setIsProcessing(true)

    try {
      const gemini = getGeminiAI()
      if (!gemini) {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content:
            'Gemini API key not configured. Please set NEXT_PUBLIC_GEMINI_API_KEY in your .env file and restart the server.',
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, errorMessage])
        setIsProcessing(false)
        return
      }

      // Create comprehensive context about the project
      const projectContext = `
You are an AI assistant for a Mortgage Helper application - a comprehensive full-stack Next.js application with Prisma database for mortgage lead management.

## APPLICATION FEATURES:
- **Lead Management**: Create, edit, delete mortgage leads with complete financial information (property value, loan amount, interest rates, income, debts, credit scores, GDS/TDS ratios)
- **Referrer Management**: Track bank referrers who send leads (BANK source type only) - manage referrer names and track their lead generation
- **Checklist Templates**: Manage document checklists organized by lead type (Purchase, Refinance, Other) with customizable required/optional items
- **Application Status Tracking**: 5-stage workflow: NOT_CONTACTED → CONTACTED → IN_PROGRESS → CONDITIONAL_APPROVED → APPROVED

## CURRENT CONTEXT:
- **Current Page**: ${contextData?.currentPage || 'Unknown'}
- **Project State**: ${contextData?.projectContext || 'Mortgage Helper Application'}

## DATABASE SCHEMA OVERVIEW:
- **Leads**: Personal info, financial data, application status, source type, referrer relationship
- **Referrers**: Bank referrer names (only used for BANK source type leads)
- **Checklist Templates**: Organized by lead type with customizable item lists
- **Tasks**: Action items with due dates and status tracking
- **Notes**: Lead-specific notes and comments
- **Emails**: Communication tracking

## AVAILABLE ACTIONS:
- Navigate between Dashboard, Leads, Referrers, Checklist Templates
- Create/edit/delete leads with full financial information
- Manage bank referrers (add/edit/deactivate)
- Create/edit checklist templates by application type
- Update lead statuses through the workflow
- Add tasks and notes to leads
- Generate reports and analytics

Please provide specific, actionable guidance based on the current context and help the user efficiently manage their mortgage lead pipeline.
      `

      const prompt = `${projectContext}

## USER QUERY:
${messageText}

## RESPONSE GUIDELINES:
- Be specific and actionable
- Reference exact page names, button names, and workflows
- Suggest concrete next steps
- Explain mortgage-specific terms when relevant
- Offer to help with specific tasks like creating leads, managing templates, etc.
- If the user asks about functionality, explain how it works in this application
- Keep responses conversational but professional

Assistant: Respond helpfully to the user's query about the Mortgage Helper application.`

      const response = await gemini.models.generateContent({
        model: "gemini-1.5-flash-latest",
        contents: prompt,
      })
      const aiResponse = response.text

      const assistantMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])

      // Speak the response if speech synthesis is available
      if (speechSynthesisRef.current) {
        speakText(aiResponse)
      }

    } catch (error) {
      console.error('Error calling Gemini API:', error)
      const errorMessage: Message = {
        id: (Date.now() + 3).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your request. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsProcessing(false)
    }
  }

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSendMessage(currentInput)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <Card className="w-full max-w-2xl h-[600px] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2">
            <MicrophoneIcon className="h-5 w-5" />
            AI Voice Assistant
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            <XMarkIcon className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-4">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto mb-4 space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}

            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            {recognitionError && (
              <div className="flex justify-center">
                <div className="bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm">
                  {recognitionError}
                </div>
              </div>
            )}
          </div>

          {/* Input Controls */}
          <div className="border-t pt-4">
            <form onSubmit={handleTextSubmit} className="flex gap-2">
              <input
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                placeholder="Type your message or use voice..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isProcessing}
              />

              <Button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isProcessing}
                className={`px-3 py-2 ${
                  isRecording
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                    : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                <MicrophoneIcon className={`h-4 w-4 ${isRecording ? 'animate-pulse' : ''}`} />
              </Button>

              <Button
                type="submit"
                disabled={isProcessing || !currentInput.trim()}
                className="px-3 py-2 bg-blue-500 hover:bg-blue-600"
              >
                <PaperAirplaneIcon className="h-4 w-4" />
              </Button>

              {speechSynthesisRef.current && (
                <Button
                  type="button"
                  onClick={() => {
                    if (isSpeaking) {
                      speechSynthesisRef.current?.cancel()
                      setIsSpeaking(false)
                    }
                  }}
                  disabled={!isSpeaking}
                  className="px-3 py-2 bg-purple-500 hover:bg-purple-600"
                >
                  <SpeakerWaveIcon className={`h-4 w-4 ${isSpeaking ? 'animate-pulse' : ''}`} />
                </Button>
              )}
            </form>

            <div className="mt-2 text-xs text-gray-500 text-center">
              {!process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY === 'your_gemini_api_key_here' ? (
                <p className="text-red-500">⚠️ Gemini API key not configured</p>
              ) : null}
              {!recognitionRef.current && (
                <p>🎤 Voice recognition not supported in this browser</p>
              )}
              {!speechSynthesisRef.current && (
                <p>🔊 Text-to-speech not supported in this browser</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
