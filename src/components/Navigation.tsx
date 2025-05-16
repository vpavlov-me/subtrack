import { Link } from 'react-router-dom';
import { useAuth } from '../store/auth';

export function Navigation() {
  const { user, signOut } = useAuth();

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold text-gray-900">SubTrack</span>
            </Link>
          </div>
          <div className="flex items-center">
            {user ? (
              <button
                onClick={() => signOut()}
                className="ml-4 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Выйти
              </button>
            ) : (
              <Link
                to="/login"
                className="ml-4 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Войти
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 