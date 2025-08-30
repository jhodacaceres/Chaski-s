import React, { useState } from 'react';
import { ArrowLeft, Filter, Search, Send, User } from 'lucide-react';
import { useMessages } from '../../hooks/useMessages';
import { useAuth } from '../../hooks/useAuth';

export const MessagesScreen: React.FC = () => {
  const { user } = useAuth();
  const { 
    conversations, 
    messages, 
    isLoading, 
    currentConversationId,
    fetchMessages, 
    sendMessage 
  } = useMessages();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  const handleSelectConversation = async (conversationId: string) => {
    setSelectedConversationId(conversationId);
    await fetchMessages(conversationId);
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() && selectedConversationId && !sendingMessage) {
      setSendingMessage(true);
      try {
        await sendMessage(selectedConversationId, newMessage);
        setNewMessage('');
      } catch (error) {
        console.error('Error sending message:', error);
      } finally {
        setSendingMessage(false);
      }
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoy';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-ES', { 
        day: 'numeric', 
        month: 'short' 
      });
    }
  };

  if (selectedConversationId) {
    const conversation = conversations.find(c => c.id === selectedConversationId);
    
    return (
      <div className="min-h-screen bg-white flex flex-col">
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  setSelectedConversationId(null);
                }}
                className="text-gray-600"
              >
                <ArrowLeft size={24} />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                  {conversation?.otherParticipant.profileImage ? (
                    <img 
                      src={conversation.otherParticipant.profileImage} 
                      alt="Profile" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <User size={20} className="text-gray-600" />
                  )}
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">{conversation?.otherParticipant.name}</h2>
                  <p className="text-sm text-gray-500">En línea</p>
                </div>
              </div>
            </div>
            <button className="text-gray-600">
              📞
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 px-4 py-4 space-y-4 overflow-y-auto bg-gray-50">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E07A5F]"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No hay mensajes aún</p>
              <p className="text-gray-400 text-sm">Envía el primer mensaje</p>
            </div>
          ) : (
            messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div className="flex items-start gap-2 max-w-xs">
                {message.senderId !== user?.id && (
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {conversation?.otherParticipant.profileImage ? (
                      <img 
                        src={conversation.otherParticipant.profileImage} 
                        alt="Profile" 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <User size={16} className="text-gray-600" />
                    )}
                  </div>
                )}
                <div className="flex flex-col">
                  <div
                    className={`px-4 py-2 rounded-2xl ${
                      message.senderId === user?.id
                        ? 'bg-[#E07A5F] text-white rounded-br-md'
                        : 'bg-white text-gray-900 rounded-bl-md shadow-sm'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 px-2">
                    {formatTime(message.createdAt)}
                  </p>
                </div>
              </div>
            </div>
            ))
          )}
        </div>

        {/* Message Input */}
        <div className="bg-white border-t border-gray-200 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 flex items-center bg-gray-100 rounded-full px-4 py-2">
              <input
                type="text"
                placeholder="Message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 bg-transparent outline-none text-gray-900"
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={sendingMessage}
              />
              <button className="text-gray-500 ml-2">😊</button>
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || sendingMessage}
              className="w-10 h-10 bg-[#E07A5F] text-white rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sendingMessage ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Send size={18} />
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-gray-900">Bandeja de mensajes</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center bg-gray-100 rounded-full px-4 py-2">
            <Search size={16} className="text-gray-500 mr-2" />
            <input
              type="text"
              placeholder="Search"
              className="flex-1 bg-transparent outline-none text-gray-900 text-sm"
            />
          </div>
          <button className="flex items-center gap-2 text-gray-600">
            <span className="text-sm">Filtrar</span>
            <Filter size={16} />
          </button>
          <button className="flex items-center gap-2 text-gray-600">
            <span className="text-sm">Ayuda</span>
            <span className="text-lg">🛟</span>
          </button>
        </div>
      </div>

      {/* Contacts List */}
      <div className="px-4 py-2">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E07A5F]"></div>
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No tienes conversaciones</p>
            <p className="text-gray-400 text-sm">Las conversaciones aparecerán cuando alguien te escriba</p>
          </div>
        ) : (
          conversations.map((conversation) => (
          <button
            key={conversation.id}
            onClick={() => handleSelectConversation(conversation.id)}
            className="w-full flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors"
          >
            <div className="relative">
              <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                {conversation.otherParticipant.profileImage ? (
                  <img 
                    src={conversation.otherParticipant.profileImage} 
                    alt="Profile" 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <User size={20} className="text-gray-600" />
                )}
              </div>
              {conversation.unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#E07A5F] rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-medium">
                    {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex-1 text-left">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">{conversation.otherParticipant.name}</h3>
                <span className="text-xs text-gray-400">
                  {conversation.lastMessage && formatDate(conversation.lastMessage.createdAt)}
                </span>
              </div>
              <p className="text-gray-600 text-sm truncate">
                {conversation.lastMessage?.content || 'No hay mensajes'}
              </p>
            </div>
          </button>
          ))
        )}
      </div>
    </div>
  );
};