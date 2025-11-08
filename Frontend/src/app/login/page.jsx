"use client"

import { Suspense, useState } from 'react';
import { validateEmail, validateRequired } from '../../../utils/validation';
import { loginUser } from '../../../utils/auth';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LockIcon from '@mui/icons-material/Lock';
import EmailIcon from '@mui/icons-material/Email';
import LoginIcon from '@mui/icons-material/Login';
import ErrorIcon from '@mui/icons-material/Error';
import "./login.css"
import Link from 'next/link';
import Swal from "sweetalert2";
import { useRouter, useSearchParams } from 'next/navigation';
// import { ClerkProvider, SignInButton, SignedOut } from '@clerk/nextjs';

const LoginContent = () => {
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [visible, setVisible] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const redirect = searchParams?.get("redirect");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate inputs
    const emailValidation = validateEmail(email);
    const passwordValidation = validateRequired(password, "Password");

    const newFieldErrors = {};
    if (!emailValidation.isValid) newFieldErrors.email = emailValidation.message;
    if (!passwordValidation.isValid) newFieldErrors.password = passwordValidation.message;

    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors);
      setLoading(false);
      return;
    }

    setFieldErrors({});

    try {
      await loginUser(email, password);
      Swal.fire({
        title: "Login Successful!",
        text: "Welcome back ",
        icon: "success",
        timer: 2500,
        showConfirmButton: false,
      });

      const redirectUrl = redirect ? decodeURIComponent(redirect) : "/";
      router.push(redirectUrl);
    } catch (e) {
      if (e.response?.status === 401) {
        setError("Invalid email or password. Please try again.");
      } else if (e.response?.status === 400) {
        setError("Please check your email and password.");
      } else if (e.response?.data?.message) {
        setError(e.response.data.message);
      } else {
        setError("Something went wrong. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
 
      <div className="flex h-screen overflow-hidden">
        {/* Left column with an image */}
        <div
          className="hidden md:flex md:w-1/2 text-white md:flex-col md:justify-center md:items-center p-6 bg-cover bg-center bg-no-repeat hero-bg h-full"
          style={{
            backgroundImage:
              "url('https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260')",
          }}
        >
          <div className="absolute  bg-gradient-to-b from-black/40 via-black/25 to-black/40 pointer-events-none bottom-0" />
          <div className="relative z-10 text-center">
            <h1 className='text-3xl font-extrabold'>Hotel Booking</h1>
            <p className='text-lg mt-3 text-center max-w-sm'>Your trusted spot for booking your favorite hotel around town.</p>
          </div>
        </div>

        {/* Right column with login form and clipped backgrounds */}
        <div className='relative w-full md:w-1/2 flex items-center justify-center bg-gradient-to-br from-[#4B2E83] to-[#5C3E94] h-full overflow-hidden'>

          {/* Decorative clipped shapes placed behind the form) */}
          <div
            aria-hidden
            className="absolute -left-8 -top-8 w-[40vw] h-[40vh] blur-2xl opacity-90 pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, #FF8A00 0%, #FF5E62 60%)',
              clipPath: 'polygon(0 0, 75% 0, 100% 25%, 100% 75%, 55% 100%, 0 100%)',
            }}
          />

          <div
            aria-hidden
            className="absolute -right-12 -bottom-12 w-[45vw] h-[45vh] blur-2xl opacity-90 pointer-events-none"
            style={{
              background: 'linear-gradient(225deg, #00C6FF 0%, #0072FF 60%)',
              clipPath: 'polygon(100% 0, 100% 10%, 100% 45%, 100% 100%, 0 100%, 0 55%)',
            }}
          />

          {/* Login form */}
          <form onSubmit={handleSubmit} className='relative z-30 bg-white p-6 flex flex-col w-full max-w-sm rounded-lg shadow-lg'>
            <h1 className='text-center font-bold text-2xl text-gray-900 mb-6'>Welcome Back</h1>

            {/* Error message */}
            {error && (
              <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <ErrorIcon className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <label className='text-sm text-gray-700'>Email</label>
            <div className='relative mb-4'>
              <input
                type="text"
                value={email}
                required
                className='bg-white w-full p-3 pl-12 pr-3 text-gray-900 h-12 rounded-lg border border-gray-200 focus:ring-2 focus:ring-amber-400 outline-none'
                onChange={(e) => { setEmail(e.target.value) }}
              />
              <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white bg-amber-400 w-9 h-9 rounded flex items-center justify-center">
                <EmailIcon fontSize='small' />
              </div>
            </div>

            <label className='text-sm text-gray-700'>Password</label>
            <div className='relative mb-6'>
              <input
                type={visible ? "text" : "password"}
                value={password}
                className='w-full border text-gray-900 border-gray-200 p-3 pl-12 pr-10 rounded-lg h-12 focus:ring-2 focus:ring-amber-400 outline-none'
                onChange={(e) => { setPassword(e.target.value) }}
              />
              <div className='absolute left-2 top-1/2 transform -translate-y-1/2 text-white bg-amber-400 w-9 h-9 rounded flex items-center justify-center'>
                <LockIcon fontSize='small' />
              </div>
              <button onClick={() => setVisible(!visible)} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white bg-amber-400 w-9 h-9 rounded flex items-center justify-center">
                {visible ? < VisibilityIcon fontSize='small' /> : < VisibilityOffIcon fontSize='small' />}
              </button>
            </div>

            <button
              disabled={loading} style={{
                padding: "10px 20px", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1,
              }}
              className='bg-[#F25912] hover:bg-[#e04f0f] text-white font-bold text-lg p-3 rounded-lg flex items-center justify-center gap-2 cursor-pointer'
              type='submit'
            >
              <LoginIcon />
              {loading ? "Logging in..." : "Login"}
            </button>
            <div className="text-center">
              <p>If you don't have an account Please click <Link href="/register" className='text-amber-400 font-extrabold'>Here</Link></p>
            
            </div>
          </form>

        </div>
      </div>
    // </ClerkProvider>
  );
};

const LoginPage = () => (
  <Suspense fallback={<div className="loginSuspenseFallback">Loading...</div>}>
    <LoginContent />
  </Suspense>
);

export default LoginPage;
