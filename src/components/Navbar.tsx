import Link from 'next/link';

const Navbar = () => {
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <Link 
          href="/admin"
          className={`block px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 ${
            pathname === '/admin' ? 'text-blue-600 dark:text-blue-400 font-medium' : ''
          }`}
        >
          Admin Dashboard
        </Link>
      </div>
    </div>
  );
};

export default Navbar; 