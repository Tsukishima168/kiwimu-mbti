
import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firestore.config';

interface ProfileSetupModalProps {
    user: User;
    onComplete: () => void;
    isOpen: boolean;
}

const INTEREST_OPTIONS = [
    'MBTI 理論', '心理學', '自我成長', '人際關係', '職場發展',
    '甜點鑑賞', '生活風格', '靈性探索'
];

const CITIES = [
    '台北市', '新北市', '桃園市', '台中市', '台南市', '高雄市',
    '基隆市', '新竹市', '新竹縣', '苗栗縣', '彰化縣', '南投縣',
    '雲林縣', '嘉義市', '嘉義縣', '屏東縣', '宜蘭縣', '花蓮縣',
    '台東縣', '澎湖縣', '金門縣', '連江縣', '海外'
];

const ProfileSetupModal: React.FC<ProfileSetupModalProps> = ({ user, onComplete, isOpen }) => {
    const [nickname, setNickname] = useState(user.displayName || '');
    const [birthday, setBirthday] = useState('');
    const [city, setCity] = useState('');
    const [interests, setInterests] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const toggleInterest = (interest: string) => {
        if (interests.includes(interest)) {
            setInterests(interests.filter(i => i !== interest));
        } else {
            if (interests.length >= 3) return; // Limit to 3
            setInterests([...interests, interest]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!nickname.trim()) {
            setError('請輸入暱稱');
            return;
        }

        setIsSubmitting(true);

        try {
            const userRef = doc(db, 'users', user.uid);

            await updateDoc(userRef, {
                displayName: nickname,
                birthday: birthday || null,
                city: city || null,
                interests: interests,
                isProfileSetup: true,
                updatedAt: new Date().toISOString()
            });

            // Also update Auth profile if nickname changed
            if (nickname !== user.displayName) {
                // We can't easily update auth profile on client for all providers, 
                // but we can try. For now, Firestore is the source of truth.
            }

            onComplete();
        } catch (err: any) {
            console.error('Failed to update profile:', err);
            setError('儲存失敗，請稍後再試');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in-up">
                <div className="bg-kiwi-dark p-6 text-center">
                    <h2 className="text-xl font-bold text-white mb-2">歡迎來到 KIWIMU 實驗室</h2>
                    <p className="text-white/80 text-sm">請完善您的研究員檔案</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Nickname */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            怎麼稱呼您？ <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-kiwi-dark focus:ring-1 focus:ring-kiwi-dark outline-none transition-all"
                            placeholder="輸入您的暱稱"
                            required
                        />
                    </div>

                    {/* Birthday */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                生日 (選填)
                            </label>
                            <input
                                type="date"
                                value={birthday}
                                onChange={(e) => setBirthday(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-kiwi-dark focus:ring-1 focus:ring-kiwi-dark outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                居住城市 (選填)
                            </label>
                            <select
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-kiwi-dark focus:ring-1 focus:ring-kiwi-dark outline-none transition-all bg-white"
                            >
                                <option value="">選擇城市</option>
                                {CITIES.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Interests */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            感興趣的主題 (最多3項)
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {INTEREST_OPTIONS.map(interest => (
                                <button
                                    key={interest}
                                    type="button"
                                    onClick={() => toggleInterest(interest)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${interests.includes(interest)
                                            ? 'bg-kiwi-dark text-white shadow-md transform scale-105'
                                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                        }`}
                                >
                                    {interest}
                                </button>
                            ))}
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-kiwi-dark text-white font-bold py-4 rounded-xl shadow-lg hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? '建立檔案中...' : '完成設定'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProfileSetupModal;
