import React, { useState, useEffect } from 'react';
import type { AppUser } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { UserProfile } from '../types';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firestore.config';

interface UserSettingsProps {
    user: AppUser;
    onBack: () => void;
}

const defaultPreferences: UserProfile['preferences'] = {
    language: 'zh',
    notifications: {
        newFeatures: true,
        weeklyInsights: false
    },
    privacy: {
        profileVisibility: 'private',
        shareResults: true
    }
};

export const UserSettings: React.FC<UserSettingsProps> = ({ user, onBack }) => {
    const { language, setLanguage } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const [preferences, setPreferences] = useState(defaultPreferences);

    // Load user preferences from Firestore
    useEffect(() => {
        const loadPreferences = async () => {
            try {
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                if (userDoc.exists()) {
                    const profile = userDoc.data().profile as UserProfile | undefined;
                    if (profile?.preferences) {
                        setPreferences(profile.preferences);
                    }
                }
            } catch (error) {
                console.error('Failed to load preferences:', error);
            } finally {
                setLoading(false);
            }
        };

        loadPreferences();
    }, [user.uid]);

    // Handle save
    const handleSave = async () => {
        setSaving(true);
        try {
            await updateDoc(doc(db, 'users', user.uid), {
                'profile.preferences': preferences,
                lastActiveAt: Date.now()
            });

            // Update language context
            setLanguage(preferences.language);

            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (error) {
            console.error('Failed to save preferences:', error);
            alert('儲存失敗，請稍後再試');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-kiwi-bg flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block w-8 h-8 border-2 border-kiwi-dark border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-600 font-mono text-sm">載入設定中...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-kiwi-bg px-6 py-8 md:py-12">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={onBack}
                        className="mb-4 text-gray-600 hover:text-kiwi-dark transition-colors flex items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                        返回
                    </button>
                    <h1 className="text-3xl md:text-4xl font-bold font-display">個人設定</h1>
                    <p className="text-gray-500 mt-2">自訂你的 KIWIMU 體驗</p>
                </div>

                <div className="space-y-6">
                    {/* Language Setting */}
                    <section className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            語言 / Language
                        </h2>
                        <div className="space-y-3">
                            <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-kiwi-dark transition-colors">
                                <input
                                    type="radio"
                                    name="language"
                                    checked={preferences.language === 'zh'}
                                    onChange={() => setPreferences({
                                        ...preferences,
                                        language: 'zh'
                                    })}
                                    className="w-4 h-4 text-kiwi-dark"
                                />
                                <span className="font-medium">中文（繁體）</span>
                            </label>
                            <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-kiwi-dark transition-colors">
                                <input
                                    type="radio"
                                    name="language"
                                    checked={preferences.language === 'en'}
                                    onChange={() => setPreferences({
                                        ...preferences,
                                        language: 'en'
                                    })}
                                    className="w-4 h-4 text-kiwi-dark"
                                />
                                <span className="font-medium">English</span>
                            </label>
                        </div>
                    </section>

                    {/* Notification Preferences */}
                    <section className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            通知偏好
                        </h2>
                        <div className="space-y-4">
                            <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={preferences.notifications.newFeatures}
                                    onChange={(e) => setPreferences({
                                        ...preferences,
                                        notifications: {
                                            ...preferences.notifications,
                                            newFeatures: e.target.checked
                                        }
                                    })}
                                    className="mt-1 w-4 h-4 text-kiwi-dark"
                                />
                                <div>
                                    <div className="font-medium">新功能上線通知</div>
                                    <div className="text-sm text-gray-500">當 KIWIMU 推出新功能時通知你</div>
                                </div>
                            </label>

                            <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={preferences.notifications.weeklyInsights}
                                    onChange={(e) => setPreferences({
                                        ...preferences,
                                        notifications: {
                                            ...preferences.notifications,
                                            weeklyInsights: e.target.checked
                                        }
                                    })}
                                    className="mt-1 w-4 h-4 text-kiwi-dark"
                                />
                                <div>
                                    <div className="font-medium">每週性格洞見</div>
                                    <div className="text-sm text-gray-500">每週收到基於你性格類型的深度內容</div>
                                </div>
                            </label>
                        </div>
                    </section>

                    {/* Privacy Settings */}
                    <section className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            隱私
                        </h2>
                        <div className="space-y-4">
                            <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={preferences.privacy.shareResults}
                                    onChange={(e) => setPreferences({
                                        ...preferences,
                                        privacy: {
                                            ...preferences.privacy,
                                            shareResults: e.target.checked
                                        }
                                    })}
                                    className="mt-1 w-4 h-4 text-kiwi-dark"
                                />
                                <div>
                                    <div className="font-medium">允許分享測驗結果</div>
                                    <div className="text-sm text-gray-500">其他人可以透過連結查看你的測驗結果</div>
                                </div>
                            </label>
                        </div>
                    </section>

                    {/* Save Button */}
                    <div className="flex gap-4">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex-1 px-6 py-4 bg-kiwi-dark text-white rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? '儲存中...' : '儲存設定'}
                        </button>
                    </div>
                </div>

                {/* Success Toast */}
                {showSuccess && (
                    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 fade-in">
                        <div className="bg-green-500 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="font-medium">設定已儲存</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserSettings;
