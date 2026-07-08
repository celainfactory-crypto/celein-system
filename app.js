/* ============================================================
   سيلين - التطبيق الرئيسي
   - التنقل بين الوحدات
   - إدارة الشاشات
   ============================================================ */

window.APP = (function () {
  let currentUser = null;
  let currentModule = "dashboard";
  let db = null;

  // --- تهيئة الواجهة ---
  function init() {
    DB.init();
    db = DB.load();

    const session = DB.getSession();
    if (session) {
      currentUser = session;
      showMainApp();
    } else {
      showLogin();
    }
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
            <input type="password" id="loginPass" placeholder="" autocomplete="current-password" />
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

  // --- Toggle Sidebar (Mobile) ---
  function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) sidebar.classList.toggle('open');
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
            <div class="page-title" id="pageTitle">لوحة التحكم</div>
            <div class="user-info">
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
              <div class="avatar">${currentUser.name.charAt(0)}</div>
              <button class="logout-btn" onclick="APP.logout()">${Icons.render('logout')} خروج</button>
            </div>
          </header>
          <main class="content" id="content"></main>
          <footer class="app-footer">
            جميع الحقوق محفوظة © ${db.meta.year} | <b>${db.meta.copyright}</b> - ${db.meta.role} - ${db.meta.location}
          </footer>
        </div>
      </div>
    `;
    renderNav();
    navigate("dashboard");
  }

  // --- قائمة التنقل ---
  function roleLabel(role) {
    const m = {
      admin: "مدير النظام",
      production: "مدير الإنتاج",
      accountant: "المحاسب",
      sales: "إدارة المبيعات والمخازن",
      lab: "المختبر والمحطة",
      procurement: "المشتريات وشؤون الموظفين"
    };
    return m[role] || role;
  }

  function renderNav() {
    const role = currentUser.role;
    const allModules = [
      { id: "dashboard",     group: "الرئيسية",          icon: "dashboard",     label: "لوحة التحكم",          roles: ["admin","production","accountant","sales","lab","procurement"] },
      { id: "production",    group: "العمليات",          icon: "factory",       label: "الإنتاج والتوالف",      roles: ["admin","production","accountant","sales"] },
      { id: "purchaseRequest",group:"العمليات",          icon: "cart",          label: "طلب شراء",                roles: ["admin","production","procurement","accountant"] },
      { id: "costs",         group: "العمليات",          icon: "money",         label: "التكاليف الفعلية",      roles: ["admin","accountant","production"] },
      { id: "pricing",       group: "العمليات",          icon: "priceTag",      label: "الأسعار والوكلاء",       roles: ["admin","accountant","sales"] },
      { id: "inventory",     group: "المخزون",           icon: "box",           label: "إدارة المخزون",          roles: ["admin","production","sales","accountant"] },
      { id: "vouchers",      group: "المخزون",           icon: "clipboard",     label: "سندات الصرف",            roles: ["admin","sales","accountant","production"] },
      { id: "sales",         group: "المبيعات",          icon: "truck",         label: "المناديب والمبيعات",     roles: ["admin","sales","accountant"] },
      { id: "agents",        group: "المبيعات",          icon: "handshake",     label: "الوكلاء",                roles: ["admin","sales","accountant"] },
      { id: "lab",           group: "المختبر والمحطة",    icon: "flask",         label: "سجل المختبر",            roles: ["admin","lab","production"] },
      { id: "procurement",   group: "المشتريات",          icon: "cart",          label: "المشتريات والموردين",    roles: ["admin","procurement","accountant","production"] },
      { id: "hr",            group: "الموارد البشرية",   icon: "users",         label: "شؤون الموظفين",          roles: ["admin","procurement","accountant"] },
      { id: "reports",       group: "التقارير",          icon: "report",        label: "التقارير الشاملة",       roles: ["admin","accountant","sales","production"] },
      { id: "users",         group: "الإدارة",          icon: "shield",        label: "إدارة المستخدمين",       roles: ["admin"] },
      { id: "settings",      group: "الإدارة",          icon: "settings",      label: "الإعدادات والتخصيص",      roles: ["admin"] }
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
  }

  function navigate(moduleId) {
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
      hr: "شؤون الموظفين والرواتب",
      reports: "التقارير الشاملة والتصدير",
      users: "إدارة المستخدمين والصلاحيات",
      settings: "إعدادات النظام والتخصيص"
    };
    document.getElementById("pageTitle").textContent = titles[moduleId] || moduleId;
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
    }, 50);
  }

  function getDB() { return DB.load(); }
  function saveDB(d) { DB.save(d); db = d; }
  function getUser() { return currentUser; }

  return { init, navigate, logout, doLogin, getDB, saveDB, getUser, showExportMenu, doExport };
})();

window.addEventListener("DOMContentLoaded", () => APP.init());

// إغلاق قائمة التصدير عند النقر خارجها
document.addEventListener("click", () => {
  const m = document.getElementById("exportMenu");
  if (m) m.style.display = "none";
});
