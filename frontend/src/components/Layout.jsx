import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { LayoutDashboard, BookOpen, LogOut, Code2 } from 'lucide-react';

const Layout = ({ children }) => {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const location = useLocation();

  if (!user) return <Navigate to="/login" replace />;

  const isTrainer = user.role === 'trainer';
  const basePath = isTrainer ? '/trainer' : '/student';

  const navItems = [
    { name: 'Dashboard', path: basePath, icon: <LayoutDashboard size={20} /> },
    { name: 'Notes & Learning', path: `${basePath}/notes`, icon: <BookOpen size={20} /> }
  ];

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Sidebar - Dark theme as requested */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6 flex items-center space-x-3">
          <Code2 className="text-yellow-400" size={28} />
          <span className="text-xl font-bold">LeeTracker</span>
        </div>
        
        <div className="px-6 py-4 flex flex-col space-y-1">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Menu</p>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                location.pathname === item.path 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </div>

        <div className="mt-auto p-6 border-t border-gray-800">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center font-bold text-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-gray-400 capitalize">{user.role}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-2 text-gray-400 hover:text-red-400 transition-colors w-full"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">Log out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <div className="p-8 max-w-7xl mx-auto min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
