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

  // المستخدمون (تم إنشاؤها من كشف الموظفين + الإدارة العليا)
  users: [{"id": 1, "empId": "ADM-001", "username": "admin", "password": "admin123", "name": "مختار عبدالله الحييد", "role": "admin", "department": "الإدارة العليا", "employeeId": 36, "customPermissions": [], "active": true}, {"id": 2, "empId": "EXC-001", "username": "executive", "password": "exc123", "name": "علي أحمد ديان العطري", "role": "executive", "department": "الإدارة العليا", "employeeId": null, "customPermissions": [], "active": true}, {"id": 3, "empId": "CHM-001", "username": "chairman", "password": "chm123", "name": "حسين أحمد السعيدي", "role": "chairman", "department": "مجلس الإدارة", "employeeId": null, "customPermissions": [], "active": true}, {"id": 4, "empId": "HRM-001", "username": "hr", "password": "hr123", "name": "سالم علي محسن الشتيبي", "role": "hr_manager", "department": "الموارد البشرية", "employeeId": 1, "customPermissions": [], "active": true}, {"id": 5, "empId": "PRD-001", "username": "production", "password": "prod123", "name": "بشار شكري محمد القدسي", "role": "production", "department": "الإنتاج", "employeeId": 15, "customPermissions": [], "active": true}, {"id": 6, "empId": "ACC-001", "username": "accountant", "password": "acc123", "name": "أنور سليم محمد الخولاني", "role": "accountant", "department": "الحسابات", "employeeId": 21, "customPermissions": [], "active": true}, {"id": 7, "empId": "SAL-001", "username": "sales", "password": "sal123", "name": "محمد الجنيدي هاشم عبده", "role": "sales", "department": "المبيعات", "employeeId": 18, "customPermissions": [], "active": true}, {"id": 8, "empId": "LAB-001", "username": "lab", "password": "lab123", "name": "عيسى محمد عبدالرحمن سعيد", "role": "lab", "department": "المختبر", "employeeId": 9, "customPermissions": [], "active": true}, {"id": 9, "empId": "PRH-001", "username": "procurement", "password": "prc123", "name": "صالح علي أحمد الوحيشي", "role": "procurement", "department": "المشتريات", "employeeId": 17, "customPermissions": [], "active": true}, {"id": 102, "empId": "USR-002", "username": "id002", "password": "id002", "name": "يوسف حسين حسن العبيدي", "role": "worker", "department": "الإنتاج", "employeeId": 2, "customPermissions": [], "active": true}, {"id": 103, "empId": "USR-003", "username": "id003", "password": "id003", "name": "طارق علي صالح القيسي", "role": "worker", "department": "الإنتاج", "employeeId": 3, "customPermissions": [], "active": true}, {"id": 104, "empId": "USR-004", "username": "id004", "password": "id004", "name": "محمد أحمد عبدالغني الفقير", "role": "worker", "department": "المبيعات", "employeeId": 4, "customPermissions": [], "active": true}, {"id": 105, "empId": "USR-005", "username": "id005", "password": "id005", "name": "عبدربه محمد عبدربه العزاني", "role": "worker", "department": "الأمن", "employeeId": 5, "customPermissions": [], "active": true}, {"id": 106, "empId": "USR-006", "username": "id006", "password": "id006", "name": "مبارك حمود علي اليوسفي", "role": "worker", "department": "الإنتاج", "employeeId": 6, "customPermissions": [], "active": true}, {"id": 107, "empId": "USR-007", "username": "id007", "password": "id007", "name": "علي محمد سالم القيسي", "role": "worker", "department": "الإنتاج", "employeeId": 7, "customPermissions": [], "active": true}, {"id": 108, "empId": "USR-008", "username": "id008", "password": "id008", "name": "أحمد العبيّد عبده عبدالعزيز عبده", "role": "worker", "department": "المبيعات", "employeeId": 8, "customPermissions": [], "active": true}, {"id": 110, "empId": "USR-010", "username": "id010", "password": "id010", "name": "ياسر علي حسين العروي", "role": "worker", "department": "الإنتاج", "employeeId": 10, "customPermissions": [], "active": true}, {"id": 111, "empId": "USR-011", "username": "id011", "password": "id011", "name": "محمد طه ناصر عبده", "role": "worker", "department": "الإنتاج", "employeeId": 11, "customPermissions": [], "active": true}, {"id": 112, "empId": "USR-012", "username": "id012", "password": "id012", "name": "جبريل شيخ عمر توكه", "role": "worker", "department": "الخدمات", "employeeId": 12, "customPermissions": [], "active": true}, {"id": 113, "empId": "USR-013", "username": "id013", "password": "id013", "name": "السعيدي محمد الخضر عبده", "role": "worker", "department": "المبيعات", "employeeId": 13, "customPermissions": [], "active": true}, {"id": 114, "empId": "USR-014", "username": "id014", "password": "id014", "name": "صابر عمر أحمد السعيدي", "role": "worker", "department": "الإنتاج", "employeeId": 14, "customPermissions": [], "active": true}, {"id": 116, "empId": "USR-016", "username": "id016", "password": "id016", "name": "أحمد محمد عبدالقوي المظفري", "role": "worker", "department": "المبيعات", "employeeId": 16, "customPermissions": [], "active": true}, {"id": 119, "empId": "USR-019", "username": "id019", "password": "id019", "name": "أحمد محمد عبدالنبي الوحيشي", "role": "worker", "department": "الأمن", "employeeId": 19, "customPermissions": [], "active": true}, {"id": 120, "empId": "USR-020", "username": "id020", "password": "id020", "name": "حبيب توفيق مكرد القدسي", "role": "worker", "department": "المخازن", "employeeId": 20, "customPermissions": [], "active": true}, {"id": 122, "empId": "USR-022", "username": "id022", "password": "id022", "name": "محمد القاضي أحمد عبده", "role": "worker", "department": "العلاقات العامة", "employeeId": 22, "customPermissions": [], "active": true}, {"id": 123, "empId": "USR-023", "username": "id023", "password": "id023", "name": "ناصر محمد العزاني عبده", "role": "worker", "department": "الخدمات", "employeeId": 23, "customPermissions": [], "active": true}, {"id": 124, "empId": "USR-024", "username": "id024", "password": "id024", "name": "عبدالواحد أمين نعمان الصيري", "role": "worker", "department": "المبيعات", "employeeId": 24, "customPermissions": [], "active": true}, {"id": 125, "empId": "USR-025", "username": "id025", "password": "id025", "name": "المجعلي علي محمد عبده", "role": "worker", "department": "مخازن البيضاء", "employeeId": 25, "customPermissions": [], "active": true}, {"id": 126, "empId": "USR-026", "username": "id026", "password": "id026", "name": "علوي علي سالم القيسي", "role": "worker", "department": "الإنتاج", "employeeId": 26, "customPermissions": [], "active": true}, {"id": 127, "empId": "USR-027", "username": "id027", "password": "id027", "name": "أحمد محمد الحجي عبده", "role": "worker", "department": "الحسابات", "employeeId": 27, "customPermissions": [], "active": true}, {"id": 128, "empId": "USR-028", "username": "id028", "password": "id028", "name": "موسى محمد علي عبده", "role": "worker", "department": "الإنتاج", "employeeId": 28, "customPermissions": [], "active": true}, {"id": 129, "empId": "USR-029", "username": "id029", "password": "id029", "name": "تاج الدين إبراهيم حاج", "role": "worker", "department": "الخدمات", "employeeId": 29, "customPermissions": [], "active": true}, {"id": 130, "empId": "USR-030", "username": "id030", "password": "id030", "name": "مصطفى محمد سالم الهصيصي", "role": "worker", "department": "المبيعات", "employeeId": 30, "customPermissions": [], "active": true}, {"id": 131, "empId": "USR-031", "username": "id031", "password": "id031", "name": "طارق ناصر محمد العزاني", "role": "worker", "department": "المالية", "employeeId": 31, "customPermissions": [], "active": true}, {"id": 132, "empId": "USR-032", "username": "id032", "password": "id032", "name": "أحمد محمد أحمد الدباني", "role": "worker", "department": "مخازن البيضاء", "employeeId": 32, "customPermissions": [], "active": true}, {"id": 133, "empId": "USR-033", "username": "id033", "password": "id033", "name": "حسين سالم الفقير عبده", "role": "worker", "department": "الأمن", "employeeId": 33, "customPermissions": [], "active": true}, {"id": 134, "empId": "USR-034", "username": "id034", "password": "id034", "name": "منير صالح حسين العروي", "role": "worker", "department": "الإنتاج", "employeeId": 34, "customPermissions": [], "active": true}, {"id": 135, "empId": "USR-035", "username": "id035", "password": "id035", "name": "علي محمد عوض الشنهوز", "role": "worker", "department": "المخازن", "employeeId": 35, "customPermissions": [], "active": true}, {"id": 136, "empId": "USR-036", "username": "id036", "password": "id036", "name": "محمد الحييد مختار عبده", "role": "worker", "department": "الإدارة", "employeeId": 36, "customPermissions": [], "active": true}, {"id": 137, "empId": "USR-037", "username": "id037", "password": "id037", "name": "محمد أنور محمد الفروي", "role": "worker", "department": "الإنتاج", "employeeId": 37, "customPermissions": [], "active": true}, {"id": 138, "empId": "USR-038", "username": "id038", "password": "id038", "name": "حمزة مصطفى أحمد القاضي", "role": "worker", "department": "الإنتاج", "employeeId": 38, "customPermissions": [], "active": true}, {"id": 139, "empId": "USR-039", "username": "id039", "password": "id039", "name": "رياض عادل أحمد قايد", "role": "worker", "department": "الخدمات", "employeeId": 39, "customPermissions": [], "active": true}, {"id": 140, "empId": "USR-040", "username": "id040", "password": "id040", "name": "صالح أحمد صالح الجيشاني", "role": "worker", "department": "المخازن", "employeeId": 40, "customPermissions": [], "active": true}],


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
  employeesLog: [{"id": 1, "empId": "id001", "pdfId": "4", "name": "سالم علي محسن الشتيبي", "salary": 200000, "position": "مدير شؤون الموظفين", "department": "الموارد البشرية", "hireDate": "13/8/2022", "allowances": 0, "status": "active", "terminationStatus": null, "photo": null, "idCardPhoto": null, "idCardNumber": "", "idCardData": {}, "cv": null, "certificates": []}, {"id": 2, "empId": "id002", "pdfId": "7", "name": "يوسف حسين حسن العبيدي", "salary": 120000, "position": "عامل", "department": "الإنتاج", "hireDate": "1/4/2022", "allowances": 0, "status": "active", "terminationStatus": null, "photo": null, "idCardPhoto": null, "idCardNumber": "", "idCardData": {}, "cv": null, "certificates": []}, {"id": 3, "empId": "id003", "pdfId": "12", "name": "طارق علي صالح القيسي", "salary": 100000, "position": "مشغل آلة النفخ", "department": "الإنتاج", "hireDate": "25/6/2022", "allowances": 0, "status": "active", "terminationStatus": null, "photo": null, "idCardPhoto": null, "idCardNumber": "", "idCardData": {}, "cv": null, "certificates": []}, {"id": 4, "empId": "id004", "pdfId": "18", "name": "محمد أحمد عبدالغني الفقير", "salary": 100000, "position": "مندوب مبيعات", "department": "المبيعات", "hireDate": "16/7/2022", "allowances": 0, "status": "active", "terminationStatus": null, "photo": null, "idCardPhoto": null, "idCardNumber": "", "idCardData": {}, "cv": null, "certificates": []}, {"id": 5, "empId": "id005", "pdfId": "19", "name": "عبدربه محمد عبدربه العزاني", "salary": 80000, "position": "حارس أمن ليلي", "department": "الأمن", "hireDate": "28/7/2022", "allowances": 0, "status": "active", "terminationStatus": null, "photo": null, "idCardPhoto": null, "idCardNumber": "", "idCardData": {}, "cv": null, "certificates": []}, {"id": 6, "empId": "id006", "pdfId": "27", "name": "مبارك حمود علي اليوسفي", "salary": 120000, "position": "مشغل آلة الكرتون والشرنك", "department": "الإنتاج", "hireDate": "25/8/2022", "allowances": 0, "status": "active", "terminationStatus": null, "photo": null, "idCardPhoto": null, "idCardNumber": "", "idCardData": {}, "cv": null, "certificates": []}, {"id": 7, "empId": "id007", "pdfId": "33", "name": "علي محمد سالم القيسي", "salary": 90000, "position": "مشغل آلة الليبل", "department": "الإنتاج", "hireDate": "1/4/2022", "allowances": 0, "status": "active", "terminationStatus": null, "photo": null, "idCardPhoto": null, "idCardNumber": "", "idCardData": {}, "cv": null, "certificates": []}, {"id": 8, "empId": "id008", "pdfId": "37", "name": "أحمد العبيّد عبده عبدالعزيز عبده", "salary": 100000, "position": "مندوب مبيعات", "department": "المبيعات", "hireDate": "7/1/2023", "allowances": 0, "status": "active", "terminationStatus": null, "photo": null, "idCardPhoto": null, "idCardNumber": "", "idCardData": {}, "cv": null, "certificates": []}, {"id": 9, "empId": "id009", "pdfId": "54", "name": "عيسى محمد عبدالرحمن سعيد", "salary": 150000, "position": "كيميائي", "department": "المختبر", "hireDate": "24/8/2023", "allowances": 0, "status": "active", "terminationStatus": null, "photo": null, "idCardPhoto": null, "idCardNumber": "", "idCardData": {}, "cv": null, "certificates": []}, {"id": 10, "empId": "id010", "pdfId": "56", "name": "ياسر علي حسين العروي", "salary": 90000, "position": "خط سير، عامل", "department": "الإنتاج", "hireDate": "21/4/2024", "allowances": 0, "status": "active", "terminationStatus": null, "photo": null, "idCardPhoto": null, "idCardNumber": "", "idCardData": {}, "cv": null, "certificates": []}, {"id": 11, "empId": "id011", "pdfId": "61", "name": "محمد طه ناصر عبده", "salary": 80000, "position": "مشغل آلة التعبئة", "department": "الإنتاج", "hireDate": "2/11/2024", "allowances": 0, "status": "active", "terminationStatus": null, "photo": null, "idCardPhoto": null, "idCardNumber": "", "idCardData": {}, "cv": null, "certificates": []}, {"id": 12, "empId": "id012", "pdfId": "65", "name": "جبريل شيخ عمر توكه", "salary": 100000, "position": "عامل نظافة", "department": "الخدمات", "hireDate": "20/1/2025", "allowances": 0, "status": "active", "terminationStatus": null, "photo": null, "idCardPhoto": null, "idCardNumber": "", "idCardData": {}, "cv": null, "certificates": []}, {"id": 13, "empId": "id013", "pdfId": "66", "name": "السعيدي محمد الخضر عبده", "salary": 100000, "position": "مندوب مبيعات", "department": "المبيعات", "hireDate": "6/2/2025", "allowances": 0, "status": "active", "terminationStatus": null, "photo": null, "idCardPhoto": null, "idCardNumber": "", "idCardData": {}, "cv": null, "certificates": []}, {"id": 14, "empId": "id014", "pdfId": "67", "name": "صابر عمر أحمد السعيدي", "salary": 80000, "position": "خط سير، عامل", "department": "الإنتاج", "hireDate": "6/2/2025", "allowances": 0, "status": "active", "terminationStatus": null, "photo": null, "idCardPhoto": null, "idCardNumber": "", "idCardData": {}, "cv": null, "certificates": []}, {"id": 15, "empId": "id015", "pdfId": "68", "name": "بشار شكري محمد القدسي", "salary": 140000, "position": "مشرف صالة", "department": "الإنتاج", "hireDate": "1/2/2025", "allowances": 0, "status": "active", "terminationStatus": null, "photo": null, "idCardPhoto": null, "idCardNumber": "", "idCardData": {}, "cv": null, "certificates": []}, {"id": 16, "empId": "id016", "pdfId": "71", "name": "أحمد محمد عبدالقوي المظفري", "salary": 140000, "position": "سائق", "department": "المبيعات", "hireDate": "1/2/2025", "allowances": 0, "status": "active", "terminationStatus": null, "photo": null, "idCardPhoto": null, "idCardNumber": "", "idCardData": {}, "cv": null, "certificates": []}, {"id": 17, "empId": "id017", "pdfId": "72", "name": "صالح علي أحمد الوحيشي", "salary": 150000, "position": "مدير مشتريات", "department": "المشتريات", "hireDate": "1/3/2025", "allowances": 0, "status": "active", "terminationStatus": null, "photo": null, "idCardPhoto": null, "idCardNumber": "", "idCardData": {}, "cv": null, "certificates": []}, {"id": 18, "empId": "id018", "pdfId": "73", "name": "محمد الجنيدي هاشم عبده", "salary": 150000, "position": "مدير مبيعات", "department": "المبيعات", "hireDate": "23/3/2025", "allowances": 0, "status": "active", "terminationStatus": null, "photo": null, "idCardPhoto": null, "idCardNumber": "", "idCardData": {}, "cv": null, "certificates": []}, {"id": 19, "empId": "id019", "pdfId": "75", "name": "أحمد محمد عبدالنبي الوحيشي", "salary": 80000, "position": "أمن وسلامة", "department": "الأمن", "hireDate": "21/4/2025", "allowances": 0, "status": "active", "terminationStatus": null, "photo": null, "idCardPhoto": null, "idCardNumber": "", "idCardData": {}, "cv": null, "certificates": []}, {"id": 20, "empId": "id020", "pdfId": "76", "name": "حبيب توفيق مكرد القدسي", "salary": 120000, "position": "أمين مخازن", "department": "المخازن", "hireDate": "24/4/2025", "allowances": 0, "status": "active", "terminationStatus": null, "photo": null, "idCardPhoto": null, "idCardNumber": "", "idCardData": {}, "cv": null, "certificates": []}, {"id": 21, "empId": "id021", "pdfId": "83", "name": "أنور سليم محمد الخولاني", "salary": 150000, "position": "مدير حسابات", "department": "الحسابات", "hireDate": "7/7/2025", "allowances": 0, "status": "active", "terminationStatus": null, "photo": null, "idCardPhoto": null, "idCardNumber": "", "idCardData": {}, "cv": null, "certificates": []}, {"id": 22, "empId": "id022", "pdfId": "84", "name": "محمد القاضي أحمد عبده", "salary": 70000, "position": "مدير علاقات عامة", "department": "العلاقات العامة", "hireDate": "22/7/2025", "allowances": 0, "status": "active", "terminationStatus": null, "photo": null, "idCardPhoto": null, "idCardNumber": "", "idCardData": {}, "cv": null, "certificates": []}, {"id": 23, "empId": "id023", "pdfId": "86", "name": "ناصر محمد العزاني عبده", "salary": 200000, "position": "مدير الخدمات والعمليات التشغيلية", "department": "الخدمات", "hireDate": "25/8/2025", "allowances": 0, "status": "active", "terminationStatus": null, "photo": null, "idCardPhoto": null, "idCardNumber": "", "idCardData": {}, "cv": null, "certificates": []}, {"id": 24, "empId": "id024", "pdfId": "87", "name": "عبدالواحد أمين نعمان الصيري", "salary": 100000, "position": "مندوب مبيعات", "department": "المبيعات", "hireDate": "11/10/2025", "allowances": 0, "status": "active", "terminationStatus": null, "photo": null, "idCardPhoto": null, "idCardNumber": "", "idCardData": {}, "cv": null, "certificates": []}, {"id": 25, "empId": "id025", "pdfId": "88", "name": "المجعلي علي محمد عبده", "salary": 80000, "position": "عامل", "department": "مخازن البيضاء", "hireDate": "7/10/2025", "allowances": 0, "status": "active", "terminationStatus": null, "photo": null, "idCardPhoto": null, "idCardNumber": "", "idCardData": {}, "cv": null, "certificates": []}, {"id": 26, "empId": "id026", "pdfId": "90", "name": "علوي علي سالم القيسي", "salary": 80000, "position": "عامل", "department": "الإنتاج", "hireDate": "15/11/2025", "allowances": 0, "status": "active", "terminationStatus": null, "photo": null, "idCardPhoto": null, "idCardNumber": "", "idCardData": {}, "cv": null, "certificates": []}, {"id": 27, "empId": "id027", "pdfId": "91", "name": "أحمد محمد الحجي عبده", "salary": 120000, "position": "محاسب", "department": "الحسابات", "hireDate": "1/1/2026", "allowances": 0, "status": "active", "terminationStatus": null, "photo": null, "idCardPhoto": null, "idCardNumber": "", "idCardData": {}, "cv": null, "certificates": []}, {"id": 28, "empId": "id028", "pdfId": "93", "name": "موسى محمد علي عبده", "salary": 80000, "position": "عامل على الكشافة", "department": "الإنتاج", "hireDate": "2/2/2026", "allowances": 0, "status": "active", "terminationStatus": null, "photo": null, "idCardPhoto": null, "idCardNumber": "", "idCardData": {}, "cv": null, "certificates": []}, {"id": 29, "empId": "id029", "pdfId": "94", "name": "تاج الدين إبراهيم حاج", "salary": 70000, "position": "عامل نظافة", "department": "الخدمات", "hireDate": "1/2/2026", "allowances": 0, "status": "active", "terminationStatus": null, "photo": null, "idCardPhoto": null, "idCardNumber": "", "idCardData": {}, "cv": null, "certificates": []}, {"id": 30, "empId": "id030", "pdfId": "95", "name": "مصطفى محمد سالم الهصيصي", "salary": 70000, "position": "سائق", "department": "المبيعات", "hireDate": "1/2/2026", "allowances": 0, "status": "active", "terminationStatus": null, "photo": null, "idCardPhoto": null, "idCardNumber": "", "idCardData": {}, "cv": null, "certificates": []}, {"id": 31, "empId": "id031", "pdfId": "97", "name": "طارق ناصر محمد العزاني", "salary": 100000, "position": "أمين صندوق", "department": "المالية", "hireDate": "1/2/2026", "allowances": 0, "status": "active", "terminationStatus": null, "photo": null, "idCardPhoto": null, "idCardNumber": "", "idCardData": {}, "cv": null, "certificates": []}, {"id": 32, "empId": "id032", "pdfId": "98", "name": "أحمد محمد أحمد الدباني", "salary": 70000, "position": "عامل", "department": "مخازن البيضاء", "hireDate": "8/3/2026", "allowances": 0, "status": "active", "terminationStatus": null, "photo": null, "idCardPhoto": null, "idCardNumber": "", "idCardData": {}, "cv": null, "certificates": []}, {"id": 33, "empId": "id033", "pdfId": "99", "name": "حسين سالم الفقير عبده", "salary": 80000, "position": "حارس أمن نهاري", "department": "الأمن", "hireDate": "1/3/2026", "allowances": 0, "status": "active", "terminationStatus": null, "photo": null, "idCardPhoto": null, "idCardNumber": "", "idCardData": {}, "cv": null, "certificates": []}, {"id": 34, "empId": "id034", "pdfId": "102", "name": "منير صالح حسين العروي", "salary": 70000, "position": "خط سير، عامل", "department": "الإنتاج", "hireDate": "23/3/2026", "allowances": 0, "status": "active", "terminationStatus": null, "photo": null, "idCardPhoto": null, "idCardNumber": "", "idCardData": {}, "cv": null, "certificates": []}, {"id": 35, "empId": "id035", "pdfId": "103", "name": "علي محمد عوض الشنهوز", "salary": 70000, "position": "عامل", "department": "المخازن", "hireDate": "1/4/2026", "allowances": 0, "status": "active", "terminationStatus": null, "photo": null, "idCardPhoto": null, "idCardNumber": "", "idCardData": {}, "cv": null, "certificates": []}, {"id": 36, "empId": "id036", "pdfId": "105", "name": "محمد الحييد مختار عبده", "salary": 220000, "position": "نائب المدير العام", "department": "الإدارة", "hireDate": "1/4/2026", "allowances": 0, "status": "active", "terminationStatus": null, "photo": null, "idCardPhoto": null, "idCardNumber": "", "idCardData": {}, "cv": null, "certificates": []}, {"id": 37, "empId": "id037", "pdfId": "106", "name": "محمد أنور محمد الفروي", "salary": 70000, "position": "عامل", "department": "الإنتاج", "hireDate": "6/4/2026", "allowances": 0, "status": "active", "terminationStatus": null, "photo": null, "idCardPhoto": null, "idCardNumber": "", "idCardData": {}, "cv": null, "certificates": []}, {"id": 38, "empId": "id038", "pdfId": "108", "name": "حمزة مصطفى أحمد القاضي", "salary": 70000, "position": "عامل", "department": "الإنتاج", "hireDate": "14/4/2026", "allowances": 0, "status": "active", "terminationStatus": null, "photo": null, "idCardPhoto": null, "idCardNumber": "", "idCardData": {}, "cv": null, "certificates": []}, {"id": 39, "empId": "id039", "pdfId": "110", "name": "رياض عادل أحمد قايد", "salary": 120000, "position": "طباخ", "department": "الخدمات", "hireDate": "1/6/2026", "allowances": 0, "status": "active", "terminationStatus": null, "photo": null, "idCardPhoto": null, "idCardNumber": "", "idCardData": {}, "cv": null, "certificates": []}, {"id": 40, "empId": "id040", "pdfId": "111", "name": "صالح أحمد صالح الجيشاني", "salary": 70000, "position": "عامل", "department": "المخازن", "hireDate": "1/6/2026", "allowances": 0, "status": "active", "terminationStatus": null, "photo": null, "idCardPhoto": null, "idCardNumber": "", "idCardData": {}, "cv": null, "certificates": []}],
  vouchers: [],
  equipmentLog: [],
  terminatedEmployees: [],

  // === طلبات الشراء (من الإنتاج إلى المشتريات) ===
  purchaseRequests: []
};
