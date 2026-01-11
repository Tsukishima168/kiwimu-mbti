import React from 'react';
import { User } from 'firebase/auth';
import { auth } from '../firebase';

interface UserMenuProps {
    user: User | null;
    onLogin: () => void;
    onLogout: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ user, onLogin, onLogout }) => {
    if (!user) {
        return (
            <button
                onClick={onLogin}
                className="px-4 py-2 bg-kiwi-dark text-white text-sm font-mono tracking-wider hover:bg-black transition-colors duration-300"
            >
                登入
            </button>
        );
    }

    return (
        <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
                <p className="text-xs font-mono text-gray-600">{user.email || '已登入用戶'}</p>
            </div>
            <button
                onClick={onLogout}
                className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-mono tracking-wider hover:bg-gray-50 transition-colors duration-300"
            >
                登出
            </button>
        </div>
    );
};

export default UserMenu;
