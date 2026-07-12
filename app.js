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
              <button type="button" class="toggle-password" id="togglePassBtn" onclick="window.togglePasswordGlobal && window.togglePasswordGlobal()" aria-label="إظهار/إخفاء كلمة المرور">
                <svg class="icon-eye" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                <svg class="icon-eye-off" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:none"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              </button>
            </div>
          </div>
          <button class="login-btn" onclick="APP.doLogin()">
            <span id="loginBtnText">تسجيل الدخول</span>
          </button>
          <div class="login-version-tag">v9.0 - PWA Enabled</div>
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

  function doLogin() {
    const username = document.getElementById("loginUser").value.trim();
    const password = document.getElementById("loginPass").value;
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
    if (sidebar) sidebar.classList.toggle('open');
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
        <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">${Icons.render('x')}</button>
        ${html}
        <div class="alert alert-info" style="margin-top:16px">
          <span>${Icons.render('info')}</span>
          <span><b>مميزات التطبيق المُثبّت:</b> يعمل بدون إنترنت، أيقونة على الشاشة، شاشة كاملة، إشعارات</span>
        </div>
        <div style="text-align:center;margin-top:16px">
          <button class="btn btn-primary" onclick="this.closest('.modal-overlay').remove()">${Icons.render('check')} فهمت</button>
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

  // Close sidebar when clicking outside (mobile)
  document.addEventListener('click', (e) => {
    const sidebar = document.querySelector('.sidebar');
    const toggle = document.querySelector('.menu-toggle');
    if (!sidebar || !toggle) return;
    if (window.innerWidth > 900) return;
    if (sidebar.classList.contains('open') && !sidebar.contains(e.target) && !toggle.contains(e.target)) {
      sidebar.classList.remove('open');
    }
  });

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
            <button class="menu-toggle" id="menuToggleBtn" onclick="APP.toggleSidebar()" aria-label="القائمة" title="القائمة">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <div class="page-title" id="pageTitle">لوحة التحكم</div>
            <div class="user-info">
              <button class="install-pwa-btn" id="installPwaBtn" style="display:none" onclick="APP.installPWA()" title="تحميل التطبيق على الجهاز">
                ${Icons.render('download')} <span class="install-text">تحميل التطبيق</span>
              </button>
              <div class="export-bar" id="exportBar">
                <button class="btn-export" onclick="APP.showExportMenu(event)" title="تصدير التقرير الحالي">
                  ${Icons.render('download')} تصدير <span style="margin-right:4px">▾</span>
                </button>
                <div class="export-menu" id="exportMenu" style="display:none">
                  <button onclick="APP.doExport('pdf')">${Icons.render('pdf')} PDF</button>
                  <button onclick="APP.doExport('excel')">${Icons.render('excel')} Excel</button>
                  <button onclick="APP.doExport('csv')">${Icons.render('csv')} CSV</button>
                  <button onclick="APP.doExport('json')">${Icons.render('json')} JSON</button>
                  <button onclick="APP.doExport('print')">${Icons.render('print')} طباعة</button>
                </div>
              </div>
              <div class="details">
                <b>${currentUser.name}</b><br>
                <span>${roleLabel(currentUser.role)} | ${currentUser.empId}</span>
              </div>
              <div class="avatar" onclick="APP.navigate('profile')" style="cursor:pointer" title="ملفي الشخصي">${currentUser.name.charAt(0)}</div>
              <button class="logout-btn" onclick="APP.logout()">${Icons.render('logout')} خروج</button>
            </div>
          </header>
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

  function renderNav() {
    const role = currentUser.role;
    const allModules = [
      { id: "dashboard",     group: "الرئيسية",          icon: "dashboard",     label: "لوحة التحكم",          roles: ["admin","executive","chairman","accountant","worker"] },
      { id: "production",    group: "العمليات",          icon: "factory",       label: "الإنتاج والتوالف",      roles: ["admin","production","accountant"] },
      { id: "purchaseRequest",group:"العمليات",          icon: "cart",          label: "طلب شراء",                roles: ["admin","production","procurement","accountant"] },
      { id: "costs",         group: "العمليات",          icon: "money",         label: "التكاليف الفعلية",      roles: ["admin","accountant","production"] },
      { id: "pricing",       group: "العمليات",          icon: "priceTag",      label: "الأسعار والوكلاء",       roles: ["admin","accountant"] },
      { id: "inventory",     group: "المخزون",           icon: "box",           label: "إدارة المخزون",          roles: ["admin","production","accountant","procurement"] },
      { id: "vouchers",      group: "المخزون",           icon: "clipboard",     label: "سندات الصرف",            roles: ["admin","accountant","production"] },
      { id: "sales",         group: "المبيعات",          icon: "truck",         label: "المناديب والمبيعات",     roles: ["admin","sales","accountant"] },
      { id: "agents",        group: "المبيعات",          icon: "handshake",     label: "الوكلاء",                roles: ["admin","sales","accountant"] },
      { id: "lab",           group: "المختبر والمحطة",    icon: "flask",         label: "سجل المختبر",            roles: ["admin","lab","production"] },
      { id: "procurement",   group: "المشتريات",          icon: "cart",          label: "المشتريات والموردين",    roles: ["admin","procurement","accountant"] },
      { id: "hr",            group: "الموارد البشرية",   icon: "users",         label: "الموارد البشرية",          roles: ["admin","hr_manager"] },
      { id: "reports",       group: "التقارير",          icon: "report",        label: "التقارير الشاملة",       roles: ["admin","executive","chairman","accountant","production","lab","procurement"] },

      { id: "permissions",   group: "الإدارة",          icon: "key",           label: "إدارة الصلاحيات",         roles: ["admin","hr_manager"] },
      { id: "terminated",    group: "الإدارة",          icon: "x",             label: "الموظفون المنتهية عقودهم", roles: ["admin"] },
      { id: "orgchart",      group: "الإدارة",          icon: "sitemap",       label: "الهيكل التنظيمي",         roles: ["admin","chairman","accountant"] },
      { id: "orgtree",       group: "الإدارة",          icon: "gitBranch",     label: "الشجرة التفاعلية",        roles: ["admin","chairman","accountant"] },
      { id: "settings",      group: "الإدارة",          icon: "settings",      label: "المطور",      roles: ["admin"] }
    ];

    const grouped = {};
    allModules.forEach(m => {
      if (!m.roles.includes(role)) return;
      if (!grouped[m.group]) grouped[m.group] = [];
      grouped[m.group].push(m);
    });

    const nav = document.getElementById("navMenu");
    nav.innerHTML = Object.keys(grouped).map(g => `
      <div class="nav-group">
        <div class="nav-group-title">${g}</div>
        ${grouped[g].map(m => `
          <div class="nav-item ${currentModule === m.id ? 'active' : ''}" data-id="${m.id}">
            <span class="icon">${Icons.render(m.icon)}</span>
            <span>${m.label}</span>
          </div>
        `).join("")}
      </div>
    `).join("");

    nav.querySelectorAll(".nav-item").forEach(el => {
      el.addEventListener("click", () => navigate(el.dataset.id));
    });

    // Build mobile bottom nav (5 most important modules)
    const mobileNav = document.getElementById("mobileNav");
    if (mobileNav) {
      const priorityIds = ["dashboard", "production", "purchaseRequest", "inventory", "reports"];
      const mobileItems = priorityIds
        .map(id => allModules.find(m => m.id === id))
        .filter(m => m && m.roles.includes(role));
      mobileNav.innerHTML = mobileItems.map(m => `
        <a href="#" data-id="${m.id}" class="${currentModule === m.id ? 'active' : ''}">
          ${Icons.render(m.icon)}
          <span>${m.label.replace('الإنتاج والتوالف', 'الإنتاج').replace('إدارة المخزون', 'المخزون').replace('التقارير الشاملة', 'التقارير')}</span>
        </a>
      `).join("");
      mobileNav.querySelectorAll("a").forEach(el => {
        el.addEventListener("click", e => { e.preventDefault(); navigate(el.dataset.id); });
      });
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
    const titles = {
      dashboard: "لوحة التحكم - نظرة لحظية",
      production: "إدارة الإنتاج والتوالف",
      costs: "التكاليف الفعلية للكرتون",
      pricing: "الأسعار والعمولات والوكلاء",
      inventory: "إدارة المخزون والرصد اللحظي",
      vouchers: "سندات صرف المناديب والوكلاء",
      sales: "أداء المناديب والمبيعات اليومية",
      agents: "الوكلاء وأسعار المصنع",
      lab: "سجل المختبر واستهلاك البئر",
      procurement: "المشتريات وفواتير الموردين",
      purchaseRequest: "طلب شراء - إلى إدارة المشتريات",
      hr: "الموارد البشرية",
      reports: "التقارير الشاملة والتصدير",

      permissions: "إدارة الصلاحيات والمنح",
      orgchart: "الهيكل التنظيمي",
      orgtree: "الشجرة التفاعلية",
      terminated: "الموظفون المنتهية عقودهم",
      settings: "إعدادات النظام والتخصيص",
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
document.addEventListener("click", () => {
  const m = document.getElementById("exportMenu");
  if (m) m.style.display = "none";
});

// Global password toggle (for inline onclick)
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
