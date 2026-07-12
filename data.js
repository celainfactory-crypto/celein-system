/* ============================================================
   سيلين - طبقة البيانات (Data Layer)
   - LocalStorage
   - حسابات لحظية للتكلفة الفعلية ونقطة التعادل
   - معادلات مستخرجة من التكلفه.xlsx
   ============================================================ */

window.DB = (function () {
  const KEY = "celein_db_v8";
  const SESSION_KEY = "celein_session_v1";

  // تهيئة قاعدة البيانات من البذور
  function init() {
    if (!localStorage.getItem(KEY)) {
      localStorage.setItem(KEY, JSON.stringify(window.SEED));
    }
  }

  function load() {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : window.SEED;
  }

  function save(db) {
    localStorage.setItem(KEY, JSON.stringify(db));
  }

  function reset() {
    localStorage.removeItem(KEY);
    localStorage.removeItem(SESSION_KEY);
    init();
  }

  // --- الجلسات ---
  function getSession() {
    const s = localStorage.getItem(SESSION_KEY);
    return s ? JSON.parse(s) : null;
  }

  function setSession(user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  }

  function clearSession() {
    localStorage.removeItem(SESSION_KEY);
  }

  // ============================================================
  // نظام الصلاحيات (RBAC)
  // ============================================================
  const PERMISSIONS = {
    // كل صفحة: قائمة الأدوار المسموح لها
    pages: {
      dashboard:       ['admin', 'executive', 'chairman', 'accountant'],
      production:      ['admin', 'hr_manager', 'production', 'accountant'],
      purchaseRequest: ['admin', 'hr_manager', 'production', 'procurement', 'accountant'],
      costs:           ['admin', 'hr_manager', 'production', 'accountant'],
      pricing:         ['admin', 'hr_manager', 'accountant', 'sales'],
      inventory:       ['admin', 'hr_manager', 'production', 'sales', 'accountant', 'procurement'],
      vouchers:        ['admin', 'hr_manager', 'sales', 'accountant', 'production'],
      sales:           ['admin', 'hr_manager', 'sales', 'accountant'],
      agents:          ['admin', 'hr_manager', 'sales', 'accountant'],
      lab:             ['admin', 'hr_manager', 'lab', 'production'],
      procurement:     ['admin', 'hr_manager', 'procurement', 'accountant'],
      hr:              ['admin', 'hr_manager', 'production', 'accountant', 'procurement'],
      reports:         ['admin', 'executive', 'chairman', 'hr_manager', 'production', 'accountant', 'sales', 'lab', 'procurement'],
      users:           ['admin', 'hr_manager'],
      permissions:     ['admin', 'hr_manager'],
      settings:        ['admin'],
      profile:         ['admin', 'executive', 'chairman', 'hr_manager', 'production', 'accountant', 'sales', 'lab', 'procurement', 'worker']
    },
    // كل صفحة: وضع العرض (full = تعديل، view = عرض فقط)
    modes: {
      dashboard:       { admin: 'full', executive: 'view', chairman: 'view', accountant: 'full', hr_manager: 'view', production: 'view', sales: 'view', lab: 'view', procurement: 'view', worker: 'view' },
      production:      { admin: 'full', hr_manager: 'view', production: 'full', accountant: 'view' },
      purchaseRequest: { admin: 'full', hr_manager: 'full', production: 'full', procurement: 'full', accountant: 'full' },
      costs:           { admin: 'full', hr_manager: 'view', production: 'view', accountant: 'full' },
      pricing:         { admin: 'full', hr_manager: 'view', accountant: 'full', sales: 'view' },
      inventory:       { admin: 'full', hr_manager: 'view', production: 'full', sales: 'full', accountant: 'view', procurement: 'view' },
      vouchers:        { admin: 'full', hr_manager: 'view', sales: 'full', accountant: 'full', production: 'view' },
      sales:           { admin: 'full', hr_manager: 'view', sales: 'full', accountant: 'full' },
      agents:          { admin: 'full', hr_manager: 'view', sales: 'full', accountant: 'view' },
      lab:             { admin: 'full', hr_manager: 'view', lab: 'full', production: 'view' },
      procurement:     { admin: 'full', hr_manager: 'view', procurement: 'full', accountant: 'view' },
      hr:              { admin: 'full', hr_manager: 'full', production: 'view', accountant: 'view', procurement: 'view' },
      reports:         { admin: 'full', executive: 'view', chairman: 'view', hr_manager: 'full', production: 'full', accountant: 'full', sales: 'full', lab: 'full', procurement: 'full' },
      users:           { admin: 'full', hr_manager: 'full' },
      permissions:     { admin: 'full', hr_manager: 'full' },
      settings:        { admin: 'full' },
      profile:         { admin: 'full', executive: 'full', chairman: 'full', hr_manager: 'full', production: 'full', accountant: 'full', sales: 'full', lab: 'full', procurement: 'full', worker: 'full' }
    },
    // أقسام يمكن لمدير القسم رؤية بياناتها فقط
    departmentScoped: {
      production:  ['production'],
      sales:       ['sales'],
      lab:         ['lab'],
      procurement: ['procurement'],
      hr:          ['hr_manager']
    },
    // معلومات تسميات الأدوار
    roleLabels: {
      admin:       'المدير العام',
      executive:   'المدير التنفيذي',
      chairman:    'رئيس مجلس الإدارة',
      hr_manager:  'مدير الموارد البشرية',
      production:  'مدير الإنتاج',
      accountant:  'محاسب',
      sales:       'مندوب مبيعات',
      lab:         'فني مختبر',
      procurement: 'مدير المشتريات',
      worker:      'موظف'
    }
  };

  // هل للمستخدم صلاحية الدخول لهذه الصفحة؟
  function canAccess(user, pageId) {
    if (!user) return false;
    // المدير العام يدخل كل شيء
    if (user.role === 'admin') return true;
    // تحقق من الصلاحيات المخصصة
    if (user.customPermissions && user.customPermissions.includes(pageId)) return true;
    // تحقق من الدور
    const allowed = PERMISSIONS.pages[pageId] || [];
    return allowed.includes(user.role);
  }

  // هل المستخدم في وضع التعديل الكامل أم عرض فقط؟
  function getAccessMode(user, pageId) {
    if (!user) return 'view';
    if (user.role === 'admin') return 'full';
    if (user.customPermissions && user.customPermissions.includes(pageId + ':full')) return 'full';
    const mode = PERMISSIONS.modes[pageId];
    if (!mode) return 'view';
    return mode[user.role] || 'view';
  }

  // هل الصفحة مقتصرة على قسم المستخدم؟
  function scopeToDepartment(user, pageId) {
    if (!user) return null;
    if (user.role === 'admin' || user.role === 'hr_manager' || user.role === 'accountant') return null;
    const scoped = PERMISSIONS.departmentScoped[pageId] || [];
    if (scoped.includes(user.role)) {
      return user.department;
    }
    return null;
  }

  // فلترة قائمة المستخدمين بحسب القسم
  function getAccessibleUsers(viewer, allUsers) {
    if (!viewer) return [];
    if (viewer.role === 'admin' || viewer.role === 'hr_manager') return allUsers;
    // المديرين الآخرين يرون فقط المستخدمين في قسمهم
    return allUsers.filter(u => u.department === viewer.department);
  }

  // هل يمكن لمستخدم رؤية موظف معين؟
  function canViewEmployee(viewer, employee) {
    if (!viewer || !employee) return false;
    if (viewer.role === 'admin' || viewer.role === 'hr_manager') return true;
    if (viewer.role === 'accountant') return true;
    // المستخدم نفسه
    if (viewer.employeeId === employee.id) return true;
    // مدير القسم
    if (PERMISSIONS.departmentScoped.hr.includes(viewer.role)) {
      return viewer.department === employee.department;
    }
    return false;
  }

  // --- معادلات التكلفة (مطابقة لـ التكلفه.xlsx) ---
  // تكلفة العبوة الواحدة في الكرتون الواحد
  function rawMaterialsPerCarton(productCode, db) {
    const p = db.products.find(x => x.code === productCode);
    if (!p) return 0;
    const rm = db.costs.rawMaterials;
    const bpc = p.bottlesPerCarton;
    // حسب هيكلية المعادلات: الكرتون له أنبولات واحدة، غطاء/ليبل/غراء ليبل × عدد العبوات
    // شرنك وكرتون وغراء كرتون مرة واحدة لكل كرتون
    let cost = 0;
    if (p.size === "1.5 لتر") {
      cost += rm.anboula_205.unitCost;           // أنبولات واحدة
      cost += rm.shrinka.unitCost;                 // شرنك واحد (اختياري حسب التغليف)
      cost += rm.ghetaa.unitCost * bpc;            // غطاء × عدد العبوات
      cost += rm.label.unitCost * bpc;             // ليبل × عدد العبوات
      cost += rm.gharaaLabel.unitCost * bpc;       // غراء ليبل × عدد العبوات
      if (p.packaging === "كرتون") {
        cost += rm.karton.unitCost;                // كرتون واحد
        cost += rm.gharaaKarton.unitCost;          // غراء كرتون
      }
    } else if (p.size === "750 مل") {
      cost += rm.anboula_205.unitCost;
      cost += rm.shrinka.unitCost;
      cost += rm.ghetaa.unitCost * bpc;
      cost += rm.label.unitCost * bpc;
      cost += rm.gharaaLabel.unitCost * bpc;
      if (p.packaging === "كرتون") {
        cost += rm.karton.unitCost;
        cost += rm.gharaaKarton.unitCost;
      }
    } else if (p.size === "330 مل") {
      cost += rm.anboula_205.unitCost;
      cost += rm.shrinka.unitCost;
      cost += rm.ghetaa.unitCost * bpc;
      cost += rm.label.unitCost * bpc;
      cost += rm.gharaaLabel.unitCost * bpc;
      if (p.packaging === "كرتون") {
        cost += rm.karton.unitCost;
        cost += rm.gharaaKarton.unitCost;
      }
    }
    return cost;
  }

  // تكلفة الرواتب للكرتون
  function salaryPerCarton(db) {
    const monthly = db.costs.salaries.monthlyTotal;
    const monthlyProd = db.costs.production.monthlyProductionCartons;
    return monthlyProd > 0 ? monthly / monthlyProd : 0;
  }

  // تكلفة المياه للكرتون
  function waterPerCarton(db) {
    const w = db.costs.water;
    const prod = db.costs.production;
    // إجمالي البوز اليومي × سعر البوزه ÷ الإنتاج اليومي بالكرتون
    const totalBoozaDaily = w.dailyBoozaFromWell + w.dailyBoozaPurchased;
    const dailyCost = totalBoozaDaily * w.boozaPriceYER;
    const dailyProdCartons = prod.monthlyProductionCartons / prod.daysPerMonth;
    return dailyProdCartons > 0 ? dailyCost / dailyProdCartons : 0;
  }

  // تكلفة المختبر للكرتون
  function labPerCarton(db) {
    const monthly = db.costs.lab.yearlyExpenses / 12;
    const monthlyProd = db.costs.production.monthlyProductionCartons;
    return monthlyProd > 0 ? monthly / monthlyProd : 0;
  }

  // تكلفة الصيانة للكرتون
  function maintenancePerCarton(db) {
    const monthly = db.costs.maintenance.yearlyExpenses / 12;
    const monthlyProd = db.costs.production.monthlyProductionCartons;
    return monthlyProd > 0 ? monthly / monthlyProd : 0;
  }

  // تكلفة الإهلاك للكرتون
  function depreciationPerCarton(db) {
    const d = db.costs.depreciation;
    const monthly = (d.equipmentValue / d.usefulLifeYears) / 12;
    const monthlyProd = db.costs.production.monthlyProductionCartons;
    return monthlyProd > 0 ? monthly / monthlyProd : 0;
  }

  // التالف المسموح (2% من المواد الخام)
  function wastePerCarton(productCode, db) {
    return rawMaterialsPerCarton(productCode, db) * (db.costs.waste.allowedPercent / 100);
  }

  // التكلفة الكلية للكرتون لكل صنف
  function costPerCarton(productCode, db) {
    const rm = rawMaterialsPerCarton(productCode, db);
    const sal = salaryPerCarton(db);
    const wat = waterPerCarton(db);
    const lab = labPerCarton(db);
    const mnt = maintenancePerCarton(db);
    const dep = depreciationPerCarton(db);
    const wst = wastePerCarton(productCode, db);
    return { rawMaterials: rm, salary: sal, water: wat, lab: lab, maintenance: mnt, depreciation: dep, waste: wst, total: rm + sal + wat + lab + mnt + dep + wst };
  }

  // --- نقطة التعادل (لجميع الأصناف بمعادلة موزونة) ---
  // نقطة التعادل = إجمالي المصروفات العمومية / متوسط هامش المساهمة الموزون
  function breakEven(db) {
    // 1) نسبة كل صنف من الإنتاج (نحسب من سجل الإنتاج حتى الآن)
    const productionByProduct = {};
    db.productionLog.forEach(p => {
      productionByProduct[p.productCode] = (productionByProduct[p.productCode] || 0) + p.qty;
    });
    const totalProd = Object.values(productionByProduct).reduce((a, b) => a + b, 0);
    const hasProduction = totalProd > 0;

    // 2) لكل صنف: متوسط السعر، التكلفة، هامش المساهمة، النسبة، الموزون
    let weightedMargin = 0;
    const rows = db.products.map(prod => {
      const cost = costPerCarton(prod.code, db);
      const price = db.pricing.find(p => p.code === prod.code);
      const avgPrice = price ? (price.retailPrice + price.wholesalePrice) / 2 : 0;
      const margin = avgPrice - cost.total;
      const prodQty = productionByProduct[prod.code] || 0;
      // إذا لا يوجد إنتاج، نستخدم نسبة متساوية بين الأصناف
      const share = hasProduction ? (prodQty / totalProd) : (1 / db.products.length);
      weightedMargin += margin * share;
      return { code: prod.code, name: prod.name, cost: cost.total, price: avgPrice, margin, share, production: prodQty };
    });

    // 3) المصروفات العمومية الشهرية
    const overheadMonthly = (db.costs.salaries.monthlyTotal) +
                          (db.costs.lab.yearlyExpenses / 12) +
                          (db.costs.maintenance.yearlyExpenses / 12) +
                          (db.costs.depreciation.equipmentValue / db.costs.depreciation.usefulLifeYears / 12);

    // 4) نقطة التعادل الشهرية
    const breakEvenMonthly = weightedMargin > 0 ? overheadMonthly / weightedMargin : 0;

    return { rows, weightedMargin, overheadMonthly, breakEvenMonthly };
  }

  // --- حساب المخزون (رصيد = افتتاحي + إنتاج - مصروف) ---
  function inventory(db) {
    const productionByProduct = {};
    db.productionLog.forEach(p => { productionByProduct[p.productCode] = (productionByProduct[p.productCode] || 0) + p.qty; });

    const dispatchByProduct = {};
    db.vouchers.forEach(v => {
      if (!dispatchByProduct[v.product]) dispatchByProduct[v.product] = 0;
      dispatchByProduct[v.product] += v.qty;
    });
    db.salesLog.forEach(s => {
      // نخصم من المخزون بناءً على الكمية المباعة حسب كل صنف؟ سنفترض أن المبيعات تشمل 750-K افتراضياً
      // لتبسيط النظام نخصص المبيعات حسب نسبة الإنتاج
    });

    return db.products.map(p => {
      const opening = (db.inventoryOpening.find(o => o.productCode === p.code) || { qty: 0 }).qty;
      const produced = productionByProduct[p.code] || 0;
      const dispatched = dispatchByProduct[p.code] || 0;
      const balance = opening + produced - dispatched;
      return { code: p.code, name: p.name, opening, produced, dispatched, balance };
    });
  }

  // --- مؤشرات لوحة التحكم ---
  function dashboardKPI(db) {
    // الإنتاج اليومي
    const today = new Date().toISOString().split('T')[0];
    const todayProd = db.productionLog.filter(p => p.date === today).reduce((s, p) => s + p.qty, 0);

    // الإنتاج الشهري
    const currentMonth = today.slice(0, 7);
    const monthProd = db.productionLog.filter(p => p.date.startsWith(currentMonth)).reduce((s, p) => s + p.qty, 0);

    // المبيعات الشهرية (نقدية + آجلة)
    const monthSales = db.salesLog.filter(s => s.date.startsWith(currentMonth));
    const totalSalesQty = monthSales.reduce((s, x) => s + x.qty, 0);
    const totalSalesAmount = monthSales.reduce((s, x) => s + x.credit + x.cash, 0);
    const totalCollection = monthSales.reduce((s, x) => s + x.collection, 0);

    // المصروفات الشهرية
    const monthExp = db.expensesLog.filter(e => e.date.startsWith(currentMonth)).reduce((s, e) => s + e.amount, 0);

    // تكلفة الإنتاج الفعلية (المتوسط)
    const avgCost = db.products.reduce((s, p) => s + costPerCarton(p.code, db).total, 0) / db.products.length;

    // المديونيات
    const totalReceivables = db.salesReps.reduce((s, r) => {
      const repSales = db.salesLog.filter(x => x.repCode === r.code && x.date.startsWith(currentMonth));
      const totalCredit = repSales.reduce((a, b) => a + b.credit, 0);
      const totalCollection = repSales.reduce((a, b) => a + b.collection, 0);
      return s + r.openingBalance + totalCredit - totalCollection;
    }, 0);

    // المخزون الإجمالي
    const totalInventory = inventory(db).reduce((s, i) => s + i.balance, 0);

    return { todayProd, monthProd, totalSalesQty, totalSalesAmount, totalCollection, monthExp, avgCost, totalReceivables, totalInventory };
  }

  // --- مندوب مبيعات: ملخص ---
  function salesRepSummary(repCode, db) {
    const rep = db.salesReps.find(r => r.code === repCode);
    if (!rep) return null;
    const month = new Date().toISOString().slice(0, 7);
    const entries = db.salesLog.filter(s => s.repCode === repCode && s.date.startsWith(month));
    const qty = entries.reduce((s, e) => s + e.qty, 0);
    const credit = entries.reduce((s, e) => s + e.credit, 0);
    const cash = entries.reduce((s, e) => s + e.cash, 0);
    const collection = entries.reduce((s, e) => s + e.collection, 0);
    const balance = rep.openingBalance + credit - collection;
    return { ...rep, qty, credit, cash, collection, balance, entries };
  }

  // --- تقرير الأرباح والخسائر ---
  function profitLoss(db) {
    const month = new Date().toISOString().slice(0, 7);
    const monthSales = db.salesLog.filter(s => s.date.startsWith(month));
    const revenue = monthSales.reduce((s, e) => s + e.credit + e.cash, 0);

    const monthExp = db.expensesLog.filter(e => e.date.startsWith(month)).reduce((s, e) => s + e.amount, 0);

    const monthProd = db.productionLog.filter(p => p.date.startsWith(month));
    let cogs = 0;
    monthProd.forEach(p => {
      cogs += costPerCarton(p.productCode, db).total * p.qty;
    });

    const grossProfit = revenue - cogs;
    const netProfit = grossProfit - monthExp;

    return { revenue, cogs, grossProfit, monthExp, netProfit };
  }

  // --- API عامة ---
  return {
    init, load, save, reset,
    getSession, setSession, clearSession,
    rawMaterialsPerCarton, costPerCarton,
    breakEven, inventory, dashboardKPI,
    salesRepSummary, profitLoss,
    // === نظام الصلاحيات (RBAC) ===
    PERMISSIONS, canAccess, getAccessMode, scopeToDepartment, getAccessibleUsers, canViewEmployee,
    // === دوال مساعدة لعرض الأرقام والعملات ===
    fmt: function(num, decimals) {
      // تنسيق رقم بفاصلة عشرية + فواصل آلاف (نمط عربي)
      if (num === null || num === undefined || isNaN(num)) return '0.00';
      const d = decimals !== undefined ? decimals : 2;
      const parts = Number(num).toFixed(d).split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return parts.join('.');
    },
    money: function(num, currency) {
      // عرض مبلغ بعملة
      const formatted = this.fmt(num, 2);
      if (currency) return formatted + ' ' + currency;
      return formatted + ' ر.ي';
    }
  };
})();
