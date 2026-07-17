// ============================================================
// GLOBAL EVENT HANDLERS — Accessible from all inline onclick attributes
// These are defined BEFORE window.APP so they are always available
// ============================================================

// Password toggle (login screen)
window.togglePasswordGlobal = function() {
  const passInput = document.getElementById("loginPass");
  if (!passInput) return;
  const eyeIcon = document.querySelector(".toggle-password .icon-eye");
  const eyeOffIcon = document.querySelector(".toggle-password .icon-eye-off");
  if (passInput.type === "password") {
    passInput.type = "text";
    if (eyeIcon) eyeIcon.style.display = "none";
    if (eyeOffIcon) eyeOffIcon.style.display = "block";
  } else {
    passInput.type = "password";
    if (eyeIcon) eyeIcon.style.display = "block";
    if (eyeOffIcon) eyeOffIcon.style.display = "none";
  }
};

// Sidebar toggle (mobile)
window.toggleSidebarGlobal = function() {
  const sidebar = document.querySelector(".sidebar");
  const backdrop = document.getElementById("sidebarBackdrop");
  if (sidebar) sidebar.classList.toggle("open");
  if (backdrop) backdrop.classList.toggle("active");
};

// Sidebar backdrop click
window.sidebarBackdropClick = function() {
  window.toggleSidebarGlobal();
};

// ============================================================
// window.APP — Main Application (IIFE)
// ============================================================

/* ============================================================
   سيلين - التطبيق الرئيسي
   - التنقل بين الوحدات
   - إدارة الشاشات
   ============================================================ */

