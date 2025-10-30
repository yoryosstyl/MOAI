'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import ConversationList from '@/components/ConversationList';
import MessageThread from '@/components/MessageThread';
import UserAvatar from '@/components/UserAvatar';
import {
  getUserConversations,
  getConversationMessages,
  sendMessage,
  markMessagesAsRead,
  deleteMessage,
} from '@/utils/messages';

export default function MessagesPage() {
  const searchParams = useSearchParams();
  const conversationIdFromUrl = searchParams?.get('conversation');
  const { user, userProfile } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      if (!user) return;

      try {
        const convs = await getUserConversations(user.uid);
        setConversations(convs);
        setLoading(false);

        // Auto-select conversation from URL parameter
        if (conversationIdFromUrl && convs.length > 0) {
          const targetConv = convs.find((c) => c.id === conversationIdFromUrl);
          if (targetConv && !selectedConversation) {
            setSelectedConversation(targetConv);
          }
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
        setLoading(false);
      }
    };

    fetchConversations();

    // Refresh conversations every 10 seconds
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, [user, conversationIdFromUrl]);

  // Fetch messages when conversation is selected
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedConversation || !user) return;

      setLoadingMessages(true);
      try {
        const msgs = await getConversationMessages(selectedConversation.id, user.uid);
        setMessages(msgs);

        // Mark messages as read
        await markMessagesAsRead(selectedConversation.id, user.uid);

        // Update conversation in list
        setConversations((prevConvs) =>
          prevConvs.map((conv) =>
            conv.id === selectedConversation.id
              ? { ...conv, unreadCount: { ...conv.unreadCount, [user.uid]: 0 } }
              : conv
          )
        );
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
      setLoadingMessages(false);
    };

    fetchMessages();

    // Refresh messages every 5 seconds when conversation is open
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [selectedConversation, user]);

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
  };

  const handleSendMessage = async (text) => {
    if (!selectedConversation || !user || !userProfile) return;

    const otherUserId = selectedConversation.participants.find((id) => id !== user.uid);
    const senderData = {
      name: userProfile.displayName || user.email,
      photoURL: userProfile.avatarUrl || null,
    };

    try {
      await sendMessage(selectedConversation.id, user.uid, senderData, otherUserId, text);

      // Refresh messages
      const msgs = await getConversationMessages(selectedConversation.id, user.uid);
      setMessages(msgs);

      // Refresh conversations to update last message
      const convs = await getUserConversations(user.uid);
      setConversations(convs);
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!confirm('Delete this message? (It will only be deleted for you)')) return;

    try {
      await deleteMessage(selectedConversation.id, messageId, user.uid);

      // Refresh messages
      const msgs = await getConversationMessages(selectedConversation.id, user.uid);
      setMessages(msgs);
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Failed to delete message');
    }
  };

  // Get other participant data
  const getOtherParticipant = (conversation) => {
    if (!conversation) return null;
    const otherUserId = conversation.participants.find((id) => id !== user.uid);
    return conversation.participantData?.[otherUserId] || null;
  };

  const otherUser = getOtherParticipant(selectedConversation);

  return (
    <ProtectedRoute>
      <div className="h-screen flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Conversations List */}
          <div className="w-full md:w-96 bg-white border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-700">Conversations</h2>
            </div>
            <div className="flex-1 overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">Loading conversations...</p>
                </div>
              ) : (
                <ConversationList
                  conversations={conversations}
                  currentUserId={user?.uid}
                  selectedConversationId={selectedConversation?.id}
                  onSelectConversation={handleSelectConversation}
                />
              )}
            </div>
          </div>

          {/* Message Thread */}
          <div className="flex-1 flex flex-col bg-gray-50">
            {selectedConversation ? (
              <>
                {/* Thread Header */}
                <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3">
                  <UserAvatar
                    photoURL={otherUser?.photoURL}
                    name={otherUser?.name}
                    size="md"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{otherUser?.name || 'Unknown User'}</h3>
                    <p className="text-sm text-gray-500">{otherUser?.email}</p>
                  </div>
                  {/* Future: Add block user button here */}
                </div>

                {/* Messages */}
                {loadingMessages ? (
                  <div className="flex-1 flex items-center justify-center">
                    <p className="text-gray-500">Loading messages...</p>
                  </div>
                ) : (
                  <MessageThread
                    messages={messages}
                    currentUserId={user?.uid}
                    otherUser={otherUser}
                    onSendMessage={handleSendMessage}
                    onDeleteMessage={handleDeleteMessage}
                  />
                )}
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                <svg
                  className="w-20 h-20 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <p className="text-lg font-medium">Select a conversation to start messaging</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
