"use client"

import React, { Suspense } from 'react';
import { useState } from 'react';
import { registerUser, loginUser } from '../../../utils/auth';
import LockIcon from '@mui/icons-material/Lock';
import EmailIcon from '@mui/icons-material/Email';
import LoginIcon from '@mui/icons-material/Login';
import PersonIcon from '@mui/icons-material/Person';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Link from 'next/link';
// import { ClerkProvider, SignUpButton, SignedOut } from '@clerk/nextjs'
import Swal from "sweetalert2";
import { useRouter, useSearchParams } from 'next/navigation';
import ErrorIcon from '@mui/icons-material/Error';

const RegisterFormContent = () => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [email, setEmail] = useState("")
  const [visible, setVisible] = useState(false)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const searchParams = useSearchParams();
  const router = useRouter();

  const redirect = searchParams?.get("redirect");

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    if (username === "" || password === "" || email === "") {
      setLoading(false);
      return
    }
    try {
      await registerUser(email, username, password)

      Swal.fire({
        title: "Registration successfull!",
        text: "You are Welcome ",
        icon: "success",
        timer: 2500,
        showConfirmButton: false,
      });
      
      await loginUser(email, password);

      const redirectUrl = redirect ? decodeURIComponent(redirect) : "/";
      router.push(redirectUrl);

      setLoading(false);
    } catch (e) {
      setLoading(false);

      if (e.response?.status === 400) {
        setError('email and password are required');
      } else if (e.response?.data?.message) {
        setError(e.response.data.message);
      } else {
        setError('Something went wrong. Please try again later.');
      }
    }
  }
  return (
    // <ClerkProvider>
      <div className="flex h-screen overflow-hidden">
        {/* Left column with an image */}
        <div
          className="hidden md:flex md:w-1/2 text-white md:flex-col md:justify-center md:items-center p-6 bg-cover bg-center bg-no-repeat hero-bg h-full"
          style={{ backgroundImage: "url('https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260')" }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/25 to-black/40 pointer-events-none" />
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
            <h1 className='text-center font-bold text-2xl text-gray-900 mb-6'>Please Create Your Account</h1>

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

            <label className='text-sm text-gray-700'>Username</label>
            <div className='relative mb-4'>
              <input
                type="text"
                value={username}
                required
                className='bg-white w-full p-3 pl-12 pr-3 text-gray-900 h-12 rounded-lg border border-gray-200 focus:ring-2 focus:ring-amber-400 outline-none'
                onChange={(e) => { setUsername(e.target.value) }}
              />
              <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white bg-amber-400 w-9 h-9 rounded flex items-center justify-center">
                <PersonIcon fontSize='small' />
              </div>
            </div>

            <label className='text-sm text-gray-700'>Email</label>
            <div className='relative mb-4'>
              <input
                type="email"
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
                {visible ? <VisibilityIcon VisibilityOffIcon fontSize='small' /> : <VisibilityOffIcon fontSize='small' />}
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
              {loading ? "Registering..." : "Register"}
            </button>
            <div className="text-center">
              <p>If you have an account Please click <Link href="/login" className='text-amber-400 font-extrabold'>Here</Link> </p>
              {/* <h1>Or</h1>
              <SignedOut>

                <SignUpButton>
                  <button className="bg-[#6c47ff] text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer">
                    Continue With Google
                  </button>
                </SignUpButton>
              </SignedOut> */}
            </div>
          </form>

        </div>
      </div>

    // </ClerkProvider>

  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-lg">Loading…</div>}>
      <RegisterFormContent />
    </Suspense>
  );
}
