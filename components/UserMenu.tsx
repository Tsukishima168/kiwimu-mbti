import React from 'react';
import type { AppUser } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface UserMenuProps {
    user: AppUser | null;
    onLogin: () => void;
    onLogout: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ user, onLogin, onLogout }) => {
    const { t } = useLanguage();

    if (!user || user.isAnonymous) {
        return (
            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Login button clicked');
                    onLogin();
                }}
                className="px-6 py-3 bg-kiwi-dark text-white text-sm font-mono tracking-wider hover:bg-black transition-colors duration-300 shadow-lg"
            >
                {t('login_btn')}
            </button>
        );
    }

    return (
        <div className="flex items-center gap-4 bg-white shadow-lg border border-gray-200 px-4 py-2">
            <div className="text-right hidden md:block">
                <p className="text-xs font-mono text-gray-600">{user.email || user.displayName || t('user_logged_in')}</p>
            </div>
            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Logout button clicked');
                    onLogout();
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-mono tracking-wider hover:bg-gray-50 transition-colors duration-300"
            >
                {t('logout_btn')}
            </button>
        </div>
    );
};

export default UserMenu;
