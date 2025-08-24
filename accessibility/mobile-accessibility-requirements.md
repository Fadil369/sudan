# Sudan Government Mobile Accessibility Requirements
## Comprehensive Mobile-First Accessibility Standards for 80% Mobile Users

### Executive Summary

With 80% of Sudanese citizens accessing government services via mobile devices, this framework establishes world-class mobile accessibility standards that ensure equal access for all users, including those with disabilities. These requirements integrate NHS Design System mobile patterns with international accessibility standards, creating inclusive mobile government services that work on all devices and connection speeds.

---

## Table of Contents

1. [Mobile Accessibility Foundation](#1-mobile-accessibility-foundation)
2. [Touch and Gesture Accessibility](#2-touch-and-gesture-accessibility)
3. [Mobile Screen Reader Optimization](#3-mobile-screen-reader-optimization)
4. [Mobile Visual Accessibility](#4-mobile-visual-accessibility)
5. [Mobile Form Accessibility](#5-mobile-form-accessibility)
6. [Offline and Low-Connectivity Accessibility](#6-offline-and-low-connectivity-accessibility)
7. [Mobile Emergency Services](#7-mobile-emergency-services)
8. [Testing and Validation](#8-testing-and-validation)

---

## 1. Mobile Accessibility Foundation

### 1.1 Core Mobile Accessibility Principles

#### Universal Design for Mobile Government Services
- **Device Independence**: Services work on all mobile devices (smartphones, tablets, feature phones)
- **Connection Resilience**: Full functionality on 2G/3G networks
- **Battery Efficiency**: Optimized for devices with limited battery life
- **Data Conservation**: Minimal data usage for users with limited plans

#### NHS Mobile Design System Integration
```css
/* Sudan Government Mobile Foundation - NHS Design System Adapted */
:root {
  /* Mobile-first breakpoints */
  --mobile-xs: 320px;  /* Feature phones */
  --mobile-sm: 375px;  /* Small smartphones */
  --mobile-md: 414px;  /* Standard smartphones */
  --mobile-lg: 768px;  /* Large phones/small tablets */
  
  /* Mobile touch targets - NHS minimum 44px enhanced to 48px */
  --touch-target-min: 48px;
  --touch-target-recommended: 56px;
  --touch-target-critical: 64px; /* Emergency services */
  
  /* Mobile spacing system */
  --mobile-space-xs: 0.25rem;  /* 4px */
  --mobile-space-sm: 0.5rem;   /* 8px */
  --mobile-space-md: 1rem;     /* 16px */
  --mobile-space-lg: 1.5rem;   /* 24px */
  --mobile-space-xl: 2rem;     /* 32px */
  
  /* Mobile typography scale */
  --mobile-font-xs: 0.875rem;  /* 14px */
  --mobile-font-sm: 1rem;      /* 16px - minimum for mobile */
  --mobile-font-md: 1.125rem;  /* 18px */
  --mobile-font-lg: 1.25rem;   /* 20px */
  --mobile-font-xl: 1.5rem;    /* 24px */
  --mobile-font-2xl: 2rem;     /* 32px */
}

/* Mobile-first base styles */
body {
  font-size: var(--mobile-font-sm); /* 16px minimum */
  line-height: 1.6; /* Enhanced line height for mobile reading */
  touch-action: manipulation; /* Optimize touch response */
  -webkit-text-size-adjust: 100%; /* Prevent zoom on orientation change */
  -webkit-tap-highlight-color: rgba(206, 17, 38, 0.3);
}

/* Mobile container system */
.container {
  width: 100%;
  max-width: 100vw;
  padding-left: var(--mobile-space-md);
  padding-right: var(--mobile-space-md);
  margin: 0 auto;
}

@media (min-width: 768px) {
  .container {
    max-width: 768px;
  }
}
```

### 1.2 Progressive Enhancement for Mobile

#### Mobile-First Responsive Strategy
```html
<!-- Mobile-optimized government service page -->
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes, maximum-scale=5.0">
  <title>الخدمات الحكومية - Sudan Government Services</title>
  
  <!-- Mobile-critical CSS inline -->
  <style>
    /* Critical mobile CSS for fastest loading */
    .mobile-header {
      position: sticky;
      top: 0;
      background: #CE1126;
      color: white;
      padding: var(--mobile-space-md);
      z-index: 1000;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .mobile-nav-toggle {
      background: none;
      border: 2px solid white;
      color: white;
      padding: var(--mobile-space-sm);
      min-width: var(--touch-target-min);
      min-height: var(--touch-target-min);
      border-radius: 4px;
      font-size: var(--mobile-font-lg);
    }
    
    .mobile-service-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--mobile-space-md);
      padding: var(--mobile-space-md);
    }
    
    @media (min-width: 480px) {
      .mobile-service-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    
    @media (min-width: 768px) {
      .mobile-service-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }
  </style>
  
  <!-- Preload critical resources -->
  <link rel="preload" href="/fonts/NotoSansArabic-Regular.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preconnect" href="/api" crossorigin>
</head>
<body>
  <!-- Skip to main content for screen readers -->
  <a href="#main-content" class="skip-navigation">
    تخطى إلى المحتوى الرئيسي - Skip to main content
  </a>
  
  <!-- Mobile-optimized header -->
  <header class="mobile-header" role="banner">
    <div class="header-container">
      <!-- Mobile navigation toggle -->
      <button class="mobile-nav-toggle" 
              aria-expanded="false"
              aria-controls="main-navigation"
              aria-label="قائمة التنقل - Navigation menu">
        <span class="hamburger-icon" aria-hidden="true">☰</span>
      </button>
      
      <!-- Government logo and title -->
      <div class="header-title">
        <h1 class="site-title">
          <span class="logo" aria-hidden="true">🇸🇩</span>
          الحكومة السودانية
        </h1>
        <p class="site-subtitle">Sudan Government Services</p>
      </div>
      
      <!-- Language toggle for mobile -->
      <button class="mobile-lang-toggle"
              aria-pressed="true"
              aria-label="تغيير اللغة - Change language">
        EN
      </button>
    </div>
  </header>
</body>
</html>
```

---

## 2. Touch and Gesture Accessibility

### 2.1 Touch Target Standards

#### Enhanced Touch Target Requirements
```css
/* Mobile touch target standards - exceeding WCAG requirements */
.touch-target {
  min-width: var(--touch-target-min); /* 48px minimum */
  min-height: var(--touch-target-min);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--mobile-space-sm);
  position: relative;
}

/* Critical actions get larger targets */
.touch-target-critical {
  min-width: var(--touch-target-critical); /* 64px for emergency services */
  min-height: var(--touch-target-critical);
  font-size: var(--mobile-font-lg);
  font-weight: 600;
}

/* Spacing between touch targets */
.touch-target-group {
  display: flex;
  flex-direction: column;
  gap: var(--mobile-space-sm); /* 8px minimum between targets */
}

.touch-target-group.horizontal {
  flex-direction: row;
  flex-wrap: wrap;
}

/* Touch feedback */
.touch-target:active {
  transform: scale(0.98);
  background-color: rgba(206, 17, 38, 0.1);
}

/* Focus indicators for keyboard users on mobile */
.touch-target:focus-visible {
  outline: 3px solid var(--primary-red);
  outline-offset: 2px;
  border-radius: 4px;
}

/* High contrast mode enhancement */
@media (prefers-contrast: high) {
  .touch-target {
    border: 2px solid currentColor;
    background: white;
    color: black;
  }
  
  .touch-target:active,
  .touch-target:focus {
    background: black;
    color: white;
  }
}
```

#### Government Service Card Touch Optimization
```html
<!-- Mobile-optimized government service cards -->
<div class="mobile-service-grid">
  
  <!-- Passport Services Card -->
  <article class="service-card touch-target-card" 
           role="button"
           tabindex="0"
           aria-describedby="passport-description"
           onclick="navigateToService('/passport')"
           onkeydown="handleServiceCardKeydown(event, '/passport')">
    
    <!-- Service icon with appropriate size -->
    <div class="service-icon touch-icon" aria-hidden="true">
      <svg width="48" height="48" viewBox="0 0 24 24">
        <path d="M12 2C13.1 2 14 2.9 14 4V6H16C17.1 6 18 6.9 18 8V19C18 20.1 17.1 21 16 21H8C6.9 21 6 20.1 6 19V8C6 6.9 6.9 6 8 6H10V4C10 2.9 10.9 2 12 2Z"/>
      </svg>
    </div>
    
    <!-- Service content -->
    <div class="service-content">
      <h3 class="service-title">خدمات جواز السفر</h3>
      <p id="passport-description" class="service-description">
        تجديد وإصدار جوازات السفر
      </p>
      
      <!-- Service status indicator -->
      <div class="service-status">
        <span class="status-indicator available" 
              aria-label="الخدمة متاحة">
          متاح
        </span>
        <span class="service-duration">
          عادة يستغرق ٧-١٠ أيام عمل
        </span>
      </div>
    </div>
    
    <!-- Touch affordance indicator -->
    <div class="service-arrow" aria-hidden="true">
      <svg width="24" height="24" viewBox="0 0 24 24">
        <path d="M8.59 16.59L13.17 12L8.59 7.41L10 6L16 12L10 18L8.59 16.59Z"/>
      </svg>
    </div>
  </article>
  
  <!-- Health Services Card -->
  <article class="service-card touch-target-card"
           role="button"
           tabindex="0"
           aria-describedby="health-description"
           onclick="navigateToService('/health')"
           onkeydown="handleServiceCardKeydown(event, '/health')">
    
    <div class="service-icon touch-icon health-icon" aria-hidden="true">
      <svg width="48" height="48" viewBox="0 0 24 24">
        <path d="M19 8H17.3L15.45 3.55C15.15 2.82 14.47 2.31 13.69 2.31H10.31C9.53 2.31 8.85 2.82 8.55 3.55L6.7 8H5C3.9 8 3 8.9 3 10V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V10C21 8.9 20.1 8 19 8Z"/>
      </svg>
    </div>
    
    <div class="service-content">
      <h3 class="service-title">الخدمات الصحية</h3>
      <p id="health-description" class="service-description">
        الوصول للسجلات الطبية والمواعيد
      </p>
      
      <div class="service-status">
        <span class="status-indicator available" 
              aria-label="الخدمة متاحة">
          متاح
        </span>
        <span class="service-duration">
          فوري
        </span>
      </div>
    </div>
    
    <div class="service-arrow" aria-hidden="true">
      <svg width="24" height="24" viewBox="0 0 24 24">
        <path d="M8.59 16.59L13.17 12L8.59 7.41L10 6L16 12L10 18L8.59 16.59Z"/>
      </svg>
    </div>
  </article>
  
  <!-- Emergency Services Card - Enhanced touch target -->
  <article class="service-card touch-target-card emergency-card touch-target-critical"
           role="button"
           tabindex="0"
           aria-describedby="emergency-description"
           onclick="navigateToService('/emergency')"
           onkeydown="handleServiceCardKeydown(event, '/emergency')">
    
    <div class="service-icon touch-icon emergency-icon" aria-hidden="true">
      <svg width="56" height="56" viewBox="0 0 24 24">
        <path d="M12 2C13.1 2 14 2.9 14 4V6H16C17.1 6 18 6.9 18 8V19C18 20.1 17.1 21 16 21H8C6.9 21 6 20.1 6 19V8C6 6.9 6.9 6 8 6H10V4C10 2.9 10.9 2 12 2Z"/>
      </svg>
    </div>
    
    <div class="service-content">
      <h3 class="service-title emergency-title">خدمات الطوارئ</h3>
      <p id="emergency-description" class="service-description emergency-description">
        اتصال مباشر بخدمات الطوارئ
      </p>
      
      <div class="service-status emergency-status">
        <span class="status-indicator emergency" 
              aria-label="خدمة طوارئ متاحة ٢٤/٧">
          متاح ٢٤/٧
        </span>
      </div>
    </div>
    
    <div class="service-arrow emergency-arrow" aria-hidden="true">
      <span class="emergency-pulse">🚨</span>
    </div>
  </article>
</div>
```

### 2.2 Gesture Support and Alternatives

#### Accessible Mobile Gestures
```javascript
// Mobile gesture handling with accessibility support
class MobileAccessibilityGestures {
  constructor() {
    this.setupGestureHandlers();
    this.setupKeyboardAlternatives();
    this.setupVoiceOverSupport();
  }
  
  // Setup touch gesture handlers
  setupGestureHandlers() {
    let touchStartX = 0;
    let touchStartY = 0;
    
    document.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });
    
    document.addEventListener('touchend', (e) => {
      if (!touchStartX || !touchStartY) return;
      
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      
      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;
      
      // Horizontal swipe detection
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        if (deltaX > 0) {
          this.handleSwipeRight();
        } else {
          this.handleSwipeLeft();
        }
      }
      
      // Vertical swipe detection
      if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 50) {
        if (deltaY > 0) {
          this.handleSwipeDown();
        } else {
          this.handleSwipeUp();
        }
      }
      
      touchStartX = 0;
      touchStartY = 0;
    }, { passive: true });
  }
  
  // Handle swipe gestures with announcements
  handleSwipeRight() {
    // Navigate back (RTL: right swipe = back)
    if (document.dir === 'rtl') {
      this.navigateBack();
      this.announceAction('العودة للخلف - Going back');
    } else {
      this.navigateForward();
      this.announceAction('التقدم للأمام - Going forward');
    }
  }
  
  handleSwipeLeft() {
    // Navigate forward (RTL: left swipe = forward)
    if (document.dir === 'rtl') {
      this.navigateForward();
      this.announceAction('التقدم للأمام - Going forward');
    } else {
      this.navigateBack();
      this.announceAction('العودة للخلف - Going back');
    }
  }
  
  handleSwipeDown() {
    // Refresh or show more content
    this.refreshContent();
    this.announceAction('تحديث المحتوى - Refreshing content');
  }
  
  handleSwipeUp() {
    // Show navigation menu
    this.toggleMobileMenu();
    this.announceAction('عرض القائمة - Showing menu');
  }
  
  // Keyboard alternatives for gestures
  setupKeyboardAlternatives() {
    document.addEventListener('keydown', (e) => {
      // Arrow key navigation
      if (e.key === 'ArrowLeft' && e.altKey) {
        e.preventDefault();
        this.handleSwipeLeft();
      }
      
      if (e.key === 'ArrowRight' && e.altKey) {
        e.preventDefault();
        this.handleSwipeRight();
      }
      
      if (e.key === 'ArrowUp' && e.altKey) {
        e.preventDefault();
        this.handleSwipeUp();
      }
      
      if (e.key === 'ArrowDown' && e.altKey) {
        e.preventDefault();
        this.handleSwipeDown();
      }
      
      // Menu toggle with M key
      if (e.key === 'm' && e.altKey) {
        e.preventDefault();
        this.toggleMobileMenu();
      }
    });
  }
  
  // VoiceOver/TalkBack gesture support
  setupVoiceOverSupport() {
    // Custom rotor actions for iOS VoiceOver
    if (window.speechSynthesis) {
      document.addEventListener('customGesture', (e) => {
        switch (e.detail.action) {
          case 'swipeUp':
            this.handleSwipeUp();
            break;
          case 'swipeDown':
            this.handleSwipeDown();
            break;
          case 'swipeLeft':
            this.handleSwipeLeft();
            break;
          case 'swipeRight':
            this.handleSwipeRight();
            break;
        }
      });
    }
  }
  
  // Announce actions to screen readers
  announceAction(message) {
    const liveRegion = document.getElementById('gesture-announcements') || 
                      this.createGestureLiveRegion();
    
    liveRegion.textContent = message;
    
    setTimeout(() => {
      liveRegion.textContent = '';
    }, 3000);
  }
  
  createGestureLiveRegion() {
    const liveRegion = document.createElement('div');
    liveRegion.id = 'gesture-announcements';
    liveRegion.className = 'sr-only';
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    
    document.body.appendChild(liveRegion);
    return liveRegion;
  }
}

// Initialize mobile accessibility gestures
document.addEventListener('DOMContentLoaded', () => {
  new MobileAccessibilityGestures();
});
```

---

## 3. Mobile Screen Reader Optimization

### 3.1 VoiceOver and TalkBack Integration

#### Mobile Screen Reader Navigation
```html
<!-- Mobile-optimized screen reader navigation -->
<nav class="mobile-navigation" 
     role="navigation" 
     aria-label="الشاشة الرئيسية - Main navigation">
  
  <!-- Mobile breadcrumb for screen readers -->
  <div class="mobile-breadcrumb sr-only" 
       role="navigation" 
       aria-label="مسار التنقل - Breadcrumb">
    <ol>
      <li><a href="/ar">الرئيسية</a></li>
      <li><a href="/ar/services">الخدمات</a></li>
      <li aria-current="page">جواز السفر</li>
    </ol>
  </div>
  
  <!-- Mobile menu button with proper ARIA -->
  <button class="mobile-menu-button touch-target"
          aria-expanded="false"
          aria-controls="mobile-menu-panel"
          aria-haspopup="true">
    <span class="menu-icon" aria-hidden="true">☰</span>
    <span class="menu-text">القائمة</span>
  </button>
  
  <!-- Collapsible mobile menu -->
  <div id="mobile-menu-panel" 
       class="mobile-menu-panel"
       role="menu"
       aria-labelledby="mobile-menu-button"
       hidden>
    
    <ul class="mobile-menu-list" role="none">
      <li role="none">
        <a href="/ar/services" 
           role="menuitem"
           class="mobile-menu-item touch-target">
          <span class="menu-icon" aria-hidden="true">🏛️</span>
          <span class="menu-text">الخدمات الحكومية</span>
          <span class="menu-description">جميع الخدمات المتاحة</span>
        </a>
      </li>
      
      <li role="none">
        <a href="/ar/profile" 
           role="menuitem"
           class="mobile-menu-item touch-target">
          <span class="menu-icon" aria-hidden="true">👤</span>
          <span class="menu-text">ملفي الشخصي</span>
          <span class="menu-description">المعلومات والطلبات</span>
        </a>
      </li>
      
      <li role="none">
        <a href="/ar/help" 
           role="menuitem"
           class="mobile-menu-item touch-target">
          <span class="menu-icon" aria-hidden="true">❓</span>
          <span class="menu-text">المساعدة</span>
          <span class="menu-description">الدعم والتواصل</span>
        </a>
      </li>
      
      <li role="none">
        <a href="/ar/emergency" 
           role="menuitem"
           class="mobile-menu-item touch-target emergency-menu-item">
          <span class="menu-icon" aria-hidden="true">🚨</span>
          <span class="menu-text">خدمات الطوارئ</span>
          <span class="menu-description">الخدمات العاجلة ٢٤/٧</span>
        </a>
      </li>
    </ul>
    
    <!-- Mobile menu close button -->
    <button class="mobile-menu-close touch-target"
            onclick="closeMobileMenu()"
            aria-label="إغلاق القائمة - Close menu">
      <span aria-hidden="true">×</span>
    </button>
  </div>
</nav>
```

#### Mobile Screen Reader Optimized Content Structure
```html
<!-- Mobile-optimized content structure for screen readers -->
<main id="main-content" role="main">
  
  <!-- Page summary for screen readers -->
  <div class="page-summary sr-only">
    <h1>خدمات جواز السفر - Passport Services</h1>
    <p>
      هذه الصفحة تحتوي على خدمات جواز السفر بما في ذلك التجديد والإصدار الجديد.
      يمكنك التنقل باستخدام العناوين أو معالم الصفحة.
    </p>
    <p>
      This page contains passport services including renewal and new issuance.
      You can navigate using headings or page landmarks.
    </p>
  </div>
  
  <!-- Service overview section -->
  <section class="service-overview" 
           aria-labelledby="overview-heading">
    
    <h2 id="overview-heading">نظرة عامة على الخدمة</h2>
    
    <!-- Quick actions for mobile users -->
    <div class="quick-actions" 
         role="group" 
         aria-labelledby="quick-actions-heading">
      
      <h3 id="quick-actions-heading" class="sr-only">
        الإجراءات السريعة - Quick Actions
      </h3>
      
      <button class="quick-action-button touch-target-critical"
              onclick="startPassportRenewal()"
              aria-describedby="renewal-description">
        <span class="action-icon" aria-hidden="true">🔄</span>
        <span class="action-text">تجديد جواز السفر</span>
      </button>
      <div id="renewal-description" class="action-description">
        تجديد جواز سفر موجود، يستغرق عادة ٧-١٠ أيام عمل
      </div>
      
      <button class="quick-action-button touch-target-critical"
              onclick="startNewPassport()"
              aria-describedby="new-passport-description">
        <span class="action-icon" aria-hidden="true">📝</span>
        <span class="action-text">إصدار جواز سفر جديد</span>
      </button>
      <div id="new-passport-description" class="action-description">
        إصدار جواز سفر جديد، يستغرق عادة ١٠-١٤ يوم عمل
      </div>
      
      <button class="quick-action-button touch-target"
              onclick="trackApplication()"
              aria-describedby="track-description">
        <span class="action-icon" aria-hidden="true">📍</span>
        <span class="action-text">تتبع الطلب</span>
      </button>
      <div id="track-description" class="action-description">
        تتبع حالة طلبك الحالي
      </div>
    </div>
  </section>
  
  <!-- Progress indicator for multi-step processes -->
  <section class="mobile-progress" 
           role="progressbar"
           aria-labelledby="progress-heading"
           aria-valuenow="2" 
           aria-valuemin="1" 
           aria-valuemax="4"
           aria-valuetext="الخطوة الثانية من أصل أربع خطوات">
    
    <h3 id="progress-heading" class="sr-only">تقدم العملية</h3>
    
    <div class="progress-steps">
      <div class="progress-step completed" aria-current="false">
        <span class="step-number" aria-hidden="true">1</span>
        <span class="step-title">معلومات أساسية</span>
        <span class="step-status" aria-hidden="true">✓</span>
      </div>
      
      <div class="progress-step active" aria-current="step">
        <span class="step-number" aria-hidden="true">2</span>
        <span class="step-title">تحميل الوثائق</span>
        <span class="step-status" aria-hidden="true">▶</span>
      </div>
      
      <div class="progress-step pending" aria-current="false">
        <span class="step-number" aria-hidden="true">3</span>
        <span class="step-title">المراجعة</span>
        <span class="step-status" aria-hidden="true">⏳</span>
      </div>
      
      <div class="progress-step pending" aria-current="false">
        <span class="step-number" aria-hidden="true">4</span>
        <span class="step-title">الدفع</span>
        <span class="step-status" aria-hidden="true">💳</span>
      </div>
    </div>
    
    <!-- Progress description -->
    <div class="progress-description">
      <p>
        أنت الآن في الخطوة ٢ من أصل ٤ خطوات.
        يرجى تحميل الوثائق المطلوبة للمتابعة.
      </p>
    </div>
  </section>
</main>
```

---

## 4. Mobile Visual Accessibility

### 4.1 Mobile Visual Design Standards

#### High Contrast and Large Text Support
```css
/* Mobile visual accessibility enhancements */
@media screen and (max-width: 768px) {
  
  /* Base text size increase for mobile */
  body {
    font-size: 16px; /* Never smaller than 16px on mobile */
    line-height: 1.6;
  }
  
  /* Heading sizes optimized for mobile screens */
  h1 { font-size: 28px; font-weight: 700; margin-bottom: 16px; }
  h2 { font-size: 24px; font-weight: 600; margin-bottom: 14px; }
  h3 { font-size: 20px; font-weight: 600; margin-bottom: 12px; }
  h4 { font-size: 18px; font-weight: 500; margin-bottom: 10px; }
  
  /* Enhanced contrast for mobile */
  .mobile-content {
    color: #1a1a1a; /* Enhanced from #333 */
    background: #ffffff;
  }
  
  /* Mobile button styling with high contrast */
  .btn-mobile {
    font-size: 18px;
    font-weight: 600;
    padding: 16px 24px;
    border: 2px solid transparent;
    border-radius: 8px;
    min-height: 48px;
    background: var(--primary-red);
    color: white;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  
  .btn-mobile:hover,
  .btn-mobile:focus {
    background: #B91C3C;
    border-color: #000000;
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  }
  
  /* Emergency button with high visibility */
  .btn-emergency-mobile {
    background: #DC2626;
    color: white;
    font-size: 20px;
    font-weight: 700;
    min-height: 64px;
    border: 3px solid #000000;
    animation: pulse-mobile 2s infinite;
  }
  
  @keyframes pulse-mobile {
    0%, 100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7); }
    50% { box-shadow: 0 0 0 8px rgba(220, 38, 38, 0); }
  }
  
  @media (prefers-reduced-motion: reduce) {
    .btn-emergency-mobile {
      animation: none;
    }
  }
}

/* High contrast mode for mobile */
@media (prefers-contrast: high) and (max-width: 768px) {
  
  body {
    background: white;
    color: black;
  }
  
  .btn-mobile {
    background: white;
    color: black;
    border: 3px solid black;
    font-weight: 700;
  }
  
  .btn-mobile:hover,
  .btn-mobile:focus {
    background: black;
    color: white;
    border-color: white;
  }
  
  .service-card {
    border: 3px solid black;
    background: white;
    color: black;
  }
  
  .service-card:hover,
  .service-card:focus {
    background: black;
    color: white;
  }
}

/* Large text mode support */
@media screen and (min-width: 1px) {
  
  /* Responsive font scaling */
  html {
    font-size: clamp(16px, 4vw, 20px);
  }
  
  /* Maintain relative sizing */
  .mobile-title {
    font-size: clamp(24px, 6vw, 32px);
  }
  
  .mobile-subtitle {
    font-size: clamp(18px, 4.5vw, 24px);
  }
  
  /* Button text scaling */
  .btn-mobile {
    font-size: clamp(16px, 4vw, 22px);
    padding: clamp(12px, 3vw, 20px) clamp(20px, 5vw, 32px);
  }
}

/* Dark mode support for mobile */
@media (prefers-color-scheme: dark) and (max-width: 768px) {
  
  body {
    background: #1a1a1a;
    color: #e0e0e0;
  }
  
  .mobile-header {
    background: #2d2d2d;
    color: white;
    border-bottom: 2px solid #444;
  }
  
  .service-card {
    background: #2d2d2d;
    color: #e0e0e0;
    border: 2px solid #444;
  }
  
  .btn-mobile {
    background: var(--primary-red);
    color: white;
    border-color: #555;
  }
  
  /* Maintain emergency visibility in dark mode */
  .btn-emergency-mobile {
    background: #EF4444;
    color: white;
    border-color: white;
  }
}
```

### 4.2 Mobile Visual Indicators and Feedback

#### Loading States and Progress Indicators
```html
<!-- Mobile loading states with accessibility -->
<div class="mobile-loading-container" 
     role="status" 
     aria-live="polite"
     aria-label="جاري التحميل - Loading">
  
  <!-- Spinner with text alternative -->
  <div class="mobile-spinner" aria-hidden="true">
    <svg width="48" height="48" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" stroke="#CE1126" stroke-width="4" fill="none" 
              stroke-linecap="round" stroke-dasharray="31.416" stroke-dashoffset="31.416">
        <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
        <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
      </svg>
    </div>
  
  <!-- Loading text -->
  <div class="mobile-loading-text">
    <p class="loading-message">جاري تحميل الخدمة...</p>
    <p class="loading-message-en">Loading service...</p>
  </div>
  
  <!-- Progress percentage -->
  <div class="loading-progress" 
       role="progressbar"
       aria-valuenow="45" 
       aria-valuemin="0" 
       aria-valuemax="100"
       aria-valuetext="45 percent loaded">
    <span class="progress-percentage">45%</span>
  </div>
</div>

<!-- Mobile success/error states -->
<div class="mobile-status-message success" 
     role="alert"
     aria-live="assertive">
  
  <div class="status-icon" aria-hidden="true">
    <svg width="32" height="32" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" fill="#16A34A"/>
      <path d="M9 12l2 2 4-4" stroke="white" stroke-width="2" fill="none"/>
    </svg>
  </div>
  
  <div class="status-content">
    <h3 class="status-title">تم بنجاح</h3>
    <p class="status-description">
      تم تقديم طلبك بنجاح. سيتم التواصل معك خلال ٢٤ ساعة.
    </p>
  </div>
  
  <button class="status-dismiss touch-target"
          onclick="dismissStatus()"
          aria-label="إخفاء الرسالة - Dismiss message">
    <span aria-hidden="true">×</span>
  </button>
</div>

<!-- Mobile form validation feedback -->
<div class="mobile-form-validation" role="alert" aria-live="polite">
  
  <!-- Field-specific error -->
  <div class="validation-item error">
    <div class="validation-icon" aria-hidden="true">
      <svg width="24" height="24" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" fill="#DC2626"/>
        <path d="M15 9l-6 6M9 9l6 6" stroke="white" stroke-width="2"/>
      </svg>
    </div>
    
    <div class="validation-content">
      <p class="validation-message">
        <strong>رقم الهوية مطلوب</strong><br>
        يرجى إدخال رقم بطاقة الهوية الوطنية
      </p>
    </div>
  </div>
  
  <!-- Field-specific success -->
  <div class="validation-item success">
    <div class="validation-icon" aria-hidden="true">
      <svg width="24" height="24" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" fill="#16A34A"/>
        <path d="M9 12l2 2 4-4" stroke="white" stroke-width="2" fill="none"/>
      </svg>
    </div>
    
    <div class="validation-content">
      <p class="validation-message">
        <strong>تم التحقق من رقم الهوية</strong><br>
        البيانات صحيحة ومطابقة للسجلات
      </p>
    </div>
  </div>
</div>
```

---

## 5. Mobile Form Accessibility

### 5.1 Mobile-Optimized Form Design

#### Touch-Friendly Form Controls
```html
<!-- Mobile-optimized government form -->
<form class="mobile-government-form" 
      action="/submit" 
      method="post"
      novalidate
      autocomplete="on">
  
  <!-- Form progress indicator -->
  <div class="mobile-form-progress" 
       role="progressbar"
       aria-valuenow="1" 
       aria-valuemin="1" 
       aria-valuemax="3"
       aria-valuetext="الخطوة الأولى من ثلاث خطوات">
    
    <div class="progress-bar">
      <div class="progress-fill" style="width: 33%"></div>
    </div>
    <p class="progress-text">الخطوة ١ من ٣: المعلومات الأساسية</p>
  </div>
  
  <!-- Personal information section -->
  <fieldset class="mobile-form-section">
    <legend class="mobile-section-title">المعلومات الشخصية</legend>
    
    <!-- Full name field -->
    <div class="mobile-form-group">
      <label for="full-name" class="mobile-form-label required">
        الاسم الكامل
        <span class="required-indicator" aria-hidden="true">*</span>
      </label>
      
      <input type="text" 
             id="full-name"
             name="fullName"
             class="mobile-form-input"
             required
             autocomplete="name"
             aria-describedby="name-help name-error"
             aria-invalid="false"
             dir="rtl"
             lang="ar">
      
      <div id="name-help" class="mobile-form-hint">
        اكتب اسمك كما هو مكتوب في بطاقة الهوية الوطنية
      </div>
      
      <div id="name-error" 
           class="mobile-form-error" 
           role="alert"
           style="display: none;">
        يرجى إدخال الاسم الكامل
      </div>
    </div>
    
    <!-- National ID field -->
    <div class="mobile-form-group">
      <label for="national-id" class="mobile-form-label required">
        رقم بطاقة الهوية الوطنية
        <span class="required-indicator" aria-hidden="true">*</span>
      </label>
      
      <input type="text" 
             id="national-id"
             name="nationalId"
             class="mobile-form-input"
             required
             autocomplete="off"
             aria-describedby="id-help id-error"
             aria-invalid="false"
             pattern="[0-9]{10}"
             inputmode="numeric"
             dir="ltr">
      
      <div id="id-help" class="mobile-form-hint">
        أدخل ١٠ أرقام بدون مسافات أو رموز
      </div>
      
      <div id="id-error" 
           class="mobile-form-error" 
           role="alert"
           style="display: none;">
        رقم بطاقة الهوية يجب أن يتكون من ١٠ أرقام
      </div>
    </div>
    
    <!-- Phone number field -->
    <div class="mobile-form-group">
      <label for="phone" class="mobile-form-label required">
        رقم الهاتف المحمول
        <span class="required-indicator" aria-hidden="true">*</span>
      </label>
      
      <div class="mobile-phone-input-group">
        <select id="phone-country" 
                class="mobile-country-select"
                aria-label="رمز البلد">
          <option value="+249" selected>🇸🇩 +249</option>
          <option value="+966">🇸🇦 +966</option>
          <option value="+20">🇪🇬 +20</option>
        </select>
        
        <input type="tel" 
               id="phone"
               name="phone"
               class="mobile-form-input mobile-phone-input"
               required
               autocomplete="tel"
               aria-describedby="phone-help phone-error"
               aria-invalid="false"
               placeholder="912345678"
               inputmode="tel"
               dir="ltr">
      </div>
      
      <div id="phone-help" class="mobile-form-hint">
        أدخل رقم هاتفك المحمول بدون رمز البلد
      </div>
      
      <div id="phone-error" 
           class="mobile-form-error" 
           role="alert"
           style="display: none;">
        يرجى إدخال رقم هاتف صحيح
      </div>
    </div>
    
    <!-- Email field -->
    <div class="mobile-form-group">
      <label for="email" class="mobile-form-label">
        البريد الإلكتروني (اختياري)
      </label>
      
      <input type="email" 
             id="email"
             name="email"
             class="mobile-form-input"
             autocomplete="email"
             aria-describedby="email-help"
             dir="ltr"
             lang="en"
             placeholder="example@email.com">
      
      <div id="email-help" class="mobile-form-hint">
        سيتم استخدام البريد الإلكتروني لإرسال تحديثات الطلب
      </div>
    </div>
  </fieldset>
  
  <!-- Document upload section -->
  <fieldset class="mobile-form-section">
    <legend class="mobile-section-title">تحميل الوثائق</legend>
    
    <!-- Document upload area -->
    <div class="mobile-upload-area">
      <label for="document-upload" class="mobile-upload-label">
        <div class="upload-icon" aria-hidden="true">📁</div>
        <div class="upload-text">
          <strong>اضغط لاختيار الملفات</strong>
          <p>أو اسحب الملفات هنا</p>
        </div>
      </label>
      
      <input type="file" 
             id="document-upload"
             name="documents[]"
             multiple
             accept=".pdf,.jpg,.jpeg,.png"
             class="mobile-upload-input">
      
      <div class="upload-requirements">
        <h4>المتطلبات:</h4>
        <ul>
          <li>الحد الأقصى لحجم الملف: ٥ ميجابايت</li>
          <li>الصيغ المسموحة: PDF, JPG, PNG</li>
          <li>يجب أن تكون الصور واضحة ومقروءة</li>
        </ul>
      </div>
    </div>
    
    <!-- Selected files display -->
    <div id="selected-files" class="mobile-selected-files" style="display: none;">
      <!-- Files will be added here dynamically -->
    </div>
  </fieldset>
  
  <!-- Form navigation buttons -->
  <div class="mobile-form-navigation">
    <button type="button" 
            class="btn-mobile btn-secondary"
            onclick="previousStep()"
            disabled>
      <span aria-hidden="true">‹</span>
      السابق
    </button>
    
    <button type="submit" 
            class="btn-mobile btn-primary">
      التالي
      <span aria-hidden="true">›</span>
    </button>
  </div>
  
  <!-- Form help -->
  <div class="mobile-form-help">
    <button type="button" 
            class="help-button touch-target"
            onclick="showHelp()"
            aria-describedby="help-description">
      <span aria-hidden="true">❓</span>
      تحتاج مساعدة؟
    </button>
    <div id="help-description" class="help-description">
      اضغط للحصول على المساعدة أو الاتصال بالدعم الفني
    </div>
  </div>
</form>
```

### 5.2 Mobile Form Validation

#### Real-Time Mobile Validation
```javascript
// Mobile form validation with accessibility
class MobileFormValidator {
  constructor(formSelector) {
    this.form = document.querySelector(formSelector);
    this.setupValidation();
    this.setupMobileEnhancements();
  }
  
  setupValidation() {
    const inputs = this.form.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
      // Real-time validation on blur for mobile
      input.addEventListener('blur', () => {
        this.validateField(input);
      });
      
      // Clear errors on focus
      input.addEventListener('focus', () => {
        this.clearFieldError(input);
      });
      
      // Special handling for mobile input types
      if (input.type === 'tel') {
        this.setupPhoneValidation(input);
      }
      
      if (input.type === 'email') {
        this.setupEmailValidation(input);
      }
    });
    
    // Form submission validation
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.validateForm();
    });
  }
  
  setupMobileEnhancements() {
    // Auto-advance for numeric inputs on mobile
    const numericInputs = this.form.querySelectorAll('input[inputmode="numeric"]');
    
    numericInputs.forEach(input => {
      input.addEventListener('input', (e) => {
        const maxLength = input.getAttribute('maxlength');
        if (maxLength && e.target.value.length >= maxLength) {
          // Move to next field automatically
          this.focusNextField(input);
        }
      });
    });
    
    // Setup mobile keyboard types
    this.optimizeMobileKeyboards();
  }
  
  validateField(field) {
    const fieldGroup = field.closest('.mobile-form-group');
    const errorElement = fieldGroup.querySelector('.mobile-form-error');
    const helpElement = fieldGroup.querySelector('.mobile-form-hint');
    
    let isValid = true;
    let errorMessage = '';
    
    // Required field validation
    if (field.hasAttribute('required') && !field.value.trim()) {
      isValid = false;
      errorMessage = this.getRequiredMessage(field);
    }
    
    // Pattern validation
    if (isValid && field.pattern && field.value) {
      const regex = new RegExp(field.pattern);
      if (!regex.test(field.value)) {
        isValid = false;
        errorMessage = this.getPatternMessage(field);
      }
    }
    
    // Custom validation for specific fields
    if (isValid && field.name === 'nationalId') {
      isValid = this.validateNationalId(field.value);
      if (!isValid) {
        errorMessage = 'رقم بطاقة الهوية غير صحيح';
      }
    }
    
    if (isValid && field.type === 'tel') {
      isValid = this.validatePhoneNumber(field.value);
      if (!isValid) {
        errorMessage = 'رقم الهاتف غير صحيح';
      }
    }
    
    // Update field state
    this.updateFieldState(field, isValid, errorMessage);
    
    return isValid;
  }
  
  updateFieldState(field, isValid, errorMessage) {
    const fieldGroup = field.closest('.mobile-form-group');
    const errorElement = fieldGroup.querySelector('.mobile-form-error');
    
    if (isValid) {
      // Valid state
      field.classList.remove('error');
      field.classList.add('valid');
      field.setAttribute('aria-invalid', 'false');
      
      if (errorElement) {
        errorElement.style.display = 'none';
        errorElement.textContent = '';
      }
      
      // Add success indicator for mobile
      this.addSuccessIndicator(fieldGroup);
      
    } else {
      // Error state
      field.classList.remove('valid');
      field.classList.add('error');
      field.setAttribute('aria-invalid', 'true');
      
      if (errorElement) {
        errorElement.textContent = errorMessage;
        errorElement.style.display = 'block';
        
        // Announce error to screen readers
        this.announceError(errorMessage);
      }
      
      this.removeSuccessIndicator(fieldGroup);
    }
  }
  
  addSuccessIndicator(fieldGroup) {
    let indicator = fieldGroup.querySelector('.success-indicator');
    
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.className = 'success-indicator';
      indicator.setAttribute('aria-hidden', 'true');
      indicator.innerHTML = '<span class="success-icon">✓</span>';
      
      const label = fieldGroup.querySelector('.mobile-form-label');
      if (label) {
        label.appendChild(indicator);
      }
    }
  }
  
  removeSuccessIndicator(fieldGroup) {
    const indicator = fieldGroup.querySelector('.success-indicator');
    if (indicator) {
      indicator.remove();
    }
  }
  
  validateNationalId(value) {
    // Sudan National ID validation logic
    if (!value || value.length !== 10) return false;
    
    // Check if all digits
    if (!/^\d{10}$/.test(value)) return false;
    
    // Add checksum validation if available
    return true;
  }
  
  validatePhoneNumber(value) {
    // Sudan phone number validation
    if (!value) return true; // Optional field
    
    // Remove spaces and dashes
    const cleaned = value.replace(/[\s-]/g, '');
    
    // Check Sudan mobile format (9 digits starting with 9)
    return /^9\d{8}$/.test(cleaned);
  }
  
  announceError(message) {
    const liveRegion = document.getElementById('form-announcements') || 
                      this.createFormLiveRegion();
    
    liveRegion.textContent = `خطأ في النموذج: ${message}`;
    
    setTimeout(() => {
      liveRegion.textContent = '';
    }, 3000);
  }
  
  createFormLiveRegion() {
    const liveRegion = document.createElement('div');
    liveRegion.id = 'form-announcements';
    liveRegion.className = 'sr-only';
    liveRegion.setAttribute('aria-live', 'assertive');
    liveRegion.setAttribute('aria-atomic', 'true');
    
    document.body.appendChild(liveRegion);
    return liveRegion;
  }
  
  optimizeMobileKeyboards() {
    // Set appropriate input modes for mobile keyboards
    const phoneInputs = this.form.querySelectorAll('input[type="tel"]');
    phoneInputs.forEach(input => {
      input.setAttribute('inputmode', 'tel');
    });
    
    const numericInputs = this.form.querySelectorAll('input[pattern*="[0-9]"]');
    numericInputs.forEach(input => {
      input.setAttribute('inputmode', 'numeric');
    });
    
    const emailInputs = this.form.querySelectorAll('input[type="email"]');
    emailInputs.forEach(input => {
      input.setAttribute('inputmode', 'email');
    });
  }
  
  focusNextField(currentField) {
    const formElements = Array.from(this.form.elements);
    const currentIndex = formElements.indexOf(currentField);
    
    if (currentIndex < formElements.length - 1) {
      const nextElement = formElements[currentIndex + 1];
      if (nextElement.type !== 'hidden' && !nextElement.disabled) {
        setTimeout(() => {
          nextElement.focus();
        }, 100);
      }
    }
  }
}

// Initialize mobile form validation
document.addEventListener('DOMContentLoaded', () => {
  new MobileFormValidator('.mobile-government-form');
});
```

---

## 6. Offline and Low-Connectivity Accessibility

### 6.1 Progressive Web App Accessibility

#### Offline Service Worker with Accessibility
```javascript
// Service Worker for offline accessibility
const CACHE_NAME = 'sudan-gov-accessible-v1';
const ESSENTIAL_RESOURCES = [
  '/css/mobile-critical.css',
  '/css/accessibility.css',
  '/fonts/NotoSansArabic-Regular.woff2',
  '/fonts/Inter-Regular.woff2',
  '/js/accessibility-core.js',
  '/offline.html',
  '/emergency-offline.html',
  '/images/sudan-flag.svg',
  '/'
];

// Install service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(ESSENTIAL_RESOURCES);
      })
  );
});

// Fetch with offline fallback
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached resource if available
        if (response) {
          return response;
        }
        
        // Try network request
        return fetch(event.request)
          .then((response) => {
            // Cache successful responses
            if (response.status === 200) {
              const responseClone = response.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseClone);
                });
            }
            return response;
          })
          .catch(() => {
            // Offline fallback
            if (event.request.destination === 'document') {
              return caches.match('/offline.html');
            }
            
            // Emergency services fallback
            if (event.request.url.includes('/emergency')) {
              return caches.match('/emergency-offline.html');
            }
            
            // Generic fallback
            return new Response('Offline - الاتصال منقطع', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});
```

#### Offline Accessible Interface
```html
<!-- Offline page with full accessibility -->
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>غير متصل - Offline | Sudan Government Services</title>
  <style>
    /* Critical offline CSS */
    body {
      font-family: 'Noto Sans Arabic', Arial, sans-serif;
      margin: 0;
      padding: 20px;
      background: #f8fafc;
      color: #1a1a1a;
      font-size: 18px;
      line-height: 1.6;
    }
    
    .offline-container {
      max-width: 600px;
      margin: 0 auto;
      text-align: center;
      padding: 40px 20px;
    }
    
    .offline-icon {
      font-size: 80px;
      margin-bottom: 20px;
      opacity: 0.7;
    }
    
    .offline-title {
      font-size: 32px;
      font-weight: bold;
      margin-bottom: 16px;
      color: #CE1126;
    }
    
    .offline-description {
      font-size: 20px;
      margin-bottom: 32px;
      color: #4a5568;
    }
    
    .offline-actions {
      margin-top: 40px;
    }
    
    .offline-button {
      display: inline-block;
      background: #CE1126;
      color: white;
      padding: 16px 32px;
      border-radius: 8px;
      text-decoration: none;
      font-size: 18px;
      font-weight: 600;
      margin: 8px;
      min-width: 48px;
      min-height: 48px;
      border: 2px solid transparent;
    }
    
    .offline-button:hover,
    .offline-button:focus {
      background: #B91C3C;
      border-color: #000;
      outline: 3px solid #CE1126;
      outline-offset: 2px;
    }
    
    .emergency-section {
      background: #FEE2E2;
      border: 3px solid #DC2626;
      border-radius: 12px;
      padding: 24px;
      margin-top: 40px;
      text-align: right;
    }
    
    .emergency-title {
      color: #DC2626;
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 16px;
    }
    
    .emergency-number {
      font-size: 32px;
      font-weight: bold;
      color: #DC2626;
      margin: 8px 0;
    }
    
    @media (prefers-contrast: high) {
      .offline-button {
        background: white;
        color: black;
        border: 3px solid black;
      }
      
      .offline-button:hover,
      .offline-button:focus {
        background: black;
        color: white;
      }
    }
  </style>
</head>
<body>
  
  <!-- Skip navigation -->
  <a href="#main-content" class="sr-only">تخطى إلى المحتوى الرئيسي</a>
  
  <main id="main-content" class="offline-container" role="main">
    
    <!-- Offline status -->
    <div class="offline-status" role="alert" aria-live="assertive">
      <div class="offline-icon" aria-hidden="true">📵</div>
      
      <h1 class="offline-title">غير متصل بالإنترنت</h1>
      <h2 class="offline-title" lang="en">You're Offline</h2>
      
      <p class="offline-description">
        يبدو أن اتصالك بالإنترنت منقطع. يمكنك الوصول للخدمات الأساسية أدناه.
      </p>
      <p class="offline-description" lang="en">
        It seems your internet connection is unavailable. You can access essential services below.
      </p>
    </div>
    
    <!-- Available offline actions -->
    <div class="offline-actions" role="group" aria-labelledby="actions-title">
      <h2 id="actions-title">الخدمات المتاحة بدون إنترنت</h2>
      
      <a href="/offline-forms" class="offline-button">
        عرض النماذج المحفوظة
      </a>
      
      <a href="/saved-documents" class="offline-button">
        الوثائق المحفوظة
      </a>
      
      <button class="offline-button" onclick="retryConnection()">
        إعادة المحاولة
      </button>
    </div>
    
    <!-- Emergency services section -->
    <section class="emergency-section" role="region" aria-labelledby="emergency-title">
      <h2 id="emergency-title" class="emergency-title">
        خدمات الطوارئ - Emergency Services
      </h2>
      
      <p>
        إذا كنت تحتاج لخدمات الطوارئ، يمكنك الاتصال مباشرة:
        <br>
        If you need emergency services, you can call directly:
      </p>
      
      <div class="emergency-numbers">
        <div class="emergency-item">
          <strong>الإسعاف - Ambulance:</strong>
          <a href="tel:999" class="emergency-number">999</a>
        </div>
        
        <div class="emergency-item">
          <strong>الشرطة - Police:</strong>
          <a href="tel:997" class="emergency-number">997</a>
        </div>
        
        <div class="emergency-item">
          <strong>الإطفاء - Fire:</strong>
          <a href="tel:998" class="emergency-number">998</a>
        </div>
      </div>
    </section>
    
    <!-- Connectivity status -->
    <div id="connectivity-status" 
         class="connectivity-status" 
         role="status" 
         aria-live="polite">
    </div>
  </main>
  
  <script>
    // Offline functionality
    function retryConnection() {
      // Show loading state
      const button = event.target;
      button.textContent = 'جاري المحاولة...';
      button.disabled = true;
      
      // Attempt to reload
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
    
    // Monitor connectivity
    function updateConnectivityStatus() {
      const statusElement = document.getElementById('connectivity-status');
      
      if (navigator.onLine) {
        statusElement.textContent = 'الاتصال متاح - Connection available';
        statusElement.className = 'connectivity-status online';
        
        // Auto-refresh when online
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      } else {
        statusElement.textContent = 'لا يوجد اتصال بالإنترنت - No internet connection';
        statusElement.className = 'connectivity-status offline';
      }
    }
    
    // Listen for connectivity changes
    window.addEventListener('online', updateConnectivityStatus);
    window.addEventListener('offline', updateConnectivityStatus);
    
    // Initial status check
    updateConnectivityStatus();
  </script>
</body>
</html>
```

---

## 7. Mobile Emergency Services

### 7.1 Critical Mobile Emergency Interface

#### Emergency Service Optimization for Mobile
```html
<!-- Mobile emergency services with enhanced accessibility -->
<div class="mobile-emergency-container" role="application" aria-labelledby="emergency-title">
  
  <header class="mobile-emergency-header" role="banner">
    <h1 id="emergency-title" class="emergency-title">
      <span class="emergency-icon" aria-hidden="true">🚨</span>
      خدمات الطوارئ
    </h1>
    <p class="emergency-subtitle">
      Sudan Emergency Services - متوفرة ٢٤/٧
    </p>
  </header>
  
  <main class="emergency-main" role="main">
    
    <!-- Location sharing for emergency services -->
    <div class="emergency-location" role="region" aria-labelledby="location-title">
      <h2 id="location-title" class="sr-only">مشاركة الموقع</h2>
      
      <button class="location-share-button touch-target-critical"
              onclick="shareEmergencyLocation()"
              aria-describedby="location-description">
        <span class="location-icon" aria-hidden="true">📍</span>
        <span class="location-text">مشاركة الموقع مع الطوارئ</span>
      </button>
      
      <div id="location-description" class="location-description">
        سيتم مشاركة موقعك الحالي مع خدمات الطوارئ لتقديم المساعدة السريعة
      </div>
      
      <div id="location-status" 
           class="location-status" 
           role="status" 
           aria-live="polite">
      </div>
    </div>
    
    <!-- Emergency service buttons -->
    <div class="emergency-services" role="group" aria-labelledby="services-title">
      <h2 id="services-title" class="sr-only">خدمات الطوارئ المتاحة</h2>
      
      <!-- Medical Emergency -->
      <button class="emergency-service-button medical touch-target-critical"
              onclick="callEmergencyService('medical')"
              aria-describedby="medical-description">
        <div class="service-icon" aria-hidden="true">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="white">
            <path d="M19 8H17.3L15.45 3.55C15.15 2.82 14.47 2.31 13.69 2.31H10.31C9.53 2.31 8.85 2.82 8.55 3.55L6.7 8H5C3.9 8 3 8.9 3 10V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V10C21 8.9 20.1 8 19 8Z"/>
          </svg>
        </div>
        
        <div class="service-content">
          <h3 class="service-title">طوارئ طبية</h3>
          <p class="service-subtitle">Medical Emergency</p>
        </div>
        
        <div class="service-number">999</div>
      </button>
      <div id="medical-description" class="service-description">
        اتصال مباشر بخدمات الإسعاف والطوارئ الطبية
      </div>
      
      <!-- Police Emergency -->
      <button class="emergency-service-button police touch-target-critical"
              onclick="callEmergencyService('police')"
              aria-describedby="police-description">
        <div class="service-icon" aria-hidden="true">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="white">
            <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1Z"/>
          </svg>
        </div>
        
        <div class="service-content">
          <h3 class="service-title">شرطة الطوارئ</h3>
          <p class="service-subtitle">Police Emergency</p>
        </div>
        
        <div class="service-number">997</div>
      </button>
      <div id="police-description" class="service-description">
        الإبلاغ عن الجرائم وطلب المساعدة الأمنية العاجلة
      </div>
      
      <!-- Fire Emergency -->
      <button class="emergency-service-button fire touch-target-critical"
              onclick="callEmergencyService('fire')"
              aria-describedby="fire-description">
        <div class="service-icon" aria-hidden="true">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="white">
            <path d="M12 23C7.58 23 4 19.42 4 15C4 12.54 5.5 10.5 7.5 9.5C8.33 6.5 11 4 14.33 4C14.33 4 14.33 4 14.33 4C17.5 4 20.08 6.58 20.08 9.75C20.08 10.92 19.75 12 19.17 12.92C21.33 13.5 23 15.5 23 17.83C23 20.5 20.83 22.67 18.17 22.67H12Z"/>
          </svg>
        </div>
        
        <div class="service-content">
          <h3 class="service-title">إطفاء الحريق</h3>
          <p class="service-subtitle">Fire Department</p>
        </div>
        
        <div class="service-number">998</div>
      </button>
      <div id="fire-description" class="service-description">
        الإبلاغ عن الحرائق وطلب خدمات الإطفاء
      </div>
    </div>
    
    <!-- SMS Emergency Service -->
    <div class="sms-emergency" role="region" aria-labelledby="sms-title">
      <h2 id="sms-title">خدمة الطوارئ عبر الرسائل</h2>
      
      <div class="sms-content">
        <p>إذا لم تتمكن من الاتصال، أرسل رسالة نصية:</p>
        <p>If you cannot make a call, send SMS:</p>
        
        <button class="sms-button touch-target"
                onclick="sendEmergencySMS()"
                aria-describedby="sms-description">
          <span class="sms-icon" aria-hidden="true">💬</span>
          إرسال رسالة طوارئ
        </button>
        
        <div id="sms-description" class="sms-description">
          سيتم إرسال رسالة تحتوي على معلومات الطوارئ وموقعك
        </div>
      </div>
    </div>
  </main>
  
  <!-- Emergency status announcements -->
  <div id="emergency-announcements" 
       class="sr-only" 
       aria-live="assertive" 
       aria-atomic="true" 
       role="alert">
  </div>
</div>
```

---

## 8. Testing and Validation

### 8.1 Mobile Accessibility Testing Protocol

#### Comprehensive Mobile Testing Framework
```javascript
// Mobile accessibility testing suite
const MobileAccessibilityTester = {
  
  // Test touch target sizes
  testTouchTargets: () => {
    const touchTargets = document.querySelectorAll('button, a, input, select, textarea');
    const results = [];
    
    touchTargets.forEach(target => {
      const rect = target.getBoundingClientRect();
      const size = Math.min(rect.width, rect.height);
      
      results.push({
        element: target,
        size: size,
        meets44px: size >= 44,
        meets48px: size >= 48,
        isAccessible: size >= 44
      });
    });
    
    return results;
  },
  
  // Test mobile screen reader compatibility
  testScreenReaderContent: () => {
    const results = {
      headingsStructure: this.validateHeadingStructure(),
      ariaLabels: this.validateAriaLabels(),
      landmarks: this.validateLandmarks(),
      liveRegions: this.validateLiveRegions()
    };
    
    return results;
  },
  
  // Test mobile keyboard navigation
  testMobileKeyboardNav: () => {
    const focusableElements = document.querySelectorAll(
      'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const results = [];
    
    focusableElements.forEach((element, index) => {
      results.push({
        element: element,
        tabIndex: element.tabIndex,
        isKeyboardAccessible: element.tabIndex >= 0,
        hasVisibleFocus: this.hasVisibleFocusIndicator(element)
      });
    });
    
    return results;
  },
  
  // Test mobile gesture alternatives
  testGestureAlternatives: () => {
    const gestureElements = document.querySelectorAll('[data-gesture]');
    const results = [];
    
    gestureElements.forEach(element => {
      const hasKeyboardAlternative = element.hasAttribute('onkeydown') || 
                                    element.hasAttribute('onclick');
      
      results.push({
        element: element,
        gesture: element.getAttribute('data-gesture'),
        hasAlternative: hasKeyboardAlternative,
        isAccessible: hasKeyboardAlternative
      });
    });
    
    return results;
  },
  
  // Validate heading structure
  validateHeadingStructure: () => {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let previousLevel = 0;
    const errors = [];
    
    headings.forEach(heading => {
      const level = parseInt(heading.tagName.charAt(1));
      
      if (level > previousLevel + 1) {
        errors.push({
          heading: heading,
          level: level,
          previousLevel: previousLevel,
          error: 'Heading level skipped'
        });
      }
      
      previousLevel = level;
    });
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  },
  
  // Validate ARIA labels
  validateAriaLabels: () => {
    const elementsNeedingLabels = document.querySelectorAll('button, input, select, textarea');
    const errors = [];
    
    elementsNeedingLabels.forEach(element => {
      const hasLabel = element.hasAttribute('aria-label') ||
                      element.hasAttribute('aria-labelledby') ||
                      document.querySelector(`label[for="${element.id}"]`) ||
                      element.closest('label');
      
      if (!hasLabel && element.type !== 'hidden') {
        errors.push({
          element: element,
          error: 'Missing accessible label'
        });
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  },
  
  // Check for visible focus indicators
  hasVisibleFocusIndicator: (element) => {
    element.focus();
    const computedStyle = getComputedStyle(element);
    
    const hasOutline = computedStyle.outline !== 'none' && 
                      computedStyle.outline !== '0px';
    const hasBoxShadow = computedStyle.boxShadow !== 'none';
    const hasVisibleFocus = hasOutline || hasBoxShadow;
    
    element.blur();
    return hasVisibleFocus;
  },
  
  // Run complete mobile accessibility audit
  runCompleteAudit: () => {
    console.log('Running Mobile Accessibility Audit...');
    
    const results = {
      touchTargets: this.testTouchTargets(),
      screenReader: this.testScreenReaderContent(),
      keyboard: this.testMobileKeyboardNav(),
      gestures: this.testGestureAlternatives(),
      timestamp: new Date().toISOString()
    };
    
    // Generate report
    this.generateReport(results);
    
    return results;
  },
  
  // Generate accessibility report
  generateReport: (results) => {
    let report = 'Mobile Accessibility Audit Report\n';
    report += '=====================================\n\n';
    
    // Touch targets report
    const failedTouchTargets = results.touchTargets.filter(t => !t.isAccessible);
    report += `Touch Targets: ${failedTouchTargets.length} issues found\n`;
    
    failedTouchTargets.forEach(target => {
      report += `- Element with size ${target.size.toFixed(1)}px (minimum 44px required)\n`;
    });
    
    // Screen reader report
    report += `\nScreen Reader Compatibility:\n`;
    report += `- Heading structure: ${results.screenReader.headingsStructure.isValid ? 'PASS' : 'FAIL'}\n`;
    report += `- ARIA labels: ${results.screenReader.ariaLabels.isValid ? 'PASS' : 'FAIL'}\n`;
    
    // Keyboard navigation report
    const keyboardIssues = results.keyboard.filter(k => !k.isKeyboardAccessible);
    report += `\nKeyboard Navigation: ${keyboardIssues.length} issues found\n`;
    
    console.log(report);
    
    // Store report for download
    this.storeReport(report);
  },
  
  storeReport: (report) => {
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = 'mobile-accessibility-audit.txt';
    downloadLink.textContent = 'Download Accessibility Report';
    downloadLink.style.display = 'none';
    
    document.body.appendChild(downloadLink);
    
    // Auto-remove after potential download
    setTimeout(() => {
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(url);
    }, 5000);
  }
};

// Device-specific testing
const DeviceSpecificTester = {
  
  // Test on actual mobile devices
  testOnDevice: (deviceInfo) => {
    const results = {
      device: deviceInfo,
      userAgent: navigator.userAgent,
      screenSize: {
        width: screen.width,
        height: screen.height,
        orientation: screen.orientation?.type || 'unknown'
      },
      touchSupport: 'ontouchstart' in window,
      accessibilityFeatures: this.detectAccessibilityFeatures()
    };
    
    return results;
  },
  
  // Detect device accessibility features
  detectAccessibilityFeatures: () => {
    const features = {
      voiceOver: /iPhone|iPad|iPod/.test(navigator.userAgent) && 'speechSynthesis' in window,
      talkBack: /Android/.test(navigator.userAgent) && 'speechSynthesis' in window,
      highContrast: matchMedia('(prefers-contrast: high)').matches,
      reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
      darkMode: matchMedia('(prefers-color-scheme: dark)').matches
    };
    
    return features;
  }
};

// Initialize testing on page load
document.addEventListener('DOMContentLoaded', () => {
  // Run audit after page is fully loaded
  setTimeout(() => {
    if (window.location.search.includes('audit=true')) {
      MobileAccessibilityTester.runCompleteAudit();
    }
  }, 2000);
});
```

### 8.2 User Testing with Disabled Users

#### Mobile User Testing Protocol
```markdown
## Mobile Accessibility User Testing Protocol

### Test Participants
- **Visual Impairments**: VoiceOver (iOS) and TalkBack (Android) users
- **Motor Impairments**: Users with limited hand mobility using mobile devices
- **Cognitive Disabilities**: Users with learning difficulties using mobile services
- **Elderly Users**: Senior citizens accessing government services via mobile
- **Low Digital Literacy**: Users with limited smartphone experience

### Testing Scenarios

#### Scenario 1: Passport Renewal on Mobile
**Device**: Personal smartphone
**Assistive Technology**: Screen reader if applicable
**Task**: Complete passport renewal application using mobile interface
**Success Criteria**:
- Complete application in under 20 minutes
- All form fields properly labeled and accessible
- Document upload successful
- Payment process accessible
- Confirmation received and understood

#### Scenario 2: Emergency Service Access
**Device**: Any mobile device
**Context**: High-stress emergency situation simulation
**Task**: Access emergency medical services
**Success Criteria**:
- Service accessible within 3 taps/touches
- Emergency call initiated successfully
- Location sharing works if requested
- Alternative contact methods available

#### Scenario 3: Offline Service Access
**Device**: Mobile with limited connectivity
**Context**: Area with poor internet connection
**Task**: Access essential government information offline
**Success Criteria**:
- Basic services available without internet
- Critical contact information accessible
- Forms can be completed and saved offline
- Clear indication of offline status

### Testing Metrics
- **Task Completion Rate**: Percentage of users completing tasks successfully
- **Time to Completion**: Average time to complete each task
- **Error Recovery**: Ability to recover from mistakes or technical issues
- **Satisfaction Rating**: User satisfaction score (1-5 scale)
- **Accessibility Barriers**: Specific barriers encountered by each user type

### Post-Testing Interviews
1. What was most challenging about using the mobile interface?
2. Which accessibility features were most helpful?
3. What improvements would make the biggest difference?
4. How does this compare to other government services you've used?
5. Would you recommend this service to others with similar needs?
```

---

## Conclusion

These comprehensive mobile accessibility requirements ensure that Sudan's 80% mobile-first citizens receive world-class, inclusive government digital services. By implementing these standards, Sudan establishes itself as a global leader in mobile government accessibility, serving all citizens regardless of their abilities, device limitations, or connectivity constraints.

Key achievements of this framework:
- **Universal Access**: Services that work on all mobile devices and connection speeds
- **Assistive Technology Support**: Full compatibility with screen readers and mobile accessibility tools
- **Cultural Sensitivity**: Bilingual interfaces that respect local customs and preferences
- **Emergency Preparedness**: Critical services accessible even in challenging conditions
- **Performance Optimization**: Fast, efficient services designed for limited data plans

This mobile accessibility framework creates truly inclusive digital government services that empower all Sudanese citizens to access essential government services with dignity and independence.