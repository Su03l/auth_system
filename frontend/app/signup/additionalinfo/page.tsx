'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import FadeIn from '@/components/animations/FadeIn';
import PersonIcon from '@mui/icons-material/Person';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import SchoolIcon from '@mui/icons-material/School';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EventIcon from '@mui/icons-material/Event';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const BASE_URL = 'http://localhost:5000';

export default function AdditionalInfo() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    jobTitle: '',
    department: '',
    city: '',
    educationalQualification: '',
    aboutMe: '',
    dateOfBirth: '',
  });
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showYearSelector, setShowYearSelector] = useState(false);
  const [showMonthSelector, setShowMonthSelector] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);

  // إغلاق التقويم عند النقر خارج المنطقة
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
        setShowYearSelector(false);
        setShowMonthSelector(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const storedData = localStorage.getItem('signupFormData');
    if (!storedData) {
      router.push('/signup');
    }
  }, [router]);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleDateSelect = (date: string) => {
    setFormData(prev => ({
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
    
    // الأيام الفارغة في بداية الشهر
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    
    // أيام الشهر
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const storedData = localStorage.getItem('signupFormData');
    if (!storedData) {
      setAlert({ message: 'بيانات التسجيل الأولية غير موجودة. يرجى البدء من جديد.', type: 'error' });
      router.push('/signup');
      return;
    }

    const initialSignupData = JSON.parse(storedData);

    const fullRegistrationData = {
      ...initialSignupData,
      ...formData,
    };

    try {
      const response = await axios.post(`${BASE_URL}/auth/signup`, fullRegistrationData);

      if (response.status === 201) {
        localStorage.removeItem('signupFormData');
        setAlert({ message: 'تم التسجيل بنجاح! جاري التوجيه إلى صفحة تسجيل الدخول...', type: 'success' });
        setTimeout(() => {
          router.push('/signin');
        }, 3000);
      }
    } catch (error: unknown) {
      console.error('Full registration error:', error);
      if (axios.isAxiosError(error) && error.response) {
        setAlert({ message: error.response.data?.error || 'حدث خطأ أثناء التسجيل.', type: 'error' });
      } else {
        setAlert({ message: 'حدث خطأ غير متوقع.', type: 'error' });
      }
    }
  };

  const aboutMeCharCount = formData.aboutMe.length;
  const calendarDays = generateCalendarDays();
  const today = new Date().toISOString().split('T')[0];
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {alert && (
        <div className={`fixed top-5 left-1/2 -translate-x-1/2 p-4 rounded-lg shadow-lg text-white z-50 ${alert.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          {alert.message}
        </div>
      )}
      <Link href="/signup" className="absolute top-6 right-6 text-[#D8D7CE] hover:text-[#00A6C0] transition duration-300 flex items-center group">
        <ArrowBackIcon className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
        <span className="font-semibold">العودة</span>
      </Link>
      <FadeIn delay={200}>
        <Card className="w-[500px] max-w-2xl p-8 transition-transform duration-500 border border-[#00A6C0] rounded-3xl [box-shadow:0_0_30px_rgba(0,166,192,0.6)]">
          <h2 className="text-4xl font-extrabold text-[#00A6C0] mb-4 text-center tracking-wide flex items-center justify-center gap-2">
            معلومات إضافية
          </h2>
          <p className="text-[#D8D7CE] text-center mb-8 opacity-80 leading-snug">
            يرجى تقديم بعض التفاصيل الإضافية لإكمال ملفك الشخصي.
          </p>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Job Title */}
            <div className="relative">
              <Input
                id="jobTitle"
                placeholder="المسمى الوظيفي"
                startIcon={<PersonIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-[#D8D7CE]" />}
                value={formData.jobTitle}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Department Dropdown */}
            <div className="relative">
              <div className="relative">
                <select
                  id="department"
                  className="w-full px-12 py-4 rounded-xl bg-[#222831] text-[#D8D7CE] border-2 border-[#393E46] focus:outline-none focus:ring-2 focus:ring-[#00A6C0] focus:border-[#00A6C0] transition duration-300 appearance-none cursor-pointer hover:border-[#00A6C0] hover:border-opacity-50"
                  value={formData.department}
                  onChange={handleInputChange}
                >
                  <option value="" className="text-[#6B7280]">اختر القسم</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept} className="bg-[#222831] text-[#D8D7CE] py-2">
                      {dept}
                    </option>
                  ))}
                </select>
                <PersonIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-[#D8D7CE]" />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-[#00A6C0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* City Dropdown */}
            <div className="relative">
              <div className="relative">
                <select
                  id="city"
                  className="w-full px-12 py-4 rounded-xl bg-[#222831] text-[#D8D7CE] border-2 border-[#393E46] focus:outline-none focus:ring-2 focus:ring-[#00A6C0] focus:border-[#00A6C0] transition duration-300 appearance-none cursor-pointer hover:border-[#00A6C0] hover:border-opacity-50"
                  value={formData.city}
                  onChange={handleInputChange}
                >
                  <option value="" className="text-[#6B7280]">اختر المدينة</option>
                  {cities.map((city) => (
                    <option key={city} value={city} className="bg-[#222831] text-[#D8D7CE] py-2">
                      {city}
                    </option>
                  ))}
                </select>
                <LocationCityIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-[#D8D7CE]" />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-[#00A6C0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Educational Qualification Dropdown */}
            <div className="relative">
              <div className="relative">
                <select
                  id="educationalQualification"
                  className="w-full px-12 py-4 rounded-xl bg-[#222831] text-[#D8D7CE] border-2 border-[#393E46] focus:outline-none focus:ring-2 focus:ring-[#00A6C0] focus:border-[#00A6C0] transition duration-300 appearance-none cursor-pointer hover:border-[#00A6C0] hover:border-opacity-50"
                  value={formData.educationalQualification}
                  onChange={handleInputChange}
                >
                  <option value="" className="text-[#6B7280]">اختر المؤهل العلمي</option>
                  {qualifications.map((qual) => (
                    <option key={qual} value={qual} className="bg-[#222831] text-[#D8D7CE] py-2">
                      {qual}
                    </option>
                  ))}
                </select>
                <SchoolIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-[#D8D7CE]" />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-[#00A6C0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Date of Birth with Custom Calendar */}
            <div className="relative">
              <div className="relative">
                <div
                  ref={inputRef}
                  className="w-full px-12 py-4 rounded-xl bg-[#222831] text-[#D8D7CE] border-2 border-[#393E46] focus:outline-none focus:ring-2 focus:ring-[#00A6C0] focus:border-[#00A6C0] transition duration-300 appearance-none cursor-pointer hover:border-[#00A6C0] hover:border-opacity-50 flex items-center justify-between"
                  onClick={() => setShowCalendar(!showCalendar)}
                >
                  <span className={formData.dateOfBirth ? 'text-[#D8D7CE]' : 'text-[#6B7280]'}>
                    {formatDateForDisplay(formData.dateOfBirth)}
                  </span>
                  <EventIcon className="text-[#00A6C0]" />
                </div>
                <CalendarTodayIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-[#D8D7CE]" />
                
                {/* Custom Calendar */}
                {showCalendar && (
                  <div 
                    ref={calendarRef}
                    className="absolute left-0 top-full mt-2 w-full z-50 bg-[#222831] border-2 border-[#00A6C0] rounded-xl shadow-2xl p-4"
                  >
                    {/* Calendar Header with Navigation */}
                    <div className="flex justify-between items-center mb-4">
                      <button
                        type="button"
                        onClick={() => navigateMonth('prev')}
                        className="p-2 text-[#00A6C0] hover:bg-[#393E46] rounded-lg transition duration-200"
                      >
                        <ArrowRightIcon />
                      </button>
                      
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setShowMonthSelector(!showMonthSelector)}
                          className="px-3 py-1 bg-[#393E46] text-[#D8D7CE] rounded-lg hover:bg-[#00A6C0] hover:text-[#222831] transition duration-200 flex items-center gap-1"
                        >
                          {arabicMonths[currentMonth]}
                          <ArrowDropDownIcon fontSize="small" />
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => setShowYearSelector(!showYearSelector)}
                          className="px-3 py-1 bg-[#393E46] text-[#D8D7CE] rounded-lg hover:bg-[#00A6C0] hover:text-[#222831] transition duration-200 flex items-center gap-1"
                        >
                          {currentYear}
                          <ArrowDropDownIcon fontSize="small" />
                        </button>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => navigateMonth('next')}
                        className="p-2 text-[#00A6C0] hover:bg-[#393E46] rounded-lg transition duration-200"
                        disabled={currentYear >= new Date().getFullYear() && currentMonth >= new Date().getMonth()}
                      >
                        <ArrowLeftIcon />
                      </button>
                    </div>

                    {/* Year Selector */}
                    {showYearSelector && (
                      <div className="absolute top-16 left-4 right-4 bg-[#222831] border border-[#00A6C0] rounded-lg p-3 z-50 max-h-48 overflow-y-auto">
                        <div className="grid grid-cols-3 gap-2">
                          {generateYears().map(year => (
                            <button
                              key={year}
                              type="button"
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

                    {/* Month Selector */}
                    {showMonthSelector && (
                      <div className="absolute top-16 left-4 right-4 bg-[#222831] border border-[#00A6C0] rounded-lg p-3 z-50">
                        <div className="grid grid-cols-3 gap-2">
                          {arabicMonths.map((month, index) => (
                            <button
                              key={month}
                              type="button"
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
                    
                    {/* Days Header */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {[0, 1, 2, 3, 4, 5, 6].map(dayIndex => (
                        <div key={dayIndex} className="text-center p-2 text-[#00A6C0] font-semibold text-sm">
                          {getArabicDayName(dayIndex)}
                        </div>
                      ))}
                    </div>
                    
                    {/* Calendar Days */}
                    <div className="grid grid-cols-7 gap-1">
                      {calendarDays.map((date, index) => (
                        <button
                          key={index}
                          type="button"
                          className={`p-2 rounded-lg text-sm transition-all duration-200 ${
                            date === null
                              ? 'invisible'
                              : date === formData.dateOfBirth
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
                    
                    {/* Today Button */}
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

            {/* About Me */}
            <h3 className="text-xl font-bold text-[#D8D7CE] mt-12 mb-6 text-center">عني</h3>
            <div className="relative">
              <textarea
                id="aboutMe"
                rows={4}
                maxLength={750}
                className="w-full px-4 py-3 rounded-xl bg-[#222831] text-[#D8D7CE] border-2 border-[#393E46] focus:outline-none focus:ring-2 focus:ring-[#00A6C0] focus:border-[#00A6C0] transition duration-300 resize-none hover:border-[#00A6C0] hover:border-opacity-50"
                value={formData.aboutMe}
                onChange={handleInputChange}
                placeholder="أخبرنا عن نفسك..."
              ></textarea>
              <p className="text-left text-sm text-[#D8D7CE] opacity-70 mt-2">{aboutMeCharCount}/750</p>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#00A6C0] text-[#222831] py-4 rounded-xl font-bold text-lg hover:bg-[#007B96] transition duration-300 transform hover:-translate-y-1 shadow-lg tracking-wide border-2 border-transparent hover:border-[#00A6C0]"
            >
              إرسال
            </Button>
          </form>
        </Card>
      </FadeIn>

      <style jsx global>{`
        select option {
          background-color: #222831;
          color: #D8D7CE;
          padding: 12px;
        }
        
        select option:first-child {
          color: #6B7280;
        }
        
        select:focus option:checked {
          background-color: #00A6C0;
          color: #222831;
        }
        
        /* Custom scrollbar for year selector */
        .overflow-y-auto::-webkit-scrollbar {
          width: 6px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-track {
          background: #393E46;
          border-radius: 3px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #00A6C0;
          border-radius: 3px;
        }
      `}</style>
    </div>
  );
}