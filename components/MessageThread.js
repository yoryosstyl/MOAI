'use client';

import { useState, useEffect, useRef } from 'react';
import UserAvatar from './UserAvatar';

export default function MessageThread({
  messages,
  currentUserId,
  otherUser,
  onSendMessage,
  onDeleteMessage,
}) {
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      await onSendMessage(newMessage);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    }
    setSending(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Format timestamp
  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Group messages by sender for better UX
  const getMessageGroups = () => {
    const groups = [];
    let currentGroup = null;

    messages.forEach((message) => {
      if (!currentGroup || currentGroup.senderId !== message.senderId) {
        currentGroup = {
          senderId: message.senderId,
          senderName: message.senderName,
          senderPhotoURL: message.senderPhotoURL,
          messages: [message],
        };
        groups.push(currentGroup);
      } else {
        currentGroup.messages.push(message);
      }
    });

    return groups;
  };

  const messageGroups = getMessageGroups();

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            No messages yet. Start the conversation!
          </div>
        ) : (
          <>
            {messageGroups.map((group, groupIndex) => {
              const isCurrentUser = group.senderId === currentUserId;

              return (
                <div
                  key={groupIndex}
                  className={`flex gap-2 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  <div className="flex-shrink-0 mt-auto">
                    <UserAvatar
                      photoURL={isCurrentUser ? null : group.senderPhotoURL}
                      name={group.senderName}
                      size="sm"
                    />
                  </div>

                  {/* Messages in group */}
                  <div className={`flex flex-col gap-1 max-w-xs lg:max-w-md ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                    {group.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`relative group ${isCurrentUser ? 'text-right' : 'text-left'}`}
                      >
                        {/* Message bubble */}
                        <div
                          className={`inline-block px-4 py-2 rounded-2xl break-words ${
                            isCurrentUser
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-900'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                        </div>

                        {/* Delete button (only for current user's messages) */}
                        {isCurrentUser && (
                          <button
                            onClick={() => onDeleteMessage(message.id)}
                            className="absolute -left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-600"
                            title="Delete for me"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        )}

                        {/* Timestamp and read receipt */}
                        <div className={`mt-0.5 text-xs ${isCurrentUser ? 'text-gray-400 text-right' : 'text-gray-500 text-left'}`}>
                          <span>{formatMessageTime(message.createdAt)}</span>
                          {isCurrentUser && (
                            <span className="ml-1">
                              {message.readAt ? (
                                <span className="text-blue-500" title="Read">
                                  ✓✓
                                </span>
                              ) : (
                                <span className="text-gray-400" title="Delivered">
                                  ✓
                                </span>
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4">
        <div className="flex gap-2">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            rows="1"
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">Press Enter to send, Shift+Enter for new line</p>
      </form>
    </div>
  );
}
