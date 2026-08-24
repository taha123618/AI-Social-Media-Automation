'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, MessageCircle, Send, Loader2, User, Search, ArrowLeft, Brain } from 'lucide-react';
import { FaInstagram, FaFacebook, FaLinkedin, FaYoutube } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useCurrentBusiness } from '@/hooks/use-current-business';

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
      } catch (error) {
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
          setMessages(data.messages.reverse()); // Show oldest first
        } else {
          toast.error('Failed to load messages');
        }
      } catch (error) {
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

    // For some platforms, we use the participant who is not us as the recipient
    // For others (like Facebook/Instagram), the API handles threading or needs a specific recipient ID
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
        toast.success('Message sent');
        setReplyText('');
        
        // Re-fetch messages to show the new one
        const msgRes = await fetch(`/api/social/chat/${selectedChannel}/messages?threadId=${selectedConversation.id}&businessId=${businessId}`);
        const msgData = await msgRes.json();
        if (msgData.success) {
          setMessages(msgData.messages.reverse());
        }
      } else {
        toast.error('Failed to send message', { description: data.error });
      }
    } catch (error) {
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
      case 'instagram': return 'Instagram DM';
      case 'facebook': return 'Facebook Messenger';
      case 'linkedin': return 'LinkedIn';
      case 'twitter': return 'X';
      case 'youtube': return 'YouTube';
      default: return channel;
    }
  };

  const getChannelIcon = (channel: Channel) => {
    switch (channel) {
      case 'instagram': return <FaInstagram className="h-4 w-4" />;
      case 'facebook': return <FaFacebook className="h-4 w-4" />;
      case 'linkedin': return <FaLinkedin className="h-4 w-4" />;
      case 'twitter': return <FaXTwitter className="h-4 w-4" />;
      case 'youtube': return <FaYoutube className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getChannelColor = (channel: Channel) => {
    switch (channel) {
      case 'instagram': return 'bg-pink-600';
      case 'facebook': return 'bg-blue-600';
      case 'linkedin': return 'bg-blue-700';
      case 'twitter': return 'bg-slate-900';
      case 'youtube': return 'bg-red-600';
      default: return 'bg-blue-600';
    }
  };

  if (businessLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 h-[calc(100vh-80px)] max-h-250">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <MessageSquare className="h-8 w-8 text-blue-600" />
            Social Engagement
          </h1>
          <p className="text-slate-500 font-bold">Manage your DMs across Instagram, Facebook, and other channels to build stronger customer relationships.</p>
        </div>
        <Button
          variant="outline"
          className="rounded-xl border-2 font-bold"
          onClick={() => {
            toast.promise(fetch('/api/engagement/process', { method: 'POST' }), {
              loading: 'Running AI Engagement Assistant...',
              success: 'AI processed recent engagement!',
              error: 'Failed to run AI assistant'
            });
          }}
        >
          <Brain className="mr-2 h-4 w-4" />
          Run AI Assistant
        </Button>
      </header>

      <div className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {(['instagram', 'facebook', 'linkedin', 'twitter', 'youtube'] as Channel[]).map((channel) => (
          <Button
            key={channel}
            variant={selectedChannel === channel ? 'default' : 'outline'}
            className={`rounded-xl font-bold whitespace-nowrap ${selectedChannel === channel
              ? `${getChannelColor(channel)} hover:opacity-90 text-white border-transparent`
              : 'border-2 border-slate-200 dark:border-slate-800'
              }`}
            onClick={() => {
              setSelectedChannel(channel);
              setSelectedConversation(null);
              setMessages([]);
            }}
          >
            <span className="mr-2">{getChannelIcon(channel)}</span>
            {getChannelName(channel)}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full overflow-hidden">
        {/* Sidebar - Conversation List */}
        <Card className="lg:col-span-4 rounded-[2rem] border-2 border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
          <CardHeader className="p-4 border-b border-slate-100 dark:border-slate-800">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search conversations..."
                className="pl-9 rounded-xl border-slate-200 dark:border-slate-800"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-y-auto">
            {loadingConversations ? (
              <div className="flex flex-col gap-2 p-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
                ))}
              </div>
            ) : filteredConversations.length > 0 ? (
              <div className="flex flex-col">
                {filteredConversations.map(conv => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`flex items-center gap-4 p-4 text-left transition-colors border-b border-slate-50 dark:border-slate-800/50 ${selectedConversation?.id === conv.id
                      ? 'bg-blue-50 dark:bg-blue-900/20'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                  >
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-black shrink-0">
                      {conv.participants[0]?.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className="font-black text-slate-900 dark:text-white truncate">
                          {conv.participants.map(p => p.username).join(', ')}
                        </p>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">
                          {new Date(conv.updatedTime).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-1">
                        Recent interaction
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                <MessageCircle className="h-12 w-12 text-slate-200 mb-4" />
                <p className="font-bold text-slate-500 uppercase tracking-tight">No conversations found</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Main Content - Chat Window */}
        <Card className="lg:col-span-8 rounded-[2rem] border-2 border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
          {selectedConversation ? (
            <>
              <CardHeader className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-black">
                    {selectedConversation.participants[0]?.username?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <CardTitle className="text-lg font-black tracking-tight">
                      {selectedConversation.participants.map(p => p.username).join(', ')}
                    </CardTitle>
                    <CardDescription className="text-[10px] uppercase font-bold tracking-widest text-green-500 flex items-center gap-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                      Active Thread
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="rounded-lg border-2 font-bold uppercase text-[10px]">
                  {getChannelName(selectedChannel)}
                </Badge>
              </CardHeader>

              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {loadingMessages ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : ''}`}>
                        <div className="h-12 w-48 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
                      </div>
                    ))}
                  </div>
                ) : messages.length > 0 ? (
                  messages.map((msg, idx) => {
                    const isMe = msg.from.id === businessId; // Simplified check
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${isMe
                          ? 'bg-blue-600 text-white rounded-tr-none'
                            : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-tl-none'
                          }`}>
                          <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                          <p className={`text-[10px] mt-1 ${isMe ? 'text-blue-100' : 'text-slate-400'}`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400">
                    <p className="font-bold italic">No messages yet</p>
                  </div>
                )}
              </CardContent>

              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    placeholder="Type your reply..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="rounded-xl border-2 border-slate-100 dark:border-slate-800 focus:ring-blue-500/10 focus:border-blue-500 font-medium"
                    disabled={sending}
                  />
                  <Button
                    type="submit"
                    className="rounded-xl bg-blue-600 hover:bg-blue-700 font-black px-6 shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                    disabled={!replyText.trim() || sending}
                  >
                    {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-20 px-4 text-center">
              <div className="h-20 w-20 rounded-3xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800">
                <MessageSquare className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Select a Conversation</h3>
              <p className="text-slate-500 font-bold mt-2 max-w-sm">
                Choose a chat from the left to start engaging with your audience.
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
