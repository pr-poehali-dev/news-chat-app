import { useState, useEffect, useRef } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: number;
  text: string;
  timestamp: string;
  user_name: string;
}

const CHAT_API_URL = 'https://functions.poehali.dev/d5b7506b-4c18-4f6c-9af6-60a2ee225532';

const ChatComponent = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [userName, setUserName] = useState('Аноним');
  const [longPressMessageId, setLongPressMessageId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const fetchMessages = async () => {
    try {
      const response = await fetch(CHAT_API_URL);
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить сообщения',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(CHAT_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: inputValue,
          user_name: userName,
        }),
      });

      if (response.ok) {
        setInputValue('');
        await fetchMessages();
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить сообщение',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMessage = async (messageId: number) => {
    try {
      const response = await fetch(`${CHAT_API_URL}?id=${messageId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessages(messages.filter(msg => msg.id !== messageId));
        setLongPressMessageId(null);
        toast({
          title: 'Удалено',
          description: 'Сообщение успешно удалено',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить сообщение',
        variant: 'destructive',
      });
    }
  };

  const handleMouseDown = (messageId: number, currentUserName: string) => {
    if (currentUserName !== userName) return;
    
    longPressTimer.current = setTimeout(() => {
      setLongPressMessageId(messageId);
    }, 500);
  };

  const handleMouseUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleTouchStart = (messageId: number, currentUserName: string) => {
    if (currentUserName !== userName) return;
    
    longPressTimer.current = setTimeout(() => {
      setLongPressMessageId(messageId);
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
        <h2 className="text-2xl font-heading font-bold text-gray-800 mb-3">Чат</h2>
        <input
          type="text"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          placeholder="Ваше имя"
          className="w-full max-w-xs px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => {
          const isOwnMessage = message.user_name === userName;
          return (
            <div
              key={message.id}
              className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              <div
                className={`relative max-w-md ${
                  isOwnMessage 
                    ? 'bg-primary text-gray-800' 
                    : 'bg-white text-gray-800'
                } rounded-lg p-4 shadow-sm cursor-pointer select-none`}
                onMouseDown={() => handleMouseDown(message.id, message.user_name)}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={() => handleTouchStart(message.id, message.user_name)}
                onTouchEnd={handleTouchEnd}
              >
                {!isOwnMessage && (
                  <div className="text-xs font-semibold text-primary mb-1">
                    {message.user_name}
                  </div>
                )}
                <p className="break-words">{message.text}</p>
                <span className="text-xs opacity-70 mt-1 block">
                  {formatTime(message.timestamp)}
                </span>

                {longPressMessageId === message.id && isOwnMessage && (
                  <div className="absolute -top-10 right-0 bg-white shadow-lg rounded-lg p-2 animate-scale-in border border-gray-200">
                    <button
                      onClick={() => handleDeleteMessage(message.id)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <Icon name="Trash2" size={16} />
                      Удалить
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white border-t border-gray-200 p-4 shadow-lg">
        <div className="flex gap-2 max-w-4xl mx-auto">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !loading && handleSendMessage()}
            placeholder="Введите сообщение..."
            disabled={loading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          />
          <Button
            onClick={handleSendMessage}
            disabled={loading || !inputValue.trim()}
            className="bg-primary hover:bg-primary/90 text-gray-800"
          >
            <Icon name="Send" size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatComponent;
