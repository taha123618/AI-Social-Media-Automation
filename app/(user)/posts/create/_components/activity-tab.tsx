'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Smile, Sparkles, MoreHorizontal, ArrowLeft, Send, PenSquare, Trash2, Edit2, Loader2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import EmojiPicker from 'emoji-picker-react';
import { useSession } from '@/lib/auth-client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';

interface ActivityTabProps {
  draftId?: string;
  selectedAccount?: {
    username: string;
  };
  onOpenAI?: () => void;
}

export interface ActivityComment {
  id: string;
  author: {
    id: string;
    name: string;
    image?: string;
  } | string;
  content: string;
  createdAt: string | Date;
  replies: ActivityComment[];
  reaction?: string;
}

function CommentCard({
  comment,
  onReply,
  parentId,
  isRootInThread,
  onEdit,
  onDelete,
  onReaction,
  currentUserId,
}: {
  comment: any;
  onReply?: () => void;
  parentId?: string;
  isRootInThread?: boolean;
  onEdit: (id: string, text: string) => void;
  onDelete: (id: string) => void;
  onReaction: (id: string, emoji: string) => void;
  currentUserId?: string;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content || '');

  const saveEdit = () => {
    if (editText.trim()) {
      onEdit(comment.id, editText);
    }
    setIsEditing(false);
  };

  const authorName = typeof comment.author === 'object' ? comment.author.name : comment.author;
  const authorId = typeof comment.author === 'object' ? comment.author.id : null;
  const isAuthor = authorId === currentUserId;

  return (
    <div
      className="border border-slate-200 rounded-xl bg-white flex flex-col relative group transition-all"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-3">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#E8F3FF] text-[#1877F2] flex items-center justify-center text-[10px] font-bold">
              {authorName?.charAt(0) || 'U'}
            </div>
            <span className="text-[14px] font-semibold text-slate-800 tracking-tight">{authorName}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-slate-400 font-medium">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </span>
            {isAuthor && (
              <Popover>
                <PopoverTrigger asChild>
                  <button className={`h-6 w-6 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-32 p-1 rounded-xl shadow-lg border-slate-200 bg-white" align="end">
                  <div className="flex flex-col">
                    <button
                      className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg text-left"
                      onClick={() => { setIsEditing(true); setEditText(comment.content); }}
                    >
                      <Edit2 className="h-4 w-4" /> Edit
                    </button>
                    <button
                      className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg text-left"
                      onClick={() => onDelete(comment.id)}
                    >
                      <Trash2 className="h-4 w-4" /> Delete
                    </button>
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>

        <div className="pl-8 pb-1">
          {isEditing ? (
            <div className="flex flex-col gap-2 mt-1 mb-2">
              <textarea
                value={editText}
                onChange={e => setEditText(e.target.value)}
                className="w-full text-black text-[14px] p-2 border border-slate-200 rounded-lg focus:outline-blue-500 min-h-[60px] resize-none"
                autoFocus
              />
              <div className="flex items-center gap-2 self-end">
                <Button variant="ghost" size="sm" className="h-7 text-xs text-slate-500" onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button size="sm" className="h-7 text-xs bg-blue-600" onClick={saveEdit}>Save</Button>
              </div>
            </div>
          ) : (
            <p className="text-[14px] text-slate-800 leading-snug whitespace-pre-wrap">{comment.content}</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between px-3 py-2.5 border-t border-slate-100 bg-slate-50/50 rounded-b-xl">
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="flex items-center gap-1.5 text-[13px] text-slate-500 font-medium px-2 py-0.5 hover:bg-slate-200/50 rounded-md transition-colors">
                <Smile className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 border-none shadow-xl rounded-xl z-[99]" align="start" side="top">
              <EmojiPicker onEmojiClick={(emojiObject) => onReaction(comment.id, emojiObject.emoji)} />
            </PopoverContent>
          </Popover>
        </div>
        {!isRootInThread && !parentId && onReply && (
          <button
            onClick={onReply}
            className="text-[13px] text-slate-500 font-semibold hover:text-slate-800 hover:underline px-2 relative"
          >
            Reply
            {comment.replies && comment.replies.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[9px] font-bold rounded-full h-4 w-4 flex items-center justify-center border border-white dark:border-slate-900">
                {comment.replies.length}
              </span>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

export function ActivityTab({ draftId, selectedAccount, onOpenAI }: ActivityTabProps) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [commentInput, setCommentInput] = useState('');
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async ({ content, parentId }: { content: string, parentId?: string }) => {
      const res = await fetch('/api/contents/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.user?.id}`
        },
        body: JSON.stringify({ draftId, content, parentId }),
      });
      if (!res.ok) throw new Error('Failed to add comment');
      return res.json();
    },
    onMutate: async (variables) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['comments', draftId] });

      // Snapshot the previous value
      const previousComments = queryClient.getQueryData(['comments', draftId]);

      // Optimistically update the cache
      queryClient.setQueryData(['comments', draftId], (old: any) => {
        if (!old) return old;

        const newComment = {
          id: `temp-${Date.now()}`,
          content: variables.content,
          authorId: session?.user?.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          parentId: variables.parentId || null,
          author: {
            id: session?.user?.id,
            name: session?.user?.name,
            email: session?.user?.email,
            image: session?.user?.image,
          },
          replies: []
        };

        if (variables.parentId) {
          // This is a reply, add it to the parent's replies
          return old.map((comment: any) => {
            if (comment.id === variables.parentId) {
              return {
                ...comment,
                replies: [...(comment.replies || []), newComment]
              };
            }
            return comment;
          });
        } else {
          // This is a new comment, add to the list
          return [...old, newComment];
        }
      });

      return { previousComments };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, roll back to the previous value
      if (context?.previousComments) {
        queryClient.setQueryData(['comments', draftId], context.previousComments);
      }
      toast.error('Failed to add comment');
    },
    onSettled: () => {
    // Always refetch after error or success to ensure server state
      queryClient.invalidateQueries({ queryKey: ['comments', draftId] });
    },
    onSuccess: (data, variables) => {
      setCommentInput('');
      toast.success(variables.parentId ? 'Reply added' : 'Comment added');
    },
  });

  // Listen for AI-generated comments
  useEffect(() => {
    const handleAIComment = async (event: Event) => {
      const { content, draftId: eventDraftId } = (event as CustomEvent).detail;
      if (eventDraftId === draftId && content.trim()) {
        // Add the AI-generated content as a comment
        addCommentMutation.mutate({ content: content.trim() });
      }
    };

    window.addEventListener('ai-comment-generated', handleAIComment as EventListener);
    return () => {
      window.removeEventListener('ai-comment-generated', handleAIComment as EventListener);
    };
  }, [draftId, addCommentMutation]);

  // Fetch comments
  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['comments', draftId],
    queryFn: async () => {
      if (!draftId) return [];
      const res = await fetch(`/api/contents/comments?draftId=${draftId}`, {
        headers: {
          'Authorization': `Bearer ${session?.user?.id}`
        }
      });
      if (!res.ok) throw new Error('Failed to fetch comments');
      return res.json();
    },
    enabled: !!draftId && !!session?.user?.id,
  });

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const res = await fetch(`/api/contents/comments?id=${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.user?.id}`
        }
      });
      if (!res.ok) throw new Error('Failed to delete comment');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', draftId] });
      toast.success('Comment deleted');
    },
  });

  const handleSendComment = () => {
    if (!commentInput.trim() || !draftId) return;
    addCommentMutation.mutate({
      content: commentInput.trim(),
      parentId: activeThreadId || undefined
    });
  };

  const activeThread = activeThreadId ? comments.find((c: any) => c.id === activeThreadId) : null;
  const activeUser = session?.user?.name || 'You';

  return (
    <div className="m-0 flex flex-col h-full bg-white relative overflow-hidden">
      {activeThreadId && activeThread && (
        <div className="bg-white px-4 py-3 border-b border-slate-200 flex items-center gap-3 shadow-sm z-10 shrink-0">
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100 rounded-full" onClick={() => setActiveThreadId(null)}>
            <ArrowLeft className="h-5 w-5 text-slate-500" />
          </Button>
          <div className="text-[15px] font-semibold text-slate-800 flex items-center gap-1">
            Thread by <span className="bg-[#E4F2FF] text-[#1877F2] text-[10px] w-5 h-5 rounded-full flex items-center justify-center -ml-0.5 ml-1 mr-0.5">{activeThread.author.name?.charAt(0)}</span> {activeThread.author.name}
          </div>
        </div>
      )}

      <div className="flex-1 p-5 space-y-5 overflow-y-auto bg-white">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          </div>
        ) : !activeThreadId ? (
          <>
            <div className="space-y-1">
              <div className="text-[14px] text-[#050505]"><span className="font-semibold text-[#050505]">{activeUser}</span> created this post</div>
              <div className="text-[12px] text-[#65676B]">Activity log updated</div>
            </div>

            {comments.map((comment: any) => (
              <CommentCard
                key={comment.id}
                comment={comment}
                currentUserId={session?.user?.id}
                onReply={() => setActiveThreadId(comment.id)}
                onEdit={(id, text) => {}} // TODO: Implement edit mutation if needed
                onDelete={(id) => deleteCommentMutation.mutate(id)}
                onReaction={(id, emoji) => {}}
              />
            ))}
          </>
        ) : (
          <>
            {activeThread && (
              <div className="space-y-4">
                <CommentCard
                  comment={activeThread}
                  currentUserId={session?.user?.id}
                  isRootInThread={true}
                  onEdit={(id, text) => {}}
                  onDelete={(id) => deleteCommentMutation.mutate(id)}
                  onReaction={(id, emoji) => {}}
                />

                <div className="border-t border-slate-200 pt-4 flex items-center">
                  <span className="text-[14px] font-semibold text-slate-800">{activeThread.replies?.length || 0} {activeThread.replies?.length === 1 ? 'reply' : 'replies'}</span>
                </div>

                {activeThread.replies?.map((reply: any) => (
                  <CommentCard
                    key={reply.id}
                    comment={reply}
                    currentUserId={session?.user?.id}
                    parentId={activeThread.id}
                    onEdit={(id, text) => {}}
                    onDelete={(id) => deleteCommentMutation.mutate(id)}
                    onReaction={(id, emoji) => {}}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <div className="p-4 bg-[#f0f2f5] border-t border-slate-200 w-full shrink-0 relative z-10 mt-auto">
        {!draftId ? (
          <div className="text-center p-2 text-xs text-slate-400 bg-white rounded-lg border border-dashed border-slate-300">
            Save post as draft to enable commenting
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden flex flex-col focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <input
              type="text"
              value={commentInput}
              disabled={addCommentMutation.isPending}
              onChange={(e) => setCommentInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSendComment();
                }
              }}
              placeholder={activeThreadId ? "Reply to thread..." : "Write a comment..."}
              className="w-full text-[14px] p-3 outline-none text-[#050505] placeholder-[#65676B] disabled:opacity-50"
            />
            <div className="px-3 py-2 flex items-center justify-between border-t border-slate-100">
              <div className="flex gap-2 text-slate-500">
                <Popover>
                  <PopoverTrigger asChild>
                    <Smile className="h-6 w-6 bg-[#f0f2f5] p-[3px] rounded-full text-slate-600 cursor-pointer hover:bg-slate-200" />
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 border-none shadow-xl rounded-xl z-[99]" align="start">
                    <EmojiPicker onEmojiClick={(emojiObject) => setCommentInput(prev => prev + emojiObject.emoji)} />
                  </PopoverContent>
                </Popover>
                <Sparkles className="h-6 w-6 bg-[#f0f2f5] p-[3px] rounded-full text-slate-600 cursor-pointer hover:bg-slate-200" onClick={onOpenAI} />
              </div>
              <Button
                onClick={handleSendComment}
                disabled={addCommentMutation.isPending || !commentInput.trim()}
                className="bg-[#e4e6eb] hover:bg-[#d8dadf] text-[#050505] font-semibold h-8 rounded-md px-4 py-1 text-sm shadow-none disabled:opacity-50"
              >
                {addCommentMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'SEND'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

