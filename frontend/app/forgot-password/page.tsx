'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import FadeIn from '@/components/animations/FadeIn';
import EmailIcon from '@mui/icons-material/Email';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import DialpadIcon from '@mui/icons-material/Dialpad';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: email, 2: code, 3: new password
  const [email, setEmail] = useState('');
  const [code, setCode] = useState<string[]>(Array(6).fill('')); // Initialize code as an array of 6 empty strings
  const [newPassword, setNewPassword] = useState('');
  const [reNewPassword, setReNewPassword] = useState('');

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send an API request to send the code to the email
    console.log('Sending code to:', email);
    setStep(2);
  };

  const handleCodeChange = (index: number, value: string) => {
    const newCode = [...code];
    if (value.match(/^[0-9]$/)) {
      newCode[index] = value;
      setCode(newCode);
      if (index < 5) {
        const nextInput = document.getElementById(`code-${index + 1}`);
        if (nextInput) {
          nextInput.focus();
        }
      }
    } else if (value === '') {
      newCode[index] = '';
      setCode(newCode);
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && index > 0 && !code[index]) {
      const newCode = [...code];
      newCode[index - 1] = '';
      setCode(newCode);
      // Move focus to the previous input
      const prevInput = document.getElementById(`code-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
      }
    } else if (e.key === 'ArrowRight' && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send an API request to verify the code
    console.log('Verifying code:', code.join('')); // Join the array to get the full code
    setStep(3);
  };

  const handleSaveNewPassword = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send an API request to save the new password
    console.log('Saving new password:', newPassword);
    // After saving, redirect to sign-in
    window.location.href = '/signin';
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <Link href="/signin" className="absolute top-6 right-6 text-[#D8D7CE] hover:text-[#00A6C0] transition duration-300 flex items-center group">
        <ArrowBackIcon className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
        <span className="font-semibold">العودة إلى تسجيل الدخول</span>
      </Link>
      <FadeIn delay={200}>
        <Card className="w-full max-w-lg p-8 transition-transform duration-500 border border-[#00A6C0] rounded-3xl">
          {step === 1 && (
            <form onSubmit={handleSendCode} className="space-y-6">
              <h2 className="text-4xl font-extrabold text-[#00A6C0] mb-4 text-center tracking-wide flex items-center justify-center gap-2">
                هل نسيت كلمة المرور؟
              </h2>
              <p className="text-[#D8D7CE] text-center mb-8 opacity-80 leading-snug">
                أدخل عنوان بريدك الإلكتروني لتلقي رمز التحقق المكون من 6 أرقام.
              </p>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="أدخل بريدك الإلكتروني"
                  startIcon={<EmailIcon />}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-[#00A6C0] text-[#222831] py-3 rounded-xl font-bold text-lg hover:bg-[#007B96] transition duration-300 transform hover:-translate-y-1 shadow-lg tracking-wide"
              >
                إرسال الرمز
              </Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyCode} className="space-y-6">
              <h2 className="text-4xl font-extrabold text-[#00A6C0] mb-4 text-center tracking-wide flex items-center justify-center gap-2">
                التحقق من الرمز
              </h2>
              <p className="text-[#D8D7CE] text-center mb-8 opacity-80 leading-snug">
                يرجى إدخال الرمز المكون من 6 أرقام المرسل إلى عنوان بريدك الإلكتروني.
              </p>
              <div className="flex justify-center space-x-reverse space-x-2 mb-4">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    id={`code-${index}`}
                    type="text"
                    maxLength={1}
                    pattern="[0-9]"
                    inputMode="numeric"
                    className="w-10 h-12 text-center text-xl rounded-xl bg-[#222831] text-[#D8D7CE] focus:outline-none focus:ring-4 focus:ring-[#00A6C0] focus:border-transparent transition duration-300"
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleCodeKeyDown(index, e)}
                    required
                  />
                ))}
              </div>
              <Button
                type="submit"
                className="w-full bg-[#00A6C0] text-[#222831] py-3 rounded-xl font-bold text-lg hover:bg-[#007B96] transition duration-300 transform hover:-translate-y-1 shadow-lg tracking-wide"
              >
                التحقق من الرمز
              </Button>
              <p className="text-[#D8D7CE] text-center text-sm opacity-80 mt-4">
                لم تستلم الرمز؟{" "}
                <a href="#" className="text-[#00A6C0] hover:underline font-semibold transition duration-300"
                   onClick={handleSendCode}>
                  إعادة إرسال الرمز
                </a>
              </p>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleSaveNewPassword} className="space-y-6">
              <h2 className="text-4xl font-extrabold text-[#00A6C0] mb-4 text-center tracking-wide flex items-center justify-center gap-2">
                تعيين كلمة مرور جديدة
              </h2>
              <p className="text-[#D8D7CE] text-center mb-8 opacity-80 leading-snug">
                أدخل وأكد كلمة المرور الجديدة الخاصة بك.
              </p>
              <div className="relative">
                <Input
                  id="new-password"
                  type="password"
                  placeholder="كلمة المرور الجديدة"
                  startIcon={<LockOutlinedIcon />}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="relative">
                <Input
                  id="re-new-password"
                  type="password"
                  placeholder="أعد إدخال كلمة المرور الجديدة"
                  startIcon={<LockOutlinedIcon />}
                  value={reNewPassword}
                  onChange={(e) => setReNewPassword(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-[#00A6C0] text-[#222831] py-3 rounded-xl font-bold text-lg hover:bg-[#007B96] transition duration-300 transform hover:-translate-y-1 shadow-lg tracking-wide"
              >
                حفظ كلمة المرور الجديدة
              </Button>
            </form>
          )}
        </Card>
      </FadeIn>
    </div>
  );
}
