import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Tabs, Tab, Accordion, AccordionSummary, AccordionDetails,
  TextField, InputAdornment, Paper, Chip, IconButton, Button, Tooltip,
  Table, TableHead, TableRow, TableCell, TableBody,
} from '@mui/material';
import {
  ExpandMore, Search, Home, MenuBook, Business, AdminPanelSettings,
  Phone, Email, Language, ArrowBack, PersonAdd, Login as LoginIcon,
  HowToReg, Security, Help, ContactSupport,
} from '@mui/icons-material';

// ─── Design tokens ───────────────────────────────────────────────────────────
const COLORS = {
  primary: '#1B3A5C',
  success: '#007A3D',
  accent: '#C8102E',
  citizen: '#1976d2',
  business: '#16a34a',
  staff: '#7c3aed',
  heroBg: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #6366f1 100%)',
  footerBg: '#1e293b',
};

// ─── Bilingual content ──────────────────────────────────────────────────────
const CONTENT = {
  // ── Header / UI strings ────────────────────────────────────────────────
  ui: {
    en: {
      brand: 'SGDUS Documentation Hub',
      search: 'Search documentation…',
      backHome: 'Back to Home',
      getStarted: 'Get Started',
      learnMore: 'Learn More',
      tabs: ['📘 Citizens', '📗 Businesses', '📕 Government Staff'],
      quickStart: 'Quick Start',
      footer: '© 2025 Sudan Government Digital Unified System. All rights reserved.',
      noResults: 'No sections match your search.',
    },
    ar: {
      brand: 'مركز وثائق SGDUS',
      search: 'البحث في الوثائق…',
      backHome: 'العودة للرئيسية',
      getStarted: 'ابدأ الآن',
      learnMore: 'اعرف المزيد',
      tabs: ['📘 المواطنون', '📗 الأعمال', '📕 الموظفون الحكوميون'],
      quickStart: 'البدء السريع',
      footer: '© 2025 النظام الحكومي الرقمي الموحد السوداني. جميع الحقوق محفوظة.',
      noResults: 'لا توجد أقسام مطابقة للبحث.',
    },
  },

  // ── Quick-start sidebar cards ──────────────────────────────────────────
  quickStart: {
    en: [
      { icon: <PersonAdd />, title: 'Register', desc: 'Create your digital identity (OID) via Web, App, or USSD *123#.' },
      { icon: <LoginIcon />, title: 'Log In', desc: 'Use your OID + password or request an SMS one-time password.' },
      { icon: <HowToReg />, title: 'Verify Identity', desc: 'Complete MFA and link family members to your profile.' },
      { icon: <Security />, title: 'Stay Secure', desc: 'Enable 2FA, use strong passwords, never share your OID.' },
    ],
    ar: [
      { icon: <PersonAdd />, title: 'التسجيل', desc: 'أنشئ هويتك الرقمية (OID) عبر الويب أو التطبيق أو USSD *123#.' },
      { icon: <LoginIcon />, title: 'تسجيل الدخول', desc: 'استخدم OID + كلمة المرور أو اطلب كلمة مرور لمرة واحدة عبر SMS.' },
      { icon: <HowToReg />, title: 'التحقق من الهوية', desc: 'أكمل MFA واربط أفراد الأسرة بملفك.' },
      { icon: <Security />, title: 'ابقَ آمناً', desc: 'فعّل 2FA، استخدم كلمات مرور قوية، ولا تشارك OID.' },
    ],
  },

  // ── Citizen sections ───────────────────────────────────────────────────
  citizen: {
    en: [
      {
        title: '1. Introduction',
        body: 'SGDUS gives every Sudanese citizen a unique digital identity (OID) to access government services securely from anywhere — via web portal, mobile app, or USSD.',
        bullets: ['Register births & apply for documents', 'Access health & education services', 'Register a business', 'Verify identity for transactions'],
      },
      {
        title: '2. Getting Started',
        body: 'You need a national ID (10 digits), a Sudanese phone number (+249), and basic personal info.',
        bullets: ['Web: portal.sgdus.gov.sd', 'Mobile App: Google Play / App Store', 'USSD: Dial *123# from any phone'],
      },
      {
        title: '3. Registering for Digital Identity (OID)',
        body: 'Register via the web portal, mobile app, or USSD to receive your permanent OID.',
        bullets: [
          'Web: Click "Register as Citizen" → fill form → submit → receive OID via SMS',
          'App: Tap "Register" → same steps as web',
          'USSD: Dial *123# → option 1 → follow prompts → receive OID',
        ],
      },
      {
        title: '4. Logging In',
        body: 'Log in with your OID and password, or use SMS-based OTP for passwordless access.',
        bullets: ['Web/App: Enter OID + password, or request OTP', 'USSD: Dial *123# → "Login" → enter OID + PIN or OTP'],
      },
      {
        title: '5. Using Your Digital Identity',
        body: 'Manage your profile, register births, link family members, and access integrated government services.',
        bullets: [
          'Update info via "My Profile"',
          'Check status via USSD or dashboard',
          'Register a birth and download certificate',
          'Link family members by OID',
          'Access passport, license, land registration & more',
        ],
      },
      {
        title: '6. Security Tips',
        body: 'Protect your digital identity with these essential practices.',
        bullets: ['Never share your OID or password', 'Use strong passwords (letters + numbers + symbols)', 'Enable 2FA in the app', 'If phone lost, contact support immediately'],
      },
      {
        title: '7. Troubleshooting',
        body: 'Common issues and solutions:',
        table: [
          ['No SMS with OID', 'Wait a few minutes; check phone number or contact support.'],
          ['Forgot OID', 'Use "Recover OID" on login page with National ID + phone.'],
          ['Login fails', 'Verify OID; request new OTP or reset password.'],
          ['Portal slow', 'Try USSD or app during off-peak hours.'],
        ],
      },
      {
        title: '8. Contact Support',
        body: 'Reach us through any of these channels:',
        bullets: ['Phone: 1234 (toll-free) or +249 123 456 789', 'Email: support@sgdus.gov.sd', 'In person: Any SGDUS service centre'],
      },
    ],
    ar: [
      {
        title: '١. مقدمة',
        body: 'يمنح SGDUS كل مواطن سوداني هوية رقمية فريدة (OID) للوصول إلى الخدمات الحكومية بأمان من أي مكان — عبر البوابة أو التطبيق أو USSD.',
        bullets: ['تسجيل المواليد والتقدم للوثائق', 'الوصول لخدمات الصحة والتعليم', 'تسجيل عمل تجاري', 'التحقق من الهوية للمعاملات'],
      },
      {
        title: '٢. البدء',
        body: 'تحتاج إلى رقم قومي (10 أرقام)، ورقم هاتف سوداني (+249)، ومعلومات شخصية أساسية.',
        bullets: ['الويب: portal.sgdus.gov.sd', 'التطبيق: Google Play / App Store', 'USSD: اطلب *123# من أي هاتف'],
      },
      {
        title: '٣. تسجيل الهوية الرقمية (OID)',
        body: 'سجّل عبر البوابة أو التطبيق أو USSD للحصول على OID الدائم.',
        bullets: [
          'الويب: انقر "تسجيل كمواطن" → املأ النموذج → أرسل → تلقّ OID عبر SMS',
          'التطبيق: انقر "تسجيل" → نفس الخطوات',
          'USSD: اطلب *123# → الخيار 1 → اتبع التعليمات → تلقّ OID',
        ],
      },
      {
        title: '٤. تسجيل الدخول',
        body: 'سجّل الدخول باستخدام OID وكلمة المرور، أو استخدم OTP عبر SMS.',
        bullets: ['الويب/التطبيق: أدخل OID + كلمة المرور أو اطلب OTP', 'USSD: اطلب *123# → "تسجيل الدخول" → أدخل OID + PIN أو OTP'],
      },
      {
        title: '٥. استخدام هويتك الرقمية',
        body: 'أدِر ملفك الشخصي، سجّل مواليد، اربط أفراد الأسرة، واستخدم الخدمات الحكومية المتكاملة.',
        bullets: ['تحديث المعلومات عبر "ملفي الشخصي"', 'التحقق من الحالة عبر USSD أو لوحة التحكم', 'تسجيل مولود وتحميل الشهادة', 'ربط أفراد الأسرة بـ OID', 'جواز سفر، رخصة قيادة، تسجيل أراضٍ والمزيد'],
      },
      {
        title: '٦. نصائح أمنية',
        body: 'احمِ هويتك الرقمية بهذه الممارسات الأساسية.',
        bullets: ['لا تشارك OID أو كلمة المرور', 'استخدم كلمات مرور قوية', 'فعّل المصادقة الثنائية', 'إذا فقدت هاتفك، اتصل بالدعم فوراً'],
      },
      {
        title: '٧. استكشاف الأخطاء',
        body: 'المشكلات الشائعة وحلولها:',
        table: [
          ['لم أتلقّ SMS بـ OID', 'انتظر بضع دقائق؛ تحقق من الرقم أو اتصل بالدعم.'],
          ['نسيت OID', 'استخدم "استعادة OID" بالرقم القومي + الهاتف.'],
          ['فشل تسجيل الدخول', 'تأكد من OID؛ اطلب OTP جديداً أو أعد تعيين كلمة المرور.'],
          ['البوابة بطيئة', 'جرّب USSD أو التطبيق في غير أوقات الذروة.'],
        ],
      },
      {
        title: '٨. الاتصال بالدعم',
        body: 'تواصل معنا عبر هذه القنوات:',
        bullets: ['الهاتف: 1234 (مجاني) أو 789 456 123 249+', 'البريد: support@sgdus.gov.sd', 'شخصياً: أي مركز خدمة SGDUS'],
      },
    ],
  },

  // ── Business sections ──────────────────────────────────────────────────
  business: {
    en: [
      {
        title: '1. Introduction',
        body: 'SGDUS provides a unified digital platform for businesses in Sudan. Your business gets a unique OID linked to the owner\'s identity.',
        bullets: ['Register officially', 'Obtain TIN', 'Apply for export/import licenses', 'Access customs & port services', 'Manage profile & employees'],
      },
      {
        title: '2. Getting Started',
        body: 'Owner(s) must have a citizen OID. Prepare business details and existing registration documents.',
        bullets: ['Web: portal.sgdus.gov.sd/business', 'Mobile App: "SGDUS Business"', 'USSD: *123# (limited business functions)'],
      },
      {
        title: '3. Registering Your Business',
        body: 'Register a new business or link an existing one to the digital system.',
        bullets: [
          'New: Log in → "Business Services" → "Register New Business" → fill details → upload docs → submit',
          'Link existing: "Link Existing Business" → enter registration number → upload docs → verification',
          'Receive business OID via SMS upon approval',
        ],
      },
      {
        title: '4. Managing Your Business Profile',
        body: 'Keep your business information up to date and manage team access.',
        bullets: ['Update details via "My Business" → "Profile"', 'Add employees by citizen OID and assign roles', 'View all certificates, licenses, and permits'],
      },
      {
        title: '5. Key Business Services',
        body: 'Access essential government services for your business operations.',
        bullets: [
          'TIN: "Tax Services" → "Request TIN" → auto-filled → issued in 1–2 days',
          'Export License: "Customs" → "New Export Application" → provide details → track status',
          'Port Services: Schedule vessel arrivals, check berth availability, get confirmation',
        ],
      },
      {
        title: '6. Notifications and Alerts',
        body: 'Stay informed about your business activities via SMS and email.',
        bullets: ['Registration approval', 'TIN issued', 'License approved', 'Port schedule confirmation', 'Pending actions'],
      },
      {
        title: '7. Security Tips',
        body: 'Protect your business digital identity.',
        bullets: ['Keep business OID confidential', 'Assign roles carefully; revoke on departure', 'Enable 2FA for business accounts'],
      },
      {
        title: '8. Troubleshooting',
        body: 'Common issues and solutions:',
        table: [
          ['Owner OID not recognised', 'Ensure owner completed citizen registration.'],
          ['Registration number exists', 'Try "Link Existing Business" or contact support.'],
          ['Document upload fails', 'Check file size (max 5 MB) and format (PDF, JPG).'],
          ['Status not updating', 'May be under review; check after 24 hours.'],
        ],
      },
      {
        title: '9. Support',
        body: 'Business support channels:',
        bullets: ['Phone: 1235 (business support)', 'Email: business.support@sgdus.gov.sd', 'Service Centres: Ministry of Trade or any SGDUS centre'],
      },
    ],
    ar: [
      {
        title: '١. مقدمة',
        body: 'يوفر SGDUS منصة رقمية موحدة للأعمال في السودان. يحصل عملك على OID فريد مرتبط بهوية المالك.',
        bullets: ['التسجيل رسمياً', 'الحصول على الرقم الضريبي', 'التقدم لتراخيص التصدير/الاستيراد', 'خدمات الجمارك والموانئ', 'إدارة الملف والموظفين'],
      },
      {
        title: '٢. البدء',
        body: 'يجب أن يكون للمالك OID مواطن. جهّز بيانات العمل ووثائق التسجيل.',
        bullets: ['الويب: portal.sgdus.gov.sd/business', 'التطبيق: "SGDUS Business"', 'USSD: *123# (وظائف محدودة)'],
      },
      {
        title: '٣. تسجيل عملك',
        body: 'سجّل عملاً جديداً أو اربط عملاً قائماً بالنظام الرقمي.',
        bullets: [
          'جديد: سجّل الدخول → "خدمات الأعمال" → "تسجيل عمل جديد" → املأ البيانات → ارفع المستندات',
          'ربط قائم: "ربط عمل قائم" → أدخل رقم التسجيل → ارفع المستندات → التحقق',
          'تلقّ OID العمل عبر SMS بعد الموافقة',
        ],
      },
      {
        title: '٤. إدارة ملف عملك',
        body: 'حدّث معلومات عملك وأدِر وصول الفريق.',
        bullets: ['تحديث عبر "أعمالي" → "الملف الشخصي"', 'إضافة موظفين بـ OID وتعيين أدوار', 'عرض الشهادات والتراخيص والتصاريح'],
      },
      {
        title: '٥. خدمات الأعمال الرئيسية',
        body: 'الوصول إلى الخدمات الحكومية الأساسية لعملياتك.',
        bullets: [
          'TIN: "الخدمات الضريبية" → "طلب TIN" → يصدر خلال 1-2 يوم',
          'ترخيص تصدير: "الجمارك" → "طلب تصدير جديد" → تتبع الحالة',
          'خدمات الموانئ: جدولة وصول السفن والتأكيد',
        ],
      },
      {
        title: '٦. الإشعارات والتنبيهات',
        body: 'ابقَ على اطلاع بأنشطة عملك عبر SMS والبريد الإلكتروني.',
        bullets: ['الموافقة على التسجيل', 'إصدار TIN', 'الموافقة على الترخيص', 'تأكيد جدولة الميناء', 'إجراءات معلقة'],
      },
      {
        title: '٧. نصائح أمنية',
        body: 'احمِ هوية عملك الرقمية.',
        bullets: ['احتفظ بـ OID العمل سرياً', 'عيّن الأدوار بعناية؛ ألغِ الوصول عند المغادرة', 'فعّل 2FA لحسابات الأعمال'],
      },
      {
        title: '٨. استكشاف الأخطاء',
        body: 'المشكلات الشائعة وحلولها:',
        table: [
          ['OID المالك غير معترف به', 'تأكد من إكمال تسجيل المواطن.'],
          ['رقم التسجيل موجود', 'جرّب "ربط عمل قائم" أو اتصل بالدعم.'],
          ['فشل تحميل المستند', 'تحقق من الحجم (5 ميجا) والصيغة (PDF, JPG).'],
          ['الحالة لا تتغير', 'قد يكون قيد المراجعة؛ تحقق بعد 24 ساعة.'],
        ],
      },
      {
        title: '٩. الدعم',
        body: 'قنوات دعم الأعمال:',
        bullets: ['الهاتف: 1235 (دعم الأعمال)', 'البريد: business.support@sgdus.gov.sd', 'مراكز الخدمة: وزارة التجارة أو أي مركز SGDUS'],
      },
    ],
  },

  // ── Government Staff sections ──────────────────────────────────────────
  staff: {
    en: [
      {
        title: '1. Introduction',
        body: 'SGDUS provides government employees a secure, unified dashboard to manage records, process applications, generate reports, and ensure compliance.',
        bullets: ['Approve citizen registrations', 'Verify business documents', 'Issue licenses & certificates', 'Monitor resources & generate reports', 'Manage user roles'],
      },
      {
        title: '2. Accessing the System',
        body: 'Requires a government staff OID (assigned by your agency admin), a modern browser, and MFA.',
        bullets: ['Go to staff.sgdus.gov.sd', 'Enter OID + password', 'Complete MFA (authenticator app or SMS)', 'View personalised dashboard'],
      },
      {
        title: '3. Dashboard Overview',
        body: 'Your dashboard is organised into role-based sections.',
        bullets: ['Citizen Management – view, verify, update records', 'Business Management – registrations, licenses, TINs', 'Resource Management – water, agriculture, mining, ports', 'Reporting – statistical & compliance reports', 'Audit Logs & User Management'],
      },
      {
        title: '4. Citizen Management',
        body: 'Search citizens by OID, National ID, name, or phone. View full details and transaction timeline.',
        bullets: [
          'Pending Approvals: review registration → check documents → Approve/Reject',
          'Approved citizens receive OID via SMS',
          'Only authorised staff can modify data; all changes are audit-logged',
        ],
      },
      {
        title: '5. Business Management',
        body: 'Process business registrations and issue licenses from the Pending Approvals queue.',
        bullets: [
          'Review details & documents (Memorandum of Association, owner IDs)',
          'Verify owner(s) have valid citizen OIDs',
          'Approve → system generates business OID → SMS to applicant',
          'Issue licenses with auto-generated number & validity period',
        ],
      },
      {
        title: '6. Resource Management Modules',
        body: 'Specialised modules for managing Sudan\'s critical resources.',
        bullets: [
          'Nile Water: real-time levels, allocate water, flood/drought alerts',
          'Agriculture: monitor farms, approve subsidies, track market prices',
          'Gold & Mining: review licenses, monitor exports, track production',
          'Ports & Customs: vessel scheduling, customs clearance, performance metrics',
          'Education: student records, school performance, scholarships',
          'Healthcare: patient records, facility management, disease surveillance',
        ],
      },
      {
        title: '7. Reporting and Analytics',
        body: 'Generate standard or custom reports and export as PDF, Excel, or CSV.',
        bullets: [
          'Standard: choose type → set parameters → generate',
          'Custom: use Report Builder with drag-and-drop fields & filters',
          'Module dashboards with KPIs (water allocated, active licenses, port throughput)',
        ],
      },
      {
        title: '8. User Management',
        body: 'Administrators can add staff, assign roles, and deactivate accounts.',
        bullets: [
          'Add: "Administration" → "Users" → enter details → assign roles → OID generated',
          'Modify: edit profile → update roles (all changes logged)',
          'Deactivate: immediately prevent login for departed staff',
        ],
      },
      {
        title: '9. Audit and Compliance',
        body: 'Full audit trail and automated compliance checks.',
        bullets: [
          'Audit Logs: who accessed what, when, from which IP',
          'Filter by user, date, or action',
          'Auto compliance checks against Sudanese laws',
          'Violations flagged and reported to compliance officer',
        ],
      },
      {
        title: '10. Security Best Practices',
        body: 'Essential security guidelines for government staff.',
        bullets: ['Never share password or OID', 'Always log out when leaving workstation', 'Report suspicious activity immediately', 'Use VPN on public Wi-Fi; only use official staff portal'],
      },
      {
        title: '11. Troubleshooting',
        body: 'Common issues and solutions:',
        table: [
          ['Cannot log in', 'Check OID & password. If MFA fails, contact IT helpdesk.'],
          ['Task not appearing', 'Verify permissions; refresh the page.'],
          ['Report generation slow', 'Narrow date range or export to CSV.'],
          ['Document upload fails', 'Ensure file < 10 MB and PDF/JPG/PNG format.'],
        ],
      },
      {
        title: '12. Support',
        body: 'Internal support channels:',
        bullets: ['Helpdesk: Ext. 4567 or helpdesk@sgdus.gov.sd', 'Technical: SGDUS technical team', 'Training: periodic sessions via intranet'],
      },
    ],
    ar: [
      {
        title: '١. مقدمة',
        body: 'يوفر SGDUS للموظفين الحكوميين لوحة تحكم آمنة وموحدة لإدارة السجلات ومعالجة الطلبات وإنشاء التقارير وضمان الامتثال.',
        bullets: ['الموافقة على تسجيلات المواطنين', 'التحقق من وثائق الشركات', 'إصدار التراخيص والشهادات', 'مراقبة الموارد وإنشاء التقارير', 'إدارة أدوار المستخدمين'],
      },
      {
        title: '٢. الوصول إلى النظام',
        body: 'يتطلب OID موظف حكومي (من مسؤول الجهاز)، ومتصفح حديث، و MFA.',
        bullets: ['انتقل إلى staff.sgdus.gov.sd', 'أدخل OID + كلمة المرور', 'أكمل MFA (تطبيق المصادقة أو SMS)', 'عرض لوحة التحكم المخصصة'],
      },
      {
        title: '٣. نظرة عامة على لوحة التحكم',
        body: 'لوحة التحكم منظمة حسب الأدوار.',
        bullets: ['إدارة المواطنين – عرض والتحقق وتحديث', 'إدارة الأعمال – تسجيلات وتراخيص وأرقام ضريبية', 'إدارة الموارد – مياه وزراعة وتعدين وموانئ', 'التقارير – إحصائية وامتثال', 'سجلات المراجعة وإدارة المستخدمين'],
      },
      {
        title: '٤. إدارة المواطنين',
        body: 'ابحث عن المواطنين بـ OID أو الرقم القومي أو الاسم أو الهاتف.',
        bullets: ['الموافقات المعلقة: مراجعة → تحقق من المستندات → موافقة/رفض', 'المواطن المعتمد يتلقى OID عبر SMS', 'التعديلات مسجلة في مسار المراجعة'],
      },
      {
        title: '٥. إدارة الأعمال',
        body: 'معالجة تسجيلات الشركات وإصدار التراخيص من قائمة الموافقات المعلقة.',
        bullets: ['مراجعة التفاصيل والمستندات', 'التحقق من OID المالكين', 'الموافقة → إنشاء OID العمل → SMS للمتقدم', 'إصدار تراخيص برقم فريد وفترة صلاحية'],
      },
      {
        title: '٦. وحدات إدارة الموارد',
        body: 'وحدات متخصصة لإدارة موارد السودان الحيوية.',
        bullets: ['مياه النيل: مستويات فورية، تخصيص مياه، تنبيهات فيضان/جفاف', 'الزراعة: مراقبة المزارع، الموافقة على الإعانات، أسعار السوق', 'الذهب والتعدين: مراجعة التراخيص، مراقبة الصادرات، تتبع الإنتاج', 'الموانئ والجمارك: جدولة السفن، التخليص، مؤشرات الأداء', 'التعليم: سجلات الطلاب، أداء المدارس، المنح', 'الرعاية الصحية: سجلات المرضى، إدارة المرافق، ترصد الأمراض'],
      },
      {
        title: '٧. التقارير والتحليلات',
        body: 'إنشاء تقارير قياسية أو مخصصة وتصديرها بصيغة PDF أو Excel أو CSV.',
        bullets: ['قياسية: اختر النوع → حدد المعايير → أنشئ', 'مخصصة: منشئ التقارير بالسحب والإفلات', 'لوحات معلومات بمؤشرات أداء رئيسية'],
      },
      {
        title: '٨. إدارة المستخدمين',
        body: 'يمكن للمسؤولين إضافة موظفين وتعيين أدوار وإلغاء تنشيط الحسابات.',
        bullets: ['إضافة: "الإدارة" → "المستخدمين" → إدخال البيانات → تعيين الأدوار', 'تعديل: تحرير الملف → تحديث الأدوار (مسجل)', 'إلغاء التنشيط: منع الدخول فوراً'],
      },
      {
        title: '٩. المراجعة والامتثال',
        body: 'مسار مراجعة كامل وفحوصات امتثال تلقائية.',
        bullets: ['سجلات المراجعة: من وصل لماذا ومتى ومن أي IP', 'تصفية حسب المستخدم أو التاريخ أو الإجراء', 'فحوصات امتثال تلقائية ضد القوانين السودانية', 'الإبلاغ عن الانتهاكات لمسؤول الامتثال'],
      },
      {
        title: '١٠. أفضل الممارسات الأمنية',
        body: 'إرشادات أمنية أساسية للموظفين الحكوميين.',
        bullets: ['لا تشارك كلمة المرور أو OID', 'سجّل الخروج دائماً عند المغادرة', 'أبلغ عن النشاط المشبوه فوراً', 'استخدم VPN على Wi-Fi العام؛ استخدم فقط البوابة الرسمية'],
      },
      {
        title: '١١. استكشاف الأخطاء',
        body: 'المشكلات الشائعة وحلولها:',
        table: [
          ['لا أستطيع الدخول', 'تحقق من OID وكلمة المرور. إذا فشلت MFA، اتصل بالمكتب.'],
          ['المهمة لا تظهر', 'تأكد من الصلاحيات؛ حدّث الصفحة.'],
          ['التقرير بطيء', 'ضيّق نطاق التاريخ أو صدّر بصيغة CSV.'],
          ['فشل رفع المستند', 'تأكد من الحجم (< 10 ميجا) والصيغة (PDF/JPG/PNG).'],
        ],
      },
      {
        title: '١٢. الدعم',
        body: 'قنوات الدعم الداخلية:',
        bullets: ['مكتب المساعدة: تحويلة 4567 أو helpdesk@sgdus.gov.sd', 'الدعم الفني: فريق SGDUS التقني', 'التدريب: دورات دورية عبر الشبكة الداخلية'],
      },
    ],
  },
};

