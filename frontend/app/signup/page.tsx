'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import FadeIn from '@/components/animations/FadeIn';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import GoogleIcon from '@mui/icons-material/Google';
import AppleIcon from '@mui/icons-material/Apple';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import axios from 'axios'; // Import axios

const BASE_URL = 'http://localhost:5000'; // Define your backend base URL

export default function SignUp() {
  const [formData, setFormData] = useState({
    fname: '',
    lname: '',
    username: '',
    email: '',
    phone_number: '',
    password: '',
    repassword: '',
  });
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission
    if (formData.password !== formData.repassword) {
      setAlert({ message: 'كلمتا المرور غير متطابقتين!', type: 'error' });
      return;
    }

    // Store the initial signup data in localStorage
    localStorage.setItem('signupFormData', JSON.stringify(formData));

    setAlert({ message: 'جاري المتابعة إلى معلومات إضافية...', type: 'success' });
    setTimeout(() => {
      window.location.href = '/signup/additionalinfo'; // Redirect to additionalinfo page
    }, 1000); // Shorter delay for navigation
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {alert && (
        <div className={`fixed top-5 left-1/2 -translate-x-1/2 p-4 rounded-lg shadow-lg text-white z-50 ${alert.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          {alert.message}
        </div>
      )}
      <FadeIn delay={200}>
        <Card className="w-full max-w-lg p-8 transform transition-transform duration-500 border border-[#00A6C0] rounded-3xl [box-shadow:0_0_30px_rgba(0,166,192,0.6)]">
          <Link href="/" className="absolute top-6 right-6 text-[#D8D7CE] hover:text-[#00A6C0] transition duration-300 flex items-center group">
            <ArrowBackIcon className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            <span className="font-semibold">العودة</span>
          </Link>
          <h2 className="text-4xl font-extrabold text-[#00A6C0] mb-4 text-center tracking-wide flex items-center justify-center gap-2">
            <PersonAddIcon fontSize="large" /> انضم إلينا!
          </h2>
          <p className="text-[#D8D7CE] text-center mb-8 opacity-80 leading-snug">
            أنشئ حسابك لفتح عالم من الإمكانيات والميزات المخصصة.
          </p>
          <form className="space-y-6" onSubmit={handleSignUp}> {/* Add onSubmit handler here */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <Input
                  id="fname"
                  placeholder="الاسم الأول"
                  startIcon={<AccountCircleIcon />}
                  value={formData.fname}
                  onChange={handleChange}
                />
              </div>
              <div className="relative">
                <Input
                  id="lname"
                  placeholder="الاسم الأخير"
                  startIcon={<AccountCircleIcon />}
                  value={formData.lname}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="relative">
              <Input
                id="username"
                placeholder="اختر اسم مستخدم"
                startIcon={<PersonIcon />}
                value={formData.username}
                onChange={handleChange}
              />
            </div>
            <div className="relative">
              <Input
                type="email"
                id="email"
                placeholder="أدخل بريدك الإلكتروني"
                startIcon={<EmailIcon />}
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="relative">
              <Input
                type="tel"
                id="phone_number" // Changed to phone_number to match backend
                maxLength={10}
                pattern="05[0-9]{8}"
                placeholder="مثال: 05XXXXXXXX"
                startIcon={<PhoneIcon />}
                value={formData.phone_number}
                onChange={handleChange}
              />
            </div>
            <div className="relative">
              <Input
                type="password"
                id="password"
                placeholder="أدخل كلمة المرور الخاصة بك"
                startIcon={<LockOutlinedIcon />}
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div className="relative">
              <Input
                type="password"
                id="repassword"
                placeholder="أعد إدخال كلمة المرور الخاصة بك"
                startIcon={<LockOutlinedIcon />}
                value={formData.repassword}
                onChange={handleChange}
              />
            </div>
            <Button
              type="submit" // Changed to submit
              className="w-full bg-[#00A6C0] text-[#222831] py-3 rounded-xl font-bold text-lg hover:bg-[#007B96] transition duration-300 transform hover:-translate-y-1 shadow-lg tracking-wide"
            >
              إنشاء حساب
            </Button>
          </form>
          <div className="mt-8 text-center text-[#D8D7CE] text-md">
            هل لديك حساب بالفعل؟{" "}
            <Link href="/signin" className="text-[#00A6C0] hover:underline font-semibold transition duration-300">
              تسجيل الدخول
            </Link>
          </div>
          <div className="relative flex items-center justify-center my-8">
            <div className="grow border-t border-[#D8D7CE] opacity-30"></div>
            <span className="shrink mx-4 text-[#D8D7CE] opacity-70 font-bold">أو</span>
            <div className="grow border-t border-[#D8D7CE] opacity-30"></div>
          </div>
          <div className="flex flex-col space-y-4">
            <Button className="flex items-center justify-center px-6 py-3 rounded-xl bg-[#222831] text-[#D8D7CE] hover:bg-[#394d5c] transition duration-300 transform hover:-translate-y-1 shadow-lg border border-[#283B48] font-medium">
              <GoogleIcon className="ml-3" /> المتابعة باستخدام جوجل
            </Button>
            <Button className="flex items-center justify-center px-6 py-3 rounded-xl bg-[#222831] text-[#D8D7CE] hover:bg-[#394d5c] transition duration-300 transform hover:-translate-y-1 shadow-lg border border-[#283B48] font-medium">
              <AppleIcon className="ml-3" /> المتابعة باستخدام آبل
            </Button>
          </div>
        </Card>
      </FadeIn>
    </div>
  );
}
