/* ============================================================
   سيلين - نظام الخدمة الذاتية
   نظام ERP ذاتي الخدمة للموظفين والمدراء
   ============================================================ */

window.SelfService = {
  // أنواع الطلبات
  REQUEST_TYPES: [
    {id: 'leave', label: 'طلب إجازة', icon: 'calendar', dept: 'الموارد البشرية'},
    {id: 'purchase', label: 'طلب شراء', icon: 'cart', dept: 'المشتريات', specialFlow: true},
    {id: 'maintenance', label: 'طلب صيانة', icon: 'tool', dept: 'الصيانة', specialFlow: true},
    {id: 'advance', label: 'طلب سلفة', icon: 'money', dept: 'المالية'},
    {id: 'certificate', label: 'طلب شهادة', icon: 'fileText', dept: 'الموارد البشرية'},
    {id: 'data_update', label: 'تحديث بيانات شخصية', icon: 'user', dept: 'الموارد البشرية'},
    {id: 'other', label: 'طلب آخر', icon: 'messageCircle', dept: 'الإدارة'}
  ],

  // حالات الطلب
  STATUS: {
    DRAFT: 'draft',                       // مسودة
    PENDING_MANAGER: 'pending_manager',   // في انتظار المدير المباشر
    PENDING_ADMIN: 'pending_admin',       // في انتظار الإدارة
    PENDING_DEPT: 'pending_dept',         // في انتظار القسم (للصيانة/الشراء)
    PENDING_GM: 'pending_gm',             // في انتظار المدير العام
    APPROVED: 'approved',                 // معتمد
    REJECTED: 'rejected',                 // مرفوض
    IN_PROGRESS: 'in_progress',           // قيد التنفيذ
    COMPLETED: 'completed',               // مكتمل
    CANCELLED: 'cancelled'                // ملغي
  },

  // أسماء الحالات بالعربية
  STATUS_LABELS: {
    draft: 'مسودة',
    pending_manager: 'بانتظار المدير المباشر',
    pending_admin: 'بانتظار الإدارة',
    pending_dept: 'بانتظار القسم المختص',
    pending_gm: 'بانتظار المدير العام',
    approved: 'معتمد',
    rejected: 'مرفوض',
    in_progress: 'قيد التنفيذ',
    completed: 'مكتمل',
    cancelled: 'ملغي'
  },

  // ألوان الحالات
  STATUS_COLORS: {
    draft: 'badge-info',
    pending_manager: 'badge-warning',
    pending_admin: 'badge-warning',
    pending_dept: 'badge-warning',
    pending_gm: 'badge-warning',
    approved: 'badge-success',
    rejected: 'badge-danger',
    in_progress: 'badge-info',
    completed: 'badge-success',
    cancelled: 'badge-secondary'
  },

  // تهيئة بنية الطلبات في قاعدة البيانات
  initDB: function() {
    const db = APP.getDB();
    if (!db.requests) db.requests = [];
    if (!db.notifications) db.notifications = [];
    APP.saveDB(db);
  },

  // الحصول على اسم الموظف
  getEmployeeName: function(empId) {
    const db = APP.getDB();
    const e = db.employeesLog.find(x => x.empId === empId);
    return e ? e.name : 'غير معروف';
  },

  // الحصول على قسم الموظف
  getEmployeeDepartment: function(empId) {
    const db = APP.getDB();
    const e = db.employeesLog.find(x => x.empId === empId);
    return e ? e.department : '';
  },

  // الحصول على المدير المباشر للموظف
  getDirectManager: function(empId) {
    const db = APP.getDB();
    const e = db.employeesLog.find(x => x.empId === empId);
    if (!e || !e.managerId) return null;
    return db.employeesLog.find(x => x.id === e.managerId) || null;
  },

  // الحصول على المدير العام
  getGM: function() {
    const db = APP.getDB();
    return db.employeesLog.find(x => x.empId === '105');
  },

  // إنشاء طلب جديد
  createRequest: function(type, data) {
    this.initDB();
    const db = APP.getDB();
    const user = APP.getCurrentUser();
    if (!user) return null;

    // تحديد المرحلة الأولى
    const typeConfig = this.REQUEST_TYPES.find(t => t.id === type);
    let initialStatus = this.STATUS.PENDING_MANAGER;
    
    // للصيانة والشراء: المرحلة الأولى هي القسم المختص مباشرة
    if (typeConfig && typeConfig.specialFlow) {
      initialStatus = this.STATUS.PENDING_DEPT;
    }

    const newRequest = {
      id: 'REQ-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      type: type,
      employeeId: user.empId,
      employeeName: user.name,
      department: this.getEmployeeDepartment(user.empId),
      title: data.title || (typeConfig ? typeConfig.label : 'طلب'),
      description: data.description || '',
      amount: data.amount || 0,           // المبلغ (للشراء والسلف)
      duration: data.duration || '',      // المدة (للصيانة)
      startDate: data.startDate || '',    // تاريخ البداية (للإجازة)
      endDate: data.endDate || '',        // تاريخ النهاية (للإجازة)
      attachments: data.attachments || [],// المرفقات
      status: initialStatus,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      history: [
        {
          action: 'created',
          by: user.name,
          byRole: user.role,
          at: new Date().toISOString(),
          note: 'تم تقديم الطلب'
        }
      ]
    };

    db.requests.push(newRequest);
    
    // إضافة إشعار للمدير المعني
    this.addNotification({
      type: 'new_request',
      requestId: newRequest.id,
      for: typeConfig && typeConfig.specialFlow ? typeConfig.dept : 'direct_manager',
      title: 'طلب جديد: ' + newRequest.title,
      message: 'قدم الموظف ' + user.name + ' طلباً جديداً',
      createdAt: new Date().toISOString(),
      read: false
    });

    APP.saveDB(db);
    return newRequest;
  },

  // إضافة إشعار
  addNotification: function(notif) {
    this.initDB();
    const db = APP.getDB();
    notif.id = 'NOTIF-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    db.notifications.push(notif);
    APP.saveDB(db);
  },

  // اعتماد طلب في مرحلة معينة
  approveRequest: function(requestId, note) {
    this.initDB();
    const db = APP.getDB();
    const req = db.requests.find(r => r.id === requestId);
    if (!req) return false;

    const user = APP.getCurrentUser();
    const oldStatus = req.status;

    // الانتقال للمرحلة التالية
    const typeConfig = this.REQUEST_TYPES.find(t => t.id === req.type);
    let nextStatus;

    if (typeConfig && typeConfig.specialFlow) {
      // للصيانة والشراء: القسم ← المدير العام
      if (req.status === this.STATUS.PENDING_DEPT) {
        nextStatus = this.STATUS.PENDING_GM;
      } else if (req.status === this.STATUS.PENDING_GM) {
        nextStatus = this.STATUS.APPROVED;
      }
    } else {
      // للطلبات الأخرى: المدير ← الإدارة ← المدير العام
      if (req.status === this.STATUS.PENDING_MANAGER) {
        nextStatus = this.STATUS.PENDING_ADMIN;
      } else if (req.status === this.STATUS.PENDING_ADMIN) {
        nextStatus = this.STATUS.PENDING_GM;
      } else if (req.status === this.STATUS.PENDING_GM) {
        nextStatus = this.STATUS.APPROVED;
      }
    }

    req.status = nextStatus;
    req.updatedAt = new Date().toISOString();
    req.history.push({
      action: 'approved',
      by: user.name,
      byRole: user.role,
      from: oldStatus,
      to: nextStatus,
      at: new Date().toISOString(),
      note: note || 'تم الاعتماد'
    });

    // إشعار للموظف
    this.addNotification({
      type: 'request_approved',
      requestId: req.id,
      for: req.employeeId,
      title: 'تم اعتماد طلبك',
      message: 'طلبك "' + req.title + '" اعتُمد من قبل ' + user.name,
      createdAt: new Date().toISOString(),
      read: false
    });

    APP.saveDB(db);
    return true;
  },

  // رفض طلب
  rejectRequest: function(requestId, reason) {
    this.initDB();
    const db = APP.getDB();
    const req = db.requests.find(r => r.id === requestId);
    if (!req) return false;

    const user = APP.getCurrentUser();
    const oldStatus = req.status;

    req.status = this.STATUS.REJECTED;
    req.rejectionReason = reason;
    req.updatedAt = new Date().toISOString();
    req.history.push({
      action: 'rejected',
      by: user.name,
      byRole: user.role,
      from: oldStatus,
      at: new Date().toISOString(),
      note: reason || 'تم الرفض'
    });

    // إشعار للموظف
    this.addNotification({
      type: 'request_rejected',
      requestId: req.id,
      for: req.employeeId,
      title: 'تم رفض طلبك',
      message: 'طلبك "' + req.title + '" رُفض. السبب: ' + (reason || 'غير محدد'),
      createdAt: new Date().toISOString(),
      read: false
    });

    APP.saveDB(db);
    return true;
  },

  // الحصول على طلبات المستخدم الحالي
  getMyRequests: function() {
    this.initDB();
    const db = APP.getDB();
    const user = APP.getCurrentUser();
    if (!user) return [];
    return db.requests.filter(r => r.employeeId === user.empId)
                       .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  // الحصول على الطلبات الواردة للمدير الحالي
  getIncomingRequests: function() {
    this.initDB();
    const db = APP.getDB();
    const user = APP.getCurrentUser();
    if (!user) return [];

    const userEmp = db.employeesLog.find(e => e.empId === user.empId);
    if (!userEmp) return [];

    return db.requests.filter(r => {
      // للمدير المباشر
      if (r.status === 'pending_manager') {
        const emp = db.employeesLog.find(e => e.empId === r.employeeId);
        if (emp && emp.managerId === userEmp.id) return true;
      }
      // للمدير العام
      if (r.status === 'pending_gm' && userEmp.empId === '105') return true;
      // للمدير الإداري (HR)
      if (r.status === 'pending_admin' && userEmp.department === 'الموارد البشرية') return true;
      // للقسم المختص (صيانة / مشتريات)
      if (r.status === 'pending_dept') {
        const typeConfig = this.REQUEST_TYPES.find(t => t.id === r.type);
        if (typeConfig && typeConfig.dept === userEmp.department) return true;
      }
      return false;
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
};

console.log('✓ Self-Service module loaded');
