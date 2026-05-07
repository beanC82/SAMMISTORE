import React, { useState, useEffect, useRef } from 'react'
import {
  Box,
  Fab,
  Paper,
  Typography,
  IconButton,
  TextField,
  Stack,
  Avatar,
  CircularProgress,
  useTheme,
  Collapse,
  Badge,
  Grid,
  Chip,
} from '@mui/material'
import IconifyIcon from 'src/components/Icon'
import { postChatMessage, TChatMessage, getChatHistory } from 'src/services/chat'
import { useRouter } from 'next/router'
import { ROUTE_CONFIG } from 'src/configs/route'
import { formatPrice } from 'src/utils'
import { TProduct } from 'src/types/product'
import ProductSuggestChat from './ProductSuggestChat'
import { useAuth } from 'src/hooks/useAuth'

type TChatHistoryItem = TChatMessage & {
  products?: TProduct[]
  suggestedQuestions?: string[] | null
}

const FloatingChatBot = () => {
  const theme = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<TChatHistoryItem[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  
  const { user } = useAuth()
  
  const scrollRef = useRef<HTMLDivElement>(null)

  // Load conversation context & history
  useEffect(() => {
    const loadHistory = async () => {
      if (user) {
        // Fetch history from DB for authenticated users
        try {
          // Xóa dữ liệu cũ của khách để tránh lỗi khi đăng xuất
          sessionStorage.removeItem('ai_chat_id')
          sessionStorage.removeItem('ai_chat_history')

          const res = await getChatHistory()
          if (res && res.messages) {
            setMessages(res.messages)
            if (res.conversationId) {
              setConversationId(res.conversationId)
            }
          }
        } catch (error) {
          console.error("Failed to fetch chat history from DB", error)
        }
      } else {
        // Load from sessionStorage for guests
        const savedId = sessionStorage.getItem('ai_chat_id')
        const savedHistory = sessionStorage.getItem('ai_chat_history')
        
        if (savedId) setConversationId(savedId)
        if (savedHistory) {
            try {
                setMessages(JSON.parse(savedHistory))
            } catch (e) {
                console.error("Failed to parse chat history")
                setMessages([])
            }
        } else {
          setMessages([])
          setConversationId(null)
        }
      }
    }

    loadHistory()
  }, [user])

  // Save history on change (only for guests)
  useEffect(() => {
    if (!user && messages.length > 0) {
        sessionStorage.setItem('ai_chat_history', JSON.stringify(messages))
    }
    if (!user && !messages.length) {
      sessionStorage.removeItem('ai_chat_history')
      sessionStorage.removeItem('ai_chat_id')
    }
  }, [messages, user])

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
      }, 100)
    }
  }, [messages, isLoading])

  const handleSend = async (overrideMessage?: string) => {
    const query = (overrideMessage || input).trim()
    if (!query || isLoading) return

    const userMessage: TChatHistoryItem = { role: 'user', content: query }
    
    // Clear suggested questions from last AI message when sending new one
    setMessages((prev) => {
        const updated = [...prev]
        if (updated.length > 0 && updated[updated.length -1].role === 'assistant') {
            updated[updated.length -1].suggestedQuestions = null
        }
        return [...updated, userMessage]
    })
    
    if (!overrideMessage) setInput('')
    setIsLoading(true)

    try {
      const res = await postChatMessage({
        message: query,
        conversationId: conversationId
      })

      if (res.conversationId && res.conversationId !== conversationId) {
        setConversationId(res.conversationId)
        if (!user) {
          sessionStorage.setItem('ai_chat_id', res.conversationId)
        }
      }

      const assistantMessage: TChatHistoryItem = {
        role: 'assistant',
        content: res.response || 'Xin lỗi, tôi chưa tìm được câu trả lời phù hợp cho yêu cầu này.',
        products: res.recommendedProducts,
        suggestedQuestions: res.suggestedQuestions
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Xin lỗi, hệ thống đang gặp chút sự cố. Vui lòng thử lại sau.' }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000 }}>
      {/* Nút Floating Action Button */}
      <Fab
        color="primary"
        onClick={() => setIsOpen(!isOpen)}
        sx={{
          boxShadow: theme.shadows[10],
          width: 56,
          height: 56,
        }}
      >
        <IconifyIcon icon={isOpen ? 'tabler:x' : 'tabler:message-chatbot'} fontSize="1.8rem" />
      </Fab>

      {/* Khung Chat */}
      <Collapse in={isOpen} sx={{ position: 'absolute', bottom: 70, right: 0 }}>
        <Paper
          elevation={10}
          sx={{
            width: { xs: 'calc(100vw - 48px)', sm: 400 },
            height: 500,
            borderRadius: 3,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <Box
            sx={{
              p: 3,
              bgcolor: 'primary.main',
              color: 'common.white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                sx={{
                  bgcolor: 'common.white',
                  color: 'primary.main',
                  width: 32,
                  height: 32,
                }}
              >
                <IconifyIcon icon="tabler:robot" fontSize="1.2rem" />
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight={700} lineHeight={1}>
                  Chat bot Sammi
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  Tư vấn làm đẹp 24/7
                </Typography>
              </Box>
            </Stack>
            <IconButton onClick={() => setIsOpen(false)} sx={{ color: 'common.white' }}>
              <IconifyIcon icon="tabler:minus" />
            </IconButton>
          </Box>

          {/* Body - Message List */}
          <Box
            ref={scrollRef}
            sx={{
              flexGrow: 1,
              p: 3,
              overflowY: 'auto',
              bgcolor: '#f8f9fa',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            {messages.length === 0 && (
              <Box sx={{ textAlign: 'center', mt: 4, opacity: 0.6 }}>
                <IconifyIcon icon="tabler:sparkles" fontSize="3rem" color={theme.palette.primary.main} />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Chào bạn! Tôi có thể giúp gì cho bạn hôm nay?
                </Typography>
              </Box>
            )}

            {messages.map((msg, index) => {
              const isUser = msg.role === 'user'
              return (
                <Box
                  key={index}
                  sx={{
                    alignSelf: isUser ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                  }}
                >
                  <Paper
                    sx={{
                      p: 2,
                      borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      bgcolor: isUser ? 'primary.main' : 'common.white',
                      color: isUser ? 'common.white' : 'text.primary',
                      boxShadow: theme.shadows[1],
                    }}
                  >
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', '& strong': { fontWeight: 700 } }}>
                      {(msg.content || '').split('**').map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : part)}
                    </Typography>
                  </Paper>

                  {/* Render Suggested Questions */}
                  {!isUser && msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                    <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: 'wrap', gap: 1 }}>
                        {msg.suggestedQuestions.map((q, qIdx) => (
                            <Chip 
                                key={qIdx} 
                                label={q} 
                                size="small" 
                                variant="outlined" 
                                color="primary"
                                onClick={() => handleSend(q)}
                                sx={{ cursor: 'pointer', bgcolor: 'common.white', '&:hover': { bgcolor: 'primary.light', color: 'common.white' } }}
                            />
                        ))}
                    </Stack>
                  )}

                  {/* Render Recommended Products */}
                  {!isUser && msg.products && msg.products.length > 0 && (
                    <Box sx={{ 
                      mt: 2, 
                      mx: -3, 
                      px: 3, 
                      width: 'auto', 
                      overflowX: 'auto',
                      pb: 2, // Thêm chút padding bottom để thanh cuộn không đè sát vào card
                      '&::-webkit-scrollbar': {
                        height: '10px',
                      },
                      '&::-webkit-scrollbar-thumb': {
                        backgroundColor: theme.palette.grey[400],
                        borderRadius: '10px',
                      },
                    }}>
                      <Typography variant="caption" fontWeight={700} sx={{ mb: 1.5, display: 'block' }}>
                        Gợi ý cho bạn:
                      </Typography>
                      <Stack direction="row" spacing={2}>
                        {msg.products.map((p) => (
                          <ProductSuggestChat key={p.id} product={p} />
                        ))}
                      </Stack>
                    </Box>
                  )}
                </Box>
              )
            })}

            {isLoading && (
              <Box sx={{ alignSelf: 'flex-start', display: 'flex', gap: 1, alignItems: 'center' }}>
                <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.light' }}>
                   <CircularProgress size={14} color="inherit" />
                </Avatar>
                <Typography variant="caption" color="text.secondary">
                  Mình đang xử lý yêu cầu của bạn...
                </Typography>
              </Box>
            )}
          </Box>

          {/* Input Area */}
          <Box sx={{ p: 2, bgcolor: 'common.white', borderTop: '1px solid', borderColor: 'divider' }}>
            <Stack direction="row" spacing={1} alignItems="flex-end">
              <TextField
                fullWidth
                size="small"
                placeholder="Nhập tin nhắn..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                multiline
                maxRows={3}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: '#f0f2f5',
                    '& fieldset': { border: 'none' },
                  },
                }}
              />
              <IconButton
                color="primary"
                onClick={() => handleSend()}
                disabled={isLoading || !input.trim()}
                sx={{
                  bgcolor: 'primary.main',
                  color: 'common.white',
                  '&:hover': { bgcolor: 'primary.dark' },
                  '&.Mui-disabled': { bgcolor: 'action.disabledBackground', color: 'common.white' },
                  width: 40,
                  height: 40,
                }}
              >
                <IconifyIcon icon="tabler:send" fontSize="1.2rem" />
              </IconButton>
            </Stack>
          </Box>
        </Paper>
      </Collapse>
    </Box>
  )
}

export default FloatingChatBot
