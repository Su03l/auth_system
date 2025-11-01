import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#00A6C0', // لوني الأزرق الفيروزي
    },
    secondary: {
      main: '#D8D7CE', // لوني الفاتح
    },
    background: {
      default: '#222831', // لون الخلفية الداكن الرئيسي
      paper: '#283B48', // لون خلفية البطاقات/العناصر الأخرى
    },
    text: {
      primary: '#D8D7CE', // لون النص الأساسي
      secondary: '#00A6C0', // لون النص الثانوي
    },
  },
  typography: {
    fontFamily: [ // يمكن تعديل الخطوط لتناسب تصميمك
      'Cairo',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px', // لتطبيق حواف مستديرة على الأزرار
          textTransform: 'none', // لمنع تحويل النص إلى أحرف كبيرة تلقائيًا
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          // تخصيص حقول الإدخال إذا كنت تستخدم TextField من Material UI
          '& .MuiInputBase-input': {
            color: '#D8D7CE',
          },
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#393E46',
            },
            '&:hover fieldset': {
              borderColor: '#00A6C0',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#00A6C0',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#D8D7CE',
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: '#00A6C0',
          },
        },
      },
    },
  },
});

export default theme;
