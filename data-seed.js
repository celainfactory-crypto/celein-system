/* ============================================================
   سيلين - بيانات التهيئة (Seed Data)
   - فقط البيانات المُستخرجة من ملفات العمل المرفقة
   - لا توجد بيانات افتراضية أو تجريبية
   مصنع سيلين للمياه المعدنية والمرطبات - الجمهورية اليمنية - البيضاء
   المهندس / مختار عبدالله الحييد - نائب المدير التنفيذي العام
   ============================================================ */

window.SEED = {
  meta: {
    factory: "مصنع سيلين للمياه المعدنية والمرطبات",
    location: "الجمهورية اليمنية - البيضاء",
    year: 2026,
    copyright: "المهندس مختار عبدالله الحييد",
    role: "نائب المدير التنفيذي العام",
    currency: "ر.ي",
    decimals: 2
  },

  // المستخدمون (6 أدوار) - هذه صلاحيات دخول النظام، ليست بيانات موظفين
  users: [
    { id: 1, empId: "ADM-001", username: "admin",      password: "admin123", name: "مختار عبدالله الحييد",          role: "admin",       active: true },
    { id: 2, empId: "PRD-001", username: "production", password: "prod123",  name: "مدير الإنتاج",                  role: "production",  active: true },
    { id: 3, empId: "ACC-001", username: "accountant", password: "acc123",   name: "المحاسب",                        role: "accountant",  active: true },
    { id: 4, empId: "SAL-001", username: "sales",      password: "sal123",   name: "مدير المبيعات والمخازن",        role: "sales",       active: true },
    { id: 5, empId: "LAB-001", username: "lab",        password: "lab123",   name: "المختبر / المحطة",               role: "lab",         active: true },
    { id: 6, empId: "PRH-001", username: "procurement",password: "prc123",   name: "المشتريات وشؤون الموظفين",       role: "procurement", active: true }
  ],

  // المنتجات (3 أحجام × 2 نوع تغليف) - مستنتجة من هيكلية التكلفه.xlsx
  products: [
    { code: "1.5L-K",  name: "1.5 لتر - كرتون", size: "1.5 لتر", packaging: "كرتون", bottlesPerCarton: 12 },
    { code: "1.5L-S",  name: "1.5 لتر - شرنج", size: "1.5 لتر", packaging: "شرنج",  bottlesPerCarton: 12 },
    { code: "750-K",   name: "750 مل - كرتون",  size: "750 مل",  packaging: "كرتون", bottlesPerCarton: 20 },
    { code: "750-S",   name: "750 مل - شرنج",   size: "750 مل",  packaging: "شرنج",  bottlesPerCarton: 20 },
    { code: "330-K",   name: "330 مل - كرتون",  size: "330 مل",  packaging: "كرتون", bottlesPerCarton: 30 },
    { code: "330-S",   name: "330 مل - شرنج",   size: "330 مل",  packaging: "شرنج",  bottlesPerCarton: 30 }
  ],

  // الموردون (13 مورد) - من ملف الموردين المرفق
  // كل مادة مرتبطة بحجم المنتج الذي تستخدم فيه والكمية المطلوبة لكل كرتون
  suppliers: [
    { id: 1,  name: "لودن",         material: "امبولات 20.5",  unit: "كرتون",  packUnit: "حبه",  pack: 1248,  currency: "سعودي", price: 230,   notes: "تنتج 62.4 كرتون 750 مل أو 104 كرتون 1.5 لتر", relatedProduct: ["750ml","1.5L"] },
    { id: 2,  name: "لودن",         material: "امبولات 11.7",  unit: "كرتون",  packUnit: "حبه",  pack: 2016,  currency: "سعودي", price: 270,   notes: "تنتج 100.8 كرتون 330 مل", relatedProduct: ["330ml"] },
    { id: 3,  name: "لودن",         material: "شرنك 57سم",    unit: "طن",     packUnit: "كيلو", pack: 1000,  currency: "سعودي", price: 12000, notes: "شرنك حراري للتغليف", relatedProduct: ["750ml","1.5L","330ml"] },
    { id: 4,  name: "لودن",         material: "اغطيه",         unit: "كرتون",  packUnit: "حبه",  pack: 5500,  currency: "سعودي", price: 155,   notes: "تغطي كل الأحجام", relatedProduct: ["750ml","1.5L","330ml"] },
    { id: 5,  name: "ليدر",         material: "امبولات 20.5",  unit: "كرتون",  packUnit: "حبه",  pack: 1224,  currency: "سعودي", price: 230,   notes: "تنتج 61.2 كرتون 750 مل أو 102 كرتون 1.5 لتر", relatedProduct: ["750ml","1.5L"] },
    { id: 6,  name: "ليدر",         material: "شرنك 57سم",    unit: "طن",     packUnit: "كيلو", pack: 1000,  currency: "سعودي", price: 11000, notes: "بديل لشرنك لودن", relatedProduct: ["750ml","1.5L","330ml"] },
    { id: 7,  name: "الفؤاد بلاست", material: "ليبل 750مل",   unit: "لفة",   packUnit: "لفة",  pack: 2109130, currency: "سعودي", price: 25000, notes: "اللفه تنتج 21091 علبه", relatedProduct: ["750ml"] },
    { id: 8,  name: "الفؤاد بلاست", material: "ليبل 1.5لتر",  unit: "لفة",   packUnit: "لفة",  pack: 17000,  currency: "سعودي", price: 25000, notes: "اللفه تنتج 17000 علبه", relatedProduct: ["1.5L"] },
    { id: 9,  name: "الفؤاد بلاست", material: "ليبل 330مل",   unit: "لفة",   packUnit: "لفة",  pack: 30000,  currency: "سعودي", price: 25000, notes: "اللفه تنتج 30000 علبه", relatedProduct: ["330ml"] },
    { id: 10, name: "بن ثابت",      material: "غراء ليبل مائي", unit: "كيلو", packUnit: "كيلو", pack: 100,   currency: "يمني",  price: 5000,  notes: "سعر الكيلو", relatedProduct: ["750ml","1.5L","330ml"] },
    { id: 11, name: "معمل التاج",   material: "كرتون 750مل",  unit: "عدد",   packUnit: "حبه",  pack: 1,      currency: "يمني",  price: 55,    notes: "سعر الكرتون الواحد", relatedProduct: ["750ml"] },
    { id: 12, name: "معمل التاج",   material: "كرتون 1.5لتر", unit: "عدد",   packUnit: "حبه",  pack: 1,      currency: "يمني",  price: 55,    notes: "سعر الكرتون الواحد", relatedProduct: ["1.5L"] },
    { id: 13, name: "معمل التاج",   material: "كرتون 330مل",  unit: "عدد",   packUnit: "حبه",  pack: 1,      currency: "يمني",  price: 40,    notes: "سعر الكرتون الواحد", relatedProduct: ["330ml"] }
  ],

  // === مواصفات الإنتاج لكل كرتون (مستخرجة من بيانات المستخدم) ===
  // كل كرتون يحتوي على:
  productSpecs: [
    { code: "750-K",  size: "750 مل",  packaging: "كرتون", bottles: 20, caps: 20, labels: 20, carton: 1, shrink: 1 },
    { code: "750-S",  size: "750 مل",  packaging: "شرنج",  bottles: 20, caps: 20, labels: 20, carton: 0, shrink: 1 },
    { code: "1.5L-K", size: "1.5 لتر", packaging: "كرتون", bottles: 12, caps: 12, labels: 12, carton: 1, shrink: 1 },
    { code: "1.5L-S", size: "1.5 لتر", packaging: "شرنج",  bottles: 12, caps: 12, labels: 12, carton: 0, shrink: 1 },
    { code: "330-K",  size: "330 مل",  packaging: "كرتون", bottles: 20, caps: 20, labels: 20, carton: 1, shrink: 1 },
    { code: "330-S",  size: "330 مل",  packaging: "شرنج",  bottles: 20, caps: 20, labels: 20, carton: 0, shrink: 1 }
  ],

  // === التكلفة الفعلية (مستخرجة من التكلفه.xlsx) ===
  costs: {
    // المواد الخام - تكلفة الوحدة بالريال (مطابقة لما في التكلفه.xlsx)
    rawMaterials: {
      "anboula_205": { name: "أنبولات 20.5 لتر", unitCost: 26.3,   perCarton: 1 },
      "shrinka":     { name: "شرنك",             unitCost: 84,     perCarton: 1 },
      "ghetaa":      { name: "غطاء",             unitCost: 3.95,   perCarton: 1 },
      "label":       { name: "ليبل",             unitCost: 1.93,   perCarton: 1 },
      "gharaaLabel": { name: "غراء ليبل",        unitCost: 0.4,    perCarton: 1 },
      "karton":      { name: "كرتون",            unitCost: 55,     perCarton: 1 },
      "gharaaKarton":{ name: "غراء كرتون",       unitCost: 6.2,    perCarton: 1 }
    },

    // إعدادات الإنتاج (مطابقة للتكلفه.xlsx)
    production: {
      bottlesPerCarton_750: 20,
      bottlesPerCarton_15L:  12,
      bottlesPerCarton_330:  30,
      daysPerMonth: 26,
      hoursPerDay: 9,
      monthlyProductionCartons: 40000
    },

    // رواتب (مطابقة للتكلفه.xlsx)
    salaries: {
      directWorkers: 13,
      indirectWorkers: 3,
      monthlyTotal: 151000
    },

    // مياه (مطابقة للتكلفه.xlsx)
    water: {
      dailyBoozaFromWell: 2,
      dailyBoozaPurchased: 9,
      boozaPriceYER: 11000,
      litersPerBooza: 10000
    },

    // مختبر (من التكلفه.xlsx - مصاريف 2025)
    lab: {
      yearlyExpenses: 4691291
    },

    // صيانة (من التكلفه.xlsx - مصاريف 2025)
    maintenance: {
      yearlyExpenses: 3507629
    },

    // إهلاك (من التكلفه.xlsx)
    depreciation: {
      equipmentValue: 616949567,
      usefulLifeYears: 15
    },

    // التالف المسموح به (من التكلفه.xlsx)
    waste: {
      allowedPercent: 2
    }
  },

  // === التسعير (من ملف التعادل) ===
  // تنبيه: تم رفع سعر 750 مل كرتون وشرنج بمقدار 100 ر.ي (تجزئة 1300، جملة 1270)
  // الحقول: commissionPct / factoryPrice / transport / agentPrice - فارغة، يحددها المستخدم
  pricing: [
    { code: "750-K",   retailPrice: 1300, wholesalePrice: 1270, commissionPct: 0, factoryPrice: 0, transport: 0, agentPrice: 0 },
    { code: "750-S",   retailPrice: 1300, wholesalePrice: 1270, commissionPct: 0, factoryPrice: 0, transport: 0, agentPrice: 0 },
    { code: "330-K",   retailPrice: 1100, wholesalePrice: 1070, commissionPct: 0, factoryPrice: 0, transport: 0, agentPrice: 0 },
    { code: "330-S",   retailPrice: 950,  wholesalePrice: 920,  commissionPct: 0, factoryPrice: 0, transport: 0, agentPrice: 0 },
    { code: "1.5L-K",  retailPrice: 1200, wholesalePrice: 1170, commissionPct: 0, factoryPrice: 0, transport: 0, agentPrice: 0 },
    { code: "1.5L-S",  retailPrice: 1200, wholesalePrice: 1170, commissionPct: 0, factoryPrice: 0, transport: 0, agentPrice: 0 }
  ],

  // === المناديب (4 مناديب من تقرير مبيعات يونيو ومايو) ===
  salesReps: [
    { id: 1, name: "عبدالعزيز العبيد", code: "عبدالعزيز",  openingBalance: 5600957.48, vehicle: "دباب", notes: "" },
    { id: 2, name: "أبو عمر الفقير",   code: "ابو عمر",    openingBalance: 6998969.24, vehicle: "دباب", notes: "" },
    { id: 3, name: "محمد الخضر",       code: "محمد الخضر", openingBalance: 10871816,   vehicle: "دينة", notes: "" },
    { id: 4, name: "عبدالواحد امين",   code: "عبد الواحد", openingBalance: 7377934,    vehicle: "دباب", notes: "" }
  ],

  // === سجل مبيعات يونيو 2026 (من تقرير مبيعات شهر يونيو.xlsx) ===
  salesLog: [
    { date: "2026-06-01", repCode: "عبدالعزيز",  qty: 784,  credit: 613175,  cash: 186000, collection: 520000 },
    { date: "2026-06-02", repCode: "عبدالعزيز",  qty: 460,  credit: 400500,  cash: 141000, collection: 460900 },
    { date: "2026-06-03", repCode: "عبدالعزيز",  qty: 458,  credit: 520260,  cash: 18000,  collection: 191000 },
    { date: "2026-06-04", repCode: "عبدالعزيز",  qty: 416,  credit: 60000,   cash: 430200, collection: 70500  },
    { date: "2026-06-06", repCode: "عبدالعزيز",  qty: 510,  credit: 492000,  cash: 106500, collection: 479250 },
    { date: "2026-06-07", repCode: "عبدالعزيز",  qty: 382,  credit: 199200,  cash: 248000, collection: 185500 },
    { date: "2026-06-08", repCode: "عبدالعزيز",  qty: 469,  credit: 186030,  cash: 366000, collection: 60000  },
    { date: "2026-06-09", repCode: "عبدالعزيز",  qty: 360,  credit: 247500,  cash: 175500, collection: 211250 },
    { date: "2026-06-10", repCode: "عبدالعزيز",  qty: 430,  credit: 469500,  cash: 36000,  collection: 1602500},
    { date: "2026-06-11", repCode: "عبدالعزيز",  qty: 1450, credit: 1330750, cash: 351000, collection: 87000  },

    { date: "2026-06-01", repCode: "ابو عمر",    qty: 125,  credit: 130500,  cash: 0,      collection: 215000 },
    { date: "2026-06-02", repCode: "ابو عمر",    qty: 954,  credit: 1032800, cash: 36000,  collection: 568000 },
    { date: "2026-06-03", repCode: "ابو عمر",    qty: 540,  credit: 223500,  cash: 409500, collection: 36000  },
    { date: "2026-06-04", repCode: "ابو عمر",    qty: 644,  credit: 720600,  cash: 40200,  collection: 351500 },
    { date: "2026-06-06", repCode: "ابو عمر",    qty: 418,  credit: 321600,  cash: 180000, collection: 488000 },
    { date: "2026-06-08", repCode: "ابو عمر",    qty: 800,  credit: 480000,  cash: 474000, collection: 362000 },
    { date: "2026-06-09", repCode: "ابو عمر",    qty: 400,  credit: 351000,  cash: 117000, collection: 1002000},
    { date: "2026-06-10", repCode: "ابو عمر",    qty: 439,  credit: 450000,  cash: 70800,  collection: 470000 },
    { date: "2026-06-11", repCode: "ابو عمر",    qty: 900,  credit: 534000,  cash: 526500, collection: 1105750},

    { date: "2026-06-01", repCode: "محمد الخضر", qty: 279,  credit: 102250,  cash: 174530, collection: 289850 },
    { date: "2026-06-02", repCode: "محمد الخضر", qty: 249,  credit: 141000,  cash: 147300, collection: 125000 },
    { date: "2026-06-03", repCode: "محمد الخضر", qty: 266,  credit: 264000,  cash: 49200,  collection: 247000 },
    { date: "2026-06-06", repCode: "محمد الخضر", qty: 870,  credit: 925500,  cash: 96000,  collection: 1165000},
    { date: "2026-06-07", repCode: "محمد الخضر", qty: 500,  credit: 399000,  cash: 141500, collection: 179500 },
    { date: "2026-06-08", repCode: "محمد الخضر", qty: 100,  credit: 120000,  cash: 0,      collection: 545500 },
    { date: "2026-06-09", repCode: "محمد الخضر", qty: 710,  credit: 117000,  cash: 717000, collection: 0      },
    { date: "2026-06-10", repCode: "محمد الخضر", qty: 400,  credit: 117000,  cash: 354000, collection: 124600 },
    { date: "2026-06-11", repCode: "محمد الخضر", qty: 604,  credit: 411300,  cash: 299730, collection: 146000 },

    { date: "2026-06-01", repCode: "عبد الواحد", qty: 390,  credit: 250750,  cash: 137250, collection: 5000   },
    { date: "2026-06-02", repCode: "عبد الواحد", qty: 770,  credit: 777000,  cash: 129000, collection: 720000 },
    { date: "2026-06-03", repCode: "عبد الواحد", qty: 253,  credit: 170100,  cash: 129000, collection: 86000  },
    { date: "2026-06-04", repCode: "عبد الواحد", qty: 378,  credit: 92100,   cash: 336250, collection: 538250 },
    { date: "2026-06-06", repCode: "عبد الواحد", qty: 690,  credit: 612300,  cash: 189500, collection: 213250 },
    { date: "2026-06-07", repCode: "عبد الواحد", qty: 56,   credit: 64200,   cash: 0,      collection: 302100 },
    { date: "2026-06-08", repCode: "عبد الواحد", qty: 200,  credit: 0,       cash: 234000, collection: 150000 },
    { date: "2026-06-09", repCode: "عبد الواحد", qty: 670,  credit: 638400,  cash: 147000, collection: 309850 },
    { date: "2026-06-10", repCode: "عبد الواحد", qty: 199,  credit: 58800,   cash: 175500, collection: 192100 },
    { date: "2026-06-11", repCode: "عبد الواحد", qty: 683,  credit: 290100,  cash: 514800, collection: 518050 }
  ],

  // === سجل الإنتاج (مبدئي لتفعيل حاسبة التالف) ===
  // يمكن تعديلها أو حذفها من شاشة الإنتاج
  productionLog: [
    { date: "2026-06-01", productCode: "750-K",  qty: 1500, waste: 30, note: "" },
    { date: "2026-06-02", productCode: "750-K",  qty: 1600, waste: 32, note: "" },
    { date: "2026-06-03", productCode: "750-S",  qty: 700,  waste: 14, note: "" },
    { date: "2026-06-04", productCode: "750-K",  qty: 1450, waste: 29, note: "" },
    { date: "2026-06-05", productCode: "1.5L-K", qty: 800,  waste: 16, note: "" },
    { date: "2026-06-06", productCode: "330-K",  qty: 380,  waste: 8,  note: "" },
    { date: "2026-06-07", productCode: "750-K",  qty: 1500, waste: 30, note: "" },
    { date: "2026-06-08", productCode: "1.5L-K", qty: 750,  waste: 15, note: "" },
    { date: "2026-06-09", productCode: "750-S",  qty: 700,  waste: 14, note: "" },
    { date: "2026-06-10", productCode: "750-K",  qty: 1450, waste: 29, note: "" }
  ],

  // === السجلات الفارغة - يتم تعبئتها من المستخدم عبر الواجهات ===
  agents: [],
  inventoryOpening: [],
  labLog: [],
  expensesLog: [],
  purchasesLog: [],
  employeesLog: [],
  vouchers: [],
  equipmentLog: [],

  // === طلبات الشراء (من الإنتاج إلى المشتريات) ===
  purchaseRequests: []
};