window.APP = (function () {
  window.APP_VERSION = 'v20.3';
  let currentUser = null;
  let currentModule = "dashboard";
  let db = null;

  // --- تهيئة الواجهة ---
  function init() {
    DB.init();
    db = DB.load();

    // ============ Auto-Update Check ============
    checkForUpdates();

    const session = DB.getSession();
    if (session) {
      currentUser = session;
      showMainApp();
    } else {
      showLogin();
    }
  }

  // التحقق من التحديثات تلقائياً
  let updateCheckInterval = null;
  function checkForUpdates() {
    // تحقق فوري
    performUpdateCheck();
    // تحقق كل دقيقتين
    if (updateCheckInterval) clearInterval(updateCheckInterval);
    updateCheckInterval = setInterval(performUpdateCheck, 2 * 60 * 1000);
  }

  function performUpdateCheck() {
    // جلب رقم الإصدار من السيرفر (يتجاوز الكاش)
    fetch('/version.json?t=' + Date.now())
      .then(r => r.ok ? r.json() : null)
      .then(remote => {
        if (!remote) return;
        const current = window.APP_VERSION || 'unknown';
        if (remote.version && remote.version !== current) {
          showUpdateBanner(remote);
        }
      })
      .catch(() => {});
  }

  function showUpdateBanner(remote) {
    // لا تعرض الشريط مرتين
    if (document.getElementById('pwaUpdateBanner')) return;
    const banner = document.createElement('div');
    banner.id = 'pwaUpdateBanner';
    banner.style.cssText = 'position:fixed;top:0;left:0;right:0;background:linear-gradient(135deg,#2d9d5c,#1e7d4a);color:white;padding:14px 20px;text-align:center;z-index:99999;font-weight:600;box-shadow:0 4px 20px rgba(0,0,0,0.3);cursor:pointer;font-family:Cairo,sans-serif;display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap';
    banner.innerHTML = `
      <span style="font-size:20px">🔄</span>
      <span>يوجد تحديث جديد <b>${remote.version}</b> - ${remote.message || 'تحسينات وأسماء محدثة'}</span>
      <button id="applyUpdateBtn" style="background:white;color:#1e2d4f;border:none;padding:6px 16px;border-radius:8px;font-weight:700;cursor:pointer;font-family:inherit;margin-right:12px">تحديث الآن</button>
      <button id="dismissUpdateBtn" style="background:transparent;color:white;border:1px solid rgba(255,255,255,0.5);padding:6px 12px;border-radius:8px;cursor:pointer;font-family:inherit">لاحقاً</button>
    `;
    document.body.appendChild(banner);
    document.body.style.paddingTop = '64px';
    document.getElementById('applyUpdateBtn').onclick = () => {
      localStorage.clear();
      location.href = '/?v=' + Date.now();
    };
    document.getElementById('dismissUpdateBtn').onclick = () => {
      banner.remove();
      document.body.style.paddingTop = '';
    };
  }

  function showLogin() {
    document.body.innerHTML = `
      <div class="login-screen">
        <div class="login-card">
          <div class="login-logo-frame">
            <img src="logo.png" alt="سيلين" />
          </div>
          <h1>مصنع سيلين للمياه المعدنية والمرطبات</h1>
          <p class="subtitle">الجمهورية اليمنية - البيضاء | ${db.meta.year}</p>
          <div class="login-engineer-credit">تصميم وتطوير: <b>${db.meta.copyright}</b><br><span>${db.meta.role}</span></div>
          <div class="login-error" id="loginError">بيانات الدخول غير صحيحة</div>
          <div class="form-group">
            <label>اسم المستخدم</label>
            <input type="text" id="loginUser" placeholder="" autocomplete="username" autofocus />
          </div>
          <div class="form-group">
            <label>كلمة المرور</label>
            <div class="password-wrapper">
              <input type="password" id="loginPass" placeholder="" autocomplete="current-password" />
              <button type="button" class="toggle-password" id="togglePassBtn" onclick="window.togglePasswordGlobal()" aria-label="إظهار/إخفاء كلمة المرور">
                <svg class="icon-eye" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                <svg class="icon-eye-off" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:none"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              </button>
            </div>
          </div>
          <button class="login-btn" id="loginBtnReal" onclick="window.APP && window.APP.doLogin();">
            <span id="loginBtnText">تسجيل الدخول</span>
          </button>
          <div class="login-version-tag">v18.53 - PWA Enabled</div>
        </div>
      </div>
    `;
    document.getElementById("loginPass").addEventListener("keypress", e => {
      if (e.key === "Enter") doLogin();
    });
  }

  // Toggle password visibility
  function togglePassword() {
    const passInput = document.getElementById("loginPass");
    const eyeIcon = document.querySelector(".toggle-password .icon-eye");
    const eyeOffIcon = document.querySelector(".toggle-password .icon-eye-off");
    if (passInput.type === "password") {
      passInput.type = "text";
      eyeIcon.style.display = "none";
      eyeOffIcon.style.display = "block";
    } else {
      passInput.type = "password";
      eyeIcon.style.display = "block";
      eyeOffIcon.style.display = "none";
    }
  }

// Make globally accessible from anywhere
  function doLogin() {
    const username = document.getElementById("loginUser").value.trim();
    const password = document.getElementById("loginPass").value;
    if (!username || !password) {
      const err = document.getElementById("loginError");
      err.textContent = "الرجاء إدخال اسم المستخدم وكلمة المرور";
      err.style.display = "block";
      return;
    }
    if (!db || !db.users) {
      alert("خطأ: قاعدة البيانات غير متوفرة. يرجى تحديث الصفحة.");
      return;
    }
    const user = db.users.find(u => u.username === username && u.password === password && u.active);
    if (!user) {
      const err = document.getElementById("loginError");
      err.style.display = "block";
      return;
    }
    currentUser = user;
    DB.setSession(user);
    showMainApp();
  }

  function logout() {
    DB.clearSession();
    currentUser = null;
    showLogin();
  }

  function getCurrentUser() {
    return currentUser;
  }

  // --- Toggle Sidebar (Mobile) ---
  function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const backdrop = document.getElementById('sidebarBackdrop');
    if (sidebar) sidebar.classList.toggle('open');
    if (backdrop) backdrop.classList.toggle('active');
  }

  // --- PWA Install ---
  let deferredInstallPrompt = null;
  let isPwaInstalled = false;

  // استماع لحدث التثبيت (متصفح Chrome/Edge/Android)
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    showInstallButton();
  });

  // تطبيق تم تثبيته
  window.addEventListener('appinstalled', () => {
    isPwaInstalled = true;
    hideInstallButton();
    showToast('تم تحميل التطبيق بنجاح! ✓ يمكنك الآن فتحه من شاشتك الرئيسية', 'success');
    deferredInstallPrompt = null;
  });

  function showInstallButton() {
    const btn = document.getElementById('installPwaBtn');
    if (btn && !isPwaInstalled) {
      btn.style.display = 'inline-flex';
      btn.classList.add('pulse-anim');
    }
  }

  function hideInstallButton() {
    const btn = document.getElementById('installPwaBtn');
    if (btn) {
      btn.style.display = 'none';
      btn.classList.remove('pulse-anim');
    }
  }

  function installPWA() {
    if (!deferredInstallPrompt) {
      // دليل يدوي في حال لم يطلق المتصفح الحدث
      showManualInstallGuide();
      return;
    }
    deferredInstallPrompt.prompt();
    deferredInstallPrompt.userChoice.then((choice) => {
      if (choice.outcome === 'accepted') {
        showToast('جاري تثبيت التطبيق...', 'info');
      } else {
        showToast('يمكنك التحميل لاحقاً', 'info');
      }
      deferredInstallPrompt = null;
    });
  }

  function showManualInstallGuide() {
    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
    const isMac = /Mac/.test(navigator.userAgent) && !/iPhone|iPad/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    const isWin = /Windows/.test(navigator.userAgent);

    let html = '';
    if (isIOS) {
      html = `
        <h3>${Icons.render('phone')} تحميل التطبيق على iPhone/iPad</h3>
        <ol style="text-align:right;line-height:2">
          <li>اضغط على أيقونة <b>المشاركة</b> ${Icons.render('share')} في الأسفل</li>
          <li>اختر <b>"إضافة إلى الشاشة الرئيسية"</b> ${Icons.render('plus')}</li>
          <li>اضغط <b>"إضافة"</b> في الأعلى</li>
          <li>التطبيق سيظهر على شاشتك الرئيسية كتطبيق أصلي</li>
        </ol>
      `;
    } else if (isAndroid) {
      html = `
        <h3>${Icons.render('phone')} تحميل التطبيق على Android</h3>
        <ol style="text-align:right;line-height:2">
          <li>اضغط على <b>القائمة ⋮</b> في الأعلى</li>
          <li>اختر <b>"تثبيت التطبيق"</b> أو <b>"إضافة إلى الشاشة الرئيسية"</b></li>
          <li>اتبع التعليمات</li>
        </ol>
      `;
    } else if (isWin || isMac) {
      html = `
        <h3>${Icons.render('monitor')} تحميل التطبيق على ${isWin ? 'Windows' : 'Mac'}</h3>
        <ol style="text-align:right;line-height:2">
          <li>اضغط على أيقونة <b>التثبيت ⬇</b> في شريط العنوان (يمين)</li>
          <li>أو من القائمة: <b>⋮</b> ← <b>"تثبيت مصنع سيلين"</b></li>
          <li>التطبيق سيفتح في نافذة منفصلة ويعمل بدون إنترنت</li>
        </ol>
      `;
    } else {
      html = `
        <h3>${Icons.render('download')} تحميل التطبيق</h3>
        <p>استخدم خيار "إضافة إلى الشاشة الرئيسية" من قائمة المتصفح</p>
      `;
    }

    // كشف iOS
    const isInStandaloneMode = window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches;
    if (isInStandaloneMode) {
      html = `
        <h3>${Icons.render('check')} التطبيق مُثبّت بالفعل!</h3>
        <p>أنت تستخدم التطبيق المثبّت. كل الميزات تعمل بدون إنترنت.</p>
      `;
    }

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-box" style="max-width:500px">
        <button class="modal-close" onclick="this.closest('.modal-overlay').remove();">${Icons.render('x')}</button>
        ${html}
        <div class="alert alert-info" style="margin-top:16px">
          <span>${Icons.render('info')}</span>
          <span><b>مميزات التطبيق المُثبّت:</b> يعمل بدون إنترنت، أيقونة على الشاشة، شاشة كاملة، إشعارات</span>
        </div>
        <div style="text-align:center;margin-top:16px">
          <button class="btn btn-primary" onclick="this.closest('.modal-overlay').remove();">${Icons.render('check')} فهمت</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = 'pwa-toast pwa-toast-' + type;
    toast.innerHTML = `<span>${message}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // كشف إذا كان التطبيق يعمل في وضع standalone
  if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
    isPwaInstalled = true;
  }


  // --- نظام التصدير الموحد ---
  function showExportMenu(e) {
    e.stopPropagation();
    const menu = document.getElementById("exportMenu");
    menu.style.display = menu.style.display === "none" ? "block" : "none";
  }

  function doExport(type) {
    document.getElementById("exportMenu").style.display = "none";
    const exporters = Exports.getExporters(currentModule);
    if (!exporters) {
      // Should not happen: navigate() hides the export bar for pages without exporters
      alert("تنبيه: لا توجد دالة تصدير مسجلة لهذه الصفحة");
      return;
    }
    const fn = exporters[type];
    if (!fn) {
      alert(`تنبيه: التصدير بصيغة ${type} غير مدعوم في هذه الصفحة`);
      return;
    }
    try {
      fn();
    } catch (err) {
      alert("خطأ خطأ في التصدير: " + err.message);
      console.error(err);
    }
  }

  // Helper: show/hide the export bar based on whether the current module has exporters
  function syncExportBar() {
    const bar = document.getElementById('exportBar');
    if (!bar) return;
    const hasExporters = !!Exports.getExporters(currentModule);
    bar.style.display = hasExporters ? '' : 'none';
  }

  // --- الهيكل الرئيسي للتطبيق ---
  function showMainApp() {
    document.body.innerHTML = `
      <div class="app">
        <div class="sidebar-backdrop" id="sidebarBackdrop" onclick="window.toggleSidebarGlobal();"></div>
        <aside class="sidebar">
          <div class="brand">
            <img src="logo.png" alt="سيلين" />
            <h2>سيلين</h2>
            <p>${currentUser.name}</p>
            <span class="role-tag">${roleLabel(currentUser.role)}</span>
          </div>
          <div id="navMenu"></div>
        </aside>
        <div class="main">
          <header class="topbar">
            <button class="menu-toggle" id="menuToggleBtn" onclick="window.toggleSidebarGlobal();" aria-label="القائمة" title="القائمة">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <div class="page-title" id="pageTitle">لوحة التحكم</div>
            <div class="user-info">
              <button class="install-pwa-btn" id="installPwaBtn" style="display:none" onclick="window.APP && window.APP.installPWA();" title="تحميل التطبيق على الجهاز">
                ${Icons.render('download')} <span class="install-text">تحميل التطبيق</span>
              </button>
              <div class="export-bar" id="exportBar">
                <button class="btn-export" onclick="window.APP && window.APP.showExportMenu(event);" title="تصدير التقرير الحالي">
                  ${Icons.render('download')} تصدير <span style="margin-right:4px">▾</span>
                </button>
                <div class="export-menu" id="exportMenu" style="display:none">
                  <button onclick="window.APP && window.APP.doExport('pdf');">${Icons.render('pdf')} PDF</button>
                  <button onclick="window.APP && window.APP.doExport('excel');">${Icons.render('excel')} Excel</button>
                  <button onclick="window.APP && window.APP.doExport('csv');">${Icons.render('csv')} CSV</button>
                  <button onclick="window.APP && window.APP.doExport('json');">${Icons.render('json')} JSON</button>
                  <button onclick="window.APP && window.APP.doExport('print');">${Icons.render('print')} طباعة</button>
                </div>
              </div>
              <div class="details">
                <b>${currentUser.name}</b><br>
                <span>${roleLabel(currentUser.role)} | ${currentUser.empId}</span>
              </div>
              <div class="avatar" onclick="window.APP && window.APP.navigate('profile');" style="cursor:pointer" title="ملفي الشخصي">${currentUser.name.charAt(0)}</div>
              <button class="logout-btn" onclick="window.APP && window.APP.logout();">${Icons.render('logout')} خروج</button>
            </div>
          </header>
          <div class="self-service-bar" id="selfServiceBar" style="display:flex;align-items:center;gap:6px;padding:8px 16px;background:var(--bg-darker);border-bottom:1px solid var(--border);flex-wrap:wrap;font-size:13px;overflow-x:auto">
            <span style="font-weight:700;color:var(--primary);white-space:nowrap;margin-left:6px">خدمتي:</span>
            <a href="#" onclick="window.APP && window.APP.navigate('myDashboard');return false;" style="display:flex;align-items:center;gap:4px;padding:4px 10px;background:var(--bg-card);border-radius:16px;text-decoration:none;color:var(--text);border:1px solid var(--border)">${Icons.render('layout')} لوحة التحكم</a>
            <a href="#" onclick="window.APP && window.APP.navigate('salarySlip');return false;" style="display:flex;align-items:center;gap:4px;padding:4px 10px;background:var(--bg-card);border-radius:16px;text-decoration:none;color:var(--text);border:1px solid var(--border)">${Icons.render('fileText')} كشف الراتب</a>
            <a href="#" onclick="window.APP && window.APP.navigate('myRequests');return false;" style="display:flex;align-items:center;gap:4px;padding:4px 10px;background:var(--bg-card);border-radius:16px;text-decoration:none;color:var(--text);border:1px solid var(--border)">${Icons.render('inbox')} طلباتي</a>
            <a href="#" onclick="window.APP && window.APP.navigate('newRequest');return false;" style="display:flex;align-items:center;gap:4px;padding:4px 10px;background:var(--primary);color:#fff;border-radius:16px;text-decoration:none;font-weight:600">${Icons.render('plus')} طلب جديد</a>
            ${['admin','executive','chairman','hr_manager','production','accountant'].includes(currentUser.role) ? `<a href="#" onclick="window.APP && window.APP.navigate('incomingRequests');return false;" style="display:flex;align-items:center;gap:4px;padding:4px 10px;background:var(--warning);color:#000;border-radius:16px;text-decoration:none;font-weight:600">${Icons.render('incoming')} الطلبات الواردة</a>` : ''}
            <a href="#" onclick="window.APP && window.APP.navigate('profile');return false;" style="display:flex;align-items:center;gap:4px;padding:4px 10px;background:var(--bg-card);border-radius:16px;text-decoration:none;color:var(--text);border:1px solid var(--border)">${Icons.render('user')} ملفي</a>
          </div>
          <main class="content" id="content"></main>
          <footer class="app-footer">
            جميع الحقوق محفوظة © ${db.meta.year} | <b>${db.meta.copyright}</b> - ${db.meta.role} - ${db.meta.location}
          </footer>
        </div>
      </div>
      <nav class="mobile-bottom-nav" id="mobileNav"></nav>
    `;
    renderNav();
    navigate("dashboard");
    // Re-trigger update check so the banner survives the body.innerHTML reset
    setTimeout(() => performUpdateCheck(), 100);
  }

  // --- قائمة التنقل ---
  function roleLabel(role) {
    const m = {
      admin:       "المدير العام",
      executive:   "المدير التنفيذي",
      chairman:    "رئيس مجلس الإدارة",
      hr_manager:  "مدير الموارد البشرية",
      production:  "مدير الإنتاج",
      accountant:  "محاسب",
      sales:       "مندوب مبيعات",
      lab:         "فني مختبر",
      procurement: "مدير المشتريات",
      worker:      "موظف"
    };
    return m[role] || role;
  }

  // Module ID → section group mapping (for navigate accordion)
  const MODULE_GROUP = {
    production: "الإنتاج", lab: "المختبر", inventory: "المخازن", vouchers: "المخازن",
    sales: "المبيعات", agents: "المبيعات", purchaseRequest: "المشتريات", procurement: "المشتريات",
    costs: "المالية", pricing: "المالية", hr: "الموارد البشرية", permissions: "الموارد البشرية",
    terminated: "الموارد البشرية", reports: "التقارير", orgchart: "التقارير", orgtree: "التقارير",
    dashboard: "الإدارة", settings: "الإدارة"
  };

  function renderNav(openGroupOverride) {
    const role = currentUser.role;
    let _openGroup = '';
    window.toggleGroup = function(groupName) {
      if (_openGroup === groupName) {
        _openGroup = '';
        renderNav('');
      } else {
        _openGroup = groupName;
        renderNav(groupName);
      }
    };
    const allModules = [
      // ===============================================
      // 1. الإنتاج
      // ===============================================
      { id: "production",     group: "الإنتاج",            icon: "factory",   label: "خطوط التعبئة والورديات",roles: ["admin","production","accountant"] },
      // ===============================================
      // 2. المختبر
      // ===============================================
      { id: "lab",           group: "المختبر",            icon: "flask",     label: "فحوصات الجودة والتعقيم",roles: ["admin","lab","production"] },
      // ===============================================
      // 3. المخازن
      // ===============================================
      { id: "inventory",     group: "المخازن",            icon: "box",       label: "جرد المواد الخام والمنتجات",roles:["admin","production","accountant","procurement"] },
      { id: "vouchers",      group: "المخازن",            icon: "clipboard", label: "سندات الصرف والإضافة",  roles: ["admin","accountant","production"] },
      // ===============================================
      // 4. المبيعات
      // ===============================================
      { id: "sales",         group: "المبيعات",            icon: "truck",     label: "إدارة العملاء والمناديب", roles: ["admin","sales","accountant"] },
      { id: "agents",        group: "المبيعات",            icon: "handshake", label: "الوكلاء",              roles: ["admin","sales","accountant"] },
      // ===============================================
      // 5. المشتريات
      // ===============================================
      { id: "purchaseRequest",group:"المشتريات",          icon: "cart",      label: "طلبات الشراء",           roles: ["admin","production","procurement","accountant"] },
      { id: "procurement",   group: "المشتريات",          icon: "package",   label: "الموردين والالتزامات",  roles: ["admin","procurement","accountant"] },
      // ===============================================
      // 6. المالية
      // ===============================================
      { id: "costs",         group: "المالية",            icon: "money",     label: "التكاليف الفعلية",       roles: ["admin","accountant","production"] },
      { id: "pricing",       group: "المالية",            icon: "priceTag",  label: "الأسعار",               roles: ["admin","accountant"] },
      // ===============================================
      // 7. الموارد البشرية
      // ===============================================
      { id: "hr",            group: "الموارد البشرية",    icon: "users",     label: "سجل الموظفين",           roles: ["admin","hr_manager"] },
      { id: "permissions",   group: "الموارد البشرية",    icon: "key",       label: "إدارة الصلاحيات",        roles: ["admin","hr_manager"] },
      { id: "terminated",    group: "الموارد البشرية",    icon: "x",         label: "المنتهية عقودهم",        roles: ["admin"] },
      // ===============================================
      // 8. التقارير
      // ===============================================
      { id: "reports",       group: "التقارير",            icon: "report",    label: "اللوحة الشاملة",          roles: ["admin","executive","chairman","accountant","production","lab","procurement"] },
      { id: "orgchart",     group: "التقارير",            icon: "sitemap",   label: "الهيكل التنظيمي",        roles: ["admin","chairman","accountant"] },
      { id: "orgtree",      group: "التقارير",            icon: "gitBranch", label: "الشجرة التفاعلية",        roles: ["admin","chairman","accountant"] },
      // ===============================================
      // 9. الإدارة
      // ===============================================
      { id: "dashboard",     group: "الإدارة",            icon: "dashboard", label: "لوحة التحكم",             roles: ["admin","executive","chairman","accountant"] },
      { id: "settings",      group: "الإدارة",            icon: "settings",  label: "لوحة المطور",             roles: ["admin"] }
    ];

    const grouped = {};
    allModules.forEach(m => {
      if (!m.roles.includes(role)) return;
      if (!grouped[m.group]) grouped[m.group] = [];
      grouped[m.group].push(m);
    });

    const nav = document.getElementById("navMenu");
    const sectionNames = Object.keys(grouped);
    const defaultOpen = sectionNames[0] || '';
    let openGroup = openGroupOverride !== undefined ? openGroupOverride : defaultOpen;

    const chevron = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>`;
    nav.innerHTML = sectionNames.map(g => {
      const isOpen = g === openGroup;
      const items = grouped[g];
      return `
        <div class="nav-group">
          <div class="nav-section-header ${isOpen ? 'open' : ''}" data-group="${g}">
            <span>${g}</span>
            <span class="nav-chevron" style="transform:rotate(${isOpen ? '180deg' : '0deg'});transition:transform 0.2s">${chevron}</span>
          </div>
          <div class="nav-section-items" style="overflow:hidden;max-height:${isOpen ? (items.length * 70) : 0}px;transition:max-height 0.3s ease">
            ${items.map(m => `
              <div class="nav-item ${currentModule === m.id ? 'active' : ''}" data-id="${m.id}" data-group="${g}">
                <span class="icon">${Icons.render(m.icon)}</span>
                <span>${m.label}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }).join('');

    // Mobile bottom nav
    const mobileNav = document.getElementById("mobileNav");
    if (mobileNav) {
      const groupIcons = { 'الإنتاج': 'factory', 'المختبر': 'flask', 'المخازن': 'box', 'المبيعات': 'truck', 'المشتريات': 'cart', 'المالية': 'money', 'الموارد البشرية': 'users', 'التقارير': 'report', 'الإدارة': 'dashboard' };
      mobileNav.innerHTML = sectionNames.map(g => {
        const firstMod = grouped[g][0];
        const isActive = firstMod && firstMod.roles.includes(role);
        return `
          <a href="#" class="mobile-nav-group ${isActive ? 'active' : ''}" data-group="${g}" title="${g}">
            ${Icons.render(groupIcons[g] || 'box')}
            <span style="font-size:10px">${g}</span>
          </a>
        `;
      }).join('');


    }
  }


  function navigate(moduleId) {
    // التحقق من الصلاحيات قبل التنقل
    if (currentUser && !DB.canAccess(currentUser, moduleId)) {
      alert('⛔ ليس لديك صلاحية الوصول إلى هذه الصفحة. سيتم توجيهك إلى لوحة التحكم.');
      moduleId = 'dashboard';
    }
    currentModule = moduleId;
    document.querySelectorAll(".nav-item").forEach(el => el.classList.toggle("active", el.dataset.id === moduleId));
    // Keep accordion open on navigation
    if (typeof renderNav === 'function') {
      const grp = MODULE_GROUP[moduleId];
      if (grp) renderNav(grp);
    }
    const titles = {
      dashboard: "لوحة التحكم - نظرة لحظية",
      production: "خطوط التعبئة والورديات - مؤشرات OEE",
      lab: "فحوصات الجودة والتعقيم",
      inventory: "جرد المواد الخام والمنتجات",
      vouchers: "سندات الصرف والإضافة",
      sales: "إدارة العملاء والمناديب",
      agents: "الوكلاء",
      purchaseRequest: "طلبات الشراء",
      procurement: "الموردين والالتزامات والأولويات",
      costs: "التكاليف الفعلية",
      pricing: "الأسعار",
      hr: "الموارد البشرية",
      permissions: "إدارة الصلاحيات",
      terminated: "الموظفين المنتهية عقودهم",
      reports: "اللوحة الشاملة - تقارير يومية",
      orgchart: "الهيكل التنظيمي",
      orgtree: "الشجرة التفاعلية",
      myDashboard: "لوحة التحكم الشخصية",
      salarySlip: "كشف الراتب الشهري",
      myRequests: "طلباتي",
      newRequest: "تقديم طلب جديد",
      incomingRequests: "الطلبات الواردة",
      settings: "لوحة المطور",
      profile: "ملفي الشخصي"
    };
    document.getElementById("pageTitle").textContent = titles[moduleId] || moduleId;
    // إخفاء/إظهار زر التصدير بحسب توفر دالة التصدير لهذه الصفحة
    syncExportBar();
    // Close sidebar on mobile after navigation
    if (window.innerWidth <= 900) {
      const sb = document.querySelector('.sidebar');
      if (sb) sb.classList.remove('open');
    }
    const content = document.getElementById("content");
    content.innerHTML = `<div class="card"><div class="spinner"></div> جاري التحميل...</div>`;

    // استدعاء وحدة العرض
    setTimeout(() => {
      try {
        if (window.Modules[moduleId]) {
          window.Modules[moduleId](content);
        } else {
          content.innerHTML = `<div class="card"><div class="empty-state"><div class="icon">{Icons.render("settings")}</div><h3>الوحدة قيد التطوير</h3></div></div>`;
        }
      } catch (e) {
        content.innerHTML = `<div class="card"><div class="alert alert-danger">خطأ في تحميل الوحدة: ${e.message}</div></div>`;
        console.error(e);
      }
      // بعد تسجيل الـ exporter داخل الوحدة (إن وُجد)، نعيد ضبط ظهور الزر
      syncExportBar();
    }, 50);
  }

  function getDB() { return DB.load(); }
  function saveDB(d) { DB.save(d); db = d; }
  function getUser() { return currentUser; }

  return { init, navigate, logout, doLogin, getDB, saveDB, getUser, getCurrentUser, showExportMenu, doExport, toggleSidebar, togglePasswordGlobal, installPWA, showManualInstallGuide, syncExportBar };
})();

