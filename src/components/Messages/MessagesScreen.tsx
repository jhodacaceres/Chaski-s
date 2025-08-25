import React, { useState } from 'react';
import { ArrowLeft, Filter, Search, Send } from 'lucide-react';

interface Message {
  id: string;
  sender: string;
  content: string;
  time: string;
  isOwn: boolean;
}

interface Contact {
  id: string;
  name: string;
  lastMessage: string;
  avatar: string;
  isOnline: boolean;
}

export const MessagesScreen: React.FC = () => {
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');

  const contacts: Contact[] = [
    { id: '1', name: 'Persona 1', lastMessage: 'Hola!', avatar: '👤', isOnline: true },
    { id: '2', name: 'Persona 1', lastMessage: 'Hola!', avatar: '👤', isOnline: false },
    { id: '3', name: 'Persona 1', lastMessage: 'Hola!', avatar: '👤', isOnline: true },
    { id: '4', name: 'Persona 1', lastMessage: 'Hola!', avatar: '👤', isOnline: false },
    { id: '5', name: 'Persona 1', lastMessage: 'Hola!', avatar: '👤', isOnline: true },
    { id: '6', name: 'Persona 1', lastMessage: 'Hola!', avatar: '👤', isOnline: false },
  ];

  const messages: Message[] = [
    { id: '1', sender: 'Helena Hills', content: 'Oh?', time: '9:41 AM', isOwn: false },
    { id: '2', sender: 'You', content: 'Cool', time: '9:41 AM', isOwn: true },
    { id: '3', sender: 'Helena Hills', content: 'How does it work?', time: '9:41 AM', isOwn: false },
    { id: '4', sender: 'You', content: 'You just edit any text to type in the conversation you want to see, and delete any bubbles you don\'t want to see.', time: '9:41 AM', isOwn: true },
    { id: '5', sender: 'You', content: 'Boom!', time: '9:41 AM', isOwn: true },
    { id: '6', sender: 'Helena Hills', content: 'Hmmm', time: '9:41 AM', isOwn: false },
    { id: '7', sender: 'Helena Hills', content: 'I think I get it', time: '9:41 AM', isOwn: false },
    { id: '8', sender: 'Helena Hills', content: 'Will head to the Help Center if I have more questions tho', time: '9:41 AM', isOwn: false },
  ];

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // Here you would typically send the message to your backend
      console.log('Sending message:', newMessage);
      setNewMessage('');
    }
  };

  if (selectedContact) {
    const contact = contacts.find(c => c.id === selectedContact);
    
    return (
      <div className="min-h-screen bg-white flex flex-col">
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSelectedContact(null)}
                className="text-gray-600"
              >
                <ArrowLeft size={24} />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-lg">
                  {contact?.avatar}
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">{contact?.name}</h2>
                  <p className="text-sm text-green-500">Active 1hr ago</p>
                </div>
              </div>
            </div>
            <button className="text-gray-600">
              📞
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 px-4 py-4 space-y-4 overflow-y-auto">
          <div className="text-center">
            <div className="inline-block bg-[#E07A5F] text-white px-4 py-2 rounded-full text-sm">
              This is the main chat template
            </div>
            <p className="text-gray-500 text-xs mt-2">Nov 30, 2023, 9:41 AM</p>
          </div>

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div className="flex items-start gap-2 max-w-xs">
                {!message.isOwn && (
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm flex-shrink-0">
                    👤
                  </div>
                )}
                <div
                  className={`px-4 py-2 rounded-2xl ${
                    message.isOwn
                      ? 'bg-[#E07A5F] text-white rounded-br-md'
                      : 'bg-gray-100 text-gray-900 rounded-bl-md'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            </div>
          ))}
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
              />
              <button className="text-gray-500 ml-2">🎤</button>
              <button className="text-gray-500 ml-2">😊</button>
              <button className="text-gray-500 ml-2">📷</button>
            </div>
            <button
              onClick={handleSendMessage}
              className="w-10 h-10 bg-[#E07A5F] text-white rounded-full flex items-center justify-center"
            >
              <Send size={18} />
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
        {contacts.map((contact) => (
          <button
            key={contact.id}
            onClick={() => setSelectedContact(contact.id)}
            className="w-full flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors"
          >
            <div className="relative">
              <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-lg">
                {contact.avatar}
              </div>
              {contact.isOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              )}
            </div>
            
            <div className="flex-1 text-left">
              <h3 className="font-medium text-gray-900">{contact.name}</h3>
              <p className="text-gray-600 text-sm">{contact.lastMessage}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};