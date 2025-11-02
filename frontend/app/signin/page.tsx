"use client";

import { useState } from "react"; // Import useState
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import FadeIn from "@/components/animations/FadeIn";
import PersonIcon from "@mui/icons-material/Person";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import EmailIcon from "@mui/icons-material/Email";
import GoogleIcon from "@mui/icons-material/Google";
import AppleIcon from "@mui/icons-material/Apple";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import axios from "axios"; // Import axios

const BASE_URL = "http://localhost:5000"; // Define your backend base URL

export default function SignIn() {
  const [formData, setFormData] = useState({
    loginIdentifier: "",
    password: "",
  });
  const [alert, setAlert] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${BASE_URL}/auth/signin`, {
        loginIdentifier: formData.loginIdentifier,
        password: formData.password,
      });

      if (response.status === 200) {
        const { token, user } = response.data; // Assuming user data is returned with token
        localStorage.setItem("token", token);
        setAlert({ message: "تم تسجيل الدخول بنجاح.", type: "success" });
        // Introduce a small delay before redirecting to ensure localStorage is updated
        setTimeout(() => {
          window.location.href = "/profile";
        }, 500); // Reduced from 2000ms to 500ms to balance user experience and persistence
      }
    } catch (error: unknown) {
      // Changed to unknown
      console.error("Signin error:", error);
      if (axios.isAxiosError(error) && error.response) {
        const { status, data } = error.response;
        if (status === 400 && data?.error === "Invalid credentials") {
          setAlert({
            message:
              "توجد مشكلة في بيانات تسجيل الدخول. يرجى التحقق من اسم المستخدم/البريد الإلكتروني وكلمة المرور.",
            type: "error",
          });
        } else if (status === 500) {
          setAlert({
            message: "حدث خطأ في الخادم. يرجى المحاولة مرة أخرى لاحقًا.",
            type: "error",
          });
        } else {
          setAlert({
            message: data?.message || "حدث خطأ غير متوقع أثناء تسجيل الدخول.",
            type: "error",
          });
        }
      } else {
        setAlert({ message: "حدث خطأ غير متوقع.", type: "error" });
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {alert && (
        <div
          className={`fixed top-5 left-1/2 -translate-x-1/2 p-4 rounded-lg shadow-lg text-white z-50 ${
            alert.type === "success" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {alert.message}
        </div>
      )}
      <FadeIn delay={200}>
        <Card className="w-full max-w-md p-8 transition-transform duration-500 border border-[#00A6C0] rounded-3xl [box-shadow:0_0_30px_rgba(0,166,192,0.6)]">
          <Link
            href="/"
            className="absolute top-6 right-6 text-[#D8D7CE] hover:text-[#00A6C0] transition duration-300 flex items-center group"
          >
            <ArrowBackIcon className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            <span className="font-semibold">العودة</span>
          </Link>
          <h2 className="text-4xl font-extrabold text-[#00A6C0] mb-4 text-center tracking-wide flex items-center justify-center gap-2">
            <PersonIcon fontSize="large" /> أهلاً بك من جديد!
          </h2>
          <p className="text-[#D8D7CE] text-center mb-8 opacity-80 leading-snug">
            سجل الدخول للمتابعة إلى جلستك الآمنة والوصول إلى لوحة التحكم المخصصة
            لك.
          </p>
          <form className="space-y-6" onSubmit={handleSignIn}>
            <div className="relative">
              <Input
                id="loginIdentifier"
                placeholder="اسم المستخدم أو البريد الإلكتروني"
                startIcon={<EmailIcon />}
                value={formData.loginIdentifier}
                onChange={handleChange}
              />
            </div>
            <div className="relative">
              <Input
                type="password"
                id="password"
                placeholder="كلمة المرور"
                startIcon={<LockOutlinedIcon />}
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember_me"
                  className="h-5 w-5 text-[#00A6C0] rounded border-gray-600 focus:ring-[#00A6C0] transition duration-300"
                />
                <label
                  htmlFor="remember_me"
                  className="mr-2 block text-[#D8D7CE] text-sm font-medium"
                >
                  تذكرني
                </label>
              </div>
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-[#00A6C0] hover:underline transition duration-300"
              >
                هل نسيت كلمة المرور؟
              </Link>
            </div>
            <Button
              type="submit" // Changed to submit
              className="w-full bg-[#00A6C0] text-[#222831] py-3 rounded-xl font-bold text-lg hover:bg-[#007B96] transition duration-300 transform hover:-translate-y-1 shadow-lg tracking-wide"
            >
              تسجيل الدخول
            </Button>
          </form>
          <div className="mt-8 text-center text-[#D8D7CE] text-md">
            ليس لديك حساب؟{" "}
            <Link
              href="/signup"
              className="text-[#00A6C0] hover:underline font-semibold transition duration-300"
            >
              سجل الآن
            </Link>
          </div>
          <div className="relative flex items-center justify-center my-8">
            <div className="grow border-t border-[#D8D7CE] opacity-30"></div>
            <span className="shrink mx-4 text-[#D8D7CE] opacity-70 font-bold">
              أو
            </span>
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
