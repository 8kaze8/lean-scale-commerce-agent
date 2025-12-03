"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, User } from "lucide-react";
import { ChatInput } from "./chat-input";
import { useChat } from "@/src/hooks/use-chat";
import { ChatMessage } from "@/src/hooks/use-chat";
import { cn } from "@/lib/utils";

const MessageBubble = ({ message }: { message: ChatMessage }) => {
  const isUser = message.role === "user";

  return (
    <div
      className={cn("flex gap-3 p-4", isUser ? "justify-end" : "justify-start")}
    >
      {!isUser && (
        <Avatar className="size-8 shrink-0">
          <AvatarFallback className="bg-primary text-primary-foreground">
            <Bot className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          "max-w-[80%] rounded-lg px-4 py-2",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground"
        )}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
      </div>
      {isUser && (
        <Avatar className="size-8 shrink-0">
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
      <CardHeader className="border-b shrink-0">
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          LeanBot AI
        </CardTitle>
      </CardHeader>

      {/* Message Area */}
      <ScrollArea className="flex-1 min-h-0">
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
            <div className="flex gap-3 p-4 justify-start">
              <Avatar className="size-8 shrink-0">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-muted text-muted-foreground rounded-lg px-4 py-2">
                <p className="text-sm">Thinking...</p>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area - Fixed at bottom */}
      <div className="shrink-0">
        <ChatInput onSend={sendMessage} isLoading={isLoading} />
      </div>
    </Card>
  );
};
