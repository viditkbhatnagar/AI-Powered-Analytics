import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  Send,
  Trash2,
  MessageSquare,
  Bot,
  User,
  Loader2,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useSelectedIndustry } from "@/hooks/use-industry";

interface Conversation {
  id: number;
  title: string;
  createdAt: string;
}

interface Message {
  id: number;
  conversationId: number;
  role: string;
  content: string;
  createdAt: string;
}

interface ConversationWithMessages extends Conversation {
  messages: Message[];
}

export default function ChatPage() {
  const queryClient = useQueryClient();
  const { current } = useSelectedIndustry();
  const industryId = current?.id ?? null;
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [streamingContent, setStreamingContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch all conversations
  const { data: conversations = [], isLoading: loadingConversations } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations"],
  });

  // Fetch active conversation with messages
  const { data: activeConversation, isLoading: loadingMessages } = useQuery<ConversationWithMessages>({
    queryKey: ["/api/conversations", activeConversationId],
    queryFn: async () => {
      const res = await fetch(`/api/conversations/${activeConversationId}`);
      if (!res.ok) throw new Error("Failed to fetch conversation");
      return res.json();
    },
    enabled: !!activeConversationId,
  });

  // Create conversation
  const createConversation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/conversations", { title: "New Chat" });
      return res.json();
    },
    onSuccess: (data: Conversation) => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      setActiveConversationId(data.id);
    },
  });

  // Delete conversation
  const deleteConversation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/conversations/${id}`);
    },
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      if (activeConversationId === deletedId) {
        setActiveConversationId(null);
      }
    },
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConversation?.messages, streamingContent]);

  // Send message with SSE streaming
  const sendMessage = useCallback(async () => {
    if (!inputValue.trim() || !activeConversationId || isStreaming) return;

    const content = inputValue.trim();
    setInputValue("");
    setIsStreaming(true);
    setStreamingContent("");

    // Optimistically add user message
    queryClient.setQueryData<ConversationWithMessages>(
      ["/api/conversations", activeConversationId],
      (old) => {
        if (!old) return old;
        return {
          ...old,
          messages: [
            ...old.messages,
            {
              id: Date.now(),
              conversationId: activeConversationId,
              role: "user",
              content,
              createdAt: new Date().toISOString(),
            },
          ],
        };
      }
    );

    try {
      const response = await fetch(`/api/conversations/${activeConversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, industryId }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value, { stream: true });
          const lines = text.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.done) {
                  break;
                }
                if (data.content) {
                  fullContent += data.content;
                  setStreamingContent(fullContent);
                }
                if (data.error) {
                  console.error("Stream error:", data.error);
                }
              } catch {
                // Skip malformed JSON lines
              }
            }
          }
        }
      }

      // Refresh conversation to get saved messages
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", activeConversationId] });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsStreaming(false);
      setStreamingContent("");
    }
  }, [inputValue, activeConversationId, isStreaming, queryClient, industryId]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const messages = activeConversation?.messages || [];

  return (
    <div className="flex h-full">
      {/* Conversation Sidebar */}
      <div className="w-72 border-r flex flex-col bg-muted/30">
        <div className="p-3 border-b">
          <Button
            onClick={() => createConversation.mutate()}
            disabled={createConversation.isPending}
            className="w-full gap-2"
            size="sm"
          >
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {loadingConversations ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))
            ) : conversations.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8 px-4">
                No conversations yet. Start a new chat!
              </p>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm cursor-pointer group transition-colors ${
                    activeConversationId === conv.id
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted"
                  }`}
                  onClick={() => setActiveConversationId(conv.id)}
                >
                  <MessageSquare className="h-4 w-4 shrink-0" />
                  <span className="truncate flex-1">{conv.title}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation.mutate(conv.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {!activeConversationId ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-xl font-semibold">AI Chat Assistant</h2>
              <p className="text-muted-foreground max-w-md">
                Ask questions about {current?.name ?? "your active industry"} —
                domains, roles, salary benchmarks, certifications and initiatives.
                The bot is grounded in this platform's live data.
              </p>
              <Button
                onClick={() => createConversation.mutate()}
                disabled={createConversation.isPending}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Start a Conversation
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="max-w-3xl mx-auto space-y-4">
                {loadingMessages ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))
                ) : messages.length === 0 && !streamingContent ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Bot className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Send a message to start the conversation.</p>
                  </div>
                ) : (
                  <>
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex gap-3 ${
                          msg.role === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        {msg.role === "assistant" && (
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                            <Bot className="h-4 w-4 text-primary" />
                          </div>
                        )}
                        <Card
                          className={`px-4 py-3 max-w-[80%] ${
                            msg.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        </Card>
                        {msg.role === "user" && (
                          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 mt-1">
                            <User className="h-4 w-4 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Streaming message */}
                    {streamingContent && (
                      <div className="flex gap-3 justify-start">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                          <Bot className="h-4 w-4 text-primary" />
                        </div>
                        <Card className="px-4 py-3 max-w-[80%] bg-muted">
                          <p className="text-sm whitespace-pre-wrap">{streamingContent}</p>
                        </Card>
                      </div>
                    )}

                    {/* Streaming indicator */}
                    {isStreaming && !streamingContent && (
                      <div className="flex gap-3 justify-start">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                          <Bot className="h-4 w-4 text-primary" />
                        </div>
                        <Card className="px-4 py-3 bg-muted">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Thinking...
                          </div>
                        </Card>
                      </div>
                    )}
                  </>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="border-t p-4">
              <div className="max-w-3xl mx-auto flex gap-2">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  disabled={isStreaming}
                  className="flex-1"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!inputValue.trim() || isStreaming}
                  size="icon"
                >
                  {isStreaming ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
