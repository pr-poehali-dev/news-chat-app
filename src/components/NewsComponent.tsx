import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface NewsItem {
  id: number;
  title: string;
  content: string;
  image_url?: string;
  created_at: string;
  author_id?: string;
  nickname?: string;
  avatar?: string;
}

const NEWS_API_URL = 'https://functions.poehali.dev/78097a71-2b19-4d6a-accd-b36c3bf7ae33';

interface NewsComponentProps {
  userId?: string;
}

const NewsComponent = ({ userId = '' }: NewsComponentProps) => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchNews = async () => {
    try {
      const response = await fetch(NEWS_API_URL);
      const data = await response.json();
      setNews(data.news || []);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить новости',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 200000) {
        toast({
          title: 'Ошибка',
          description: 'Размер файла не должен превышать 200 КБ',
          variant: 'destructive',
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageFile(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateNews = async () => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Заполните заголовок и текст',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(NEWS_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content,
          image: imageFile,
          author_id: userId,
        }),
      });

      if (response.ok) {
        setTitle('');
        setContent('');
        setImageFile('');
        setShowCreateForm(false);
        await fetchNews();
        toast({
          title: 'Успешно',
          description: 'Новость опубликована',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать новость',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (selectedNews) {
    return (
      <div className="min-h-screen bg-white animate-fade-in">
        <div className="max-w-4xl mx-auto p-6">
          <button
            onClick={() => setSelectedNews(null)}
            className="flex items-center gap-2 mb-6 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <Icon name="ArrowLeft" size={20} />
            Назад к новостям
          </button>

          {selectedNews.image_url && (
            <img
              src={selectedNews.image_url}
              alt={selectedNews.title}
              className="w-full h-96 object-cover rounded-lg mb-6"
            />
          )}

          <h1 className="text-4xl font-heading font-bold mb-3 text-gray-800">
            {selectedNews.title}
          </h1>

          <div className="flex items-center gap-3 mb-6">
            {selectedNews.avatar ? (
              <img
                src={selectedNews.avatar}
                alt={selectedNews.nickname}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <Icon name="User" size={20} className="text-gray-400" />
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-gray-800">
                {selectedNews.nickname || 'Аноним'}
              </p>
              <p className="text-xs text-gray-500">
                {formatDate(selectedNews.created_at)}
              </p>
            </div>
          </div>

          <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
            {selectedNews.content}
          </div>
        </div>
      </div>
    );
  }

  if (showCreateForm) {
    return (
      <div className="min-h-screen bg-white animate-fade-in">
        <div className="max-w-2xl mx-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-heading font-bold text-gray-800">
              Создать новость
            </h2>
            <button
              onClick={handleCreateNews}
              disabled={loading}
              className="p-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              <Icon name="Check" size={24} />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Заголовок
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Введите заголовок новости"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Фотография
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors">
                {imageFile ? (
                  <div className="relative">
                    <img
                      src={imageFile}
                      alt="Preview"
                      className="max-h-64 mx-auto rounded-lg"
                    />
                    <button
                      onClick={() => setImageFile('')}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <Icon name="X" size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <Icon name="Upload" size={48} className="mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-600">Нажмите для загрузки фото</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Текст новости
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Введите текст новости"
                rows={12}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6 animate-fade-in relative">
      <div className="max-w-4xl mx-auto">
        {news.length === 0 ? (
          <div className="text-center py-20">
            <Icon name="Newspaper" size={64} className="mx-auto text-gray-300 mb-4" />
            <p className="text-xl text-gray-500">Новостей пока нет</p>
            <p className="text-sm text-gray-400 mt-2">
              Нажмите на синий плюс, чтобы создать первую новость
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {news.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedNews(item)}
                className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex gap-4">
                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-32 h-32 object-cover rounded-lg flex-shrink-0"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="text-xl font-heading font-semibold mb-2 text-gray-800">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 mb-2 line-clamp-2">
                      {item.content}
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      {item.avatar ? (
                        <img
                          src={item.avatar}
                          alt={item.nickname}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                          <Icon name="User" size={12} className="text-gray-400" />
                        </div>
                      )}
                      <span className="text-xs text-gray-600 font-medium">
                        {item.nickname || '\u0410\u043d\u043e\u043d\u0438\u043c'}
                      </span>
                      <span className="text-xs text-gray-400">
                        • {formatDate(item.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={() => setShowCreateForm(true)}
        className="fixed bottom-8 left-8 w-16 h-16 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 hover:scale-110 transition-all flex items-center justify-center z-50"
      >
        <Icon name="Plus" size={32} />
      </button>
    </div>
  );
};

export default NewsComponent;