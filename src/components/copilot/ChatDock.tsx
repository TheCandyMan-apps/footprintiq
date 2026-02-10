import { useState, useRef, useEffect } from "react";
import { Send, X, Minimize2, Maximize2, Sparkles, Globe, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Citation {
  url: string;
  title?: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  webSearchEnabled?: boolean;
}

interface ChatDockProps {
  contextType?: string;
  contextId?: string;
  workspaceId?: string;
}

export function ChatDock({ contextType, contextId, workspaceId }: ChatDockProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [enableWebSearch, setEnableWebSearch] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Keyboard shortcut: Cmd/Ctrl + /
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { 
      role: 'user', 
      content: input,
      webSearchEnabled: enableWebSearch 
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('copilot-chat', {
        body: {
          query: input,
          contextType,
          contextId,
          workspaceId,
          enableWebSearch,
        }
      });

      if (error) throw error;

      const assistantMessage: Message = { 
        role: 'assistant', 
        content: data.response,
        citations: data.webSearch?.citations?.map((url: string) => ({ url })) || [],
        webSearchEnabled: data.webSearch?.enabled || false,
      };
      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Copilot error:', error);
      toast.error('Failed to get response from AI Co-Pilot');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const extractDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
        size="icon"
      >
        <Sparkles className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card 
      className={`fixed bottom-6 right-6 shadow-2xl transition-all z-50 ${
        isMinimized ? 'h-14 w-80' : 'h-[600px] w-96'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">AI Co-Pilot</h3>
          {enableWebSearch && (
            <Badge variant="secondary" className="text-xs gap-1">
              <Globe className="h-3 w-3" />
              Web
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? (
              <Maximize2 className="h-4 w-4" />
            ) : (
              <Minimize2 className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <ScrollArea className="h-[400px] p-4" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="flex h-full items-center justify-center text-center text-muted-foreground">
                <div>
                  <p className="mb-2 text-sm">Ask me anything about your investigations</p>
                  <p className="text-xs">Try "Summarize findings" or "Search the web for..."</p>
                  {enableWebSearch && (
                    <p className="text-xs text-primary mt-2">Web search enabled - I'll search the web for real-time info</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div key={index}>
                    <div
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-lg px-3 py-2 ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        {message.role === 'user' && message.webSearchEnabled && (
                          <div className="flex items-center gap-1 text-xs opacity-70 mb-1">
                            <Globe className="h-3 w-3" />
                            Web search
                          </div>
                        )}
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                    
                    {/* Citations */}
                    {message.role === 'assistant' && message.citations && message.citations.length > 0 && (
                      <div className="mt-2 ml-2">
                        <p className="text-xs text-muted-foreground mb-1">Sources:</p>
                        <div className="flex flex-wrap gap-1">
                          {message.citations.slice(0, 5).map((citation, cidx) => (
                            <a
                              key={cidx}
                              href={citation.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs bg-muted hover:bg-muted/80 px-2 py-1 rounded transition-colors"
                            >
                              <img 
                                src={`https://www.google.com/s2/favicons?domain=${extractDomain(citation.url)}&sz=16`}
                                alt={`${extractDomain(citation.url)} favicon`}
                                className="w-3 h-3"
                              />
                              <span className="truncate max-w-[100px]">{extractDomain(citation.url)}</span>
                              <ExternalLink className="h-2.5 w-2.5 opacity-50" />
                            </a>
                          ))}
                          {message.citations.length > 5 && (
                            <span className="text-xs text-muted-foreground px-2 py-1">
                              +{message.citations.length - 5} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-lg bg-muted px-3 py-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {enableWebSearch ? 'Searching the web...' : 'Thinking...'}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Web Search Toggle */}
          <div className="border-t px-4 py-2 flex items-center justify-between bg-muted/30">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="web-search" className="text-xs text-muted-foreground cursor-pointer">
                Web Search (Perplexity)
              </Label>
            </div>
            <Switch
              id="web-search"
              checked={enableWebSearch}
              onCheckedChange={setEnableWebSearch}
              className="scale-75"
            />
          </div>

          {/* Input */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={enableWebSearch ? "Search the web or ask a question..." : "Ask AI Co-Pilot..."}
                className="min-h-[60px] resize-none"
                disabled={isLoading}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Press Cmd/Ctrl + / to toggle • Enter to send
              {enableWebSearch && <span className="text-primary"> • +2 credits for web search</span>}
            </p>
          </div>
        </>
      )}
    </Card>
  );
}