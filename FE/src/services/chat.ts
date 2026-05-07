import instance from 'src/helpers/axios'
import { BASE_URL } from 'src/configs/api'
import { TProduct } from 'src/types/product'

export type TChatMessage = {
  role: string
  content: string
  products?: TProduct[]
  suggestedQuestions?: string[] | null
}

export type TChatRequest = {
  message: string
  conversationId?: string | null
}

export type TChatResponse = {
  response: string
  recommendedProducts: TProduct[]
  nextAction: string
  suggestedQuestions: string[] | null
  conversationId: string
}

export type TChatHistoryResponse = {
  messages: TChatMessage[]
  conversationId: string
}

export const postChatMessage = async (data: TChatRequest): Promise<TChatResponse> => {
  try {
    const res = await instance.post(`${BASE_URL}/Chat/message`, data, {
      params: { isPublic: true },
    })
    return res.data?.result || res.data
  } catch (error: any) {
    throw error?.response?.data || error
  }
}

export const getChatHistory = async (): Promise<TChatHistoryResponse> => {
  try {
    const res = await instance.get(`${BASE_URL}/Chat/history`)
    return res.data?.result || res.data
  } catch (error: any) {
    throw error?.response?.data || error
  }
}
