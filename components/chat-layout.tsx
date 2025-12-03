"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, User } from "lucide-react";
import { ChatInput } from "./chat-input";
import { useChat } from "@/src/hooks/use-chat";
import { ChatMessage } from "@/src/hooks/use-chat";
import { BotMessage } from "@/src/components/bot-message";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const MessageBubble = ({ message }: { message: ChatMessage }) => {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex gap-3 px-4 py-3",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <Avatar className="size-8 shrink-0 mt-1">
          <AvatarFallback className="bg-primary text-primary-foreground">
            <Bot className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
      {isUser ? (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className={cn(
            "max-w-[85%] rounded-2xl px-4 py-2.5 bg-primary text-primary-foreground shadow-sm"
          )}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
        </motion.div>
      ) : (
        <BotMessage message={message} />
      )}
      {isUser && (
        <Avatar className="size-8 shrink-0 mt-1">
          <AvatarFallback className="bg-secondary text-secondary-foreground">
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export const ChatLayout = () => {
  const { messages, isLoading, sendMessage } = useChat();

  return (
    <Card className="flex flex-col h-[calc(100vh-theme(spacing.16))] max-h-[700px] overflow-hidden p-0">
      {/* Header */}
      <CardHeader className="border-b shrink-0 px-6 py-4">
        <CardTitle className="flex items-center gap-3 text-lg">
          <div className="flex items-center justify-center size-10 rounded-full bg-primary/10 text-primary">
            <Bot className="h-5 w-5" />
          </div>
          <span className="font-semibold">LeanBot AI</span>
        </CardTitle>
      </CardHeader>

      {/* Message Area */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
        <div className="flex flex-col">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center text-muted-foreground">
              <Bot className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-sm">Start a conversation with LeanBot AI</p>
            </div>
          ) : (
            messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))
          )}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex gap-3 px-4 py-3 justify-start"
            >
              <Avatar className="size-8 shrink-0 mt-1">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <motion.div
                className="bg-muted text-muted-foreground rounded-2xl px-4 py-2.5 shadow-sm"
                animate={{
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <p className="text-sm">Thinking...</p>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Input Area - Fixed at bottom */}
      <div className="shrink-0">
        <ChatInput onSend={sendMessage} isLoading={isLoading} />
      </div>
    </Card>
  );
};
