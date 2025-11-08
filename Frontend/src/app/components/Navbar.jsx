"use client"
import Link from 'next/link'
import {useContext, useState, useEffect} from 'react'
import { usePathname } from 'next/navigation';
import { getUserFromStorage } from '../../../utils/auth';
import Swal from "sweetalert2";
import api from '../services/axios';

const Navbar = () => {
  const user = getUserFromStorage();
  const pathname = usePathname()
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/hotel', label: 'Hotels' },
    { href: '/room', label: 'Rooms' },
  ];
 

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
        
      // Scrolling down & hide navbar past 150px 
      if (currentScrollY > lastScrollY && currentScrollY > 150) {
        
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
  
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const handleToggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };
 
  // logout functionality
  const handleLogout = async () => {
      Swal.fire({
    title: 'Are you sure?',
    text: 'You will be logged out of your account',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Yes, logout',
    cancelButtonText: 'Cancel'
  }).then((result) => {
    if (result.isConfirmed) {
      performLogout();
    }
  });
};

  const performLogout = async () => {
  try {

    await api.post('/logout/', {}, { withCredentials: true });
    
  
    localStorage.removeItem('loginUser');
    localStorage.removeItem('lastSearch');
    Swal.fire({
      title: "Logout Successful!",
      text: "Thank you for using our service",
      icon: "success",
      timer: 2500,
      showConfirmButton: false,
    }).then(() => {
    
      window.location.href = '/';
    });
    
  } catch (error) {
    Swal.fire({
                title: "Oops!",
                text: "Something went wrong while loging out.",
                icon: "error",
                confirmButtonText: "Try again",
               });

    // Still clear local storage even if backend call fails
    localStorage.removeItem('loginUser');
    localStorage.removeItem('lastSearch')
    window.location.href = '/';
  }
};
  return (
    <div>
      <header className={`flex items-center justify-between p-4 gap-4 h-16 bg-[#ffffff] fixed z-50 left-0 right-0 top-0 transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
        <h1 className='text-2xl sm:text-3xl text-indigo-700 font-bold'><Link href="/">Hotel Booking</Link></h1>
        <nav className='flex items-center gap-4'>
          <ul className='hidden md:flex gap-6 text-lg text-gray-500'>
            {navLinks.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={handleLinkClick}
                  className={pathname === href ? 'text-blue-500' : 'text-gray-500 hover:text-blue-500 transition-colors'}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          {user ? (
            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/profile"
                className="inline-flex items-center justify-center border border-indigo-200 text-indigo-700 bg-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 hover:bg-indigo-50"
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="inline-flex items-center justify-center bg-[#045cc1] text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className='hidden md:flex items-center gap-3'>
              <Link
                href="/login"
                className="inline-flex items-center justify-center bg-[#045cc1] text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center bg-[#6c47ff] text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
              >
                Sign Up
              </Link>
            </div>
          )}
          <button
            type='button'
            onClick={handleToggleMenu}
            className='md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500'
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
          >
            <span className='sr-only'>{isMenuOpen ? 'Close menu' : 'Open menu'}</span>
            <svg
              className={`h-6 w-6 ${isMenuOpen ? 'hidden' : 'block'}`}
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth={1.5}
              stroke='currentColor'
            >
              <path strokeLinecap='round' strokeLinejoin='round' d='M3.75 5.25h16.5M3.75 12h16.5m-16.5 6.75h16.5' />
            </svg>
            <svg
              className={`h-6 w-6 ${isMenuOpen ? 'block' : 'hidden'}`}
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth={1.5}
              stroke='currentColor'
            >
              <path strokeLinecap='round' strokeLinejoin='round' d='M6 18L18 6M6 6l12 12' />
            </svg>
          </button>
        </nav>
      </header>

      {/* Mobile menu overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 md:hidden ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={handleToggleMenu}
      />

      <aside
        className={`fixed top-0 right-0 z-50 h-full w-64 sm:w-72 bg-white shadow-xl md:hidden transform transition-transform duration-300 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
        aria-hidden={!isMenuOpen}
      >
        <div className='flex items-center justify-between p-4 border-b border-gray-100'>
          <h2 className='text-xl font-semibold text-indigo-700'>Menu</h2>
          <button
            type='button'
            onClick={handleToggleMenu}
            className='p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500'
            aria-label='Close menu'
          >
            <svg
              className='h-6 w-6'
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth={1.5}
              stroke='currentColor'
            >
              <path strokeLinecap='round' strokeLinejoin='round' d='M6 18L18 6M6 6l12 12' />
            </svg>
          </button>
        </div>
        <nav className='flex flex-col gap-6 p-6 text-lg text-gray-600'>
          <ul className='flex flex-col gap-4'>
            {navLinks.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={handleLinkClick}
                  className={`block ${pathname === href ? 'text-blue-600 font-semibold' : 'hover:text-blue-500 transition-colors'}`}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          <div className='border-t border-gray-200 pt-4'>
            {user ? (
              <div className='flex flex-col gap-3'>
                <Link
                  href='/profile'
                  onClick={handleLinkClick}
                  className='w-full rounded-full border border-indigo-200 px-4 py-2 text-center text-indigo-700 font-medium bg-white'
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className='w-full rounded-full bg-[#045cc1] px-4 py-2 text-white font-medium'
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className='flex flex-col gap-3'>
                <Link
                  href='/login'
                  onClick={handleLinkClick}
                  className='w-full rounded-full bg-[#045cc1] px-4 py-2 text-center text-white font-medium'
                >
                  Login
                </Link>
                <Link
                  href='/register'
                  onClick={handleLinkClick}
                  className='w-full rounded-full bg-[#6c47ff] px-4 py-2 text-center text-white font-medium'
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </nav>
      </aside>
    </div>
  )
}

export default Navbar
