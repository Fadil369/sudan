import React, { useState, useEffect, useCallback } from 'react';
import {
  Globe,
  Database,
  ShieldCheck,
  Activity,
  Play,
  Volume2,
  Layout,
  Menu,
  X,
  ChevronRight,
  ChevronLeft,
  Info,
  Server,
  Cpu,
  Stethoscope,
  BrainCircuit,
  Building2,
  Landmark,
  Wheat,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MOBILE_BREAKPOINT = 960;
const NAV_ANCHORS = ['Identity', 'Economic', 'Governance', 'Multimedia', 'Registry'];

/* ─────────────────────────── Slide data ─────────────────────────── */
const slides = [
  {
    id: 1,
    icon: ShieldCheck,
    tag: 'Digital Identity',
    tagAr: 'الهوية الرقمية',
    title: 'National Identity & Civil Registry',
    titleAr: 'الهوية الوطنية وسجل الأحوال المدنية',
    description:
      'Biometric-verified digital IDs for every Sudanese citizen, linked to a unified OID namespace ensuring uniqueness across all government systems.',
    descriptionAr:
      'هويات رقمية معتمدة بالقياسات الحيوية لكل مواطن سوداني، مرتبطة بنطاق OID موحد.',
    oid: '1.3.6.1.4.1.61026.2',
    color: '#1B3A5C',
    stat: '42M+',
    statLabel: 'Citizens',
    statLabelAr: 'مواطن',
  },
  {
    id: 2,
    icon: Activity,
    tag: 'Healthcare',
    tagAr: 'الرعاية الصحية',
    title: 'Central Health Profiles',
    titleAr: 'الملفات الصحية المركزية',
    description:
      'Electronic health records integrated across all hospitals and clinics, enabling real-time data sharing for better patient outcomes and epidemic surveillance.',
    descriptionAr:
      'سجلات صحية إلكترونية متكاملة عبر المستشفيات والعيادات لمراقبة الأوبئة.',
    oid: '1.3.6.1.4.1.61026.5',
    color: '#007A3D',
    stat: '8,500+',
    statLabel: 'Facilities',
    statLabelAr: 'منشأة',
  },
  {
    id: 3,
    icon: Landmark,
    tag: 'Finance & Economy',
    tagAr: 'المالية والاقتصاد',
    title: 'National Economic Registry',
    titleAr: 'السجل الاقتصادي الوطني',
    description:
      'Transparent tracking of mineral licenses, gold assets, agricultural allocations, and Nile water rights on a unified, auditable ledger.',
    descriptionAr:
      'تتبع شفاف لتراخيص التعدين والأصول الاقتصادية ومخصصات مياه النيل.',
    oid: '1.3.6.1.4.1.61026.4',
    color: '#7A4B0A',
    stat: '$12B+',
    statLabel: 'Assets Tracked',
    statLabelAr: 'أصول مُتتبَّعة',
  },
  {
    id: 4,
    icon: Building2,
    tag: 'Governance',
    tagAr: 'الحوكمة',
    title: 'Digital Government Services',
    titleAr: 'الخدمات الحكومية الرقمية',
    description:
      'End-to-end digitisation of all government ministries — licensing, taxation, social welfare, and justice — accessible via a single citizen portal.',
    descriptionAr:
      'رقمنة شاملة لجميع الوزارات الحكومية عبر بوابة مواطن واحدة.',
    oid: '1.3.6.1.4.1.61026.1',
    color: '#1B3A5C',
    stat: '11',
    statLabel: 'Ministries',
    statLabelAr: 'وزارة',
  },
  {
    id: 5,
    icon: Wheat,
    tag: 'Agriculture',
    tagAr: 'الزراعة',
    title: 'Gezira Farm Allocations',
    titleAr: 'مخصصات مزارع الجزيرة',
    description:
      'Smart monitoring of the Gezira Irrigation Scheme — Sudan\u2019s breadbasket — with IoT sensors and satellite data feeding into the central registry.',
    descriptionAr:
      'مراقبة ذكية لمشروع الجزيرة الزراعي بأجهزة استشعار وبيانات أقمار اصطناعية.',
    oid: '1.3.6.1.4.1.61026.6',
    color: '#1D6330',
    stat: '2.2M',
    statLabel: 'Feddan',
    statLabelAr: 'فدان',
  },
  {
    id: 6,
    icon: BrainCircuit,
    tag: 'AI & Analytics',
    tagAr: 'الذكاء الاصطناعي',
    title: 'BRAINSAIT Intelligence Layer',
    titleAr: 'طبقة الذكاء برينسيت',
    description:
      'Machine-learning powered analytics on national data streams — predicting service demand, detecting fraud, and optimising resource allocation in real time.',
    descriptionAr:
      'تحليلات مدعومة بالذكاء الاصطناعي لتوقع الطلب والكشف عن الاحتيال.',
    oid: '1.3.6.1.4.1.61026.8',
    color: '#1B3A5C',
    stat: '99.9%',
    statLabel: 'Uptime',
    statLabelAr: 'وقت التشغيل',
  },
];

/* ──────────────────────── Slide Carousel ─────────────────────────── */
const SlidePresentation = ({ lang }) => {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const t = lang === 'ar';

  const next = useCallback(() => setCurrent((c) => (c + 1) % slides.length), []);
  const prev = useCallback(
    () => setCurrent((c) => (c - 1 + slides.length) % slides.length),
    []
  );

  useEffect(() => {
    if (paused) return;
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [next, paused]);

  const slide = slides[current];
  const Icon = slide.icon;

  return (
    <section
      id="Governance"
      style={{
        padding: '80px 0',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2
            style={{
              fontSize: '2.25rem',
              fontWeight: 800,
              color: '#f8fafc',
              marginBottom: 12,
            }}
          >
            {t ? 'عرض النظام' : 'System Capabilities'}
          </h2>
          <div
            style={{
              width: 80,
              height: 4,
              background: `linear-gradient(90deg, ${slides[current].color}, transparent)`,
              margin: '0 auto',
              borderRadius: 2,
              transition: 'background 0.5s',
            }}
          />
        </div>

        {/* Slide area */}
        <div
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: `1px solid ${slide.color}40`,
            borderRadius: 24,
            padding: '48px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 48,
            alignItems: 'center',
            transition: 'border-color 0.5s',
          }}
        >
          {/* Left: icon + text */}
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 16px',
                borderRadius: 999,
                background: `${slide.color}20`,
                border: `1px solid ${slide.color}50`,
                color: slide.color,
                fontSize: 13,
                fontWeight: 700,
                marginBottom: 24,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              <Icon size={14} />
              {t ? slide.tagAr : slide.tag}
            </div>

            <h3
              style={{
                fontSize: '1.75rem',
                fontWeight: 800,
                color: '#f8fafc',
                marginBottom: 16,
                lineHeight: 1.3,
              }}
            >
              {t ? slide.titleAr : slide.title}
            </h3>
            <p
              style={{
                color: '#94a3b8',
                lineHeight: 1.7,
                fontSize: '1rem',
                marginBottom: 24,
              }}
            >
              {t ? slide.descriptionAr : slide.description}
            </p>

            {/* OID badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 16px',
                borderRadius: 8,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#64748b',
                fontSize: 12,
                fontFamily: 'monospace',
              }}
            >
              <Database size={12} />
              {slide.oid}
            </div>
          </div>

          {/* Right: stat card */}
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: 180,
                height: 180,
                borderRadius: '50%',
                background: `radial-gradient(circle at center, ${slide.color}30 0%, transparent 70%)`,
                border: `2px solid ${slide.color}50`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 32px',
                transition: 'all 0.5s',
              }}
            >
              <Icon size={40} color={slide.color} />
              <div
                style={{
                  fontSize: '2rem',
                  fontWeight: 900,
                  color: slide.color,
                  marginTop: 12,
                }}
              >
                {slide.stat}
              </div>
              <div style={{ color: '#64748b', fontSize: 12 }}>
                {t ? slide.statLabelAr : slide.statLabel}
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            marginTop: 32,
          }}
        >
          <button
            onClick={prev}
            aria-label="Previous slide"
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
            }}
          >
            <ChevronLeft size={20} />
          </button>

          {/* Dot indicators */}
          <div style={{ display: 'flex', gap: 8 }}>
            {slides.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setCurrent(i)}
                aria-label={`Go to slide ${i + 1}`}
                style={{
                  width: i === current ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  background: i === current ? slides[current].color : 'rgba(255,255,255,0.2)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  padding: 0,
                }}
              />
            ))}
          </div>

          <button
            onClick={next}
            aria-label="Next slide"
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
            }}
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Slide thumbnails */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 1fr)',
            gap: 12,
            marginTop: 32,
          }}
        >
          {slides.map((s, i) => {
            const ThumbIcon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => setCurrent(i)}
                style={{
                  padding: '12px 8px',
                  borderRadius: 12,
                  background:
                    i === current ? `${s.color}15` : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${i === current ? s.color + '60' : 'rgba(255,255,255,0.05)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textAlign: 'center',
                  color: i === current ? s.color : '#475569',
                }}
              >
                <ThumbIcon size={20} style={{ margin: '0 auto 4px' }} />
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {t ? s.tagAr : s.tag}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

/* ────────────────────────── Main Landing Page ─────────────────────── */
const LandingPage = () => {
  const [lang, setLang] = useState('ar');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < MOBILE_BREAKPOINT);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobile(mobile);
      if (!mobile) setIsMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const content = {
    en: {
      dir: 'ltr',
      brand: 'BRAINSAIT',
      nav: ['Identity', 'Economic', 'Governance', 'Multimedia', 'Registry'],
      heroTitle: 'Unified Digital Sovereign System',
      heroSub:
        'Empowering Sudan through automated, integrated, and technology-driven solutions.',
      poweredBy: 'Powered by BRAINSAIT LTD',
      founderVision:
        'Pioneering the intersection of healthcare, business, and technology through collective brainpower.',
      oidRoot: 'Root OID: 1.3.6.1.4.1.61026',
      sections: {
        multimedia: 'Multimedia Showcase',
        data: 'National Resource Registry',
        slides: 'System Capabilities',
      },
      table: {
        id: 'OID Suffix',
        name: 'Resource Name',
        type: 'Classification',
        status: 'Operational Status',
      },
      dataRows: [
        { id: '.1.1', name: 'Khartoum Metropolitan', type: 'Place (Sudan)', status: 'Active' },
        { id: '.2.45', name: 'National Identity Registry', type: 'Citizen Data', status: 'Secured' },
        { id: '.3.12', name: 'Nile Monitoring Station', type: 'Infrastructure', status: 'Online' },
        { id: '.4.02', name: 'Gold Mining License #88', type: 'Economic', status: 'Verified' },
        { id: '.5.10', name: 'Central Health Profiles', type: 'Healthcare', status: 'Active' },
        { id: '.6.05', name: 'Gezira Farm Allocations', type: 'Agriculture', status: 'Syncing' },
      ],
      textBlock:
        "BRAINSAIT LTD delivers high-scale government digital systems that consolidate national identity, economic assets, healthcare records, and infrastructure into a unified platform. Utilizing our unique OID root, we ensure every asset—from a citizen's health profile to a Nile water allocation—is uniquely identifiable and secure.",
      audioLabel: 'National Anthem / Official Briefing',
      videoLabel: 'System Architecture Overview',
      enterPortal: 'Enter Government Portal',
      corePurpose: 'Core Purpose',
    },
    ar: {
      dir: 'rtl',
      brand: 'برينسايت',
      nav: ['الهوية', 'الاقتصاد', 'الحوكمة', 'الوسائط', 'السجل'],
      heroTitle: 'النظام الرقمي السيادي الموحد',
      heroSub:
        'تمكين السودان من خلال حلول مؤتمتة، متكاملة، ومدفوعة بالتقنية الحديثة.',
      poweredBy: 'بدعم من شركة برينسيت المحدودة',
      founderVision:
        'ريادة التقاطع بين الرعاية الصحية والأعمال والتقنية من خلال قوة العقل الجماعي.',
      oidRoot: 'معرف الجذر: 1.3.6.1.4.1.61026',
      sections: {
        multimedia: 'عرض الوسائط المتعددة',
        data: 'سجل الموارد الوطني',
        slides: 'إمكانيات النظام',
      },
      table: {
        id: 'لاحقة OID',
        name: 'اسم المورد',
        type: 'التصنيف',
        status: 'الحالة التشغيلية',
      },
      dataRows: [
        { id: '.1.1', name: 'ولاية الخرطوم', type: 'مكان (السودان)', status: 'نشط' },
        { id: '.2.45', name: 'سجل الهوية الوطنية', type: 'بيانات المواطنين', status: 'مؤمن' },
        { id: '.3.12', name: 'محطة رصد النيل', type: 'بنية تحتية', status: 'متصل' },
        { id: '.4.02', name: 'رخصة تعدين ذهب #88', type: 'اقتصادي', status: 'موثق' },
        { id: '.5.10', name: 'الملفات الصحية المركزية', type: 'رعاية صحية', status: 'نشط' },
        { id: '.6.05', name: 'مخصصات مزارع الجزيرة', type: 'زراعة', status: 'مزامنة' },
      ],
      textBlock:
        'تقدم شركة برينسيت المحدودة أنظمة رقمية حكومية واسعة النطاق توحد الهوية الوطنية، الأصول الاقتصادية، السجلات الصحية، والبنية التحتية في منصة واحدة. باستخدام جذر OID الفريد الخاص بنا، نضمن أن يكون كل أصل - من الملف الصحي للمواطن إلى مخصصات مياه النيل - قابلاً للتعريف والتأمين بشكل فريد.',
      audioLabel: 'النشيد الوطني / الإيجاز الرسمي',
      videoLabel: 'نظرة عامة على بنية النظام',
      enterPortal: 'دخول البوابة الحكومية',
      corePurpose: 'الغرض الأساسي',
    },
  };

  const t = content[lang];

  /* ── shared styles ── */
  const navStyle = {
    position: 'sticky',
    top: 0,
    zIndex: 50,
    background: 'rgba(255,255,255,0.9)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid #e2e8f0',
  };

  const btnPrimary = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '14px 28px',
    background: '#1B3A5C',
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    fontWeight: 700,
    fontSize: 15,
    cursor: 'pointer',
    transition: 'all 0.2s',
  };

  const btnOutline = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '14px 28px',
    background: 'rgba(255,255,255,0.1)',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: 12,
    fontWeight: 700,
    fontSize: 15,
    cursor: 'pointer',
    transition: 'all 0.2s',
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f8fafc',
        color: '#0f172a',
        fontFamily:
          "'Outfit', 'Noto Sans Arabic', system-ui, -apple-system, sans-serif",
        direction: t.dir,
      }}
    >
      {/* ── Navigation ── */}
      <nav style={navStyle}>
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '0 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: 72,
          }}
        >
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 42,
                height: 42,
                background: '#2563eb',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <BrainCircuit size={24} color="#fff" />
            </div>
            <span style={{ fontSize: 22, fontWeight: 900, color: '#1e293b', letterSpacing: '-0.03em' }}>
              {t.brand}
            </span>
          </div>

          {/* Desktop Nav */}
          <div
            style={{
              display: isMobile ? 'none' : 'flex',
              alignItems: 'center',
              gap: 32,
            }}
          >
            {t.nav.map((item, index) => {
              const anchorTarget = NAV_ANCHORS[index] ?? encodeURIComponent(item);
              return (
                <a
                  key={item}
                  href={`#${anchorTarget}`}
                  style={{
                    color: '#475569',
                    fontWeight: 500,
                    textDecoration: 'none',
                    fontSize: 15,
                    transition: 'color 0.2s',
                  }}
                >
                  {item}
                </a>
              );
            })}
            <button
              onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                borderRadius: 999,
                background: '#f1f5f9',
                border: 'none',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
                color: '#334155',
              }}
            >
              <Globe size={15} />
              {lang === 'en' ? 'العربية' : 'English'}
            </button>
            <button
              onClick={() => navigate('/portal')}
              style={{
                ...btnPrimary,
                padding: '10px 20px',
                fontSize: 14,
              }}
            >
              {t.enterPortal}
              <ExternalLink size={15} />
            </button>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={{
              display: isMobile ? 'block' : 'none',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#475569',
            }}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile menu */}
        {isMobile && isMenuOpen && (
          <div style={{ background: '#fff', borderTop: '1px solid #e2e8f0', padding: 16 }}>
            {t.nav.map((item, index) => {
              const anchorTarget = NAV_ANCHORS[index] ?? encodeURIComponent(item);
              return (
                <a
                  key={item}
                  href={`#${anchorTarget}`}
                  onClick={() => setIsMenuOpen(false)}
                  style={{
                    display: 'block',
                    padding: '12px 0',
                    borderBottom: '1px solid #f1f5f9',
                    color: '#334155',
                    textDecoration: 'none',
                    fontWeight: 500,
                    textAlign: 'start',
                  }}
                >
                  {item}
                </a>
              );
            })}
            <button
              onClick={() => navigate('/portal')}
              style={{ ...btnPrimary, width: '100%', justifyContent: 'center', marginTop: 12 }}
            >
              {t.enterPortal}
            </button>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <header
        id="Identity"
        style={{
          position: 'relative',
          overflow: 'hidden',
          padding: '80px 24px 96px',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f2341 100%)',
          color: '#fff',
        }}
      >
        {/* Decorative background grid */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.05,
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            pointerEvents: 'none',
          }}
        />
        <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: 720 }}>
            {/* OID badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 16px',
                borderRadius: 999,
                background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.25)',
                color: 'rgba(255,255,255,0.85)',
                fontSize: 13,
                fontWeight: 700,
                marginBottom: 24,
                fontFamily: 'monospace',
              }}
            >
              <ShieldCheck size={15} />
              {t.oidRoot}
            </div>

            <h1
              style={{
                fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                fontWeight: 900,
                lineHeight: 1.1,
                marginBottom: 24,
                letterSpacing: '-0.03em',
              }}
            >
              {t.heroTitle}
            </h1>
            <p style={{ fontSize: '1.2rem', color: '#94a3b8', marginBottom: 40, lineHeight: 1.6 }}>
              {t.heroSub}
            </p>

            {/* Hero stats row */}
            <div
              style={{
                display: 'flex',
                gap: 32,
                marginBottom: 48,
                flexWrap: 'wrap',
              }}
            >
              {[
                { value: '42M+', label: lang === 'ar' ? 'مواطن' : 'Citizens' },
                { value: '11', label: lang === 'ar' ? 'وزارة' : 'Ministries' },
                { value: '99.9%', label: lang === 'ar' ? 'وقت التشغيل' : 'Uptime' },
              ].map((stat) => (
                <div key={stat.label}>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: '#1B3A5C' }}>
                    {stat.value}
                  </div>
                  <div style={{ color: '#64748b', fontSize: 13, fontWeight: 500 }}>{stat.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <button style={btnPrimary} onClick={() => navigate('/portal')}>
                {t.enterPortal}
                <ArrowRight size={18} />
              </button>
              <button style={btnOutline}>
                {t.nav[4]}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Content / About ── */}
      <section id="Economic" style={{ padding: '96px 24px' }}>
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 64,
            alignItems: 'center',
          }}
        >
          <div>
            {/* Tag */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 14px',
                borderRadius: 999,
                background: '#EEF2F7',
                color: '#1B3A5C',
                fontSize: 12,
                fontWeight: 700,
                marginBottom: 16,
                border: '1px solid #D1D9E0',
              }}
            >
              <Cpu size={13} />
              {t.poweredBy}
            </div>

            <h2
              style={{
                fontSize: '2rem',
                fontWeight: 800,
                color: '#1e293b',
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <Info size={24} color="#1B3A5C" />
              {t.corePurpose}
            </h2>
            <p style={{ color: '#475569', lineHeight: 1.8, marginBottom: 20, fontSize: '1rem' }}>
              {t.textBlock}
            </p>
            <p
              style={{
                fontWeight: 600,
                color: '#1e293b',
                borderLeft: '4px solid #C8102E',
                paddingLeft: 16,
                margin: '0 0 32px',
                lineHeight: 1.6,
                ...(t.dir === 'rtl' ? { borderLeft: 'none', borderRight: '4px solid #C8102E', paddingLeft: 0, paddingRight: 16 } : {}),
              }}
            >
              {t.founderVision}
            </p>

            {/* OID cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                { oid: '1.3.6.1.4.1.61026.1', label: lang === 'ar' ? 'الأماكن والأصول' : 'Places & Assets', Icon: Database },
                { oid: '1.3.6.1.4.1.61026.5', label: lang === 'ar' ? 'الملفات الصحية' : 'Healthcare Profiles', Icon: Stethoscope },
              ].map(({ oid, label, Icon }) => (
                <div
                  key={oid}
                  style={{
                    padding: 20,
                    background: '#fff',
                    borderRadius: 16,
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  }}
                >
                  <Icon size={24} color="#1B3A5C" style={{ marginBottom: 12 }} />
                  <div style={{ fontWeight: 700, fontSize: 13, fontFamily: 'monospace', color: '#1e293b', marginBottom: 4 }}>
                    {oid}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: image placeholder */}
          <div
            style={{
              borderRadius: 24,
              overflow: 'hidden',
              boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
              border: '1px solid #e2e8f0',
              background: 'linear-gradient(135deg, #1e3a5f 0%, #0f2341 100%)',
              height: 400,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 16,
              color: '#94a3b8',
            }}
          >
            <Globe size={80} color="#1B3A5C" strokeWidth={1} />
            <div style={{ fontSize: 14, textAlign: 'center', color: '#475569' }}>
              {lang === 'ar' ? 'السودان الرقمي' : 'Digital Sudan'}
            </div>
          </div>
        </div>
      </section>

      {/* ── Slide Presentation ── */}
      <SlidePresentation lang={lang} />

      {/* ── Multimedia ── */}
      <section id="Multimedia" style={{ padding: '96px 24px', background: '#0f172a', color: '#fff' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: 16 }}>
              {t.sections.multimedia}
            </h2>
            <div
              style={{
                width: 80,
                height: 4,
                background: '#C8102E',
                margin: '0 auto',
                borderRadius: 2,
              }}
            />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 48,
            }}
          >
            {/* Video placeholder */}
            <div>
              <h3
                style={{
                  fontSize: '1.2rem',
                  fontWeight: 600,
                  marginBottom: 16,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  color: '#e2e8f0',
                }}
              >
                <Play size={20} color="#1B3A5C" />
                {t.videoLabel}
              </h3>
              <div
                style={{
                  aspectRatio: '16/9',
                  background: '#1e293b',
                  borderRadius: 24,
                  border: '1px solid #334155',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    background: '#6366f1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Play fill="white" size={28} color="white" />
                </div>
                <div style={{ fontSize: 12, color: '#64748b' }}>
                  Embed: https://brainsait.tech/v/architecture-01
                </div>
              </div>
            </div>

            {/* Audio + gallery */}
            <div>
              <h3
                style={{
                  fontSize: '1.2rem',
                  fontWeight: 600,
                  marginBottom: 16,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  color: '#e2e8f0',
                }}
              >
                <Volume2 size={20} color="#1B3A5C" />
                {t.audioLabel}
              </h3>
              <div
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid #334155',
                  borderRadius: 24,
                  padding: 24,
                  marginBottom: 24,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      background: '#6366f1',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Volume2 size={22} color="#fff" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: '#e2e8f0' }}>
                      Sudan Unified Audio Briefing
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>03:45 • High Fidelity</div>
                  </div>
                </div>
                {/* Progress bar */}
                <div
                  style={{
                    height: 8,
                    background: '#334155',
                    borderRadius: 4,
                    overflow: 'hidden',
                    marginBottom: 8,
                  }}
                >
                  <div style={{ width: '33%', height: '100%', background: '#6366f1', borderRadius: 4 }} />
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 11,
                    color: '#64748b',
                  }}
                >
                  <span>01:12</span>
                  <span>-02:33</span>
                </div>
              </div>

              {/* Gallery grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { bg: 'linear-gradient(135deg, #1e40af, #3b82f6)', icon: Cpu },
                  { bg: 'linear-gradient(135deg, #065f46, #10b981)', icon: Server },
                ].map(({ bg, icon: Icon }, i) => (
                  <div
                    key={i}
                    style={{
                      height: 120,
                      borderRadius: 16,
                      background: bg,
                      border: '1px solid #334155',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon size={40} color="rgba(255,255,255,0.4)" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Data Table ── */}
      <section id="Registry" style={{ padding: '96px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ marginBottom: 48 }}>
            <h2
              style={{
                fontSize: '2rem',
                fontWeight: 800,
                color: '#1e293b',
                marginBottom: 8,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <Server size={28} color="#2563eb" />
              {t.sections.data}
            </h2>
            <p style={{ color: '#64748b' }}>
              {lang === 'en'
                ? 'Live database view of OID identified national assets.'
                : 'عرض قاعدة البيانات المباشر للأصول الوطنية المعرفة بـ OID.'}
            </p>
          </div>

          <div
            style={{
              background: '#fff',
              borderRadius: 24,
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              overflow: 'hidden',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  {Object.values(t.table).map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: '16px 24px',
                        textAlign: t.dir === 'rtl' ? 'right' : 'left',
                        fontSize: 13,
                        fontWeight: 700,
                        color: '#475569',
                        letterSpacing: '0.03em',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {t.dataRows.map((row, idx) => (
                  <tr
                    key={idx}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      transition: 'background 0.15s',
                    }}
                  >
                    <td
                      style={{
                        padding: '14px 24px',
                        fontFamily: 'monospace',
                        color: '#1B3A5C',
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    >
                      {row.id}
                    </td>
                    <td style={{ padding: '14px 24px', fontWeight: 700, color: '#1e293b' }}>
                      {row.name}
                    </td>
                    <td style={{ padding: '14px 24px', color: '#475569' }}>{row.type}</td>
                    <td style={{ padding: '14px 24px' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '4px 12px',
                          borderRadius: 999,
                          background: '#dcfce7',
                          color: '#16a34a',
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background: '#22c55e',
                          }}
                        />
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section
        style={{
          background: 'linear-gradient(135deg, #1e3a5f 0%, #6366f1 100%)',
          padding: '80px 24px',
          textAlign: 'center',
          color: '#fff',
        }}
      >
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: 16 }}>
            {lang === 'ar' ? 'جاهز للدخول؟' : 'Ready to Enter?'}
          </h2>
          <p style={{ color: '#a5b4fc', marginBottom: 40, fontSize: '1.1rem' }}>
            {lang === 'ar'
              ? 'الوصول إلى بوابة الحكومة الرقمية الشاملة لجمهورية السودان.'
              : 'Access the comprehensive digital government portal of the Republic of Sudan.'}
          </p>
          <button
            style={{ ...btnPrimary, background: '#fff', color: '#1B3A5C', fontSize: 16 }}
            onClick={() => navigate('/portal')}
          >
            {t.enterPortal}
            <ChevronRight size={20} />
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: '#fff', borderTop: '1px solid #e2e8f0', padding: '48px 24px' }}>
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 24,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  background: '#2563eb',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <BrainCircuit size={18} color="#fff" />
              </div>
              <span style={{ fontWeight: 900, fontSize: 18, color: '#1e293b', letterSpacing: '-0.02em' }}>
                {t.brand} LTD
              </span>
            </div>
            <p style={{ color: '#64748b', fontSize: 13 }}>
              {lang === 'en' ? 'Founded by Dr. Mohamed El Fadil' : 'تأسست بواسطة د. محمد الفاضل'}
            </p>
          </div>

          <p style={{ color: '#94a3b8', fontSize: 13 }}>
            © 2026 {t.brand}.{' '}
            {lang === 'en'
              ? 'Automated, Integrated, Technology-driven.'
              : 'مؤتمتة، متكاملة، ومدفوعة بالتقنية.'}
          </p>

          <div style={{ display: 'flex', gap: 20 }}>
            <Globe size={20} color="#94a3b8" style={{ cursor: 'pointer' }} />
            <ShieldCheck size={20} color="#94a3b8" style={{ cursor: 'pointer' }} />
            <Layout size={20} color="#94a3b8" style={{ cursor: 'pointer' }} />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
