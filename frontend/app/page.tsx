import Link from 'next/link';
import Button from '@/components/ui/Button';
import FadeIn from '@/components/animations/FadeIn';
import HomeIcon from '@mui/icons-material/Home';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import Card from '@/components/ui/Card'; // Import Card component

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <FadeIn delay={200}>
        <Card className="text-center max-w-lg mx-auto border border-[#00A6C0] rounded-3xl p-10">
          <HomeIcon style={{ fontSize: 80, color: '#00A6C0' }} className="mb-6 animate-bounce" />
          <h1 className="text-6xl font-extrabold text-[#D8D7CE] mb-6 tracking-tight leading-tight">
            مرحباً بك في نظام المصادقة المتكامل
          </h1>
          <p className="text-[#D8D7CE] text-lg mb-8 opacity-90 leading-relaxed">
            بوابتك الآمنة لإدارة المستخدمين. ابدأ رحلتك معنا اليوم وسجل الدخول للوصول إلى لوحة التحكم الخاصة بك، أو أنشئ حسابًا جديدًا لاكتشاف الميزات الحصرية. نظامنا يضمن لك تجربة سلسة وآمنة.
          </p>
          <div className="space-x-4 flex justify-center">
            <Link href="/signin" className="bg-[#00A6C0] text-[#222831] hover:bg-[#007B96] transform hover:-translate-y-1 shadow-lg rounded-xl flex items-center justify-center p-3">
              <Button startIcon={<LoginIcon />}>
                تسجيل الدخول
              </Button>
            </Link>
            <Link href="/signup" className="bg-[#00A6C0] text-[#222831] hover:bg-[#007B96] transform hover:-translate-y-1 shadow-lg rounded-xl flex items-center justify-center p-3">
              <Button startIcon={<PersonAddIcon />}>
                إنشاء حساب
              </Button>
            </Link>
          </div>
        </Card>
      </FadeIn>
    </div>
  );
}
