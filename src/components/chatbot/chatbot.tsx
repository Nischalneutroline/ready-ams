"use client";

import { useState, useRef, useEffect, FormEvent, KeyboardEvent } from "react";
import { Send, MessageCircle } from "lucide-react";
import {
  Message,
  ChatBotProps,
  ApiResponse,
} from "../../features/chatbot/types/types";

const ChatBot: React.FC<ChatBotProps> = ({
  primaryColor = "#dc2626",
  backgroundColor = "#f8fafc",
  textColor = "#1f2937",
  userMessageColor = "#3b82f6",
  botMessageColor = "#6b7280",
  className = "",
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/langchain", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: updatedMessages,
          userId: "cmben86we0000vd8gk890533p",
        }),
      });
      console.log("response is", response);

      const data: ApiResponse = await response.json();

      if (response.ok) {
        const assistantMessage: Message = {
          role: "assistant",
          content: data.answer,
          timestamp: new Date(),
        };
        setMessages([...updatedMessages, assistantMessage]);
      } else {
        const errorMessage: Message = {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
          timestamp: new Date(),
        };
        setMessages([...updatedMessages, errorMessage]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages([...updatedMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const resetConversation = (): void => {
    setMessages([]);
  };

  return (
    <div
      className={`flex flex-col h-screen max-w-4xl mx-auto ${className}`}
      style={{ backgroundColor }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 border-b"
        style={{
          backgroundColor: primaryColor,
          borderColor: `${primaryColor}20`,
        }}
      >
        <div className="flex items-center space-x-2">
          <MessageCircle className="w-6 h-6 text-white" />
          <h1 className="text-xl font-semibold text-white">Chat</h1>
        </div>
        <button
          onClick={resetConversation}
          className="px-3 py-1 text-sm text-white bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-colors"
          type="button"
        >
          Reset conversation
        </button>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <MessageCircle
              className="w-12 h-12 mx-auto mb-4 opacity-50"
              style={{ color: primaryColor }}
            />
            <p style={{ color: textColor }} className="text-lg opacity-70">
              Start a conversation
            </p>
          </div>
        )}

        {messages.map((message: Message, index: number) => (
          <div
            key={index}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.role === "user" ? "rounded-br-none" : "rounded-bl-none"
              }`}
              style={{
                backgroundColor:
                  message.role === "user" ? userMessageColor : botMessageColor,
                color: "white",
              }}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div
              className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg rounded-bl-none"
              style={{ backgroundColor: botMessageColor }}
            >
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-white rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-white rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div
        className="p-4 border-t"
        style={{ borderColor: `${primaryColor}20` }}
      >
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 transition-colors"
            style={{
              borderColor: `${primaryColor}40`,
              color: textColor,
            }}
            rows={1}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-4 py-2 rounded-lg text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
            style={{ backgroundColor: primaryColor }}
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatBot;
