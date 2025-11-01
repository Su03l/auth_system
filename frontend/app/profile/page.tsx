'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import FadeIn from '@/components/animations/FadeIn';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import EditIcon from '@mui/icons-material/Edit';
import LogoutIcon from '@mui/icons-material/Logout';
import KeyIcon from '@mui/icons-material/Key';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import SettingsIcon from '@mui/icons-material/Settings';
import SecurityIcon from '@mui/icons-material/Security';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import SchoolIcon from '@mui/icons-material/School';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import EventIcon from '@mui/icons-material/Event';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import avatar from '@/public/avatar1.jpg';

const BASE_URL = 'http://localhost:5000';

interface UserProfile {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phoneNumber: string;
  title: string;
  bio: string;
  projects: number;
  completedTasks: number;
  completionRate: string;
  dateOfBirth: string;
  jobTitle: string;
  department: string;
  city: string;
  educationalQualification: string;
  emailNotifications: boolean;
  taskNotifications: boolean;
  projectNotifications: boolean;
  darkMode: boolean;
  language: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showYearSelector, setShowYearSelector] = useState(false);
  const [showMonthSelector, setShowMonthSelector] = useState(false);
  const calendarRef = React.useRef<HTMLDivElement>(null);
  const dateInputRef = React.useRef<HTMLDivElement>(null);

  const departments = [
    "الذكاء الاصطناعي", "علوم الحاسب", "التعلم الآلي", "علم البيانات", "الأمن السيبراني",
    "هندسة البرمجيات", "تطوير الويب", "تطوير التطبيقات", "الحوسبة السحابية",
    "هندسة الشبكات", "إدارة قواعد البيانات", "رؤية الحاسوب", "معالجة اللغة الطبيعية",
    "الروبوتات", "تطوير الألعاب", "تصميم واجهة المستخدم", "الأنظمة المضمنة", "الحوسبة الكمية",
    "المعلوماتية الحيوية", "إدارة تكنولوجيا المعلومات", "العلوم الحسابية"
  ];

  const cities = [
    "الرياض", "جدة", "مكة", "المدينة", "الدمام", "الخبر", "الظهران", "تبوك",
    "أبها", "بريدة", "حائل", "نجران", "جازان", "الأحساء", "ينبع", "الطائف",
    "الجبيل", "عرعر", "سكاكا", "القصيم"
  ];

  const qualifications = [
    "ثانوية عامة", "بكالوريوس", "ماجستير", "دكتوراه"
  ];

  const arabicMonths = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];

  // إغلاق التقويم عند النقر خارج المنطقة
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node) &&
          dateInputRef.current && !dateInputRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
        setShowYearSelector(false);
        setShowMonthSelector(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchUserProfile = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/signin');
      return;
    }

    const decodedToken = JSON.parse(atob(token.split('.')[1]));
    setUserId(decodedToken.id);

    try {
      const response = await axios.get(`${BASE_URL}/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const user = response.data;
      const fetchedUserData: UserProfile = {
        firstName: user.fname || '',
        lastName: user.lname || '',
        username: user.username || '',
        email: user.email || '',
        phoneNumber: user.phone_number || '',
        title: 'مستخدم',
        bio: user.about_me || 'لا يوجد وصف شخصي.',
        projects: 0,
        completedTasks: 0,
        completionRate: '0%',
        dateOfBirth: user.date_of_birth ? new Date(user.date_of_birth).toISOString().split('T')[0] : '',
        jobTitle: user.job_title || '',
        department: user.department || '',
        city: user.city || '',
        educationalQualification: user.educational_qualification || '',
        emailNotifications: true,
        taskNotifications: false,
        projectNotifications: true,
        darkMode: false,
        language: 'العربية',
      };
      setUserData(fetchedUserData);
      setEditFormData({
        firstName: fetchedUserData.firstName || '',
        lastName: fetchedUserData.lastName || '',
        username: fetchedUserData.username || '',
        email: fetchedUserData.email || '',
        phoneNumber: fetchedUserData.phoneNumber || '',
        dateOfBirth: fetchedUserData.dateOfBirth || '',
        bio: fetchedUserData.bio || '',
        jobTitle: fetchedUserData.jobTitle || '',
        department: fetchedUserData.department || '',
        city: fetchedUserData.city || '',
        educationalQualification: fetchedUserData.educationalQualification || '',
      });
    } catch (error: unknown) {
      console.error('Failed to fetch user profile:', error);
      localStorage.removeItem('token');
      router.push('/signin');
    }
  }, [router]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    bio: '',
    jobTitle: '',
    department: '',
    city: '',
    educationalQualification: '',
  });

  const [passwordFormData, setPasswordFormData] = useState({
    oldPassword: '',
    newPassword: '',
    reNewPassword: '',
  });

  const handleLogout = async () => {
    const token = localStorage.getItem('token');

    if (token) {
      try {
        await axios.post(`${BASE_URL}/auth/logout`, null, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.error('Error during logout API call:', error);
      }
    }

    const currentTheme = localStorage.getItem('theme');
    localStorage.clear();
    if (currentTheme) {
      localStorage.setItem('theme', currentTheme);
    }

    setAlert({ message: 'تم تسجيل الخروج بنجاح!', type: 'success' });
    setTimeout(() => {
      router.push('/signin');
    }, 1000);
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token || !userId) {
      setAlert({ message: 'خطأ في المصادقة. يرجى تسجيل الدخول مرة أخرى.', type: 'error' });
      router.push('/signin');
      return;
    }

    try {
      const dataToSend = {
        fname: editFormData.firstName,
        lname: editFormData.lastName,
        username: editFormData.username,
        email: editFormData.email,
        phone_number: editFormData.phoneNumber,
        jobTitle: editFormData.jobTitle,
        department: editFormData.department,
        city: editFormData.city,
        educationalQualification: editFormData.educationalQualification,
        aboutMe: editFormData.bio,
        dateOfBirth: editFormData.dateOfBirth,
      };

      const response = await axios.patch(`${BASE_URL}/users/${userId}`, dataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        setAlert({ message: 'تم تحديث الملف الشخصي بنجاح!', type: 'success' });
        fetchUserProfile();
      }
    } catch (error: unknown) {
      console.error('Error updating profile:', error);
      if (axios.isAxiosError(error) && error.response) {
        setAlert({ message: error.response.data?.message || 'حدث خطأ أثناء تحديث الملف الشخصي.', type: 'error' });
      } else {
        setAlert({ message: 'حدث خطأ غير متوقع.', type: 'error' });
      }
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordFormData.newPassword !== passwordFormData.reNewPassword) {
      setAlert({ message: 'كلمتا المرور الجديدتان غير متطابقتين!', type: 'error' });
      return;
    }

    const token = localStorage.getItem('token');
    if (!token || !userId) {
      setAlert({ message: 'خطأ في المصادقة. يرجى تسجيل الدخول مرة أخرى.', type: 'error' });
      router.push('/signin');
      return;
    }

    try {
      await axios.patch(`${BASE_URL}/users/${userId}/password`, {
        oldPassword: passwordFormData.oldPassword,
        newPassword: passwordFormData.newPassword,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAlert({ message: 'تم تحديث كلمة المرور بنجاح!', type: 'success' });
      setPasswordFormData({
        oldPassword: '',
        newPassword: '',
        reNewPassword: '',
      });
    } catch (error: unknown) {
      console.error('Change password error:', error);
      if (axios.isAxiosError(error) && error.response) {
        setAlert({ message: error.response.data?.message || 'حدث خطأ أثناء تغيير كلمة المرور.', type: 'error' });
      } else {
        setAlert({ message: 'حدث خطأ غير متوقع.', type: 'error' });
      }
    }
  };

  const handleAccountSettingsChange = (setting: string, value: boolean | string) => {
    setUserData((prev: UserProfile | null) => {
      if (prev) {
        return { ...prev, [setting]: value };
      }
      return null;
    });
  };

  // وظائف التقويم المخصص
  const handleDateSelect = (date: string) => {
    setEditFormData(prev => ({
      ...prev,
      dateOfBirth: date,
    }));
    setShowCalendar(false);
    setShowYearSelector(false);
    setShowMonthSelector(false);
  };

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    
    const days = [];
    
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      days.push(dateString);
    }
    
    return days;
  };

  const getArabicDayName = (dayIndex: number) => {
    const days = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];
    return days[dayIndex];
  };

  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return 'اختر التاريخ';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const selectYear = (year: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setFullYear(year);
      return newDate;
    });
    setShowYearSelector(false);
  };

  const selectMonth = (month: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(month);
      return newDate;
    });
    setShowMonthSelector(false);
  };

  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear - 100; year <= currentYear; year++) {
      years.push(year);
    }
    return years.reverse();
  };

  const bioCharCount = editFormData.bio.length;
  const calendarDays = generateCalendarDays();
  const today = new Date().toISOString().split('T')[0];
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#222831]">
        <div className="text-[#00A6C0] text-xl">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#222831] p-4">
      {alert && (
        <div className={`fixed top-5 left-1/2 -translate-x-1/2 p-4 rounded-lg shadow-lg text-white z-50 ${alert.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          {alert.message}
        </div>
      )}
      
      <FadeIn delay={200}>
        <div className="max-w-7xl mx-auto">
          {/* علامات التبويب في الأعلى */}
          <nav className="w-full bg-[#283B48] p-4 rounded-2xl border border-[#00A6C0] mb-6 [box-shadow:0_0_20px_rgba(0,166,192,0.4)]">
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                  activeTab === 'profile' 
                    ? 'bg-[#00A6C0] text-[#222831] shadow-lg' 
                    : 'text-[#D8D7CE] hover:bg-[#394d5c] hover:scale-105'
                }`}
              >
                <AccountCircleIcon />
                المعلومات الشخصية
              </button>
              <button
                onClick={() => setActiveTab('edit-profile')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                  activeTab === 'edit-profile' 
                    ? 'bg-[#00A6C0] text-[#222831] shadow-lg' 
                    : 'text-[#D8D7CE] hover:bg-[#394d5c] hover:scale-105'
                }`}
              >
                <EditIcon />
                تعديل الملف الشخصي
              </button>
              <button
                onClick={() => setActiveTab('change-password')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                  activeTab === 'change-password' 
                    ? 'bg-[#00A6C0] text-[#222831] shadow-lg' 
                    : 'text-[#D8D7CE] hover:bg-[#394d5c] hover:scale-105'
                }`}
              >
                <KeyIcon />
                تغيير كلمة المرور
              </button>
              <button
                onClick={() => setActiveTab('account-settings')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                  activeTab === 'account-settings' 
                    ? 'bg-[#00A6C0] text-[#222831] shadow-lg' 
                    : 'text-[#D8D7CE] hover:bg-[#394d5c] hover:scale-105'
                }`}
              >
                <SettingsIcon />
                إعدادات الحساب
              </button>
              <button
                onClick={() => setActiveTab('privacy-security')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                  activeTab === 'privacy-security' 
                    ? 'bg-[#00A6C0] text-[#222831] shadow-lg' 
                    : 'text-[#D8D7CE] hover:bg-[#394d5c] hover:scale-105'
                }`}
              >
                <SecurityIcon />
                الخصوصية والأمان
              </button>
              <Button
                onClick={handleLogout}
                className="px-6 py-3 rounded-xl font-semibold transition-all duration-300 bg-red-500 text-white hover:bg-red-600 hover:scale-105 flex items-center gap-2"
              >
                <LogoutIcon />
                تسجيل الخروج
              </Button>
            </div>
          </nav>

          {/* المحتوى الرئيسي */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* المحتوى الأيسر - الفورمز */}
            <div className="flex-1">
              <div className="bg-[#283B48] rounded-3xl border border-[#00A6C0] [box-shadow:0_0_30px_rgba(0,166,192,0.6)]">
                {activeTab === 'profile' && (
                  <div className="p-8">
                    <h3 className="text-3xl font-extrabold text-[#D8D7CE] mb-6 text-center">المعلومات الشخصية</h3>
                    <p className="text-[#D8D7CE] text-center mb-8 opacity-80">عرض وإدارة معلوماتك الشخصية الأساسية.</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <h4 className="text-xl font-bold text-[#00A6C0] mb-4">المعلومات الأساسية</h4>
                        <div>
                          <label className="block text-[#D8D7CE] text-sm font-semibold mb-2">الاسم الأول</label>
                          <Input
                            value={userData.firstName}
                            disabled
                            className="cursor-not-allowed opacity-80"
                          />
                        </div>
                        <div>
                          <label className="block text-[#D8D7CE] text-sm font-semibold mb-2">الاسم الأخير</label>
                          <Input
                            value={userData.lastName}
                            disabled
                            className="cursor-not-allowed opacity-80"
                          />
                        </div>
                        <div>
                          <label className="block text-[#D8D7CE] text-sm font-semibold mb-2">البريد الإلكتروني</label>
                          <Input
                            value={userData.email}
                            disabled
                            className="cursor-not-allowed opacity-80"
                          />
                        </div>
                      </div>

                      <div className="space-y-6">
                        <h4 className="text-xl font-bold text-[#00A6C0] mb-4">المعلومات المهنية</h4>
                        <div>
                          <label className="block text-[#D8D7CE] text-sm font-semibold mb-2">المسمى الوظيفي</label>
                          <Input
                            value={userData.jobTitle}
                            disabled
                            className="cursor-not-allowed opacity-80"
                          />
                        </div>
                        <div>
                          <label className="block text-[#D8D7CE] text-sm font-semibold mb-2">القسم</label>
                          <Input
                            value={userData.department}
                            disabled
                            className="cursor-not-allowed opacity-80"
                          />
                        </div>
                        <div>
                          <label className="block text-[#D8D7CE] text-sm font-semibold mb-2">المدينة</label>
                          <Input
                            value={userData.city}
                            disabled
                            className="cursor-not-allowed opacity-80"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'edit-profile' && (
                  <div className="p-8">
                    <h3 className="text-3xl font-extrabold text-[#D8D7CE] mb-6 text-center">تعديل الملف الشخصي</h3>
                    <form onSubmit={handleSaveChanges} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                          <h4 className="text-xl font-bold text-[#00A6C0] mb-4">المعلومات الأساسية</h4>
                          
                          <div>
                            <label className="block text-[#D8D7CE] text-sm font-semibold mb-2">الاسم الأول</label>
                            <Input
                              value={editFormData.firstName}
                              onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })}
                              placeholder="الاسم الأول"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-[#D8D7CE] text-sm font-semibold mb-2">الاسم الأخير</label>
                            <Input
                              value={editFormData.lastName}
                              onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })}
                              placeholder="الاسم الأخير"
                            />
                          </div>

                          <div>
                            <label className="block text-[#D8D7CE] text-sm font-semibold mb-2">البريد الإلكتروني</label>
                            <Input
                              type="email"
                              value={editFormData.email}
                              onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                              placeholder="البريد الإلكتروني"
                            />
                          </div>

                          <div>
                            <label className="block text-[#D8D7CE] text-sm font-semibold mb-2">رقم الهاتف</label>
                            <Input
                              type="tel"
                              value={editFormData.phoneNumber}
                              onChange={(e) => setEditFormData({ ...editFormData, phoneNumber: e.target.value })}
                              placeholder="رقم الهاتف"
                            />
                          </div>

                          {/* تاريخ الميلاد مع التقويم المخصص */}
                          <div>
                            <label className="block text-[#D8D7CE] text-sm font-semibold mb-2">تاريخ الميلاد</label>
                            <div className="relative">
                              <div
                                ref={dateInputRef}
                                className="w-full px-4 py-3 rounded-xl bg-[#222831] text-[#D8D7CE] border-2 border-[#393E46] focus:outline-none focus:ring-2 focus:ring-[#00A6C0] focus:border-[#00A6C0] transition duration-300 cursor-pointer hover:border-[#00A6C0] hover:border-opacity-50 flex items-center justify-between"
                                onClick={() => setShowCalendar(!showCalendar)}
                              >
                                <span className={editFormData.dateOfBirth ? 'text-[#D8D7CE]' : 'text-[#6B7280]'}>
                                  {formatDateForDisplay(editFormData.dateOfBirth)}
                                </span>
                                <EventIcon className="text-[#00A6C0]" />
                              </div>
                              
                              {/* التقويم المخصص */}
                              {showCalendar && (
                                <div 
                                  ref={calendarRef}
                                  className="absolute left-0 top-full mt-2 w-full z-50 bg-[#222831] border-2 border-[#00A6C0] rounded-xl shadow-2xl p-4"
                                >
                                  <div className="flex justify-between items-center mb-4">
                                    <button
                                      onClick={() => navigateMonth('prev')}
                                      className="p-2 text-[#00A6C0] hover:bg-[#393E46] rounded-lg transition duration-200"
                                    >
                                      <ArrowRightIcon />
                                    </button>
                                    
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => setShowMonthSelector(!showMonthSelector)}
                                        className="px-3 py-1 bg-[#393E46] text-[#D8D7CE] rounded-lg hover:bg-[#00A6C0] hover:text-[#222831] transition duration-200 flex items-center gap-1"
                                      >
                                        {arabicMonths[currentMonth]}
                                        <ArrowDropDownIcon fontSize="small" />
                                      </button>
                                      
                                      <button
                                        onClick={() => setShowYearSelector(!showYearSelector)}
                                        className="px-3 py-1 bg-[#393E46] text-[#D8D7CE] rounded-lg hover:bg-[#00A6C0] hover:text-[#222831] transition duration-200 flex items-center gap-1"
                                      >
                                        {currentYear}
                                        <ArrowDropDownIcon fontSize="small" />
                                      </button>
                                    </div>
                                    
                                    <button
                                      onClick={() => navigateMonth('next')}
                                      className="p-2 text-[#00A6C0] hover:bg-[#393E46] rounded-lg transition duration-200"
                                    >
                                      <ArrowLeftIcon />
                                    </button>
                                  </div>

                                  {showYearSelector && (
                                    <div className="absolute top-16 left-4 right-4 bg-[#222831] border border-[#00A6C0] rounded-lg p-3 z-50 max-h-48 overflow-y-auto">
                                      <div className="grid grid-cols-3 gap-2">
                                        {generateYears().map(year => (
                                          <button
                                            key={year}
                                            onClick={() => selectYear(year)}
                                            className={`p-2 rounded text-sm transition duration-200 ${
                                              year === currentYear
                                                ? 'bg-[#00A6C0] text-[#222831] font-bold'
                                                : 'text-[#D8D7CE] hover:bg-[#393E46]'
                                            }`}
                                          >
                                            {year}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {showMonthSelector && (
                                    <div className="absolute top-16 left-4 right-4 bg-[#222831] border border-[#00A6C0] rounded-lg p-3 z-50">
                                      <div className="grid grid-cols-3 gap-2">
                                        {arabicMonths.map((month, index) => (
                                          <button
                                            key={month}
                                            onClick={() => selectMonth(index)}
                                            className={`p-2 rounded text-sm transition duration-200 ${
                                              index === currentMonth
                                                ? 'bg-[#00A6C0] text-[#222831] font-bold'
                                                : 'text-[#D8D7CE] hover:bg-[#393E46]'
                                            }`}
                                          >
                                            {month}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  
                                  <div className="grid grid-cols-7 gap-1 mb-2">
                                    {[0, 1, 2, 3, 4, 5, 6].map(dayIndex => (
                                      <div key={dayIndex} className="text-center p-2 text-[#00A6C0] font-semibold text-sm">
                                        {getArabicDayName(dayIndex)}
                                      </div>
                                    ))}
                                  </div>
                                  
                                  <div className="grid grid-cols-7 gap-1">
                                    {calendarDays.map((date, index) => (
                                      <button
                                        key={index}
                                        type="button"
                                        className={`p-2 rounded-lg text-sm transition-all duration-200 ${
                                          date === null
                                            ? 'invisible'
                                            : date === editFormData.dateOfBirth
                                            ? 'bg-[#00A6C0] text-[#222831] font-bold scale-110'
                                            : date > today
                                            ? 'text-[#6B7280] cursor-not-allowed opacity-50'
                                            : 'text-[#D8D7CE] hover:bg-[#393E46] hover:scale-105'
                                        }`}
                                        onClick={() => date && date <= today && handleDateSelect(date)}
                                        disabled={!date || date > today}
                                      >
                                        {date ? new Date(date).getDate() : ''}
                                      </button>
                                    ))}
                                  </div>
                                  
                                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-[#393E46]">
                                    <button
                                      type="button"
                                      className="text-[#00A6C0] hover:text-[#007B96] text-sm font-semibold transition duration-200"
                                      onClick={() => {
                                        setShowCalendar(false);
                                        setShowYearSelector(false);
                                        setShowMonthSelector(false);
                                      }}
                                    >
                                      إغلاق
                                    </button>
                                    <button
                                      type="button"
                                      className="px-4 py-2 bg-[#00A6C0] text-[#222831] rounded-lg text-sm font-semibold hover:bg-[#007B96] transition duration-200"
                                      onClick={() => handleDateSelect(today)}
                                    >
                                      اليوم
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-6">
                          <h4 className="text-xl font-bold text-[#00A6C0] mb-4">المعلومات المهنية</h4>
                          
                          <div>
                            <label className="block text-[#D8D7CE] text-sm font-semibold mb-2">المسمى الوظيفي</label>
                            <Input
                              value={editFormData.jobTitle}
                              onChange={(e) => setEditFormData({ ...editFormData, jobTitle: e.target.value })}
                              placeholder="المسمى الوظيفي"
                            />
                          </div>

                          <div>
                            <label className="block text-[#D8D7CE] text-sm font-semibold mb-2">القسم</label>
                            <select
                              className="w-full px-4 py-3 rounded-xl bg-[#222831] text-[#D8D7CE] border-2 border-[#393E46] focus:outline-none focus:ring-2 focus:ring-[#00A6C0] focus:border-[#00A6C0] transition duration-300"
                              value={editFormData.department}
                              onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                            >
                              <option value="">اختر القسم</option>
                              {departments.map((dept) => (
                                <option key={dept} value={dept}>{dept}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-[#D8D7CE] text-sm font-semibold mb-2">المدينة</label>
                            <select
                              className="w-full px-4 py-3 rounded-xl bg-[#222831] text-[#D8D7CE] border-2 border-[#393E46] focus:outline-none focus:ring-2 focus:ring-[#00A6C0] focus:border-[#00A6C0] transition duration-300"
                              value={editFormData.city}
                              onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                            >
                              <option value="">اختر المدينة</option>
                              {cities.map((city) => (
                                <option key={city} value={city}>{city}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-[#D8D7CE] text-sm font-semibold mb-2">المؤهل العلمي</label>
                            <select
                              className="w-full px-4 py-3 rounded-xl bg-[#222831] text-[#D8D7CE] border-2 border-[#393E46] focus:outline-none focus:ring-2 focus:ring-[#00A6C0] focus:border-[#00A6C0] transition duration-300"
                              value={editFormData.educationalQualification}
                              onChange={(e) => setEditFormData({ ...editFormData, educationalQualification: e.target.value })}
                            >
                              <option value="">اختر المؤهل العلمي</option>
                              {qualifications.map((qual) => (
                                <option key={qual} value={qual}>{qual}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-[#D8D7CE] text-sm font-semibold mb-2">الوصف الشخصي</label>
                            <textarea
                              rows={4}
                              maxLength={750}
                              className="w-full px-4 py-3 rounded-xl bg-[#222831] text-[#D8D7CE] border-2 border-[#393E46] focus:outline-none focus:ring-2 focus:ring-[#00A6C0] focus:border-[#00A6C0] transition duration-300 resize-none"
                              value={editFormData.bio}
                              onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })}
                              placeholder="أخبرنا عن نفسك..."
                            ></textarea>
                            <p className="text-left text-sm text-[#D8D7CE] opacity-70 mt-2">{bioCharCount}/750</p>
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        type="submit"
                        className="w-full bg-[#00A6C0] text-[#222831] py-3 rounded-xl font-bold text-lg hover:bg-[#007B96] transition duration-300 transform hover:-translate-y-1 shadow-lg mt-6"
                      >
                        حفظ التغييرات
                      </Button>
                    </form>
                  </div>
                )}

                {activeTab === 'change-password' && (
                  <div className="p-8">
                    <h3 className="text-3xl font-extrabold text-[#D8D7CE] mb-6 text-center">تغيير كلمة المرور</h3>
                    <form onSubmit={handleChangePassword} className="max-w-2xl mx-auto space-y-6">
                      <div>
                        <label className="block text-[#D8D7CE] text-sm font-semibold mb-2">كلمة المرور القديمة</label>
                        <Input
                          type="password"
                          value={passwordFormData.oldPassword}
                          onChange={(e) => setPasswordFormData({ ...passwordFormData, oldPassword: e.target.value })}
                          placeholder="كلمة المرور القديمة"
                        />
                      </div>
                      <div>
                        <label className="block text-[#D8D7CE] text-sm font-semibold mb-2">كلمة المرور الجديدة</label>
                        <Input
                          type="password"
                          value={passwordFormData.newPassword}
                          onChange={(e) => setPasswordFormData({ ...passwordFormData, newPassword: e.target.value })}
                          placeholder="كلمة المرور الجديدة"
                        />
                      </div>
                      <div>
                        <label className="block text-[#D8D7CE] text-sm font-semibold mb-2">أعد إدخال كلمة المرور الجديدة</label>
                        <Input
                          type="password"
                          value={passwordFormData.reNewPassword}
                          onChange={(e) => setPasswordFormData({ ...passwordFormData, reNewPassword: e.target.value })}
                          placeholder="أعد إدخال كلمة المرور الجديدة"
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full bg-[#00A6C0] text-[#222831] py-3 rounded-xl font-bold text-lg hover:bg-[#007B96] transition duration-300 transform hover:-translate-y-1 shadow-lg"
                      >
                        تغيير كلمة المرور
                      </Button>
                    </form>
                  </div>
                )}

                {activeTab === 'account-settings' && (
                  <div className="p-8">
                    <h3 className="text-3xl font-extrabold text-[#D8D7CE] mb-6 text-center">إعدادات الحساب</h3>
                    <div className="max-w-2xl mx-auto space-y-8">
                      <div>
                        <h4 className="text-xl font-bold text-[#00A6C0] mb-4">إعدادات الإشعارات</h4>
                        <div className="space-y-4">
                          {['emailNotifications', 'taskNotifications', 'projectNotifications'].map((setting) => (
                            <label key={setting} className="flex items-center justify-between p-4 bg-[#222831] rounded-xl border border-[#393E46]">
                              <span className="text-[#D8D7CE]">
                                {setting === 'emailNotifications' && 'الإشعارات عبر البريد الإلكتروني'}
                                {setting === 'taskNotifications' && 'إشعارات المهام'}
                                {setting === 'projectNotifications' && 'إشعارات المشاريع'}
                              </span>
                              <input
                                type="checkbox"
                                className="form-checkbox h-5 w-5 text-[#00A6C0] rounded border-gray-300 focus:ring-[#00A6C0] transition duration-300"
                                checked={userData[setting as keyof UserProfile] as boolean}
                                onChange={(e) => handleAccountSettingsChange(setting, e.target.checked)}
                              />
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'privacy-security' && (
                  <div className="p-8">
                    <h3 className="text-3xl font-extrabold text-[#D8D7CE] mb-6 text-center">الخصوصية والأمان</h3>
                    <p className="text-[#D8D7CE] text-center text-lg">إدارة إعدادات الخصوصية وخيارات الأمان.</p>
                  </div>
                )}
              </div>
            </div>

            {/* الشريط الجانبي على اليمين */}
            <div className="lg:w-80">
              <Card className="bg-[#283B48] border border-[#00A6C0] rounded-3xl p-6 [box-shadow:0_0_30px_rgba(0,166,192,0.6)] sticky top-6">
                <div className="flex flex-col items-center text-center">
                  <div className="relative w-24 h-24 rounded-full border-4 border-[#00A6C0] overflow-hidden mb-4">
                    <Image
                      src={profileImage || avatar.src}
                      alt="Profile"
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                    <input
                      type="file"
                      id="profile-image-upload"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                    <label
                      htmlFor="profile-image-upload"
                      className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-[#D8D7CE] opacity-0 hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                      title="تغيير صورة الملف الشخصي"
                    >
                      <FolderOpenIcon fontSize="small" />
                    </label>
                  </div>
                  
                  <h2 className="text-2xl font-bold text-[#D8D7CE] mb-1">{userData.firstName} {userData.lastName}</h2>
                  <p className="text-[#00A6C0] text-sm font-semibold mb-4">{userData.title}</p>
                  <p className="text-[#D8D7CE] text-sm opacity-80 leading-relaxed mb-6">{userData.bio}</p>

                  <div className="grid grid-cols-3 gap-4 w-full pt-4 border-t border-[#00A6C0] border-opacity-30">
                    <div>
                      <p className="text-[#00A6C0] font-bold text-lg">{userData.projects}</p>
                      <p className="text-[#D8D7CE] text-xs">المشاريع</p>
                    </div>
                    <div>
                      <p className="text-[#00A6C0] font-bold text-lg">{userData.completedTasks}</p>
                      <p className="text-[#D8D7CE] text-xs">المهام</p>
                    </div>
                    <div>
                      <p className="text-[#00A6C0] font-bold text-lg">{userData.completionRate}</p>
                      <p className="text-[#D8D7CE] text-xs">الإنجاز</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}