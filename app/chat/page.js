'use client';
import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { chatAPI } from '@/lib/api';
import { useUpload } from '@/hooks/useAPI';
import { useAuth } from '@/context/AuthContext';
import { formatEnumLabel, toDisplayText } from '@/lib/display';
import { getSocket } from '@/lib/socket';
import toast from 'react-hot-toast';
import { Send, ArrowLeft, MessageCircle, Image as ImageIcon } from 'lucide-react';

function ConversationItem({ conv, active, onClick }) {
  const other = conv.otherUser || conv.participant || {};
  const name = other.name || 'User';
  const profilePhoto = other.profilePhoto;
  const lastMsg = conv.lastMessageType === 'IMAGE'
    ? 'Photo'
    : toDisplayText(conv.lastMessage?.content || conv.lastMessage || conv.lastMessageText, '');
  const unread = conv.unreadCount || 0;

  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors ${
        active ? 'bg-orange-50 border border-orange-200' : 'hover:bg-gray-50'
      }`}>
      <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shrink-0 shadow-sm">
        {profilePhoto ? (
          <img src={profilePhoto} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-white font-bold text-sm">{name.charAt(0).toUpperCase()}</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
          {conv.updatedAt && (
            <span className="text-[10px] text-gray-400">
              {new Date(conv.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400 truncate">{lastMsg || 'No messages yet'}</p>
          {unread > 0 && (
            <span className="px-1.5 py-0.5 bg-orange-500 text-white text-[10px] rounded-full font-bold">{unread}</span>
          )}
        </div>
      </div>
    </button>
  );
}

export default function ChatPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const [showList, setShowList] = useState(true);
  const [socketReady, setSocketReady] = useState(false);
  const messagesEndRef = useRef(null);
  const imageInputRef = useRef(null);
  const activeConvRef = useRef(null);
  const { upload, loading: uploadingImage } = useUpload();

  const getConversationList = (payload) => {
    if (Array.isArray(payload)) return payload;
    return payload?.conversations || payload?._list || payload?.data || [];
  };

  const getMessageList = (payload) => {
    if (Array.isArray(payload)) return payload;
    return payload?.messages || payload?._list || payload?.data || [];
  };

  const mergeMessage = (incomingMessage) => {
    const nextMessage = {
      ...incomingMessage,
      senderId: incomingMessage.senderId || incomingMessage.sender?.id,
    };
    const isFromCurrentUser = nextMessage.senderId === user?.id;
    const isCurrentConversation = activeConvRef.current?.id === incomingMessage.conversationId;

    if (isCurrentConversation) {
      setMessages((prev) => {
        if (prev.some((item) => item.id === nextMessage.id)) return prev;
        return [...prev, nextMessage];
      });
    }

    setConversations((prev) => {
      const existing = prev.find((conv) => conv.id === incomingMessage.conversationId);
      const updatedConversation = existing
        ? {
            ...existing,
            lastMessage: incomingMessage.content,
            lastMessageType: incomingMessage.type,
            lastMessageAt: incomingMessage.createdAt || new Date().toISOString(),
            unreadCount: isCurrentConversation
              ? 0
              : isFromCurrentUser
                ? (existing.unreadCount || 0)
                : (existing.unreadCount || 0) + 1,
          }
        : null;

      if (updatedConversation) {
        return [updatedConversation, ...prev.filter((conv) => conv.id !== incomingMessage.conversationId)];
      }

      return prev;
    });
  };

  // Load conversations
  useEffect(() => {
    chatAPI.getConversations()
      .then(({ data }) => {
        const list = getConversationList(data);
        setConversations(list);
      })
      .catch(() => toast.error('Failed to load conversations'))
      .finally(() => setLoadingConvs(false));
  }, []);

  useEffect(() => {
    const requestedConversationId = searchParams.get('conversation');
    if (!requestedConversationId || !conversations.length) return;

    const matchedConversation = conversations.find((conv) => conv.id === requestedConversationId);
    if (matchedConversation) {
      setActiveConv(matchedConversation);
      setShowList(false);
    }
  }, [conversations, searchParams]);

  useEffect(() => {
    activeConvRef.current = activeConv;
  }, [activeConv]);

  // Load messages when conversation changes
  useEffect(() => {
    if (!activeConv) return;
    setLoadingMsgs(true);
    chatAPI.getMessages(activeConv.id)
      .then(({ data }) => setMessages(getMessageList(data)))
      .catch(() => toast.error('Failed to load messages'))
      .finally(() => setLoadingMsgs(false));
  }, [activeConv]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleConnect = () => setSocketReady(true);
    const handleDisconnect = () => setSocketReady(false);
    const handleNewMessage = (payload) => {
      mergeMessage(payload);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('new_message', handleNewMessage);
    if (socket.connected) setSocketReady(true);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('new_message', handleNewMessage);
    };
  }, []);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !activeConv?.id) return;
    socket.emit('join_conversation', { conversationId: activeConv.id });

    return () => {
      socket.emit('leave_conversation', { conversationId: activeConv.id });
    };
  }, [activeConv?.id]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !activeConv) return;
    setSending(true);
    try {
      const messageText = input.trim();
      const socket = getSocket();
      if (!socket) {
        toast.error('Please login again to continue chatting');
        return;
      }

      socket.emit('send_message', {
        conversationId: activeConv.id,
        content: messageText,
        type: 'TEXT',
      });
      setConversations((prev) => prev.map((conv) => (
        conv.id === activeConv.id
          ? { ...conv, lastMessage: messageText, lastMessageType: 'TEXT', lastMessageAt: new Date().toISOString(), unreadCount: 0 }
          : conv
      )));
      setInput('');
    } catch {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const selectConversation = (conv) => {
    setActiveConv(conv);
    setShowList(false);
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !activeConv) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setSending(true);
    try {
      const uploaded = await upload('/users/upload-image', file, { folder: 'projectx/chat' });
      const imageUrl = uploaded.imageUrl;
      const socket = getSocket();
      if (!socket) {
        toast.error('Please login again to continue chatting');
        return;
      }

      socket.emit('send_message', {
        conversationId: activeConv.id,
        content: imageUrl,
        type: 'IMAGE',
        metadata: {
          imageUrl,
          originalName: file.name,
        },
      });
      setConversations((prev) => prev.map((conv) => (
        conv.id === activeConv.id
          ? { ...conv, lastMessage: imageUrl, lastMessageType: 'IMAGE', lastMessageAt: new Date().toISOString(), unreadCount: 0 }
          : conv
      )));
    } catch {
      toast.error('Failed to send image');
    } finally {
      setSending(false);
      event.target.value = '';
    }
  };

  const otherUser = activeConv?.otherUser || activeConv?.participant || {};

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 flex flex-col overflow-x-hidden">
        <Navbar />
        <div className="flex-1 max-w-6xl w-full mx-auto flex bg-white border border-gray-100 rounded-t-2xl mt-2 overflow-hidden" style={{ height: 'calc(100vh - 80px)' }}>

          {/* Conversation List */}
          <div className={`w-full md:w-80 md:border-r border-gray-100 flex flex-col ${!showList && activeConv ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Messages</h2>
            </div>
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-2">
              {loadingConvs ? (
                <div className="space-y-2 p-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex gap-3 p-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 animate-pulse rounded w-1/2" />
                        <div className="h-3 bg-gray-200 animate-pulse rounded w-3/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : conversations.length === 0 ? (
                <div className="text-center py-16 px-4">
                  <MessageCircle className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No conversations yet</p>
                  <p className="text-xs text-gray-400 mt-1">Start a chat from a property or roommate profile</p>
                </div>
              ) : (
                conversations.map(conv => (
                  <ConversationItem key={conv.id} conv={conv} active={activeConv?.id === conv.id} onClick={() => selectConversation(conv)} />
                ))
              )}
            </div>
          </div>

          {/* Message Thread */}
          <div className={`flex-1 flex flex-col ${showList && !activeConv ? 'hidden md:flex' : 'flex'}`}>
            {!activeConv ? (
              <div className="flex-1 flex items-center justify-center text-center p-8">
                <div>
                  <MessageCircle className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Select a conversation</h3>
                  <p className="text-sm text-gray-500">Choose a conversation from the left to start chatting</p>
                </div>
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <div className="flex items-center gap-3 p-4 border-b border-gray-100">
                  <button onClick={() => { setShowList(true); setActiveConv(null); }} className="md:hidden p-1 text-gray-500">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-sm">
                    {otherUser.profilePhoto ? (
                      <img src={otherUser.profilePhoto} alt={otherUser.name || 'User'} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white font-bold">{(otherUser.name || 'U').charAt(0)}</span>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{otherUser.name || 'User'}</p>
                    {activeConv.context && (
                      <p className="text-[10px] text-gray-400">
                        via {formatEnumLabel(activeConv.context)}
                      </p>
                    )}
                    <p className="text-[10px] text-gray-400">{socketReady ? 'Live' : 'Reconnecting...'}</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-3">
                  {loadingMsgs ? (
                    <div className="space-y-3">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className={`flex ${i % 2 ? 'justify-end' : ''}`}>
                          <div className={`h-8 rounded-2xl animate-pulse ${i % 2 ? 'bg-orange-200 w-1/3' : 'bg-gray-200 w-2/5'}`} />
                        </div>
                      ))}
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-sm text-gray-400">No messages yet. Say hello!</p>
                    </div>
                  ) : (
                    messages.map((msg, i) => {
                      const isMe = msg.senderId === user?.id || msg.sender?.id === user?.id || msg.sender === user?.id;
                      const body = toDisplayText(msg.content || msg.text || msg.message, '');
                      const imageUrl = msg.type === 'IMAGE' ? (msg.metadata?.imageUrl || msg.content) : '';
                      return (
                        <div key={msg.id || i} className={`flex ${isMe ? 'justify-end' : ''}`}>
                          <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
                            isMe ? 'bg-orange-500 text-white rounded-br-md' : 'bg-gray-100 text-gray-800 rounded-bl-md'
                          }`}>
                            {imageUrl ? (
                              <a href={imageUrl} target="_blank" rel="noreferrer">
                                <img src={imageUrl} alt="Chat upload" className="max-h-64 max-w-full h-auto rounded-xl object-cover" />
                              </a>
                            ) : (
                              <p className="whitespace-pre-wrap break-words">{body}</p>
                            )}
                            <p className={`text-[10px] mt-1 ${isMe ? 'text-orange-200' : 'text-gray-400'}`}>
                              {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSend} className="p-4 border-t border-gray-100 flex gap-2">
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    disabled={sending || uploadingImage}
                    className="btn-secondary p-3 rounded-xl"
                  >
                    <ImageIcon className="w-5 h-5" />
                  </button>
                  <input type="text" value={input} onChange={e => setInput(e.target.value)}
                    placeholder="Type a message..." className="input-field flex-1" disabled={sending} />
                  <button type="submit" disabled={sending || !input.trim()}
                    className="btn-primary p-3 rounded-xl">
                    {sending ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send className="w-5 h-5" />}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