// ─── Tab-to-content key mapping ──────────────────────────────────────────────
const TAB_KEYS = ['citizen', 'business', 'staff'];
const TAB_COLORS = [COLORS.citizen, COLORS.business, COLORS.staff];
const TAB_ICONS = [<MenuBook fontSize="small" />, <Business fontSize="small" />, <AdminPanelSettings fontSize="small" />];

// ─── Reusable section renderer ───────────────────────────────────────────────
function SectionContent({ section, lang }) {
  const isAr = lang === 'ar';
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Typography variant="body1" sx={{ color: '#334155', lineHeight: 1.7 }}>
        {section.body}
      </Typography>

      {section.bullets && (
        <Box component="ul" sx={{ m: 0, pl: isAr ? 0 : 2.5, pr: isAr ? 2.5 : 0, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {section.bullets.map((b, i) => (
            <Typography component="li" key={i} variant="body2" sx={{ color: '#475569', lineHeight: 1.7 }}>
              {b}
            </Typography>
          ))}
        </Box>
      )}

      {section.table && (
        <Table size="small" sx={{ mt: 1, '& th': { fontWeight: 700, bgcolor: '#f1f5f9' } }}>
          <TableHead>
            <TableRow>
              <TableCell>{isAr ? 'المشكلة' : 'Issue'}</TableCell>
              <TableCell>{isAr ? 'الحل' : 'Solution'}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {section.table.map(([issue, solution], i) => (
              <TableRow key={i}>
                <TableCell sx={{ color: COLORS.accent, fontWeight: 600 }}>{issue}</TableCell>
                <TableCell>{solution}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Box>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────
const DocumentationHub = ({ lang: initialLang = 'en' }) => {
  const navigate = useNavigate();
  const [lang, setLang] = useState(initialLang);
  const [tabIndex, setTabIndex] = useState(0);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(false);

  const isArabic = lang === 'ar';
  const ui = CONTENT.ui[lang];
  const qs = CONTENT.quickStart[lang];
  const sections = CONTENT[TAB_KEYS[tabIndex]][lang];
  const tabColor = TAB_COLORS[tabIndex];

  // Pre-compute searchable text per section to avoid redundant joins
  const searchIndex = useMemo(() => sections.map((s) =>
    [s.title, s.body, ...(s.bullets || []), ...(s.table || []).flat()].join(' ').toLowerCase()
  ), [sections]);

  const filtered = useMemo(() => {
    if (!search.trim()) return sections;
    const q = search.toLowerCase();
    return sections.filter((_, i) => searchIndex[i].includes(q));
  }, [sections, search, searchIndex]);

  const toggleLang = () => { setLang((l) => (l === 'en' ? 'ar' : 'en')); setSearch(''); };
  const handleAccordion = (panel) => (_, isOpen) => setExpanded(isOpen ? panel : false);

  return (
    <div dir={isArabic ? 'rtl' : 'ltr'} style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: isArabic ? '"Noto Sans Arabic", sans-serif' : '"Inter", sans-serif' }}>
      {/* ── Sticky header ──────────────────────────────────────────────── */}
      <Box sx={{
        position: 'sticky', top: 0, zIndex: 1100,
        background: COLORS.heroBg, color: '#fff',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      }}>
        <Box sx={{ maxWidth: 1280, mx: 'auto', px: { xs: 2, md: 4 }, py: 1.5, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          {/* Back button */}
          <Tooltip title={ui.backHome}>
            <IconButton aria-label={ui.backHome} onClick={() => navigate('/')} sx={{ color: '#fff' }}>
              {isArabic ? <Home /> : <ArrowBack />}
            </IconButton>
          </Tooltip>

          {/* Brand */}
          <Typography variant="h6" sx={{ fontWeight: 700, flexShrink: 0, letterSpacing: 0.5 }}>
            {ui.brand}
          </Typography>

          {/* Spacer */}
          <Box sx={{ flex: 1 }} />

          {/* Search */}
          <TextField
            size="small"
            placeholder={ui.search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label={ui.search}
            sx={{
              width: { xs: '100%', sm: 280 }, order: { xs: 3, sm: 0 },
              '& .MuiOutlinedInput-root': {
                bgcolor: 'rgba(255,255,255,0.15)', color: '#fff', borderRadius: 2,
                '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                '&.Mui-focused fieldset': { borderColor: '#fff' },
              },
              '& input::placeholder': { color: 'rgba(255,255,255,0.7)' },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start"><Search sx={{ color: 'rgba(255,255,255,0.7)' }} /></InputAdornment>
              ),
            }}
          />

          {/* Language toggle */}
          <Tooltip title={isArabic ? 'English' : 'العربية'}>
            <Button
              aria-label="Toggle language"
              startIcon={<Language />}
              onClick={toggleLang}
              sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.4)', textTransform: 'none', fontWeight: 600 }}
              variant="outlined"
              size="small"
            >
              {isArabic ? 'EN' : 'AR'}
            </Button>
          </Tooltip>
        </Box>
      </Box>

      {/* ── Tabs ───────────────────────────────────────────────────────── */}
      <Box sx={{ bgcolor: '#fff', borderBottom: '1px solid #e2e8f0' }}>
        <Box sx={{ maxWidth: 1280, mx: 'auto', px: { xs: 1, md: 4 } }}>
          <Tabs
            value={tabIndex}
            onChange={(_, v) => { setTabIndex(v); setExpanded(false); setSearch(''); }}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="Documentation audience tabs"
            TabIndicatorProps={{ style: { background: tabColor, height: 3 } }}
          >
            {ui.tabs.map((label, i) => (
              <Tab
                key={i}
                icon={TAB_ICONS[i]}
                iconPosition="start"
                label={label}
                sx={{
                  textTransform: 'none', fontWeight: tabIndex === i ? 700 : 500, fontSize: '0.95rem',
                  color: tabIndex === i ? TAB_COLORS[i] : '#64748b',
                  minHeight: 56,
                }}
              />
            ))}
          </Tabs>
        </Box>
      </Box>

      {/* ── Content area ───────────────────────────────────────────────── */}
      <Box sx={{ maxWidth: 1280, mx: 'auto', px: { xs: 2, md: 4 }, py: 4, display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' } }}>
        {/* Main accordion column */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {filtered.length === 0 && (
            <Paper sx={{ p: 4, textAlign: 'center', color: '#94a3b8' }}>
              <Help sx={{ fontSize: 48, mb: 1 }} />
              <Typography>{ui.noResults}</Typography>
            </Paper>
          )}

          {filtered.map((section, idx) => (
            <Accordion
              key={idx}
              expanded={expanded === idx}
              onChange={handleAccordion(idx)}
              disableGutters
              sx={{
                mb: 1.5, borderRadius: '8px !important', overflow: 'hidden',
                borderLeft: isArabic ? 'none' : `4px solid ${tabColor}`,
                borderRight: isArabic ? `4px solid ${tabColor}` : 'none',
                boxShadow: expanded === idx ? '0 4px 16px rgba(0,0,0,0.08)' : '0 1px 4px rgba(0,0,0,0.04)',
                transition: 'box-shadow 0.3s ease',
                '&:before': { display: 'none' },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMore />}
                aria-label={section.title}
                sx={{
                  '& .MuiAccordionSummary-content': { my: 1.5 },
                  '&:hover': { bgcolor: '#f8fafc' },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
                  {(() => {
                    const dotIdx = section.title.indexOf('.');
                    const num = dotIdx >= 0 ? section.title.slice(0, dotIdx).trim() : section.title;
                    const rest = dotIdx >= 0 ? section.title.slice(dotIdx + 1).trim() : '';
                    return (<>
                      <Chip label={num} size="small" sx={{ bgcolor: tabColor, color: '#fff', fontWeight: 700, minWidth: 28 }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1e293b' }}>{rest || num}</Typography>
                    </>);
                  })()}
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0, pb: 2.5, px: 3 }}>
                <SectionContent section={section} lang={lang} />
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>

        {/* Quick-start sidebar */}
        <Box sx={{ width: { xs: '100%', md: 320 }, flexShrink: 0 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.primary, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <ContactSupport fontSize="small" /> {ui.quickStart}
          </Typography>

          {qs.map((card, i) => (
            <Paper
              key={i}
              elevation={0}
              sx={{
                p: 2.5, mb: 2, borderRadius: 2, border: '1px solid #e2e8f0',
                display: 'flex', flexDirection: 'column', gap: 1,
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ bgcolor: `${tabColor}15`, color: tabColor, borderRadius: '50%', p: 1, display: 'flex' }}>
                  {card.icon}
                </Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b' }}>{card.title}</Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#64748b', lineHeight: 1.6 }}>{card.desc}</Typography>
              <Button
                size="small"
                variant="text"
                aria-label={`${i < 2 ? ui.getStarted : ui.learnMore} – ${card.title}`}
                sx={{ alignSelf: isArabic ? 'flex-end' : 'flex-start', color: tabColor, textTransform: 'none', fontWeight: 600, mt: 0.5 }}
              >
                {i < 2 ? ui.getStarted : ui.learnMore} →
              </Button>
            </Paper>
          ))}

          {/* Contact card */}
          <Paper sx={{ p: 2.5, borderRadius: 2, bgcolor: '#f1f5f9', border: '1px solid #e2e8f0' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: COLORS.primary }}>
              {isArabic ? 'هل تحتاج مساعدة؟' : 'Need Help?'}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Phone sx={{ fontSize: 18, color: COLORS.success }} />
              <Typography variant="body2">1234 / +249 123 456 789</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Email sx={{ fontSize: 18, color: COLORS.citizen }} />
              <Typography variant="body2">support@sgdus.gov.sd</Typography>
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <Box sx={{ bgcolor: COLORS.footerBg, color: 'rgba(255,255,255,0.7)', py: 3, mt: 4 }}>
        <Typography variant="body2" align="center">{ui.footer}</Typography>
      </Box>
    </div>
  );
};

export default DocumentationHub;
