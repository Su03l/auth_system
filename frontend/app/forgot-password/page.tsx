"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import FadeIn from "@/components/animations/FadeIn";
import EmailIcon from "@mui/icons-material/Email";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import DialpadIcon from "@mui/icons-material/Dialpad";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: email, 2: code, 3: new password
  const [email, setEmail] = useState("");
  const [code, setCode] = useState<string[]>(Array(6).fill("")); // Initialize code as an array of 6 empty strings
  const [newPassword, setNewPassword] = useState("");
  const [reNewPassword, setReNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);


  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Simulate a 3-second delay
    await new Promise(resolve => setTimeout(resolve, 3000));

    try {
      // Backend API URL - adjust if necessary
      const apiUrl = 'http://localhost:5000/auth/forgot';
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setSuccess(`تم ارسال رمز التحقق الى ${email}`);
      setResendTimer(60);
      setTimeout(() => {
        setStep(2);
        setSuccess(null);
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendTimer > 0) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const apiUrl = 'http://localhost:5000/auth/forgot';
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Something went wrong');

      setSuccess('تم إرسال رمز جديد');
      setResendTimer(60); // Start 60-second timer
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
    } else if (value === "") {
      newCode[index] = "";
      setCode(newCode);
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && index > 0 && !code[index]) {
      const newCode = [...code];
      newCode[index - 1] = "";
      setCode(newCode);
      // Move focus to the previous input
      const prevInput = document.getElementById(`code-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
      }
    } else if (e.key === "ArrowRight" && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    const enteredCode = code.join('');

    try {
      // Backend API URL - adjust if necessary
      const apiUrl = 'http://localhost:5000/auth/verify-code';
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code: enteredCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setSuccess('تم التحقق بنجاح');
      setTimeout(() => {
        setStep(3);
        setSuccess(null);
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };



  const handleSaveNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== reNewPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    const enteredCode = code.join('');

    try {
      // Backend API URL - adjust if necessary
      const apiUrl = 'http://localhost:5000/auth/reset-password';
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code: enteredCode, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setSuccess('تم تغيير كلمة المرور بنجاح');
      setTimeout(() => {
        window.location.href = '/signin';
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <Link
        href="/signin"
        className="absolute top-6 right-6 text-[#D8D7CE] hover:text-[#00A6C0] transition duration-300 flex items-center group"
      >
        <ArrowBackIcon className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
        <span className="font-semibold">العودة إلى تسجيل الدخول</span>
      </Link>
      <FadeIn delay={200}>
        <Card className="w-full max-w-lg p-8 transition-transform duration-500 border border-[#00A6C0] rounded-3xl">
          {error && (
            <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
              <span className="font-medium">!خطأ</span> {error}
            </div>
          )}
          {success && (
            <div className="p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400" role="alert">
              <span className="font-medium">!نجاح</span> {success}
            </div>
          )}
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
                disabled={loading}
              >
                {loading ? "جاري الإرسال..." : "إرسال الرمز"}
              </Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyCode} className="space-y-6">
              <h2 className="text-4xl font-extrabold text-[#00A6C0] mb-4 text-center tracking-wide flex items-center justify-center gap-2">
                التحقق من الرمز
              </h2>
              <p className="text-[#D8D7CE] text-center mb-8 opacity-80 leading-snug">
                يرجى إدخال الرمز المكون من 6 أرقام المرسل إلى عنوان بريدك
                الإلكتروني: {email}
              </p>
              <div className="flex justify-center space-x-2 mb-4" dir="ltr">
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
                disabled={loading}
              >
                {loading ? "جاري التحقق..." : "التحقق من الرمز"}
              </Button>
              <p className="text-[#D8D7CE] text-center text-sm opacity-80 mt-4">
                لم تستلم الرمز؟{" "}
                <button
                  type="button"
                  className="text-[#00A6C0] hover:underline font-semibold transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleResendCode}
                  disabled={resendTimer > 0}
                >
                  {resendTimer > 0 ? `إعادة الإرسال بعد (${resendTimer}) ثانية` : 'إعادة إرسال الرمز'}
                </button>
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
                disabled={loading}
              >
                {loading ? "جاري الحفظ..." : "حفظ كلمة المرور الجديدة"}
              </Button>
            </form>
          )}


        </Card>
      </FadeIn>
    </div>
  );
}
