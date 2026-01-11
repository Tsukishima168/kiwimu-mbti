import React from 'react';
import { User } from 'firebase/auth';
import { auth } from '../firebase';

interface UserMenuProps {
    user: User | null;
    onLogin: () => void;
    onLogout: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ user, onLogin, onLogout }) => {
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
                登入
            </button>
        );
    }

    return (
        <div className="flex items-center gap-4 bg-white shadow-lg border border-gray-200 px-4 py-2">
            <div className="text-right hidden md:block">
                <p className="text-xs font-mono text-gray-600">{user.email || user.displayName || '已登入用戶'}</p>
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
                登出
            </button>
        </div>
    );
};

export default UserMenu;
