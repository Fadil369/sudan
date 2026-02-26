/**
 * i18n Configuration - Internationalization
 * Supports Arabic (RTL) and English
 * 
 * SGDUS Mobile App - Sudan Government Digital Unified System
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Arabic translations
const ar = {
  translation: {
    // Common
    common: {
      loading: 'جاري التحميل...',
      error: 'خطأ',
      success: 'نجاح',
      cancel: 'إلغاء',
      confirm: 'تأكيد',
      save: 'حفظ',
      delete: 'حذف',
      edit: 'تعديل',
      search: 'بحث',
      next: 'التالي',
      previous: 'السابق',
      back: 'رجوع',
      done: 'تم',
      retry: 'إعادة المحاولة',
      close: 'إغلاق',
    },
    
    // Auth
    auth: {
      login: 'تسجيل الدخول',
      logout: 'تسجيل الخروج',
      register: 'تسجيل',
      nationalId: 'رقم الهوية',
      password: 'كلمة المرور',
      phoneNumber: 'رقم الهاتف',
      forgotPassword: 'نسيت كلمة المرور?',
      createAccount: 'إنشاء حساب',
      orContinueWith: 'أو تابع باستخدام',
      biometricLogin: 'تسجيل بالبصمة',
      verifyIdentity: 'تحقق من الهوية',
      enterOtp: 'أدخل رمز التحقق',
      otpSent: 'تم إرسال رمز التحقق',
    },
    
    // Navigation
    nav: {
      home: 'الرئيسية',
      services: 'الخدمات',
      profile: 'الملف',
      notifications: 'الإشعارات',
      settings: 'الإعدادات',
    },
    
    // Services
    services: {
      title: 'الخدمات الحكومية',
      health: 'الخدمات الصحية',
      education: 'الخدمات التعليمية',
      agriculture: 'الخدمات الزراعية',
      finance: 'الخدمات المالية',
      justice: 'الخدمات العدلية',
      labor: 'خدمات العمل',
      social: 'الرعاية الاجتماعية',
      energy: 'الطاقة',
      infrastructure: 'البنية التحتية',
      foreignAffairs: 'الخارجية',
    },
    
    // Profile
    profile: {
      title: 'ملفي الشخصي',
      personalInfo: 'المعلومات الشخصية',
      oid: 'رقم الهويةOID',
      name: 'الاسم',
      dob: 'تاريخ الميلاد',
      gender: 'الجنس',
      male: 'ذكر',
      female: 'أنثى',
      address: 'العنوان',
      state: 'الولاية',
      editProfile: 'تعديل الملف',
      changePassword: 'تغيير كلمة المرور',
      biometricSettings: 'إعدادات البصمة',
      language: 'اللغة',
    },
    
    // Errors
    errors: {
      networkError: 'خطأ في الشبكة',
      invalidCredentials: 'بيانات غير صحيحة',
      sessionExpired: 'انتهت الجلسة',
      tryAgain: 'حاول مرة أخرى',
      required: 'هذا الحقل مطلوب',
    },
  },
};

// English translations
const en = {
  translation: {
    // Common
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      confirm: 'Confirm',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      search: 'Search',
      next: 'Next',
      previous: 'Previous',
      back: 'Back',
      done: 'Done',
      retry: 'Retry',
      close: 'Close',
    },
    
    // Auth
    auth: {
      login: 'Login',
      logout: 'Logout',
      register: 'Register',
      nationalId: 'National ID',
      password: 'Password',
      phoneNumber: 'Phone Number',
      forgotPassword: 'Forgot Password?',
      createAccount: 'Create Account',
      orContinueWith: 'Or continue with',
      biometricLogin: 'Login with Biometrics',
      verifyIdentity: 'Verify Identity',
      enterOtp: 'Enter Verification Code',
      otpSent: 'Verification code sent',
    },
    
    // Navigation
    nav: {
      home: 'Home',
      services: 'Services',
      profile: 'Profile',
      notifications: 'Notifications',
      settings: 'Settings',
    },
    
    // Services
    services: {
      title: 'Government Services',
      health: 'Health Services',
      education: 'Education Services',
      agriculture: 'Agriculture Services',
      finance: 'Finance Services',
      justice: 'Justice Services',
      labor: 'Labor Services',
      social: 'Social Welfare',
      energy: 'Energy',
      infrastructure: 'Infrastructure',
      foreignAffairs: 'Foreign Affairs',
    },
    
    // Profile
    profile: {
      title: 'My Profile',
      personalInfo: 'Personal Information',
      oid: 'OID',
      name: 'Name',
      dob: 'Date of Birth',
      gender: 'Gender',
      male: 'Male',
      female: 'Female',
      address: 'Address',
      state: 'State',
      editProfile: 'Edit Profile',
      changePassword: 'Change Password',
      biometricSettings: 'Biometric Settings',
      language: 'Language',
    },
    
    // Errors
    errors: {
      networkError: 'Network error',
      invalidCredentials: 'Invalid credentials',
      sessionExpired: 'Session expired',
      tryAgain: 'Try again',
      required: 'This field is required',
    },
  },
};

// Initialize i18n
i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    resources: {
      ar,
      en,
    },
    lng: 'ar', // Default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

// Load saved language preference
(async () => {
  try {
    const savedLanguage = await AsyncStorage.getItem('@sgdus_language');
    if (savedLanguage) {
      await i18n.changeLanguage(savedLanguage);
    }
  } catch (error) {
    console.error('Error loading language preference:', error);
  }
})();

export default i18n;
