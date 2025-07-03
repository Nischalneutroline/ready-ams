// types/chat.ts
export interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
}

export interface ChatTheme {
  primary: string;
  background: string;
  text: string;
  userMessage: string;
  botMessage: string;
}

export interface ChatBotProps {
  primaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  userMessageColor?: string;
  botMessageColor?: string;
  className?: string;
}

export interface ApiResponse {
  answer: string;
  error?: string;
  message?: string;
}

export interface ChatRequest {
  messages: Message[];
}
