import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: number;
  user_id: string;
  nickname: string;
  avatar?: string;
  bio?: string;
  created_at: string;
}

const PROFILE_API_URL = 'https://functions.poehali.dev/cb984128-f907-4b18-8c10-9e897644dd1e';

interface ProfileComponentProps {
  onProfileCreated: (profile: Profile) => void;
  currentUserId: string;
}

const ProfileComponent = ({ onProfileCreated, currentUserId }: ProfileComponentProps) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');
  const [avatarFile, setAvatarFile] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${PROFILE_API_URL}?user_id=${currentUserId}`);
      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
        setNickname(data.profile.nickname || '');
        setBio(data.profile.bio || '');
        setAvatarFile(data.profile.avatar || '');
      } else {
        setIsEditing(true);
      }
    } catch (error) {
      setIsEditing(true);
    }
  };

  useEffect(() => {
    if (currentUserId) {
      fetchProfile();
    }
  }, [currentUserId]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        setAvatarFile(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    if (!nickname.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Введите никнейм',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(PROFILE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: currentUserId,
          nickname,
          avatar: avatarFile,
          bio,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
        setIsEditing(false);
        onProfileCreated(data.profile);
        toast({
          title: 'Успешно',
          description: 'Профиль сохранён',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить профиль',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (isEditing || !profile) {
    return (
      <div className="min-h-screen bg-white p-6 animate-fade-in">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-heading font-bold text-gray-800">
              {profile ? 'Редактировать профиль' : 'Создать профиль'}
            </h2>
            <button
              onClick={handleSaveProfile}
              disabled={loading}
              className="p-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              <Icon name="Check" size={24} />
            </button>
          </div>

          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="relative">
                {avatarFile ? (
                  <img
                    src={avatarFile}
                    alt="Avatar"
                    className="w-32 h-32 rounded-full object-cover border-4 border-primary"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-primary">
                    <Icon name="User" size={48} className="text-gray-400" />
                  </div>
                )}
                <label className="absolute bottom-0 right-0 p-2 bg-primary rounded-full cursor-pointer hover:bg-primary/90 transition-colors">
                  <Icon name="Camera" size={20} className="text-gray-800" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Никнейм
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Введите ваш никнейм"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Описание профиля
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Расскажите о себе"
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6 animate-fade-in">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-heading font-bold text-gray-800">Мой профиль</h2>
          <button
            onClick={() => setIsEditing(true)}
            className="p-3 bg-primary text-gray-800 rounded-full hover:bg-primary/90 transition-colors"
          >
            <Icon name="Edit" size={24} />
          </button>
        </div>

        <div className="text-center">
          {profile.avatar ? (
            <img
              src={profile.avatar}
              alt={profile.nickname}
              className="w-32 h-32 rounded-full object-cover border-4 border-primary mx-auto mb-4"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-primary mx-auto mb-4">
              <Icon name="User" size={48} className="text-gray-400" />
            </div>
          )}

          <h3 className="text-2xl font-heading font-bold text-gray-800 mb-2">
            {profile.nickname}
          </h3>

          {profile.bio && (
            <p className="text-gray-600 max-w-lg mx-auto whitespace-pre-wrap">
              {profile.bio}
            </p>
          )}

          <p className="text-sm text-gray-400 mt-4">
            ID: {profile.user_id}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileComponent;