window.addEventListener("DOMContentLoaded", () => APP.init());

// إغلاق قائمة التصدير عند النقر خارجها
// Modal close delegation — one listener for all modal close buttons
document.addEventListener('click', function(e) {
  if (e.target && e.target.closest && e.target.closest('.modal-close')) {
    e.target.closest('.modal-overlay').remove();
  }
  // Close export menu when clicking outside
  const exportMenu = document.getElementById("exportMenu");
  if (exportMenu && !e.target.closest('.export-bar')) {
    exportMenu.style.display = "none";
  }
});

// Close sidebar when clicking outside (mobile)
document.addEventListener('click', function(e) {
  if (window.innerWidth > 900) return;
  const sidebar = document.querySelector('.sidebar');
  const toggle = document.getElementById("menuToggleBtn");
  if (!sidebar || !toggle) return;
  if (sidebar.classList.contains('open') && !sidebar.contains(e.target) && !toggle.contains(e.target)) {
    sidebar.classList.remove('open');
    const backdrop = document.getElementById("sidebarBackdrop");
    if (backdrop) backdrop.classList.remove("active");
  }
});

// Accordion section headers — delegated event listener
document.addEventListener('click', function(e) {
  // Accordion section header click
  const header = e.target.closest('.nav-section-header');
  if (header && header.dataset.group) {
    if (window.toggleGroup) window.toggleGroup(header.dataset.group);
  }
  // Nav item click
  const navItem = e.target.closest('.nav-item');
  if (navItem && navItem.dataset.id) {
    if (window.APP && window.APP.navigate) window.APP.navigate(navItem.dataset.id);
  }
  // Mobile nav group click
  const mobileNavGroup = e.target.closest('.mobile-nav-group');
  if (mobileNavGroup && mobileNavGroup.dataset.group) {
    const g = mobileNavGroup.dataset.group;
    const sidebar = document.querySelector('.sidebar');
    const backdrop = document.getElementById("sidebarBackdrop");
    if (sidebar) sidebar.classList.add('open');
    if (backdrop) backdrop.classList.add('active');
    if (window.toggleGroup) window.toggleGroup(g);
  }
});
