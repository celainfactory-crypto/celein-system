// ============================================================
// GLOBAL EVENT HANDLERS — Accessible from all inline onclick attributes
// These are defined BEFORE window.APP so they are always available
// ============================================================

// Password toggle (login screen)
window.Modules = window.Modules || {}; // ensure Modules object exists
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
    document.body.style.visibility = 'visible'; document.body.style.opacity = '1';
    DB.init();
    db = DB.load();

    // Make doLogin/logout globally accessible BEFORE showLogin() renders the button
    window.doLogin = doLogin;
    window.logout = logout;

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
    document.body.style.visibility = 'visible'; document.body.style.opacity = '1';
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
              <button type="button" class="toggle-password" id="togglePassBtn" data-action="toggle-password" aria-label="إظهار/إخفاء كلمة المرور">
                <svg class="icon-eye" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                <svg class="icon-eye-off" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:none"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              </button>
            </div>
          </div>
          <button class="login-btn" id="loginBtnReal" data-action="do-login">
            <span id="loginBtnText">تسجيل الدخول</span>
          </button>
          <div class="login-version-tag">v18.79 - PWA Enabled</div>
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
        <button class="modal-close" data-action="modal-close">${Icons.render('x')}</button>
        ${html}
        <div class="alert alert-info" style="margin-top:16px">
          <span>${Icons.render('info')}</span>
          <span><b>مميزات التطبيق المُثبّت:</b> يعمل بدون إنترنت، أيقونة على الشاشة، شاشة كاملة، إشعارات</span>
        </div>
        <div style="text-align:center;margin-top:16px">
          <button class="btn btn-primary" data-action="modal-close">${Icons.render('check')} فهمت</button>
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
        <div class="sidebar-backdrop" id="sidebarBackdrop" data-action="toggle-sidebar"></div>
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
            <button class="menu-toggle" id="menuToggleBtn" data-action="toggle-sidebar" aria-label="القائمة" title="القائمة">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <div class="page-title" id="pageTitle">لوحة التحكم</div>
            <div class="user-info">
              <button class="install-pwa-btn" id="installPwaBtn" style="display:none" data-action="install-pwa" title="تحميل التطبيق على الجهاز">
                ${Icons.render('download')} <span class="install-text">تحميل التطبيق</span>
              </button>
              <div class="export-bar" id="exportBar">
                <button class="btn-export" data-action="show-export-menu" title="تصدير التقرير الحالي">
                  ${Icons.render('download')} تصدير <span style="margin-right:4px">▾</span>
                </button>
                <div class="export-menu" id="exportMenu" style="display:none">
                  <button data-action="do-export" data-type="pdf">${Icons.render('pdf')} PDF</button>
                  <button data-action="do-export" data-type="excel">${Icons.render('excel')} Excel</button>
                  <button data-action="do-export" data-type="csv">${Icons.render('csv')} CSV</button>
                  <button data-action="do-export" data-type="json">${Icons.render('json')} JSON</button>
                  <button data-action="do-export" data-type="print">${Icons.render('print')} طباعة</button>
                </div>
              </div>
              <div class="details">
                <b>${currentUser.name}</b><br>
                <span>${roleLabel(currentUser.role)} | ${currentUser.empId}</span>
              </div>
              <div class="avatar" data-action="nav-profile" style="cursor:pointer" title="ملفي الشخصي">${currentUser.name.charAt(0)}</div>
              <button class="logout-btn" data-action="logout">${Icons.render('logout')} خروج</button>
            </div>
          </header>
          <div class="self-service-bar" id="selfServiceBar" style="display:flex;align-items:center;gap:6px;padding:8px 16px;background:var(--bg-darker);border-bottom:1px solid var(--border);flex-wrap:wrap;font-size:13px;overflow-x:auto">
            <span style="font-weight:700;color:var(--primary);white-space:nowrap;margin-left:6px">خدمتي:</span>
            <a href="#" data-action="nav" data-page="myDashboard" style="display:flex;align-items:center;gap:4px;padding:4px 10px;background:var(--bg-card);border-radius:16px;text-decoration:none;color:var(--text);border:1px solid var(--border)">${Icons.render('layout')} لوحة التحكم</a>
            <a href="#" data-action="nav" data-page="salarySlip" style="display:flex;align-items:center;gap:4px;padding:4px 10px;background:var(--bg-card);border-radius:16px;text-decoration:none;color:var(--text);border:1px solid var(--border)">${Icons.render('fileText')} كشف الراتب</a>
            <a href="#" data-action="nav" data-page="myRequests" style="display:flex;align-items:center;gap:4px;padding:4px 10px;background:var(--bg-card);border-radius:16px;text-decoration:none;color:var(--text);border:1px solid var(--border)">${Icons.render('inbox')} طلباتي</a>
            <a href="#" data-action="nav" data-page="newRequest" style="display:flex;align-items:center;gap:4px;padding:4px 10px;background:var(--primary);color:#fff;border-radius:16px;text-decoration:none;font-weight:600">${Icons.render('plus')} طلب جديد</a>
            ${['admin','executive','chairman','hr_manager','vice_executive','production','accountant'].includes(currentUser.role) ? `<a href="#" data-action="nav" data-page="incomingRequests" style="display:flex;align-items:center;gap:4px;padding:4px 10px;background:var(--warning);color:#000;border-radius:16px;text-decoration:none;font-weight:600">${Icons.render('incoming')} الطلبات الواردة <span id="ss_incoming_badge" style="background:#fff;color:#000;border-radius:50%;width:18px;height:18px;font-size:10px;display:inline-flex;align-items:center;justify-content:center;font-weight:700">0</span></a>` : ''}
            <a href="#" data-action="nav" data-page="profile" style="display:flex;align-items:center;gap:4px;padding:4px 10px;background:var(--bg-card);border-radius:16px;text-decoration:none;color:var(--text);border:1px solid var(--border)">${Icons.render('user')} ملفي</a>
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
    // Update incoming badge
    try {
      var _db = APP.getDB();
      var _user = window.currentUser || APP.getCurrentUser();
      var _emp = (_db.employeesLog || []).find(function(e) { return e.empId === _user.empId; }) || {};
      var _allReqs = _db.requests || [];
      var _cnt = _allReqs.filter(function(r) {
        if (r.status === 'pending_manager') { var _re = (_db.employeesLog || []).find(function(e) { return e.empId === r.employeeId; }); return _re && _re.managerId === _emp.id; }
        if (r.status === 'pending_admin' && (_user.role === 'hr_manager' || _user.role === 'admin' || _user.role === 'vice_executive')) return true;
        if (r.status === 'pending_gm' && (_user.role === 'admin' || _user.role === 'vice_executive' || _user.role === 'executive' || _user.role === 'chairman')) return true;
        if (r.status === 'pending_dept') return true;
        return false;
      }).length;
      var _badge = document.getElementById('ss_incoming_badge');
      if (_badge) { _badge.textContent = _cnt; _badge.style.display = _cnt > 0 ? 'inline-flex' : 'none'; }
    } catch(e) {}
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
      { id: "production",     group: "الإنتاج",            icon: "factory",   label: "خطوط التعبئة والورديات",roles: ["admin","vice_executive","production","accountant"] },
      // ===============================================
      // 2. المختبر
      // ===============================================
      { id: "lab",           group: "المختبر",            icon: "flask",     label: "فحوصات الجودة والتعقيم",roles: ["admin","vice_executive","lab","production"] },
      // ===============================================
      // 3. المخازن
      // ===============================================
      { id: "inventory",     group: "المخازن",            icon: "box",       label: "جرد المواد الخام والمنتجات",roles:["admin","vice_executive","production","accountant","procurement"] },
      { id: "vouchers",      group: "المخازن",            icon: "clipboard", label: "سندات الصرف والإضافة",  roles: ["admin","vice_executive","accountant","production"] },
      // ===============================================
      // 4. المبيعات
      // ===============================================
      { id: "sales",         group: "المبيعات",            icon: "truck",     label: "إدارة العملاء والمناديب", roles: ["admin","vice_executive","accountant"] },
      { id: "mySales",      group: "المبيعات",            icon: "truck",     label: "مبيعاتي",              roles: ["sales"] },
      { id: "agents",        group: "المبيعات",            icon: "handshake", label: "الوكلاء",              roles: ["admin","vice_executive","sales","accountant"] },
      // ===============================================
      // 5. المشتريات
      // ===============================================
      { id: "purchaseRequest",group:"المشتريات",          icon: "cart",      label: "طلبات الشراء",           roles: ["admin","vice_executive","production","procurement","accountant"] },
      { id: "procurement",   group: "المشتريات",          icon: "package",   label: "الموردين والالتزامات",  roles: ["admin","vice_executive","procurement","accountant"] },
      // ===============================================
      // 6. المالية
      // ===============================================
      { id: "costs",         group: "المالية",            icon: "money",     label: "التكاليف الفعلية",       roles: ["admin","vice_executive","accountant","production"] },
      { id: "pricing",       group: "المالية",            icon: "priceTag",  label: "الأسعار",               roles: ["admin","vice_executive","accountant"] },
      { id: "cashflow",      group: "المالية",            icon: "wallet",    label: "التدفقات النقدية",       roles: ["admin","vice_executive","accountant"] },
      // ===============================================
      // 7. الموارد البشرية
      // ===============================================
      { id: "hr",            group: "الموارد البشرية",    icon: "users",     label: "سجل الموظفين",           roles: ["admin","vice_executive","hr_manager"] },
      { id: "permissions",   group: "الموارد البشرية",    icon: "key",       label: "إدارة الصلاحيات",        roles: ["admin","vice_executive","hr_manager"] },
      { id: "terminated",    group: "الموارد البشرية",    icon: "x",         label: "المنتهية عقودهم",        roles: ["admin","vice_executive"] },
      // ===============================================
      // 8. التقارير
      // ===============================================
      { id: "reports",       group: "التقارير",            icon: "report",    label: "اللوحة الشاملة",          roles: ["admin","vice_executive","executive","chairman","accountant","production","lab","procurement"] },
      { id: "orgchart",     group: "التقارير",            icon: "sitemap",   label: "الهيكل التنظيمي",        roles: ["admin","vice_executive","chairman","accountant"] },
      { id: "orgtree",      group: "التقارير",            icon: "gitBranch", label: "الشجرة التفاعلية",        roles: ["admin","vice_executive","chairman","accountant"] },
      // ===============================================
      // 9. الإدارة
      // ===============================================
      { id: "dashboard",     group: "الإدارة",            icon: "dashboard", label: "لوحة التحكم",             roles: ["admin","vice_executive","executive","chairman","accountant","sales"] },
      { id: "settings",      group: "الإدارة",            icon: "settings",  label: "لوحة المطور",             roles: ["admin","vice_executive"] }
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
      mySales: "مبيعاتي",
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
    document.body.style.visibility = 'visible'; document.body.style.opacity = '1';
    content.innerHTML = `<div class="card"><div class="spinner"></div> جاري التحميل...</div>`;

    // استدعاء وحدة العرض
    setTimeout(() => {
      try {
        if (window.Modules[moduleId]) {
          window.Modules[moduleId](content);
          // Module-level event delegation for data-action buttons
          content.addEventListener('click', function(e) {
            var el = e.target.closest('[data-action]');
            if (!el) return;
            var action = el.dataset.action;
            // Delegate to Modules._handleAction if defined
            if (action && window.Modules._handleAction) {
              window.Modules._handleAction(action, el, e);
            }
          });
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

  // Master action dispatcher — handles module-level data-action clicks
  Modules._handleAction = function(action, el, event) {
    if (action === 'modal-close' || action === 'close-modal') {
      var m = el.closest('.modal-overlay') || el.closest('.modal-content') || el.closest('[class*="modal"]') || el.closest('[id*="Modal"]');
      if (m) { m.style.display = 'none'; return; }
    }
    if (action === 'nav' && el.dataset.page) { navigate(el.dataset.page); return; }
    if (action === 'nav-profile') { navigate('profile'); return; }
    // Modal action buttons with parameters
    if (action === '_modal-save-perms') { window.Modules._savePermissions(parseInt(el.dataset.uid)); return; }
    if (action === '_modal-change-pass') { window.Modules._doChangePassword(parseInt(el.dataset.paramId)); return; }

    var curMod = window.Modules[currentModule];
    if (curMod && typeof curMod._handleAction === 'function') {
      if (curMod._handleAction(action, el, event) !== false) return;
    }
    var fnName = '_' + action.replace(/-([a-z])/g, function(g) { return g[1].toUpperCase(); });
    if (typeof window.Modules[fnName] === 'function') {
      window.Modules[fnName](el, event); return;
    }
    if (typeof window[action] === 'function') {
      window[action](el, event); return;
    }
    // === Additional Module Action Handlers ===
    // change-status (HR employee)
    if (action === 'change-status') {
      var eid = parseInt(el.dataset.eid || el.closest('[data-eid]')?.dataset.eid);
      var db = APP.getDB();
      var emp = (db.employeesLog || []).find(function(e) { return e.id === eid; });
      if (!emp) return;
      var newStatus = emp.status === 'active' ? 'on_leave' : 'active';
      emp.status = newStatus;
      if (newStatus === 'on_leave') emp.leaveDate = new Date().toISOString().split('T')[0];
      APP.saveDB(db);
      if (window.Modules[currentModule]) window.Modules[currentModule](document.getElementById('content'));
      return;
    }
    
    // reset-user-form
    if (action === 'reset-user-form') {
      var form = document.getElementById('user-form');
      if (form) form.reset();
      return;
    }
    
    // edit-user (HR module - inline edit)
    if (action === 'edit-user') {
      var uidx = parseInt(el.dataset.uidx || el.closest('[data-uidx]')?.dataset.uidx);
      if (window.Modules._editUser) window.Modules._editUser(uidx);
      return;
    }
    
    // view-alerts
    if (action === 'view-alerts') {
      var modal = document.getElementById('alertModal') || document.getElementById('cfAlertBanner');
      if (modal) {
        modal.style.display = modal.style.display === 'none' ? 'block' : 'none';
      }
      return;
    }
    
    // === Show modal helper ===
    window.Modules._showRequestModalHtml = function(title, html) {
      var existing = document.querySelector('.modal-overlay');
      if (existing) existing.remove();
      var overlay = document.createElement('div');
      overlay.className = 'modal-overlay';
      overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:10000;display:flex;align-items:center;justify-content:center;padding:20px';
      overlay.innerHTML = '<div style="background:var(--card);border-radius:16px;padding:24px;max-width:500px;width:100%;max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.3)">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;border-bottom:1px solid var(--border);padding-bottom:12px">' +
          '<h3 style="margin:0;font-size:16px">' + title + '</h3>' +
          '<button class="btn btn-secondary btn-sm" data-action="modal-close" style="padding:4px 10px">' + (Icons.render('x') || '×') + '</button>' +
        '</div>' +
        '<div>' + html + '</div>' +
      '</div>';
      document.body.appendChild(overlay);
    };
    

    
    // Inventory export
    if (action === 'export-inventory') {
      if (typeof Exports !== 'undefined' && Exports.doExport) {
        Exports.doExport('inventory');
      } else if (window.APP && window.APP.doExport) {
        window.APP.doExport('pdf');
      }
      return;
    }
    
    // Cashflow: manage accounts
    if (action === 'manage-accounts') {
      var db = APP.getDB();
      var html = '<div class="form-group"><label>اسم الحساب الجديد</label><input type="text" id="cf_new_acc_name" placeholder="مثال: صندوق المصنع" /></div>' +
        '<div class="form-group"><label>النوع</label><select id="cf_new_acc_type"><option value="safe">صندوق</option><option value="bank">بنك</option></select></div>' +
        '<div class="form-group"><label>الرصيد الافتتاحي</label><input type="number" id="cf_new_acc_bal" value="0" min="0" /></div>' +
        '<hr style="margin:12px 0;border-color:var(--border)">' +
        '<p style="font-size:13px;color:var(--text-secondary);margin-bottom:8px">الحسابات الحالية:</p>' +
        '<div style="max-height:200px;overflow-y:auto">' +
        (db.cashAccounts || []).map(function(a) {
          return '<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border);font-size:13px">' +
            '<span style="flex:1">' + a.name + ' <span class="badge badge-info">' + (a.type === 'safe' ? 'صندوق' : 'بنك') + '</span></span>' +
            '<span style="color:var(--primary);font-weight:700">' + (a.openingBalance || 0).toLocaleString('ar-EG') + ' ر.ي</span>' +
            '<button class="btn btn-danger btn-sm" data-action="_doDeleteCashAccount" data-accid="' + a.id + '">' + (Icons.render('trash') || 'حذف') + '</button>' +
          '</div>';
        }).join('') + '</div>' +
        '<div class="btn-row" style="margin-top:12px"><button class="btn btn-primary" data-action="_doAddCashAccount">' + (Icons.render('save') || 'حفظ') + ' إضافة</button><button class="btn btn-secondary" data-action="modal-close">إلغاء</button></div>';
      window.Modules._showRequestModalHtml('إدارة حسابات النقدية', html);
      return;
    }
    
    // Production module handlers
    if (action === 'delete-production') {
      var idx = parseInt(el.dataset.idx || el.closest('[data-idx]')?.dataset.idx);
      if (!confirm('حذف سجل الإنتاج هذا؟')) return;
      var db = APP.getDB();
      db.productionLog = (db.productionLog || []).filter(function(p, i) { return i !== parseInt(idx); });
      APP.saveDB(db);
      if (window.Modules[currentModule] && typeof window.Modules[currentModule] === 'function') window.Modules[currentModule](document.getElementById('content'));
      return;
    }
    
    // Voucher handlers
    if (action === 'delete-voucher') {
      var vidx = parseInt(el.dataset.vidx || el.closest('[data-vidx]')?.dataset.vidx);
      if (!confirm('حذف هذا السند؟')) return;
      var db = APP.getDB();
      db.vouchers = (db.vouchers || []).filter(function(v, i) { return i !== parseInt(vidx); });
      APP.saveDB(db);
      if (window.Modules[currentModule]) window.Modules[currentModule](document.getElementById('content'));
      return;
    }
    
    // Agent handlers
    if (action === 'delete-agent') {
      var aidx = parseInt(el.dataset.aidx || el.closest('[data-aidx]')?.dataset.aidx);
      if (!confirm('حذف هذا الوكيل؟')) return;
      var db = APP.getDB();
      db.agents = (db.agents || []).filter(function(a, i) { return i !== parseInt(aidx); });
      APP.saveDB(db);
      if (window.Modules[currentModule]) window.Modules[currentModule](document.getElementById('content'));
      return;
    }
    
    // Add cash account handler
    window.Modules._doDeleteCashAccount = function(el) {
      var id = parseInt(el.dataset.accid);
      if (!confirm('حذف هذا الحساب؟')) return;
      var db = APP.getDB();
      db.cashAccounts = (db.cashAccounts || []).filter(function(a) { return a.id !== id; });
      APP.saveDB(db);
      var m = document.querySelector('.modal-overlay');
      if (m) m.style.display = 'none';
      if (window.Modules[currentModule]) window.Modules[currentModule](document.getElementById('content'));
    };
        window.Modules._doAddCashAccount = function() {
      var name = (document.getElementById('cf_new_acc_name') || {}).value.trim();
      if (!name) { alert('يرجى إدخال اسم الحساب'); return; }
      var db = APP.getDB();
      db.cashAccounts = db.cashAccounts || [];
      db.cashAccounts.push({ id: Date.now(), name: name, type: (document.getElementById('cf_new_acc_type') || {}).value || 'safe', openingBalance: parseInt((document.getElementById('cf_new_acc_bal') || {}).value) || 0 });
      APP.saveDB(db);
      var m = document.querySelector('.modal-overlay');
      if (m) m.style.display = 'none';
      if (window.Modules[currentModule]) window.Modules[currentModule](document.getElementById('content'));
    };
    
    window.Modules._deleteCashAccount = function(id) {
      if (!confirm('حذف هذا الحساب؟')) return;
      var db = APP.getDB();
      db.cashAccounts = (db.cashAccounts || []).filter(function(a) { return a.id !== id; });
      APP.saveDB(db);
      if (window.Modules[currentModule]) window.Modules[currentModule](document.getElementById('content'));
    };
    
    // PR handlers (purchase request)
    if (action === 'pr-edit') {
      var pidx = parseInt(el.dataset.pidx || el.closest('[data-pidx]')?.dataset.pidx);
      if (window.Modules._prEditRequest) window.Modules._prEditRequest(pidx);
      return;
    }
    if (action === 'pr-cancel') {
      var pidx = parseInt(el.dataset.pidx || el.closest('[data-pidx]')?.dataset.pidx);
      if (window.Modules._prCancelRequest) window.Modules._prCancelRequest(pidx);
      return;
    }
    if (action === 'pr-remind') {
      var pidx = parseInt(el.dataset.pidx || el.closest('[data-pidx]')?.dataset.pidx);
      if (window.Modules._prRemind) window.Modules._prRemind(pidx);
      return;
    }
    if (action === 'pr-view') {
      var pidx = parseInt(el.dataset.pidx || el.closest('[data-pidx]')?.dataset.pidx);
      if (window.Modules._prView) window.Modules._prView(pidx);
      return;
    }
    
    // Dev module handlers
    if (action === 'dev-delete-menu') {
      var dmi = parseInt(el.dataset.dmi || el.closest('[data-dmi]')?.dataset.dmi);
      if (window.Modules._devDeleteMenu) window.Modules._devDeleteMenu(dmi);
      return;
    }
    if (action === 'dev-delete-page') {
      var dpi = parseInt(el.dataset.dpi || el.closest('[data-dpi]')?.dataset.dpi);
      if (window.Modules._devDeletePage) window.Modules._devDeletePage(dpi);
      return;
    }
    if (action === 'dev-delete-field') {
      var dfi = parseInt(el.dataset.dfi || el.closest('[data-dfi]')?.dataset.dfi);
      if (window.Modules._devDeleteField) window.Modules._devDeleteField(dfi);
      return;
    }
    if (action === 'dev-test-link') {
      var tli = parseInt(el.dataset.tli || el.closest('[data-tli]')?.dataset.tli);
      if (window.Modules._devTestLink) window.Modules._devTestLink(tli);
      return;
    }
    if (action === 'dev-delete-link') {
      var dli = parseInt(el.dataset.dli || el.closest('[data-dli]')?.dataset.dli);
      if (window.Modules._devDeleteLink) window.Modules._devDeleteLink(dli);
      return;
    }
    
    // Spare part PR handler
    if (action === 'pr-submit-spare') {
      var sid = el.dataset.sid;
      if (window.Modules._prSubmitSpare) window.Modules._prSubmitSpare(sid);
      return;
    }

    if (console.warn) console.warn('[Modules] No handler for:', action);
  };

  // === Missing Module Action Handlers ===

  // HR module
  window.Modules._addEmployee = function(el) {
    if (window.Modules._showRequestModal) {
      var html = '<div class="form-group"><label>الاسم الكامل *</label><input type="text" id="hr_new_name" required /></div>' +
        '<div class="form-group"><label>المسمى الوظيفي</label><input type="text" id="hr_new_pos" /></div>' +
        '<div class="form-group"><label>القسم</label><select id="hr_new_dept"><option>الإنتاج</option><option>المبيعات</option><option>المخازن</option><option>المشتريات</option><option>الحسابات</option><option>المختبر</option><option>الموارد البشرية</option><option>الخدمات</option><option>الأمن</option><option>الإدارة</option></select></div>' +
        '<div class="form-group"><label>الراتب</label><input type="number" id="hr_new_sal" min="0" /></div>' +
        '<div class="form-group"><label>تاريخ التعيين</label><input type="date" id="hr_new_hire" value="' + new Date().toISOString().split('T')[0] + '" /></div>' +
        '<div class="btn-row" style="margin-top:12px">' +
          '<button class="btn btn-primary" data-action="_saveNewEmployee">' + (Icons.render('save') || 'حفظ') + ' حفظ</button>' +
          '<button class="btn btn-secondary" data-action="modal-close">إلغاء</button>' +
        '</div>';
      window.Modules._showRequestModalHtml('إضافة موظف جديد', html);
    }
  };
  window.Modules._saveNewEmployee = function() {
    var name = document.getElementById('hr_new_name') ? document.getElementById('hr_new_name').value.trim() : '';
    if (!name) { alert('يرجى إدخال الاسم'); return; }
    var db = APP.getDB();
    var pos = (document.getElementById('hr_new_pos') || {}).value || '';
    var dept = (document.getElementById('hr_new_dept') || {}).value || '';
    var sal = parseInt((document.getElementById('hr_new_sal') || {}).value) || 0;
    var hire = (document.getElementById('hr_new_hire') || {}).value || '';
    var newId = Math.max(0, ...(db.employeesLog || []).map(function(e) { return e.id || 0; })) + 1;
    var empId = String(Math.max(0, ...(db.employeesLog || []).map(function(e) { return parseInt(e.empId) || 0; })) + 1);
    db.employeesLog = db.employeesLog || [];
    db.employeesLog.push({ id: newId, empId: empId, name: name, position: pos, department: dept, salary: sal, hireDate: hire, status: 'active', allowances: 0, managerId: 36, managerName: 'مختار عبدالله الحييد', photo: null });
    APP.saveDB(db);
    var m = document.querySelector('.modal-overlay');
    if (m) m.style.display = 'none';
    navigate('hr');
  };
  window.Modules._saveEmployee = function(el) {
    var row = el.closest('tr');
    if (!row) return;
    var id = parseInt(row.dataset.eid);
    var db = APP.getDB();
    var emp = (db.employeesLog || []).find(function(e) { return e.id === id; });
    if (!emp) return;
    var nameEl = row.querySelector('[data-field="name"]');
    var posEl = row.querySelector('[data-field="position"]');
    var deptEl = row.querySelector('[data-field="department"]');
    var salEl = row.querySelector('[data-field="salary"]');
    if (nameEl) emp.name = nameEl.value.trim();
    if (posEl) emp.position = posEl.value;
    if (deptEl) emp.department = deptEl.value;
    if (salEl) emp.salary = parseInt(salEl.value) || 0;
    APP.saveDB(db);
    navigate('hr');
  };
  window.Modules._deleteEmployee = function(el) {
    var row = el.closest('tr');
    if (!row) return;
    var id = parseInt(row.dataset.eid);
    if (!confirm('هل أنت متأكد من حذف هذا الموظف؟')) return;
    var db = APP.getDB();
    db.employeesLog = (db.employeesLog || []).filter(function(e) { return e.id !== id; });
    APP.saveDB(db);
    navigate('hr');
  };
  window.Modules._terminateEmployee = function(el) {
    var row = el.closest('tr');
    if (!row) return;
    var id = parseInt(row.dataset.eid);
    if (!confirm('هل أنت متأكد من إنهاء عقد هذا الموظف؟')) return;
    var db = APP.getDB();
    var emp = (db.employeesLog || []).find(function(e) { return e.id === id; });
    if (emp) { emp.status = 'terminated'; emp.terminationDate = new Date().toISOString().split('T')[0]; }
    APP.saveDB(db);
    navigate('hr');
  };
  window.Modules._reinstateEmployee = function(el) {
    var row = el.closest('tr');
    if (!row) return;
    var id = parseInt(row.dataset.eid);
    var db = APP.getDB();
    var emp = (db.employeesLog || []).find(function(e) { return e.id === id; });
    if (emp) { emp.status = 'active'; delete emp.terminationDate; }
    APP.saveDB(db);
    navigate('hr');
  };

  // Users module
  window.Modules._addUser = function(el) {
    var db = APP.getDB();
    var newId = Math.max(0, ...(db.users || []).map(function(u) { return u.id || 0; })) + 1;
    var html = '<div class="form-group"><label>اسم الدخول *</label><input type="text" id="u_user" required /></div>' +
      '<div class="form-group"><label>كلمة المرور *</label><input type="password" id="u_pass" required /></div>' +
      '<div class="form-group"><label>الاسم</label><input type="text" id="u_name" /></div>' +
      '<div class="form-group"><label>الدور</label><select id="u_role"><option value="worker">موظف</option><option value="sales">مندوب</option><option value="production">مدير إنتاج</option><option value="hr_manager">مدير موارد</option><option value="accountant">محاسب</option><option value="admin">مدير</option></select></div>' +
      '<div class="form-group"><label>القسم</label><input type="text" id="u_dept" /></div>' +
      '<div class="btn-row" style="margin-top:12px">' +
        '<button class="btn btn-primary" data-action="_saveNewUser">' + (Icons.render('save') || 'حفظ') + ' حفظ</button>' +
        '<button class="btn btn-secondary" data-action="modal-close">إلغاء</button>' +
      '</div>';
    window.Modules._showRequestModalHtml('إضافة مستخدم جديد', html);
  };
  window.Modules._saveNewUser = function() {
    var user = (document.getElementById('u_user') || {}).value.trim();
    var pass = (document.getElementById('u_pass') || {}).value;
    if (!user || !pass) { alert('يرجى إدخال اسم الدخول وكلمة المرور'); return; }
    var db = APP.getDB();
    if ((db.users || []).find(function(u) { return u.username === user; })) { alert('اسم الدخول موجود مسبقاً'); return; }
    var newId = Math.max(0, ...(db.users || []).map(function(u) { return u.id || 0; })) + 1;
    db.users = db.users || [];
    db.users.push({ id: newId, username: user, password: pass, name: (document.getElementById('u_name') || {}).value || user, role: (document.getElementById('u_role') || {}).value || 'worker', department: (document.getElementById('u_dept') || {}).value || '', active: true });
    APP.saveDB(db);
    var m = document.querySelector('.modal-overlay');
    if (m) m.style.display = 'none';
    navigate('users');
  };
  window.Modules._saveUser = function(el) {
    var row = el.closest('tr');
    if (!row) return;
    var id = parseInt(row.dataset.uid);
    var db = APP.getDB();
    var u = (db.users || []).find(function(x) { return x.id === id; });
    if (!u) return;
    var roleEl = row.querySelector('[data-field="role"]');
    var deptEl = row.querySelector('[data-field="department"]');
    var activeEl = row.querySelector('[data-field="active"]');
    if (roleEl) u.role = roleEl.value;
    if (deptEl) u.department = deptEl.value;
    if (activeEl !== null) u.active = activeEl.checked !== undefined ? activeEl.checked : true;
    APP.saveDB(db);
    navigate('users');
  };
  window.Modules._deleteUser = function(el) {
    var row = el.closest('tr');
    if (!row) return;
    var id = parseInt(row.dataset.uid);
    if (!confirm('حذف هذا المستخدم؟')) return;
    var db = APP.getDB();
    db.users = (db.users || []).filter(function(u) { return u.id !== id; });
    APP.saveDB(db);
    navigate('users');
  };
  window.Modules._toggleUser = function(el) {
    var row = el.closest('tr');
    if (!row) return;
    var id = parseInt(row.dataset.uid);
    var db = APP.getDB();
    var u = (db.users || []).find(function(x) { return x.id === id; });
    if (u) u.active = el.checked;
    APP.saveDB(db);
  };

  // Permissions module
  window.Modules._editPermissions = function(el) {
    var uid = parseInt(el.dataset.uid || el.closest('tr').dataset.uid);
    if (!uid) return;
    var db = APP.getDB();
    var u = (db.users || []).find(function(x) { return x.id === uid; });
    if (!u) return;
    var perms = (u.customPermissions || []).join(', ');
    var html = '<div class="form-group"><label>صلاحيات مخصصة (مفصولة بفواصل)</label>' +
      '<textarea id="perm_editor" rows="4" style="width:100%;padding:8px;border-radius:8px;border:1px solid var(--border);font-size:13px" placeholder="مثال: sales, hr, reports">' + perms + '</textarea></div>' +
      '<div class="btn-row" style="margin-top:12px">' +
        '<button class="btn btn-primary" data-action="_modal-save-perms" data-uid="' + uid + '">حفظ</button>' +
        '<button class="btn btn-secondary" data-action="modal-close">إلغاء</button>' +
      '</div>';
    window.Modules._showRequestModalHtml('تعديل الصلاحيات', html);
  };
  window.Modules._savePermissions = function(uid) {
    var txt = (document.getElementById('perm_editor') || {}).value || '';
    var db = APP.getDB();
    var u = (db.users || []).find(function(x) { return x.id === uid; });
    if (u) u.customPermissions = txt.split(',').map(function(s) { return s.trim(); }).filter(Boolean);
    APP.saveDB(db);
    var m = document.querySelector('.modal-overlay');
    if (m) m.style.display = 'none';
    navigate('permissions');
  };

  // Sales / reps
  window.Modules._addRepForm = function(el) {
    if (window.__RS && window.__RS.openRepModal) window.__RS.openRepModal();
  };
  window.Modules._cancelRepForm = function(el) {
    if (window.__RS && window.__RS.closeRepModal) window.__RS.closeRepModal();
  };
  window.Modules._editRep = function(el) {
    var id = parseInt(el.dataset.repId || el.closest('tr').dataset.repId);
    if (window.__RS && window.__RS.openRepModal) window.__RS.openRepModal(id);
  };
  window.Modules._deleteRep = function(el) {
    var id = parseInt(el.dataset.repId || el.closest('tr').dataset.repId);
    if (!confirm('حذف هذا المندوب؟')) return;
    var db = APP.getDB();
    db.salesReps = (db.salesReps || []).filter(function(r) { return r.id !== id; });
    APP.saveDB(db);
    navigate('sales');
  };
  window.Modules._updateRep = function(el) {
    if (window.__RS && window.__RS.saveRep) window.__RS.saveRep();
  };
  window.Modules._saveRep = function(el) {
    if (window.__RS && window.__RS.saveRep) window.__RS.saveRep();
  };

  // Agents
  window.Modules._addAgent = function(el) {
    if (window.Modules._showRequestModalHtml) {
      var html = '<div class="form-group"><label>اسم الوكيل *</label><input type="text" id="agent_name" required /></div>' +
        '<div class="form-group"><label>رقم الهاتف</label><input type="text" id="agent_phone" /></div>' +
        '<div class="form-group"><label>المنطقة</label><input type="text" id="agent_area" /></div>' +
        '<div class="form-group"><label>الحالة</label><select id="agent_status"><option value="active">نشط</option><option value="inactive">غير نشط</option></select></div>' +
        '<div class="btn-row" style="margin-top:12px"><button class="btn btn-primary" data-action="_doAddAgent">حفظ</button><button class="btn btn-secondary" data-action="modal-close">إلغاء</button></div>';
      window.Modules._showRequestModalHtml('إضافة وكيل', html);
    }
  };
  window.Modules._doAddAgent = function() {
    var name = (document.getElementById('agent_name') || {}).value.trim();
    if (!name) { alert('يرجى إدخال الاسم'); return; }
    var db = APP.getDB();
    db.agents = db.agents || [];
    db.agents.push({ id: Date.now(), name: name, phone: (document.getElementById('agent_phone') || {}).value || '', area: (document.getElementById('agent_area') || {}).value || '', status: (document.getElementById('agent_status') || {}).value || 'active' });
    APP.saveDB(db);
    var m = document.querySelector('.modal-overlay');
    if (m) m.style.display = 'none';
    navigate('agents');
  };
  window.Modules._deleteAgent = function(el) {
    var id = parseInt(el.dataset.aid || el.closest('tr').dataset.aid);
    if (!confirm('حذف هذا الوكيل؟')) return;
    var db = APP.getDB();
    db.agents = (db.agents || []).filter(function(a) { return a.id !== id; });
    APP.saveDB(db);
    navigate('agents');
  };

  // Vouchers
  window.Modules._addVoucher = function(el) {
    navigate('vouchers'); // vouchers module handles its own add
  };

  // Change password (from profile)
  window.Modules._changePassword = function(el) {
    var row = el.closest('tr');
    if (!row) return;
    var id = parseInt(row.dataset.uid);
    var html = '<div class="form-group"><label>كلمة المرور الجديدة *</label><input type="password" id="new_pass" required /></div>' +
      '<div class="form-group"><label>تأكيد كلمة المرور *</label><input type="password" id="new_pass2" required /></div>' +
      '<div class="btn-row" style="margin-top:12px"><button class="btn btn-primary" data-action="_modal-change-pass" data-param-id="' + id + '">تغيير</button><button class="btn btn-secondary" data-action="modal-close">إلغاء</button></div>';
    window.Modules._showRequestModalHtml('تغيير كلمة المرور', html);
  };
  window.Modules._doChangePassword = function(uid) {
    var p1 = (document.getElementById('new_pass') || {}).value;
    var p2 = (document.getElementById('new_pass2') || {}).value;
    if (!p1 || p1 !== p2) { alert('كلمتا المرور غير متطابقتين'); return; }
    var db = APP.getDB();
    var u = (db.users || []).find(function(x) { return x.id === uid; });
    if (u) u.password = p1;
    APP.saveDB(db);
    var m = document.querySelector('.modal-overlay');
    if (m) m.style.display = 'none';
    alert('تم تغيير كلمة المرور بنجاح');
  };

  // Inventory / Lab / Purchase / Cashflow — these use data-input / data-change delegation
  // which is handled separately in modules

  // === End Missing Module Action Handlers ===


  return { init, navigate, logout, doLogin, getDB, saveDB, getUser, getCurrentUser, showExportMenu, doExport, toggleSidebar, togglePasswordGlobal, installPWA, showManualInstallGuide, syncExportBar };
})();

// === Global delegation for data-input and data-change ===
document.addEventListener('input', function(e) {
  var el = e.target.closest('[data-input]');
  if (!el) return;
  var inp = el.dataset.input;
  var curMod = window.Modules[currentModule];
  if (curMod && typeof curMod._handleInput === 'function') { curMod._handleInput(inp, el, e); return; }
  var fn = window.Modules['_' + inp];
  if (typeof fn === 'function') { fn(el, e); return; }
  if (typeof window[inp] === 'function') window[inp](el, e);
});
document.addEventListener('change', function(e) {
  var el = e.target.closest('[data-change]');
  if (!el) return;
  var chg = el.dataset.change;
  var curMod = window.Modules[currentModule];
  if (curMod && typeof curMod._handleChange === 'function') { curMod._handleChange(chg, el, e); return; }
  var fn = window.Modules['_' + chg];
  if (typeof fn === 'function') { fn(el, e); return; }
  if (typeof window[chg] === 'function') window[chg](el, e);
});
window.addEventListener("DOMContentLoaded", () => {
  try {
    APP.init();
  } catch(e) {
    document.body.innerHTML = '<div style="padding:40px;font-family:sans-serif;text-align:center;direction:rtl">' +
      '<h2 style="color:#c62828">⚠️ خطأ في تحميل التطبيق</h2>' +
      '<p style="color:#666;font-size:14px">' + e.message + '</p>' +
      '<pre style="text-align:left;background:#f5f5f5;padding:12px;border-radius:8px;overflow:auto;font-size:12px">' + (e.stack || '').substring(0, 500) + '</pre>' +
      '<p style="color:#999;font-size:12px;margin-top:20px">امسح الكاش وحاول مرة أخرى</p>' +
    '</div>';
    console.error('APP init error:', e);
  }
});

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

// === Global event delegation for data-action attributes ===
document.addEventListener('click', function(e) {
  var el = e.target.closest('[data-action]');
  if (!el) return;
  var action = el.dataset.action;
  if (!action) return;

  switch(action) {
    case 'toggle-password': window.togglePasswordGlobal(); break;
    case 'toggle-sidebar': window.toggleSidebarGlobal(); break;
    case 'do-login': window.doLogin(); break;
    case 'install-pwa': if (window.APP && window.APP.installPWA) window.APP.installPWA(); break;
    case 'show-export-menu': if (window.APP && window.APP.showExportMenu) window.APP.showExportMenu(e); break;
    case 'logout': window.logout(); break;
    case 'nav-profile': if (window.APP && window.APP.navigate) window.APP.navigate('profile'); break;
    case 'nav': if (window.APP && window.APP.navigate) window.APP.navigate(el.dataset.page); break;
    case 'do-export': if (window.APP && window.APP.doExport) window.APP.doExport(el.dataset.type); break;
    case 'modal-close':
      var m = e.target.closest('.modal-overlay') || e.target.closest('.modal-content') ||
              e.target.closest('[class*="modal"]') || e.target.closest('[id*="Modal"]');
      if (m) m.style.display = 'none';
      break;
    // === mySales delegation ===
    case 'rs-tab':
      if (window.__RS && window.__RS.switchTab) window.__RS.switchTab(el.dataset.tab);
      break;
    case 'rs-submit':
      if (window.__RS && window.__RS.submit) window.__RS.submit();
      break;
    case 'rs-reset':
      if (window.__RS && window.__RS.reset) window.__RS.reset();
      break;
    case 'rs-qty':
    case 'rs-price':
    case 'rs-cash':
    case 'rs-credit':
      if (window.__RS && window.__RS.calc) window.__RS.calc();
      break;
    case 'rs-add-customer':
      if (window.__RS && window.__RS.openCustomerModal) window.__RS.openCustomerModal();
      break;
    case 'rs-edit-customer':
      if (window.__RS && window.__RS.openCustomerModal) window.__RS.openCustomerModal(parseInt(el.dataset.id));
      break;
    case 'rs-del-customer':
      if (window.__RS && window.__RS.delCustomer) window.__RS.delCustomer(parseInt(el.dataset.id));
      break;
    case 'rs-close-customer-modal':
      if (window.__RS && window.__RS.closeCustomerModal) window.__RS.closeCustomerModal();
      break;
    case 'rs-save-customer':
      if (window.__RS && window.__RS.saveCustomer) window.__RS.saveCustomer();
      break;
    case 'rs-submit-collection':
      if (window.__RS && window.__RS.submitCollection) window.__RS.submitCollection();
      break;
    case 'rs-new-cust-btn':
      if (window.__RS && window.__RS.openCustomerModal) window.__RS.openCustomerModal();
      break;

    // === Self-Service (SShifa) ===
    case 'ss-select-type':
      if (window.__SS && window.__SS.selectType) window.__SS.selectType(el.dataset.type);
      break;
    case 'ss-back-types':
      if (window.__SS && window.__SS.backToTypes) window.__SS.backToTypes();
      break;
    case 'ss-submit-request':
      if (window.__SS && window.__SS.submitRequest) window.__SS.submitRequest();
      break;
    case 'ss-filter-req':
      if (window.__SS && window.__SS.filterReqs) window.__SS.filterReqs(el.dataset.filter);
      document.querySelectorAll('[data-action="ss-filter-req"]').forEach(function(b) {
        b.classList.toggle('active', b === el);
        b.style.background = (b === el) ? 'var(--primary)' : '';
        b.style.color = (b === el) ? '#fff' : '';
      });
      break;
    case 'ss-view-req':
      var reqId = el.dataset.id;
      if (reqId && window.__SS && window.__SS.allReqs) {
        var req = window.__SS.allReqs.find(function(r) { return r.id === reqId; });
        if (req) {
          var detailTitle = document.getElementById('ss_detail_title');
          var detailBody = document.getElementById('ss_detail_body');
          var modal = document.getElementById('ss_req_detail_modal');
          var statusMap = { draft: 'badge-info', pending_manager: 'badge-warning', pending_admin: 'badge-warning', pending_dept: 'badge-warning', pending_gm: 'badge-warning', approved: 'badge-success', rejected: 'badge-danger', in_progress: 'badge-info', completed: 'badge-success', cancelled: 'badge-secondary' };
          var statusLabels = { draft: 'مسودة', pending_manager: 'بانتظار المدير المباشر', pending_admin: 'بانتظار الإدارة', pending_dept: 'بانتظار القسم المختص', pending_gm: 'بانتظار المدير العام', approved: 'معتمد', rejected: 'مرفوض', in_progress: 'قيد التنفيذ', completed: 'مكتمل', cancelled: 'ملغى' };
          if (detailTitle) detailTitle.innerHTML = (req.title || req.subTypeLabel || req.type) + ' <span class="badge ' + (statusMap[req.status] || 'badge-info') + '" style="border-radius:8px;font-size:11px;margin-right:6px">' + (statusLabels[req.status] || req.status) + '</span>';
          var histHTML = req.history && req.history.length > 0
            ? '<div style="margin-top:16px"><h4 style="margin:0 0 8px 0">سجل الطلب</h4>' + req.history.map(function(h) { return '<div style="padding:6px 0;border-bottom:1px solid var(--border);font-size:12px"><span class="text-muted">' + (h.at ? h.at.substring(0,16) : '') + '</span> — <b>' + (h.by || '') + '</b>: ' + (h.note || '') + '</div>'; }).join('') + '</div>'
            : '';
          if (detailBody) detailBody.innerHTML = '<table style="width:100%;font-size:13px">' +
            '<tr><td class="text-muted" style="width:100px;padding:4px 0">الموظف</td><td style="padding:4px 0"><b>' + (req.employeeName || '—') + '</b></td></tr>' +
            '<tr><td class="text-muted" style="padding:4px 0">القسم</td><td style="padding:4px 0">' + (req.departmentName || '—') + '</td></tr>' +
            '<tr><td class="text-muted" style="padding:4px 0">النوع</td><td style="padding:4px 0">' + (req.subTypeLabel || req.type) + '</td></tr>' +
            (req.startDate ? '<tr><td class="text-muted" style="padding:4px 0">من</td><td style="padding:4px 0">' + req.startDate + '</td></tr>' : '') +
            (req.endDate ? '<tr><td class="text-muted" style="padding:4px 0">إلى</td><td style="padding:4px 0">' + req.endDate + '</td></tr>' : '') +
            (req.amount ? '<tr><td class="text-muted" style="padding:4px 0">المبلغ</td><td style="padding:4px 0;font-weight:700;color:var(--warning)">' + req.amount.toLocaleString('ar-EG') + ' ر.ي</td></tr>' : '') +
            (req.description ? '<tr><td class="text-muted" style="padding:4px 0;vertical-align:top">التفاصيل</td><td style="padding:4px 0">' + req.description + '</td></tr>' : '') +
            (req.rejectionReason ? '<tr><td class="text-muted" style="padding:4px 0;vertical-align:top">سبب الرفض</td><td style="padding:4px 0;color:var(--danger)">' + req.rejectionReason + '</td></tr>' : '') +
            '</table>' + histHTML;
          if (modal) modal.style.display = 'flex';
        }
      }
      break;
    case 'ss-close-detail':
      var m = document.getElementById('ss_req_detail_modal');
      if (m) m.style.display = 'none';
      break;
    case 'ss-cancel-req':
      var cancelId = el.dataset.id;
      if (cancelId && confirm('هل أنت متأكد من إلغاء هذا الطلب؟')) {
        var db2 = APP.getDB();
        var req2 = (db2.requests || []).find(function(r) { return r.id === cancelId; });
        if (req2) {
          req2.status = 'cancelled';
          req2.updatedAt = new Date().toISOString();
          req2.history.push({ action: 'cancelled', by: APP.getCurrentUser().name, at: new Date().toISOString(), note: 'تم الإلغاء من قبل مقدم الطلب' });
          APP.saveDB(db2);
          alert('تم إلغاء الطلب بنجاح');
          if (window.APP && window.APP.navigate) window.APP.navigate('myRequests');
        }
      }
      break;
    case 'ss-approve-req':
      var appId = el.dataset.id;
      if (appId) {
        var db3 = APP.getDB();
        var req3 = (db3.requests || []).find(function(r) { return r.id === appId; });
        if (req3) {
          var oldSt = req3.status;
          var curUser = APP.getCurrentUser();
          var nextSt = 'approved';
          if (req3.status === 'pending_manager') nextSt = 'pending_admin';
          else if (req3.status === 'pending_admin') nextSt = 'pending_gm';
          req3.status = nextSt;
          req3.updatedAt = new Date().toISOString();
          req3.history.push({ action: 'approved', by: curUser.name, byRole: curUser.role, from: oldSt, to: nextSt, at: new Date().toISOString(), note: 'تمت الموافقة' });
          if (!db3.notifications) db3.notifications = [];
          db3.notifications.push({ id: 'NOTIF-' + Date.now(), type: 'request_approved', requestId: req3.id, for: req3.employeeId, title: 'تم اعتماد طلبك', message: 'تمت الموافقة على طلبك "' + (req3.title || req3.type) + '"', createdAt: new Date().toISOString(), read: false });
          APP.saveDB(db3);
          alert('تمت الموافقة بنجاح');
          if (window.APP && window.APP.navigate) window.APP.navigate('incomingRequests');
        }
      }
      break;
    case 'ss-reject-req':
      var rejId = el.dataset.id;
      var rmodal = document.getElementById('ss_reject_modal');
      var ridIn = document.getElementById('ss_reject_id');
      if (rmodal) rmodal.style.display = 'flex';
      if (ridIn) ridIn.value = rejId || '';
      break;
    case 'ss-confirm-reject':
      var rejId2 = (document.getElementById('ss_reject_id') || {}).value || '';
      var reason2 = (document.getElementById('ss_reject_reason') || {}).value || '';
      if (!reason2.trim()) { alert('يرجى إدخال سبب الرفض'); return; }
      if (!rejId2) { alert('خطأ: معرف الطلب غير موجود'); return; }
      var db4 = APP.getDB();
      var req4 = (db4.requests || []).find(function(r) { return r.id === rejId2; });
      if (req4) {
        var curUser2 = APP.getCurrentUser();
        req4.status = 'rejected';
        req4.rejectionReason = reason2.trim();
        req4.updatedAt = new Date().toISOString();
        req4.history.push({ action: 'rejected', by: curUser2.name, byRole: curUser2.role, at: new Date().toISOString(), note: reason2.trim() });
        if (!db4.notifications) db4.notifications = [];
        db4.notifications.push({ id: 'NOTIF-' + Date.now(), type: 'request_rejected', requestId: req4.id, for: req4.employeeId, title: 'تم رفض طلبك', message: 'تم رفض طلبك "' + (req4.title || req4.type) + '". السبب: ' + reason2.trim(), createdAt: new Date().toISOString(), read: false });
        APP.saveDB(db4);
        var rmodal2 = document.getElementById('ss_reject_modal');
        if (rmodal2) rmodal2.style.display = 'none';
        var ri2 = document.getElementById('ss_reject_id');
        var rr2 = document.getElementById('ss_reject_reason');
        if (ri2) ri2.value = '';
        if (rr2) rr2.value = '';
        alert('تم رفض الطلب');
        if (window.APP && window.APP.navigate) window.APP.navigate('incomingRequests');
      }
      break;
    case 'ss-close-reject':
      var m2 = document.getElementById('ss_reject_modal');
      if (m2) m2.style.display = 'none';
      break;
    case 'ss-print-slip':
      window.print();
      break;

  }
});
