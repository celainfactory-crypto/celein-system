/* ============================================================
   سيلين - وحدات إضافية
   التسعير، المخزون، المبيعات، المختبر، الموارد البشرية، إلخ
   ============================================================ */

/* ============ التسعير ============ */
window.Modules.pricing = function(container) {
  const db = APP.getDB();
  Exports.register("pricing", {
    label: "الأسعار والوكلاء",
    pdf: () => {
      const headers = ['الصنف', 'تجزئة', 'جملة', 'عمولة %', 'سعر المصنع', 'أجور النقل', 'سعر الوكيل', 'هامش الربح'];
      const rows = db.products.map(p => {
        const pr = db.pricing.find(x => x.code === p.code);
        const cost = DB.costPerCarton(p.code, db).total;
        const avgPrice = (pr.retailPrice + pr.wholesalePrice) / 2;
        const margin = avgPrice - cost;
        return [p.name, pr.retailPrice, pr.wholesalePrice, pr.commissionPct, pr.factoryPrice, pr.transport, pr.agentPrice,
          { v: margin.toFixed(0) + ' ر.ي', cls: margin >= 0 ? 'text-success' : 'text-danger' }];
      });
      const html = Exports.rowsToHTMLTable(headers, rows, { title: 'جدول الأسعار والعمولات' });
      Exports.exportPDF("الأسعار والعمولات والوكلاء", html, "pricing");
    },
    excel: () => {
      const headers = ['الصنف', 'تجزئة', 'جملة', 'عمولة %', 'سعر المصنع', 'أجور النقل', 'سعر الوكيل', 'التكلفة', 'هامش الربح'];
      const rows = db.products.map(p => {
        const pr = db.pricing.find(x => x.code === p.code);
        const cost = DB.costPerCarton(p.code, db).total;
        const avgPrice = (pr.retailPrice + pr.wholesalePrice) / 2;
        const margin = avgPrice - cost;
        return [p.name, pr.retailPrice, pr.wholesalePrice, pr.commissionPct, pr.factoryPrice, pr.transport, pr.agentPrice, cost.toFixed(2), margin.toFixed(2)];
      });
      Exports.exportExcel(Exports.rowsToHTMLTable(headers, rows, { title: 'الأسعار والعمولات والوكلاء' }), "pricing");
    },
    csv: () => {
      const headers = ['الصنف', 'تجزئة', 'جملة', 'عمولة', 'سعر المصنع', 'أجور النقل', 'سعر الوكيل'];
      const rows = db.products.map(p => {
        const pr = db.pricing.find(x => x.code === p.code);
        return [p.name, pr.retailPrice, pr.wholesalePrice, pr.commissionPct, pr.factoryPrice, pr.transport, pr.agentPrice];
      });
      Exports.exportCSV(Exports.rowsToCSV(headers, rows), "pricing");
    },
    json: () => Exports.exportJSON({ pricing: db.pricing }, "pricing_data"),
    print: () => window.print()
  });


  function render() {
    container.innerHTML = `
      <div class="alert alert-info">
        <span>${Icons.render("priceTag")}</span>
        <span><b>تنبيه:</b> تم رفع سعر 750 مل كرتون وشرنج بـ 100 ر.ي (التجزئة 1300 ر.ي، الجملة 1270 ر.ي). العمولة لا تتجاوز 2%. يدعم النظام الأسعار التراكمية وتعديلها في أي وقت.</span>
      </div>

      <div class="card">
        <div class="header-row">
          <h3>${Icons.render("money")} تحديث أسعار الأصناف</h3>
          <button class="btn btn-primary btn-sm" data-action="save-pricing">${Icons.render("save")} حفظ الأسعار</button>
        </div>
        <table>
          <thead>
            <tr>
              <th>الصنف</th>
              <th>سعر التجزئة</th>
              <th>سعر الجملة</th>
              <th>العمولة %</th>
              <th>سعر المصنع</th>
              <th>أجور النقل</th>
              <th>سعر الوكيل</th>
              <th>هامش الربح*</th>
            </tr>
          </thead>
          <tbody>
            ${db.products.map(p => {
              const pr = db.pricing.find(x => x.code === p.code);
              const cost = DB.costPerCarton(p.code, db).total;
              const avgPrice = (pr.retailPrice + pr.wholesalePrice) / 2;
              const margin = avgPrice - cost;
              const marginPct = avgPrice > 0 ? (margin / avgPrice * 100) : 0;
              return `
                <tr>
                  <td><b>${p.name}</b></td>
                  <td><input type="number" id="pr_retail_${p.code}" value="${pr.retailPrice}" style="width:90px" /></td>
                  <td><input type="number" id="pr_wholesale_${p.code}" value="${pr.wholesalePrice}" style="width:90px" /></td>
                  <td><input type="number" id="pr_comm_${p.code}" value="${pr.commissionPct}" min="0" max="2" step="0.1" style="width:60px" /></td>
                  <td><input type="number" id="pr_factory_${p.code}" value="${pr.factoryPrice}" style="width:90px" /></td>
                  <td><input type="number" id="pr_transport_${p.code}" value="${pr.transport}" style="width:80px" /></td>
                  <td><input type="number" id="pr_agent_${p.code}" value="${pr.agentPrice}" style="width:90px" /></td>
                  <td class="${margin >= 0 ? 'text-success' : 'text-danger'}">
                    ${margin.toFixed(0)} (${marginPct.toFixed(1)}%)
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
        <p class="text-muted" style="margin-top:10px;font-size:12px">* هامش الربح = متوسط سعر البيع - التكلفة الفعلية للكرتون</p>
      </div>

      <div class="card">
        <div class="header-row">
          <h3>${Icons.render("profit")} تحليل الربحية حسب الصنف</h3>
        </div>
        <canvas id="chartMargin" height="100"></canvas>
      </div>

      <div class="card">
        <h3>${Icons.render("document")} سجل تحديثات الأسعار</h3>
        <table>
          <thead>
            <tr>
              <th>التاريخ</th>
              <th>الصنف</th>
              <th>السعر القديم</th>
              <th>السعر الجديد</th>
              <th>سبب التعديل</th>
            </tr>
          </thead>
          <tbody>
            <tr><td colspan="5" class="text-muted" style="text-align:center;padding:20px">سيتم تسجيل كل تحديث تلقائياً هنا</td></tr>
          </tbody>
        </table>
      </div>
    `;

    setTimeout(() => {
      const labels = db.products.map(p => p.name);
      const costs = db.products.map(p => DB.costPerCarton(p.code, db).total);
      const avgPrices = db.products.map(p => {
        const pr = db.pricing.find(x => x.code === p.code);
        return (pr.retailPrice + pr.wholesalePrice) / 2;
      });
      new Chart(document.getElementById('chartMargin'), {
        type: 'bar',
        data: {
          labels,
          datasets: [
            { label: 'التكلفة', data: costs, backgroundColor: '#c62828' },
            { label: 'متوسط السعر', data: avgPrices, backgroundColor: '#2e7d32' }
          ]
        },
        options: { responsive: true }
      });
    }, 100);
  }

  Modules._savePricing = function() {
    const db = APP.getDB();
    db.products.forEach(p => {
      const pr = db.pricing.find(x => x.code === p.code);
      pr.retailPrice = +document.getElementById(`pr_retail_${p.code}`).value;
      pr.wholesalePrice = +document.getElementById(`pr_wholesale_${p.code}`).value;
      pr.commissionPct = Math.min(+document.getElementById(`pr_comm_${p.code}`).value, 2);
      pr.factoryPrice = +document.getElementById(`pr_factory_${p.code}`).value;
      pr.transport = +document.getElementById(`pr_transport_${p.code}`).value;
      pr.agentPrice = +document.getElementById(`pr_agent_${p.code}`).value;
    });
    APP.saveDB(db);
    alert('{Icons.render("check")} تم حفظ الأسعار الجديدة');
    render();
  };

  render();
};

/* ============ المخزون ============ */
window.Modules.inventory = function(container) {
  const db = APP.getDB();
  Exports.register("inventory", {
    label: "إدارة المخزون",
    pdf: () => {
      const inv = DB.inventory(db);
      const headers = ['الصنف', 'افتتاحي', 'منتج', 'مصروف', 'الرصيد', 'الحالة'];
      const rows = inv.map(i => {
        const status = i.balance < 500 ? 'منخفض جداً' : i.balance < 1500 ? 'منخفض' : 'جيد';
        return [i.name, i.opening, i.produced, i.dispatched, { v: i.balance.toLocaleString('ar-EG'), cls: 'text-primary' }, status];
      });
      const footer = ['الإجمالي',
        inv.reduce((s,i)=>s+i.opening,0),
        inv.reduce((s,i)=>s+i.produced,0),
        inv.reduce((s,i)=>s+i.dispatched,0),
        inv.reduce((s,i)=>s+i.balance,0).toLocaleString('ar-EG'),
        ''];
      const html = Exports.rowsToHTMLTable(headers, rows, { title: 'جرد المخزون الحالي', footerRow: [footer] });
      Exports.exportPDF("جرد المخزون", html, "inventory");
    },
    excel: () => {
      const inv = DB.inventory(db);
      const headers = ['الصنف', 'الافتتاحي', 'المنتج', 'المصروف', 'الرصيد المتبقي', 'الحالة'];
      const rows = inv.map(i => {
        const status = i.balance < 500 ? 'منخفض جداً' : i.balance < 1500 ? 'منخفض' : 'جيد';
        return [i.name, i.opening, i.produced, i.dispatched, i.balance, status];
      });
      Exports.exportExcel(Exports.rowsToHTMLTable(headers, rows, { title: 'جرد المخزون' }), "inventory");
    },
    csv: () => {
      const inv = DB.inventory(db);
      const headers = ['الصنف', 'افتتاحي', 'منتج', 'مصروف', 'الرصيد'];
      const rows = inv.map(i => [i.name, i.opening, i.produced, i.dispatched, i.balance]);
      Exports.exportCSV(Exports.rowsToCSV(headers, rows), "inventory");
    },
    json: () => Exports.exportJSON({ inventory: DB.inventory(db), inventoryOpening: db.inventoryOpening }, "inventory_data"),
    print: () => window.print()
  });


  function render() {
    const inv = DB.inventory(db);

    container.innerHTML = `
      <div class="alert alert-info">
        <span>${Icons.render("box")}</span>
        <span>رصيد المخزون = الرصيد الافتتاحي + الإنتاج - المصروفات. كل حركة إنتاج أو سند صرف ينعكس فوراً.</span>
      </div>

      <div class="kpi-grid">
        <div class="kpi-card success">
          <span class="icon">${Icons.render("box")}</span>
          <div class="label">إجمالي الرصيد الحالي</div>
          <div class="value">${inv.reduce((s,i) => s + i.balance, 0).toLocaleString('ar-EG')}</div>
          <div class="delta">كرتون في المخازن</div>
        </div>
        <div class="kpi-card info">
          <span class="icon">${Icons.render("factory")}</span>
          <div class="label">إجمالي الإنتاج (تراكمي)</div>
          <div class="value">${inv.reduce((s,i) => s + i.produced, 0).toLocaleString('ar-EG')}</div>
          <div class="delta">كرتون</div>
        </div>
        <div class="kpi-card warning">
          <span class="icon">${Icons.render("download")}</span>
          <div class="label">إجمالي المصروف</div>
          <div class="value">${inv.reduce((s,i) => s + i.dispatched, 0).toLocaleString('ar-EG')}</div>
          <div class="delta">كرتون</div>
        </div>
      </div>

      <div class="card">
        <div class="header-row">
          <h3>${Icons.render("clipboard")} جرد المخزون الحالي</h3>
          <button class="btn btn-secondary btn-sm" data-action="export-inventory">${Icons.render("download")} تصدير</button>
        </div>
        <table>
          <thead>
            <tr>
              <th>الصنف</th>
              <th>الرصيد الافتتاحي</th>
              <th>المنتج</th>
              <th>المصروف</th>
              <th class="text-primary">الرصيد المتبقي</th>
              <th>حالة المخزون</th>
            </tr>
          </thead>
          <tbody>
            ${inv.map(i => {
              const status = i.balance < 500 ? 'danger' : i.balance < 1500 ? 'warning' : 'success';
              const statusText = i.balance < 500 ? 'منخفض جداً' : i.balance < 1500 ? 'منخفض' : 'جيد';
              return `<tr>
                <td><b>${i.name}</b></td>
                <td>${i.opening.toLocaleString('ar-EG')}</td>
                <td class="text-success">+${i.produced.toLocaleString('ar-EG')}</td>
                <td class="text-warning">-${i.dispatched.toLocaleString('ar-EG')}</td>
                <td class="text-primary" style="font-size:15px"><b>${i.balance.toLocaleString('ar-EG')}</b></td>
                <td><span class="badge badge-${status}">${statusText}</span></td>
              </tr>`;
            }).join('')}
          </tbody>
          <tfoot>
            <tr>
              <td>الإجمالي</td>
              <td>${inv.reduce((s,i) => s + i.opening, 0).toLocaleString('ar-EG')}</td>
              <td>${inv.reduce((s,i) => s + i.produced, 0).toLocaleString('ar-EG')}</td>
              <td>${inv.reduce((s,i) => s + i.dispatched, 0).toLocaleString('ar-EG')}</td>
              <td class="text-primary">${inv.reduce((s,i) => s + i.balance, 0).toLocaleString('ar-EG')}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    `;
  }

  render();
};

/* ============ سندات الصرف ============ */
window.Modules.vouchers = function(container) {
  const db = APP.getDB();
  Exports.register("vouchers", {
    label: "سندات الصرف",
    pdf: () => {
      const headers = ['التاريخ', 'النوع', 'المرجع', 'الصنف', 'الكمية', 'ملاحظات'];
      const rows = db.vouchers.map(v => {
        const prod = db.products.find(p => p.code === v.product);
        return [v.date, v.type, v.refCode, prod ? prod.name : v.product, v.qty, v.notes || '-'];
      });
      const html = Exports.rowsToHTMLTable(headers, rows, { title: 'سجل سندات الصرف' });
      Exports.exportPDF("سندات صرف المناديب والوكلاء", html, "vouchers");
    },
    excel: () => {
      const headers = ['التاريخ', 'النوع', 'المرجع', 'الصنف', 'الكمية', 'ملاحظات'];
      const rows = db.vouchers.map(v => {
        const prod = db.products.find(p => p.code === v.product);
        return [v.date, v.type, v.refCode, prod ? prod.name : v.product, v.qty, v.notes || ''];
      });
      Exports.exportExcel(Exports.rowsToHTMLTable(headers, rows, { title: 'سندات الصرف' }), "vouchers");
    },
    csv: () => {
      const headers = ['التاريخ', 'النوع', 'المرجع', 'الصنف', 'الكمية'];
      const rows = db.vouchers.map(v => [v.date, v.type, v.refCode, v.product, v.qty]);
      Exports.exportCSV(Exports.rowsToCSV(headers, rows), "vouchers");
    },
    json: () => Exports.exportJSON({ vouchers: db.vouchers }, "vouchers_data"),
    print: () => window.print()
  });


  function render() {
    container.innerHTML = `
      <div class="card">
        <div class="header-row">
          <h3>${Icons.render("plus")} سند صرف جديد</h3>
        </div>
        <form class="form-grid" id="voucherForm">
          <div class="form-group">
            <label>التاريخ</label>
            <input type="date" id="v_date" value="${new Date().toISOString().split('T')[0]}" required />
          </div>
          <div class="form-group">
            <label>النوع</label>
            <select id="v_type">
              <option value="صرف لمندوب">صرف لمندوب</option>
              <option value="صرف لوكيل">صرف لوكيل</option>
              <option value="تحويل بين مخازن">تحويل بين مخازن</option>
            </select>
          </div>
          <div class="form-group">
            <label>المرجع (المندوب/الوكيل)</label>
            <select id="v_ref"></select>
          </div>
          <div class="form-group">
            <label>الصنف</label>
            <select id="v_product">
              ${db.products.map(p => `<option value="${p.code}">${p.name}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>الكمية (كرتون)</label>
            <input type="number" id="v_qty" min="1" required />
          </div>
          <div class="form-group" style="grid-column: span 2">
            <label>ملاحظات</label>
            <input type="text" id="v_notes" />
          </div>
        </form>
        <div class="btn-row">
          <button class="btn btn-primary" data-action="add-voucher">${Icons.render("save")} حفظ السند</button>
        </div>
      </div>

      <div class="card">
        <h3>${Icons.render("clipboard")} سجل السندات (${db.vouchers.length} سند)</h3>
        <table>
          <thead>
            <tr>
              <th>التاريخ</th>
              <th>النوع</th>
              <th>المرجع</th>
              <th>الصنف</th>
              <th>الكمية</th>
              <th>ملاحظات</th>
              <th>إجراء</th>
            </tr>
          </thead>
          <tbody>
            ${db.vouchers.slice().reverse().map((v, idx) => {
              const prod = db.products.find(p => p.code === v.product);
              const realIdx = db.vouchers.length - 1 - idx;
              return `<tr>
                <td>${v.date}</td>
                <td><span class="badge badge-info">${v.type}</span></td>
                <td>${v.refCode}</td>
                <td>${prod ? prod.name : v.product}</td>
                <td class="text-primary">${v.qty}</td>
                <td class="text-muted">${v.notes || '-'}</td>
                <td><button class="btn btn-danger btn-sm" data-action="delete-voucher" data-vidx="${realIdx})">${Icons.render("trash")}</button></td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;

    function updateRefOptions() {
      const type = document.getElementById('v_type').value;
      const refSel = document.getElementById('v_ref');
      if (type === 'صرف لمندوب') {
        refSel.innerHTML = db.salesReps.map(r => `<option value="${r.code}">${r.name}</option>`).join('');
      } else if (type === 'صرف لوكيل') {
        refSel.innerHTML = db.agents.map(a => `<option value="${a.name}">${a.name}</option>`).join('');
      } else {
        refSel.innerHTML = `<option value="مخزن رئيسي">مخزن رئيسي</option><option value="مخزن فرعي">مخزن فرعي</option>`;
      }
    }
    document.getElementById('v_type').addEventListener('change', updateRefOptions);
    updateRefOptions();
  }

  Modules._addVoucher = function() {
    const v = {
      id: Date.now(),
      date: document.getElementById('v_date').value,
      type: document.getElementById('v_type').value,
      refCode: document.getElementById('v_ref').value,
      product: document.getElementById('v_product').value,
      qty: +document.getElementById('v_qty').value,
      notes: document.getElementById('v_notes').value
    };
    if (!v.date || !v.qty || v.qty < 1) return alert('يرجى ملء الحقول');
    const db = APP.getDB();
    db.vouchers.push(v);
    APP.saveDB(db);
    alert('{Icons.render("check")} تم حفظ السند وتحديث المخزون');
    render();
  };

  Modules._deleteVoucher = function(idx) {
    if (!confirm('حذف السند؟')) return;
    const db = APP.getDB();
    db.vouchers.splice(idx, 1);
    APP.saveDB(db);
    render();
  };

  render();
};

/* ============ المبيعات والمناديب ============ */
window.Modules.sales = function(container) {
  const db = APP.getDB();
  Exports.register("sales", {
    label: "المناديب والمبيعات",
    pdf: () => {
      // ملخص المناديب
      const reps = db.salesReps.map(r => DB.salesRepSummary(r.code, db));
      const repHeaders = ['المندوب', 'المركبة', 'رصيد أول الشهر', 'مبيعات', 'تحصيل', 'المديونية', 'الكمية'];
      const repRows = reps.map(r => [r.name, r.vehicle, r.openingBalance.toLocaleString('ar-EG'),
        (r.credit+r.cash).toLocaleString('ar-EG'), r.collection.toLocaleString('ar-EG'),
        { v: r.balance.toLocaleString('ar-EG'), cls: 'text-danger' }, r.qty.toLocaleString('ar-EG')]);
      const repFooter = ['الإجمالي', '',
        reps.reduce((s,r)=>s+r.openingBalance,0).toLocaleString('ar-EG'),
        reps.reduce((s,r)=>s+r.credit+r.cash,0).toLocaleString('ar-EG'),
        reps.reduce((s,r)=>s+r.collection,0).toLocaleString('ar-EG'),
        { v: reps.reduce((s,r)=>s+r.balance,0).toLocaleString('ar-EG'), cls: 'text-danger' },
        reps.reduce((s,r)=>s+r.qty,0).toLocaleString('ar-EG')];
      // السجل التفصيلي
      const detailHeaders = ['التاريخ', 'المندوب', 'الكمية', 'آجلة', 'نقدية', 'تحصيل'];
      const detailRows = db.salesLog.map(s => {
        const rep = db.salesReps.find(r => r.code === s.repCode);
        return [s.date, rep ? rep.name : s.repCode, s.qty, s.credit.toLocaleString('ar-EG'), s.cash.toLocaleString('ar-EG'), s.collection.toLocaleString('ar-EG')];
      });
      const html = Exports.rowsToHTMLTable(repHeaders, repRows, { title: 'ملخص أداء المناديب', footerRow: [repFooter] }) +
                   Exports.rowsToHTMLTable(detailHeaders, detailRows, { title: 'السجل التفصيلي' });
      Exports.exportPDF("أداء المناديب والمبيعات", html, "sales");
    },
    excel: () => {
      const reps = db.salesReps.map(r => DB.salesRepSummary(r.code, db));
      const repHeaders = ['المندوب', 'المركبة', 'رصيد أول الشهر', 'مبيعات', 'تحصيل', 'المديونية', 'الكمية المباعة'];
      const repRows = reps.map(r => [r.name, r.vehicle, r.openingBalance, r.credit+r.cash, r.collection, r.balance, r.qty]);
      const detailHeaders = ['التاريخ', 'المندوب', 'الكمية', 'آجلة', 'نقدية', 'تحصيل'];
      const detailRows = db.salesLog.map(s => {
        const rep = db.salesReps.find(r => r.code === s.repCode);
        return [s.date, rep ? rep.name : s.repCode, s.qty, s.credit, s.cash, s.collection];
      });
      const html = Exports.rowsToHTMLTable(repHeaders, repRows, { title: 'ملخص المناديب' }) +
                   Exports.rowsToHTMLTable(detailHeaders, detailRows, { title: 'سجل المبيعات التفصيلي' });
      Exports.exportExcel(html, "sales");
    },
    csv: () => {
      const headers = ['التاريخ', 'المندوب', 'الكمية', 'آجلة', 'نقدية', 'تحصيل'];
      const rows = db.salesLog.map(s => {
        const rep = db.salesReps.find(r => r.code === s.repCode);
        return [s.date, rep ? rep.name : s.repCode, s.qty, s.credit, s.cash, s.collection];
      });
      Exports.exportCSV(Exports.rowsToCSV(headers, rows), "sales");
    },
    json: () => Exports.exportJSON({ salesReps: db.salesReps, salesLog: db.salesLog }, "sales_data"),
    print: () => window.print()
  });


  function render() {
    const reps = db.salesReps.map(r => DB.salesRepSummary(r.code, db));

    container.innerHTML = `
      <div class="alert alert-success">
        <span>${Icons.render("truck")}</span>
        <span>أداء المناديب (دباب / دينة) — متابعة المبيعات والتحصيل والمديونيات لحظياً.</span>
      </div>

      <div class="card">
        <div class="header-row">
          <h3>${Icons.render("clipboard")} ملخص أداء المناديب للشهر</h3>
          <button class="btn btn-secondary btn-sm" data-action="export-sales">${Icons.render("download")} تصدير</button>
        </div>
        <table>
          <thead>
            <tr>
              <th>المندوب</th>
              <th>المركبة</th>
              <th>رصيد أول الشهر</th>
              <th>مبيعات الشهر</th>
              <th>تحصيل</th>
              <th class="text-primary">المديونية الحالية</th>
              <th>الكمية المباعة</th>
            </tr>
          </thead>
          <tbody>
            ${reps.map(r => `
              <tr>
                <td><b>${r.name}</b></td>
                <td><span class="badge badge-info">${r.vehicle}</span></td>
                <td>${r.openingBalance.toLocaleString('ar-EG')}</td>
                <td class="text-success">${(r.credit + r.cash).toLocaleString('ar-EG')}</td>
                <td class="text-primary">${r.collection.toLocaleString('ar-EG')}</td>
                <td class="text-danger"><b>${r.balance.toLocaleString('ar-EG')}</b></td>
                <td>${r.qty.toLocaleString('ar-EG')} كرتون</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2">الإجمالي</td>
              <td>${reps.reduce((s,r) => s + r.openingBalance, 0).toLocaleString('ar-EG')}</td>
              <td>${reps.reduce((s,r) => s + r.credit + r.cash, 0).toLocaleString('ar-EG')}</td>
              <td>${reps.reduce((s,r) => s + r.collection, 0).toLocaleString('ar-EG')}</td>
              <td class="text-danger">${reps.reduce((s,r) => s + r.balance, 0).toLocaleString('ar-EG')}</td>
              <td>${reps.reduce((s,r) => s + r.qty, 0).toLocaleString('ar-EG')}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div class="card">
        <h3>${Icons.render("profit")} مخطط مقارنة المناديب</h3>
        <canvas id="chartReps" height="100"></canvas>
      </div>

      <!-- ===== إدارة المناديب ===== -->
      <div class="card">
        <div class="header-row">
          <h3>${Icons.render("users")} إدارة المناديب</h3>
          <button class="btn btn-primary btn-sm" data-action="add-rep-form">${Icons.render("plus")} إضافة مندوب</button>
        </div>
        <div id="addRepForm" style="display:none;background:var(--bg-darker);padding:16px;border-radius:12px;margin-bottom:16px">
          <h4 style="margin-top:0">${Icons.render("plus")} إضافة مندوب جديد</h4>
          <div class="form-grid" style="grid-template-columns:repeat(4,1fr)">
            <div class="form-group"><label>اسم المندوب</label><input type="text" id="rep_name" placeholder="اسم كامل" required /></div>
            <div class="form-group"><label>الرمز</label><input type="text" id="rep_code" placeholder="رمز مختصر" required /></div>
            <div class="form-group"><label>المركبة</label>
              <select id="rep_vehicle"><option value="دباب">دباب</option><option value="دينة">دينة</option><option value="فان">فان</option></select>
            </div>
            <div class="form-group"><label>الرصيد الافتتاحي (ر.ي)</label><input type="number" id="rep_balance" value="0" min="0" /></div>
          </div>
          <div class="btn-row">
            <button class="btn btn-primary" data-action="save-rep">${Icons.render("save")} حفظ</button>
            <button class="btn btn-secondary" data-action="cancel-rep-form">إلغاء</button>
          </div>
        </div>
        <div id="editRepForm" style="display:none;background:var(--bg-darker);padding:16px;border-radius:12px;margin-bottom:16px">
          <h4 style="margin-top:0">${Icons.render("edit")} تعديل المندوب</h4>
          <input type="hidden" id="edit_rep_id" />
          <div class="form-grid" style="grid-template-columns:repeat(4,1fr)">
            <div class="form-group"><label>اسم المندوب</label><input type="text" id="edit_rep_name" placeholder="اسم كامل" required /></div>
            <div class="form-group"><label>الرمز</label><input type="text" id="edit_rep_code" placeholder="رمز مختصر" required /></div>
            <div class="form-group"><label>المركبة</label>
              <select id="edit_rep_vehicle"><option value="دباب">دباب</option><option value="دينة">دينة</option><option value="فان">فان</option></select>
            </div>
            <div class="form-group"><label>الرصيد الافتتاحي (ر.ي)</label><input type="number" id="edit_rep_balance" value="0" min="0" /></div>
          </div>
          <div class="btn-row">
            <button class="btn btn-primary" data-action="update-rep">${Icons.render("save")} تحديث</button>
            <button class="btn btn-secondary" data-action="cancel-rep-form">إلغاء</button>
          </div>
        </div>
        <table>
          <thead>
            <tr><th>الاسم</th><th>الرمز</th><th>المركبة</th><th>الرصيد الافتتاحي</th><th>إجمالي المبيعات</th><th>إجمالي التحصيل</th><th>المديونية</th><th>إجراءات</th></tr>
          </thead>
          <tbody>
            ${db.salesReps.map(r => {
              const summary = DB.salesRepSummary(r.code, db);
              return `<tr id="rep_row_${r.id}">
                <td><b>${r.name}</b></td>
                <td><span class="badge badge-info">${r.code}</span></td>
                <td>${r.vehicle || '-'}</td>
                <td>${(r.openingBalance||0).toLocaleString('ar-EG')}</td>
                <td class="text-success">${((summary.credit||0)+(summary.cash||0)).toLocaleString('ar-EG')}</td>
                <td class="text-primary">${(summary.collection||0).toLocaleString('ar-EG')}</td>
                <td class="text-danger"><b>${(summary.balance||0).toLocaleString('ar-EG')}</b></td>
                <td>
                  <button class="btn btn-warning btn-sm" data-action="edit-rep" data-rep-id="${r.id}">${Icons.render("edit")}</button>
                  <button class="btn btn-danger btn-sm" data-action="delete-rep" data-rep-id="${r.id}" data-rep-name="${r.name}">${Icons.render("trash")}</button>
                </td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>

      <!-- ===== تسجيل التحصيل ===== -->
      <div class="card">
        <div class="header-row">
          <h3>${Icons.render("collection")} تسجيل تحصيل نقدي</h3>
        </div>
        <div class="form-grid" style="grid-template-columns:repeat(4,1fr)">
          <div class="form-group">
            <label>التاريخ</label>
            <input type="date" id="col_date" value="${new Date().toISOString().split('T')[0]}" />
          </div>
          <div class="form-group">
            <label>المندوب</label>
            <select id="col_rep">
              <option value="">-- اختر --</option>
              ${db.salesReps.map(r => `<option value="${r.code}">${r.name}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>المبلغ المحصل (ر.ي)</label>
            <input type="number" id="col_amount" min="1" placeholder="أدخل المبلغ" />
          </div>
          <div class="form-group">
            <label>ملاحظة</label>
            <input type="text" id="col_note" placeholder="اختياري" />
          </div>
        </div>
        <div id="colPreview" class="alert" style="display:none;margin-top:8px"></div>
        <div class="btn-row">
          <button class="btn btn-success" data-action="submit-collection">${Icons.render("check")} تسجيل التحصيل</button>
        </div>
      </div>

      <!-- ===== سجل التحصيل ===== -->
      <div class="card">
        <h3>${Icons.render("collection")} سجل التحصيل</h3>
        <table>
          <thead>
            <tr><th>التاريخ</th><th>المندوب</th><th>المبلغ (ر.ي)</th><th>ملاحظة</th></tr>
          </thead>
          <tbody>
            ${((db.collectionLog||[]).length > 0 ? db.collectionLog.slice().reverse() : []).map(c => {
              const rep = db.salesReps.find(r => r.code === c.repCode);
              return `<tr>
                <td>${c.date}</td>
                <td><b>${rep ? rep.name : c.repCode}</b></td>
                <td class="text-success"><b>${(c.amount||0).toLocaleString('ar-EG')}</b></td>
                <td class="text-muted">${c.note||'-'}</td>
              </tr>`;
            }).join('')}
          </tbody>
          <tfoot>
            <tr style="background:var(--bg-darker);font-weight:700">
              <td colspan="2">الإجمالي المحصل</td>
              <td class="text-success">${((db.collectionLog||[]).reduce((s,c)=>s+(c.amount||0),0)).toLocaleString('ar-EG')}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div class="card">
        <h3>${Icons.render("document")} سجل مبيعات تفصيلي</h3>
        <div class="search-bar">
          <span class="icon">${Icons.render("search")}</span>
          <input type="text" id="salesSearch" data-filter="sales" placeholder="ابحث باسم المندوب أو التاريخ..." />
        </div>
        <div style="max-height:500px;overflow-y:auto">
          <table id="salesTable">
            <thead>
              <tr>
                <th>التاريخ</th>
                <th>المندوب</th>
                <th>الكمية</th>
                <th>آجلة</th>
                <th>نقدية</th>
                <th>تحصيل</th>
              </tr>
            </thead>
            <tbody id="salesTbody">
              ${db.salesLog.slice().reverse().map(s => {
                const rep = db.salesReps.find(r => r.code === s.repCode);
                return `<tr data-search="${s.date} ${rep ? rep.name : ''} ${s.repCode}">
                  <td>${s.date}</td>
                  <td>${rep ? rep.name : s.repCode}</td>
                  <td class="text-primary">${s.qty}</td>
                  <td class="text-warning">${s.credit.toLocaleString('ar-EG')}</td>
                  <td class="text-success">${s.cash.toLocaleString('ar-EG')}</td>
                  <td>${s.collection.toLocaleString('ar-EG')}</td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- بطاقة البيع الآجل مع فحص الائتمان -->
      <div class="card">
        <h3>${Icons.render("plus")} تسجيل حركة مبيعات جديدة</h3>
        <div id="salesEntryAlert" class="alert" style="display:none"></div>
        <form id="salesEntryForm">
          <div class="form-grid" style="grid-template-columns: repeat(4, 1fr)">
            <div class="form-group">
              <label>التاريخ</label>
              <input type="date" id="se_date" value="${new Date().toISOString().split('T')[0]}" required />
            </div>
            <div class="form-group">
              <label>المندوب</label>
              <select id="se_rep" required>
                <option value="">-- اختر --</option>
                ${db.salesReps.map(r => `<option value="${r.code}">${r.name}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>العميل / السوق</label>
              <input type="text" id="se_customer" placeholder="اسم العميل أو السوق" required />
            </div>
            <div class="form-group">
              <label>نوع البيع</label>
              <select id="se_type">
                <option value="cash">نقدي فقط</option>
                <option value="mixed">نقدي + آجل</option>
                <option value="credit">آجل فقط</option>
              </select>
            </div>
          </div>

          <h4 style="margin-top:20px;margin-bottom:10px">${Icons.render("box")} الأصناف المباعة</h4>
          <div style="overflow-x:auto">
            <table id="seProductsTable" style="min-width:800px">
              <thead>
                <tr>
                  <th>الصنف</th>
                  <th>الكمية (كرتون)</th>
                  <th>سعر الوحدة (ر.ي)</th>
                  <th>الإجمالي (ر.ي)</th>
                  <th>نقدي (ر.ي)</th>
                  <th>آجل (ر.ي)</th>
                </tr>
              </thead>
              <tbody>
                ${db.products.map((p, i) => {
                  const price = (db.pricing.find(pr => pr.code === p.code) || {}).retailPrice || 0;
                  return `<tr data-pcode="${p.code}">
                    <td><b>${p.name}</b><br><small class="text-muted">${p.size} | ${p.packaging}</small></td>
                    <td>
                      <input type="number" id="se_qty_${i}" min="0" step="1" value="0"
                        data-product-idx="${i}" data-action="se-qty-change"
                        style="width:90px;text-align:center;font-weight:700" />
                    </td>
                    <td>
                      <input type="number" id="se_price_${i}" min="0" value="${price}"
                        data-product-idx="${i}" data-action="se-price-change"
                        style="width:100px;text-align:center" />
                    </td>
                    <td id="se_subtotal_${i}" style="text-align:center;font-weight:700;color:var(--primary)">0</td>
                    <td>
                      <input type="number" id="se_cash_${i}" min="0" value="0"
                        data-product-idx="${i}" data-action="se-cash-change"
                        style="width:100px;text-align:center" />
                    </td>
                    <td>
                      <input type="number" id="se_credit_${i}" min="0" value="0"
                        data-product-idx="${i}" data-action="se-credit-change"
                        style="width:100px;text-align:center" />
                    </td>
                  </tr>`;
                }).join('')}
              </tbody>
              <tfoot>
                <tr style="background:var(--bg-darker);font-weight:700">
                  <td colspan="3" style="text-align:left">الإجمالي</td>
                  <td id="se_total" style="text-align:center;font-size:1.2em;color:var(--primary)">0</td>
                  <td id="se_totalCash" style="text-align:center;color:#2e7d32">0</td>
                  <td id="se_totalCredit" style="text-align:center;color:#c62828">0</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div class="form-grid" style="margin-top:16px;grid-template-columns: repeat(3, 1fr)">
            <div class="form-group">
              <label>إجمالي النقدي</label>
              <input type="text" id="se_displayCash" readonly style="font-weight:700;color:#2e7d32" />
            </div>
            <div class="form-group">
              <label>إجمالي الآجل</label>
              <input type="text" id="se_displayCredit" readonly style="font-weight:700;color:#c62828" />
            </div>
            <div class="form-group">
              <label>الإجمالي الكلي</label>
              <input type="text" id="se_displayTotal" readonly style="font-weight:700;color:var(--primary)" />
            </div>
          </div>

          <div id="seCreditAlert" class="alert alert-warning" style="display:none;margin-top:10px"></div>

          <div class="form-group" style="margin-top:10px">
            <label>ملاحظات</label>
            <input type="text" id="se_notes" placeholder="ملاحظات إضافية (اختياري)" />
          </div>

          <div class="btn-row" style="margin-top:14px">
            <button type="button" class="btn btn-primary" data-action="se-submit">${Icons.render("check")} تسجيل البيع</button>
            <button type="button" class="btn btn-secondary" data-action="se-reset">مسح الكل</button>
          </div>
        </form>
      </div>
    `;

    // --- Sales Entry JS ---
    const seProducts = db.products.map((p, i) => ({
      code: p.code,
      name: p.name,
      qty: 0,
      price: (db.pricing.find(pr => pr.code === p.code) || {}).retailPrice || 0,
      subtotal: 0,
      cash: 0,
      credit: 0
    }));

    window.__SE = window.__SE || {};
    window.__SE.products = seProducts;

    function seCalc() {
      let total = 0, totalCash = 0, totalCredit = 0;
      seProducts.forEach((p, i) => {
        p.subtotal = p.qty * p.price;
        total += p.subtotal;
        totalCash += p.cash;
        totalCredit += p.credit;
        var subEl = document.getElementById('se_subtotal_' + i);
        if (subEl) subEl.textContent = p.subtotal.toLocaleString('ar-EG');
      });
      var totEl = document.getElementById('se_total');
      var cashEl = document.getElementById('se_displayCash');
      var creditEl = document.getElementById('se_displayCredit');
      var total2El = document.getElementById('se_displayTotal');
      if (totEl) totEl.textContent = total.toLocaleString('ar-EG');
      if (cashEl) cashEl.value = totalCash.toLocaleString('ar-EG') + ' ر.ي';
      if (creditEl) creditEl.value = totalCredit.toLocaleString('ar-EG') + ' ر.ي';
      if (total2El) total2El.value = (totalCash + totalCredit).toLocaleString('ar-EG') + ' ر.ي';
    }

    // Attach inline input handlers (these are bound directly to inputs, not from delegation)
    seProducts.forEach((p, i) => {
      setTimeout(() => {
        var qtyEl = document.getElementById('se_qty_' + i);
        var priceEl = document.getElementById('se_price_' + i);
        var cashEl = document.getElementById('se_cash_' + i);
        var creditEl = document.getElementById('se_credit_' + i);
        if (qtyEl) qtyEl.addEventListener('input', function() { p.qty = parseFloat(this.value) || 0; seCalc(); });
        if (priceEl) priceEl.addEventListener('input', function() { p.price = parseFloat(this.value) || 0; seCalc(); });
        if (cashEl) cashEl.addEventListener('input', function() { p.cash = parseFloat(this.value) || 0; seCalc(); });
        if (creditEl) creditEl.addEventListener('input', function() { p.credit = parseFloat(this.value) || 0; seCalc(); });
      }, 50);
    });

    // Submit handler
    window.__SE.calc = seCalc;

    window.__SE.submit = function() {
      var date = document.getElementById('se_date').value;
      var repCode = document.getElementById('se_rep').value;
      var customer = document.getElementById('se_customer').value.trim();
      var notes = document.getElementById('se_notes').value.trim();
      var type = document.getElementById('se_type').value;

      if (!date || !repCode || !customer) { alert('يرجى تعبئة التاريخ والمندوب واسم العميل'); return; }
      var hasProducts = seProducts.some(p => p.qty > 0 || p.cash > 0 || p.credit > 0);
      if (!hasProducts) { alert('يرجى إدخال أصناف على الأقل'); return; }
      var db2 = APP.getDB();
      if (!db2.customerCredits) db2.customerCredits = [];
      if (!db2.creditAlerts) db2.creditAlerts = [];
      var totalQty = 0, totalCash = 0, totalCredit = 0;
      var entries = [];
      seProducts.forEach((p) => {
        if (p.qty <= 0 && p.cash <= 0 && p.credit <= 0) return;
        totalQty += p.qty;
        totalCash += p.cash;
        totalCredit += p.credit;
        entries.push({ code: p.code, name: p.name, qty: p.qty, price: p.price, subtotal: p.subtotal, cash: p.cash, credit: p.credit });
        if (p.credit > 0) {
          let cust = db2.customerCredits.find(c => c.customerName === customer);
          if (!cust) {
            var limitStr = prompt('العميل "' + customer + '" غير مسجل في نظام الائتمان. أدخل سقف الائتمان (ر.ي):');
            var limit = parseFloat(limitStr || '0');
            if (!limit || limit <= 0) { alert('تم الإلغاء - يجب تحديد سقف ائتمان'); return; }
            cust = { id: 'cr' + Date.now(), customerName: customer, creditLimit: limit, currentBalance: 0, blocked: false, lastPayment: null, notes: '' };
            db2.customerCredits.push(cust);
          }
          var newBal = cust.currentBalance + p.credit;
          cust.currentBalance = newBal;
          if (newBal > cust.creditLimit && !cust.blocked) {
            cust.blocked = true;
            db2.creditAlerts.push({ id: 'alert' + Date.now(), date: date, customerId: cust.id, customerName: customer, alertType: 'limit_exceeded', message: 'تجاوز سقف الائتمان! ' + newBal.toLocaleString('ar-EG') + ' ر.ي exceeds الحد ' + cust.creditLimit.toLocaleString('ar-EG') + ' ر.ي', read: false, resolved: false, resolvedBy: null, resolvedAt: null, action: null });
          }
        }
      });
      db2.salesLog.push({ date: date, repCode: repCode, qty: totalQty, credit: totalCredit, cash: totalCash, collection: 0, customerName: customer, notes: notes, entries: entries, type: type });
      APP.saveDB(db2);
      alert(Icons.render('check') + ' تم تسجيل البيع بنجاح!\nالكمية: ' + totalQty + ' كرتون | النقدي: ' + totalCash.toLocaleString('ar-EG') + ' | الآجل: ' + totalCredit.toLocaleString('ar-EG'));
      window.__SE.reset();
      render();
    };

    window.__SE.reset = function() {
      seProducts.forEach((p, i) => {
        p.qty = 0; p.price = (db.pricing.find(pr => pr.code === p.code) || {}).retailPrice || 0; p.subtotal = 0; p.cash = 0; p.credit = 0;
        var qEl = document.getElementById('se_qty_' + i);
        var pEl = document.getElementById('se_price_' + i);
        var cEl = document.getElementById('se_cash_' + i);
        var crEl = document.getElementById('se_credit_' + i);
        if (qEl) qEl.value = 0;
        if (pEl) pEl.value = p.price;
        if (cEl) cEl.value = 0;
        if (crEl) crEl.value = 0;
      });
      document.getElementById('se_customer').value = '';
      document.getElementById('se_notes').value = '';
      document.getElementById('se_type').value = 'cash';
      seCalc();
    };

    setTimeout(() => {
      new Chart(document.getElementById('chartReps'), {
        type: 'bar',
        data: {
          labels: reps.map(r => r.name),
          datasets: [
            { label: 'مبيعات', data: reps.map(r => r.credit + r.cash), backgroundColor: '#1565c0' },
            { label: 'تحصيل', data: reps.map(r => r.collection), backgroundColor: '#2e7d32' },
            { label: 'مديونية', data: reps.map(r => r.balance), backgroundColor: '#c62828' }
          ]
        },
        options: { responsive: true }
      });
    }, 100);
  }

  Modules._filterSales = function() {
    const q = document.getElementById('salesSearch').value.toLowerCase();
    document.querySelectorAll('#salesTbody tr').forEach(tr => {
      const txt = tr.dataset.search.toLowerCase();
      tr.style.display = txt.includes(q) ? '' : 'none';
    });
  };

  // --- Rep Management ---
  Modules._saveRep = function() {
    var name = document.getElementById('rep_name').value.trim();
    var code = document.getElementById('rep_code').value.trim();
    var vehicle = document.getElementById('rep_vehicle').value;
    var balance = parseFloat(document.getElementById('rep_balance').value) || 0;
    if (!name || !code) { alert('يرجى إدخال الاسم والرمز'); return; }
    var db2 = APP.getDB();
    if (!db2.salesReps) db2.salesReps = [];
    if (db2.salesReps.find(r => r.code === code)) { alert('رمز المندوب موجود مسبقاً!'); return; }
    db2.salesReps.push({ id: Date.now(), name, code, vehicle, openingBalance: balance, notes: '' });
    APP.saveDB(db2);
    alert(Icons.render('check') + ' تم إضافة المندوب بنجاح');
    Modules.sales && Modules.sales(container);
  };

  Modules._editRep = function(id) {
    var db2 = APP.getDB();
    var rep = db2.salesReps.find(r => r.id === id);
    if (!rep) return;
    document.getElementById('edit_rep_id').value = id;
    document.getElementById('edit_rep_name').value = rep.name;
    document.getElementById('edit_rep_code').value = rep.code;
    document.getElementById('edit_rep_vehicle').value = rep.vehicle || 'دباب';
    document.getElementById('edit_rep_balance').value = rep.openingBalance || 0;
    var f = document.getElementById('editRepForm');
    if (f) { f.style.display = 'block'; }
    var af = document.getElementById('addRepForm');
    if (af) af.style.display = 'none';
    document.getElementById('edit_rep_name').focus();
  };

  Modules._updateRep = function() {
    var id = parseInt(document.getElementById('edit_rep_id').value);
    var name = document.getElementById('edit_rep_name').value.trim();
    var code = document.getElementById('edit_rep_code').value.trim();
    var vehicle = document.getElementById('edit_rep_vehicle').value;
    var balance = parseFloat(document.getElementById('edit_rep_balance').value) || 0;
    if (!name || !code) { alert('يرجى إدخال الاسم والرمز'); return; }
    var db2 = APP.getDB();
    var rep = db2.salesReps.find(r => r.id === id);
    if (!rep) return;
    rep.name = name; rep.code = code; rep.vehicle = vehicle; rep.openingBalance = balance;
    APP.saveDB(db2);
    alert(Icons.render('check') + ' تم تحديث بيانات المندوب');
    Modules.sales && Modules.sales(container);
  };

  Modules._deleteRep = function(id, name) {
    if (!confirm('هل أنت متأكد من حذف المندوب \u201c' + name + '\u201d؟ هذا الإجراء لا يمكن التراجع عنه.')) return;
    var db2 = APP.getDB();
    db2.salesReps = db2.salesReps.filter(r => r.id !== id);
    APP.saveDB(db2);
    alert(Icons.render('check') + ' تم حذف المندوب');
    Modules.sales && Modules.sales(container);
  };

  // --- Collections ---
  Modules._submitCollection = function() {
    var date = document.getElementById('col_date').value;
    var repCode = document.getElementById('col_rep').value;
    var amount = parseFloat(document.getElementById('col_amount').value) || 0;
    var note = document.getElementById('col_note').value.trim();
    if (!repCode || !amount || amount <= 0) { alert('يرجى اختيار المندوب وإدخال المبلغ'); return; }
    var db2 = APP.getDB();
    if (!db2.collectionLog) db2.collectionLog = [];
    db2.collectionLog.push({ date: date || new Date().toISOString().split('T')[0], repCode, amount, note });
    db2.salesLog.push({
      date: date || new Date().toISOString().split('T')[0],
      repCode: repCode, qty: 0, credit: 0, cash: 0, collection: amount,
      customerName: '-', notes: 'تحصيل نقدي - ' + (note || 'بدون ملاحظة')
    });
    APP.saveDB(db2);
    alert(Icons.render('check') + ' تم تسجيل التحصيل بنجاح!\nالمحصل: ' + amount.toLocaleString('ar-EG') + ' ر.ي');
    Modules.sales && Modules.sales(container);
  };

  render();
};


/* ============ مبيعاتي (لمندوب المبيعات فقط) ============ */
window.Modules.mySales = function(container) {
  const db = APP.getDB();
  const user = APP.getUser();

  // Find this rep by matching user name
  const myName = (user.name || '').trim();
  const myRep = (db.salesReps || []).find(r =>
    r.name === myName || r.code === myName || myName.includes(r.name.split(' ')[0])
  );
  const myRepCode = myRep ? myRep.code : null;

  Exports.register("mySales", {
    label: "مبيعاتي",
    pdf: () => {
      const myLog = (db.salesLog || []).filter(s => s.repCode === myRepCode);
      const rows = myLog.map(s => [s.date, s.customerName || '-', s.qty, (s.cash||0).toLocaleString('ar-EG'), (s.credit||0).toLocaleString('ar-EG'), (s.collection||0).toLocaleString('ar-EG')]);
      const html = `<h2>${myRep ? myRep.name : 'مندوب'}</h2>` + Exports.rowsToHTMLTable(['التاريخ','العميل','الكمية','نقدي','آجل','تحصيل'], rows, { title: 'سجل مبيعاتي' });
      Exports.exportPDF("مبيعاتي", html, "mySales");
    },
    excel: () => Exports.exportExcel(Exports.rowsToHTMLTable(['التاريخ','العميل','الكمية','نقدي','آجل','تحصيل'], (db.salesLog || []).filter(s => s.repCode === myRepCode).map(s => [s.date, s.customerName||'-', s.qty, s.cash||0, s.credit||0, s.collection||0]), { title: 'مبيعاتي' }), "mySales"),
    csv: () => Exports.exportCSV([['التاريخ','العميل','الكمية','نقدي','آجل','تحصيل']].concat((db.salesLog || []).filter(s => s.repCode === myRepCode).map(s => [s.date, s.customerName||'-', s.qty, s.cash||0, s.credit||0, s.collection||0])), "mySales"),
    json: () => Exports.exportJSON({ mySales: (db.salesLog || []).filter(s => s.repCode === myRepCode) }, "mySales_data"),
    print: () => window.print()
  });

  if (!myRepCode) {
    container.innerHTML = `<div class="card"><div class="alert alert-warning">${Icons.render('alert')} لم يتم الربط بحساب مندوب. يرجى مراجعة مدير النظام.</div></div>`;
    return;
  }

  const myLog = (db.salesLog || []).filter(s => s.repCode === myRepCode);
  const myEntries = myLog.filter(s => s.entries && s.entries.length > 0);
  const totalQty = myLog.reduce((s, r) => s + (r.qty || 0), 0);
  const totalCash = myLog.reduce((s, r) => s + (r.cash || 0), 0);
  const totalCredit = myLog.reduce((s, r) => s + (r.credit || 0), 0);
  const totalColl = myLog.reduce((s, r) => s + (r.collection || 0), 0);
  const myBalance = (myRep.openingBalance || 0) + myLog.reduce((s, r) => s + (r.cash || 0) + (r.credit || 0), 0) - totalColl;

  container.innerHTML = `
    <div class="alert alert-info">
      ${Icons.render('info')}
      <span>مرحباً <b>${myRep.name}</b> — سجل مبيعاتك الشخصية. الكميات المباعة والسيولة محدّثة لحظياً.</span>
    </div>

    <div class="kpi-grid">
      <div class="kpi-card info">
        <div class="label"><span class="ic">${Icons.render('box')}</span> إجمالي الكمية المباعة</div>
        <div class="value">${totalQty.toLocaleString('ar-EG')}</div>
        <div class="delta">كرتون</div>
      </div>
      <div class="kpi-card success">
        <div class="label"><span class="ic">${Icons.render('cash')}</span> إجمالي المبيعات النقدية</div>
        <div class="value">${(totalCash/1000).toFixed(0)}K</div>
        <div class="delta">ريال يمني</div>
      </div>
      <div class="kpi-card warning">
        <div class="label"><span class="ic">${Icons.render('credit')}</span> إجمالي المبيعات الآجلة</div>
        <div class="value">${(totalCredit/1000).toFixed(0)}K</div>
        <div class="delta">ريال يمني</div>
      </div>
      <div class="kpi-card danger">
        <div class="label"><span class="ic">${Icons.render('debt')}</span> مديونيتي</div>
        <div class="value">${(myBalance/1000).toFixed(0)}K</div>
        <div class="delta">ريال يمني</div>
      </div>
    </div>

    <div class="card" style="margin-top:20px">
      <h3>${Icons.render("plus")} تسجيل عملية بيع جديدة</h3>
      <form id="repSaleForm">
        <div class="form-grid" style="grid-template-columns:repeat(4,1fr)">
          <div class="form-group">
            <label>التاريخ</label>
            <input type="date" id="rs_date" value="${new Date().toISOString().split('T')[0]}" />
          </div>
          <div class="form-group">
            <label>العميل / السوق</label>
            <input type="text" id="rs_customer" placeholder="اسم العميل أو السوق" required />
          </div>
          <div class="form-group">
            <label>نوع البيع</label>
            <select id="rs_type">
              <option value="cash">نقدي فقط</option>
              <option value="mixed">نقدي + آجل</option>
              <option value="credit">آجل فقط</option>
            </select>
          </div>
          <div class="form-group">
            <label>ملاحظة</label>
            <input type="text" id="rs_notes" placeholder="اختياري" />
          </div>
        </div>

        <h4 style="margin-top:16px;margin-bottom:10px">${Icons.render("box")} الأصناف</h4>
        <div style="overflow-x:auto">
          <table style="min-width:700px">
            <thead>
              <tr><th>الصنف</th><th>الكمية (كرتون)</th><th>السعر (ر.ي)</th><th>الإجمالي</th><th>نقدي</th><th>آجل</th></tr>
            </thead>
            <tbody>
              ${db.products.map((p, i) => {
                const price = (db.pricing.find(pr => pr.code === p.code) || {}).retailPrice || 0;
                return `<tr>
                  <td><b>${p.name}</b><br><small class="text-muted">${p.size} | ${p.packaging}</small></td>
                  <td><input type="number" id="rs_qty_${i}" min="0" value="0" data-idx="${i}" data-action="rs-qty" style="width:85px;text-align:center;font-weight:700" /></td>
                  <td><input type="number" id="rs_price_${i}" value="${price}" data-idx="${i}" data-action="rs-price" style="width:95px;text-align:center" /></td>
                  <td id="rs_sub_${i}" style="text-align:center;font-weight:700;color:var(--primary)">0</td>
                  <td><input type="number" id="rs_cash_${i}" min="0" value="0" data-idx="${i}" data-action="rs-cash" style="width:95px;text-align:center" /></td>
                  <td><input type="number" id="rs_credit_${i}" min="0" value="0" data-idx="${i}" data-action="rs-credit" style="width:95px;text-align:center" /></td>
                </tr>`;
              }).join('')}
            </tbody>
            <tfoot>
              <tr style="background:var(--bg-darker);font-weight:700">
                <td colspan="3">الإجمالي</td>
                <td id="rs_total" style="text-align:center;font-size:1.15em;color:var(--primary)">0</td>
                <td id="rs_totalCash" style="text-align:center;color:#2e7d32">0</td>
                <td id="rs_totalCredit" style="text-align:center;color:#c62828">0</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div class="form-grid" style="margin-top:12px;grid-template-columns:repeat(3,1fr)">
          <div class="form-group"><label>إجمالي النقدي</label><input type="text" id="rs_dispCash" readonly style="font-weight:700;color:#2e7d32" /></div>
          <div class="form-group"><label>إجمالي الآجل</label><input type="text" id="rs_dispCredit" readonly style="font-weight:700;color:#c62828" /></div>
          <div class="form-group"><label>الإجمالي الكلي</label><input type="text" id="rs_dispTotal" readonly style="font-weight:700;color:var(--primary)" /></div>
        </div>

        <div class="btn-row" style="margin-top:14px">
          <button type="button" class="btn btn-primary" data-action="rs-submit">${Icons.render("check")} تسجيل البيع</button>
          <button type="button" class="btn btn-secondary" data-action="rs-reset">مسح</button>
        </div>
      </form>
    </div>

    <div class="card" style="margin-top:20px">
      <h3>${Icons.render("document")} سجل مبيعاتي (${myLog.length} عملية)</h3>
      <div style="max-height:500px;overflow-y:auto">
        <table>
          <thead>
            <tr><th>التاريخ</th><th>العميل</th><th>الكمية</th><th>النقدي</th><th>الآجل</th><th>ملاحظة</th></tr>
          </thead>
          <tbody>
            ${myLog.slice().reverse().map(s => `
              <tr>
                <td>${s.date}</td>
                <td><b>${s.customerName || '-'}</b></td>
                <td class="text-primary">${(s.qty||0).toLocaleString('ar-EG')}</td>
                <td class="text-success">${(s.cash||0).toLocaleString('ar-EG')}</td>
                <td class="text-warning">${(s.credit||0).toLocaleString('ar-EG')}</td>
                <td class="text-muted">${s.notes || '-'}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  // --- Rep Sale JS ---
  const rsProds = db.products.map((p, i) => ({
    qty: 0, price: (db.pricing.find(pr => pr.code === p.code) || {}).retailPrice || 0,
    subtotal: 0, cash: 0, credit: 0
  }));

  window.__RS = window.__RS || {};
  window.__RS.prods = rsProds;

  function rsCalc() {
    let total = 0, tCash = 0, tCredit = 0;
    rsProds.forEach((p, i) => {
      p.subtotal = p.qty * p.price;
      total += p.subtotal; tCash += p.cash; tCredit += p.credit;
      var el = document.getElementById('rs_sub_' + i);
      if (el) el.textContent = p.subtotal.toLocaleString('ar-EG');
    });
    var te = document.getElementById('rs_total');
    if (te) te.textContent = total.toLocaleString('ar-EG');
    var dc = document.getElementById('rs_dispCash');
    if (dc) dc.value = tCash.toLocaleString('ar-EG') + ' ر.ي';
    var cr = document.getElementById('rs_dispCredit');
    if (cr) cr.value = tCredit.toLocaleString('ar-EG') + ' ر.ي';
    var tt = document.getElementById('rs_dispTotal');
    if (tt) tt.value = (tCash + tCredit).toLocaleString('ar-EG') + ' ر.ي';
  }

  window.__RS.calc = rsCalc;

  db.products.forEach((p, i) => {
    setTimeout(() => {
      var qEl = document.getElementById('rs_qty_' + i);
      var pEl = document.getElementById('rs_price_' + i);
      var cEl = document.getElementById('rs_cash_' + i);
      var crEl = document.getElementById('rs_credit_' + i);
      if (qEl) qEl.addEventListener('input', () => { rsProds[i].qty = parseFloat(qEl.value) || 0; rsCalc(); });
      if (pEl) pEl.addEventListener('input', () => { rsProds[i].price = parseFloat(pEl.value) || 0; rsCalc(); });
      if (cEl) cEl.addEventListener('input', () => { rsProds[i].cash = parseFloat(cEl.value) || 0; rsCalc(); });
      if (crEl) crEl.addEventListener('input', () => { rsProds[i].credit = parseFloat(crEl.value) || 0; rsCalc(); });
    }, 50);
  });

  window.__RS.submit = function() {
    var date = document.getElementById('rs_date').value;
    var customer = document.getElementById('rs_customer').value.trim();
    var notes = document.getElementById('rs_notes').value.trim();
    var type = document.getElementById('rs_type').value;
    if (!customer) { alert('يرجى إدخال اسم العميل'); return; }
    var hasItems = rsProds.some(p => p.qty > 0 || p.cash > 0 || p.credit > 0);
    if (!hasItems) { alert('يرجى إدخال أصناف على الأقل'); return; }
    var totalQty = 0, totalCash = 0, totalCredit = 0;
    var entries = [];
    rsProds.forEach((p, i) => {
      if (p.qty <= 0 && p.cash <= 0 && p.credit <= 0) return;
      totalQty += p.qty; totalCash += p.cash; totalCredit += p.credit;
      entries.push({ code: db.products[i].code, name: db.products[i].name, qty: p.qty, price: p.price, subtotal: p.subtotal, cash: p.cash, credit: p.credit });
    });
    var db2 = APP.getDB();
    db2.salesLog.push({ date, repCode: myRepCode, qty: totalQty, credit: totalCredit, cash: totalCash, collection: 0, customerName: customer, notes: 'مبيعاتي - ' + notes, entries, type });
    APP.saveDB(db2);
    alert(Icons.render('check') + ' تم تسجيل البيع بنجاح!\nالكمية: ' + totalQty + ' | النقدي: ' + totalCash.toLocaleString('ar-EG') + ' | الآجل: ' + totalCredit.toLocaleString('ar-EG'));
    window.__RS.reset && window.__RS.reset();
    Modules.mySales && Modules.mySales(container);
  };

  window.__RS.reset = function() {
    rsProds.forEach((p, i) => {
      p.qty = 0; p.price = (db.pricing.find(pr => pr.code === db.products[i].code) || {}).retailPrice || 0;
      p.subtotal = 0; p.cash = 0; p.credit = 0;
      var q = document.getElementById('rs_qty_' + i);
      var pr = document.getElementById('rs_price_' + i);
      var c = document.getElementById('rs_cash_' + i);
      var cr = document.getElementById('rs_credit_' + i);
      if (q) q.value = 0; if (pr) pr.value = p.price; if (c) c.value = 0; if (cr) cr.value = 0;
    });
    document.getElementById('rs_customer').value = '';
    document.getElementById('rs_notes').value = '';
    document.getElementById('rs_type').value = 'cash';
    rsCalc();
  };
};

/* ============ الوكلاء ============ */
window.Modules.agents = function(container) {
  const db = APP.getDB();
  Exports.register("agents", {
    label: "الوكلاء",
    pdf: () => {
      const headers = ['الوكيل', 'دعم النقل', 'ملاحظات'];
      const rows = db.agents.map(a => [a.name, a.transportSubsidy, a.notes || '-']);
      const priceHeaders = ['الصنف', 'سعر المصنع', 'أجور النقل', 'إجمالي للوكيل'];
      const priceRows = db.pricing.map(p => {
        const prod = db.products.find(x => x.code === p.code);
        return [prod ? prod.name : p.code, p.factoryPrice, p.transport, p.factoryPrice + p.transport];
      });
      const html = Exports.rowsToHTMLTable(headers, rows, { title: 'قائمة الوكلاء' }) +
                   Exports.rowsToHTMLTable(priceHeaders, priceRows, { title: 'أسعار المصنع للوكلاء' });
      Exports.exportPDF("الوكلاء وأسعار المصنع", html, "agents");
    },
    excel: () => {
      const headers = ['الوكيل', 'دعم النقل', 'ملاحظات'];
      const rows = db.agents.map(a => [a.name, a.transportSubsidy, a.notes || '']);
      Exports.exportExcel(Exports.rowsToHTMLTable(headers, rows, { title: 'الوكلاء' }), "agents");
    },
    csv: () => {
      const headers = ['الوكيل', 'دعم النقل', 'ملاحظات'];
      const rows = db.agents.map(a => [a.name, a.transportSubsidy, a.notes || '']);
      Exports.exportCSV(Exports.rowsToCSV(headers, rows), "agents");
    },
    json: () => Exports.exportJSON({ agents: db.agents, pricing: db.pricing }, "agents_data"),
    print: () => window.print()
  });


  function render() {
    container.innerHTML = `
      <div class="alert alert-info">
        <span>${Icons.render("handshake")}</span>
        <span>الوكلاء — حقل خاص بسعر المصنع + أجور النقل. يتم حساب سعر الوكيل تلقائياً.</span>
      </div>

      <div class="card">
        <h3>قائمة الوكلاء</h3>
        <table>
          <thead>
            <tr>
              <th>الوكيل</th>
              <th>دعم نقل إضافي</th>
              <th>ملاحظات</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            ${db.agents.map((a, idx) => `
              <tr>
                <td><b>${a.name}</b></td>
                <td>${a.transportSubsidy} ر.ي</td>
                <td class="text-muted">${a.notes || '-'}</td>
                <td><button class="btn btn-danger btn-sm" data-action="delete-agent" data-aidx="${idx})">${Icons.render("trash")}</button></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="card">
        <h3>${Icons.render("plus")} إضافة وكيل جديد</h3>
        <form class="form-grid" id="agentForm">
          <div class="form-group">
            <label>اسم الوكيل</label>
            <input type="text" id="a_name" required />
          </div>
          <div class="form-group">
            <label>دعم نقل إضافي (ر.ي)</label>
            <input type="number" id="a_transport" value="0" />
          </div>
          <div class="form-group" style="grid-column: span 2">
            <label>ملاحظات</label>
            <input type="text" id="a_notes" />
          </div>
        </form>
        <div class="btn-row">
          <button class="btn btn-primary" data-action="add-agent">${Icons.render("plus")} إضافة</button>
        </div>
      </div>

      <div class="card">
        <h3>${Icons.render("money")} أسعار المصنع للوكلاء (لكل صنف)</h3>
        <table>
          <thead>
            <tr>
              <th>الصنف</th>
              <th>سعر المصنع</th>
              <th>أجور النقل</th>
              <th class="text-primary">إجمالي للوكيل</th>
            </tr>
          </thead>
          <tbody>
            ${db.pricing.map(p => {
              const prod = db.products.find(x => x.code === p.code);
              return `<tr>
                <td><b>${prod ? prod.name : p.code}</b></td>
                <td>${p.factoryPrice.toLocaleString('ar-EG')} ر.ي</td>
                <td>${p.transport.toLocaleString('ar-EG')} ر.ي</td>
                <td class="text-primary"><b>${(p.factoryPrice + p.transport).toLocaleString('ar-EG')} ر.ي</b></td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  Modules._addAgent = function() {
    const db = APP.getDB();
    db.agents.push({
      id: Date.now(),
      name: document.getElementById('a_name').value,
      transportSubsidy: +document.getElementById('a_transport').value,
      notes: document.getElementById('a_notes').value
    });
    APP.saveDB(db);
    alert('{Icons.render("check")} تم إضافة الوكيل');
    render();
  };

  Modules._deleteAgent = function(idx) {
    if (!confirm('حذف الوكيل؟')) return;
    const db = APP.getDB();
    db.agents.splice(idx, 1);
    APP.saveDB(db);
    render();
  };

  render();
};

/* ============ التدفقات النقدية ============ */
window.Modules.cashflow = function(container) {
  const db = APP.getDB();

  Exports.register("cashflow", {
    label: "التدفقات النقدية",
    pdf: () => {
      const accounts = db.cashAccounts;
      const log = db.cashFlowLog;
      const incoming = log.filter(l => l.type === 'incoming');
      const outgoing = log.filter(l => l.type === 'outgoing');
      const headers = ['التاريخ', 'النوع', 'التصنيف', 'المصدر', 'المبلغ', 'ملاحظات'];
      const rows = log.map(l => [l.date, l.type === 'incoming' ? 'وارد' : 'صادر',
        window.ICFG.categoryLabels[l.category] || l.category,
        l.source, l.amount.toLocaleString('ar-EG'), l.notes || '-']);
      const footer = ['', '', '', 'الإجمالي',
        { v: (incoming.reduce((s,l)=>s+l.amount,0) - outgoing.reduce((s,l)=>s+l.amount,0)).toLocaleString('ar-EG'), cls: 'text-primary' }, ''];
      const html = Exports.rowsToHTMLTable(['الحساب', 'الرصيد الافتتاحي', 'الحالي'],
        accounts.map(a => [a.name, a.openingBalance.toLocaleString('ar-EG'),
          { v: a.currentBalance.toLocaleString('ar-EG'), cls: a.currentBalance >= 0 ? 'text-success' : 'text-danger' }]),
        { title: 'حسابات النقدية' }) +
        Exports.rowsToHTMLTable(headers, rows, { title: 'سجل التدفقات النقدية', footerRow: [footer] });
      Exports.exportPDF("التدفقات النقدية", html, "cashflow");
    },
    excel: () => {
      const headers = ['التاريخ', 'النوع', 'التصنيف', 'المصدر', 'المبلغ', 'ملاحظات'];
      const rows = db.cashFlowLog.map(l => [l.date, l.type === 'incoming' ? 'وارد' : 'صادر',
        window.ICFG.categoryLabels[l.category] || l.category, l.source, l.amount, l.notes || '']);
      Exports.exportExcel(Exports.rowsToHTMLTable(headers, rows, { title: 'سجل التدفقات النقدية' }), "cashflow");
    },
    csv: () => {
      const headers = ['التاريخ', 'النوع', 'التصنيف', 'المصدر', 'المبلغ', 'ملاحظات'];
      const rows = db.cashFlowLog.map(l => [l.date, l.type, l.category, l.source, l.amount, l.notes || '']);
      Exports.exportCSV(Exports.rowsToCSV(headers, rows), "cashflow");
    },
    json: () => Exports.exportJSON({ cashAccounts: db.cashAccounts, cashFlowLog: db.cashFlowLog, customerCredits: db.customerCredits }, "cashflow_data"),
    print: () => window.print()
  });

  function calcBalance(accountId) {
    const acc = db.cashAccounts.find(a => a.id === accountId);
    if (!acc) return 0;
    const incoming = db.cashFlowLog.filter(l => l.accountId === accountId && l.type === 'incoming').reduce((s,l)=>s+l.amount,0);
    const outgoing = db.cashFlowLog.filter(l => l.accountId === accountId && l.type === 'outgoing').reduce((s,l)=>s+l.amount,0);
    return acc.openingBalance + incoming - outgoing;
  }

  function totalBalance() {
    return db.cashAccounts.reduce((s, a) => s + calcBalance(a.id), 0);
  }

  function addFlowEntry(entry) {
    const db2 = APP.getDB();
    const newEntry = Object.assign({ id: 'cf' + Date.now(), createdBy: (APP.getUser() || {}).name || 'unknown' }, entry);
    db2.cashFlowLog.push(newEntry);
    APP.saveDB(db2);
  }

  function render() {
    const incoming = db.cashFlowLog.filter(l => l.type === 'incoming');
    const outgoing = db.cashFlowLog.filter(l => l.type === 'outgoing');
    const totalIn = incoming.reduce((s,l)=>s+l.amount,0);
    const totalOut = outgoing.reduce((s,l)=>s+l.amount,0);
    const netCashFlow = totalIn - totalOut;
    const unreadAlerts = db.creditAlerts.filter(a => !a.read && !a.resolved);
    const blockedCustomers = db.customerCredits.filter(c => c.blocked);
    const today = new Date().toISOString().split('T')[0];

    container.innerHTML = `
      <div class="alert alert-warning" id="cfAlertBanner" style="${unreadAlerts.length === 0 ? 'display:none' : ''}">
        <span>${Icons.render("alert")}</span>
        <b>${unreadAlerts.length} تنبيه ائتمان غير مقروء</b> — يوجد عملاء تجاوزوا سقف الائتمان
        <button class="btn btn-sm btn-warning" data-action="view-alerts" style="margin-right:8px">عرض التنبيهات</button>
      </div>

      <div class="card">
        <div class="header-row">
          <h3>${Icons.render("wallet")} التدفقات النقدية — ملخص لحظي</h3>
          <div>
            <button class="btn btn-primary btn-sm" data-action="add-incoming">${Icons.render("plus")} إضافة وارد</button>
            <button class="btn btn-danger btn-sm" data-action="add-outgoing">${Icons.render("minus")} إضافة مصروف</button>
            <button class="btn btn-secondary btn-sm" data-action="auto-post">${Icons.render("sync")} ترحيل تلقائي</button>
          </div>
        </div>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-label">إجمالي الوارد</div>
            <div class="stat-value text-success">${totalIn.toLocaleString('ar-EG')}</div>
            <div class="stat-sub">ر.ي</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">إجمالي الصارف</div>
            <div class="stat-value text-danger">${totalOut.toLocaleString('ar-EG')}</div>
            <div class="stat-sub">ر.ي</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">صافي التدفق النقدي</div>
            <div class="stat-value ${netCashFlow >= 0 ? 'text-success' : 'text-danger'}">${netCashFlow.toLocaleString('ar-EG')}</div>
            <div class="stat-sub">ر.ي</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">رصيد حسابات النقدية</div>
            <div class="stat-value text-primary">${totalBalance().toLocaleString('ar-EG')}</div>
            <div class="stat-sub">ر.ي</div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="header-row">
          <h3>${Icons.render("bank")} حسابات النقدية</h3>
          <button class="btn btn-sm" data-action="manage-accounts">${Icons.render("settings")} إدارة الحسابات</button>
        </div>
        <table>
          <thead><tr><th>الحساب</th><th>النوع</th><th>الرصيد الافتتاحي</th><th>الوارد</th><th>الصارف</th><th class="text-primary">الرصيد الحالي</th></tr></thead>
          <tbody>
            ${db.cashAccounts.map(a => {
              const inA = incoming.filter(l=>l.accountId===a.id).reduce((s,l)=>s+l.amount,0);
              const outA = outgoing.filter(l=>l.accountId===a.id).reduce((s,l)=>s+l.amount,0);
              const bal = calcBalance(a.id);
              return `<tr>
                <td><b>${a.name}</b></td>
                <td><span class="badge badge-info">${a.type==='safe'?'صندوق':'بنك'}</span></td>
                <td>${a.openingBalance.toLocaleString('ar-EG')}</td>
                <td class="text-success">${inA.toLocaleString('ar-EG')}</td>
                <td class="text-danger">${outA.toLocaleString('ar-EG')}</td>
                <td class="text-primary"><b>${bal.toLocaleString('ar-EG')}</b></td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>

      <div class="card">
        <div class="header-row">
          <h3>${Icons.render("credit")} سقوف الائتمان والعملاء</h3>
          <div>
            <button class="btn btn-sm" data-action="add-customer-credit">${Icons.render("plus")} إضافة عميل</button>
            <button class="btn btn-sm btn-warning" data-action="view-alerts" id="alertBtn">${Icons.render("alert")} التنبيهات (${unreadAlerts.length})</button>
          </div>
        </div>
        <div style="overflow-x:auto">
          <table>
            <thead><tr><th>العميل</th><th>سقف الائتمان</th><th>الرصيد المستحق</th><th>النسبة</th><th>الحالة</th><th>آخر دفعة</th><th>إجراء</th></tr></thead>
            <tbody>
              ${db.customerCredits.map(c => {
                const pct = c.creditLimit > 0 ? Math.round((c.currentBalance / c.creditLimit) * 100) : 0;
                const overLimit = c.currentBalance > c.creditLimit;
                return `<tr data-cust-id="${c.id}">
                  <td><b>${c.customerName}</b></td>
                  <td>${c.creditLimit.toLocaleString('ar-EG')}</td>
                  <td class="${overLimit ? 'text-danger' : 'text-warning'}"><b>${c.currentBalance.toLocaleString('ar-EG')}</b></td>
                  <td>
                    <div style="display:flex;align-items:center;gap:8px">
                      <div style="flex:1;background:#eee;height:8px;border-radius:4px;max-width:100px">
                        <div style="width:${Math.min(pct,100)}%;background:${overLimit?'#c62828':pct>70?'#ef6c00':'#2e7d32'};height:100%;border-radius:4px"></div>
                      </div>
                      <span>${pct}%</span>
                    </div>
                  </td>
                  <td>${c.blocked
                    ? `<span class="badge badge-danger">محظور</span>`
                    : overLimit
                      ? `<span class="badge badge-warning">تجاوز!</span>`
                      : `<span class="badge badge-success">سليم</span>`}
                  </td>
                  <td class="text-muted">${c.lastPayment || '-'}</td>
                  <td>
                    <button class="btn btn-xs btn-outline" data-action="edit-credit" data-cid="${c.id}">${Icons.render("edit")}</button>
                    ${c.blocked ? `<button class="btn btn-xs btn-success" data-action="unblock-credit" data-cid="${c.id}">فك الحظر</button>` : ''}
                    <button class="btn btn-xs btn-outline" data-action="receive-payment" data-cid="${c.id}">${Icons.render("money")} استلام</button>
                  </td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <div class="card">
        <div class="header-row">
          <h3>${Icons.render("list")} سجل التدفقات النقدية</h3>
          <div class="search-bar">
            <span class="icon">${Icons.render("search")}</span>
            <input type="text" id="cfSearch" data-filter="cf" placeholder="ابحث..." />
            <select id="cfTypeFilter" data-filter="cf" style="padding:6px 10px;border-radius:20px;border:1px solid #ddd;margin-right:8px">
              <option value="">الكل</option>
              <option value="incoming">وارد فقط</option>
              <option value="outgoing">صادر فقط</option>
            </select>
            <select id="cfAccFilter" data-filter="cf" style="padding:6px 10px;border-radius:20px;border:1px solid #ddd;margin-right:8px">
              <option value="">كل الحسابات</option>
              ${db.cashAccounts.map(a => `<option value="${a.id}">${a.name}</option>`).join('')}
            </select>
          </div>
        </div>
        <div style="max-height:500px;overflow-y:auto">
          <table id="cfTable">
            <thead>
              <tr>
                <th>التاريخ</th><th>النوع</th><th>التصنيف</th><th>المصدر</th><th>المبلغ</th><th>الحساب</th><th>ملاحظات</th><th>إجراء</th>
              </tr>
            </thead>
            <tbody id="cfTbody">
              ${db.cashFlowLog.slice().reverse().map(l => {
                const acc = db.cashAccounts.find(a => a.id === l.accountId);
                return `<tr data-search="${l.date} ${l.source} ${l.notes} ${l.category}" data-type="${l.type}" data-acc="${l.accountId}">
                  <td>${l.date}</td>
                  <td>${l.type === 'incoming'
                    ? `<span class="badge badge-success">وارد</span>`
                    : `<span class="badge badge-danger">صادر</span>`}
                  </td>
                  <td class="text-muted">${window.ICFG.categoryLabels[l.category] || l.category}</td>
                  <td>${l.source}</td>
                  <td class="${l.type==='incoming'?'text-success':'text-danger'}"><b>${l.amount.toLocaleString('ar-EG')}</b></td>
                  <td>${acc ? acc.name : l.accountId}</td>
                  <td class="text-muted">${l.notes || '-'}</td>
                  <td>
                    ${l.createdBy === 'system'
                      ? `<span class="badge badge-info">تلقائي</span>`
                      : `<button class="btn btn-xs btn-outline" data-action="delete-flow" data-fid="${l.id}">${Icons.render("trash")}</button>`}
                  </td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Modal: Add Incoming -->
      <div id="modalIncoming" class="modal" style="display:none">
        <div class="modal-content">
          <div class="modal-header">
            <h3>${Icons.render("plus")} إضافة قيد وارد</h3>
            <button class="close" data-action="close-modal">×</button>
          </div>
          <form id="formIncoming" class="form-stack">
            <div class="form-group">
              <label>التاريخ</label>
              <input type="date" id="cf_date_in" value="${today}" required />
            </div>
            <div class="form-group">
              <label>المصدر</label>
              <input type="text" id="cf_src_in" placeholder="مثال: تحصيل من عميل - صنعاء" required />
            </div>
            <div class="form-group">
              <label>التصنيف</label>
              <select id="cf_cat_in">
                <option value="receipt">استلام دفعة</option>
                <option value="sales_cash">مبيعات نقدية</option>
                <option value="agent_collection">تحصيل مندوب</option>
                <option value="transfer">تحويل بنكي</option>
                <option value="other_in">أخرى</option>
              </select>
            </div>
            <div class="form-group">
              <label>المبلغ (ر.ي)</label>
              <input type="number" id="cf_amt_in" min="1" required />
            </div>
            <div class="form-group">
              <label>الحساب</label>
              <select id="cf_acc_in">
                ${db.cashAccounts.map(a => `<option value="${a.id}">${a.name}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>ملاحظات</label>
              <input type="text" id="cf_note_in" />
            </div>
            <div class="btn-row">
              <button type="submit" class="btn btn-primary">${Icons.render("check")} تسجيل القيد</button>
              <button type="button" class="btn btn-secondary" data-action="close-modal">إلغاء</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal: Add Outgoing -->
      <div id="modalOutgoing" class="modal" style="display:none">
        <div class="modal-content">
          <div class="modal-header">
            <h3>${Icons.render("minus")} إضافة قيد مصروف</h3>
            <button class="close" data-action="close-modal">×</button>
          </div>
          <form id="formOutgoing" class="form-stack">
            <div class="form-group">
              <label>التاريخ</label>
              <input type="date" id="cf_date_out" value="${today}" required />
            </div>
            <div class="form-group">
              <label>المصدر</label>
              <input type="text" id="cf_src_out" placeholder="مثال: مشتريات مواد خام" required />
            </div>
            <div class="form-group">
              <label>التصنيف</label>
              <select id="cf_cat_out">
                <option value="purchase">مشتريات</option>
                <option value="expense">مصاريف تشغيلية</option>
                <option value="salary">رواتب</option>
                <option value="maintenance">صيانة</option>
                <option value="transfer">تحويل بنكي</option>
                <option value="other_out">أخرى</option>
              </select>
            </div>
            <div class="form-group">
              <label>المبلغ (ر.ي)</label>
              <input type="number" id="cf_amt_out" min="1" required />
            </div>
            <div class="form-group">
              <label>الحساب</label>
              <select id="cf_acc_out">
                ${db.cashAccounts.map(a => `<option value="${a.id}">${a.name}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>ملاحظات</label>
              <input type="text" id="cf_note_out" />
            </div>
            <div class="btn-row">
              <button type="submit" class="btn btn-danger">${Icons.render("check")} تسجيل القيد</button>
              <button type="button" class="btn btn-secondary" data-action="close-modal">إلغاء</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal: Auto-Post from Sales -->
      <div id="modalAutoPost" class="modal" style="display:none">
        <div class="modal-content">
          <div class="modal-header">
            <h3>${Icons.render("sync")} ترحيل تلقائي من المبيعات</h3>
            <button class="close" data-action="close-modal">×</button>
          </div>
          <p class="text-muted">سيتم إنشاء قيود واردة في سجل التدفقات لكل سجل تحصيل في قائمة المبيعات.</p>
          <div class="form-group">
            <label>الشهر</label>
            <input type="month" id="cf_ap_month" value="2026-06" />
          </div>
          <div class="form-group">
            <label>الحساب المستهدف</label>
            <select id="cf_ap_account">
              ${db.cashAccounts.map(a => `<option value="${a.id}">${a.name}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>نوع الترحيل</label>
            <select id="cf_ap_type">
              <option value="all">كل المبيعات النقدية + التحصيل</option>
              <option value="collection">التحصيل فقط</option>
              <option value="cash">المبيعات النقدية فقط</option>
            </select>
          </div>
          <div id="cfApPreview" class="alert alert-info" style="display:none"></div>
          <div class="btn-row">
            <button class="btn btn-primary" data-action="do-auto-post">${Icons.render("sync")} بدء الترحيل</button>
            <button type="button" class="btn btn-secondary" data-action="close-modal">إلغاء</button>
          </div>
        </div>
      </div>

      <!-- Modal: Credit Alerts -->
      <div id="modalAlerts" class="modal" style="display:none">
        <div class="modal-content">
          <div class="modal-header">
            <h3>${Icons.render("alert")} تنبيهات الائتمان</h3>
            <button class="close" data-action="close-modal">×</button>
          </div>
          <div id="cfAlertsList">
            ${unreadAlerts.length === 0
              ? `<div class="alert alert-success">لا توجد تنبيهات جديدة</div>`
              : unreadAlerts.map(a => `
                <div class="alert alert-warning" data-alert-id="${a.id}" style="margin-bottom:10px">
                  <b>${a.customerName}</b><br>
                  ${a.message}<br>
                  <small class="text-muted">${a.date}</small>
                  <div style="margin-top:8px">
                    <button class="btn btn-xs btn-success" data-action="resolve-alert" data-aid="${a.id}">تم التسوية</button>
                    <button class="btn btn-xs btn-secondary" data-action="mark-read" data-aid="${a.id}">قراءة فقط</button>
                  </div>
                </div>
              `).join('')}
          </div>
          <div class="btn-row">
            <button type="button" class="btn btn-secondary" data-action="close-modal">إغلاق</button>
          </div>
        </div>
      </div>

      <!-- Modal: Edit Credit -->
      <div id="modalEditCredit" class="modal" style="display:none">
        <div class="modal-content">
          <div class="modal-header">
            <h3 id="ecTitle">${Icons.render("edit")} تعديل بيانات العميل</h3>
            <button class="close" data-action="close-modal">×</button>
          </div>
          <form id="formEditCredit" class="form-stack">
            <input type="hidden" id="ec_id" />
            <div class="form-group">
              <label>اسم العميل</label>
              <input type="text" id="ec_name" required />
            </div>
            <div class="form-group">
              <label>سقف الائتمان (ر.ي)</label>
              <input type="number" id="ec_limit" min="0" required />
            </div>
            <div class="form-group">
              <label>الرصيد المستحق (ر.ي)</label>
              <input type="number" id="ec_balance" min="0" required />
            </div>
            <div class="form-group">
              <label>آخر دفعة</label>
              <input type="date" id="ec_lastpay" />
            </div>
            <div class="form-group">
              <label>ملاحظات</label>
              <input type="text" id="ec_notes" />
            </div>
            <div class="btn-row">
              <button type="submit" class="btn btn-primary">${Icons.render("check")} حفظ التعديلات</button>
              <button type="button" class="btn btn-secondary" data-action="close-modal">إلغاء</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal: Receive Payment -->
      <div id="modalReceivePayment" class="modal" style="display:none">
        <div class="modal-content">
          <div class="modal-header">
            <h3>${Icons.render("money")} استلام دفعة من عميل</h3>
            <button class="close" data-action="close-modal">×</button>
          </div>
          <form id="formReceivePayment" class="form-stack">
            <input type="hidden" id="rp_cid" />
            <div class="form-group">
              <label>العميل</label>
              <input type="text" id="rp_cname" readonly />
            </div>
            <div class="form-group">
              <label>المبلغ المستحق</label>
              <input type="text" id="rp_due" readonly />
            </div>
            <div class="form-group">
              <label>المبلغ المسدد (ر.ي)</label>
              <input type="number" id="rp_amount" min="1" required />
            </div>
            <div class="form-group">
              <label>تاريخ الاستلام</label>
              <input type="date" id="rp_date" value="${today}" required />
            </div>
            <div class="form-group">
              <label>طريقة الدفع</label>
              <select id="rp_method">
                <option value="cash">نقدي</option>
                <option value="bank">تحويل بنكي</option>
                <option value="check">شيك</option>
              </select>
            </div>
            <div class="form-group">
              <label>ملاحظات</label>
              <input type="text" id="rp_notes" />
            </div>
            <div class="btn-row">
              <button type="submit" class="btn btn-success">${Icons.render("check")} تأكيد الاستلام</button>
              <button type="button" class="btn btn-secondary" data-action="close-modal">إلغاء</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  // === Category labels (shared) ===
  window.ICFG = window.ICFG || {};
  window.ICFG.categoryLabels = {
    sales_cash: 'مبيعات نقدية',
    agent_collection: 'تحصيل مندوب',
    receipt: 'استلام دفعة',
    transfer: 'تحويل',
    purchase: 'مشتريات',
    expense: 'مصاريف تشغيلية',
    salary: 'رواتب',
    maintenance: 'صيانة',
    other_in: 'أخرى - وارد',
    other_out: 'أخرى - صادر'
  };

  // === Filter ===
  Modules._filterCashFlow = function() {
    const q = document.getElementById('cfSearch').value.toLowerCase();
    const typeF = document.getElementById('cfTypeFilter').value;
    const accF = document.getElementById('cfAccFilter').value;
    document.querySelectorAll('#cfTbody tr').forEach(tr => {
      const matchQ = tr.dataset.search.toLowerCase().includes(q);
      const matchT = !typeF || tr.dataset.type === typeF;
      const matchA = !accF || tr.dataset.acc === accF;
      tr.style.display = (matchQ && matchT && matchA) ? '' : 'none';
    });
  };

  // === Add Incoming ===
  Modules._addIncoming = function() {
    const db2 = APP.getDB();
    const date = document.getElementById('cf_date_in').value;
    const source = document.getElementById('cf_src_in').value;
    const category = document.getElementById('cf_cat_in').value;
    const amount = +document.getElementById('cf_amt_in').value;
    const accountId = document.getElementById('cf_acc_in').value;
    const notes = document.getElementById('cf_note_in').value;
    const user = APP.getUser() || {};

    addFlowEntry({ date, type: 'incoming', category, amount, source, accountId, notes, createdBy: user.name });
    window.CF.closeModals();
    render();
  };

  // === Add Outgoing ===
  Modules._addOutgoing = function() {
    const db2 = APP.getDB();
    const date = document.getElementById('cf_date_out').value;
    const source = document.getElementById('cf_src_out').value;
    const category = document.getElementById('cf_cat_out').value;
    const amount = +document.getElementById('cf_amt_out').value;
    const accountId = document.getElementById('cf_acc_out').value;
    const notes = document.getElementById('cf_note_out').value;
    const user = APP.getUser() || {};

    addFlowEntry({ date, type: 'outgoing', category, amount, source, accountId, notes, createdBy: user.name });
    window.CF.closeModals();
    render();
  };

  // === Auto-Post from Sales ===
  Modules._openAutoPost = function() {
    document.getElementById('modalAutoPost').style.display = 'flex';
  };

  Modules._doAutoPost = function() {
    const db2 = APP.getDB();
    const month = document.getElementById('cf_ap_month').value; // e.g. "2026-06"
    const accountId = document.getElementById('cf_ap_account').value;
    const postType = document.getElementById('cf_ap_type').value;
    const user = APP.getUser() || {};
    const today2 = new Date().toISOString().split('T')[0];

    // Filter sales log by month
    const monthSales = db2.salesLog.filter(s => s.date && s.date.startsWith(month));
    let added = 0;

    monthSales.forEach(s => {
      const rep = db2.salesReps.find(r => r.code === s.repCode);
      const repName = rep ? rep.name : s.repCode;

      // Post cash sales
      if ((postType === 'all' || postType === 'cash') && s.cash > 0) {
        db2.cashFlowLog.push({
          id: 'cf' + Date.now() + '_cash' + added,
          date: s.date,
          type: 'incoming',
          category: 'sales_cash',
          amount: s.cash,
          source: `مندوب: ${repName} - مبيعات نقدية`,
          accountId,
          notes: `ترحيل تلقائي من سجل المبيعات`,
          createdBy: 'system'
        });
        added++;
      }

      // Post collections
      if ((postType === 'all' || postType === 'collection') && s.collection > 0) {
        db2.cashFlowLog.push({
          id: 'cf' + Date.now() + '_col' + added,
          date: s.date,
          type: 'incoming',
          category: 'agent_collection',
          amount: s.collection,
          source: `مندوب: ${repName} - تحصيل`,
          accountId,
          notes: `ترحيل تلقائي من سجل المبيعات`,
          createdBy: 'system'
        });
        added++;
      }
    });

    if (added === 0) {
      alert('لا توجد بيانات مبيعات للتحويل في هذا الشهر.');
      return;
    }

    APP.saveDB(db2);
    window.CF.closeModals();
    render();
    alert(`${Icons.render("check")} تمترحيل ${added} قيد بنجاح من سجل المبيعات.`);
  };

  // === Credit Management ===
  Modules._checkCreditAndBlock = function(customerName, amount) {
    const db2 = APP.getDB();
    let customer = db2.customerCredits.find(c => c.customerName === customerName);
    if (!customer) return null; // no credit record, allow
    const newBalance = customer.currentBalance + amount;
    if (newBalance > customer.creditLimit) {
      return { blocked: true, customer, newBalance };
    }
    return { blocked: false, customer, newBalance };
  };

  Modules._addCreditAlert = function(customerId, customerName, message) {
    const db2 = APP.getDB();
    const today2 = new Date().toISOString().split('T')[0];
    db2.creditAlerts.push({
      id: 'alert' + Date.now(),
      date: today2,
      customerId,
      customerName,
      alertType: 'limit_exceeded',
      message,
      read: false,
      resolved: false,
      resolvedBy: null,
      resolvedAt: null,
      action: null
    });
    APP.saveDB(db2);
  };

  Modules._openEditCredit = function(customerId) {
    const customer = db.customerCredits.find(c => c.id === customerId);
    if (!customer) return;
    document.getElementById('ec_id').value = customer.id;
    document.getElementById('ec_name').value = customer.customerName;
    document.getElementById('ec_limit').value = customer.creditLimit;
    document.getElementById('ec_balance').value = customer.currentBalance;
    document.getElementById('ec_lastpay').value = customer.lastPayment || '';
    document.getElementById('ec_notes').value = customer.notes || '';
    document.getElementById('modalEditCredit').style.display = 'flex';
  };

  Modules._saveEditCredit = function() {
    const db2 = APP.getDB();
    const id = document.getElementById('ec_id').value;
    const customer = db2.customerCredits.find(c => c.id === id);
    if (!customer) return;
    customer.customerName = document.getElementById('ec_name').value;
    customer.creditLimit = +document.getElementById('ec_limit').value;
    customer.currentBalance = +document.getElementById('ec_balance').value;
    customer.lastPayment = document.getElementById('ec_lastpay').value || null;
    customer.notes = document.getElementById('ec_notes').value;
    // Auto-block if over limit
    if (customer.currentBalance > customer.creditLimit) {
      if (!customer.blocked) {
        customer.blocked = true;
        Modules._addCreditAlert(customer.id, customer.customerName,
          `تم تجاوز سقف الائتمان! الرصيد ${customer.currentBalance.toLocaleString('ar-EG')} ر.ي exceeds الحد ${customer.creditLimit.toLocaleString('ar-EG')} ر.ي`);
      }
    }
    APP.saveDB(db2);
    window.CF.closeModals();
    render();
  };

  Modules._openReceivePayment = function(customerId) {
    const customer = db.customerCredits.find(c => c.id === customerId);
    if (!customer) return;
    document.getElementById('rp_cid').value = customer.id;
    document.getElementById('rp_cname').value = customer.customerName;
    document.getElementById('rp_due').value = customer.currentBalance.toLocaleString('ar-EG') + ' ر.ي';
    document.getElementById('rp_amount').value = '';
    document.getElementById('modalReceivePayment').style.display = 'flex';
  };

  Modules._confirmReceivePayment = function() {
    const db2 = APP.getDB();
    const cid = document.getElementById('rp_cid').value;
    const customer = db2.customerCredits.find(c => c.id === cid);
    if (!customer) return;
    const amount = +document.getElementById('rp_amount').value;
    const date = document.getElementById('rp_date').value;
    const method = document.getElementById('rp_method').value;
    const notes = document.getElementById('rp_notes').value;
    const user = APP.getUser() || {};

    if (amount <= 0) { alert('أدخل مبلغاً صحيحاً'); return; }

    // Update customer balance
    customer.currentBalance = Math.max(0, customer.currentBalance - amount);
    customer.lastPayment = date;
    // Auto-unblock if now within limit
    if (customer.currentBalance <= customer.creditLimit && customer.blocked) {
      customer.blocked = false;
    }

    // Add cash flow entry
    db2.cashFlowLog.push({
      id: 'cf' + Date.now(),
      date,
      type: 'incoming',
      category: 'receipt',
      amount,
      source: `استلام دفعة من: ${customer.customerName}`,
      ref: 'receipt',
      notes: `طريقة الدفع: ${method}${notes ? ' - ' + notes : ''}`,
      accountId: 'safe',
      createdBy: user.name
    });

    // Add to receipts log
    db2.receiptsLog.push({
      id: 'rcp' + Date.now(),
      date,
      customerId: cid,
      customerName: customer.customerName,
      amount,
      paymentMethod: method,
      collectedBy: user.name,
      notes,
      accountId: 'safe',
      createdBy: user.name
    });

    APP.saveDB(db2);
    window.CF.closeModals();
    render();
  };

  Modules._unblockCredit = function(customerId) {
    if (!confirm('هل تريد فك الحظر عن هذا العميل؟\nيجب التأكد من تسوية المبالغ المستحقة أولاً.')) return;
    const db2 = APP.getDB();
    const customer = db2.customerCredits.find(c => c.id === customerId);
    if (customer) {
      customer.blocked = false;
      APP.saveDB(db2);
      render();
    }
  };

  Modules._resolveAlert = function(alertId) {
    const db2 = APP.getDB();
    const alert = db2.creditAlerts.find(a => a.id === alertId);
    if (!alert) return;
    alert.resolved = true;
    alert.read = true;
    const user = APP.getUser() || {};
    alert.resolvedBy = user.name;
    alert.resolvedAt = new Date().toISOString().split('T')[0];
    // Unblock the customer
    const customer = db2.customerCredits.find(c => c.id === alert.customerId);
    if (customer) customer.blocked = false;
    APP.saveDB(db2);
    render();
  };

  Modules._markAlertRead = function(alertId) {
    const db2 = APP.getDB();
    const alert = db2.creditAlerts.find(a => a.id === alertId);
    if (alert) { alert.read = true; APP.saveDB(db2); }
    render();
  };

  Modules._deleteFlow = function(flowId) {
    if (!confirm('حذف هذا القيد؟')) return;
    const db2 = APP.getDB();
    const idx = db2.cashFlowLog.findIndex(l => l.id === flowId);
    if (idx !== -1) { db2.cashFlowLog.splice(idx, 1); APP.saveDB(db2); }
    render();
  };

  Modules._addCustomerCredit = function() {
    const db2 = APP.getDB();
    const name = prompt('اسم العميل الجديد:');
    if (!name) return;
    const limit = parseFloat(prompt('سقف الائتمان (ر.ي):') || '0');
    if (isNaN(limit)) return;
    db2.customerCredits.push({
      id: 'cr' + Date.now(),
      customerName: name,
      creditLimit: limit,
      currentBalance: 0,
      blocked: false,
      lastPayment: null,
      notes: ''
    });
    APP.saveDB(db2);
    render();
  };

  // === Global click handler for this module ===
  window.CF = {
    closeModals: function() {
      ['modalIncoming','modalOutgoing','modalAutoPost','modalAlerts','modalEditCredit','modalReceivePayment'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
      });
    }
  };

  // Delegate click events for this module
  container.addEventListener('click', function(e) {
    const action = e.target.dataset.action;
    if (!action) return;

    switch(action) {
      case 'add-incoming':
        document.getElementById('modalIncoming').style.display = 'flex'; break;
      case 'add-outgoing':
        document.getElementById('modalOutgoing').style.display = 'flex'; break;
      case 'auto-post':
        Modules._openAutoPost(); break;
      case 'view-alerts':
        document.getElementById('modalAlerts').style.display = 'flex'; break;
      case 'add-customer-credit':
        Modules._addCustomerCredit(); break;
      case 'edit-credit':
        Modules._openEditCredit(e.target.dataset.cid); break;
      case 'unblock-credit':
        Modules._unblockCredit(e.target.dataset.cid); break;
      case 'receive-payment':
        Modules._openReceivePayment(e.target.dataset.cid); break;
      case 'resolve-alert':
        Modules._resolveAlert(e.target.dataset.aid); break;
      case 'mark-read':
        Modules._markAlertRead(e.target.dataset.aid); break;
      case 'delete-flow':
        Modules._deleteFlow(e.target.dataset.fid); break;
      case 'close-modal':
        window.CF.closeModals(); break;
    }
  });

  // Delegate input/change events for filter inputs (no inline onclick/oninput)
  container.addEventListener('input', function(e) {
    const target = e.target;
    if (target.id === 'salesSearch') {
      Modules._filterSales();
    } else if (target.id === 'cfSearch') {
      Modules._filterCashFlow();
    }
  });

  container.addEventListener('change', function(e) {
    const target = e.target;
    if (target.id === 'cfTypeFilter' || target.id === 'cfAccFilter') {
      Modules._filterCashFlow();
    }
  });

  // Form submissions
  setTimeout(() => {
    const formIn = document.getElementById('formIncoming');
    if (formIn) formIn.addEventListener('submit', function(e) { e.preventDefault(); Modules._addIncoming(); });
    const formOut = document.getElementById('formOutgoing');
    if (formOut) formOut.addEventListener('submit', function(e) { e.preventDefault(); Modules._addOutgoing(); });
    const formEC = document.getElementById('formEditCredit');
    if (formEC) formEC.addEventListener('submit', function(e) { e.preventDefault(); Modules._saveEditCredit(); });
    const formRP = document.getElementById('formReceivePayment');
    if (formRP) formRP.addEventListener('submit', function(e) { e.preventDefault(); Modules._confirmReceivePayment(); });
  }, 50);

  render();
};

/* ============ المختبر ============ */
window.Modules.lab = function(container) {
  const db = APP.getDB();
  Exports.register("lab", {
    label: "سجل المختبر",
    pdf: () => {
      const headers = ['التاريخ', 'من البئر', 'مشتراة', 'تالف (لتر)', 'pH', 'TDS', 'كلور', 'النتيجة', 'ملاحظات'];
      const rows = db.labLog.map(l => {
        const ok = l.ph >= 6.5 && l.ph <= 8.5 && l.tds < 500 && l.chlorine >= 0.2 && l.chlorine <= 0.8;
        return [l.date, l.fromWell, l.purchased, l.wasteLiters, l.ph, l.tds, l.chlorine,
          { v: ok ? 'مطابق' : 'غير مطابق', cls: ok ? 'text-success' : 'text-danger' }, l.notes || '-'];
      });
      const html = Exports.rowsToHTMLTable(headers, rows, { title: 'سجل المختبر والمحطة' });
      Exports.exportPDF("سجل المختبر", html, "lab");
    },
    excel: () => {
      const headers = ['التاريخ', 'من البئر', 'مشتراة', 'تالف (لتر)', 'pH', 'TDS', 'كلور', 'النتيجة', 'ملاحظات'];
      const rows = db.labLog.map(l => {
        const ok = l.ph >= 6.5 && l.ph <= 8.5 && l.tds < 500 && l.chlorine >= 0.2 && l.chlorine <= 0.8;
        return [l.date, l.fromWell, l.purchased, l.wasteLiters, l.ph, l.tds, l.chlorine, ok ? 'مطابق' : 'غير مطابق', l.notes || ''];
      });
      Exports.exportExcel(Exports.rowsToHTMLTable(headers, rows, { title: 'سجل المختبر' }), "lab");
    },
    csv: () => {
      const headers = ['التاريخ', 'من البئر', 'مشتراة', 'تالف', 'pH', 'TDS', 'كلور', 'نتيجة'];
      const rows = db.labLog.map(l => [l.date, l.fromWell, l.purchased, l.wasteLiters, l.ph, l.tds, l.chlorine, l.notes || '']);
      Exports.exportCSV(Exports.rowsToCSV(headers, rows), "lab");
    },
    json: () => Exports.exportJSON({ labLog: db.labLog }, "lab_data"),
    print: () => window.print()
  });


  function render() {
    container.innerHTML = `
      <div class="alert alert-info">
        <span>${Icons.render("flask")}</span>
        <span>سجل المختبر والمحطة — توثيق الاستهلاك اليومي للبئر والوايتات وتالف المياه ونتائج الفحوصات.</span>
      </div>

      <div class="card">
        <h3>${Icons.render("plus")} تسجيل يومية المختبر</h3>
        <form class="form-grid" id="labForm">
          <div class="form-group">
            <label>التاريخ</label>
            <input type="date" id="l_date" value="${new Date().toISOString().split('T')[0]}" required />
          </div>
          <div class="form-group">
            <label>بوز من البئر (10,000 لتر)</label>
            <input type="number" id="l_well" min="0" step="0.5" value="0" />
          </div>
          <div class="form-group">
            <label>بوز مشتراة</label>
            <input type="number" id="l_purch" min="0" step="0.5" value="0" />
          </div>
          <div class="form-group">
            <label>تالف مياه (لتر)</label>
            <input type="number" id="l_waste" min="0" value="0" />
          </div>
          <div class="form-group">
            <label>درجة الحموضة pH</label>
            <input type="number" id="l_ph" step="0.1" min="0" max="14" value="7" />
          </div>
          <div class="form-group">
            <label>TDS (PPM)</label>
            <input type="number" id="l_tds" min="0" value="100" />
          </div>
          <div class="form-group">
            <label>الكلور (PPM)</label>
            <input type="number" id="l_chlorine" step="0.1" min="0" value="0.5" />
          </div>
          <div class="form-group" style="grid-column: span 2">
            <label>ملاحظات</label>
            <input type="text" id="l_notes" />
          </div>
        </form>
        <div class="btn-row">
          <button class="btn btn-primary" data-action="add-lab">${Icons.render("save")} حفظ</button>
        </div>
      </div>

      <div class="card">
        <h3>${Icons.render("clipboard")} سجل المختبر (${db.labLog.length} يوم)</h3>
        <table>
          <thead>
            <tr>
              <th>التاريخ</th>
              <th>من البئر</th>
              <th>مشتراة</th>
              <th>تالف (لتر)</th>
              <th>pH</th>
              <th>TDS</th>
              <th>كلور</th>
              <th>نتيجة</th>
              <th>ملاحظات</th>
            </tr>
          </thead>
          <tbody>
            ${db.labLog.slice().reverse().map((l, idx) => {
              const realIdx = db.labLog.length - 1 - idx;
              const ok = l.ph >= 6.5 && l.ph <= 8.5 && l.tds < 500 && l.chlorine >= 0.2 && l.chlorine <= 0.8;
              return `<tr>
                <td>${l.date}</td>
                <td>${l.fromWell} بوزه</td>
                <td>${l.purchased} بوزه</td>
                <td class="text-warning">${l.wasteLiters}</td>
                <td>${l.ph}</td>
                <td>${l.tds}</td>
                <td>${l.chlorine}</td>
                <td><span class="badge badge-${ok ? 'success' : 'danger'}">${ok ? 'مطابق' : 'غير مطابق'}</span></td>
                <td class="text-muted">${l.notes || '-'}</td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  Modules._addLab = function() {
    const db = APP.getDB();
    db.labLog.push({
      date: document.getElementById('l_date').value,
      fromWell: +document.getElementById('l_well').value,
      purchased: +document.getElementById('l_purch').value,
      wasteLiters: +document.getElementById('l_waste').value,
      ph: +document.getElementById('l_ph').value,
      tds: +document.getElementById('l_tds').value,
      chlorine: +document.getElementById('l_chlorine').value,
      notes: document.getElementById('l_notes').value
    });
    APP.saveDB(db);
    alert('{Icons.render("check")} تم الحفظ');
    render();
  };

  render();
};

/* ============ المشتريات ============ */
window.Modules.procurement = function(container) {
  const db = APP.getDB();
  Exports.register("procurement", {
    label: "المشتريات",
    pdf: () => {
      const supHeaders = ['المورد', 'المادة', 'الوحدة', 'السعر', 'العملة', 'ملاحظات'];
      const supRows = db.suppliers.map(s => [s.name, s.material, s.unit, s.price.toLocaleString('ar-EG'), s.currency, s.notes]);
      const purHeaders = ['التاريخ', 'المورد', 'المادة', 'الكمية', 'السعر', 'العملة', 'الإجمالي (ر.ي)'];
      const purRows = db.purchasesLog.map(p => [p.date, p.supplier, p.material, p.qty + ' ' + p.unit, p.price.toLocaleString('ar-EG'), p.currency,
        { v: p.totalYER.toLocaleString('ar-EG'), cls: 'text-primary' }]);
      const purFooter = ['الإجمالي', '', '', '', '', '',
        { v: db.purchasesLog.reduce((s,p)=>s+p.totalYER,0).toLocaleString('ar-EG'), cls: 'text-primary' }];
      const expHeaders = ['التاريخ', 'التصنيف', 'الوصف', 'المبلغ (ر.ي)'];
      const expRows = db.expensesLog.map(e => [e.date, e.category, e.description,
        { v: e.amount.toLocaleString('ar-EG'), cls: 'text-warning' }]);
      const expFooter = ['الإجمالي', '', '',
        { v: db.expensesLog.reduce((s,e)=>s+e.amount,0).toLocaleString('ar-EG'), cls: 'text-danger' }];
      const html = Exports.rowsToHTMLTable(supHeaders, supRows, { title: 'قائمة الموردين' }) +
                   Exports.rowsToHTMLTable(purHeaders, purRows, { title: 'سجل المشتريات', footerRow: [purFooter] }) +
                   Exports.rowsToHTMLTable(expHeaders, expRows, { title: 'سجل المصروفات النثرية', footerRow: [expFooter] });
      Exports.exportPDF("المشتريات والمصروفات", html, "procurement");
    },
    excel: () => {
      const purHeaders = ['التاريخ', 'المورد', 'المادة', 'الكمية', 'الوحدة', 'السعر', 'العملة', 'الإجمالي (ر.ي)'];
      const purRows = db.purchasesLog.map(p => [p.date, p.supplier, p.material, p.qty, p.unit, p.price, p.currency, p.totalYER]);
      const expHeaders = ['التاريخ', 'التصنيف', 'الوصف', 'المبلغ (ر.ي)'];
      const expRows = db.expensesLog.map(e => [e.date, e.category, e.description, e.amount]);
      const html = Exports.rowsToHTMLTable(purHeaders, purRows, { title: 'المشتريات' }) +
                   Exports.rowsToHTMLTable(expHeaders, expRows, { title: 'المصروفات' });
      Exports.exportExcel(html, "procurement");
    },
    csv: () => {
      const headers = ['التاريخ', 'المورد', 'المادة', 'الكمية', 'الإجمالي'];
      const rows = db.purchasesLog.map(p => [p.date, p.supplier, p.material, p.qty, p.totalYER]);
      Exports.exportCSV(Exports.rowsToCSV(headers, rows), "procurement");
    },
    json: () => Exports.exportJSON({ suppliers: db.suppliers, purchasesLog: db.purchasesLog, expensesLog: db.expensesLog }, "procurement_data"),
    print: () => window.print()
  });

  function statusBadge(status) {
    const m = {
      'pending': ['في الانتظار', 'warning'],
      'seen': ['تم الاطلاع', 'info'],
      'approved': ['موافق عليه', 'success'],
      'rejected': ['مرفوض', 'danger'],
      'ordered': ['تم الطلب', 'success'],
      'received': ['تم الاستلام', 'success'],
      'cancelled': ['ملغي', 'danger']
    };
    const [label, cls] = m[status] || ['غير معروف', 'info'];
    return `<span class="badge badge-${cls}">${label}</span>`;
  }

  function renderIncomingRequestRow(r) {
    const isRaw = r.type === 'raw';
    const summary = isRaw
      ? r.items.map(it => `${it.material} (${it.qty} ${it.unit})`).slice(0, 3).join(' • ')
      : r.items.map(it => `${it.partName} للآلة: ${it.machine}`).slice(0, 3).join(' • ');
    const more = r.items.length > 3 ? ` + ${r.items.length - 3} آخر` : '';

    return `
      <div style="background:var(--bg);padding:14px;border-radius:var(--radius);box-shadow:var(--shadow-in-sm);margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px">
          <div>
            <div style="font-weight:800;color:var(--primary)">${r.code}</div>
            <div class="text-muted" style="font-size:12px;margin-top:2px">${r.date} • من: ${r.fromUserName} (${r.fromUser})</div>
            <div style="font-size:13px;margin-top:6px"><b>${isRaw ? 'مواد خام' : 'قطعة غيار'}:</b> ${summary}${more}</div>
            ${r.reminders > 0 ? `<div class="text-warning" style="font-size:11px;margin-top:4px">${Icons.render("bell")} ${r.reminders} تذكير${r.reminders > 1 ? 'ات' : ''}</div>` : ''}
          </div>
          <div style="display:flex;gap:6px;flex-wrap:wrap">
            <button class="btn btn-primary btn-sm" data-action="pr-view-incoming" data-pidx="${db.purchaseRequests.findIndex(x=>x.id===r.id)})">${Icons.render("eye")} عرض</button>
            <button class="btn btn-success btn-sm" data-action="pr-approve" data-pidx="${db.purchaseRequests.findIndex(x=>x.id===r.id)})">${Icons.render("check")} موافقة</button>
            <button class="btn btn-danger btn-sm" data-action="pr-reject" data-pidx="${db.purchaseRequests.findIndex(x=>x.id===r.id)})">${Icons.render("close")} رفض</button>
          </div>
        </div>
      </div>
    `;
  }


  function render() {
    // طلبات الشراء الواردة من الإنتاج
    const incomingRequests = db.purchaseRequests.filter(r => r.status === 'pending' || r.status === 'seen');
    const allRequests = db.purchaseRequests.slice().sort((a, b) => new Date(b.date) - new Date(a.date));

    container.innerHTML = `
      ${incomingRequests.length > 0 ? `
      <div class="alert alert-warning" style="margin-bottom:14px">
        ${Icons.render("bell")}
        <span><b>${incomingRequests.length} طلب شراء وارد</b> من إدارة الإنتاج ينتظر المعالجة.</span>
      </div>
      <div class="card">
        <div class="header-row">
          <h3>${Icons.render("cart")} طلبات الشراء الواردة من الإنتاج (${allRequests.length})</h3>
          <button class="btn btn-secondary btn-sm" data-action="pr-toggle-all">${Icons.render("eye")} عرض الكل</button>
        </div>
        ${incomingRequests.slice(0, 5).map(r => renderIncomingRequestRow(r)).join('')}
        ${incomingRequests.length > 5 ? `<div class="text-muted" style="margin-top:8px;font-size:12px">و ${incomingRequests.length - 5} طلبات أخرى...</div>` : ''}
      </div>
      ` : ''}
      <div class="card">
        <h3>${Icons.render("plus")} فاتورة مشتريات جديدة</h3>
        <div class="alert alert-info">
          ${Icons.render("info")}
          <span>اختر المورد والمادة أولاً، ثم أدخل الكمية وسعر الوحدة — سيتم احتساب الإجمالي تلقائياً بحسب العملة المختارة.</span>
        </div>
        <form class="form-grid" id="purchForm">
          <div class="form-group">
            <label>التاريخ</label>
            <input type="date" id="p_date" value="${new Date().toISOString().split('T')[0]}" required />
          </div>
          <div class="form-group">
            <label>المورد</label>
            <select id="p_supplier" data-change="supplier-changed">
              <option value="">-- اختر المورد --</option>
              ${[...new Set(db.suppliers.map(s => s.name))].map(name => `<option value="${name}">${name}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>المادة</label>
            <select id="p_material" data-change="material-changed">
              <option value="">-- اختر المادة --</option>
            </select>
          </div>
          <div class="form-group">
            <label>الكمية</label>
            <input type="number" id="p_qty" step="0.01" data-change="calc-p" required />
          </div>
          <div class="form-group">
            <label>الوحدة</label>
            <input type="text" id="p_unit" value="حبه" readonly />
          </div>
          <div class="form-group">
            <label>سعر الوحدة</label>
            <input type="number" id="p_price" step="0.01" data-change="calc-p" required />
          </div>
          <div class="form-group">
            <label>العملة</label>
            <select id="p_currency" data-change="calc-p">
              <option value="سعودي">سعودي</option>
              <option value="يمني">يمني</option>
            </select>
          </div>
          <div class="form-group" style="grid-column: span 2">
            <label>الإجمالي المحسوب (آلياً)</label>
            <input type="text" id="p_total" readonly style="font-weight:800;color:var(--primary);font-size:18px;text-align:center" value="0.00" />
            <div id="p_total_breakdown" class="text-muted" style="font-size:12px;margin-top:4px"></div>
          </div>
        </form>
        <div class="btn-row">
          <button class="btn btn-primary" data-action="add-purchase">${Icons.render("save")} حفظ الفاتورة</button>
        </div>
      </div>

      <div class="card">
        <h3>${Icons.render("box")} سجل المشتريات (${db.purchasesLog.length} فاتورة)</h3>
        <table>
          <thead>
            <tr>
              <th>التاريخ</th>
              <th>المورد</th>
              <th>المادة</th>
              <th>الكمية</th>
              <th>السعر</th>
              <th>العملة</th>
              <th>الإجمالي (ر.ي)</th>
            </tr>
          </thead>
          <tbody>
            ${db.purchasesLog.slice().reverse().map(p => `
              <tr>
                <td>${p.date}</td>
                <td>${p.supplier}</td>
                <td>${p.material}</td>
                <td>${p.qty} ${p.unit}</td>
                <td>${p.price.toLocaleString('ar-EG')}</td>
                <td>${p.currency}</td>
                <td class="text-primary"><b>${p.totalYER.toLocaleString('ar-EG')}</b></td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="6">إجمالي المشتريات</td>
              <td class="text-primary">${db.purchasesLog.reduce((s,p) => s + p.totalYER, 0).toLocaleString('ar-EG')} ر.ي</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div class="card">
        <h3>${Icons.render("clipboard")} قائمة الموردين (${db.suppliers.length} مورد)</h3>
        <table>
          <thead>
            <tr>
              <th>المورد</th>
              <th>المادة</th>
              <th>الوحدة</th>
              <th>السعر</th>
              <th>العملة</th>
              <th>ملاحظات</th>
            </tr>
          </thead>
          <tbody>
            ${db.suppliers.map(s => `
              <tr>
                <td><b>${s.name}</b></td>
                <td>${s.material}</td>
                <td>${s.unit}</td>
                <td>${s.price.toLocaleString('ar-EG')}</td>
                <td>${s.currency}</td>
                <td class="text-muted">${s.notes}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="card">
        <h3>${Icons.render("expense")} سجل المصروفات النثرية</h3>
        <table>
          <thead>
            <tr>
              <th>التاريخ</th>
              <th>التصنيف</th>
              <th>الوصف</th>
              <th>المبلغ (ر.ي)</th>
            </tr>
          </thead>
          <tbody>
            ${db.expensesLog.slice().reverse().map(e => `
              <tr>
                <td>${e.date}</td>
                <td><span class="badge badge-info">${e.category}</span></td>
                <td>${e.description}</td>
                <td class="text-warning">${e.amount.toLocaleString('ar-EG')}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3">إجمالي المصروفات</td>
              <td class="text-danger">${db.expensesLog.reduce((s,e) => s + e.amount, 0).toLocaleString('ar-EG')} ر.ي</td>
            </tr>
          </tfoot>
        </table>
      </div>
    `;
  }

  // === الربط الآلي بين المورد والمادة ===
  Modules._pSupplierChanged = function() {
    const supplier = document.getElementById('p_supplier').value;
    const materialSel = document.getElementById('p_material');
    materialSel.innerHTML = '<option value="">-- اختر المادة --</option>';
    if (!supplier) return;
    // قائمة المواد التي يوفرها هذا المورد
    const items = db.suppliers.filter(s => s.name === supplier);
    const seen = new Set();
    items.forEach(s => {
      if (!seen.has(s.material)) {
        seen.add(s.material);
        materialSel.innerHTML += `<option value="${s.material}|${s.unit}|${s.price}|${s.currency}" data-price="${s.price}" data-currency="${s.currency}" data-unit="${s.unit}">${s.material} (${s.price} ${s.currency}/${s.unit})</option>`;
      }
    });
    document.getElementById('p_unit').value = '';
    document.getElementById('p_price').value = '';
    document.getElementById('p_qty').value = '';
    Modules._pRecalculate();
  };

  Modules._pMaterialChanged = function() {
    const matSel = document.getElementById('p_material');
    const opt = matSel.options[matSel.selectedIndex];
    if (!opt || !opt.dataset.price) {
      document.getElementById('p_unit').value = '';
      document.getElementById('p_price').value = '';
      Modules._pRecalculate();
      return;
    }
    document.getElementById('p_unit').value = opt.dataset.unit || 'حبه';
    document.getElementById('p_price').value = parseFloat(opt.dataset.price) || 0;
    document.getElementById('p_currency').value = opt.dataset.currency || 'سعودي';
    Modules._pRecalculate();
  };

  Modules._pRecalculate = function() {
    const qty = parseFloat(document.getElementById('p_qty').value) || 0;
    const price = parseFloat(document.getElementById('p_price').value) || 0;
    const currency = document.getElementById('p_currency').value || 'سعودي';
    const total = qty * price;
    // تنسيق بفاصلة عشرية وفواصل آلاف
    const parts = total.toFixed(2).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const formatted = parts.join('.');
    document.getElementById('p_total').value = formatted + ' ' + currency;
    document.getElementById('p_total').dataset.numericValue = total.toFixed(2);

    const breakdown = document.getElementById('p_total_breakdown');
    if (qty > 0 && price > 0) {
      breakdown.innerHTML = `${qty.toLocaleString('ar-EG')} ${document.getElementById('p_unit').value || 'وحدة'} × ${DB.fmt(price)} ${currency} = <b style="color:var(--primary)">${formatted} ${currency}</b>`;
    } else {
      breakdown.innerHTML = '<span class="text-muted">أدخل الكمية والسعر لاحتساب الإجمالي</span>';
    }
  };

  Modules._addPurchase = function() {
    const db = APP.getDB();
    const matSel = document.getElementById('p_material');
    const opt = matSel.options[matSel.selectedIndex];
    const qty = +document.getElementById('p_qty').value;
    const price = +document.getElementById('p_price').value;
    const total = +(document.getElementById('p_total').dataset.numericValue || (qty * price).toFixed(2));

    if (!qty || !price) {
      alert('⚠ يرجى إدخال الكمية وسعر الوحدة');
      return;
    }

    db.purchasesLog.push({
      date: document.getElementById('p_date').value,
      supplier: document.getElementById('p_supplier').value,
      material: opt ? opt.value.split('|')[0] : document.getElementById('p_material').value,
      qty,
      unit: document.getElementById('p_unit').value,
      price,
      currency: document.getElementById('p_currency').value,
      totalYER: total
    });
    APP.saveDB(db);
    alert('✅ تم حفظ الفاتورة (الإجمالي: ' + DB.fmt(total) + ' ' + document.getElementById('p_currency').value + ')');
    render();
  };

  // === معالجة طلبات الشراء الواردة من الإنتاج ===
  Modules._prViewIncoming = function(idx) {
    const req = db.purchaseRequests[idx];
    if (!req) return;
    if (req.status === 'pending') {
      req.status = 'seen';
      APP.saveDB(db);
    }
    Modules._showRequestModal(req, true);
  };

  Modules._prApprove = function(idx) {
    const req = db.purchaseRequests[idx];
    if (!req) return;
    if (!confirm(`موافقة على الطلب ${req.code}؟ سيتمكن الإنتاج من متابعة العمل.`)) return;
    req.status = 'approved';
    req.processedBy = APP.getUser().name;
    req.processedDate = new Date().toISOString().split('T')[0];
    APP.saveDB(db);
    alert('✅ تمت الموافقة على الطلب ' + req.code);
    render();
  };

  Modules._prReject = function(idx) {
    const req = db.purchaseRequests[idx];
    if (!req) return;
    const reason = prompt(`سبب رفض الطلب ${req.code}؟`);
    if (reason === null) return;
    req.status = 'rejected';
    req.rejectionReason = reason;
    req.processedBy = APP.getUser().name;
    req.processedDate = new Date().toISOString().split('T')[0];
    APP.saveDB(db);
    alert('✅ تم رفض الطلب');
    render();
  };

  Modules._prToggleRequests = function() {
    const allRequests = db.purchaseRequests.slice().sort((a, b) => new Date(b.date) - new Date(a.date));
    const html = `
      <h2 style="margin-bottom:14px">جميع طلبات الشراء (${allRequests.length})</h2>
      ${allRequests.length === 0 ? '<p class="text-muted">لا توجد طلبات</p>' : ''}
      ${allRequests.map(r => renderIncomingRequestRow(r)).join('')}
    `;
    Modules._showRequestModalHtml('كل طلبات الشراء', html);
  };

  function Modules_shared() {} // placeholder

  render();
};

/* ============ الموارد البشرية ============ */
window.Modules.hr = function(container) {
  const db = APP.getDB();
  const isAdmin = APP.getCurrentUser() && APP.getCurrentUser().role === 'admin';
  const totalSalary = db.employeesLog.reduce((s, e) => s + (Number(e.salary) || 0), 0);
  const totalAllowances = db.employeesLog.reduce((s, e) => s + (Number(e.allowances) || 0), 0);
  const grandTotal = totalSalary + totalAllowances;

  const deptOrder = [
    'الإدارة','الموارد البشرية','الإنتاج','المبيعات','المختبر',
    'المخازن','الخدمات','العلاقات العامة',
    'الحسابات','المشتريات','المالية','الأمن'
  ];

  Exports.register("hr", {
    label: "الموارد البشرية",
    pdf: () => {
      const headers = ['الرقم الوظيفي','الاسم','الوظيفة','القسم','الراتب','البدلات','الإجمالي','تاريخ التعيين','المدير'];
      const rows = db.employeesLog.map(e => [e.empId, e.name, e.position, e.department, e.salary.toLocaleString('ar-EG')+' ر.ي', (e.allowances||0).toLocaleString('ar-EG')+' ر.ي', (e.salary+(e.allowances||0)).toLocaleString('ar-EG')+' ر.ي', e.hireDate, e.managerName||'الإدارة العليا']);
      Exports.exportPDF("الموارد البشرية - مصنع سيلين", Exports.rowsToHTMLTable(headers, rows, {title:'سجل الموظفين'}), "hr");
    },
    excel: () => {
      const headers = ['الرقم الوظيفي','الاسم','الوظيفة','القسم','الراتب','البدلات','الإجمالي','تاريخ التعيين','المدير'];
      const rows = db.employeesLog.map(e => [e.empId, e.name, e.position, e.department, e.salary, e.allowances||0, e.salary+(e.allowances||0), e.hireDate, e.managerName||'الإدارة العليا']);
      Exports.exportExcel(Exports.rowsToHTMLTable(headers, rows, {title:'سجل الموظفين'}), "hr");
    },
    csv: () => {
      const headers = ['الرقم الوظيفي','الاسم','الوظيفة','القسم','الراتب','البدلات','تاريخ التعيين','المدير'];
      const rows = db.employeesLog.map(e => [e.empId, e.name, e.position, e.department, e.salary, e.allowances||0, e.hireDate, e.managerName||'الإدارة العليا']);
      Exports.exportCSV(Exports.rowsToCSV(headers, rows), "hr");
    },
    json: () => Exports.exportJSON({employeesLog: db.employeesLog, totals: {salary: totalSalary, allowances: totalAllowances}}, "hr_data"),
    print: () => window.print()
  });

  function getDepartments() {
    const depts = [...new Set(db.employeesLog.map(e => e.department))];
    return depts.sort((a, b) => {
      const ia = deptOrder.indexOf(a);
      const ib = deptOrder.indexOf(b);
      if (ia === -1 && ib === -1) return a.localeCompare(b);
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    });
  }
  function getDeptEmployees(dept) { return db.employeesLog.filter(e => e.department === dept); }
  function isManager(emp) { return /مدير|مشرف|كيميائي/.test(emp.position); }
  function getDeptManager(dept) { return getDisplayDeptEmployees(dept).find(isManager); }
  function getDisplayDeptEmployees(dept) { return db.employeesLog.filter(e => getDisplayDeptName(e.department) === dept); }
  function getDeptWorkers(dept) { return getDisplayDeptEmployees(dept).filter(e => !isManager(e)); }

  function getCombinedDepartments() {
    const raw = [...new Set(db.employeesLog.map(e => e.department))];
    const grouped = {};
    raw.forEach(d => {
      let key = d;
      if (d === 'مخازن البيضاء') key = 'المخازن';
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(d);
    });
    return grouped;
  }

  function getDisplayDeptName(dept) {
    if (dept === 'مخازن البيضاء') return 'المخازن';
    return dept;
  }


  function render() {
    const groupedDepts = getCombinedDepartments();
    const departments = Object.keys(groupedDepts);
    container.innerHTML = `
      <div class="card" style="background:linear-gradient(135deg,var(--bg-card),var(--bg-darker));border:2px solid var(--primary)">
        <h3 style="margin-bottom:15px">${Icons.render("users")} وحدات الموارد البشرية والإدارة</h3>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px">
          <div class="hr-submenu-card active" data-target="registry" data-action="hr-tab-registry">
            <div class="hr-submenu-icon">${Icons.render("users")}</div>
            <div class="hr-submenu-label">سجل الموظفين</div>
            <div class="hr-submenu-desc">${db.employeesLog.length} موظف في ${departments.length} قسم</div>
          </div>

          <div class="hr-submenu-card" data-action="nav-orgtree">
            <div class="hr-submenu-icon">${Icons.render("gitBranch")}</div>
            <div class="hr-submenu-label">الشجرة التفاعلية</div>
            <div class="hr-submenu-desc">شجرة الموظفين</div>
          </div>
          <div class="hr-submenu-card" data-action="nav-orgchart">
            <div class="hr-submenu-icon">${Icons.render("sitemap")}</div>
            <div class="hr-submenu-label">الهيكل التنظيمي</div>
            <div class="hr-submenu-desc">إحصائيات الأقسام</div>
          </div>
          <div class="hr-submenu-card" data-action="nav-permissions">
            <div class="hr-submenu-icon">${Icons.render("key")}</div>
            <div class="hr-submenu-label">إدارة الصلاحيات</div>
            <div class="hr-submenu-desc">منح وإلغاء الصلاحيات</div>
          </div>
          <div class="hr-submenu-card" data-action="nav-terminated">
            <div class="hr-submenu-icon">${Icons.render("x")}</div>
            <div class="hr-submenu-label">المنتهية عقودهم</div>
            <div class="hr-submenu-desc">سجل العقود المنتهية</div>
          </div>
        </div>
      </div>

      <div id="hrRegistrySection">
        <div class="alert alert-info">
          <span>${Icons.render("users")}</span>
          <span><b>${db.employeesLog.length}</b> موظف مسجل | إجمالي الرواتب: <b>${totalSalary.toLocaleString('ar-EG')}</b> ر.ي | البدلات: <b>${totalAllowances.toLocaleString('ar-EG')}</b> ر.ي | الإجمالي: <b>${grandTotal.toLocaleString('ar-EG')}</b> ر.ي شهرياً</span>
        </div>

        ${isAdmin ? `
        <div class="card">
          <h3>${Icons.render("plus")} إضافة موظف جديد</h3>
          <form class="form-grid" id="empForm" onsubmit="event.preventDefault(); Modules._addEmployee();">
            <div class="form-group"><label>الاسم الكامل *</label><input type="text" id="e_name" required /></div>
            <div class="form-group"><label>الوظيفة *</label><input type="text" id="e_position" required /></div>
            <div class="form-group"><label>القسم *</label><input type="text" id="e_department" list="deptList" required /><datalist id="deptList">${departments.map(d => '<option value="'+d+'">').join('')}</datalist></div>
            <div class="form-group"><label>الراتب (ر.ي) *</label><input type="number" id="e_salary" min="0" required /></div>
            <div class="form-group"><label>البدلات (ر.ي)</label><input type="number" id="e_allowances" min="0" value="0" /></div>
            <div class="form-group"><label>تاريخ التعيين *</label><input type="date" id="e_hireDate" required /></div>
          </form>
          <div class="btn-row">
            <button class="btn btn-primary" data-action="add-employee">${Icons.render("plus")} إضافة وحفظ</button>
          </div>
        </div>
        ` : ''}

        <div class="card">
          <h3>${Icons.render("users")} سجل الموظفين</h3>
          <div class="search-bar" style="margin-bottom:14px;max-width:320px">
            <input type="text" id="deptSearch" placeholder="بحث عن إدارة..." data-input="filter-depts" />
          </div>
          <div id="departmentsList">
            ${(() => {
              // الأقسام بالترتيب الإداري
              const deptConfig = [
                {key: 'الإدارة العليا', label: 'الإدارة العليا', depts: ['الإدارة']},
                {key: 'الموارد البشرية', label: 'الموارد البشرية', depts: ['الموارد البشرية']},
                {key: 'الإنتاج', label: 'الإنتاج', depts: ['الإنتاج']},
                {key: 'المبيعات', label: 'المبيعات', depts: ['المبيعات']},
                {key: 'المختبر', label: 'المختبر', depts: ['المختبر']},
                {key: 'المخازن', label: 'المخازن', depts: ['المخازن', 'مخازن البيضاء']},
                {key: 'الخدمات', label: 'الخدمات', depts: ['الخدمات']},
                {key: 'العلاقات العامة', label: 'العلاقات العامة', depts: ['العلاقات العامة']},
                {key: 'الحسابات', label: 'الحسابات', depts: ['الحسابات']},
                {key: 'المشتريات', label: 'المشتريات', depts: ['المشتريات']},
                {key: 'المالية', label: 'المالية', depts: ['المالية']},
                {key: 'الأمن', label: 'الأمن', depts: ['الأمن']}
              ];
              
              function empCard(emp, isMgr) {
                const status = emp.status || 'active';
                let statusBadge = '';
                if (status === 'active') statusBadge = '<span class="badge badge-success">موظف</span>';
                else if (status === 'suspended') statusBadge = '<span class="badge badge-warning">موقوف</span>';
                else if (status === 'terminated') statusBadge = '<span class="badge badge-danger">مفصول</span>';
                
                return '<tr class="'+(isMgr ? 'manager-row' : '')+'">'
                  + '<td><b>'+emp.empId+'</b></td>'
                  + '<td><b>'+emp.name+'</b>'+(isMgr ? ' <span class="badge badge-primary" style="font-size:10px">مدير</span>' : '')+'</td>'
                  + '<td>'+emp.position+'</td>'
                  + '<td class="text-muted">'+emp.hireDate+'</td>'
                  + '<td class="text-primary"><b>'+emp.salary.toLocaleString('ar-EG')+'</b></td>'
                  + '<td>'+(emp.allowances || 0).toLocaleString('ar-EG')+'</td>'
                  + '<td class="text-success"><b>'+(emp.salary + (emp.allowances || 0)).toLocaleString('ar-EG')+'</b></td>'
                  + '<td>'+statusBadge+'</td>'
                  + '<td style="white-space:nowrap">'
                  +   (isAdmin
                        ? '<button class="btn btn-sm" data-action="edit-employee" data-eid="'+emp.id+')" title="تعديل">'+Icons.render("edit")+'</button> '
                          + '<button class="btn btn-sm btn-warning" data-action="change-status" data-eid="'+emp.id+')" title="تغيير الحالة">'+Icons.render("refresh")+'</button> '
                          + '<button class="btn btn-sm btn-danger" data-action="delete-employee" data-eid="'+emp.id+')" title="حذف">'+Icons.render("trash")+'</button>'
                        : '<span class="text-muted" style="font-size:11px">عرض</span>')
                  + '</td>'
                  + '</tr>';
              }
              
              let html = '';
              deptConfig.forEach((cfg, idx) => {
                let emps = db.employeesLog.filter(e => cfg.depts.includes(e.department));
                if (emps.length === 0) return;
                
                const mgr = emps.find(e => /مدير|مشرف|كيميائي/.test(e.position));
                const workers = emps.filter(e => e !== mgr);
                const totalSal = emps.reduce((s, e) => s + (e.salary + (e.allowances || 0)), 0);
                
                html += '<div class="dept-section" data-dept="'+cfg.key+'" style="margin-bottom:12px;border-radius:10px;overflow:hidden;border:1px solid var(--border)">';
                html += '<div class="dept-section-header" data-action="toggle-dept" data-didx="'+idx+')" style="background:var(--bg-darker);padding:14px 18px;cursor:pointer;display:flex;align-items:center;gap:12px;transition:all 0.2s">';
                html += '<span class="dept-arrow" id="dept-arrow-'+idx+'" style="transition:transform 0.3s;font-size:18px">▼</span>';
                html += '<b style="font-size:15px;color:var(--primary);flex:1">'+cfg.label+'</b>';
                html += '<span class="badge badge-info">'+emps.length+' موظف</span>';
                html += '<span class="badge badge-success">'+totalSal.toLocaleString('ar-EG')+' ر.ي</span>';
                html += '</div>';
                
                html += '<div class="dept-section-body" id="dept-body-'+idx+'" style="display:none;padding:14px 18px;background:var(--bg)">';
                
                // المدير أولاً
                if (mgr) {
                  html += '<div style="margin-bottom:14px;padding:12px 14px;background:linear-gradient(135deg, var(--primary), var(--primary-dark, #2a3d6f));color:white;border-radius:10px;display:flex;align-items:center;gap:12px;flex-wrap:wrap">';
                  html += Icons.render("user") + ' <b>'+mgr.name+'</b> <span style="opacity:0.9;font-size:13px">('+mgr.position+')</span>';
                  html += '<span style="margin-right:auto;font-weight:bold">'+mgr.salary.toLocaleString('ar-EG')+' ر.ي</span>';
                  html += '</div>';
                }
                
                // جدول الموظفين
                html += '<div style="overflow-x:auto"><table class="data-table" style="margin:0;font-size:13px">';
                html += '<thead><tr><th>الرقم</th><th>الاسم</th><th>المسمى الوظيفي</th><th>التعيين</th><th>الراتب</th><th>البدلات</th><th>الإجمالي</th><th>الحالة</th><th>إجراءات</th></tr></thead><tbody>';
                
                if (mgr) html += empCard(mgr, true);
                workers.forEach(w => { html += empCard(w, false); });
                
                html += '</tbody></table></div>';
                html += '</div></div>';
              });
              
              return html;
            })()}
          </div>
        </div>
      </div>

      <div id="editEmpModal" class="modal-overlay" style="display:none">
        <div class="modal-card" style="max-width:600px">
          <div class="modal-header">
            <h3>${Icons.render("edit")} تعديل بيانات الموظف</h3>
            <button class="btn btn-sm" data-action="modal-close">${Icons.render("x")}</button>
          </div>
          <div class="modal-body">
            <form id="editEmpForm" onsubmit="event.preventDefault(); Modules._saveEmployee();">
              <input type="hidden" id="edit_id" />
              <div class="form-grid">
                <div class="form-group"><label>الرقم الوظيفي</label><input type="text" id="edit_empId" readonly style="background:var(--bg-darker);cursor:not-allowed" /></div>
                <div class="form-group"><label>الاسم *</label><input type="text" id="edit_name" required /></div>
                <div class="form-group"><label>الوظيفة *</label><input type="text" id="edit_position" required /></div>
                <div class="form-group"><label>القسم *</label><input type="text" id="edit_department" list="deptList" required /></div>
                <div class="form-group"><label>الراتب (ر.ي) *</label><input type="number" id="edit_salary" min="0" required /></div>
                <div class="form-group"><label>البدلات (ر.ي)</label><input type="number" id="edit_allowances" min="0" /></div>
                <div class="form-group"><label>تاريخ التعيين *</label><input type="date" id="edit_hireDate" required /></div>
              </div>
              <div class="alert alert-success" id="editSaveStatus" style="display:none;margin-top:10px"><span>${Icons.render("check")}</span><span>تم الحفظ تلقائياً</span></div>
            </form>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" data-action="modal-close">إغلاق</button>
            <button class="btn btn-primary" data-action="save-employee">${Icons.render("check")} حفظ التعديلات</button>
          </div>
        </div>
      </div>
    `;
  }

  Modules._toggleDept = function(dept) {
    const accordion = document.querySelector('.dept-accordion[data-dept="'+dept+'"]');
    if (!accordion) return;
    const body = accordion.querySelector('.dept-body');
    const header = accordion.querySelector('.dept-header');
    const isOpen = body.style.display !== 'none';
    body.style.display = isOpen ? 'none' : 'block';
    header.classList.toggle('open', !isOpen);
  };

  Modules._hrTab = function(target) {
    document.querySelectorAll('.hr-submenu-card').forEach(c => c.classList.remove('active'));
    const card = document.querySelector('.hr-submenu-card[data-target="'+target+'"]');
    if (card) card.classList.add('active');
    if (target === 'registry') document.getElementById('hrRegistrySection').style.display = 'block';
  };

  Modules._addEmployee = function() {
    if (!isAdmin) { alert('⛔ صلاحية التعديل للمدير فقط'); return; }
    const name = document.getElementById('e_name').value.trim();
    const position = document.getElementById('e_position').value.trim();
    const department = document.getElementById('e_department').value.trim();
    const salary = +document.getElementById('e_salary').value;
    const allowances = +document.getElementById('e_allowances').value || 0;
    const hireDate = document.getElementById('e_hireDate').value;
    if (!name || !position || !department || !salary || !hireDate) { alert('⚠️ املأ كل الحقول المطلوبة'); return; }
    const db = APP.getDB();
    const newId = db.employeesLog.length ? Math.max(...db.employeesLog.map(e => e.id || 0)) + 1 : 1;
    const empId = 'ID' + String(newId).padStart(3, '0');
    db.employeesLog.push({id: newId, empId, pdfId: String(newId), name, position, department, salary, allowances, hireDate, status: 'active', managerId: 0, managerName: 'الإدارة العليا'});
    APP.saveDB(db);
    document.getElementById('empForm').reset();
    render();
  };

  Modules._editEmployee = function(id) {
    if (!isAdmin) { alert('⛔ صلاحية التعديل للمدير فقط'); return; }
    const db = APP.getDB();
    const emp = db.employeesLog.find(e => e.id === id);
    if (!emp) { alert('الموظف غير موجود'); return; }
    document.getElementById('edit_id').value = emp.id;
    document.getElementById('edit_empId').value = emp.empId;
    document.getElementById('edit_name').value = emp.name;
    document.getElementById('edit_position').value = emp.position;
    document.getElementById('edit_department').value = emp.department;
    document.getElementById('edit_salary').value = emp.salary;
    document.getElementById('edit_allowances').value = emp.allowances || 0;
    document.getElementById('edit_hireDate').value = convertDate(emp.hireDate);
    document.getElementById('editSaveStatus').style.display = 'none';
    document.getElementById('editEmpModal').style.display = 'flex';
  };

  Modules._saveEmployee = function() {
    if (!isAdmin) { alert('⛔ صلاحية التعديل للمدير فقط'); return; }
    const id = +document.getElementById('edit_id').value;
    const db = APP.getDB();
    const idx = db.employeesLog.findIndex(e => e.id === id);
    if (idx === -1) { alert('الموظف غير موجود'); return; }
    db.employeesLog[idx] = {
      ...db.employeesLog[idx],
      name: document.getElementById('edit_name').value.trim(),
      position: document.getElementById('edit_position').value.trim(),
      department: document.getElementById('edit_department').value.trim(),
      salary: +document.getElementById('edit_salary').value,
      allowances: +document.getElementById('edit_allowances').value || 0,
      hireDate: document.getElementById('edit_hireDate').value
    };
    APP.saveDB(db);
    const status = document.getElementById('editSaveStatus');
    status.style.display = 'flex';
    setTimeout(() => status.style.display = 'none', 2000);
    render();
  };

  Modules._deleteEmployee = function(id) {
    if (!isAdmin) { alert('⛔ صلاحية الحذف للمدير فقط'); return; }
    const db = APP.getDB();
    const emp = db.employeesLog.find(e => e.id === id);
    if (!emp) return;
    if (!confirm('حذف الموظف "'+emp.name+'" ('+emp.empId+')؟')) return;
    db.employeesLog = db.employeesLog.filter(e => e.id !== id);
    APP.saveDB(db);
    render();
  };

  Modules._filterDepts = function() {
    const q = (document.getElementById('deptSearch')?.value || '').toLowerCase();
    document.querySelectorAll('.dept-section').forEach(sec => {
      const matches = sec.dataset.dept.toLowerCase().includes(q) || sec.textContent.toLowerCase().includes(q);
      sec.style.display = matches ? '' : 'none';
    });
  };

  Modules._toggleDeptSection = function(idx) {
    const body = document.getElementById('dept-body-'+idx);
    const arrow = document.getElementById('dept-arrow-'+idx);
    if (!body) return;
    const isOpen = body.style.display !== 'none';
    body.style.display = isOpen ? 'none' : 'block';
    if (arrow) arrow.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
  };

  Modules._filterRegistry = function() {
    const q = (document.getElementById('empRegistrySearch')?.value || '').toLowerCase();
    document.querySelectorAll('#registryTable tbody tr').forEach(tr => {
      tr.style.display = (tr.dataset.search || '').toLowerCase().includes(q) ? '' : 'none';
    });
  };

  Modules._changeStatus = function(id) {
    if (!isAdmin) { alert('⛔ صلاحية التعديل للمدير فقط'); return; }
    const db = APP.getDB();
    const emp = db.employeesLog.find(e => e.id === id);
    if (!emp) return;
    
    const current = emp.status || 'active';
    const choice = prompt(
      'اختر الحالة الجديدة للموظف "'+emp.name+'":\n\n'+
      '1 - موظف (نشط)\n'+
      '2 - موقوف\n'+
      '3 - مفصول\n\n'+
      'أدخل الرقم (1، 2، أو 3):',
      current === 'active' ? '1' : current === 'suspended' ? '2' : '3'
    );
    
    if (!choice) return;
    let next, nextLabel, termDate = null;
    if (choice === '1') { next = 'active'; nextLabel = 'موظف (نشط)'; }
    else if (choice === '2') { next = 'suspended'; nextLabel = 'موقوف'; }
    else if (choice === '3') {
      next = 'terminated';
      nextLabel = 'مفصول';
      termDate = prompt('تاريخ الفصل (YYYY-MM-DD):', new Date().toISOString().split('T')[0]);
      if (!termDate) return;
    } else { return; }
    
    emp.status = next;
    if (next === 'terminated') {
      emp.terminationStatus = { date: termDate, reason: 'قرار إداري' };
    } else {
      emp.terminationStatus = null;
    }
    APP.saveDB(db);
    render();
    alert('✓ تم تغيير حالة "'+emp.name+'" إلى: '+nextLabel);
  };

  Modules._filterEmployees = function() {
    const q = (document.getElementById('empSearch')?.value || '').toLowerCase();
    document.querySelectorAll('#empTbody tr').forEach(tr => {
      tr.style.display = (tr.dataset.search || '').toLowerCase().includes(q) ? '' : 'none';
    });
  };

  function convertDate(d) {
    if (!d) return '';
    if (d.includes('-')) return d;
    const parts = d.split('/');
    if (parts.length === 3) return parts[2] + '-' + parts[1].padStart(2, '0') + '-' + parts[0].padStart(2, '0');
    return d;
  }

  render();
};

/* ============ إدارة المستخدمين ============ */
window.Modules.users = function(container) {
  const db = APP.getDB();
  // حالة التعديل
  let _editingUserId = null;

  Exports.register("users", {
    label: "إدارة المستخدمين",
    pdf: () => {
      const headers = ['الرقم الوظيفي', 'الاسم', 'اسم المستخدم', 'الصلاحية', 'الحالة'];
      const rows = db.users.map(u => [u.empId, u.name, u.username, APP._roleLabel(u.role), u.active ? 'نشط' : 'موقوف']);
      const html = Exports.rowsToHTMLTable(headers, rows, { title: 'قائمة المستخدمين والصلاحيات' });
      Exports.exportPDF("إدارة المستخدمين", html, "users");
    },
    excel: () => {
      const headers = ['الرقم الوظيفي', 'الاسم', 'اسم المستخدم', 'الصلاحية', 'الحالة'];
      const rows = db.users.map(u => [u.empId, u.name, u.username, APP._roleLabel(u.role), u.active ? 'نشط' : 'موقوف']);
      Exports.exportExcel(Exports.rowsToHTMLTable(headers, rows, { title: 'المستخدمون' }), "users");
    },
    csv: () => {
      const headers = ['الرقم الوظيفي', 'الاسم', 'اسم المستخدم', 'الصلاحية', 'الحالة'];
      const rows = db.users.map(u => [u.empId, u.name, u.username, APP._roleLabel(u.role), u.active ? 'نشط' : 'موقوف']);
      Exports.exportCSV(Exports.rowsToCSV(headers, rows), "users");
    },
    json: () => Exports.exportJSON({ users: db.users }, "users_data"),
    print: () => window.print()
  });


  function render() {
    const editingUser = _editingUserId ? db.users.find(u => u.id === _editingUserId) : null;
    container.innerHTML = `
      <div class="alert alert-warning">
        <span>${Icons.render("shield")}</span>
        <span>هذه الوحدة متاحة لمدير النظام فقط. يمكنك إضافة مستخدمين جدد، تعديل بياناتهم (الاسم، اسم المستخدم، كلمة المرور، الصلاحية)، أو إيقافهم مؤقتاً.</span>
      </div>

      <div class="card">
        <h3>${editingUser ? Icons.render("edit") + " تعديل المستخدم: " + editingUser.name : Icons.render("plus") + " إضافة مستخدم جديد"}</h3>
        ${editingUser ? `<div class="alert alert-info" style="background:#e3f2fd;color:#1565c0"><span>${Icons.render("info")}</span><span>أنت في وضع التعديل. غيّر البيانات ثم اضغط "تحديث"، أو اضغط "إلغاء" للعودة.</span></div>` : ''}
        <form class="form-grid" id="userForm">
          <div class="form-group">
            <label>الرقم الوظيفي</label>
            <input type="text" id="u_empId" value="${editingUser ? editingUser.empId : ''}" required />
          </div>
          <div class="form-group">
            <label>الاسم الكامل</label>
            <input type="text" id="u_name" value="${editingUser ? editingUser.name : ''}" required />
          </div>
          <div class="form-group">
            <label>اسم المستخدم</label>
            <input type="text" id="u_username" value="${editingUser ? editingUser.username : ''}" required />
          </div>
          <div class="form-group">
            <label>${editingUser ? 'كلمة المرور (اتركها فارغة لعدم التغيير)' : 'كلمة المرور'}</label>
            <input type="text" id="u_password" value="" placeholder="${editingUser ? '••••••' : ''}" />
          </div>
          <div class="form-group">
            <label>الصلاحية</label>
            <select id="u_role">
              <option value="admin" ${editingUser && editingUser.role === 'admin' ? 'selected' : ''}>مدير النظام</option>
              <option value="production" ${editingUser && editingUser.role === 'production' ? 'selected' : ''}>مدير الإنتاج</option>
              <option value="accountant" ${editingUser && editingUser.role === 'accountant' ? 'selected' : ''}>المحاسب</option>
              <option value="sales" ${editingUser && editingUser.role === 'sales' ? 'selected' : ''}>المبيعات والمخازن</option>
              <option value="lab" ${editingUser && editingUser.role === 'lab' ? 'selected' : ''}>المختبر والمحطة</option>
              <option value="procurement" ${editingUser && editingUser.role === 'procurement' ? 'selected' : ''}>المشتريات والموارد البشرية</option>
            </select>
          </div>
        </form>
        <div class="btn-row">
          ${editingUser ? `
            <button class="btn btn-success" data-action="save-user">${Icons.render("save")} تحديث المستخدم</button>
            <button class="btn btn-secondary" data-action="cancel-user-edit">إلغاء</button>
          ` : `
            <button class="btn btn-primary" data-action="add-user">${Icons.render("plus")} إضافة المستخدم</button>
            <button class="btn btn-secondary" type="reset" data-action="reset-user-form">مسح</button>
          `}
        </div>
      </div>

      <div class="card">
        <div class="header-row">
          <h3>${Icons.render("users")} قائمة المستخدمين (${db.users.length})</h3>
          <div class="search-bar" style="margin:0">
            <span class="icon">${Icons.render("search")}</span>
            <input type="text" id="userSearch" placeholder="بحث بالاسم أو الرقم الوظيفي..." data-input="filter-users" />
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>الرقم الوظيفي</th>
              <th>الاسم</th>
              <th>اسم المستخدم</th>
              <th>الصلاحية</th>
              <th>الحالة</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody id="usersTbody">
            ${db.users.map((u, idx) => `
              <tr data-search="${u.empId} ${u.name} ${u.username} ${u.role}" class="${editingUser && editingUser.id === u.id ? 'editing-row' : ''}">
                <td><b>${u.empId}</b>${editingUser && editingUser.id === u.id ? ' ✏️' : ''}</td>
                <td>${u.name}</td>
                <td>${u.username}</td>
                <td><span class="badge badge-info">${APP._roleLabel(u.role)}</span></td>
                <td><span class="badge badge-${u.active ? 'success' : 'danger'}">${u.active ? 'نشط' : 'موقوف'}</span></td>
                <td>
                  <div style="display:flex;gap:6px;flex-wrap:wrap">
                    <button class="btn btn-primary btn-sm" data-action="edit-user" data-uidx="${idx})" title="تعديل بيانات المستخدم">${Icons.render("edit")} تعديل</button>
                    <button class="btn btn-warning btn-sm" data-action="toggle-user" data-uidx="${idx})" title="${u.active ? 'إيقاف الحساب مؤقتاً' : 'إعادة تفعيل الحساب'}">${u.active ? '⏸ إيقاف' : '▶ تفعيل'}</button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <style>
        .editing-row {
          background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%) !important;
          box-shadow: inset 4px 4px 8px rgba(0,0,0,0.05);
        }
        .editing-row td { font-weight: 700; }
      </style>
    `;
  }

  Modules._addUser = function() {
    const empId = document.getElementById('u_empId').value.trim();
    const name = document.getElementById('u_name').value.trim();
    const username = document.getElementById('u_username').value.trim();
    const password = document.getElementById('u_password').value;
    const role = document.getElementById('u_role').value;

    if (!empId || !name || !username || !password) {
      alert('⚠ يرجى ملء كل الحقول المطلوبة');
      return;
    }

    // التحقق من عدم تكرار اسم المستخدم أو الرقم الوظيفي
    const db = APP.getDB();
    if (db.users.some(u => u.username === username)) {
      alert('⚠ اسم المستخدم موجود بالفعل، يرجى اختيار اسم آخر');
      return;
    }
    if (db.users.some(u => u.empId === empId)) {
      alert('⚠ الرقم الوظيفي موجود بالفعل');
      return;
    }

    db.users.push({
      id: Date.now(),
      empId, name, username, password, role,
      active: true
    });
    APP.saveDB(db);
    alert('✅ تم إضافة المستخدم "' + name + '" بنجاح');
    render();
  };

  Modules._editUser = function(idx) {
    const db = APP.getDB();
    const user = db.users[idx];
    if (!user) return;
    _editingUserId = user.id;
    render();
    // تعبئة النموذج بعد إعادة الرسم
    setTimeout(() => {
      document.getElementById('u_empId').value = user.empId;
      document.getElementById('u_name').value = user.name;
      document.getElementById('u_username').value = user.username;
      document.getElementById('u_password').value = '';
      document.getElementById('u_role').value = user.role;
      // تمرير للأعلى لإظهار النموذج
      document.getElementById('userForm').scrollIntoView({ behavior: 'smooth', block: 'center' });
      document.getElementById('u_name').focus();
    }, 50);
  };

  Modules._saveUser = function() {
    if (_editingUserId === null) return;
    const db = APP.getDB();
    const idx = db.users.findIndex(u => u.id === _editingUserId);
    if (idx === -1) {
      alert('⚠ المستخدم غير موجود');
      _editingUserId = null;
      render();
      return;
    }

    const empId = document.getElementById('u_empId').value.trim();
    const name = document.getElementById('u_name').value.trim();
    const username = document.getElementById('u_username').value.trim();
    const password = document.getElementById('u_password').value;
    const role = document.getElementById('u_role').value;

    if (!empId || !name || !username) {
      alert('⚠ يرجى ملء كل الحقول المطلوبة');
      return;
    }

    // التحقق من عدم تكرار اسم المستخدم أو الرقم الوظيفي (مع استثناء المستخدم الحالي)
    if (db.users.some(u => u.username === username && u.id !== _editingUserId)) {
      alert('⚠ اسم المستخدم موجود بالفعل لمستخدم آخر');
      return;
    }
    if (db.users.some(u => u.empId === empId && u.id !== _editingUserId)) {
      alert('⚠ الرقم الوظيفي موجود بالفعل لمستخدم آخر');
      return;
    }

    // تحديث البيانات (الاحتفاظ بكلمة المرور القديمة إذا لم تُغيّر)
    const updated = { ...db.users[idx] };
    updated.empId = empId;
    updated.name = name;
    updated.username = username;
    updated.role = role;
    if (password && password.trim() !== '') {
      updated.password = password;
    }
    db.users[idx] = updated;

    APP.saveDB(db);
    _editingUserId = null;
    alert('✅ تم تحديث بيانات "' + name + '" بنجاح');
    render();
  };

  Modules._cancelUserEdit = function() {
    _editingUserId = null;
    render();
  };

  Modules._toggleUser = function(idx) {
    const db = APP.getDB();
    const user = db.users[idx];
    const action = user.active ? 'إيقاف' : 'تفعيل';
    if (!confirm(`هل تريد ${action} المستخدم "${user.name}"؟`)) return;
    db.users[idx].active = !db.users[idx].active;
    APP.saveDB(db);
    render();
  };

  Modules._filterUsers = function() {
    const q = document.getElementById('userSearch').value.toLowerCase();
    document.querySelectorAll('#usersTbody tr').forEach(tr => {
      tr.style.display = tr.dataset.search.toLowerCase().includes(q) ? '' : 'none';
    });
  };

  render();
};

/* ============ إدارة الصلاحيات ============ */
window.Modules.permissions = function(container) {
  const db = APP.getDB();
  const viewer = APP.getCurrentUser();
  if (!viewer || (viewer.role !== 'admin' && viewer.role !== 'hr_manager')) {
    container.innerHTML = `<div class="alert alert-danger"><span>${Icons.render("lock")}</span><span>⛔ ليس لديك صلاحية الوصول لهذه الصفحة</span></div>`;
    return;
  }

  const allPages = [
    { id: 'dashboard',       label: 'لوحة التحكم' },
    { id: 'production',      label: 'الإنتاج' },
    { id: 'purchaseRequest', label: 'طلبات الشراء' },
    { id: 'costs',           label: 'التكاليف' },
    { id: 'pricing',         label: 'الأسعار' },
    { id: 'inventory',       label: 'المخزون' },
    { id: 'vouchers',        label: 'سندات الصرف' },
    { id: 'sales',           label: 'المبيعات' },
    { id: 'mySales',        label: 'مبيعاتي' },
    { id: 'agents',          label: 'الوكلاء' },
    { id: 'lab',             label: 'المختبر' },
    { id: 'procurement',     label: 'المشتريات' },
    { id: 'hr',              label: 'الموارد البشرية' },
    { id: 'reports',         label: 'التقارير' },
    { id: 'users',           label: 'إدارة المستخدمين' },
    { id: 'permissions',     label: 'إدارة الصلاحيات' },
    { id: 'settings',        label: 'الإعدادات' },
    { id: 'profile',         label: 'الملف الشخصي' }
  ];

  const allRoles = [
    { id: 'admin',       label: 'المدير العام' },
    { id: 'hr_manager',  label: 'مدير الموارد البشرية' },
    { id: 'production',  label: 'مدير الإنتاج' },
    { id: 'accountant',  label: 'محاسب' },
    { id: 'sales',       label: 'مندوب مبيعات' },
    { id: 'lab',         label: 'فني مختبر' },
    { id: 'procurement', label: 'مدير المشتريات' },
    { id: 'worker',      label: 'موظف' }
  ];


  function render() {
    container.innerHTML = `
      <div class="alert alert-info">
        <span>${Icons.render("key")}</span>
        <span><b>إدارة الصلاحيات</b> — يمكنك منح أو إلغاء صلاحيات محددة لأي مستخدم. المدير العام له وصول كامل دائماً.</span>
      </div>

      <div class="card">
        <h3>${Icons.render("grid")} مصفوفة الصلاحيات الافتراضية</h3>
        <p class="text-muted">الصلاحيات الممنوحة تلقائياً حسب الدور. يمكن إضافة صلاحيات مخصصة لكل مستخدم في الأسفل.</p>
        <div style="overflow-x:auto">
        <table class="data-table">
          <thead>
            <tr>
              <th>الصفحة</th>
              ${allRoles.map(r => `<th style="text-align:center;font-size:11px">${r.label}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${allPages.map(p => `
              <tr>
                <td data-label="الصفحة"><b>${p.label}</b></td>
                ${allRoles.map(r => {
                  const allowed = (DB.PERMISSIONS.pages[p.id] || []).includes(r.id);
                  return `<td data-label="${r.label}" style="text-align:center">${allowed ? '<span style="color:var(--success);font-size:18px">✓</span>' : '<span style="color:var(--text-muted);font-size:18px">–</span>'}</td>`;
                }).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
        </div>
      </div>

      <div class="card">
        <div class="header-row" style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap">
          <h3>${Icons.render("users")} المستخدمون وصلاحياتهم المخصصة</h3>
        </div>
        <p class="text-muted">الصلاحيات المخصصة تتجاوز الصلاحيات الافتراضية. اختر مستخدماً لتعديل صلاحياته.</p>
        <div style="overflow-x:auto">
        <table class="data-table">
          <thead>
            <tr>
              <th>المستخدم</th>
              <th>الدور</th>
              <th>القسم</th>
              <th>صلاحيات مخصصة</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            ${db.users.map(u => `
              <tr>
                <td data-label="المستخدم"><b>${u.name}</b><br><small>${u.username} | ${u.empId}</small></td>
                <td data-label="الدور"><span class="badge badge-info">${APP._roleLabel ? APP._roleLabel(u.role) : u.role}</span></td>
                <td data-label="القسم">${u.department || '—'}</td>
                <td data-label="صلاحيات مخصصة">${(u.customPermissions || []).length ? u.customPermissions.map(p => `<span class="badge badge-success" style="margin:2px">${allPages.find(ap => ap.id === p)?.label || p}</span>`).join('') : '<span class="text-muted">لا توجد</span>'}</td>
                <td data-label="إجراءات">
                  <button class="btn btn-sm btn-primary" data-action="edit-permissions" data-puid="${u.id})">${Icons.render("edit")} تعديل الصلاحيات</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        </div>
      </div>

      <div id="permissionsModal" class="modal-overlay" style="display:none">
        <div class="modal-card" style="max-width:700px">
          <div class="modal-header">
            <h3>${Icons.render("key")} تعديل صلاحيات المستخدم</h3>
            <button class="btn btn-sm" data-action="modal-close-pm">${Icons.render("x")}</button>
          </div>
          <div class="modal-body">
            <div id="permModalContent"></div>
          </div>
        </div>
      </div>
    `;
  }

  Modules._editPermissions = function(userId) {
    const user = db.users.find(u => u.id === userId);
    if (!user) return;
    const defaults = DB.PERMISSIONS.pages;
    const current = user.customPermissions || [];
    const content = document.getElementById('permModalContent');
    content.innerHTML = `
      <div class="alert alert-info">
        <span>${Icons.render("user")}</span>
        <span><b>${user.name}</b> — ${APP._roleLabel ? APP._roleLabel(user.role) : user.role} (${user.department || '—'})</span>
      </div>
      <p class="text-muted">الصلاحيات الممنوحة افتراضياً: ${(defaults[user.role === 'admin' ? 'dashboard' : 'dashboard'] || []).length} صفحة. أضف صلاحيات إضافية إذا لزم الأمر.</p>
      <h4>الصلاحيات المخصصة (إضافية على الافتراضية):</h4>
      <div id="permList">
        ${allPages.map(p => {
          const isDefault = (defaults[p.id] || []).includes(user.role);
          const hasCustom = current.includes(p.id);
          return `
            <label style="display:flex;align-items:center;gap:8px;padding:8px;border-bottom:1px solid var(--bg-darker)">
              <input type="checkbox" data-page="${p.id}" ${hasCustom ? 'checked' : ''} ${isDefault ? 'disabled' : ''} />
              <span><b>${p.label}</b> ${isDefault ? '<span class="badge badge-info" style="font-size:10px">افتراضي</span>' : ''} ${hasCustom ? '<span class="badge badge-success" style="font-size:10px">مخصص</span>' : ''}</span>
            </label>
          `;
        }).join('')}
      </div>
      <div class="btn-row" style="margin-top:20px">
        <button class="btn btn-primary" data-action="save-permissions" data-spuid="${user.id})">${Icons.render("check")} حفظ الصلاحيات</button>
        <button class="btn btn-secondary" data-action="modal-close-pm">إلغاء</button>
      </div>
    `;
    document.getElementById('permissionsModal').style.display = 'flex';
  };

  Modules._savePermissions = function(userId) {
    const user = db.users.find(u => u.id === userId);
    if (!user) return;
    const checkboxes = document.querySelectorAll('#permList input[type=checkbox]');
    const custom = [];
    checkboxes.forEach(cb => { if (cb.checked) custom.push(cb.dataset.page); });
    user.customPermissions = custom;
    APP.saveDB(db);
    document.getElementById('permissionsModal').style.display = 'none';
    render();
  };

  // === تصدير مصفوفة الصلاحيات ===
  Exports.register("permissions", {
    label: "إدارة الصلاحيات",
    pdf: () => {
      const html = `
        <h2>مصفوفة الصلاحيات الافتراضية</h2>
        <table>
          <thead>
            <tr>
              <th>الصفحة</th>
              ${allRoles.map(r => `<th>${r.label}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${allPages.map(p => `
              <tr>
                <td><b>${p.label}</b></td>
                ${allRoles.map(r => {
                  const allowed = (DB.PERMISSIONS.pages[p.id] || []).includes(r.id);
                  return `<td>${allowed ? '✓' : '–'}</td>`;
                }).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
        <h2>الصلاحيات المخصصة للمستخدمين</h2>
        <table>
          <thead><tr><th>المستخدم</th><th>الدور</th><th>القسم</th><th>صلاحيات مخصصة</th></tr></thead>
          <tbody>
            ${db.users.map(u => `
              <tr>
                <td>${u.name}</td>
                <td>${u.role}</td>
                <td>${u.department || '—'}</td>
                <td>${(u.customPermissions || []).join(', ') || 'لا توجد'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
      Exports.exportPDF('مصفوفة الصلاحيات والمنح', html, 'permissions');
    },
    excel: () => {
      const headers = ['المستخدم', 'اسم الدخول', 'الدور', 'القسم', 'الصلاحيات المخصصة'];
      const rows = db.users.map(u => [
        u.name,
        u.username,
        u.role,
        u.department || '—',
        (u.customPermissions || []).join(', ') || '—'
      ]);
      Exports.exportExcel(Exports.rowsToHTMLTable(headers, rows, { title: 'الصلاحيات المخصصة' }), 'permissions');
    },
    csv: () => {
      const headers = ['المستخدم', 'اسم الدخول', 'الدور', 'القسم', 'الصلاحيات المخصصة'];
      const rows = db.users.map(u => [
        u.name,
        u.username,
        u.role,
        u.department || '—',
        (u.customPermissions || []).join(', ') || '—'
      ]);
      Exports.exportCSV(Exports.rowsToCSV(headers, rows), 'permissions');
    },
    json: () => Exports.exportJSON({ permissions: DB.PERMISSIONS, users: db.users }, 'permissions_data'),
    print: () => window.print()
  });

  render();
};

/* ============ الملف الشخصي ============ */
window.Modules.profile = function(container) {
  const db = APP.getDB();
  const user = APP.getCurrentUser();
  if (!user) { container.innerHTML = '<div class="alert alert-danger">خطأ</div>'; return; }

  // الموظف المرتبط
  const emp = user.employeeId ? db.employeesLog.find(e => e.id === user.employeeId) : null;
  const roleLabel = (DB.PERMISSIONS && DB.PERMISSIONS.roleLabels && DB.PERMISSIONS.roleLabels[user.role]) || user.role;
  const isAdmin = user.role === 'admin' || user.role === 'hr_manager';
  const canEdit = isAdmin || (emp && user.employeeId === emp.id);
  const allowedPages = Object.entries(DB.PERMISSIONS.pages)
    .filter(([pid, roles]) => roles.includes(user.role) || (user.customPermissions || []).includes(pid))
    .map(([pid]) => pid);

  const allPagesLabels = {
    dashboard: 'لوحة التحكم', production: 'الإنتاج', purchaseRequest: 'طلبات الشراء',
    costs: 'التكاليف', pricing: 'الأسعار', inventory: 'المخزون', vouchers: 'سندات الصرف',
    sales: 'المبيعات', agents: 'الوكلاء', lab: 'المختبر', procurement: 'المشتريات',
    hr: 'الموارد البشرية', reports: 'التقارير', users: 'إدارة المستخدمين',
    permissions: 'إدارة الصلاحيات', settings: 'الإعدادات', profile: 'الملف الشخصي'
  };

  container.innerHTML = `
    <div class="alert alert-info">
      <span>${Icons.render("user")}</span>
      <span>مرحباً <b>${user.name}</b> — هنا تجد كل معلوماتك الشخصية والوظيفية.</span>
    </div>

    <!-- صورة شخصية + بيانات أساسية -->
    <div class="card">
      <h3>${Icons.render("user")} الصورة الشخصية والبيانات الأساسية</h3>
      <div style="display:grid;grid-template-columns:auto 1fr;gap:20px;align-items:start;flex-wrap:wrap">
        <div style="text-align:center">
          <div id="emp-photo-preview" style="width:120px;height:120px;border-radius:50%;background:var(--bg-darker);display:flex;align-items:center;justify-content:center;overflow:hidden;margin:0 auto">
            ${emp && emp.photo ? `<img src="${emp.photo}" style="width:100%;height:100%;object-fit:cover" />` : `<span style="font-size:48px;color:var(--text-muted)">${user.name.charAt(0)}</span>`}
          </div>
          ${canEdit && emp ? `
            <input type="file" id="photo-input" accept="image/*" style="display:none" data-change="file-upload" data-type="photo" data-eid="${emp.id}" />
            <button class="btn btn-sm btn-primary" style="margin-top:8px" data-action="file-trigger" data-target="photo-input">${Icons.render("upload")} تغيير الصورة</button>
            ${emp.photo ? `<button class="btn btn-sm btn-danger" style="margin-top:4px" data-action="delete-doc" data-eid=" data-doctype="${emp.id}, 'photo')">${Icons.render("trash")} حذف</button>` : ''}
          ` : ''}
        </div>
        <div class="form-grid" style="flex:1;min-width:280px">
          <div class="form-group">
            <label>الرقم الوظيفي</label>
            <input type="text" value="${user.empId || '—'}" readonly style="background:var(--bg-darker);cursor:not-allowed" />
          </div>
          <div class="form-group">
            <label>اسم المستخدم</label>
            <input type="text" value="${user.username}" readonly style="background:var(--bg-darker);cursor:not-allowed" />
          </div>
          <div class="form-group">
            <label>الاسم الكامل</label>
            <input type="text" value="${user.name}" readonly style="background:var(--bg-darker);cursor:not-allowed" />
          </div>
          <div class="form-group">
            <label>الصلاحية</label>
            <input type="text" value="${roleLabel}" readonly style="background:var(--bg-darker);cursor:not-allowed" />
          </div>
          <div class="form-group">
            <label>القسم</label>
            <input type="text" value="${user.department || '—'}" readonly style="background:var(--bg-darker);cursor:not-allowed" />
          </div>
          <div class="form-group">
            <label>الحالة</label>
            <input type="text" value="${user.active ? '✅ نشط' : '❌ موقوف'}" readonly style="background:var(--bg-darker);cursor:not-allowed" />
          </div>
        </div>
      </div>
      <div class="btn-row" style="margin-top:16px">
        <button class="btn btn-secondary" data-action="change-password">${Icons.render("lock")} تغيير كلمة المرور</button>
      </div>
    </div>

    ${emp ? `
    <!-- بيانات الموظف الكاملة -->
    <div class="card">
      <h3>${Icons.render("users")} بيانات الموظف</h3>
      <div class="form-grid">
        <div class="form-group">
          <label>الرقم الوظيفي (HR)</label>
          <input type="text" value="${emp.empId}" readonly style="background:var(--bg-darker);cursor:not-allowed" />
        </div>
        <div class="form-group">
          <label>الوظيفة</label>
          <input type="text" value="${emp.position || '—'}" readonly style="background:var(--bg-darker);cursor:not-allowed" />
        </div>
        <div class="form-group">
          <label>القسم</label>
          <input type="text" value="${emp.department || '—'}" readonly style="background:var(--bg-darker);cursor:not-allowed" />
        </div>
        <div class="form-group">
          <label>تاريخ التعيين</label>
          <input type="text" value="${emp.hireDate || '—'}" readonly style="background:var(--bg-darker);cursor:not-allowed" />
        </div>
        <div class="form-group">
          <label>الراتب الأساسي</label>
          <input type="text" value="${(emp.salary || 0).toLocaleString('ar-EG')} ر.ي" readonly style="background:var(--bg-darker);cursor:not-allowed" />
        </div>
        <div class="form-group">
          <label>البدلات</label>
          <input type="text" value="${(emp.allowances || 0).toLocaleString('ar-EG')} ر.ي" readonly style="background:var(--bg-darker);cursor:not-allowed" />
        </div>
        <div class="form-group">
          <label>إجمالي الراتب</label>
          <input type="text" value="${((emp.salary || 0) + (emp.allowances || 0)).toLocaleString('ar-EG')} ر.ي" readonly style="background:var(--bg-darker);cursor:not-allowed;color:var(--success);font-weight:bold" />
        </div>
        <div class="form-group">
          <label>الحالة</label>
          <input type="text" value="${emp.status === 'active' ? '✅ نشط' : (emp.terminationStatus ? '⛔ ' + (emp.terminationStatus.type || 'منتهي') : '❌ موقوف')}" readonly style="background:var(--bg-darker);cursor:not-allowed" />
        </div>
      </div>
    </div>

    <!-- الهوية الشخصية -->
    <div class="card">
      <h3>${Icons.render("shield")} الهوية الشخصية</h3>
      <div style="display:grid;grid-template-columns:auto 1fr;gap:20px;align-items:start;flex-wrap:wrap">
        <div style="text-align:center">
          <div id="id-photo-preview" style="width:200px;height:130px;border-radius:8px;background:var(--bg-darker);display:flex;align-items:center;justify-content:center;overflow:hidden;border:2px dashed var(--text-muted)">
            ${emp.idCardPhoto ? `<img src="${emp.idCardPhoto}" style="width:100%;height:100%;object-fit:contain" />` : `<span style="color:var(--text-muted);font-size:13px;text-align:center;padding:10px">صورة الهوية<br>(وجه أمامي)</span>`}
          </div>
          ${canEdit ? `
            <input type="file" id="id-input" accept="image/*" style="display:none" data-change="file-upload" data-type="idCardPhoto" data-eid="${emp.id}" />
            <button class="btn btn-sm btn-primary" style="margin-top:8px" data-action="file-trigger" data-target="id-input">${Icons.render("upload")} رفع صورة الهوية</button>
            ${emp.idCardPhoto ? `<button class="btn btn-sm btn-danger" style="margin-top:4px" data-action="delete-doc" data-eid=" data-doctype="${emp.id}, 'idCardPhoto')">${Icons.render("trash")} حذف</button>` : ''}
          ` : ''}
        </div>
        <div class="form-grid" style="flex:1;min-width:280px">
          <div class="form-group">
            <label>رقم الهوية</label>
            <input type="text" id="id_card_number" value="${emp.idCardNumber || ''}" ${canEdit ? '' : 'readonly'} placeholder="رقم الهوية" />
          </div>
          <div class="form-group">
            <label>مكان الإصدار</label>
            <input type="text" id="id_card_place" value="${(emp.idCardData && emp.idCardData.place) || ''}" ${canEdit ? '' : 'readonly'} placeholder="مكان الإصدار" />
          </div>
          <div class="form-group">
            <label>تاريخ الإصدار</label>
            <input type="date" id="id_card_date" value="${(emp.idCardData && emp.idCardData.date) || ''}" ${canEdit ? '' : 'readonly'} />
          </div>
          <div class="form-group">
            <label>الجنسية</label>
            <input type="text" id="id_card_nationality" value="${(emp.idCardData && emp.idCardData.nationality) || ''}" ${canEdit ? '' : 'readonly'} placeholder="الجنسية" />
          </div>
          ${canEdit ? `<div class="form-group" style="grid-column:1/-1"><button class="btn btn-primary" data-action="save-idcard" data-eid="${emp.id})">${Icons.render("check")} حفظ بيانات الهوية</button></div>` : ''}
        </div>
      </div>
    </div>

    <!-- السيرة الذاتية -->
    <div class="card">
      <h3>${Icons.render("report")} السيرة الذاتية (CV)</h3>
      <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
        ${emp.cv ? `
          <a href="${emp.cv}" download="cv_${emp.empId}.png" class="btn btn-success">${Icons.render("download")} تحميل السيرة الذاتية</a>
          ${canEdit ? `<button class="btn btn-sm btn-danger" data-action="delete-doc" data-eid=" data-doctype="${emp.id}, 'cv')">${Icons.render("trash")} حذف</button>` : ''}
        ` : `<span class="text-muted">لم يتم رفع السيرة الذاتية بعد</span>`}
        ${canEdit ? `
          <input type="file" id="cv-input" accept="image/*,.pdf" style="display:none" data-change="file-upload" data-type="cv" data-eid="${emp.id}" />
          <button class="btn btn-primary" data-action="file-trigger" data-target="cv-input">${Icons.render("upload")} رفع السيرة الذاتية</button>
        ` : ''}
      </div>
    </div>

    <!-- الشهادات -->
    <div class="card">
      <h3>${Icons.render("award")} الشهادات والدورات</h3>
      <div style="display:flex;flex-direction:column;gap:10px">
        ${(emp.certificates || []).length === 0 ? '<p class="text-muted">لا توجد شهادات مرفوعة</p>' : ''}
        ${(emp.certificates || []).map((cert, i) => `
          <div style="display:flex;align-items:center;gap:8px;padding:10px;background:var(--bg);border-radius:8px">
            <a href="${cert.data}" target="_blank" class="btn btn-sm btn-secondary">${Icons.render("download")} ${cert.name}</a>
            <span class="text-muted" style="font-size:11px">${cert.uploadDate ? new Date(cert.uploadDate).toLocaleDateString('ar-EG') : ''}</span>
            ${canEdit ? `<button class="btn btn-sm btn-danger" data-action="delete-doc" data-eid=" data-doctype="${emp.id}, 'certificate', ${i})">${Icons.render("trash")}</button>` : ''}
          </div>
        `).join('')}
        ${canEdit ? `
          <input type="file" id="cert-input" accept="image/*,.pdf" style="display:none" data-change="file-upload" data-type="certificate" data-eid="${emp.id}" />
          <button class="btn btn-primary" data-action="file-trigger" data-target="cert-input">${Icons.render("upload")} رفع شهادة جديدة</button>
        ` : ''}
      </div>
    </div>

    ${isAdmin ? `
    <!-- إدارة حالة التوظيف (HR/Admin فقط) -->
    <div class="card">
      <h3>${Icons.render("alert")} إدارة حالة التوظيف</h3>
      <p class="text-muted">إنهاء العقد أو تغيير حالة الموظف</p>
      <div class="form-grid">
        <div class="form-group">
          <label>الحالة الحالية</label>
          <input type="text" value="${emp.status === 'active' ? '✅ نشط' : '⛔ ' + (emp.terminationStatus ? emp.terminationStatus.type : 'منتهي')}" readonly style="background:var(--bg-darker);cursor:not-allowed" />
        </div>
      </div>
      <div class="btn-row">
        <button class="btn btn-danger" data-action="terminate-employee" data-eid="${emp.id})">${Icons.render("x")} إنهاء التعاقد</button>
      </div>
    </div>
    ` : ''}
    ` : `
    <div class="alert alert-warning">
      <span>${Icons.render("alert")}</span>
      <span>لم يتم ربط هذا الحساب ببيانات موظف. تواصل مع مدير الموارد البشرية.</span>
    </div>
    `}

    <div class="card">
      <h3>${Icons.render("key")} الصلاحيات والصفحات المتاحة</h3>
      <div style="display:flex;flex-wrap:wrap;gap:6px">
        ${allowedPages.map(p => `<span class="badge badge-info">${allPagesLabels[p] || p}</span>`).join('')}
      </div>
    </div>
`;

  // ===== قسم الطلبات والموافقات في الملف الشخصي =====
  SelfService.initDB();
  const myReqs = SelfService.getMyRequests();
  const notifs = (db.notifications || []).filter(n => n.for === user.empId || n.for === user.username);
  const unread = notifs.filter(n => !n.read).length;
  const pending = myReqs.filter(r => ['pending_manager','pending_admin','pending_dept','pending_gm'].includes(r.status)).length;
  const approved = myReqs.filter(r => r.status === 'approved' || r.status === 'completed').length;
  const rejected = myReqs.filter(r => r.status === 'rejected' || r.status === 'cancelled').length;

  container.innerHTML += '<div class="card" style="margin-top:14px">';
  container.innerHTML += '<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;margin-bottom:14px">';
  container.innerHTML += '<h3 style="margin:0">' + Icons.render("inbox") + ' طلباتي</h3>';
  container.innerHTML += '<div style="display:flex;gap:8px;flex-wrap:wrap">';
  container.innerHTML += '<span class="badge badge-info">الإجمالي: ' + myReqs.length + '</span>';
  container.innerHTML += '<span class="badge badge-warning">بانتظار: ' + pending + '</span>';
  container.innerHTML += '<span class="badge badge-success">معتمدة: ' + approved + '</span>';
  container.innerHTML += '<span class="badge badge-secondary">مرفوضة: ' + rejected + '</span>';
  container.innerHTML += '<span class="badge badge-info">إشعارات: ' + unread + ' غير مقروءة</span>';
  container.innerHTML += '</div></div>';

  if (myReqs.length === 0) {
    container.innerHTML += '<p class="text-muted" style="text-align:center;padding:20px">لم تقدم أي طلبات حتى الآن.</p>';
    container.innerHTML += '<div style="text-align:center;margin-bottom:14px"><button class="btn btn-primary" data-action="nav-new-request">' + Icons.render("plus") + ' قدم طلبك الأول</button></div>';
  } else {
    container.innerHTML += '<table class="data-table"><thead><tr><th>رقم</th><th>النوع</th><th>الفئة</th><th>العنوان</th><th>التاريخ</th><th>المبلغ</th><th>الحالة</th><th></th></tr></thead><tbody>';
    myReqs.forEach(r => {
      const typeConfig = SelfService.REQUEST_TYPES.find(t => t.id === r.type) || {};
      container.innerHTML += '<tr>';
      container.innerHTML += '<td><code style="font-size:11px">' + r.id.substring(0,12) + '</code></td>';
      container.innerHTML += '<td><span class="badge badge-info">' + (typeConfig.label || r.type) + '</span></td>';
      container.innerHTML += '<td>' + (r.subTypeLabel || '-') + '</td>';
      container.innerHTML += '<td>' + r.title + '</td>';
      container.innerHTML += '<td class="text-muted" style="font-size:12px">' + new Date(r.createdAt).toLocaleDateString('ar-EG') + '</td>';
      container.innerHTML += '<td class="text-primary"><b>' + (r.amount ? r.amount.toLocaleString('ar-EG') + ' ر.ي' : '-') + '</b></td>';
      container.innerHTML += '<td><span class="badge ' + SelfService.STATUS_COLORS[r.status] + '">' + SelfService.STATUS_LABELS[r.status] + '</span></td>';
      container.innerHTML += '<td><button class="btn btn-sm" data-action="view-request" data-rid="\'' + r.id + '\')">' + Icons.render("eye") + '</button></td>';
      container.innerHTML += '</tr>';
    });
    container.innerHTML += '</tbody></table>';
    container.innerHTML += '<div style="text-align:center;margin-top:12px">';
    container.innerHTML += '<button class="btn btn-primary" data-action="nav-new-request">' + Icons.render("plus") + ' طلب جديد</button>';
    container.innerHTML += '<button class="btn btn-secondary" data-action="nav-my-requests">' + Icons.render("inbox") + ' عرض الكل</button>';
    container.innerHTML += '</div>';
  }
  container.innerHTML += '</div>';

  container.innerHTML += '<div class="card" style="margin-top:14px"><h3>' + Icons.render("bell") + ' الإشعارات</h3>';
  if (notifs.length === 0) {
    container.innerHTML += '<p class="text-muted" style="padding:10px 0">لا توجد إشعارات</p>';
  } else {
    container.innerHTML += '<table class="data-table"><thead><tr><th>العنوان</th><th>الرسالة</th><th>التاريخ</th><th></th></tr></thead><tbody>';
    notifs.slice(-10).reverse().forEach(n => {
      container.innerHTML += '<tr style="' + (n.read ? 'opacity:0.5' : '') + '">';
      container.innerHTML += '<td><b>' + n.title + '</b></td><td>' + n.message + '</td>';
      container.innerHTML += '<td class="text-muted" style="font-size:12px">' + new Date(n.createdAt).toLocaleDateString('ar-EG') + '</td>';
      container.innerHTML += '<td>' + (n.read ? '' : '<span class="badge badge-info">جديد</span>') + '</td>';
      container.innerHTML += '</tr>';
    });
    container.innerHTML += '</tbody></table>';
  }
  container.innerHTML += '</div>';
};


Modules._saveIDCardData = function(empId) {
  const db = APP.getDB();
  const emp = db.employeesLog.find(e => e.id === empId);
  if (!emp) return;
  emp.idCardNumber = document.getElementById('id_card_number').value.trim();
  emp.idCardData = {
    place: document.getElementById('id_card_place').value.trim(),
    date: document.getElementById('id_card_date').value,
    nationality: document.getElementById('id_card_nationality').value.trim()
  };
  APP.saveDB(db);
  alert('✅ تم حفظ بيانات الهوية');
};

Modules._terminateEmployee = function(empId) {
  const reason = prompt('سبب إنهاء التعاقد:');
  if (!reason) return;
  const typeOptions = ['فصل', 'استقالة', 'انتهاء العقد', 'تقاعد', 'إيقاف مؤقت'];
  const type = prompt('النوع: ' + typeOptions.join(' / '), 'استقالة');
  if (!type) return;
  const date = prompt('التاريخ (YYYY-MM-DD):', new Date().toISOString().split('T')[0]);
  if (!date) return;
  const db = APP.getDB();
  const emp = db.employeesLog.find(e => e.id === empId);
  if (!emp) return;
  emp.status = 'terminated';
  emp.terminationStatus = { type, reason, date, recordedBy: APP.getCurrentUser().name, recordedAt: new Date().toISOString() };
  if (!db.terminatedEmployees) db.terminatedEmployees = [];
  db.terminatedEmployees.push({ employeeId: empId, ...emp.terminationStatus });
  // إيقاف الحساب
  const u = db.users.find(x => x.employeeId === empId);
  if (u) u.active = false;
  APP.saveDB(db);
  alert('✅ تم إنهاء التعاقد');
  window.Modules.profile(document.getElementById('content'));
};

/* ============ إدارة الموظفين المنتهية عقودهم ============ */
window.Modules.terminated = function(container) {
  const db = APP.getDB();
  const isAdmin = APP.getCurrentUser() && (APP.getCurrentUser().role === 'admin' || APP.getCurrentUser().role === 'hr_manager');
  if (!isAdmin) { container.innerHTML = '<div class="alert alert-danger">⛔ صلاحية للمدير والمشرف فقط</div>'; return; }
  
  const term = db.terminatedEmployees || [];
  const active = db.employeesLog.filter(e => e.status === 'active' || !e.status);
  const terminated = db.employeesLog.filter(e => e.status === 'terminated');
  
  container.innerHTML = `
    <div class="alert alert-info">
      <span>${Icons.render("info")}</span>
      <span>إدارة الموظفين المنتهية عقودهم أو المفصولين أو المستقيلين</span>
    </div>

    <div class="kpi-grid" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr));margin-bottom:20px">
      <div class="kpi-card success">
        <div class="label"><span class="ic">${Icons.render("users")}</span>نشط</div>
        <div class="value">${active.length}</div>
      </div>
      <div class="kpi-card danger">
        <div class="label"><span class="ic">${Icons.render("x")}</span>منتهي / مفصول</div>
        <div class="value">${terminated.length}</div>
      </div>
      <div class="kpi-card info">
        <div class="label"><span class="ic">${Icons.render("users")}</span>الإجمالي</div>
        <div class="value">${db.employeesLog.length}</div>
      </div>
    </div>

    <div class="card">
      <h3>${Icons.render("x")} الموظفين المنتهية عقودهم (${terminated.length})</h3>
      ${terminated.length === 0 ? '<p class="text-muted">لا يوجد حالياً</p>' : `
      <div style="overflow-x:auto">
      <table class="data-table">
        <thead>
          <tr>
            <th>الرقم الوظيفي</th>
            <th>الاسم</th>
            <th>الوظيفة</th>
            <th>القسم</th>
            <th>نوع التوقف</th>
            <th>التاريخ</th>
            <th>السبب</th>
            <th>سُجّل بواسطة</th>
            <th>إجراء</th>
          </tr>
        </thead>
        <tbody>
          ${terminated.map(e => `
            <tr>
              <td data-label="الرقم"><b>${e.empId}</b></td>
              <td data-label="الاسم">${e.name}</td>
              <td data-label="الوظيفة">${e.position || '—'}</td>
              <td data-label="القسم">${e.department || '—'}</td>
              <td data-label="النوع"><span class="badge badge-danger">${(e.terminationStatus && e.terminationStatus.type) || '—'}</span></td>
              <td data-label="التاريخ">${(e.terminationStatus && e.terminationStatus.date) || '—'}</td>
              <td data-label="السبب">${(e.terminationStatus && e.terminationStatus.reason) || '—'}</td>
              <td data-label="سُجّل بواسطة" class="text-muted">${(e.terminationStatus && e.terminationStatus.recordedBy) || '—'}</td>
              <td data-label="إجراء"><button class="btn btn-sm btn-success" data-action="reinstate-employee" data-eid2="${e.id})">${Icons.render("refresh")} إعادة توظيف</button></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      </div>
      `}
    </div>
  `;
};

Modules._reinstateEmployee = function(empId) {
  if (!confirm('إعادة هذا الموظف إلى العمل؟')) return;
  const db = APP.getDB();
  const emp = db.employeesLog.find(e => e.id === empId);
  if (!emp) return;
  emp.status = 'active';
  emp.terminationStatus = null;
  const u = db.users.find(x => x.employeeId === empId);
  if (u) u.active = true;
  if (db.terminatedEmployees) db.terminatedEmployees = db.terminatedEmployees.filter(t => t.employeeId !== empId);
  APP.saveDB(db);
  alert('✅ تم إعادة الموظف للعمل');
  window.Modules.terminated(document.getElementById('content'));
};

/* === تصدير الموظفين المنتهية عقودهم === */
(function registerTerminatedExporter() {
  function buildTerminatedData() {
    const db = APP.getDB();
    const employees = db.employeesLog || [];
    const terminated = employees.filter(e => e.status === 'terminated' || e.terminationStatus);
    return { employees, terminated };
  }
  Exports.register('terminated', {
    label: 'الموظفون المنتهية عقودهم',
    pdf: () => {
      const { terminated } = buildTerminatedData();
      const html = `
        <h2>الموظفون المنتهية عقودهم</h2>
        <p>إجمالي: <b>${terminated.length}</b> موظف</p>
        <table>
          <thead><tr><th>الرقم الوظيفي</th><th>الاسم</th><th>القسم</th><th>الوظيفة</th><th>الحالة</th><th>سبب إنهاء العقد</th></tr></thead>
          <tbody>
            ${terminated.map(e => `
              <tr>
                <td>ID${String(e.empId).padStart(3, '0')}</td>
                <td>${e.name}</td>
                <td>${e.department || '—'}</td>
                <td>${e.position || '—'}</td>
                <td>${(e.terminationStatus && e.terminationStatus.type) || '—'}</td>
                <td>${(e.terminationStatus && e.terminationStatus.reason) || '—'}</td>
              </tr>
            `).join('') || '<tr><td colspan="6" style="text-align:center;color:#888">لا يوجد موظفون منتهية عقودهم</td></tr>'}
          </tbody>
        </table>
      `;
      Exports.exportPDF('الموظفون المنتهية عقودهم', html, 'terminated');
    },
    excel: () => {
      const { terminated } = buildTerminatedData();
      const headers = ['الرقم الوظيفي', 'الاسم', 'القسم', 'الوظيفة', 'الحالة', 'سبب إنهاء العقد'];
      const rows = terminated.map(e => [
        `ID${String(e.empId).padStart(3, '0')}`,
        e.name,
        e.department || '—',
        e.position || '—',
        (e.terminationStatus && e.terminationStatus.type) || '—',
        (e.terminationStatus && e.terminationStatus.reason) || '—'
      ]);
      Exports.exportExcel(Exports.rowsToHTMLTable(headers, rows, { title: 'الموظفون المنتهية عقودهم' }), 'terminated');
    },
    csv: () => {
      const { terminated } = buildTerminatedData();
      const headers = ['الرقم الوظيفي', 'الاسم', 'القسم', 'الوظيفة', 'الحالة', 'سبب إنهاء العقد'];
      const rows = terminated.map(e => [
        `ID${String(e.empId).padStart(3, '0')}`,
        e.name,
        e.department || '—',
        e.position || '—',
        (e.terminationStatus && e.terminationStatus.type) || '—',
        (e.terminationStatus && e.terminationStatus.reason) || '—'
      ]);
      Exports.exportCSV(Exports.rowsToCSV(headers, rows), 'terminated');
    },
    json: () => {
      const { terminated } = buildTerminatedData();
      Exports.exportJSON({ terminated }, 'terminated_data');
    },
    print: () => window.print()
  });
})();

/* ============ الهيكل التنظيمي ============ */
window.Modules.orgchart = function(container) {
  const db = APP.getDB();
  const employees = db.employeesLog || [];
  
  // الإدارة العليا
  const topManagement = [
    { name: 'مختار عبدالله الحييد', role: 'المدير العام', username: 'admin', salary: 220000, color: '#1e2d4f' },
    { name: 'علي أحمد ديان العطري', role: 'المدير التنفيذي', username: 'executive', salary: 0, color: '#2c3e6d' },
    { name: 'حسين أحمد السعيدي', role: 'رئيس مجلس الإدارة', username: 'chairman', salary: 0, color: '#3a4d7d' }
  ];
  
  // المدراء حسب القسم
  const departments = [
    { name: 'الإنتاج', icon: 'factory', color: '#3a8bd8', manager: 'بشار شكري محمد القدسي', managerId: 68 },
    { name: 'المبيعات', icon: 'truck', color: '#d8463a', manager: 'هاشم عبدالله محمد الجنيدي', managerId: 73 },
    { name: 'المختبر', icon: 'flask', color: '#9c27b0', manager: 'عيسى محمد عبدالرحمن سعيد', managerId: 54 },
    { name: 'المخازن', icon: 'box', color: '#2d9d5c', manager: 'حبيب توفيق مكرد القدسي', managerId: 76 },
    { name: 'الخدمات', icon: 'shield', color: '#e89c2b', manager: 'عبدالله ناصر محمد العزاني', managerId: 86 },
    { name: 'الحسابات', icon: 'money', color: '#5a6b8c', manager: 'أنور سليم محمد الخولاني', managerId: 83 },
    { name: 'المشتريات', icon: 'cart', color: '#00897b', manager: 'صالح علي أحمد الوحيشي', managerId: 72 }
  ];
  
  // حساب الإحصائيات
  const totalEmployees = employees.filter(e => e.status === 'active' || !e.status).length;
  const totalSalary = employees.reduce((s, e) => s + (Number(e.salary) || 0) + (Number(e.allowances) || 0), 0);
  const totalDepartments = departments.length;
  const totalActiveManagers = employees.filter(e => e.position && (e.position.includes('مدير') || e.position.includes('مشرف') || e.position.includes('كيميائي') || e.position.includes('أمين'))).length;

  // تجميع الموظفين حسب القسم
  const deptEmployees = {};
  departments.forEach(d => {
    deptEmployees[d.name] = employees.filter(e => e.department === d.name);
  });


  function render() {
    container.innerHTML = `
      <div class="alert alert-info">
        <span>${Icons.render("info")}</span>
        <span><b>الهيكل التنظيمي</b> - مصنع سيلين للمياه المعدنية والمرطبات - 2026</span>
      </div>

      <!-- إحصائيات سريعة -->
      <div class="kpi-grid" style="grid-template-columns:repeat(auto-fit,minmax(180px,1fr));margin-bottom:24px">
        <div class="kpi-card" style="background:linear-gradient(135deg,var(--primary),var(--primary-dark));color:white">
          <div class="label" style="color:rgba(255,255,255,0.9)">
            <span class="ic" style="color:rgba(255,255,255,0.9)">${Icons.render("users")}</span>
            إجمالي الموظفين
          </div>
          <div class="value" style="color:white">${totalEmployees}</div>
        </div>
        <div class="kpi-card success">
          <div class="label"><span class="ic">${Icons.render("money")}</span>إجمالي الرواتب</div>
          <div class="value" style="font-size:18px">${totalSalary.toLocaleString('ar-EG')}</div>
        </div>
        <div class="kpi-card info">
          <div class="label"><span class="ic">${Icons.render("grid")}</span>الأقسام</div>
          <div class="value">${totalDepartments}</div>
        </div>
        <div class="kpi-card warning">
          <div class="label"><span class="ic">${Icons.render("user")}</span>المدراء</span></div>
          <div class="value">${totalActiveManagers}</div>
        </div>
      </div>

      <!-- الإدارة العليا -->
      <div class="orgchart-section">
        <div class="orgchart-level-title">${Icons.render("shield")} الإدارة العليا</div>
        <div class="orgchart-row orgchart-top">
          ${topManagement.map(p => `
            <div class="orgchart-card orgchart-top-card" style="background:linear-gradient(135deg,${p.color},var(--primary-dark));color:white">
              <div class="org-avatar">${p.name.charAt(0)}</div>
              <div class="org-name">${p.name}</div>
              <div class="org-role">${p.role}</div>
              <div class="org-username">@${p.username}</div>
            </div>
          `).join('')}
        </div>
        <div class="orgchart-connector-vertical"></div>
      </div>

      <!-- المدراء -->
      <div class="orgchart-section">
        <div class="orgchart-level-title">${Icons.render("briefcase")} مدراء الأقسام</div>
        <div class="orgchart-row orgchart-managers">
          ${departments.map(d => {
            const mgr = employees.find(e => e.empId == d.managerId);
            const count = (deptEmployees[d.name] || []).length;
            return `
            <div class="orgchart-card orgchart-manager-card" data-dept="${d.name}" data-action="toggle-dept2" data-dname="${d.name}" style="border-color:${d.color}">
              <div class="org-icon-circle" style="background:${d.color}">${Icons.render(d.icon)}</div>
              <div class="org-name">${d.manager}</div>
              <div class="org-role" style="color:${d.color}">مدير ${d.name}</div>
              <div class="org-stats">
                <span class="org-badge" style="background:${d.color}">${count} موظف</span>
                ${mgr ? `<span class="org-id">ID${String(mgr.empId).padStart(3, '0')}</span>` : ''}
              </div>
            </div>
          `}).join('')}
        </div>
      </div>

      <!-- تفاصيل الأقسام (قابلة للطي) -->
      ${departments.map(d => {
        const team = deptEmployees[d.name] || [];
        const mgr = employees.find(e => e.empId == d.managerId);
        const totalDeptSalary = team.reduce((s, e) => s + (Number(e.salary) || 0) + (Number(e.allowances) || 0), 0);
        return `
          <div class="card orgchart-dept-card" id="dept-${d.name}" style="display:none">
            <div class="header-row" style="display:flex;justify-content:space-between;align-items:center">
              <h3 style="color:${d.color}">${Icons.render(d.icon)} فريق ${d.name}</h3>
              <div>
                <span class="badge" style="background:${d.color};color:white">${team.length} موظف</span>
                <span class="badge badge-info" style="margin-right:8px">إجمالي: ${totalDeptSalary.toLocaleString('ar-EG')} ر.ي</span>
              </div>
            </div>
            ${mgr ? `
              <div class="orgchart-manager-info">
                <div class="orgchart-manager-avatar" style="background:${d.color}">${mgr.name.charAt(0)}</div>
                <div>
                  <div style="font-weight:bold;font-size:16px">${mgr.name}</div>
                  <div class="text-muted" style="font-size:13px">${mgr.position} • ID${String(mgr.empId).padStart(3, '0')} • ${(mgr.salary || 0).toLocaleString('ar-EG')} ر.ي</div>
                </div>
              </div>
            ` : ''}
            <table class="data-table" style="margin-top:12px">
              <thead>
                <tr>
                  <th>الرقم الوظيفي</th>
                  <th>الاسم</th>
                  <th>الوظيفة</th>
                  <th>تاريخ التعيين</th>
                  <th>الراتب</th>
                  <th>البدلات</th>
                  <th>الإجمالي</th>
                </tr>
              </thead>
              <tbody>
                ${mgr ? `<tr style="background:rgba(0,0,0,0.02)">
                  <td data-label="الرقم"><b>ID${String(mgr.empId).padStart(3, '0')}</b> <span class="badge" style="background:${d.color};color:white;font-size:10px">مدير</span></td>
                  <td data-label="الاسم"><b>${mgr.name}</b></td>
                  <td data-label="الوظيفة">${mgr.position}</td>
                  <td data-label="تاريخ التعيين">${mgr.hireDate}</td>
                  <td data-label="الراتب">${(mgr.salary || 0).toLocaleString('ar-EG')}</td>
                  <td data-label="البدلات">${(mgr.allowances || 0).toLocaleString('ar-EG')}</td>
                  <td data-label="الإجمالي"><b style="color:${d.color}">${((mgr.salary || 0) + (mgr.allowances || 0)).toLocaleString('ar-EG')}</b></td>
                </tr>` : ''}
                ${team.filter(e => e.empId != d.managerId).map(e => `
                  <tr>
                    <td data-label="الرقم">ID${String(e.empId).padStart(3, '0')}</td>
                    <td data-label="الاسم">${e.name}</td>
                    <td data-label="الوظيفة">${e.position}</td>
                    <td data-label="تاريخ التعيين">${e.hireDate}</td>
                    <td data-label="الراتب">${(e.salary || 0).toLocaleString('ar-EG')}</td>
                    <td data-label="البدلات">${(e.allowances || 0).toLocaleString('ar-EG')}</td>
                    <td data-label="الإجمالي"><b>${((e.salary || 0) + (e.allowances || 0)).toLocaleString('ar-EG')}</b></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;
      }).join('')}

      <!-- التصدير -->
      <div class="card" style="text-align:center">
        <h3>${Icons.render("download")} تصدير الهيكل التنظيمي</h3>
        <div class="btn-row" style="justify-content:center">
          <button class="btn btn-primary" data-action="orgchart-pdf">${Icons.render("pdf")} تصدير PDF</button>
          <button class="btn btn-success" data-action="orgchart-print">${Icons.render("print")} طباعة</button>
          <button class="btn btn-secondary" data-action="expand-all-depts">${Icons.render("grid")} عرض كل الأقسام</button>
          <button class="btn btn-secondary" data-action="collapse-all-depts">${Icons.render("x")} إخفاء الكل</button>
        </div>
      </div>
    `;
  }

  // Toggle department details
  Modules._toggleDept = function(deptName) {
    const card = document.getElementById('dept-' + deptName);
    if (card) {
      card.style.display = card.style.display === 'none' ? 'block' : 'none';
    }
  };

  Modules._expandAllDepts = function() {
    departments.forEach(d => {
      const card = document.getElementById('dept-' + d.name);
      if (card) card.style.display = 'block';
    });
  };

  Modules._collapseAllDepts = function() {
    departments.forEach(d => {
      const card = document.getElementById('dept-' + d.name);
      if (card) card.style.display = 'none';
    });
  };

  Modules._exportOrgChart = function(type) {
    if (type === 'pdf') {
      const headers = ['القسم', 'المدير', 'الرقم الوظيفي', 'عدد الموظفين', 'إجمالي الرواتب'];
      const rows = departments.map(d => {
        const team = deptEmployees[d.name] || [];
        const total = team.reduce((s, e) => s + (Number(e.salary) || 0) + (Number(e.allowances) || 0), 0);
        return [d.name, d.manager, `ID${String(d.managerId).padStart(3, '0')}`, team.length, total.toLocaleString('ar-EG')];
      });
      const html = Exports.rowsToHTMLTable(headers, rows, { title: 'الهيكل التنظيمي - مصنع سيلين' });
      Exports.exportPDF('الهيكل التنظيمي', html, 'orgchart');
    } else if (type === 'print') {
      Modules._expandAllDepts();
      setTimeout(() => window.print(), 500);
    }
  };

  Exports.register('orgchart', {
    label: 'الهيكل التنظيمي',
    pdf: () => Modules._exportOrgChart('pdf'),
    excel: () => {
      const headers = ['القسم', 'المدير', 'الرقم الوظيفي', 'عدد الموظفين'];
      const rows = departments.map(d => {
        const team = deptEmployees[d.name] || [];
        return [d.name, d.manager, `ID${String(d.managerId).padStart(3, '0')}`, team.length];
      });
      Exports.exportExcel(Exports.rowsToHTMLTable(headers, rows, { title: 'الهيكل التنظيمي' }), 'orgchart');
    },
    csv: () => {
      const headers = ['القسم', 'المدير', 'الرقم الوظيفي', 'عدد الموظفين'];
      const rows = departments.map(d => {
        const team = deptEmployees[d.name] || [];
        return [d.name, d.manager, `ID${String(d.managerId).padStart(3, '0')}`, team.length];
      });
      Exports.exportCSV(Exports.rowsToCSV(headers, rows), 'orgchart');
    },
    json: () => Exports.exportJSON({ orgchart: departments, employees: employees }, 'orgchart_data'),
    print: () => Modules._exportOrgChart('print')
  });

  render();
};

/* ============ الشجرة التفاعلية ============ */
window.Modules.orgtree = function(container) {
  const db = APP.getDB();
  const employees = db.employeesLog || [];

  // ألوان الأقسام
  const deptColors = {
    'الإدارة': '#1e2d4f',
    'الموارد البشرية': '#5a6b8c',
    'الإنتاج': '#3a8bd8',
    'المبيعات': '#d8463a',
    'المختبر': '#9c27b0',
    'المخازن': '#2d9d5c',
    'مخازن البيضاء': '#7cb342',
    'الخدمات': '#e89c2b',
    'العلاقات العامة': '#f57c00',
    'الحسابات': '#455a64',
    'المشتريات': '#00897b',
    'الأمن': '#616161',
    'المالية': '#7b1fa2'
  };
  const getColor = dept => deptColors[dept] || '#607d8b';

  // بناء الشجرة من البيانات الفعلية
  function buildTree() {
    // الإدارة العليا (3): من جدول المستخدمين (admin/executive/chairman)
    const users = db.users || [];
    const topRoles = ['admin', 'executive', 'chairman'];
    const topUserRecords = users.filter(u => topRoles.includes((u.role || '').toLowerCase()));
    // ربط كل حساب إداري عالي بسجل الموظف المقابل (employeeId)
    const top = topUserRecords.map(u => {
      const emp = u.employeeId ? employees.find(e => e.id === u.employeeId) : null;
      return emp ? { ...emp, _topRole: u.role, _topName: u.name, _topUsername: u.username }
                 : { id: 'u_' + u.id, name: u.name, position: u.role, empId: u.empId,
                     department: u.department, salary: 0, _topRole: u.role, _topName: u.name, _topUsername: u.username };
    });
    
    // المدراء
    const managerRoles = ['مدير', 'مشرف', 'كيميائي', 'أمين', 'محاسب'];
    const managers = employees.filter(e => e.position && managerRoles.some(r => e.position.includes(r)) && e.position !== 'مدير شؤون الموظفين');
    
    // الموظفون العاديون
    const regulars = employees.filter(e => !managers.includes(e) && !top.some(t => t.id === e.id));
    
    // بناء عقد الشجرة
    const nodes = [];
    const links = [];
    
    // العقد الجذرية
    const topNodeIds = [];
    top.forEach((p, i) => {
      const nodeId = 'top_' + (typeof p.id === 'number' ? p.id : p._topUsername || i);
      topNodeIds.push(nodeId);
      nodes.push({
        id: nodeId,
        name: p.name,
        role: p.position,
        empId: p.empId,
        salary: p.salary,
        department: p.department,
        level: 0,
        type: 'top',
        raw: p
      });
    });
    
    // العقد الوسيطة (المدراء)
    managers.forEach(m => {
      const node = {
        id: 'mgr_' + m.id,
        name: m.name,
        role: m.position,
        empId: m.empId,
        salary: m.salary,
        department: m.department,
        level: 1,
        type: 'manager',
        raw: m,
        children: []
      };
      nodes.push(node);
      
      // ربط بأعلى مستوى إداري (الموزع على عقد top بالتناوب)
      if (topNodeIds.length) {
        const parentId = topNodeIds[managers.indexOf(m) % topNodeIds.length];
        links.push({ source: parentId, target: node.id });
      }
      
      // ربط الموظفين بالمدراء — managerId هو رقم الموظف الداخلي، و m.id كذلك
      const teamMembers = regulars.filter(e => Number(e.managerId) === Number(m.id));
      teamMembers.forEach(tm => {
        const child = {
          id: 'emp_' + tm.id,
          name: tm.name,
          role: tm.position,
          empId: tm.empId,
          salary: tm.salary,
          allowances: tm.allowances,
          department: tm.department,
          level: 2,
          type: 'employee',
          raw: tm
        };
        nodes.push(child);
        links.push({ source: node.id, target: child.id });
        node.children.push(child.id);
      });
    });
    
    return { nodes, links };
  }
  
  const tree = buildTree();
  
  // حالة الشجرة
  const state = {
    zoom: 1,
    panX: 0,
    panY: 0,
    selectedNode: null,
    filter: '',
    expanded: new Set(), // العقد المطوية
    hoveredNode: null
  };
  
  // توسيع/طي افتراضي: فقط الإدارة العليا
  tree.nodes.forEach(n => {
    if (n.type === 'top') state.expanded.add(n.id);
  });
  
  // حساب موضع كل عقدة
  function layoutTree() {
    const levels = {};
    tree.nodes.forEach(n => {
      if (!levels[n.level]) levels[n.level] = [];
      levels[n.level].push(n);
    });
    
    const HORIZONTAL_GAP = 240;
    const VERTICAL_GAP = 100;
    const positions = {};
    
    // المستوى 0 (الإدارة العليا) - 3 عقد في المنتصف
    if (levels[0]) {
      const topW = levels[0].length * HORIZONTAL_GAP;
      levels[0].forEach((n, i) => {
        positions[n.id] = {
          x: (i - (levels[0].length - 1) / 2) * HORIZONTAL_GAP,
          y: 0
        };
      });
    }
    
    // المستوى 1 (المدراء) - تحت الإدارة
    if (levels[1]) {
      const mgrW = levels[1].length * HORIZONTAL_GAP;
      levels[1].forEach((n, i) => {
        positions[n.id] = {
          x: (i - (levels[1].length - 1) / 2) * HORIZONTAL_GAP,
          y: VERTICAL_GAP * 2
        };
      });
    }
    
    // المستوى 2 (الموظفون) - تحت المدراء
    if (levels[2]) {
      const childGroups = {};
      levels[2].forEach(n => {
        const link = tree.links.find(l => l.target === n.id);
        if (link) {
          if (!childGroups[link.source]) childGroups[link.source] = [];
          childGroups[link.source].push(n);
        }
      });
      
      Object.keys(childGroups).forEach(mgrId => {
        const mgrPos = positions[mgrId];
        const children = childGroups[mgrId];
        const childW = (children.length - 1) * 130;
        children.forEach((n, i) => {
          positions[n.id] = {
            x: mgrPos.x + (i * 130) - childW / 2,
            y: mgrPos.y + VERTICAL_GAP * 3
          };
        });
      });
    }
    
    return positions;
  }
  
  const positions = layoutTree();
  
  // رسم الشجرة

  function render() {
    const filtered = state.filter
      ? tree.nodes.filter(n => {
          const q = state.filter.toLowerCase();
          return n.name.toLowerCase().includes(q) || 
                 String(n.empId).includes(q) || 
                 (n.department || '').toLowerCase().includes(q) ||
                 (n.role || '').toLowerCase().includes(q);
        })
      : tree.nodes;
    
    const visibleIds = new Set(filtered.map(n => n.id));
    // إظهار الأبناء دائماً
    filtered.forEach(n => {
      tree.links.forEach(l => {
        if (l.target === n.id) visibleIds.add(l.source);
        if (l.source === n.id) visibleIds.add(l.target);
      });
    });
    
    container.innerHTML = `
      <div class="alert alert-info">
        <span>${Icons.render("sitemap")}</span>
        <span><b>الشجرة التفاعلية</b> - اسحب للتنقل • استخدم العجلة للتكبير • انقر على أي عقدة للتفاصيل</span>
      </div>

      <div class="orgtree-toolbar">
        <div class="orgtree-search">
          <span class="ic">${Icons.render("search")}</span>
          <input type="text" id="orgtreeSearch" placeholder="ابحث بالاسم أو الرقم الوظيفي أو القسم..." value="${state.filter}">
        </div>
        <div class="orgtree-controls">
          <button class="btn btn-icon" data-action="orgtree-zoom-in" title="تكبير">${Icons.render("plus")}</button>
          <button class="btn btn-icon" data-action="orgtree-zoom-out" title="تصغير">${Icons.render("minus")}</button>
          <button class="btn btn-icon" data-action="orgtree-reset" title="إعادة الضبط">${Icons.render("refresh")}</button>
          <button class="btn btn-icon" data-action="orgtree-fit" title="ملائمة الشاشة">${Icons.render("maximize")}</button>
        </div>
      </div>

      <div class="orgtree-layout">
        <div class="orgtree-canvas-wrap" id="orgtreeCanvasWrap">
          <svg class="orgtree-svg" id="orgtreeSvg">
            <defs>
              <pattern id="dotGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="#cdd5e0" opacity="0.4"/>
              </pattern>
              <marker id="arrowhead" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                <path d="M0,0 L0,8 L8,4 z" fill="#94a3b8"/>
              </marker>
            </defs>
            <rect class="orgtree-grid" width="100%" height="100%" fill="url(#dotGrid)"/>
            <g class="orgtree-content" id="orgtreeContent">
              <!-- Links -->
              <g class="orgtree-links">
                ${tree.links.map(l => {
                  const sourceVisible = visibleIds.has(l.source);
                  const targetVisible = visibleIds.has(l.target);
                  if (!sourceVisible || !targetVisible) return '';
                  const sp = positions[l.source];
                  const tp = positions[l.target];
                  if (!sp || !tp) return '';
                  return `<path class="orgtree-link" data-from="${l.source}" data-to="${l.target}" d="M ${sp.x} ${sp.y} C ${sp.x} ${sp.y + 50}, ${tp.x} ${tp.y - 50}, ${tp.x} ${tp.y}" stroke="#94a3b8" stroke-width="2" fill="none" opacity="0.6"/>`;
                }).join('')}
              </g>
              <!-- Nodes -->
              <g class="orgtree-nodes">
                ${filtered.map(n => {
                  const p = positions[n.id];
                  if (!p) return '';
                  const color = getColor(n.department);
                  const isExpanded = state.expanded.has(n.id);
                  return `
                    <g class="orgtree-node" data-id="${n.id}" transform="translate(${p.x},${p.y})" data-action="orgtree-select" data-nid="${n.id}">
                      <rect class="node-bg" x="-100" y="-30" width="200" height="80" rx="12" 
                        fill="${n.type === 'top' ? '#1e2d4f' : (n.type === 'manager' ? color : 'white')}"
                        stroke="${color}" stroke-width="2"/>
                      <text class="node-avatar" x="0" y="2" text-anchor="middle" 
                        font-size="24" font-weight="bold"
                        fill="${n.type === 'employee' ? color : 'white'}">
                        ${n.name.charAt(0)}
                      </text>
                      <text class="node-name" x="55" y="-8" text-anchor="start" 
                        font-size="13" font-weight="600"
                        fill="${n.type === 'employee' ? '#1e2d4f' : 'white'}">
                        ${n.name.length > 18 ? n.name.slice(0, 16) + '…' : n.name}
                      </text>
                      <text class="node-role" x="55" y="10" text-anchor="start" 
                        font-size="10"
                        fill="${n.type === 'employee' ? '#5a6b8c' : 'rgba(255,255,255,0.8)'}">
                        ${n.role}
                      </text>
                      <text class="node-id" x="55" y="26" text-anchor="start" 
                        font-size="9" font-weight="700"
                        fill="${n.type === 'employee' ? color : 'rgba(255,255,255,0.7)'}">
                        ID${String(n.empId).padStart(3, '0')}
                      </text>
                      <circle class="node-toggle" cx="100" cy="-30" r="10" 
                        fill="${n.type === 'top' ? color : '#1e2d4f'}" 
                        stroke="white" stroke-width="2"
                        opacity="${tree.links.filter(l => l.source === n.id).length ? 1 : 0}"/>
                      <text class="node-toggle-text" x="100" y="-26" text-anchor="middle" 
                        font-size="12" font-weight="bold" fill="white"
                        opacity="${tree.links.filter(l => l.source === n.id).length ? 1 : 0}">${isExpanded ? '−' : '+'}</text>
                    </g>
                  `;
                }).join('')}
              </g>
            </g>
          </svg>
          <div class="orgtree-zoom-info" id="orgtreeZoomInfo">${Math.round(state.zoom * 100)}%</div>
        </div>
        <div class="orgtree-sidebar" id="orgtreeSidebar">
          <div class="orgtree-sidebar-empty">
            <span>${Icons.render("user")}</span>
            <h3>انقر على موظف لعرض تفاصيله</h3>
            <p>يمكنك التكبير/التصغير، السحب، والبحث في الشجرة</p>
            <div class="orgtree-stats">
              <div class="orgtree-stat"><b>${tree.nodes.length}</b><span>إجمالي العقد</span></div>
              <div class="orgtree-stat"><b>${tree.links.length}</b><span>الروابط</span></div>
              <div class="orgtree-stat"><b>${tree.nodes.filter(n => n.type === 'manager').length}</b><span>المدراء</span></div>
              <div class="orgtree-stat"><b>${tree.nodes.filter(n => n.type === 'employee').length}</b><span>الموظفون</span></div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // تطبيق التحويلات
    applyTransform();
    
    // ربط البحث
    const searchInput = document.getElementById('orgtreeSearch');
    if (searchInput) {
      searchInput.addEventListener('input', e => {
        state.filter = e.target.value;
        render();
      });
    }
    
    // ربط Pan/Zoom
    setupPanZoom();
  }
  
  function applyTransform() {
    const content = document.getElementById('orgtreeContent');
    if (content) {
      content.setAttribute('transform', `translate(${state.panX},${state.panY}) scale(${state.zoom})`);
    }
    const info = document.getElementById('orgtreeZoomInfo');
    if (info) info.textContent = Math.round(state.zoom * 100) + '%';
  }
  
  function setupPanZoom() {
    const wrap = document.getElementById('orgtreeCanvasWrap');
    if (!wrap) return;
    
    let isPanning = false;
    let startX, startY;
    
    wrap.addEventListener('mousedown', e => {
      if (e.target.closest('.orgtree-node')) return;
      isPanning = true;
      startX = e.clientX - state.panX;
      startY = e.clientY - state.panY;
      wrap.style.cursor = 'grabbing';
    });
    
    wrap.addEventListener('mousemove', e => {
      if (!isPanning) return;
      state.panX = e.clientX - startX;
      state.panY = e.clientY - startY;
      applyTransform();
    });
    
    wrap.addEventListener('mouseup', () => {
      isPanning = false;
      wrap.style.cursor = 'grab';
    });
    
    wrap.addEventListener('mouseleave', () => {
      isPanning = false;
      wrap.style.cursor = 'grab';
    });
    
    wrap.addEventListener('wheel', e => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      state.zoom = Math.max(0.3, Math.min(2.5, state.zoom + delta));
      applyTransform();
    }, { passive: false });
    
    // Touch support
    let lastTouchDist = 0;
    wrap.addEventListener('touchstart', e => {
      if (e.touches.length === 2) {
        lastTouchDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      } else if (e.touches.length === 1) {
        isPanning = true;
        startX = e.touches[0].clientX - state.panX;
        startY = e.touches[0].clientY - state.panY;
      }
    });
    
    wrap.addEventListener('touchmove', e => {
      if (e.touches.length === 2) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const delta = (dist - lastTouchDist) * 0.01;
        state.zoom = Math.max(0.3, Math.min(2.5, state.zoom + delta));
        lastTouchDist = dist;
        applyTransform();
        e.preventDefault();
      } else if (e.touches.length === 1 && isPanning) {
        state.panX = e.touches[0].clientX - startX;
        state.panY = e.touches[0].clientY - startY;
        applyTransform();
        e.preventDefault();
      }
    }, { passive: false });
    
    wrap.addEventListener('touchend', () => { isPanning = false; });
  }
  
  Modules._orgtreeSelect = function(nodeId) {
    const node = tree.nodes.find(n => n.id === nodeId);
    if (!node) return;
    
    // التبديل بين التوسيع والطي عند النقر على الدائرة
    const hasChildren = tree.links.some(l => l.source === nodeId);
    if (hasChildren) {
      // نقر على الدائرة فقط يطوي/يوسع
      // لكن للنقر على العقدة نعرض التفاصيل
    }
    
    state.selectedNode = node;
    const sidebar = document.getElementById('orgtreeSidebar');
    if (!sidebar) return;
    
    const color = getColor(node.department);
    const photo = node.raw.photo 
      ? `<img src="${node.raw.photo}" class="orgtree-photo"/>`
      : `<div class="orgtree-photo-placeholder" style="background:${color}">${node.name.charAt(0)}</div>`;
    
    sidebar.innerHTML = `
      <div class="orgtree-detail" style="--dept-color:${color}">
        <div class="orgtree-detail-header" style="background:linear-gradient(135deg,${color},${color}cc)">
          ${photo}
          <h3>${node.name}</h3>
          <div class="orgtree-detail-role">${node.role}</div>
        </div>
        <div class="orgtree-detail-body">
          <div class="orgtree-detail-row">
            <span class="orgtree-detail-label">${Icons.render("id-card")} الرقم الوظيفي</span>
            <span class="orgtree-detail-value"><b>ID${String(node.empId).padStart(3, '0')}</b></span>
          </div>
          <div class="orgtree-detail-row">
            <span class="orgtree-detail-label">${Icons.render("grid")} القسم</span>
            <span class="orgtree-detail-value">${node.department || '-'}</span>
          </div>
          <div class="orgtree-detail-row">
            <span class="orgtree-detail-label">${Icons.render("calendar")} تاريخ التعيين</span>
            <span class="orgtree-detail-value">${node.raw.hireDate || '-'}</span>
          </div>
          ${node.salary ? `
            <div class="orgtree-detail-row">
              <span class="orgtree-detail-label">${Icons.render("money")} الراتب الأساسي</span>
              <span class="orgtree-detail-value"><b>${Number(node.salary).toLocaleString('ar-EG')} ر.ي</b></span>
            </div>
          ` : ''}
          ${node.allowances ? `
            <div class="orgtree-detail-row">
              <span class="orgtree-detail-label">${Icons.render("money")} البدلات</span>
              <span class="orgtree-detail-value">${Number(node.allowances).toLocaleString('ar-EG')} ر.ي</span>
            </div>
          ` : ''}
          ${node.salary || node.allowances ? `
            <div class="orgtree-detail-row" style="background:rgba(0,0,0,0.05);font-weight:700">
              <span class="orgtree-detail-label">${Icons.render("calculator")} الإجمالي</span>
              <span class="orgtree-detail-value" style="color:${color}">${(Number(node.salary||0) + Number(node.allowances||0)).toLocaleString('ar-EG')} ر.ي</span>
            </div>
          ` : ''}
          ${node.type !== 'top' ? `
            <div class="orgtree-detail-row">
              <span class="orgtree-detail-label">${Icons.render("user")} اسم الدخول</span>
              <span class="orgtree-detail-value" style="font-family:monospace">ID${String(node.empId).padStart(3, '0')}</span>
            </div>
          ` : ''}
          ${hasChildren ? `
            <div class="orgtree-detail-row">
              <span class="orgtree-detail-label">${Icons.render("users")} الفريق</span>
              <span class="orgtree-detail-value">${tree.links.filter(l => l.source === nodeId).length} أعضاء</span>
            </div>
            <button class="btn btn-primary" style="width:100%;margin-top:8px" data-action="orgtree-toggle" data-nid2="${nodeId}">
              ${state.expanded.has(nodeId) ? Icons.render("minus") + ' طي الفريق' : Icons.render("plus") + ' توسيع الفريق'}
            </button>
          ` : ''}
        </div>
      </div>
    `;
  };
  
  Modules._orgtreeToggle = function(nodeId) {
    if (state.expanded.has(nodeId)) state.expanded.delete(nodeId);
    else state.expanded.add(nodeId);
    render();
    Modules._orgtreeSelect(nodeId);
  };
  
  Modules._orgtreeZoom = function(delta) {
    state.zoom = Math.max(0.3, Math.min(2.5, state.zoom + delta));
    applyTransform();
  };
  
  Modules._orgtreeReset = function() {
    state.zoom = 1;
    state.panX = 0;
    state.panY = 0;
    applyTransform();
  };
  
  Modules._orgtreeFit = function() {
    const wrap = document.getElementById('orgtreeCanvasWrap');
    if (!wrap) return;
    const rect = wrap.getBoundingClientRect();

    // حساب حدود الشجرة
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    Object.values(positions).forEach(p => {
      minX = Math.min(minX, p.x - 100);
      maxX = Math.max(maxX, p.x + 100);
      minY = Math.min(minY, p.y - 30);
      maxY = Math.max(maxY, p.y + 50);
    });

    const w = maxX - minX;
    const h = maxY - minY;
    if (w <= 0 || h <= 0) return;
    const scaleX = (rect.width - 60) / w;
    const scaleY = (rect.height - 60) / h;
    state.zoom = Math.max(0.3, Math.min(scaleX, scaleY, 1.5));
    // توسيط الشجرة في وسط الـ canvas (وليس في الزاوية العليا اليسرى)
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    state.panX = rect.width / 2 - cx * state.zoom;
    state.panY = rect.height / 2 - cy * state.zoom;
    applyTransform();
  };
  
  // تصدير
  Exports.register('orgtree', {
    label: 'الشجرة التفاعلية',
    pdf: () => {
      const html = Modules.orgtree._exportHTML();
      Exports.exportPDF('الشجرة التفاعلية', html, 'orgtree');
    },
    excel: () => {
      const headers = ['الاسم', 'الرقم الوظيفي', 'الوظيفة', 'القسم', 'الراتب'];
      const rows = tree.nodes.map(n => [n.name, `ID${String(n.empId).padStart(3, '0')}`, n.role, n.department, n.salary || 0]);
      Exports.exportExcel(Exports.rowsToHTMLTable(headers, rows, { title: 'الشجرة التفاعلية' }), 'orgtree');
    },
    csv: () => {
      const headers = ['الاسم', 'الرقم الوظيفي', 'الوظيفة', 'القسم', 'الراتب'];
      const rows = tree.nodes.map(n => [n.name, `ID${String(n.empId).padStart(3, '0')}`, n.role, n.department, n.salary || 0]);
      Exports.exportCSV(Exports.rowsToCSV(headers, rows), 'orgtree');
    },
    json: () => Exports.exportJSON(tree, 'orgtree_data'),
    print: () => window.print()
  });
  
  Modules.orgtree._exportHTML = function() {
    return `
      <h2>الشجرة التفاعلية - مصنع سيلين</h2>
      <p>التاريخ: ${new Date().toLocaleDateString('ar-EG')}</p>
      <table>
        <thead><tr><th>الاسم</th><th>الرقم الوظيفي</th><th>الوظيفة</th><th>القسم</th><th>الراتب</th></tr></thead>
        <tbody>
          ${tree.nodes.map(n => `<tr><td>${n.name}</td><td>ID${String(n.empId).padStart(3, '0')}</td><td>${n.role}</td><td>${n.department}</td><td>${(n.salary||0).toLocaleString('ar-EG')}</td></tr>`).join('')}
        </tbody>
      </table>
    `;
  };

  render();
  // ضبط الشجرة على الشاشة بعد أول رسم
  setTimeout(() => Modules._orgtreeFit && Modules._orgtreeFit(), 50);
};

/* ============ الإعدادات ============ */
window.Modules.developer = window.Modules.settings = function(container) {
  const db = APP.getDB();
  const isAdmin = APP.getCurrentUser() && APP.getCurrentUser().role === 'admin';
  if (!isAdmin) {
    container.innerHTML = '<div class="alert alert-danger">⛔ هذه الصفحة متاحة لمدير النظام فقط</div>';
    return;
  }

  Exports.register("settings", {
    label: "إعدادات النظام",
    pdf: () => window.print(),
    excel: () => Exports.exportJSON(db, "full_database_backup"),
    csv: () => Exports.exportJSON(db, "full_database_backup"),
    json: () => Exports.exportJSON(db, "full_database_backup"),
    print: () => window.print()
  });

  function saveDevSettings(key, value) {
    const db = APP.getDB();
    if (!db.devSettings) db.devSettings = {};
    db.devSettings[key] = value;
    APP.saveDB(db);
  }

  function getDevSettings() {
    const db = APP.getDB();
    if (!db.devSettings) db.devSettings = {};
    return db.devSettings;
  }

  function render() {
    const dev = getDevSettings();
    container.innerHTML = `
      <div class="alert alert-info">
        <span>${Icons.render("settings")}</span>
        <span><b>لوحة المطور</b> — تحكم كامل في تصميم ووظائف المنصة. كل التغييرات تُحفظ في localStorage وتظهر فوراً.</span>
      </div>

      <!-- أدوات المطور -->
      <div class="card" style="background:linear-gradient(135deg, var(--bg-card), var(--bg-darker));border:2px solid var(--primary)">
        <h3>${Icons.render("settings")} أدوات المطور</h3>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px">
          <div class="dev-tool-card" data-action="dev-tab" data-tab="menus">
            <div class="dev-tool-icon">${Icons.render("list")}</div>
            <div class="dev-tool-label">إدارة القوائم</div>
            <div class="dev-tool-desc">إضافة/تعديل/حذف عناصر التنقل</div>
          </div>
          <div class="dev-tool-card" data-action="dev-tab2" data-tab2="pages">
            <div class="dev-tool-icon">${Icons.render("fileText")}</div>
            <div class="dev-tool-label">إضافة صفحات</div>
            <div class="dev-tool-desc">صفحات HTML مخصصة برابط خاص</div>
          </div>
          <div class="dev-tool-card" data-action="dev-tab2" data-tab2="theme">
            <div class="dev-tool-icon">${Icons.render("palette")}</div>
            <div class="dev-tool-label">الثيم والألوان</div>
            <div class="dev-tool-desc">تخصيص هوية المنصة</div>
          </div>
          <div class="dev-tool-card" data-action="dev-tab2" data-tab2="fields">
            <div class="dev-tool-icon">${Icons.render("database")}</div>
            <div class="dev-tool-label">حقول مخصصة</div>
            <div class="dev-tool-desc">إضافة حقول للموظفين/المستخدمين</div>
          </div>
          <div class="dev-tool-card" data-action="dev-tab2" data-tab2="links">
            <div class="dev-tool-icon">${Icons.render("link")}</div>
            <div class="dev-tool-label">روابط وصور</div>
            <div class="dev-tool-desc">أزرار انتقالية لصفحات/روابط</div>
          </div>
          <div class="dev-tool-card" data-action="dev-tab2" data-tab2="backup">
            <div class="dev-tool-icon">${Icons.render("save")}</div>
            <div class="dev-tool-label">النسخ الاحتياطي</div>
            <div class="dev-tool-desc">تصدير/استيراد البيانات</div>
          </div>
          <div class="dev-tool-card" data-action="dev-tab2" data-tab2="danger">
            <div class="dev-tool-icon">${Icons.render("alert")}</div>
            <div class="dev-tool-label">منطقة الخطر</div>
            <div class="dev-tool-desc">إعادة ضبط وإجراءات حساسة</div>
          </div>
        </div>
      </div>

      <div id="devTabContent"></div>

      <!-- Edit Menu Modal -->
      <div id="editMenuModal" class="modal-overlay" style="display:none">
        <div class="modal-card" style="max-width:500px">
          <div class="modal-header">
            <h3>${Icons.render("edit")} تعديل عنصر قائمة</h3>
            <button class="btn btn-sm" data-action="modal-close2">${Icons.render("x")}</button>
          </div>
          <div class="modal-body">
            <form id="editMenuForm">
              <input type="hidden" id="edit_menu_idx" />
              <div class="form-group"><label>المعرف (id) *</label><input type="text" id="edit_menu_id" required /></div>
              <div class="form-group"><label>الاسم المعروض (label) *</label><input type="text" id="edit_menu_label" required /></div>
              <div class="form-group"><label>المجموعة (group)</label><input type="text" id="edit_menu_group" /></div>
              <div class="form-group"><label>الأيقونة (icon name)</label><input type="text" id="edit_menu_icon" placeholder="مثل: settings, users, cart" /></div>
              <div class="form-group"><label>الصلاحيات (roles - افصل بفاصلة)</label><input type="text" id="edit_menu_roles" placeholder="admin, hr_manager" /></div>
              <div class="form-group"><label>ترتيب (order)</label><input type="number" id="edit_menu_order" value="100" /></div>
            </form>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" data-action="modal-close2">إلغاء</button>
            <button class="btn btn-primary" data-action="dev-save-menu">حفظ</button>
          </div>
        </div>
      </div>

      <!-- Add Page Modal -->
      <div id="addPageModal" class="modal-overlay" style="display:none">
        <div class="modal-card" style="max-width:600px">
          <div class="modal-header">
            <h3>${Icons.render("plus")} إضافة صفحة مخصصة</h3>
            <button class="btn btn-sm" data-action="modal-close2">${Icons.render("x")}</button>
          </div>
          <div class="modal-body">
            <form id="addPageForm">
              <div class="form-group"><label>معرف الصفحة (id) *</label><input type="text" id="newpage_id" required placeholder="مثال: myCustomPage" /></div>
              <div class="form-group"><label>الاسم المعروض *</label><input type="text" id="newpage_label" required /></div>
              <div class="form-group"><label>المجموعة</label><input type="text" id="newpage_group" value="مخصص" /></div>
              <div class="form-group"><label>الأيقونة</label><input type="text" id="newpage_icon" value="fileText" /></div>
              <div class="form-group"><label>المحتوى (HTML)</label><textarea id="newpage_html" rows="8" style="font-family:monospace" placeholder="<h2>عنوان صفحتي</h2><p>محتوى مخصص</p>"></textarea></div>
            </form>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" data-action="modal-close2">إلغاء</button>
            <button class="btn btn-primary" data-action="dev-save-page">حفظ وإضافة للقائمة</button>
          </div>
        </div>
      </div>
    `;
    
    // عرض التبويب الافتراضي
    Modules._dev_showTab('menus');
  }

  // ============ أدوات المطور ============
  
  Modules._dev_showTab = function(tab) {
    document.querySelectorAll('.dev-tool-card').forEach(c => c.classList.remove('active'));
    // mark current (find by onclick)
    const content = document.getElementById('devTabContent');
    if (!content) return;
    
    if (tab === 'menus') {
      content.innerHTML = renderMenusTab();
    } else if (tab === 'pages') {
      content.innerHTML = renderPagesTab();
    } else if (tab === 'theme') {
      content.innerHTML = renderThemeTab();
    } else if (tab === 'fields') {
      content.innerHTML = renderFieldsTab();
    } else if (tab === 'links') {
      content.innerHTML = renderLinksTab();
    } else if (tab === 'backup') {
      content.innerHTML = renderBackupTab();
    } else if (tab === 'danger') {
      content.innerHTML = renderDangerTab();
    }
  };

  function renderMenusTab() {
    const db = APP.getDB();
    if (!db.customMenus) db.customMenus = [];
    
    const allMenus = (db.allModules || getAllModules());
    const standardMenus = [
      {id:'dashboard',label:'لوحة التحكم',group:'الرئيسية',icon:'home',roles:['admin','executive','chairman','accountant','sales'],order:1},
      {id:'hr',label:'الموارد البشرية',group:'الإدارة',icon:'users',roles:['admin','hr_manager'],order:10},
      {id:'orgtree',label:'الشجرة التفاعلية',group:'الإدارة',icon:'gitBranch',roles:['admin','chairman','accountant'],order:11},
      {id:'orgchart',label:'الهيكل التنظيمي',group:'الإدارة',icon:'sitemap',roles:['admin','chairman','accountant'],order:12},
      {id:'settings',label:'المطور',group:'الإدارة',icon:'settings',roles:['admin'],order:99}
    ];
    
    return `
      <div class="card">
        <h3>${Icons.render("list")} القوائم المخصصة (الإضافية)</h3>
        <p class="text-muted" style="margin-bottom:12px">القوائم هنا تُضاف للقائمة الجانبية. كل قائمة لها رابط خاص يفتح صفحة مخصصة.</p>
        <div class="btn-row" style="margin-bottom:14px">
          <button class="btn btn-primary" data-action="dev-add-menu">${Icons.render("plus")} إضافة قائمة جديدة</button>
        </div>
        <table class="data-table">
          <thead><tr><th>المعرف</th><th>الاسم</th><th>المجموعة</th><th>الصلاحيات</th><th>إجراءات</th></tr></thead>
          <tbody>
            ${db.customMenus.length === 0 ? '<tr><td colspan="5" style="text-align:center;color:var(--text-muted)">لا توجد قوائم مخصصة بعد</td></tr>' : db.customMenus.map((m, i) => `
              <tr>
                <td><code>${m.id}</code></td>
                <td>${m.label}</td>
                <td><span class="badge badge-info">${m.group}</span></td>
                <td>${(m.roles || []).join(', ')}</td>
                <td>
                  <button class="btn btn-sm btn-danger" data-action="dev-delete-menu" data-dmi="${i})">${Icons.render("trash")}</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      
      <div class="card">
        <h3>${Icons.render("settings")} القوائم القياسية (لا يمكن تعديلها من هنا، عدّل في app.js)</h3>
        <table class="data-table">
          <thead><tr><th>المعرف</th><th>الاسم</th><th>المجموعة</th><th>الصلاحيات</th></tr></thead>
          <tbody>
            ${standardMenus.map(m => `
              <tr>
                <td><code>${m.id}</code></td>
                <td>${m.label}</td>
                <td><span class="badge badge-info">${m.group}</span></td>
                <td>${m.roles.join(', ')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function renderPagesTab() {
    const db = APP.getDB();
    const pages = (db.customPages || []);
    return `
      <div class="card">
        <h3>${Icons.render("fileText")} الصفحات المخصصة</h3>
        <p class="text-muted" style="margin-bottom:12px">أنشئ صفحات HTML مخصصة واعرضها كأقسام في المنصة.</p>
        <div class="btn-row" style="margin-bottom:14px">
          <button class="btn btn-primary" data-action="dev-show-add-page">${Icons.render("plus")} صفحة جديدة</button>
        </div>
        <table class="data-table">
          <thead><tr><th>المعرف</th><th>الاسم</th><th>المجموعة</th><th>إجراءات</th></tr></thead>
          <tbody>
            ${pages.length === 0 ? '<tr><td colspan="4" style="text-align:center;color:var(--text-muted)">لا توجد صفحات مخصصة بعد</td></tr>' : pages.map((p, i) => `
              <tr>
                <td><code>${p.id}</code></td>
                <td>${p.label}</td>
                <td><span class="badge badge-info">${p.group}</span></td>
                <td>
                  <button class="btn btn-sm" data-action="dev-preview-page" data-pid="'${p.id}')">${Icons.render("eye")}</button>
                  <button class="btn btn-sm btn-danger" data-action="dev-delete-page" data-dpi="${i})">${Icons.render("trash")}</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      <div id="pagePreview" style="display:none"></div>
    `;
  }

  function renderThemeTab() {
    const dev = getDevSettings();
    return `
      <div class="card">
        <h3>${Icons.render("palette")} تخصيص الثيم</h3>
        <form class="form-grid" id="themeForm" onsubmit="event.preventDefault(); Modules._dev_saveTheme();">
          <div class="form-group">
            <label>اللون الأساسي (Primary)</label>
            <input type="color" id="theme_primary" value="${dev.theme_primary || '#1e2d4f'}" />
          </div>
          <div class="form-group">
            <label>لون الخلفية</label>
            <input type="color" id="theme_bg" value="${dev.theme_bg || '#e8edf4'}" />
          </div>
          <div class="form-group">
            <label>لون النص</label>
            <input type="color" id="theme_text" value="${dev.theme_text || '#1e2d4f'}" />
          </div>
          <div class="form-group">
            <label>لون الأزرار (Accent)</label>
            <input type="color" id="theme_accent" value="${dev.theme_accent || '#3b82f6'}" />
          </div>
        </form>
        <div class="btn-row">
          <button class="btn btn-primary" data-action="dev-save-theme">${Icons.render("save")} حفظ وتطبيق</button>
          <button class="btn btn-secondary" data-action="dev-reset-theme">إعادة الافتراضي</button>
        </div>
      </div>
    `;
  }

  function renderFieldsTab() {
    const db = APP.getDB();
    const fields = db.customFields || [];
    return `
      <div class="card">
        <h3>${Icons.render("database")} الحقول المخصصة</h3>
        <p class="text-muted" style="margin-bottom:12px">أضف حقولاً مخصصة (مثل: رقم الهاتف، البريد، تاريخ الميلاد) للموظفين أو المستخدمين.</p>
        <div class="btn-row" style="margin-bottom:14px">
          <button class="btn btn-primary" data-action="dev-add-field">${Icons.render("plus")} حقل جديد</button>
        </div>
        <table class="data-table">
          <thead><tr><th>الاسم</th><th>المفتاح</th><th>النوع</th><th>الجدول</th><th>إجراءات</th></tr></thead>
          <tbody>
            ${fields.length === 0 ? '<tr><td colspan="5" style="text-align:center;color:var(--text-muted)">لا توجد حقول مخصصة</td></tr>' : fields.map((f, i) => `
              <tr>
                <td>${f.label}</td>
                <td><code>${f.key}</code></td>
                <td><span class="badge badge-info">${f.type}</span></td>
                <td><span class="badge">${f.table}</span></td>
                <td><button class="btn btn-sm btn-danger" data-action="dev-delete-field" data-dfi="${i})">${Icons.render("trash")}</button></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function renderLinksTab() {
    const db = APP.getDB();
    const links = db.quickLinks || [];
    return `
      <div class="card">
        <h3>${Icons.render("link")} الروابط السريعة</h3>
        <p class="text-muted" style="margin-bottom:12px">روابط انتقالية لصفحات داخلية أو خارجية. تظهر كأزرار في القوائم أو كأيقونات.</p>
        <div class="btn-row" style="margin-bottom:14px">
          <button class="btn btn-primary" data-action="dev-add-link">${Icons.render("plus")} رابط جديد</button>
        </div>
        <table class="data-table">
          <thead><tr><th>الاسم</th><th>النوع</th><th>الهدف</th><th>إجراءات</th></tr></thead>
          <tbody>
            ${links.length === 0 ? '<tr><td colspan="4" style="text-align:center;color:var(--text-muted)">لا توجد روابط</td></tr>' : links.map((l, i) => `
              <tr>
                <td>${l.label}</td>
                <td><span class="badge badge-info">${l.type}</span></td>
                <td><code style="font-size:11px">${(l.target || '').substring(0, 40)}</code></td>
                <td>
                  <button class="btn btn-sm" data-action="dev-test-link" data-tli="${i})">${Icons.render("eye")}</button>
                  <button class="btn btn-sm btn-danger" data-action="dev-delete-link" data-dli="${i})">${Icons.render("trash")}</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function renderBackupTab() {
    return `
      <div class="card">
        <h3>${Icons.render("save")} النسخ الاحتياطي والاستعادة</h3>
        <div class="btn-row">
          <button class="btn btn-primary" data-action="dev-export-json">${Icons.render("download")} تصدير نسخة احتياطية (JSON)</button>
          <button class="btn btn-secondary" data-action="file-trigger" data-target="restoreFile">${Icons.render("upload")} استعادة من ملف</button>
          <input type="file" id="restoreFile" accept=".json" style="display:none" data-change="restore-file" />
        </div>
        <p class="text-muted" style="margin-top:12px;font-size:13px">النسخ الاحتياطي يحفظ كل بيانات النظام (الموظفين، المستخدمين، الإعدادات، المبيعات، إلخ).</p>
      </div>
    `;
  }

  function renderDangerTab() {
    return `
      <div class="card" style="border:2px solid #dc2626">
        <h3 style="color:#dc2626">${Icons.render("alert")} منطقة الخطر</h3>
        <p class="text-muted" style="margin-bottom:12px">إجراءات حساسة — قد تفقد البيانات. تأكد قبل التنفيذ.</p>
        <div class="btn-row" style="flex-direction:column;align-items:stretch;gap:8px">
          <button class="btn btn-danger" data-action="dev-reset-users">${Icons.render("refresh")} إعادة ضبط أسماء وكلمات مرور المستخدمين الافتراضية</button>
          <button class="btn btn-danger" data-action="dev-clear-custom">حذف كل التخصيصات (القوائم، الصفحات، الحقول)</button>
          <button class="btn btn-danger" data-action="dev-factory-reset">إعادة ضبط المصنع (حذف كل البيانات)</button>
        </div>
      </div>
    `;
  }

  // ============ Actions ============
  
  Modules._dev_addMenu = function() {
    const db = APP.getDB();
    if (!db.customMenus) db.customMenus = [];
    db.customMenus.push({
      id: 'menu_' + Date.now(),
      label: 'قائمة جديدة',
      group: 'مخصص',
      icon: 'fileText',
      roles: ['admin'],
      type: 'custom',
      order: 100
    });
    APP.saveDB(db);
    Modules._dev_showTab('menus');
  };

  Modules._dev_deleteMenu = function(idx) {
    if (!confirm('حذف هذه القائمة؟')) return;
    const db = APP.getDB();
    db.customMenus.splice(idx, 1);
    APP.saveDB(db);
    Modules._dev_showTab('menus');
  };

  Modules._dev_showAddPage = function() {
    document.getElementById('addPageModal').style.display = 'flex';
  };

  Modules._dev_savePage = function() {
    const id = document.getElementById('newpage_id').value.trim();
    const label = document.getElementById('newpage_label').value.trim();
    const group = document.getElementById('newpage_group').value.trim() || 'مخصص';
    const icon = document.getElementById('newpage_icon').value.trim() || 'fileText';
    const html = document.getElementById('newpage_html').value;
    if (!id || !label) { alert('املأ المعرف والاسم'); return; }
    const db = APP.getDB();
    if (!db.customPages) db.customPages = [];
    db.customPages.push({id, label, group, icon, html});
    // أنشئ module مخصص
    if (!window.Modules[id]) {
      window.Modules[id] = function(container) {
        const p = (APP.getDB().customPages || []).find(x => x.id === id);
        if (p) container.innerHTML = '<div class="card"><h3>'+p.label+'</h3>'+p.html+'</div>';
      };
    }
    // أضفه للقائمة
    if (!db.customMenus) db.customMenus = [];
    db.customMenus.push({id, label, group, icon, roles:['admin'], order: 100, type:'page'});
    APP.saveDB(db);
    document.getElementById('addPageModal').style.display = 'none';
    alert('✓ تم إنشاء الصفحة وإضافتها للقائمة');
    Modules._dev_showTab('pages');
    // أعد تحميل القائمة الجانبية
    if (APP.navigate) APP.navigate('settings');
  };

  Modules._dev_deletePage = function(idx) {
    if (!confirm('حذف هذه الصفحة؟')) return;
    const db = APP.getDB();
    const page = db.customPages[idx];
    if (page) {
      delete window.Modules[page.id];
      db.customMenus = (db.customMenus || []).filter(m => m.id !== page.id);
    }
    db.customPages.splice(idx, 1);
    APP.saveDB(db);
    Modules._dev_showTab('pages');
  };

  Modules._dev_previewPage = function(id) {
    const db = APP.getDB();
    const page = (db.customPages || []).find(p => p.id === id);
    if (!page) return;
    const div = document.getElementById('pagePreview');
    div.style.display = 'block';
    div.innerHTML = '<div class="card"><h3>'+page.label+'</h3>'+page.html+'</div>';
    div.scrollIntoView({behavior: 'smooth'});
  };

  Modules._dev_saveTheme = function() {
    const primary = document.getElementById('theme_primary').value;
    const bg = document.getElementById('theme_bg').value;
    const text = document.getElementById('theme_text').value;
    const accent = document.getElementById('theme_accent').value;
    saveDevSettings('theme_primary', primary);
    saveDevSettings('theme_bg', bg);
    saveDevSettings('theme_text', text);
    saveDevSettings('theme_accent', accent);
    // تطبيق CSS
    document.documentElement.style.setProperty('--primary', primary);
    document.documentElement.style.setProperty('--bg', bg);
    document.documentElement.style.setProperty('--text', text);
    document.documentElement.style.setProperty('--accent', accent);
    alert('✓ تم تطبيق الثيم الجديد');
  };

  Modules._dev_resetTheme = function() {
    saveDevSettings('theme_primary', '#1e2d4f');
    saveDevSettings('theme_bg', '#e8edf4');
    saveDevSettings('theme_text', '#1e2d4f');
    saveDevSettings('theme_accent', '#3b82f6');
    document.documentElement.style.setProperty('--primary', '#1e2d4f');
    document.documentElement.style.setProperty('--bg', '#e8edf4');
    document.documentElement.style.setProperty('--text', '#1e2d4f');
    document.documentElement.style.setProperty('--accent', '#3b82f6');
    Modules._dev_showTab('theme');
  };

  Modules._dev_addField = function() {
    const label = prompt('اسم الحقل (يظهر للمستخدم):');
    if (!label) return;
    const key = prompt('المفتاح (لاتيني، مثل phone):', label.replace(/[^a-z0-9]/gi, '_').toLowerCase());
    if (!key) return;
    const type = prompt('النوع: text, number, date, email', 'text') || 'text';
    const table = prompt('الجدول: employees أو users', 'employees') || 'employees';
    const db = APP.getDB();
    if (!db.customFields) db.customFields = [];
    db.customFields.push({label, key, type, table});
    APP.saveDB(db);
    Modules._dev_showTab('fields');
  };

  Modules._dev_deleteField = function(idx) {
    if (!confirm('حذف هذا الحقل؟')) return;
    const db = APP.getDB();
    db.customFields.splice(idx, 1);
    APP.saveDB(db);
    Modules._dev_showTab('fields');
  };

  Modules._dev_addLink = function() {
    const label = prompt('اسم الرابط:');
    if (!label) return;
    const type = prompt('النوع: internal (صفحة داخلية), external (موقع خارجي), image (صورة)', 'internal') || 'internal';
    const target = prompt('الهدف (id الصفحة أو الرابط):');
    if (!target) return;
    const db = APP.getDB();
    if (!db.quickLinks) db.quickLinks = [];
    db.quickLinks.push({label, type, target});
    APP.saveDB(db);
    Modules._dev_showTab('links');
  };

  Modules._dev_testLink = function(idx) {
    const db = APP.getDB();
    const link = db.quickLinks[idx];
    if (!link) return;
    if (link.type === 'internal' && window.APP) APP.navigate(link.target);
    else if (link.type === 'external') window.open(link.target, '_blank');
    else if (link.type === 'image') window.open(link.target, '_blank');
  };

  Modules._dev_deleteLink = function(idx) {
    if (!confirm('حذف هذا الرابط؟')) return;
    const db = APP.getDB();
    db.quickLinks.splice(idx, 1);
    APP.saveDB(db);
    Modules._dev_showTab('links');
  };

  Modules._dev_restoreFile = function(evt) {
    const file = evt.target.files[0];
    if (!file) return;
    if (!confirm('سيتم استبدال كل البيانات الحالية. متابعة؟')) return;
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const data = JSON.parse(e.target.result);
        APP.saveDB(data);
        alert('✓ تمت الاستعادة بنجاح. سيتم إعادة تحميل الصفحة.');
        location.reload();
      } catch (err) {
        alert('✗ خطأ في قراءة الملف: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  Modules._dev_resetUsers = function() {
    if (!confirm('سيتم استعادة كلمات المرور الافتراضية. متابعة؟')) return;
    if (window.resetUsersToDefault) window.resetUsersToDefault();
    else { alert('دالة resetUsersToDefault غير موجودة'); return; }
    alert('✓ تمت إعادة الضبط');
  };

  Modules._dev_clearCustomizations = function() {
    if (!confirm('سيتم حذف كل القوائم والصفحات والحقول المخصصة. متابعة؟')) return;
    const db = APP.getDB();
    db.customMenus = [];
    db.customPages = [];
    db.customFields = [];
    db.quickLinks = [];
    APP.saveDB(db);
    location.reload();
  };

  Modules._dev_factoryReset = function() {
    if (!confirm('سيتم حذف كل البيانات. هل أنت متأكد؟')) return;
    if (!confirm('تأكيد نهائي: لا يمكن التراجع!')) return;
    localStorage.removeItem('celein_db');
    location.reload();
  };

  // تطبيق الثيم المحفوظ عند التحميل
  const devSettings = getDevSettings();
  if (devSettings.theme_primary) {
    document.documentElement.style.setProperty('--primary', devSettings.theme_primary);
  }
  if (devSettings.theme_bg) {
    document.documentElement.style.setProperty('--bg', devSettings.theme_bg);
  }

  // تحميل الصفحات المخصصة عند البدء
  const dbNow = APP.getDB();
  if (dbNow.customPages) {
    dbNow.customPages.forEach(p => {
      if (!window.Modules[p.id]) {
        window.Modules[p.id] = function(container) {
          const cur = (APP.getDB().customPages || []).find(x => x.id === p.id);
          if (cur) container.innerHTML = '<div class="card"><h3>'+cur.label+'</h3>'+cur.html+'</div>';
        };
      }
    });
  }

  render();
};

/* ============ التصدير والاستيراد ============ */
Modules.exportBackup = function() {
  const db = APP.getDB();
  const blob = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `celein_backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
};

Modules.importBackup = function(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      if (!confirm('سيتم استبدال كل البيانات. متابعة؟')) return;
      APP.saveDB(data);
      alert('{Icons.render("check")} تمت الاستعادة بنجاح');
      location.reload();
    } catch (err) {
      alert('{Icons.render("close")} ملف غير صالح: ' + err.message);
    }
  };
  reader.readAsText(file);
};

Modules.exportTable = function(type, filename) {
  const db = APP.getDB();
  let csv = '\ufeff'; // BOM for Excel
  let rows = [];

  if (type === 'productionLog') {
    csv += 'التاريخ,الصنف,الكمية,التالف,ملاحظة\n';
    db.productionLog.forEach(p => {
      const prod = db.products.find(x => x.code === p.productCode);
      csv += `${p.date},"${prod ? prod.name : p.productCode}",${p.qty},${p.waste},"${p.note || ''}"\n`;
    });
  } else if (type === 'inventory') {
    csv += 'الصنف,الافتتاحي,المنتج,المصروف,الرصيد\n';
    DB.inventory(db).forEach(i => {
      csv += `"${i.name}",${i.opening},${i.produced},${i.dispatched},${i.balance}\n`;
    });
  } else if (type === 'salesReps') {
    csv += 'المندوب,المركبة,الرصيد,المبيعات,التحصيل,المديونية\n';
    db.salesReps.forEach(r => {
      const s = DB.salesRepSummary(r.code, db);
      csv += `"${r.name}",${r.vehicle},${r.openingBalance},${s.credit + s.cash},${s.collection},${s.balance}\n`;
    });
  } else {
    return alert('نوع التصدير غير مدعوم');
  }

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
};

APP._roleLabel = function(role) {
  const m = {
    admin: "مدير النظام",
    production: "مدير الإنتاج",
    accountant: "المحاسب",
    sales: "إدارة المبيعات والمخازن",
    lab: "المختبر والمحطة",
    procurement: "المشتريات والموارد البشرية"
  };
  return m[role] || role;
};

/* ============================================================
   طلب شراء - من الإنتاج إلى المشتريات
   ============================================================ */
window.Modules.purchaseRequest = function(container) {
  const db = APP.getDB();
  let _activeTab = 'new'; // 'new' | 'sent' | 'machines'

  // 12 نوع آلة كما حددها المستخدم
  const MACHINES = [
    'آلة النفخ',
    'منظومة الضغط والتبريد',
    'خط السير',
    'آلة التعبئة 3×1',
    'آلة الأغطية',
    'آلة التاريخ',
    'آلة التجفيف',
    'آلة اللاصق ليبل',
    'آلة التغليف كرتون',
    'آلة التغليف شرنج',
    'المحطة',
    'المختبر'
  ];

  function genCode() {
    const year = new Date().getFullYear();
    const n = (db.purchaseRequests.length + 1).toString().padStart(3, '0');
    return `PR-${year}-${n}`;
  }

  function statusBadge(status) {
    const m = {
      'pending': ['في الانتظار', 'warning'],
      'seen': ['تم الاطلاع', 'info'],
      'approved': ['موافق عليه', 'success'],
      'rejected': ['مرفوض', 'danger'],
      'ordered': ['تم الطلب', 'success'],
      'received': ['تم الاستلام', 'success']
    };
    const [label, cls] = m[status] || ['غير معروف', 'info'];
    return `<span class="badge badge-${cls}">${label}</span>`;
  }


  function render() {
    const userRequests = db.purchaseRequests.filter(r => r.fromUser === APP.getUser().empId);

    container.innerHTML = `
      <div class="alert alert-info">
        ${Icons.render("info")}
        <span>صفحة <b>طلب شراء</b> ترفع الطلبات مباشرة إلى إدارة المشتريات. اختر "مواد خام" لطلب من قائمة الموردين، أو "قطعة غيار" لطلب قطعة لإحدى الآلات.</span>
      </div>

      <div class="tabs">
        <div class="tab ${_activeTab === 'new' ? 'active' : ''}" data-action="pr-tab" data-tab="'new')">${Icons.render("plus")} طلب جديد</div>
        <div class="tab ${_activeTab === 'machines' ? 'active' : ''}" data-action="pr-tab" data-tab="'machines')">${Icons.render("settings")} الآلات المعتمدة</div>
        <div class="tab ${_activeTab === 'sent' ? 'active' : ''}" data-action="pr-tab" data-tab="'sent')">${Icons.render("clipboard")} طلباتي المرسلة (${userRequests.length})</div>
      </div>

      <div id="prContent"></div>
    `;

    if (_activeTab === 'new') renderNewRequest();
    else if (_activeTab === 'machines') renderMachines();
    else renderSentRequests();
  }

  function renderNewRequest() {
    const content = document.getElementById('prContent');
    content.innerHTML = `
      <div class="card">
        <h3>${Icons.render("cart")} نوع الطلب</h3>
        <p class="text-muted" style="margin-bottom:18px">اختر نوع الطلب:</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px">
          <div data-action="pr-start-raw" style="cursor:pointer;background:var(--bg);padding:32px 24px;border-radius:var(--radius);box-shadow:var(--shadow-out);transition:all 0.2s"  >
            <div style="text-align:center">
              <div style="width:80px;height:80px;background:var(--bg);box-shadow:var(--shadow-in-sm);border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:14px">${Icons.render("cart", {size:36})}</div>
              <h3 style="border:none;padding:0;color:var(--primary);font-size:18px;justify-content:center">مواد خام</h3>
              <p class="text-muted" style="margin-top:8px;font-size:13px">طلب أنبولات، أغطية، ليبل، شرنك، كرتون... من قائمة الموردين</p>
            </div>
          </div>

          <div data-action="pr-start-spare" style="cursor:pointer;background:var(--bg);padding:32px 24px;border-radius:var(--radius);box-shadow:var(--shadow-out);transition:all 0.2s"  >
            <div style="text-align:center">
              <div style="width:80px;height:80px;background:var(--bg);box-shadow:var(--shadow-in-sm);border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:14px">${Icons.render("settings", {size:36})}</div>
              <h3 style="border:none;padding:0;color:var(--primary);font-size:18px;justify-content:center">قطعة غيار</h3>
              <p class="text-muted" style="margin-top:8px;font-size:13px">طلب قطعة غيار لإحدى آلات المصنع مع صور القطعة والآلة</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderMachines() {
    const content = document.getElementById('prContent');
    content.innerHTML = `
      <div class="card">
        <h3>${Icons.render("settings")} الآلات المعتمدة في المصنع</h3>
        <p class="text-muted" style="margin-bottom:14px">قائمة بالآلات المعتمدة في المصنع لطلب قطع غيار لها:</p>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px">
          ${MACHINES.map((m, i) => `
            <div style="background:var(--bg);padding:20px 16px;border-radius:var(--radius);box-shadow:var(--shadow-in-sm);display:flex;align-items:center;gap:12px">
              <div style="width:42px;height:42px;background:var(--primary);color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;flex-shrink:0;font-size:14px">${i+1}</div>
              <div style="font-weight:700;color:var(--text);font-size:14px">${m}</div>
            </div>
          `).join('')}
        </div>
        <div class="btn-row" style="margin-top:20px">
          <button class="btn btn-primary" data-action="pr-start-spare">${Icons.render("plus")} طلب قطعة غيار</button>
        </div>
      </div>
    `;
  }

  function renderSentRequests() {
    const content = document.getElementById('prContent');
    const userRequests = db.purchaseRequests
      .filter(r => r.fromUser === APP.getUser().empId)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    if (userRequests.length === 0) {
      content.innerHTML = `
        <div class="card">
          <div class="empty-state">
            <div class="icon">${Icons.render("clipboard")}</div>
            <h3>لا توجد طلبات بعد</h3>
            <p>قم بإنشاء طلب شراء جديد من تبويب "طلب جديد"</p>
            <button class="btn btn-primary" style="margin-top:14px" data-action="pr-tab" data-tab="'new')">${Icons.render("plus")} إنشاء طلب</button>
          </div>
        </div>
      `;
      return;
    }

    content.innerHTML = `
      <div class="card">
        <h3>${Icons.render("clipboard")} طلباتي المرسلة (${userRequests.length})</h3>
        ${userRequests.map(r => renderRequestCard(r)).join('')}
      </div>
    `;
  }

  function renderRequestCard(r) {
    const isRaw = r.type === 'raw';
    return `
      <div style="background:var(--bg);padding:18px;border-radius:var(--radius);box-shadow:var(--shadow-in-sm);margin-bottom:14px">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:12px">
          <div>
            <div style="font-weight:800;color:var(--primary);font-size:15px">${r.code} - ${isRaw ? 'مواد خام' : 'قطعة غيار'}</div>
            <div class="text-muted" style="font-size:12px;margin-top:2px">${r.date} • ${r.itemCount} بند</div>
          </div>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
            ${statusBadge(r.status)}
            <span class="badge badge-info">${r.reminders || 0} تذكير</span>
          </div>
        </div>

        <details style="margin-bottom:12px">
          <summary style="cursor:pointer;font-weight:600;color:var(--primary);padding:6px 0">عرض تفاصيل الطلب (${r.items.length} بند)</summary>
          <div style="margin-top:10px;background:var(--bg);padding:12px;border-radius:var(--radius-sm);box-shadow:var(--shadow-in-sm)">
            ${r.items.map((item, i) => {
              if (isRaw) {
                return `<div style="padding:6px 0;border-bottom:1px dashed rgba(0,0,0,0.06);font-size:13px">
                  <b>${i+1}.</b> ${item.supplier} - ${item.material} - <b>${item.qty}</b> ${item.unit} ${item.notes ? `(${item.notes})` : ''}
                </div>`;
              } else {
                return `<div style="padding:10px;border-bottom:1px dashed rgba(0,0,0,0.06);font-size:13px">
                  <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px">
                    <div>
                      <b>${i+1}.</b> <span style="color:var(--primary);font-weight:800">${item.partName}</span>
                      <span class="text-muted"> - آلة: ${item.machine}</span>
                      ${item.model ? `<span class="text-muted"> - موديل: ${item.model}</span>` : ''}
                      <br><span class="text-primary">الكمية: ${item.qty} ${item.unit}</span>
                    </div>
                    <div style="display:flex;gap:6px">
                      ${item.machinePhoto ? `<img src="${item.machinePhoto}" style="width:48px;height:48px;object-fit:cover;border-radius:6px;box-shadow:var(--shadow-in-sm)" title="صورة الآلة">` : ''}
                      ${item.partPhoto ? `<img src="${item.partPhoto}" style="width:48px;height:48px;object-fit:cover;border-radius:6px;box-shadow:var(--shadow-in-sm)" title="صورة القطعة">` : ''}
                      ${item.nameplatePhoto ? `<img src="${item.nameplatePhoto}" style="width:48px;height:48px;object-fit:cover;border-radius:6px;box-shadow:var(--shadow-in-sm)" title="لوحة البيانات">` : ''}
                    </div>
                  </div>
                  ${item.notes ? `<div class="text-muted" style="margin-top:6px;font-size:12px">ملاحظات: ${item.notes}</div>` : ''}
                </div>`;
              }
            }).join('')}
            ${r.notes ? `<div style="margin-top:10px;padding:8px;background:rgba(0,0,0,0.03);border-radius:6px"><b>ملاحظات عامة:</b> ${r.notes}</div>` : ''}
          </div>
        </details>

        <div style="display:flex;gap:8px;flex-wrap:wrap">
          ${r.status === 'pending' ? `
            <button class="btn btn-primary btn-sm" data-action="pr-edit" data-pidx="${db.purchaseRequests.findIndex(x=>x.id===r.id)})">${Icons.render("edit")} تعديل</button>
            <button class="btn btn-danger btn-sm" data-action="pr-cancel" data-pidx="${db.purchaseRequests.findIndex(x=>x.id===r.id)})">${Icons.render("close")} إلغاء الطلب</button>
          ` : ''}
          ${r.status === 'pending' || r.status === 'seen' ? `
            <button class="btn btn-warning btn-sm" data-action="pr-remind" data-pidx="${db.purchaseRequests.findIndex(x=>x.id===r.id)})">${Icons.render("bell")} تذكير (${r.reminders || 0})</button>
          ` : ''}
          <button class="btn btn-secondary btn-sm" data-action="pr-view" data-pidx="${db.purchaseRequests.findIndex(x=>x.id===r.id)})">${Icons.render("eye")} عرض</button>
        </div>

        ${r.processedBy ? `<div class="text-muted" style="margin-top:10px;font-size:12px">تم المعالجة بواسطة: ${r.processedBy} في ${r.processedDate}</div>` : ''}
      </div>
    `;
  }

  // === دوال التحكم ===
  Modules._prSwitchTab = function(tab) {
    _activeTab = tab;
    render();
  };

  Modules._prStartRaw = function() {
    const content = document.getElementById('prContent');
    // تجميع المواد الخام الفريدة من الموردين
    const materials = [];
    const seen = new Set();
    db.suppliers.forEach(s => {
      const key = s.material + '|' + s.unit;
      if (!seen.has(key)) {
        seen.add(key);
        materials.push({ material: s.material, unit: s.unit, sample: s });
      }
    });

    // حساب متوسط التالف من سجل الإنتاج
    let avgWastePercent = 2; // افتراضي 2%
    if (db.productionLog && db.productionLog.length > 0) {
      const totalQty = db.productionLog.reduce((s, p) => s + (p.qty || 0), 0);
      const totalWaste = db.productionLog.reduce((s, p) => s + (p.waste || 0), 0);
      if (totalQty > 0) {
        avgWastePercent = (totalWaste / totalQty) * 100;
      }
    }

    content.innerHTML = `
      <div class="card">
        <div class="header-row">
          <h3>${Icons.render("cart")} طلب مواد خام</h3>
          <button class="btn btn-secondary btn-sm" data-action="pr-tab" data-tab="'new')">${Icons.render("arrowRight")} رجوع</button>
        </div>
        <div class="alert alert-info">
          ${Icons.render("info")}
          <span>حدد الكميات المطلوبة من كل مادة بوحدة المورد (كرتون/لفة/كيلو). سيتم احتساب إجمالي الكراتين المتوقعة تلقائياً بعد خصم التالف التقديري (<b>${avgWastePercent.toFixed(2)}%</b>).</span>
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label>تاريخ الطلب</label>
            <input type="date" id="pr_raw_date" value="${new Date().toISOString().split('T')[0]}" />
          </div>
          <div class="form-group">
            <label>الرقم الوظيفي</label>
            <input type="text" id="pr_raw_emp" value="${APP.getUser().empId}" readonly />
          </div>
          <div class="form-group">
            <label>متوسط التالف التقديري</label>
            <input type="text" id="pr_raw_waste" value="${avgWastePercent.toFixed(2)}%" readonly />
          </div>
        </div>

        <h3 style="margin-top:20px">${Icons.render("box")} المواد المتاحة (${materials.length})</h3>
        <div style="max-height:500px;overflow-y:auto">
        <table>
          <thead>
            <tr>
              <th>المادة</th>
              <th>الوحدة (المورد)</th>
              <th>المورد</th>
              <th style="width:100px">كمية العبوة</th>
              <th style="width:130px">الكمية المطلوبة (وحدة مورد)</th>
              <th>ملاحظات</th>
            </tr>
          </thead>
          <tbody>
            ${materials.map((m, i) => `
              <tr>
                <td><b>${m.material}</b></td>
                <td><span class="text-muted">${m.unit} (${m.sample.packUnit})</span></td>
                <td class="text-muted">${m.sample.name}</td>
                <td><span class="text-primary"><b>${m.sample.pack.toLocaleString('ar-EG')}</b></span></td>
                <td><input type="number" min="0" id="pr_raw_qty_${i}" value="0" data-change="calc-pr" style="width:120px;text-align:center;font-weight:700" /></td>
                <td><input type="text" id="pr_raw_notes_${i}" placeholder="اختياري" style="width:100%" /></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        </div>

        <div class="form-group" style="margin-top:16px">
          <label>ملاحظات عامة على الطلب</label>
          <textarea id="pr_raw_generalNotes" rows="2" placeholder="أي ملاحظات إضافية تخص الطلب ككل..."></textarea>
        </div>

        <div class="btn-row">
          <button class="btn btn-success" data-action="pr-submit-raw">${Icons.render("upload")} إرسال الطلب إلى المشتريات</button>
          <button class="btn btn-secondary" data-action="pr-tab" data-tab="'new')">إلغاء</button>
        </div>
      </div>

      <!-- ملخص الحساب -->
      <div class="card" id="pr_calc_summary" style="background:linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)">
        <h3 style="color:var(--primary);border:none;padding-bottom:0">${Icons.render("chart")} إحتساب آلي للكراتين المتوقعة</h3>
        <p class="text-muted" style="margin-bottom:14px">يتم احتساب إجمالي الكراتين المتوقع إنتاجها بناءً على الكميات المدخلة، مع خصم التالف التقديري.</p>
        <div id="pr_calc_result">
          <div class="alert alert-warning">${Icons.render("info")} أدخل الكميات في الجدول أعلاه وسيتم الاحتساب تلقائياً.</div>
        </div>
      </div>
    `;

    // تهيئة الحساب الفارغ
    setTimeout(() => Modules._prRecalculate(), 100);
  };

  // دالة إعادة الاحتساب الفوري عند تغيير الكميات
  Modules._prRecalculate = function() {
    const resultDiv = document.getElementById('pr_calc_result');
    if (!resultDiv) return;

    // جمع المواد المدخلة
    const materials = [];
    const seen = new Set();
    db.suppliers.forEach(s => {
      const key = s.material + '|' + s.unit;
      if (!seen.has(key)) {
        seen.add(key);
        materials.push({ material: s.material, unit: s.unit, sample: s });
      }
    });

    // قراءة الكميات
    const entered = {};
    materials.forEach((m, i) => {
      const qtyEl = document.getElementById(`pr_raw_qty_${i}`);
      if (qtyEl) {
        const qty = parseFloat(qtyEl.value) || 0;
        if (qty > 0) {
          entered[m.material] = { qty, pack: m.sample.pack, relatedProduct: m.sample.relatedProduct || [] };
        }
      }
    });

    // متوسط التالف
    const wasteEl = document.getElementById('pr_raw_waste');
    const wastePercent = wasteEl ? parseFloat(wasteEl.value) || 2 : 2;
    const wasteFactor = 1 - (wastePercent / 100);

    // === حساب الكراتين لكل SKU ===
    // لكل SKU: maxCartons = min(bottles, caps, labels, boxes(للكرتون), shrink)
    const productSpecs = db.productSpecs || [
      { code: "750-K",  size: "750 مل",  packaging: "كرتون", bottles: 20, caps: 20, labels: 20, carton: 1, shrink: 1 },
      { code: "750-S",  size: "750 مل",  packaging: "شرنج",  bottles: 20, caps: 20, labels: 20, carton: 0, shrink: 1 },
      { code: "1.5L-K", size: "1.5 لتر", packaging: "كرتون", bottles: 12, caps: 12, labels: 12, carton: 1, shrink: 1 },
      { code: "1.5L-S", size: "1.5 لتر", packaging: "شرنج",  bottles: 12, caps: 12, labels: 12, carton: 0, shrink: 1 },
      { code: "330-K",  size: "330 مل",  packaging: "كرتون", bottles: 20, caps: 20, labels: 20, carton: 1, shrink: 1 },
      { code: "330-S",  size: "330 مل",  packaging: "شرنج",  bottles: 20, caps: 20, labels: 20, carton: 0, shrink: 1 }
    ];

    // تجميع الكميات المدخلة حسب النوع
    const totalBottles750 = (entered['امبولات 20.5']?.qty || 0) * (entered['امبولات 20.5']?.pack || 0);
    const totalBottles15L = totalBottles750; // نفس المادة
    const totalBottles330 = (entered['امبولات 11.7']?.qty || 0) * (entered['امبولات 11.7']?.pack || 0);
    const totalCaps = (entered['اغطيه']?.qty || 0) * (entered['اغطيه']?.pack || 0);
    const totalLabels750 = (entered['ليبل 750مل']?.qty || 0) * (entered['ليبل 750مل']?.pack || 0);
    const totalLabels15L = (entered['ليبل 1.5لتر']?.qty || 0) * (entered['ليبل 1.5لتر']?.pack || 0);
    const totalLabels330 = (entered['ليبل 330مل']?.qty || 0) * (entered['ليبل 330مل']?.pack || 0);
    const totalCartons750 = (entered['كرتون 750مل']?.qty || 0);
    const totalCartons15L = (entered['كرتون 1.5لتر']?.qty || 0);
    const totalCartons330 = (entered['كرتون 330مل']?.qty || 0);
    const totalShrink = (entered['شرنك 57سم']?.qty || 0) * (entered['شرنك 57سم']?.pack || 0);
    const totalGlue = (entered['غراء ليبل مائي']?.qty || 0) * (entered['غراء ليبل مائي']?.pack || 0);

    // حساب الكراتين لكل SKU
    function calcSKU(bottlesAvail, capsAvail, labelsAvail, cartonAvail, shrinkAvail, spec) {
      const bottlesCartons = spec.bottles > 0 ? bottlesAvail / spec.bottles : 0;
      const capsCartons = spec.caps > 0 ? capsAvail / spec.caps : 0;
      const labelsCartons = spec.labels > 0 ? labelsAvail / spec.labels : 0;
      const cartonCartons = spec.carton > 0 ? cartonAvail / spec.carton : Infinity;
      const shrinkCartons = spec.shrink > 0 ? shrinkAvail / spec.shrink : Infinity;
      return Math.floor(Math.max(0, Math.min(bottlesCartons, capsCartons, labelsCartons, cartonCartons, shrinkCartons)));
    }

    // للكرتون: يحتاج كرتون قاعدة + شرنك
    // للشرنج: يحتاج شرنك فقط (بدون كرتون قاعدة)
    const sku750K = calcSKU(totalBottles750, totalCaps, totalLabels750, totalCartons750, totalShrink, productSpecs[0]);
    const sku750S = calcSKU(totalBottles750, totalCaps, totalLabels750, Infinity, totalShrink, productSpecs[1]);
    const sku15LK = calcSKU(totalBottles15L, totalCaps, totalLabels15L, totalCartons15L, totalShrink, productSpecs[2]);
    const sku15LS = calcSKU(totalBottles15L, totalCaps, totalLabels15L, Infinity, totalShrink, productSpecs[3]);
    const sku330K = calcSKU(totalBottles330, totalCaps, totalLabels330, totalCartons330, totalShrink, productSpecs[4]);
    const sku330S = calcSKU(totalBottles330, totalCaps, totalLabels330, Infinity, totalShrink, productSpecs[5]);

    // بعد خصم التالف
    const net750K = Math.floor(sku750K * wasteFactor);
    const net750S = Math.floor(sku750S * wasteFactor);
    const net15LK = Math.floor(sku15LK * wasteFactor);
    const net15LS = Math.floor(sku15LS * wasteFactor);
    const net330K = Math.floor(sku330K * wasteFactor);
    const net330S = Math.floor(sku330S * wasteFactor);

    const total750 = net750K + net750S;
    const total15L = net15LK + net15LS;
    const total330 = net330K + net330S;
    const totalAll = total750 + total15L + total330;

    // التحقق من أن المستخدم أدخل شيئاً
    const hasInput = Object.keys(entered).length > 0;

    if (!hasInput) {
      resultDiv.innerHTML = `
        <div class="alert alert-info">
          ${Icons.render("info")}
          <span>أدخل الكميات في الجدول أعلاه وسيتم الاحتساب تلقائياً.</span>
        </div>
      `;
      return;
    }

    resultDiv.innerHTML = `
      <div class="kpi-grid" style="margin-bottom:14px">
        <div class="kpi-card info" style="padding:14px">
          <div class="label" style="font-size:11px">كراتين 750 مل</div>
          <div class="value" style="font-size:24px">${total750.toLocaleString('ar-EG')}</div>
          <div class="delta" style="font-size:10px">كرتون: ${net750K} + شرنج: ${net750S}</div>
        </div>
        <div class="kpi-card info" style="padding:14px">
          <div class="label" style="font-size:11px">كراتين 1.5 لتر</div>
          <div class="value" style="font-size:24px">${total15L.toLocaleString('ar-EG')}</div>
          <div class="delta" style="font-size:10px">كرتون: ${net15LK} + شرنج: ${net15LS}</div>
        </div>
        <div class="kpi-card info" style="padding:14px">
          <div class="label" style="font-size:11px">كراتين 330 مل</div>
          <div class="value" style="font-size:24px">${total330.toLocaleString('ar-EG')}</div>
          <div class="delta" style="font-size:10px">كرتون: ${net330K} + شرنج: ${net330S}</div>
        </div>
        <div class="kpi-card success" style="padding:14px">
          <div class="label" style="font-size:11px">الإجمالي المتوقع</div>
          <div class="value" style="font-size:28px">${totalAll.toLocaleString('ar-EG')}</div>
          <div class="delta" style="font-size:10px">كرتون كرتونة</div>
        </div>
      </div>

      <div style="background:var(--bg);border-radius:var(--radius);padding:12px;box-shadow:var(--shadow-in-sm)">
        <table>
          <thead>
            <tr>
              <th>الصنف</th>
              <th>إجمالي المتاح</th>
              <th>قبل التالف</th>
              <th>بعد خصم التالف (${wastePercent}%)</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>750 مل - كرتون</td><td>${totalBottles750} عبوة + ${totalCaps} غطاء + ${totalLabels750} ليبل + ${totalCartons750} كرتون + ${totalShrink} شرنك</td><td>${sku750K}</td><td class="text-primary"><b>${net750K}</b></td></tr>
            <tr><td>750 مل - شرنج</td><td>${totalBottles750} عبوة + ${totalCaps} غطاء + ${totalLabels750} ليبل + ${totalShrink} شرنك</td><td>${sku750S}</td><td class="text-primary"><b>${net750S}</b></td></tr>
            <tr><td>1.5 لتر - كرتون</td><td>${totalBottles15L} عبوة + ${totalCaps} غطاء + ${totalLabels15L} ليبل + ${totalCartons15L} كرتون + ${totalShrink} شرنك</td><td>${sku15LK}</td><td class="text-primary"><b>${net15LK}</b></td></tr>
            <tr><td>1.5 لتر - شرنج</td><td>${totalBottles15L} عبوة + ${totalCaps} غطاء + ${totalLabels15L} ليبل + ${totalShrink} شرنك</td><td>${sku15LS}</td><td class="text-primary"><b>${net15LS}</b></td></tr>
            <tr><td>330 مل - كرتون</td><td>${totalBottles330} عبوة + ${totalCaps} غطاء + ${totalLabels330} ليبل + ${totalCartons330} كرتون + ${totalShrink} شرنك</td><td>${sku330K}</td><td class="text-primary"><b>${net330K}</b></td></tr>
            <tr><td>330 مل - شرنج</td><td>${totalBottles330} عبوة + ${totalCaps} غطاء + ${totalLabels330} ليبل + ${totalShrink} شرنك</td><td>${sku330S}</td><td class="text-primary"><b>${net330S}</b></td></tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3"><b>الإجمالي الكلي المتوقع إنتاجه</b></td>
              <td class="text-success" style="font-size:18px"><b>${totalAll.toLocaleString('ar-EG')} كرتون</b></td>
            </tr>
          </tfoot>
        </table>
        ${totalGlue > 0 ? `<div class="text-muted" style="margin-top:8px;font-size:12px">${Icons.render("info")} غراء ليبل متاح: <b>${totalGlue.toLocaleString('ar-EG')} كيلو</b> (يكفي لـ ${Math.floor(totalGlue / 0.4 * 20).toLocaleString('ar-EG')} كرتون تقريباً)</div>` : ''}
      </div>
    `;
  };

  Modules._prSubmitRaw = function() {
    const materials = [];
    const seen = new Set();
    db.suppliers.forEach(s => {
      const key = s.material + '|' + s.unit;
      if (!seen.has(key)) {
        seen.add(key);
        materials.push({ material: s.material, unit: s.unit, pack: s.pack });
      }
    });

    const items = [];
    materials.forEach((m, i) => {
      const qty = parseInt(document.getElementById(`pr_raw_qty_${i}`).value) || 0;
      const notes = document.getElementById(`pr_raw_notes_${i}`).value;
      if (qty > 0) {
        items.push({ material: m.material, unit: m.unit, qty, pack: m.pack, totalPieces: qty * m.pack, notes });
      }
    });

    if (items.length === 0) {
      alert('⚠ يرجى تحديد كمية واحدة على الأقل قبل الإرسال');
      return;
    }

    const generalNotes = document.getElementById('pr_raw_generalNotes').value;
    const wastePct = parseFloat(document.getElementById('pr_raw_waste').value) || 2;

    const newReq = {
      id: Date.now(),
      code: genCode(),
      date: document.getElementById('pr_raw_date').value,
      fromUser: APP.getUser().empId,
      fromUserName: APP.getUser().name,
      type: 'raw',
      status: 'pending',
      items,
      itemCount: items.length,
      notes: generalNotes,
      wastePercent: wastePct,
      reminders: 0,
      lastReminderDate: null,
      processedBy: null,
      processedDate: null,
      createdAt: new Date().toISOString()
    };

    db.purchaseRequests.push(newReq);
    APP.saveDB(db);
    alert(`✅ تم إرسال الطلب رقم ${newReq.code} (${items.length} بند) إلى إدارة المشتريات`);
    _activeTab = 'sent';
    render();
  };

  Modules._prStartSpare = function(editReq) {
    const content = document.getElementById('prContent');
    const isEdit = !!editReq;
    const initialItems = isEdit ? editReq.items : [];

    content.innerHTML = `
      <div class="card">
        <div class="header-row">
          <h3>${Icons.render("settings")} ${isEdit ? 'تعديل طلب قطعة غيار' : 'طلب قطعة غيار'}</h3>
          <button class="btn btn-secondary btn-sm" data-action="pr-tab" data-tab="'${isEdit ? 'sent' : 'new'}')">${Icons.render("arrowRight")} رجوع</button>
        </div>

        <div class="alert alert-info">
          ${Icons.render("info")}
          <span>اختر الآلة، ثم أضف القطع المطلوبة مع رفع الصور (صورة الآلة، صورة القطعة، صورة لوحة البيانات).</span>
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label>تاريخ الطلب</label>
            <input type="date" id="pr_spare_date" value="${isEdit ? editReq.date : new Date().toISOString().split('T')[0]}" />
          </div>
          <div class="form-group">
            <label>الرقم الوظيفي</label>
            <input type="text" id="pr_spare_emp" value="${APP.getUser().empId}" readonly />
          </div>
        </div>

        <h3 style="margin-top:20px">${Icons.render("settings")} اختر الآلة وأضف القطع</h3>

        <div class="form-grid">
          <div class="form-group">
            <label>الآلة</label>
            <select id="pr_spare_machine" data-change="machine-changed">
              <option value="">-- اختر الآلة --</option>
              ${MACHINES.map(m => `<option value="${m}">${m}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>موديل الآلة (اختياري)</label>
            <input type="text" id="pr_spare_model" placeholder="مثال: ABC-2024" />
          </div>
        </div>

        <div id="pr_spare_items_container"></div>

        <div class="btn-row" style="margin-top:14px">
          <button class="btn btn-primary" data-action="pr-add-spare-item">${Icons.render("plus")} إضافة قطعة</button>
        </div>

        <div class="form-group" style="margin-top:16px">
          <label>ملاحظات عامة على الطلب</label>
          <textarea id="pr_spare_generalNotes" rows="2" placeholder="أي ملاحظات إضافية...">${isEdit ? (editReq.notes || '') : ''}</textarea>
        </div>

        <div class="btn-row">
          <button class="btn btn-success" data-action="pr-submit-spare" data-sid="${isEdit ? editReq.id : 'null'})">${Icons.render("upload")} ${isEdit ? 'تحديث وإرسال' : 'إرسال الطلب إلى المشتريات'}</button>
          <button class="btn btn-secondary" data-action="pr-tab" data-tab="'${isEdit ? 'sent' : 'new'}')">إلغاء</button>
        </div>
      </div>

      <input type="hidden" id="pr_spare_items_data" value='${JSON.stringify(initialItems).replace(/'/g, "&#39;")}' />
    `;

    // إعادة بناء القطع الأولية
    if (initialItems.length > 0) {
      // تعبئة بيانات القطع الموجودة
      setTimeout(() => {
        initialItems.forEach((item, idx) => {
          Modules._prAddSpareItem(item);
        });
        if (initialItems.length > 0 && initialItems[0].machine) {
          document.getElementById('pr_spare_machine').value = initialItems[0].machine;
        }
        if (initialItems.length > 0 && initialItems[0].model) {
          document.getElementById('pr_spare_model').value = initialItems[0].model;
        }
      }, 50);
    }
  };

  Modules._prAddSpareItem = function(existingItem) {
    const container = document.getElementById('pr_spare_items_container');
    const idx = container.children.length;
    const item = existingItem || { partName: '', unit: 'حبه', qty: 1, model: '', notes: '', machinePhoto: '', partPhoto: '', nameplatePhoto: '' };

    const div = document.createElement('div');
    div.className = 'spare-item-form';
    div.style.cssText = 'background:var(--bg);padding:18px;border-radius:var(--radius);box-shadow:var(--shadow-in-sm);margin-bottom:14px;margin-top:14px';
    div.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <b style="color:var(--primary)">${Icons.render("settings")} القطعة #${idx+1}</b>
        <button class="btn btn-danger btn-sm" data-action="remove-spare-item">${Icons.render("trash")} حذف</button>
      </div>

      <div class="form-grid">
        <div class="form-group">
          <label>اسم القطعة *</label>
          <input type="text" class="spare-part-name" value="${item.partName || ''}" placeholder="مثال: فلتر هواء" required />
        </div>
        <div class="form-group">
          <label>الوحدة *</label>
          <select class="spare-part-unit">
            <option value="حبه" ${item.unit === 'حبه' ? 'selected' : ''}>حبه</option>
            <option value="كجم" ${item.unit === 'كجم' ? 'selected' : ''}>كجم</option>
            <option value="متر" ${item.unit === 'متر' ? 'selected' : ''}>متر</option>
            <option value="لتر" ${item.unit === 'لتر' ? 'selected' : ''}>لتر</option>
            <option value="لفة" ${item.unit === 'لفة' ? 'selected' : ''}>لفة</option>
            <option value="متر مربع" ${item.unit === 'متر مربع' ? 'selected' : ''}>متر مربع</option>
            <option value="طقم" ${item.unit === 'طقم' ? 'selected' : ''}>طقم</option>
          </select>
        </div>
        <div class="form-group">
          <label>الكمية *</label>
          <input type="number" min="1" class="spare-part-qty" value="${item.qty || 1}" required />
        </div>
        <div class="form-group">
          <label>موديل الآلة</label>
          <input type="text" class="spare-part-model" value="${item.model || ''}" placeholder="اختياري" />
        </div>
      </div>

      <div class="form-group" style="margin-top:10px">
        <label>ملاحظات على القطعة</label>
        <input type="text" class="spare-part-notes" value="${item.notes || ''}" placeholder="اختياري" />
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;margin-top:12px">
        <div>
          <label style="font-size:12px;font-weight:700;color:var(--text);display:block;margin-bottom:6px">${Icons.render("factory")} صورة الآلة</label>
          <input type="file" accept="image/*" class="spare-photo-machine" data-change="spare-photo" data-ptype="machinePhoto" data-pidx="${idx}" />
          ${item.machinePhoto ? `<img src="${item.machinePhoto}" style="margin-top:6px;width:80px;height:80px;object-fit:cover;border-radius:6px;box-shadow:var(--shadow-in-sm)" />` : ''}
        </div>
        <div>
          <label style="font-size:12px;font-weight:700;color:var(--text);display:block;margin-bottom:6px">${Icons.render("settings")} صورة القطعة</label>
          <input type="file" accept="image/*" class="spare-photo-part" data-change="spare-photo" data-ptype="partPhoto" data-pidx="${idx}" />
          ${item.partPhoto ? `<img src="${item.partPhoto}" style="margin-top:6px;width:80px;height:80px;object-fit:cover;border-radius:6px;box-shadow:var(--shadow-in-sm)" />` : ''}
        </div>
        <div>
          <label style="font-size:12px;font-weight:700;color:var(--text);display:block;margin-bottom:6px">${Icons.render("document")} لوحة بيانات الآلة</label>
          <input type="file" accept="image/*" class="spare-photo-nameplate" data-change="spare-photo" data-ptype="nameplatePhoto" data-pidx="${idx}" />
          ${item.nameplatePhoto ? `<img src="${item.nameplatePhoto}" style="margin-top:6px;width:80px;height:80px;object-fit:cover;border-radius:6px;box-shadow:var(--shadow-in-sm)" />` : ''}
        </div>
      </div>
    `;
    container.appendChild(div);
  };

  Modules._prRenumberItems = function() {
    const items = document.querySelectorAll('#pr_spare_items_container .spare-item-form');
    items.forEach((el, i) => {
      el.querySelector('b').textContent = `${Icons.render("settings")} القطعة #${i+1}`;
    });
  };

  Modules._prHandlePhoto = function(input, field, idx) {
    const file = input.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('⚠ حجم الصورة كبير (الحد الأقصى 2 ميجا). يرجى اختيار صورة أصغر.');
      input.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const div = input.closest('div');
      let img = div.querySelector('img');
      if (!img) {
        img = document.createElement('img');
        img.style.cssText = 'margin-top:6px;width:80px;height:80px;object-fit:cover;border-radius:6px;box-shadow:var(--shadow-in-sm)';
        div.appendChild(img);
      }
      img.src = e.target.result;
      // حفظ مؤقت على العنصر
      input.dataset.uploadedData = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  Modules._prSubmitSpare = function(editId) {
    const machine = document.getElementById('pr_spare_machine').value;
    if (!machine) {
      alert('⚠ يرجى اختيار الآلة');
      return;
    }

    const itemDivs = document.querySelectorAll('#pr_spare_items_container .spare-item-form');
    if (itemDivs.length === 0) {
      alert('⚠ يرجى إضافة قطعة واحدة على الأقل');
      return;
    }

    const items = [];
    let valid = true;
    itemDivs.forEach((div, i) => {
      const partName = div.querySelector('.spare-part-name').value.trim();
      const unit = div.querySelector('.spare-part-unit').value;
      const qty = parseInt(div.querySelector('.spare-part-qty').value);
      const model = div.querySelector('.spare-part-model').value;
      const notes = div.querySelector('.spare-part-notes').value;
      const machinePhoto = div.querySelector('.spare-photo-machine').dataset.uploadedData || div.querySelector('.spare-photo-machine').previousElementSibling?.tagName === 'IMG' ? div.querySelector('img[title="صورة الآلة"]')?.src : '';
      const partPhoto = div.querySelector('.spare-photo-part').dataset.uploadedData || div.querySelector('img[title="صورة القطعة"]')?.src || '';
      const nameplatePhoto = div.querySelector('.spare-photo-nameplate').dataset.uploadedData || div.querySelector('img[title="لوحة البيانات"]')?.src || '';

      if (!partName || !qty || qty < 1) {
        alert(`⚠ القطعة #${i+1}: يرجى إدخال اسم القطعة والكمية`);
        valid = false;
        return;
      }

      items.push({ partName, unit, qty, model, notes, machinePhoto, partPhoto, nameplatePhoto });
    });

    if (!valid) return;

    const generalNotes = document.getElementById('pr_spare_generalNotes').value;
    const globalModel = document.getElementById('pr_spare_model').value;

    const newReq = {
      id: editId || Date.now(),
      code: editId ? (db.purchaseRequests.find(r => r.id === editId)?.code || genCode()) : genCode(),
      date: document.getElementById('pr_spare_date').value,
      fromUser: APP.getUser().empId,
      fromUserName: APP.getUser().name,
      type: 'spare',
      status: 'pending',
      items: items.map(it => ({ ...it, machine, model: it.model || globalModel })),
      itemCount: items.length,
      notes: generalNotes,
      reminders: 0,
      lastReminderDate: null,
      processedBy: null,
      processedDate: null,
      createdAt: editId ? (db.purchaseRequests.find(r => r.id === editId)?.createdAt || new Date().toISOString()) : new Date().toISOString()
    };

    if (editId) {
      const idx = db.purchaseRequests.findIndex(r => r.id === editId);
      if (idx !== -1) db.purchaseRequests[idx] = newReq;
    } else {
      db.purchaseRequests.push(newReq);
    }
    APP.saveDB(db);
    alert(`✅ تم ${editId ? 'تحديث' : 'إرسال'} الطلب ${newReq.code} (${items.length} قطعة) إلى إدارة المشتريات`);
    _activeTab = 'sent';
    render();
  };

  Modules._prEditRequest = function(idx) {
    const req = db.purchaseRequests[idx];
    if (!req) return;
    if (req.type === 'raw') {
      // للمواد الخام، تعديل بسيط
      alert('لتعديل طلب مواد خام، يرجى إلغاؤه وإنشاء طلب جديد');
    } else {
      Modules._prStartSpare(req);
    }
  };

  Modules._prCancelRequest = function(idx) {
    const req = db.purchaseRequests[idx];
    if (!req) return;
    if (!confirm(`هل تريد إلغاء الطلب ${req.code}؟ لا يمكن التراجع.`)) return;
    db.purchaseRequests[idx].status = 'cancelled';
    APP.saveDB(db);
    alert('✅ تم إلغاء الطلب');
    render();
  };

  Modules._prRemind = function(idx) {
    const req = db.purchaseRequests[idx];
    if (!req) return;
    db.purchaseRequests[idx].reminders = (db.purchaseRequests[idx].reminders || 0) + 1;
    db.purchaseRequests[idx].lastReminderDate = new Date().toISOString();
    APP.saveDB(db);
    alert(`🔔 تم إرسال تذكير لإدارة المشتريات بخصوص الطلب ${req.code}\nعدد التذكيرات: ${db.purchaseRequests[idx].reminders}`);
    render();
  };

  Modules._prViewRequest = function(idx) {
    const req = db.purchaseRequests[idx];
    if (!req) return;
    const isRaw = req.type === 'raw';
    const html = `
      <div class="card">
        <h3>${req.code} - ${isRaw ? 'مواد خام' : 'قطعة غيار'}</h3>
        <div class="kpi-grid" style="margin-bottom:14px">
          <div class="kpi-card"><div class="label">التاريخ</div><div class="value">${req.date}</div></div>
          <div class="kpi-card info"><div class="label">الحالة</div><div class="value">${statusBadge(req.status)}</div></div>
          <div class="kpi-card success"><div class="label">عدد البنود</div><div class="value">${req.itemCount}</div></div>
          <div class="kpi-card warning"><div class="label">التذكيرات</div><div class="value">${req.reminders || 0}</div></div>
        </div>
        <table>
          <thead><tr><th>التفاصيل</th><th>القيمة</th></tr></thead>
          <tbody>
            <tr><td>المرسل</td><td>${req.fromUserName} (${req.fromUser})</td></tr>
            <tr><td>تاريخ الإنشاء</td><td>${req.createdAt || req.date}</td></tr>
            ${req.notes ? `<tr><td>ملاحظات</td><td>${req.notes}</td></tr>` : ''}
          </tbody>
        </table>
        <h3 style="margin-top:14px">البنود (${req.items.length})</h3>
        ${req.items.map((item, i) => {
          if (isRaw) {
            return `<div style="padding:8px;border-bottom:1px solid rgba(0,0,0,0.05)">${i+1}. ${item.supplier || ''} - ${item.material} - <b>${item.qty}</b> ${item.unit}</div>`;
          } else {
            return `<div style="padding:8px;border-bottom:1px solid rgba(0,0,0,0.05);display:flex;gap:10px;align-items:center">
              <div style="flex:1">
                ${i+1}. <b>${item.partName}</b> - آلة: ${item.machine} ${item.model ? `(موديل: ${item.model})` : ''} - كمية: ${item.qty} ${item.unit}
              </div>
              <div style="display:flex;gap:4px">
                ${item.machinePhoto ? `<a href="${item.machinePhoto}" target="_blank"><img src="${item.machinePhoto}" style="width:40px;height:40px;object-fit:cover;border-radius:4px" title="صورة الآلة"></a>` : ''}
                ${item.partPhoto ? `<a href="${item.partPhoto}" target="_blank"><img src="${item.partPhoto}" style="width:40px;height:40px;object-fit:cover;border-radius:4px" title="صورة القطعة"></a>` : ''}
                ${item.nameplatePhoto ? `<a href="${item.nameplatePhoto}" target="_blank"><img src="${item.nameplatePhoto}" style="width:40px;height:40px;object-fit:cover;border-radius:4px" title="لوحة البيانات"></a>` : ''}
              </div>
            </div>`;
          }
        }).join('')}
      </div>
    `;
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.innerHTML = `
      <div class="modal" style="max-width:800px">
        <div class="modal-header">
          <h3>${Icons.render("eye")} تفاصيل الطلب</h3>
          <button class="modal-close" data-action="modal-close">×</button>
        </div>
        <div class="modal-body">${html}</div>
        <div class="modal-footer">
          <button class="btn btn-secondary" data-action="modal-close">إغلاق</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  };

  // تسجيل التصدير
  Exports.register("purchaseRequest", {
    label: "طلب شراء",
    pdf: () => {
      const userRequests = db.purchaseRequests.filter(r => r.fromUser === APP.getUser().empId);
      const headers = ['الرقم', 'التاريخ', 'النوع', 'الحالة', 'البنود', 'التذكيرات'];
      const rows = userRequests.map(r => [r.code, r.date, r.type === 'raw' ? 'مواد خام' : 'قطعة غيار', statusBadge(r.status).replace(/<[^>]+>/g, ''), r.itemCount, r.reminders || 0]);
      const html = Exports.rowsToHTMLTable(headers, rows, { title: 'طلبات الشراء' });
      Exports.exportPDF("طلبات الشراء", html, "purchase_requests");
    },
    excel: () => {
      const userRequests = db.purchaseRequests.filter(r => r.fromUser === APP.getUser().empId);
      const headers = ['الرقم', 'التاريخ', 'النوع', 'الحالة', 'البنود', 'التذكيرات'];
      const rows = userRequests.map(r => [r.code, r.date, r.type === 'raw' ? 'مواد خام' : 'قطعة غيار', r.status, r.itemCount, r.reminders || 0]);
      Exports.exportExcel(Exports.rowsToHTMLTable(headers, rows, { title: 'طلبات الشراء' }), "purchase_requests");
    },
    csv: () => {
      const userRequests = db.purchaseRequests.filter(r => r.fromUser === APP.getUser().empId);
      const headers = ['الرقم', 'التاريخ', 'النوع', 'الحالة', 'البنود'];
      const rows = userRequests.map(r => [r.code, r.date, r.type === 'raw' ? 'مواد خام' : 'قطعة غيار', r.status, r.itemCount]);
      Exports.exportCSV(Exports.rowsToCSV(headers, rows), "purchase_requests");
    },
    json: () => Exports.exportJSON({ purchaseRequests: db.purchaseRequests }, "purchase_requests"),
    print: () => window.print()
  });

  render();
};

/* ============================================================
   دوال مشتركة لطلبات الشراء (modal display)
   ============================================================ */
window.Modules._showRequestModal = function(req) {
  const isRaw = req.type === 'raw';

  // إعادة احتساب الكراتين المتوقعة لطلبات المواد الخام (لعرضها للمشتريات)
  let calcHtml = '';
  if (isRaw) {
    const db = APP.getDB();
    const entered = {};
    req.items.forEach(item => {
      entered[item.material] = {
        qty: item.qty,
        pack: item.pack || (db.suppliers.find(s => s.material === item.material)?.pack) || 1
      };
    });
    const wastePercent = req.wastePercent || 2;
    const wasteFactor = 1 - (wastePercent / 100);

    // تجميع الكميات
    const totalBottles750 = (entered['امبولات 20.5']?.qty || 0) * (entered['امبولات 20.5']?.pack || 0);
    const totalBottles15L = totalBottles750;
    const totalBottles330 = (entered['امبولات 11.7']?.qty || 0) * (entered['امبولات 11.7']?.pack || 0);
    const totalCaps = (entered['اغطيه']?.qty || 0) * (entered['اغطيه']?.pack || 0);
    const totalLabels750 = (entered['ليبل 750مل']?.qty || 0) * (entered['ليبل 750مل']?.pack || 0);
    const totalLabels15L = (entered['ليبل 1.5لتر']?.qty || 0) * (entered['ليبل 1.5لتر']?.pack || 0);
    const totalLabels330 = (entered['ليبل 330مل']?.qty || 0) * (entered['ليبل 330مل']?.pack || 0);
    const totalCartons750 = (entered['كرتون 750مل']?.qty || 0) * (entered['كرتون 750مل']?.pack || 1);
    const totalCartons15L = (entered['كرتون 1.5لتر']?.qty || 0) * (entered['كرتون 1.5لتر']?.pack || 1);
    const totalCartons330 = (entered['كرتون 330مل']?.qty || 0) * (entered['كرتون 330مل']?.pack || 1);
    const totalShrink = (entered['شرنك 57سم']?.qty || 0) * (entered['شرنك 57سم']?.pack || 0);

    function calcSKU(bottles, caps, labels, carton, shrink, spec) {
      const bC = spec.bottles > 0 ? bottles / spec.bottles : 0;
      const cC = spec.caps > 0 ? caps / spec.caps : 0;
      const lC = spec.labels > 0 ? labels / spec.labels : 0;
      const ctC = spec.carton > 0 ? carton / spec.carton : Infinity;
      const sC = spec.shrink > 0 ? shrink / spec.shrink : Infinity;
      return Math.floor(Math.max(0, Math.min(bC, cC, lC, ctC, sC)));
    }

    const productSpecs = db.productSpecs || [
      { code: "750-K",  size: "750 مل",  packaging: "كرتون", bottles: 20, caps: 20, labels: 20, carton: 1, shrink: 1 },
      { code: "750-S",  size: "750 مل",  packaging: "شرنج",  bottles: 20, caps: 20, labels: 20, carton: 0, shrink: 1 },
      { code: "1.5L-K", size: "1.5 لتر", packaging: "كرتون", bottles: 12, caps: 12, labels: 12, carton: 1, shrink: 1 },
      { code: "1.5L-S", size: "1.5 لتر", packaging: "شرنج",  bottles: 12, caps: 12, labels: 12, carton: 0, shrink: 1 },
      { code: "330-K",  size: "330 مل",  packaging: "كرتون", bottles: 20, caps: 20, labels: 20, carton: 1, shrink: 1 },
      { code: "330-S",  size: "330 مل",  packaging: "شرنج",  bottles: 20, caps: 20, labels: 20, carton: 0, shrink: 1 }
    ];

    const sku750K = Math.floor(calcSKU(totalBottles750, totalCaps, totalLabels750, totalCartons750, totalShrink, productSpecs[0]) * wasteFactor);
    const sku750S = Math.floor(calcSKU(totalBottles750, totalCaps, totalLabels750, Infinity, totalShrink, productSpecs[1]) * wasteFactor);
    const sku15LK = Math.floor(calcSKU(totalBottles15L, totalCaps, totalLabels15L, totalCartons15L, totalShrink, productSpecs[2]) * wasteFactor);
    const sku15LS = Math.floor(calcSKU(totalBottles15L, totalCaps, totalLabels15L, Infinity, totalShrink, productSpecs[3]) * wasteFactor);
    const sku330K = Math.floor(calcSKU(totalBottles330, totalCaps, totalLabels330, totalCartons330, totalShrink, productSpecs[4]) * wasteFactor);
    const sku330S = Math.floor(calcSKU(totalBottles330, totalCaps, totalLabels330, Infinity, totalShrink, productSpecs[5]) * wasteFactor);
    const total750 = sku750K + sku750S;
    const total15L = sku15LK + sku15LS;
    const total330 = sku330K + sku330S;
    const totalAll = total750 + total15L + total330;

    calcHtml = `
      <div class="alert alert-success" style="margin-bottom:14px">
        ${window.Icons.render("chart")}
        <span><b>الطاقة الإنتاجية المتوقعة من هذا الطلب:</b> <span style="font-size:18px;font-weight:800;color:var(--primary)">${totalAll.toLocaleString('ar-EG')} كرتون</span>
        (بعد خصم ${wastePercent}% تالف تقديري)</span>
      </div>
      <div class="kpi-grid" style="margin-bottom:14px">
        <div class="kpi-card info" style="padding:12px">
          <div class="label" style="font-size:11px">كراتين 750 مل</div>
          <div class="value" style="font-size:20px">${total750.toLocaleString('ar-EG')}</div>
          <div class="delta" style="font-size:10px">كرتون ${sku750K} + شرنج ${sku750S}</div>
        </div>
        <div class="kpi-card info" style="padding:12px">
          <div class="label" style="font-size:11px">كراتين 1.5 لتر</div>
          <div class="value" style="font-size:20px">${total15L.toLocaleString('ar-EG')}</div>
          <div class="delta" style="font-size:10px">كرتون ${sku15LK} + شرنج ${sku15LS}</div>
        </div>
        <div class="kpi-card info" style="padding:12px">
          <div class="label" style="font-size:11px">كراتين 330 مل</div>
          <div class="value" style="font-size:20px">${total330.toLocaleString('ar-EG')}</div>
          <div class="delta" style="font-size:10px">كرتون ${sku330K} + شرنج ${sku330S}</div>
        </div>
      </div>
    `;
  }

  const html = `
    <div class="kpi-grid" style="margin-bottom:14px">
      <div class="kpi-card info"><div class="label">الطلب</div><div class="value" style="font-size:18px">${req.code}</div></div>
      <div class="kpi-card"><div class="label">التاريخ</div><div class="value" style="font-size:18px">${req.date}</div></div>
      <div class="kpi-card success"><div class="label">عدد البنود</div><div class="value" style="font-size:18px">${req.itemCount}</div></div>
      <div class="kpi-card"><div class="label">النوع</div><div class="value" style="font-size:14px">${isRaw ? 'مواد خام' : 'قطعة غيار'}</div></div>
    </div>
    ${calcHtml}
    <table>
      <tbody>
        <tr><td><b>المرسل</b></td><td>${req.fromUserName} (${req.fromUser})</td></tr>
        <tr><td><b>التذكيرات</b></td><td>${req.reminders || 0}</td></tr>
        ${req.processedBy ? `<tr><td><b>معالج بواسطة</b></td><td>${req.processedBy} في ${req.processedDate}</td></tr>` : ''}
        ${req.rejectionReason ? `<tr><td><b>سبب الرفض</b></td><td>${req.rejectionReason}</td></tr>` : ''}
        ${req.notes ? `<tr><td><b>ملاحظات عامة</b></td><td>${req.notes}</td></tr>` : ''}
      </tbody>
    </table>
    <h3 style="margin-top:18px;color:var(--primary)">البنود (${req.items.length})</h3>
    ${req.items.map((item, i) => {
      if (isRaw) {
        return `<div style="padding:10px;border-bottom:1px solid rgba(0,0,0,0.05);font-size:13px">
          <b>${i+1}.</b> <b>${item.material}</b> - <span class="text-primary">الكمية: ${item.qty} ${item.unit}</span>
          ${item.notes ? `<br><span class="text-muted" style="font-size:11px">${item.notes}</span>` : ''}
        </div>`;
      } else {
        return `<div style="padding:12px;border-bottom:1px solid rgba(0,0,0,0.05);font-size:13px">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap">
            <div style="flex:1;min-width:200px">
              <b>${i+1}.</b> <b style="color:var(--primary)">${item.partName}</b>
              <br><span class="text-muted">الآلة: ${item.machine}</span>
              ${item.model ? ` <span class="text-muted">- الموديل: ${item.model}</span>` : ''}
              <br><span class="text-primary">الكمية: ${item.qty} ${item.unit}</span>
              ${item.notes ? `<br><span class="text-muted" style="font-size:11px">${item.notes}</span>` : ''}
            </div>
            <div style="display:flex;gap:6px;flex-shrink:0">
              ${item.machinePhoto ? `<a href="${item.machinePhoto}" target="_blank"><img src="${item.machinePhoto}" style="width:60px;height:60px;object-fit:cover;border-radius:6px;box-shadow:var(--shadow-in-sm)" title="صورة الآلة"></a>` : ''}
              ${item.partPhoto ? `<a href="${item.partPhoto}" target="_blank"><img src="${item.partPhoto}" style="width:60px;height:60px;object-fit:cover;border-radius:6px;box-shadow:var(--shadow-in-sm)" title="صورة القطعة"></a>` : ''}
              ${item.nameplatePhoto ? `<a href="${item.nameplatePhoto}" target="_blank"><img src="${item.nameplatePhoto}" style="width:60px;height:60px;object-fit:cover;border-radius:6px;box-shadow:var(--shadow-in-sm)" title="لوحة البيانات"></a>` : ''}
            </div>
          </div>
        </div>`;
      }
    }).join('')}
  `;
  const modal = document.createElement('div');
  modal.className = 'modal-overlay active';
  modal.innerHTML = `
    <div class="modal" style="max-width:800px">
      <div class="modal-header">
        <h3>${window.Icons.render("eye")} تفاصيل الطلب ${req.code}</h3>
        <button class="modal-close" data-action="modal-close">×</button>
      </div>
      <div class="modal-body">${html}</div>
      <div class="modal-footer">
        <button class="btn btn-secondary" data-action="modal-close">إغلاق</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
};

window.Modules._showRequestModalHtml = function(title, html) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay active';
  modal.innerHTML = `
    <div class="modal" style="max-width:900px">
      <div class="modal-header">
        <h3>${title}</h3>
        <button class="modal-close" data-action="modal-close">×</button>
      </div>
      <div class="modal-body">${html}</div>
      <div class="modal-footer">
        <button class="btn btn-secondary" data-action="modal-close">إغلاق</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
};

/* ============================================================
   نظام الخدمة الذاتية - نظام ERP ذاتي الخدمة
   ============================================================ */


/* ============================================================
   نظام الخدمة الذاتية - v2 (String Concatenation Only)
   ============================================================ */

// ===== صفحة "طلباتي" =====
window.Modules.myRequests = function(container) {
  SelfService.initDB();
  const db = APP.getDB();
  const user = APP.getCurrentUser();
  if (!user) {
    container.innerHTML = '<div class="empty-state" style="text-align:center;padding:40px"><p style="color:var(--text-muted)">لم يتم تسجيل الدخول</p></div>';
    return;
  }
  const myReqs = SelfService.getMyRequests();
  const notifs = (db.notifications || []).filter(function(n) { return n.for === user.empId || n.for === user.username; }).slice(-5).reverse();

  Exports.register("myRequests", {
    label: "طلباتي",
    pdf: function() { return Exports.exportPDF('طلباتي', '<h2>طلباتي</h2>' + myReqs.map(function(r) { return '<p><b>' + r.id.substring(0,12) + '</b>: ' + r.title + ' - ' + (SelfService.STATUS_LABELS[r.status] || r.status) + '</p>'; }).join(''), 'myreqs'); },
    excel: function() { return Exports.exportJSON(myReqs, 'my_requests'); },
    json: function() { return Exports.exportJSON(myReqs, 'my_requests'); },
    csv: function() { return Exports.exportJSON(myReqs, 'my_requests'); },
    print: function() { return window.print(); }
  });

  function esc(s) { return (s || '').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  function render() {
    var pending = myReqs.filter(function(r) { return ['pending_manager','pending_admin','pending_dept','pending_gm'].indexOf(r.status) >= 0; }).length;
    var approved = myReqs.filter(function(r) { return ['approved','completed'].indexOf(r.status) >= 0; }).length;
    var rejected = myReqs.filter(function(r) { return ['rejected','cancelled'].indexOf(r.status) >= 0; }).length;

    var html = '<div class="text-muted" style="padding:8px 0 16px 0;font-size:13px">جميع طلباتك. اضغط على أي طلب لعرض تفاصيله.</div>';
    html += '<div class="card">';
    html += '<div class="header-row" style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:14px">';
    html += '<h3>' + Icons.render("inbox") + ' طلباتي (' + myReqs.length + ')</h3>';
    html += '<button class="btn btn-primary" data-action="nav-new-request">' + Icons.render("plus") + ' طلب جديد</button></div>';

    if (notifs.length > 0) {
      html += '<div class="alert alert-info" style="margin-bottom:14px"><span>' + Icons.render("bell") + '</span> <span><b>آخر الإشعارات:</b> ';
      html += notifs.map(function(n) { return '<span class="badge badge-info">' + esc(n.title) + '</span>'; }).join(' ');
      html += '</span></div>';
    }

    if (myReqs.length === 0) {
      html += '<div class="empty-state" style="text-align:center;padding:30px">';
      html += '<div style="font-size:48px;color:var(--text-muted)">' + Icons.render("inbox") + '</div>';
      html += '<p style="color:var(--text-muted);margin-top:12px">لا توجد طلبات حتى الآن</p>';
      html += '<button class="btn btn-primary" data-action="nav-new-request" style="margin-top:12px">' + Icons.render("plus") + ' قدّم طلبك الأول</button></div>';
    } else {
      html += '<table class="data-table"><thead><tr><th>رقم الطلب</th><th>النوع</th><th>العنوان</th><th>التاريخ</th><th>المبلغ</th><th>الحالة</th><th>إجراءات</th></tr></thead><tbody>';
      myReqs.forEach(function(r) {
        var typeConfig = SelfService.REQUEST_TYPES.find(function(t) { return t.id === r.type; }) || {};
        html += '<tr><td><code>' + r.id.substring(0,12) + '</code></td>';
        html += '<td><span class="badge badge-info">' + esc(typeConfig.label || r.type) + '</span></td>';
        html += '<td>' + esc(r.title) + '</td>';
        html += '<td class="text-muted">' + new Date(r.createdAt).toLocaleDateString('ar-EG') + '</td>';
        html += '<td class="text-primary"><b>' + (r.amount ? r.amount.toLocaleString('ar-EG') + ' ر.ي' : '-') + '</b></td>';
        html += '<td><span class="badge ' + (SelfService.STATUS_COLORS[r.status] || 'badge-info') + '">' + esc(SelfService.STATUS_LABELS[r.status] || r.status) + '</span></td>';
        html += '<td><button class="btn btn-sm" data-action="view-request" data-rid="\'' + r.id + '\')" title="عرض">' + Icons.render("eye") + '</button>';
        if (['draft','pending_manager','pending_admin','pending_dept','pending_gm'].indexOf(r.status) >= 0) {
          html += ' <button class="btn btn-sm btn-danger" data-action="cancel-request" data-rid="\'' + r.id + '\')" title="إلغاء">' + Icons.render("x") + '</button>';
        }
        html += '</td></tr>';
      });
      html += '</tbody></table>';
    }
    html += '</div>';

    // Modal for details
    html += '<div id="requestDetailModal" class="modal-overlay" style="display:none;position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:1000;align-items:center;justify-content:center">';
    html += '<div class="modal-card" style="background:var(--bg-card);border-radius:12px;padding:20px;max-width:700px;width:90%;max-height:80vh;overflow:auto">';
    html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">';
    html += '<h3 id="requestDetailTitle" style="margin:0">تفاصيل الطلب</h3>';
    html += '<button class="btn btn-sm" data-action="modal-close2">' + Icons.render("x") + '</button></div>';
    html += '<div id="requestDetailBody"></div></div></div>';

    container.innerHTML = html;
  }

  Modules._viewRequest = function(id) {
    var db = APP.getDB();
    var req = db.requests.find(function(r) { return r.id === id; });
    if (!req) return;
    var typeConfig = SelfService.REQUEST_TYPES.find(function(t) { return t.id === req.type; }) || {};
    var body = document.getElementById('requestDetailBody');
    document.getElementById('requestDetailTitle').textContent = req.title;
    var html = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px">';
    html += '<div><b>النوع:</b> ' + esc(typeConfig.label || req.type) + '</div>';
    html += '<div><b>الحالة:</b> <span class="badge ' + (SelfService.STATUS_COLORS[req.status] || 'badge-info') + '">' + esc(SelfService.STATUS_LABELS[req.status] || req.status) + '</span></div>';
    html += '<div><b>التاريخ:</b> ' + new Date(req.createdAt).toLocaleString('ar-EG') + '</div>';
    html += '<div><b>الموظف:</b> ' + esc(req.employeeName) + ' (' + req.employeeId + ')</div>';
    if (req.amount) html += '<div><b>المبلغ:</b> ' + req.amount.toLocaleString('ar-EG') + ' ر.ي</div>';
    if (req.startDate) html += '<div><b>من تاريخ:</b> ' + req.startDate + '</div>';
    if (req.endDate) html += '<div><b>إلى تاريخ:</b> ' + req.endDate + '</div>';
    if (req.duration) html += '<div><b>المدة:</b> ' + esc(req.duration) + '</div>';
    html += '</div>';
    html += '<div style="margin-bottom:14px"><b>الوصف:</b><p style="background:var(--bg-darker);padding:10px;border-radius:6px;margin-top:6px">' + esc(req.description || '-') + '</p></div>';
    html += '<div><b>سجل الطلب:</b><ul style="margin-top:6px;list-style:none;padding:0">';
    (req.history || []).forEach(function(h) {
      html += '<li style="padding:6px 0;border-bottom:1px solid var(--border)">';
      html += '<span class="badge badge-info">' + esc(h.action) + '</span> <b>' + esc(h.by || '-') + '</b>';
      html += ' <span class="text-muted" style="font-size:12px">(' + esc(h.byRole || '-') + ') - ' + new Date(h.at).toLocaleString('ar-EG') + '</span>';
      if (h.note) html += '<div style="margin-top:4px;font-size:13px">' + esc(h.note) + '</div>';
      html += '</li>';
    });
    html += '</ul></div>';
    body.innerHTML = html;
    document.getElementById('requestDetailModal').style.display = 'flex';
  };

  Modules._cancelRequest = function(id) {
    if (!confirm('هل أنت متأكد من إلغاء هذا الطلب؟')) return;
    var db = APP.getDB();
    var req = db.requests.find(function(r) { return r.id === id; });
    if (req) {
      req.status = 'cancelled';
      req.history.push({ action: 'cancelled', by: APP.getCurrentUser().name, at: new Date().toISOString(), note: 'تم الإلغاء من قبل الموظف' });
      APP.saveDB(db);
      render();
    }
  };

  render();
};

// ===== صفحة "طلب جديد" =====
window.Modules.newRequest = function(container) {
  SelfService.initDB();
  var user = APP.getCurrentUser();
  if (!user) {
    container.innerHTML = '<div class="empty-state" style="text-align:center;padding:40px"><p style="color:var(--text-muted)">لم يتم تسجيل الدخول</p></div>';
    return;
  }

  Exports.register("newRequest", {
    label: "طلب جديد",
    pdf: function() { return window.print(); },
    excel: function() {},
    json: function() {},
    csv: function() {},
    print: function() { return window.print(); }
  });

  function esc(s) { return (s || '').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  function render() {
    var html = '<div class="text-muted" style="padding:8px 0 16px 0;font-size:13px">اختر نوع الطلب، ثم الفئة الفرعية، ثم عبّئ التفاصيل.</div>';
    html += '<div class="card">';
    html += '<h3>' + Icons.render("plus") + ' اختيار نوع الطلب</h3>';
    html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px">';
    SelfService.REQUEST_TYPES.forEach(function(t) {
      html += '<div class="request-type-card" data-action="select-req-type" data-tid="\'' + t.id + '\')">';
      html += '<div class="request-type-icon">' + Icons.render(t.icon) + '</div>';
      html += '<div class="request-type-label">' + esc(t.label) + '</div>';
      html += '<div class="request-type-dept">' + esc(t.dept) + ' - ' + t.subTypes.length + ' فئة</div>';
      if (t.specialFlow) html += '<div class="request-type-badge">مسار خاص</div>';
      html += '</div>';
    });
    html += '</div></div>';
    html += '<div id="newRequestForm" style="display:none"></div>';
    container.innerHTML = html;
  }

  Modules._selectRequestType = function(typeId) {
    var type = SelfService.REQUEST_TYPES.find(function(t) { return t.id === typeId; });
    if (!type) return;
    var form = document.getElementById('newRequestForm');
    var specialNote = type.specialFlow
      ? '<span class="badge badge-warning">مسار خاص</span> سيرفع الطلب إلى <b>' + esc(type.dept) + '</b> مباشرة، ثم إلى <b>المدير العام</b>.'
      : 'سيرفع الطلب إلى <b>المدير المباشر</b>، ثم <b>الإدارة (HR)</b>، ثم <b>المدير العام</b>.';

    var html = '<div class="card" style="margin-top:14px">';
    html += '<h3>' + Icons.render(type.icon) + ' ' + esc(type.label) + '</h3>';
    html += '<p class="text-muted" style="margin-bottom:14px">' + specialNote + '</p>';
    html += '<div class="form-group"><label>الفئة الفرعية *</label>';
    html += '<select id="req_subType" required data-change="subtype-change" data-typeid="\'' + typeId + '\')">';
    html += '<option value="">-- اختر الفئة --</option>';
    type.subTypes.forEach(function(st) {
      html += '<option value="' + st.id + '">' + esc(st.label) + '</option>';
    });
    html += '</select></div>';
    html += '<div id="subTypeForm"></div></div>';
    form.style.display = 'block';
    form.innerHTML = html;
    form.scrollIntoView({behavior: 'smooth'});
  };

  Modules._onSubTypeChange = function(typeId) {
    var subTypeId = document.getElementById('req_subType').value;
    if (!subTypeId) { document.getElementById('subTypeForm').innerHTML = ''; return; }
    var type = SelfService.REQUEST_TYPES.find(function(t) { return t.id === typeId; });
    var subType = type.subTypes.find(function(st) { return st.id === subTypeId; });
    if (!subType) return;

    var html = '<form class="form-grid" id="reqForm" onsubmit="event.preventDefault(); Modules._submitRequest(\'' + typeId + '\', \'' + subTypeId + '\');">';
    html += '<div class="form-group" style="grid-column: span 2"><label>عنوان الطلب *</label>';
    html += '<input type="text" id="req_title" required value="' + esc(subType.label) + '" /></div>';

    if (subType.requireDates) {
      html += '<div class="form-group"><label>تاريخ البداية *</label><input type="date" id="req_startDate" required /></div>';
      html += '<div class="form-group"><label>تاريخ النهاية *</label><input type="date" id="req_endDate" required /></div>';
    }
    if (subType.requireAmount) {
      html += '<div class="form-group"><label>المبلغ التقديري (ر.ي) *</label><input type="number" id="req_amount" min="0" required /></div>';
    }
    if (subType.extraField) {
      html += '<div class="form-group"><label>' + esc(subType.extraField) + ' *</label><input type="text" id="req_extraValue" required /></div>';
    }
    if (subType.requireReason) {
      html += '<div class="form-group" style="grid-column: span 2"><label>السبب / التفاصيل *</label><textarea id="req_reason" rows="3" required></textarea></div>';
    }
    if (subType.requireAttachment) {
      html += '<div class="form-group" style="grid-column: span 2"><label>' + esc(subType.attachmentLabel || 'مرفق') + ' *</label><input type="file" id="req_attachment" required /></div>';
    }
    html += '<div class="form-group" style="grid-column: span 2"><label>ملاحظات إضافية (اختياري)</label><textarea id="req_description" rows="2" placeholder="أي تفاصيل إضافية"></textarea></div>';
    html += '</form>';
    html += '<div class="btn-row" style="margin-top:14px">';
    html += '<button class="btn btn-secondary" data-action="modal-close2">' + Icons.render("x") + ' إلغاء</button>';
    html += '<button class="btn btn-primary" data-action="submit-request"\'' + typeId + '\', \'' + subTypeId + '\')">' + Icons.render("send") + ' تقديم الطلب</button>';
    html += '</div>';

    document.getElementById('subTypeForm').innerHTML = html;
  };

  Modules._submitRequest = function(typeId, subTypeId) {
    if (!subTypeId) { alert('الرجاء اختيار الفئة الفرعية'); return; }
    var data = {
      title: document.getElementById('req_title') ? document.getElementById('req_title').value.trim() : '',
      subType: subTypeId,
      description: document.getElementById('req_description') ? document.getElementById('req_description').value : '',
      amount: 0,
      duration: '',
      startDate: '',
      endDate: '',
      extraValue: document.getElementById('req_extraValue') ? document.getElementById('req_extraValue').value : ''
    };
    if (!data.title) { alert('الرجاء إدخال عنوان الطلب'); return; }

    var type = SelfService.REQUEST_TYPES.find(function(t) { return t.id === typeId; });
    var subType = type.subTypes.find(function(st) { return st.id === subTypeId; });

    if (subType.requireDates) {
      data.startDate = document.getElementById('req_startDate') ? document.getElementById('req_startDate').value : '';
      data.endDate = document.getElementById('req_endDate') ? document.getElementById('req_endDate').value : '';
      if (!data.startDate || !data.endDate) { alert('الرجاء إدخال التواريخ'); return; }
    }
    if (subType.requireAmount) {
      data.amount = parseFloat(document.getElementById('req_amount') ? document.getElementById('req_amount').value : 0);
      if (!data.amount || data.amount <= 0) { alert('الرجاء إدخال المبلغ'); return; }
    }
    if (subType.requireReason) {
      var reason = document.getElementById('req_reason') ? document.getElementById('req_reason').value : '';
      if (!reason) { alert('الرجاء إدخال السبب'); return; }
      data.description = reason + '\n\n' + data.description;
    }
    if (subType.extraField && data.extraValue) {
      data.description = subType.extraField + ': ' + data.extraValue + '\n' + data.description;
    }

    var req = SelfService.createRequest(typeId, data);
    if (req) {
      alert('تم تقديم الطلب بنجاح.\nرقم الطلب: ' + req.id + '\n\nيمكنك متابعة حالته من صفحة "طلباتي"');
      APP.navigate('myRequests');
    } else {
      alert('حدث خطأ في تقديم الطلب');
    }
  };

  render();
};

// ===== صفحة "الطلبات الواردة" للمدير =====
window.Modules.incomingRequests = function(container) {
  SelfService.initDB();
  var user = APP.getCurrentUser();
  if (!user) {
    container.innerHTML = '<div class="empty-state" style="text-align:center;padding:40px"><p style="color:var(--text-muted)">لم يتم تسجيل الدخول</p></div>';
    return;
  }

  Exports.register("incomingRequests", {
    label: "الطلبات الواردة",
    pdf: function() { return window.print(); },
    excel: function() { return Exports.exportJSON(SelfService.getIncomingRequests(), 'incoming'); },
    json: function() { return Exports.exportJSON(SelfService.getIncomingRequests(), 'incoming'); },
    csv: function() {},
    print: function() { return window.print(); }
  });

  function esc(s) { return (s || '').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  function render() {
    var incoming = SelfService.getIncomingRequests();
    var html = '<div class="text-muted" style="padding:8px 0 16px 0;font-size:13px">الطلبات الواردة إليك. اعتمد أو ارفض مع توضيح السبب.</div>';
    html += '<div class="card">';
    html += '<h3>' + Icons.render("incoming") + ' الطلبات الواردة (' + incoming.length + ')</h3>';

    if (incoming.length === 0) {
      html += '<div class="empty-state" style="text-align:center;padding:30px">';
      html += '<div style="font-size:48px;color:var(--text-muted)">' + Icons.render("inbox") + '</div>';
      html += '<p style="color:var(--text-muted);margin-top:12px">لا توجد طلبات واردة حالياً</p></div>';
    } else {
      html += '<table class="data-table"><thead><tr><th>رقم الطلب</th><th>الموظف</th><th>النوع</th><th>العنوان</th><th>المبلغ</th><th>التاريخ</th><th>إجراءات</th></tr></thead><tbody>';
      incoming.forEach(function(r) {
        var typeConfig = SelfService.REQUEST_TYPES.find(function(t) { return t.id === r.type; }) || {};
        html += '<tr><td><code>' + r.id.substring(0,12) + '</code></td>';
        html += '<td>' + esc(r.employeeName) + '<br><span class="text-muted" style="font-size:11px">' + esc(r.department) + '</span></td>';
        html += '<td><span class="badge badge-info">' + esc(typeConfig.label || r.type) + '</span></td>';
        html += '<td>' + esc(r.title) + '</td>';
        html += '<td class="text-primary"><b>' + (r.amount ? r.amount.toLocaleString('ar-EG') + ' ر.ي' : '-') + '</b></td>';
        html += '<td class="text-muted">' + new Date(r.createdAt).toLocaleDateString('ar-EG') + '</td>';
        html += '<td>';
        html += '<button class="btn btn-sm" data-action="view-request" data-rid="\'' + r.id + '\')" title="عرض">' + Icons.render("eye") + '</button> ';
        html += '<button class="btn btn-sm btn-success" data-action="approve-request" data-rid="\'' + r.id + '\')" title="اعتماد">' + Icons.render("check") + '</button> ';
        html += '<button class="btn btn-sm btn-danger" data-action="reject-request" data-rid="\'' + r.id + '\')" title="رفض">' + Icons.render("x") + '</button>';
        html += '</td></tr>';
      });
      html += '</tbody></table>';
    }
    html += '</div>';
    container.innerHTML = html;
  }

  Modules._approveRequest = function(id) {
    if (!confirm('هل تريد اعتماد هذا الطلب؟')) return;
    var note = prompt('ملاحظة (اختياري):', '');
    if (SelfService.approveRequest(id, note)) {
      alert('تم اعتماد الطلب وإحالته للمرحلة التالية');
      render();
    } else {
      alert('خطأ في اعتماد الطلب');
    }
  };

  Modules._rejectRequestUI = function(id) {
    var reason = prompt('سبب الرفض:');
    if (!reason) { alert('الرجاء إدخال سبب الرفض'); return; }
    if (SelfService.rejectRequest(id, reason)) {
      alert('تم رفض الطلب وإبلاغ الموظف');
      render();
    } else {
      alert('خطأ في رفض الطلب');
    }
  };

  render();
};

// ===== لوحة التحكم الشخصية =====
window.Modules.myDashboard = function(container) {
  var user = APP.getCurrentUser();
  if (!user) return;
  SelfService.initDB();
  var db = APP.getDB();
  var myReqs = SelfService.getMyRequests();
  var notifs = (db.notifications || []).filter(function(n) { return n.for === user.empId || n.for === user.username; });
  var unread = notifs.filter(function(n) { return !n.read; }).length;
  var emp = db.employeesLog.find(function(e) { return e.empId === user.empId; }) || {};

  var salary = parseFloat(emp.salary || 0);
  var allowances = parseFloat(emp.allowances || 0);
  var housing = parseFloat(emp.housingAllowance || 0);
  var total = salary + allowances + housing;
  var pendingReqs = myReqs.filter(function(r) { return ['pending_manager','pending_admin','pending_dept','pending_gm'].indexOf(r.status) >= 0; }).length;
  var approvedReqs = myReqs.filter(function(r) { return ['approved','completed'].indexOf(r.status) >= 0; }).length;

  function esc(s) { return (s || '').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  var html = '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px;margin-bottom:20px">';
  html += '<div class="stat-card"><div class="stat-label">إجمالي طلباتي</div><div class="stat-value">' + myReqs.length + '</div></div>';
  html += '<div class="stat-card"><div class="stat-label">بانتظار الموافقة</div><div class="stat-value" style="color:var(--warning)">' + pendingReqs + '</div></div>';
  html += '<div class="stat-card"><div class="stat-label">معتمدة</div><div class="stat-value" style="color:var(--success)">' + approvedReqs + '</div></div>';
  html += '<div class="stat-card"><div class="stat-label">إشعارات غير مقروءة</div><div class="stat-value" style="color:var(--primary)">' + unread + '</div></div>';
  html += '</div>';

  html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">';
  html += '<div class="card"><h3>' + Icons.render("user") + ' بياناتي</h3>';
  html += '<table style="width:100%;font-size:13px">';
  html += '<tr><td class="text-muted" width="120">الاسم</td><td><b>' + esc(emp.name || '-') + '</b></td></tr>';
  html += '<tr><td class="text-muted">رقم البطاقة</td><td>' + esc(emp.displayId || '-') + ' (' + esc(emp.empId || '-') + ')</td></tr>';
  html += '<tr><td class="text-muted">القسم</td><td>' + esc(emp.department || '-') + '</td></tr>';
  html += '<tr><td class="text-muted">المسمى الوظيفي</td><td>' + esc(emp.position || '-') + '</td></tr>';
  html += '<tr><td class="text-muted">تاريخ التعيين</td><td>' + esc(emp.hireDate || '-') + '</td></tr>';
  html += '<tr><td class="text-muted">رقم الهاتف</td><td>' + esc(emp.phone || '-') + '</td></tr>';
  html += '</table>';
  html += '<div class="btn-row" style="margin-top:12px"><button class="btn btn-sm" data-action="nav-profile2">' + Icons.render("edit") + ' تعديل بياناتي</button></div>';
  html += '</div>';

  html += '<div class="card"><h3>' + Icons.render("fileText") + ' رواتبي الشهرية</h3>';
  html += '<table style="width:100%;font-size:13px">';
  html += '<tr><td class="text-muted" width="120">الراتب الأساسي</td><td class="text-primary"><b>' + salary.toLocaleString('ar-EG') + ' ر.ي</b></td></tr>';
  html += '<tr><td class="text-muted">البدلات</td><td>' + allowances.toLocaleString('ar-EG') + ' ر.ي</td></tr>';
  html += '<tr><td class="text-muted">بدل السكن</td><td>' + housing.toLocaleString('ar-EG') + ' ر.ي</td></tr>';
  html += '<tr style="border-top:2px solid var(--border)"><td class="text-muted"><b>الإجمالي</b></td><td class="text-primary" style="font-size:16px"><b>' + total.toLocaleString('ar-EG') + ' ر.ي</b></td></tr>';
  html += '</table></div>';
  html += '</div>';

  html += '<div class="card" style="margin-top:14px"><h3>' + Icons.render("bell") + ' آخر الإشعارات</h3>';
  if (notifs.length === 0) {
    html += '<p class="text-muted" style="padding:10px 0">لا توجد إشعارات</p>';
  } else {
    html += '<table class="data-table"><thead><tr><th>العنوان</th><th>الرسالة</th><th>التاريخ</th><th></th></tr></thead><tbody>';
    notifs.slice(-10).reverse().forEach(function(n) {
      html += '<tr' + (n.read ? ' style="opacity:0.5"' : '') + '>';
      html += '<td><b>' + esc(n.title) + '</b></td><td>' + esc(n.message) + '</td>';
      html += '<td class="text-muted" style="font-size:12px">' + new Date(n.createdAt).toLocaleDateString('ar-EG') + '</td>';
      html += '<td>' + (n.read ? '' : '<span class="badge badge-info">جديد</span>') + '</td></tr>';
    });
    html += '</tbody></table>';
  }
  html += '</div>';

  container.innerHTML = html;
};

// ===== كشف الراتب الشهري =====
window.Modules.salarySlip = function(container) {
  var user = APP.getCurrentUser();
  if (!user) return;
  SelfService.initDB();
  var db = APP.getDB();
  var emp = db.employeesLog.find(function(e) { return e.empId === user.empId; }) || {};
  var now = new Date();
  var months = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
  var monthName = months[now.getMonth()];
  var year = now.getFullYear();

  var salary = parseFloat(emp.salary || 0);
  var allowances = parseFloat(emp.allowances || 0);
  var housing = parseFloat(emp.housingAllowance || 0);
  var net = salary + allowances + housing;

  Exports.register("salarySlip", {
    label: "كشف الراتب",
    pdf: function() { return window.print(); },
    excel: function() {},
    json: function() {},
    csv: function() {},
    print: function() { return window.print(); }
  });

  function esc(s) { return (s || '').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function toArabicWords(num) {
    var units = ['','واحد','اثنان','ثلاثة','أربعة','خمسة','ستة','سبعة','ثمانية','تسعة','عشرة'];
    return Math.floor(num).toString().replace(/\d/g, function(d) { return units[parseInt(d)]; }).replace(/,/g,' و') || 'صفر';
  }

  var html = '<div class="card">';
  html += '<div style="text-align:center;border-bottom:2px solid var(--border);padding-bottom:14px;margin-bottom:14px">';
  html += '<h2 style="margin:0">' + Icons.render("fileText") + ' مصنع سيلين للمياه المعدنية والمرطبات</h2>';
  html += '<h3 style="margin:8px 0 4px 0;color:var(--primary)">كشف الراتب الشهري</h3>';
  html += '<p style="margin:0" class="text-muted">' + monthName + ' ' + year + '</p></div>';

  html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">';
  html += '<div><h4 style="margin:0 0 10px 0;border-bottom:1px solid var(--border);padding-bottom:6px">بيانات الموظف</h4>';
  html += '<table style="width:100%;font-size:13px">';
  html += '<tr><td class="text-muted">الاسم</td><td><b>' + esc(emp.name || '-') + '</b></td></tr>';
  html += '<tr><td class="text-muted">رقم الموظف</td><td>' + esc(emp.displayId || '-') + '</td></tr>';
  html += '<tr><td class="text-muted">القسم</td><td>' + esc(emp.department || '-') + '</td></tr>';
  html += '<tr><td class="text-muted">المسمى الوظيفي</td><td>' + esc(emp.position || '-') + '</td></tr>';
  html += '<tr><td class="text-muted">تاريخ التعيين</td><td>' + esc(emp.hireDate || '-') + '</td></tr>';
  html += '</table></div>';

  html += '<div><h4 style="margin:0 0 10px 0;border-bottom:1px solid var(--border);padding-bottom:6px">الاستحقاقات</h4>';
  html += '<table style="width:100%;font-size:13px">';
  html += '<tr><td class="text-muted">الراتب الأساسي</td><td style="text-align:left">' + salary.toLocaleString('ar-EG') + '</td></tr>';
  html += '<tr><td class="text-muted">البدلات</td><td style="text-align:left">' + allowances.toLocaleString('ar-EG') + '</td></tr>';
  html += '<tr><td class="text-muted">بدل السكن</td><td style="text-align:left">' + housing.toLocaleString('ar-EG') + '</td></tr>';
  html += '<tr style="border-top:2px solid var(--border)"><td><b>الإجمالي</b></td><td class="text-primary" style="text-align:left"><b>' + net.toLocaleString('ar-EG') + '</b></td></tr>';
  html += '</table></div>';
  html += '</div>';

  html += '<div style="text-align:center;margin-top:20px;padding-top:14px;border-top:2px solid var(--border)">';
  html += '<p style="margin:0;font-size:18px"><b>صافي الراتب: ' + net.toLocaleString('ar-EG') + ' ر.ي</b></p>';
  html += '<p style="margin:4px 0 0 0" class="text-muted">فقط ' + toArabicWords(net) + ' ريال يمني</p>';
  html += '</div>';
  html += '<div class="btn-row" style="margin-top:14px">';
  html += '<button class="btn btn-primary" data-action="print-page2">' + Icons.render("printer") + ' طباعة</button>';
  html += '</div></div>';

  container.innerHTML = html;
};

console.log('Self-service modules v2 loaded (string concat only)');


// ============================================================
// GLOBAL EVENT DELEGATION - NO INLINE onclick/oninput/onchange
// All module interactions go through data-* attributes
// ============================================================
(function() {
  document.addEventListener('click', function(e) {
    var el = e.target.closest('[data-action]');
    if (!el) return;
    var action = el.dataset.action;

    // --- Pricing ---
    if (action === 'save-pricing') { Modules._savePricing && Modules._savePricing(); return; }

    // --- Vouchers ---
    if (action === 'add-voucher') { Modules._addVoucher && Modules._addVoucher(); return; }
    if (action === 'delete-voucher') { var idx = parseInt(el.dataset.vidx); Modules._deleteVoucher && Modules._deleteVoucher(idx); return; }

    // --- Sales ---
    // --- Sales Rep Management ---
    if (action === 'add-rep-form') { var f = document.getElementById('addRepForm'); if(f) f.style.display = f.style.display==='none'?'block':'none'; var ef = document.getElementById('editRepForm'); if(ef) ef.style.display='none'; return; }
    if (action === 'cancel-rep-form') { var af = document.getElementById('addRepForm'); var ef = document.getElementById('editRepForm'); if(af) af.style.display='none'; if(ef) ef.style.display='none'; return; }
    if (action === 'save-rep') { Modules._saveRep && Modules._saveRep(); return; }
    if (action === 'update-rep') { Modules._updateRep && Modules._updateRep(); return; }
    if (action === 'edit-rep') { var id = parseInt(el.dataset.repId); Modules._editRep && Modules._editRep(id); return; }
    if (action === 'delete-rep') { var id = parseInt(el.dataset.repId); var name = el.dataset.repName; Modules._deleteRep && Modules._deleteRep(id, name); return; }
    if (action === 'submit-collection') { Modules._submitCollection && Modules._submitCollection(); return; }
    if (action === 'export-sales') { Modules.exportTable && Modules.exportTable('salesReps', 'أداء_المناديب'); return; }

    // --- Agents ---
    if (action === 'delete-agent') { var idx = parseInt(el.dataset.aidx); Modules._deleteAgent && Modules._deleteAgent(idx); return; }
    if (action === 'add-agent') { Modules._addAgent && Modules._addAgent(); return; }

    // --- Lab ---
    if (action === 'add-lab') { Modules._addLab && Modules._addLab(); return; }
    if (action === 'delete-lab') { var idx = parseInt(el.dataset.lidx); Modules._deleteLab && Modules._deleteLab(idx); return; }

    // --- Cash Flow (in modules2.js already has its own delegation) ---
    if (['add-incoming','add-outgoing','auto-post','view-alerts','add-customer-credit',
         'edit-credit','unblock-credit','receive-payment','resolve-alert',
         'mark-read','delete-flow','close-modal'].indexOf(action) !== -1) { return; /* handled by module */ }

    // --- Procurement / Purchase Requests ---
    if (action === 'pr-view-incoming') { var pidx = parseInt(el.dataset.pidx); Modules._prViewIncoming && Modules._prViewIncoming(pidx); return; }
    if (action === 'pr-approve') { var pidx = parseInt(el.dataset.pidx); Modules._prApprove && Modules._prApprove(pidx); return; }
    if (action === 'pr-reject') { var pidx = parseInt(el.dataset.pidx); Modules._prReject && Modules._prReject(pidx); return; }
    if (action === 'pr-toggle-all') { Modules._prToggleRequests && Modules._prToggleRequests(); return; }
    if (action === 'add-purchase') { Modules._addPurchase && Modules._addPurchase(); return; }

    // --- HR Tabs ---
    if (action === 'hr-tab-registry') { Modules._hrTab && Modules._hrTab('registry'); return; }
    if (action === 'nav-orgtree') { APP.navigate && APP.navigate('orgtree'); return; }
    if (action === 'nav-orgchart') { APP.navigate && APP.navigate('orgchart'); return; }
    if (action === 'nav-permissions') { APP.navigate && APP.navigate('permissions'); return; }
    if (action === 'nav-terminated') { APP.navigate && APP.navigate('terminated'); return; }

    // --- HR Employees ---
    if (action === 'add-employee') { Modules._addEmployee && Modules._addEmployee(); return; }
    if (action === 'edit-employee') { Modules._editEmployee && Modules._editEmployee(el.dataset.eid); return; }
    if (action === 'change-status') { Modules._changeStatus && Modules._changeStatus(el.dataset.eid); return; }
    if (action === 'delete-employee') { Modules._deleteEmployee && Modules._deleteEmployee(el.dataset.eid); return; }
    if (action === 'toggle-dept') { Modules._toggleDeptSection && Modules._toggleDeptSection(parseInt(el.dataset.didx)); return; }
    if (action === 'save-employee') { Modules._saveEmployee && Modules._saveEmployee(); return; }

    // --- HR Users ---
    if (action === 'save-user') { Modules._saveUser && Modules._saveUser(); return; }
    if (action === 'cancel-user-edit') { Modules._cancelUserEdit && Modules._cancelUserEdit(); return; }
    if (action === 'add-user') { Modules._addUser && Modules._addUser(); return; }
    if (action === 'edit-user') { Modules._editUser && Modules._editUser(parseInt(el.dataset.uidx)); return; }
    if (action === 'toggle-user') { Modules._toggleUser && Modules._toggleUser(parseInt(el.dataset.uidx)); return; }
    if (action === 'edit-permissions') { Modules._editPermissions && Modules._editPermissions(parseInt(el.dataset.puid)); return; }
    if (action === 'save-permissions') { Modules._savePermissions && Modules._savePermissions(parseInt(el.dataset.spuid)); return; }
    if (action === 'reset-user-form') { var uf = document.getElementById('userForm'); if (uf) uf.reset(); return; }

    // --- Profile ---
    if (action === 'change-password') { Modules._changePassword && Modules._changePassword(); return; }
    if (action === 'save-idcard') { Modules._saveIDCardData && Modules._saveIDCardData(parseInt(el.dataset.eid)); return; }
    if (action === 'terminate-employee') { Modules._terminateEmployee && Modules._terminateEmployee(parseInt(el.dataset.eid)); return; }
    if (action === 'nav-new-request') { APP.navigate && APP.navigate('newRequest'); return; }

    // --- Documents ---
    if (action === 'delete-doc') {
      Modules._deleteEmployeeDocument && Modules._deleteEmployeeDocument(parseInt(el.dataset.eid), el.dataset.doctype);
      return;
    }

    // --- Spare Requests ---
    if (action === 'pr-start-spare') { Modules._prStartSpare && Modules._prStartSpare(); return; }
    if (action === 'pr-tab') { Modules._prSwitchTab && Modules._prSwitchTab(el.dataset.tab); return; }
    if (action === 'pr-edit') { Modules._prEditRequest && Modules._prEditRequest(parseInt(el.dataset.pidx)); return; }
    if (action === 'pr-cancel') { Modules._prCancelRequest && Modules._prCancelRequest(parseInt(el.dataset.pidx)); return; }
    if (action === 'pr-remind') { Modules._prRemind && Modules._prRemind(parseInt(el.dataset.pidx)); return; }
    if (action === 'pr-view') { Modules._prViewRequest && Modules._prViewRequest(parseInt(el.dataset.pidx)); return; }
    if (action === 'pr-submit-raw') { Modules._prSubmitRaw && Modules._prSubmitRaw(); return; }
    if (action === 'pr-add-spare-item') { Modules._prAddSpareItem && Modules._prAddSpareItem(); return; }
    if (action === 'pr-submit-spare') { Modules._prSubmitSpare && Modules._prSubmitSpare(el.dataset.sid === 'null' ? null : el.dataset.sid); return; }
    if (action === 'remove-spare-item') { var f = el.closest('.spare-item-form'); if (f) f.remove(); Modules._prRenumberItems && Modules._prRenumberItems(); return; }

    // --- Self-service ---
    if (action === 'view-request') { Modules._viewRequest && Modules._viewRequest(el.dataset.rid); return; }
    if (action === 'cancel-request') { Modules._cancelRequest && Modules._cancelRequest(el.dataset.rid); return; }
    if (action === 'approve-request') { Modules._approveRequest && Modules._approveRequest(el.dataset.rid); return; }
    if (action === 'reject-request') { Modules._rejectRequestUI && Modules._rejectRequestUI(el.dataset.rid); return; }
    if (action === 'select-req-type') { Modules._selectRequestType && Modules._selectRequestType(el.dataset.tid); return; }
    if (action === 'submit-request') { Modules._submitRequest && Modules._submitRequest(el.dataset.typeid, el.dataset.subtypeid); return; }

    // --- Reports ---
    if (action === 'export-pdf') { Modules.exportToPDF && Modules.exportToPDF(); return; }
    if (action === 'export-excel') { Modules.exportToExcel && Modules.exportToExcel(); return; }
    if (action === 'export-backup') { Modules.exportBackup && Modules.exportBackup(); return; }
    if (action === 'print-page') { window.print && window.print(); return; }

    // --- File trigger (opens file input) ---
    if (action === 'file-trigger') { var target = el.dataset.target; var inp = document.getElementById(target); if (inp) inp.click(); return; }

    // --- Modal close ---
    if (action === 'modal-close') {
      var m = el.closest('.modal-overlay') || el.closest('.modal-content') ||
              el.closest('[class*="modal"]') || el.closest('[id*="modal"]') ||
              el.closest('#editEmpModal') || el.closest('#permissionsModal') ||
              el.closest('#requestDetailModal') || el.closest('#newRequestForm') ||
              el.closest('.modal');
      if (m) { m.style.display = 'none'; return; }
      // Handle specific target
      var target = el.dataset.target;
      if (target) { var specific = document.getElementById(target); if (specific) specific.style.display = 'none'; }
      return;
    }

    // --- Dev tools ---
    if (action === 'dev-save-menu') { Modules._dev_saveMenu && Modules._dev_saveMenu(); return; }
    if (action === 'dev-save-page') { Modules._dev_savePage && Modules._dev_savePage(); return; }
    if (action === 'dev-add-menu') { Modules._dev_addMenu && Modules._dev_addMenu(); return; }
    if (action === 'dev-delete-menu') { Modules._dev_deleteMenu && Modules._dev_deleteMenu(el.dataset.dmi); return; }
    if (action === 'dev-show-add-page') { Modules._dev_showAddPage && Modules._dev_showAddPage(); return; }
    if (action === 'dev-preview-page') { Modules._dev_previewPage && Modules._dev_previewPage(el.dataset.pid); return; }
    if (action === 'dev-delete-page') { Modules._dev_deletePage && Modules._dev_deletePage(el.dataset.dpi); return; }
    if (action === 'dev-save-theme') { Modules._dev_saveTheme && Modules._dev_saveTheme(); return; }
    if (action === 'dev-reset-theme') { Modules._dev_resetTheme && Modules._dev_resetTheme(); return; }
    if (action === 'dev-add-field') { Modules._dev_addField && Modules._dev_addField(); return; }
    if (action === 'dev-delete-field') { Modules._dev_deleteField && Modules._dev_deleteField(el.dataset.dfi); return; }
    if (action === 'dev-add-link') { Modules._dev_addLink && Modules._dev_addLink(); return; }
    if (action === 'dev-test-link') { Modules._dev_testLink && Modules._dev_testLink(el.dataset.tli); return; }
    if (action === 'dev-delete-link') { Modules._dev_deleteLink && Modules._dev_deleteLink(el.dataset.dli); return; }
    if (action === 'dev-export-json') { Exports.exportJSON && Exports.exportJSON(APP.getDB(), 'celein_backup'); return; }
    if (action === 'dev-reset-users') { Modules._dev_resetUsers && Modules._dev_resetUsers(); return; }
    if (action === 'dev-clear-custom') { Modules._dev_clearCustomizations && Modules._dev_clearCustomizations(); return; }
    if (action === 'dev-factory-reset') { Modules._dev_factoryReset && Modules._dev_factoryReset(); return; }
    if (action === 'dev-tab2') { Modules._dev_showTab && Modules._dev_showTab(el.dataset.tab2); return; }
    // --- Org chart ---
    if (action === 'orgchart-pdf') { Modules._exportOrgChart && Modules._exportOrgChart('pdf'); return; }
    if (action === 'orgchart-print') { Modules._exportOrgChart && Modules._exportOrgChart('print'); return; }
    if (action === 'expand-all-depts') { Modules._expandAllDepts && Modules._expandAllDepts(); return; }
    if (action === 'collapse-all-depts') { Modules._collapseAllDepts && Modules._collapseAllDepts(); return; }
    // --- Org tree ---
    if (action === 'orgtree-zoom-in') { Modules._orgtreeZoom && Modules._orgtreeZoom(0.2); return; }
    if (action === 'orgtree-zoom-out') { Modules._orgtreeZoom && Modules._orgtreeZoom(-0.2); return; }
    if (action === 'orgtree-reset') { Modules._orgtreeReset && Modules._orgtreeReset(); return; }
    if (action === 'orgtree-fit') { Modules._orgtreeFit && Modules._orgtreeFit(); return; }
    if (action === 'orgtree-select') { Modules._orgtreeSelect && Modules._orgtreeSelect(el.dataset.nid); return; }
    if (action === 'orgtree-toggle') { Modules._orgtreeToggle && Modules._orgtreeToggle(el.dataset.nid3); return; }
    if (action === 'toggle-dept2') { Modules._toggleDept && Modules._toggleDept(el.dataset.dname); return; }
    if (action === 'toggle-dept') { Modules._toggleDeptSection && Modules._toggleDeptSection(parseInt(el.dataset.didx)); return; }
    // --- Procurement ---
    if (action === 'export-inventory') { Modules.exportTable && Modules.exportTable('inventory', 'جرد_المخزون'); return; }
    if (action === 'pr-start-raw') { Modules._prStartRaw && Modules._prStartRaw(); return; }
    // --- HR ---
    if (action === 'reinstate-employee') { Modules._reinstateEmployee && Modules._reinstateEmployee(parseInt(el.dataset.eid2)); return; }
    // --- Self-service nav ---
    if (action === 'nav-my-requests') { APP.navigate && APP.navigate('myRequests'); return; }
    if (action === 'nav-profile2') { APP.navigate && APP.navigate('profile'); return; }
    if (action === 'modal-close-pm') { var pm = document.getElementById('permissionsModal'); if (pm) pm.style.display = 'none'; return; }
    if (action === 'modal-close2') {
      var candidates = ['permissionsModal','editMenuModal','addPageModal','requestDetailModal','newRequestForm'];
      candidates.forEach(function(id) { var m = document.getElementById(id); if (m) m.style.display = 'none'; });
      return;
    }
    if (action === 'do-auto-post') { Modules._doAutoPost && Modules._doAutoPost(); return; }
    if (action === 'print-page2') { window.print && window.print(); return; }
    // --- Sales Entry ---
    if (action === 'se-submit') { window.__SE && window.__SE.submit && window.__SE.submit(); return; }
    if (action === 'se-reset') { window.__SE && window.__SE.reset && window.__SE.reset(); return; }
    if (action === 'se-qty-change' || action === 'se-price-change' || action === 'se-cash-change' || action === 'se-credit-change') { window.__SE && window.__SE.calc && window.__SE.calc(); return; }
    // --- My Sales (rep) delegation ---
    if (action === 'rs-submit') { window.__RS && window.__RS.submit && window.__RS.submit(); return; }
    if (action === 'rs-reset') { window.__RS && window.__RS.reset && window.__RS.reset(); return; }
    if (action === 'rs-qty' || action === 'rs-price' || action === 'rs-cash' || action === 'rs-credit') { window.__RS && window.__RS.calc && window.__RS.calc(); return; }

  });

  // --- INPUT delegation (data-input attributes) ---
  document.addEventListener('input', function(e) {
    var el = e.target;
    var inp = el.dataset.input;
    if (!inp) return;
    if (inp === 'filter-depts') { Modules._filterDepts && Modules._filterDepts(); return; }
    if (inp === 'filter-users') { Modules._filterUsers && Modules._filterUsers(); return; }
  });

  // --- CHANGE delegation (data-change attributes) ---
  document.addEventListener('change', function(e) {
    var el = e.target;
    var chg = el.dataset.change;
    if (!chg) return;
    if (chg === 'calc-p') { Modules._pRecalculate && Modules._pRecalculate(); return; }
    if (chg === 'calc-pr') { Modules._prRecalculate && Modules._prRecalculate(); return; }
    if (chg === 'supplier-changed') { Modules._pSupplierChanged && Modules._pSupplierChanged(); return; }
    if (chg === 'material-changed') { Modules._pMaterialChanged && Modules._pMaterialChanged(); return; }
    if (chg === 'machine-changed') { Modules._prMachineChanged && Modules._prMachineChanged(); return; }
    if (chg === 'subtype-change') {
      Modules._onSubTypeChange && Modules._onSubTypeChange(el.dataset.typeid);
      return;
    }
    if (chg === 'file-upload') {
      Modules._handleFileUpload && Modules._handleFileUpload(el, el.dataset.type, parseInt(el.dataset.eid));
      return;
    }
    if (chg === 'restore-file') {
      Modules._dev_restoreFile && Modules._dev_restoreFile(e);
      return;
    }
    if (chg === 'spare-photo') {
      Modules._prHandlePhoto && Modules._prHandlePhoto(el, el.dataset.ptype, parseInt(el.dataset.pidx));
      return;
    }
  });
})();
