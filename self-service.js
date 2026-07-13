/* ============================================================
   سيلين - نظام الخدمة الذاتية (v2)
   نظام ERP ذاتي الخدمة - نسخة محسّنة مع الفئات الفرعية
   ============================================================ */

window.SelfService = {
  // أنواع الطلبات وفئاتها الفرعية
  REQUEST_TYPES: [
    {
      id: 'leave', 
      label: 'طلب إجازة', 
      icon: 'calendar', 
      dept: 'الموارد البشرية',
      subTypes: [
        {id: 'annual', label: 'إجازة سنوية', requireDates: true, requireAttachment: false},
        {id: 'sick', label: 'إجازة مرضية', requireDates: true, requireAttachment: true, attachmentLabel: 'تقرير طبي'},
        {id: 'emergency', label: 'إجازة طارئة', requireDates: true, requireAttachment: false, requireReason: true},
        {id: 'bereavement', label: 'إجازة وفاة', requireDates: true, requireAttachment: false, extraField: 'صلة القرابة'},
        {id: 'marriage', label: 'إجازة زواج', requireDates: true, requireAttachment: true, attachmentLabel: 'عقد الزواج'},
        {id: 'maternity', label: 'إجازة أمومة', requireDates: true, requireAttachment: true, attachmentLabel: 'شهادة طبية'},
        {id: 'paternity', label: 'إجازة أبوة', requireDates: true, requireAttachment: true, attachmentLabel: 'شهادة ميلاد'},
        {id: 'unpaid', label: 'إجازة بدون راتب', requireDates: true, requireAttachment: false, requireReason: true},
        {id: 'hajj', label: 'إجازة حج', requireDates: true, requireAttachment: false},
        {id: 'other_leave', label: 'إجازة أخرى', requireDates: true, requireAttachment: false, requireReason: true}
      ]
    },
    {
      id: 'purchase', 
      label: 'طلب شراء', 
      icon: 'cart', 
      dept: 'المشتريات',
      specialFlow: true,
      subTypes: [
        {id: 'production_equipment', label: 'معدات إنتاج', requireAmount: true, extraField: 'اسم المعدة'},
        {id: 'raw_materials', label: 'مواد خام', requireAmount: true, extraField: 'اسم المادة'},
        {id: 'packaging', label: 'مواد تغليف', requireAmount: true, extraField: 'نوع التغليف'},
        {id: 'spare_parts', label: 'قطع غيار', requireAmount: true, extraField: 'اسم القطعة والجهاز'},
        {id: 'stationery', label: 'قرطاسية', requireAmount: true},
        {id: 'cleaning', label: 'مواد تنظيف', requireAmount: true},
        {id: 'office', label: 'أثاث مكتبي', requireAmount: true},
        {id: 'other_purchase', label: 'شراء آخر', requireAmount: true, requireReason: true}
      ]
    },
    {
      id: 'maintenance', 
      label: 'طلب صيانة', 
      icon: 'tool', 
      dept: 'الصيانة',
      specialFlow: true,
      subTypes: [
        {id: 'electrical', label: 'كهرباء', extraField: 'الموقع/المعدة'},
        {id: 'plumbing', label: 'سباكة', extraField: 'الموقع'},
        {id: 'hvac', label: 'تكييف وتبريد', extraField: 'الموقع'},
        {id: 'production_machine', label: 'معدة إنتاج', requireAttachment: true, attachmentLabel: 'صور العطل'},
        {id: 'vehicle', label: 'مركبة', extraField: 'رقم اللوحة'},
        {id: 'building', label: 'مبنى / صيانة عامة', extraField: 'الموقع'},
        {id: 'other_maintenance', label: 'صيانة أخرى', requireReason: true}
      ]
    },
    {
      id: 'advance', 
      label: 'طلب سلفة', 
      icon: 'money', 
      dept: 'المالية',
      subTypes: [
        {id: 'personal', label: 'سلفة شخصية', requireAmount: true, requireReason: true},
        {id: 'emergency', label: 'سلفة طارئة', requireAmount: true, requireReason: true},
        {id: 'medical_advance', label: 'سلفة طبية', requireAmount: true, requireAttachment: true, attachmentLabel: 'تقرير طبي'},
        {id: 'education', label: 'سلفة دراسية', requireAmount: true, requireAttachment: true, attachmentLabel: 'إثبات التسجيل'}
      ]
    },
    {
      id: 'certificate', 
      label: 'طلب شهادة', 
      icon: 'fileText', 
      dept: 'الموارد البشرية',
      subTypes: [
        {id: 'work', label: 'شهادة عمل', extraField: 'الغرض من الشهادة'},
        {id: 'salary', label: 'شهادة راتب', extraField: 'الغرض من الشهادة'},
        {id: 'experience', label: 'شهادة خبرة', extraField: 'الغرض من الشهادة'},
        {id: 'to_whom', label: 'شهادة لمن يهمه الأمر', extraField: 'الجهة المقدمة لها'}
      ]
    },
    {
      id: 'data_update', 
      label: 'تحديث بيانات شخصية', 
      icon: 'user', 
      dept: 'الموارد البشرية',
      subTypes: [
        {id: 'phone', label: 'رقم الهاتف', extraField: 'الرقم الجديد'},
        {id: 'address', label: 'عنوان السكن', extraField: 'العنوان الجديد'},
        {id: 'email', label: 'البريد الإلكتروني', extraField: 'البريد الجديد'},
        {id: 'emergency_contact', label: 'رقم الطوارئ', extraField: 'الاسم والرقم'},
        {id: 'bank_account', label: 'الحساب البنكي', extraField: 'اسم البنك ورقم الحساب', requireAttachment: true, attachmentLabel: 'صورة من كشف الحساب'},
        {id: 'marital_status', label: 'الحالة الاجتماعية', extraField: 'الحالة الجديدة', requireAttachment: true, attachmentLabel: 'المستند الرسمي'},
        {id: 'national_id', label: 'رقم الهوية', extraField: 'الرقم الجديد', requireAttachment: true, attachmentLabel: 'صورة الهوية'},
        {id: 'qualification', label: 'مؤهل علمي جديد', extraField: 'المؤهل', requireAttachment: true, attachmentLabel: 'صورة الشهادة'}
      ]
    },
    {
      id: 'other', 
      label: 'طلب آخر', 
      icon: 'messageCircle', 
      dept: 'الإدارة',
      subTypes: [
        {id: 'suggestion', label: 'اقتراح'},
        {id: 'complaint', label: 'شكوى'},
        {id: 'inquiry', label: 'استفسار'},
        {id: 'other_request', label: 'طلب آخر', requireReason: true}
      ]
    }
  ],

  STATUS: {
    DRAFT: 'draft',
    PENDING_MANAGER: 'pending_manager',
    PENDING_ADMIN: 'pending_admin',
    PENDING_DEPT: 'pending_dept',
    PENDING_GM: 'pending_gm',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
  },

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
    cancelled: 'ملغى'
  },

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

  initDB: function() {
    const db = APP.getDB();
    if (!db.requests) db.requests = [];
    if (!db.notifications) db.notifications = [];
    APP.saveDB(db);
  },

  getEmployeeName: function(empId) {
    const db = APP.getDB();
    const e = db.employeesLog.find(x => x.empId === empId);
    return e ? e.name : 'غير معروف';
  },

  getEmployeeDepartment: function(empId) {
    const db = APP.getDB();
    const e = db.employeesLog.find(x => x.empId === empId);
    return e ? e.department : '';
  },

  getDirectManager: function(empId) {
    const db = APP.getDB();
    const e = db.employeesLog.find(x => x.empId === empId);
    if (!e || !e.managerId) return null;
    return db.employeesLog.find(x => x.id === e.managerId) || null;
  },

  getGM: function() {
    const db = APP.getDB();
    return db.employeesLog.find(x => x.empId === '105');
  },

  // الحصول على اسم النوع الفرعي
  getSubTypeLabel: function(typeId, subTypeId) {
    const t = this.REQUEST_TYPES.find(x => x.id === typeId);
    if (!t) return subTypeId;
    const st = (t.subTypes || []).find(x => x.id === subTypeId);
    return st ? st.label : subTypeId;
  },

  createRequest: function(type, data) {
    this.initDB();
    const db = APP.getDB();
    const user = APP.getCurrentUser();
    if (!user) return null;

    const typeConfig = this.REQUEST_TYPES.find(t => t.id === type);
    let initialStatus = this.STATUS.PENDING_MANAGER;
    if (typeConfig && typeConfig.specialFlow) {
      initialStatus = this.STATUS.PENDING_DEPT;
    }

    const newRequest = {
      id: 'REQ-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      type: type,
      subType: data.subType || '',
      subTypeLabel: this.getSubTypeLabel(type, data.subType),
      employeeId: user.empId,
      employeeName: user.name,
      department: this.getEmployeeDepartment(user.empId),
      title: data.title || (typeConfig ? typeConfig.label : 'طلب'),
      description: data.description || '',
      amount: data.amount || 0,
      duration: data.duration || '',
      startDate: data.startDate || '',
      endDate: data.endDate || '',
      extraValue: data.extraValue || '',
      attachments: data.attachments || [],
      status: initialStatus,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      history: [{
        action: 'created',
        by: user.name,
        byRole: user.role,
        at: new Date().toISOString(),
        note: 'تم تقديم الطلب'
      }]
    };

    db.requests.push(newRequest);

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

  addNotification: function(notif) {
    this.initDB();
    const db = APP.getDB();
    notif.id = 'NOTIF-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    db.notifications.push(notif);
    APP.saveDB(db);
  },

  approveRequest: function(requestId, note) {
    this.initDB();
    const db = APP.getDB();
    const req = db.requests.find(r => r.id === requestId);
    if (!req) return false;

    const user = APP.getCurrentUser();
    const oldStatus = req.status;
    const typeConfig = this.REQUEST_TYPES.find(t => t.id === req.type);
    let nextStatus;

    if (typeConfig && typeConfig.specialFlow) {
      if (req.status === this.STATUS.PENDING_DEPT) {
        nextStatus = this.STATUS.PENDING_GM;
      } else if (req.status === this.STATUS.PENDING_GM) {
        nextStatus = this.STATUS.APPROVED;
      }
    } else {
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

  getMyRequests: function() {
    this.initDB();
    const db = APP.getDB();
    const user = APP.getCurrentUser();
    if (!user) return [];
    return db.requests.filter(r => r.employeeId === user.empId)
                       .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  getIncomingRequests: function() {
    this.initDB();
    const db = APP.getDB();
    const user = APP.getCurrentUser();
    if (!user) return [];

    const userEmp = db.employeesLog.find(e => e.empId === user.empId);
    if (!userEmp) return [];

    return db.requests.filter(r => {
      if (r.status === 'pending_manager') {
        const emp = db.employeesLog.find(e => e.empId === r.employeeId);
        if (emp && emp.managerId === userEmp.id) return true;
      }
      if (r.status === 'pending_gm' && userEmp.empId === '105') return true;
      if (r.status === 'pending_admin' && userEmp.department === 'الموارد البشرية') return true;
      if (r.status === 'pending_dept') {
        const typeConfig = this.REQUEST_TYPES.find(t => t.id === r.type);
        if (typeConfig && typeConfig.dept === userEmp.department) return true;
      }
      return false;
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
};

console.log('✓ Self-Service v2 loaded with sub-types');
