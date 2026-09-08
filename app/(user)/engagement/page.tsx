'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, MessageCircle, Send, Loader2, User, Search, ArrowLeft, Brain, Sparkles } from 'lucide-react';
import { FaInstagram, FaFacebook, FaLinkedin, FaYoutube } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useCurrentBusiness } from '@/hooks/use-current-business';
import { cn } from '@/lib/utils';

type Channel = 'instagram' | 'facebook' | 'linkedin' | 'twitter' | 'youtube';

interface Participant {
  id: string;
  username: string;
}

interface Conversation {
  id: string;
  updatedTime: string;
  participants: Participant[];
}

interface Message {
  id: string;
  text: string;
  from: {
    id: string;
    username: string;
  };
  createdAt: string;
}

export default function EngagementPage() {
  const { businessId, isLoading: businessLoading } = useCurrentBusiness();
  const [selectedChannel, setSelectedChannel] = useState<Channel>('instagram');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch conversations
  useEffect(() => {
    if (!businessId) return;

    const fetchConversations = async () => {
      setLoadingConversations(true);
      try {
        const res = await fetch(`/api/social/chat/${selectedChannel}/conversations?businessId=${businessId}`);
        const data = await res.json();
        if (data.success) {
          setConversations(data.conversations);
        } else {
          toast.error('Failed to load conversations', { description: data.error });
        }
      } catch {
        toast.error('Error loading conversations');
      } finally {
        setLoadingConversations(false);
      }
    };

    fetchConversations();
  }, [businessId, selectedChannel]);

  // Fetch messages when conversation selected
  useEffect(() => {
    if (!selectedConversation || !businessId) return;

    const fetchMessages = async () => {
      setLoadingMessages(true);
      try {
        const res = await fetch(`/api/social/chat/${selectedChannel}/messages?threadId=${selectedConversation.id}&businessId=${businessId}`);
        const data = await res.json();
        if (data.success) {
          setMessages(data.messages.reverse());
        } else {
          toast.error('Failed to load messages');
        }
      } catch {
        toast.error('Error loading messages');
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [selectedConversation, businessId, selectedChannel]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedConversation || !businessId || sending) return;

    const recipient = selectedConversation.participants.find(p => p.id !== businessId);
    const recipientId = recipient?.id || selectedConversation.participants[0].id;

    setSending(true);
    try {
      const res = await fetch(`/api/social/chat/${selectedChannel}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId,
          threadId: selectedConversation.id,
          message: replyText,
          businessId
        })
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Message dispatched');
        setReplyText('');

        const msgRes = await fetch(`/api/social/chat/${selectedChannel}/messages?threadId=${selectedConversation.id}&businessId=${businessId}`);
        const msgData = await msgRes.json();
        if (msgData.success) {
          setMessages(msgData.messages.reverse());
        }
      } else {
        toast.error('Failed to send message', { description: data.error });
      }
    } catch {
      toast.error('Error sending message');
    } finally {
      setSending(false);
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.participants.some(p => p.username.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getChannelName = (channel: Channel) => {
    switch (channel) {
      case 'instagram': return 'Instagram';
      case 'facebook': return 'Facebook';
      case 'linkedin': return 'LinkedIn';
      case 'twitter': return 'X';
      case 'youtube': return 'YouTube';
      default: return channel;
    }
  };

  const getChannelIcon = (channel: Channel) => {
    switch (channel) {
      case 'instagram': return <FaInstagram className="h-3.5 w-3.5" />;
      case 'facebook': return <FaFacebook className="h-3.5 w-3.5" />;
      case 'linkedin': return <FaLinkedin className="h-3.5 w-3.5" />;
      case 'twitter': return <FaXTwitter className="h-3.5 w-3.5" />;
      case 'youtube': return <FaYoutube className="h-3.5 w-3.5" />;
      default: return <MessageSquare className="h-3.5 w-3.5" />;
    }
  };

  if (businessLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-card border border-border/80 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-mono font-semibold uppercase text-muted-foreground">
              Direct Inbound Inbox
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            Social Engagement
            <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary">
              Unified Inbox
            </Badge>
          </h1>
          <p className="text-xs text-muted-foreground">
            Monitor and respond to customer direct messages across all connected channels.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="h-9 rounded-xl px-3.5 text-xs font-semibold gap-1.5 self-start sm:self-auto"
          onClick={() => {
            toast.promise(fetch('/api/engagement/process', { method: 'POST' }), {
              loading: 'Running AI Engagement Assistant...',
              success: 'AI processed recent engagement payload!',
              error: 'Failed to run AI assistant'
            });
          }}
        >
          <Brain className="h-3.5 w-3.5 text-primary" />
          <span>Run AI Responder</span>
        </Button>
      </div>

      {/* Channel Switcher */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {(['instagram', 'facebook', 'linkedin', 'twitter', 'youtube'] as Channel[]).map((channel) => (
          <Button
            key={channel}
            variant={selectedChannel === channel ? 'default' : 'ghost'}
            size="sm"
            className={cn(
              'h-8 px-3 rounded-lg text-xs font-semibold gap-1.5 transition-all cursor-pointer shrink-0',
              selectedChannel === channel ? 'shadow-xs' : 'text-muted-foreground hover:text-foreground'
            )}
            onClick={() => {
              setSelectedChannel(channel);
              setSelectedConversation(null);
              setMessages([]);
            }}
          >
            {getChannelIcon(channel)}
            <span>{getChannelName(channel)}</span>
          </Button>
        ))}
      </div>

      {/* Main 2-Pane Chat Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[600px] overflow-hidden">
        {/* Left List */}
        <div className="lg:col-span-4 rounded-2xl border border-border/80 bg-card flex flex-col overflow-hidden shadow-xs">
          <div className="p-3 border-b border-border/70">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                className="pl-8 h-8 text-xs rounded-xl bg-secondary/30 border-border/70"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-border/60">
            {loadingConversations ? (
              <div className="p-3 space-y-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-12 rounded-xl bg-secondary/40 animate-pulse" />
                ))}
              </div>
            ) : filteredConversations.length > 0 ? (
              filteredConversations.map(conv => {
                const isSelected = selectedConversation?.id === conv.id;
                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={cn(
                      'w-full flex items-center gap-3 p-3 text-left transition-colors cursor-pointer',
                      isSelected ? 'bg-primary/10 border-l-2 border-primary' : 'hover:bg-secondary/30'
                    )}
                  >
                    <div className="h-9 w-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                      {conv.participants[0]?.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline gap-1">
                        <p className="text-xs font-bold text-foreground truncate">
                          {conv.participants.map(p => p.username).join(', ')}
                        </p>
                        <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                          {new Date(conv.updatedTime).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                        Active message thread
                      </p>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <MessageCircle className="h-8 w-8 text-muted-foreground mb-2 opacity-50" />
                <p className="text-xs font-semibold text-muted-foreground">No conversations found</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Chat Panel */}
        <div className="lg:col-span-8 rounded-2xl border border-border/80 bg-card flex flex-col overflow-hidden shadow-xs">
          {selectedConversation ? (
            <>
              {/* Top Chat Bar */}
              <div className="p-3.5 border-b border-border/70 flex items-center justify-between bg-card">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center text-foreground font-bold text-xs">
                    {selectedConversation.participants[0]?.username?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-foreground">
                      {selectedConversation.participants.map(p => p.username).join(', ')}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-500">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Connected</span>
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] font-mono border-border">
                  {getChannelName(selectedChannel)}
                </Badge>
              </div>

              {/* Message stream */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-secondary/10">
                {loadingMessages ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className={cn('flex', i % 2 === 0 ? 'justify-end' : '')}>
                        <div className="h-10 w-40 rounded-xl bg-secondary/50 animate-pulse" />
                      </div>
                    ))}
                  </div>
                ) : messages.length > 0 ? (
                  messages.map((msg) => {
                    const isMe = msg.from.id === businessId;
                    return (
                      <div key={msg.id} className={cn('flex', isMe ? 'justify-end' : 'justify-start')}>
                        <div
                          className={cn(
                            'max-w-[75%] p-3 rounded-2xl text-xs leading-relaxed shadow-xs',
                            isMe
                              ? 'bg-primary text-primary-foreground rounded-tr-xs'
                              : 'bg-card border border-border/80 text-foreground rounded-tl-xs'
                          )}
                        >
                          <p>{msg.text}</p>
                          <p className={cn('text-[9px] font-mono mt-1 text-right', isMe ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-xs">
                    <p className="italic">No messages recorded in this conversation yet</p>
                  </div>
                )}
              </div>

              {/* Input Footer */}
              <div className="p-3 border-t border-border/70 bg-card">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    placeholder="Type an instant reply..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="h-9 text-xs rounded-xl bg-secondary/30 border-border/70"
                    disabled={sending}
                  />
                  <Button
                    type="submit"
                    size="sm"
                    className="h-9 px-4 rounded-xl text-xs font-semibold gap-1.5 shadow-xs"
                    disabled={!replyText.trim() || sending}
                  >
                    {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                    <span>Reply</span>
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-16 px-4 text-center">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3 text-primary shadow-xs">
                <MessageSquare className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-foreground">Select a Conversation</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs leading-relaxed">
                Choose a customer thread from the sidebar to view chat history and dispatch responses.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
