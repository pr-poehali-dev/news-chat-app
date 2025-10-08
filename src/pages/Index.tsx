import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import ChatComponent from '@/components/ChatComponent';
import NewsComponent from '@/components/NewsComponent';
import ProfileComponent from '@/components/ProfileComponent';

const Index = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'home' | 'news' | 'chat' | 'profile'>('home');
  const [userId, setUserId] = useState<string>('');
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    let storedUserId = localStorage.getItem('userId');
    if (!storedUserId) {
      storedUserId = 'user_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('userId', storedUserId);
    }
    setUserId(storedUserId);
  }, []);

  const handleMenuItemClick = (view: 'news' | 'chat' | 'profile') => {
    setCurrentView(view);
    setMenuOpen(false);
  };

  const handleProfileCreated = (profile: any) => {
    setUserProfile(profile);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {currentView === 'home' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="absolute inset-0" 
               style={{
                 background: `
                   linear-gradient(135deg, 
                     white 0%, white 33%, 
                     hsl(var(--primary)) 33%, hsl(var(--primary)) 66%, 
                     hsl(var(--secondary)) 66%, hsl(var(--secondary)) 100%
                   )
                 `
               }}>
          </div>
          
          <h1 className="relative z-10 text-7xl font-heading font-bold text-gray-800 tracking-tight drop-shadow-lg">
            Древлеград
          </h1>
        </div>
      )}

      {currentView === 'news' && (
        <div className="animate-fade-in">
          <NewsComponent userId={userId} />
        </div>
      )}

      {currentView === 'chat' && (
        <div className="animate-fade-in">
          <ChatComponent />
        </div>
      )}

      {currentView === 'profile' && (
        <div className="animate-fade-in">
          <ProfileComponent onProfileCreated={handleProfileCreated} currentUserId={userId} />
        </div>
      )}

      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="fixed top-6 right-6 z-50 p-3 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow"
      >
        <Icon name={menuOpen ? "X" : "Menu"} size={24} className="text-gray-800" />
      </button>

      {menuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 animate-fade-in" onClick={() => setMenuOpen(false)}>
          <div 
            className="absolute right-0 top-0 h-full w-80 bg-white shadow-2xl p-8 animate-slide-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mt-16 space-y-4">
              <button
                onClick={() => handleMenuItemClick('news')}
                className="w-full text-left p-4 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-3 text-lg font-heading font-semibold text-gray-800"
              >
                <Icon name="Newspaper" size={24} />
                Новости
              </button>
              <button
                onClick={() => handleMenuItemClick('chat')}
                className="w-full text-left p-4 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-3 text-lg font-heading font-semibold text-gray-800"
              >
                <Icon name="MessageCircle" size={24} />
                Чат
              </button>
              <button
                onClick={() => handleMenuItemClick('profile')}
                className="w-full text-left p-4 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-3 text-lg font-heading font-semibold text-gray-800"
              >
                <Icon name="User" size={24} />
                Профиль
              </button>
              {currentView !== 'home' && (
                <button
                  onClick={() => {
                    setCurrentView('home');
                    setMenuOpen(false);
                  }}
                  className="w-full text-left p-4 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-3 text-lg font-heading font-semibold text-gray-800"
                >
                  <Icon name="Home" size={24} />
                  Главная
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;