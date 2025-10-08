import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import ChatComponent from '@/components/ChatComponent';

const Index = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'home' | 'news' | 'chat'>('home');

  const handleMenuItemClick = (view: 'news' | 'chat') => {
    setCurrentView(view);
    setMenuOpen(false);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {currentView === 'home' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-white via-primary/30 to-secondary/40" 
               style={{
                 backgroundImage: `
                   linear-gradient(45deg, 
                     white 0%, white 33%, 
                     hsl(var(--primary)) 33%, hsl(var(--primary)) 66%, 
                     hsl(var(--secondary)) 66%, hsl(var(--secondary)) 100%
                   )
                 `,
                 backgroundSize: '200% 200%'
               }}>
          </div>
          
          <div className="absolute inset-0 opacity-30" 
               style={{
                 background: `repeating-linear-gradient(
                   45deg,
                   transparent,
                   transparent 100px,
                   rgba(255,255,255,0.3) 100px,
                   rgba(255,255,255,0.3) 200px
                 )`
               }}>
          </div>
          
          <h1 className="relative z-10 text-7xl font-heading font-bold text-gray-800 tracking-tight">
            Древлеград
          </h1>
        </div>
      )}

      {currentView === 'news' && (
        <div className="min-h-screen bg-white p-6 animate-fade-in">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-heading font-bold mb-6 text-gray-800">Новости</h2>
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="text-xl font-heading font-semibold mb-2 text-gray-800">
                    Новость {item}
                  </h3>
                  <p className="text-gray-600 mb-3">
                    Краткое описание новости. Здесь будет отображаться превью текста статьи.
                  </p>
                  <Button variant="outline" className="bg-primary hover:bg-primary/90 text-gray-800 border-0">
                    Читать далее
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {currentView === 'chat' && (
        <div className="animate-fade-in">
          <ChatComponent />
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