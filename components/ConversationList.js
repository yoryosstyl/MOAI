'use client';

import { useState, useEffect } from 'react';
import UserAvatar from './UserAvatar';

export default function ConversationList({
  conversations,
  currentUserId,
  selectedConversationId,
  onSelectConversation,
}) {
  // Get other participant data
  const getOtherParticipant = (conversation) => {
    const otherUserId = conversation.participants.find((id) => id !== currentUserId);
    return conversation.participantData?.[otherUserId] || null;
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    // Less than 1 minute
    if (diff < 60000) {
      return 'Just now';
    }

    // Less than 1 hour
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes}m ago`;
    }

    // Less than 1 day
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours}h ago`;
    }

    // Less than 1 week
    if (diff < 604800000) {
      const days = Math.floor(diff / 86400000);
      return `${days}d ago`;
    }

    // More than 1 week
    return date.toLocaleDateString();
  };

  if (!conversations || conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
        <p className="text-sm text-gray-500 mb-4">Start connecting with other artists</p>
        <div className="space-y-2">
          <a
            href="/projects"
            className="block text-sm text-blue-600 hover:text-blue-800 hover:underline"
          >
            Browse Projects →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto h-full">
      {conversations.map((conversation) => {
        const otherUser = getOtherParticipant(conversation);
        const unreadCount = conversation.unreadCount?.[currentUserId] || 0;
        const isSelected = conversation.id === selectedConversationId;

        return (
          <button
            key={conversation.id}
            onClick={() => onSelectConversation(conversation)}
            className={`w-full flex items-start gap-3 p-4 hover:bg-gray-50 transition border-b border-gray-100 ${
              isSelected ? 'bg-blue-50 hover:bg-blue-50' : ''
            }`}
          >
            {/* Avatar */}
            <div className="relative">
              <UserAvatar
                photoURL={otherUser?.photoURL}
                name={otherUser?.name}
                size="md"
              />
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{unreadCount}</span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center justify-between mb-1">
                <h4 className={`text-sm font-semibold truncate ${unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'}`}>
                  {otherUser?.name || 'Unknown User'}
                </h4>
                <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                  {formatTimestamp(conversation.lastMessageTimestamp)}
                </span>
              </div>
              {conversation.lastMessage && (
                <p className={`text-sm truncate ${unreadCount > 0 ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
                  {conversation.lastMessageSenderId === currentUserId && 'You: '}
                  {conversation.lastMessage}
                </p>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
