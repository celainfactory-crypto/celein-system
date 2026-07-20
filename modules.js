/* ============================================================
   سيلين - وحدات النظام
   ============================================================ */

window.Modules = {};

/* ============ لوحة التحكم ============ */
window.Modules.dashboard = function(container) {
  const db = APP.getDB();
  // تسجيل دالة التصدير
  Exports.register("dashboard", {
    label: "لوحة التحكم",
    pdf: () => {
      const kpi = DB.dashboardKPI(db);
      const pl = DB.profitLoss(db);
      const be = DB.breakEven(db);
      const html = `
        <div class="kpi-grid">
          <div class="kpi"><div class="label">إنتاج الشهر (كرتون)</div><div class="value">${kpi.monthProd.toLocaleString('ar-EG')}</div></div>
          <div class="kpi"><div class="label">مبيعات الشهر (ر.ي)</div><div class="value">${kpi.totalSalesAmount.toLocaleString('ar-EG')}</div></div>
          <div class="kpi"><div class="label">تحصيلات الشهر (ر.ي)</div><div class="value">${kpi.totalCollection.toLocaleString('ar-EG')}</div></div>
          <div class="kpi"><div class="label">مصروفات الشهر (ر.ي)</div><div class="value">${kpi.monthExp.toLocaleString('ar-EG')}</div></div>
          <div class="kpi"><div class="label">إجمالي المخزون (كرتون)</div><div class="value">${kpi.totalInventory.toLocaleString('ar-EG')}</div></div>
          <div class="kpi"><div class="label">مديونيات المناديب (ر.ي)</div><div class="value">${kpi.totalReceivables.toLocaleString('ar-EG')}</div></div>
          <div class="kpi"><div class="label">نقطة التعادل الشهرية (كرتون)</div><div class="value">${be.breakEvenMonthly.toFixed(0).toLocaleString('ar-EG')}</div></div>
          <div class="kpi"><div class="label">صافي الربح/الخسارة (ر.ي)</div><div class="value ${pl.netProfit>=0?'text-success':'text-danger'}">${pl.netProfit.toLocaleString('ar-EG')}</div></div>
        </div>
        <h2>الإيرادات مقابل التكاليف</h2>
        <table>
          <tbody>
            <tr><td>إجمالي الإيرادات (المبيعات)</td><td class="text-success">${pl.revenue.toLocaleString('ar-EG')} ر.ي</td></tr>
            <tr><td>تكلفة البضاعة المباعة</td><td class="text-danger">${pl.cogs.toLocaleString('ar-EG')} ر.ي</td></tr>
            <tr><td><b>إجمالي الربح</b></td><td class="text-primary"><b>${pl.grossProfit.toLocaleString('ar-EG')} ر.ي</b></td></tr>
            <tr><td>المصروفات العمومية</td><td class="text-warning">${pl.monthExp.toLocaleString('ar-EG')} ر.ي</td></tr>
            <tr><td><b>صافي الربح/الخسارة</b></td><td class="${pl.netProfit>=0?'text-success':'text-danger'}"><b>${pl.netProfit.toLocaleString('ar-EG')} ر.ي</b></td></tr>
          </tbody>
        </table>
      `;
      Exports.exportPDF("لوحة التحكم - المؤشرات اللحظية", html, "dashboard");
    },
    excel: () => {
      const kpi = DB.dashboardKPI(db);
      const pl = DB.profitLoss(db);
      const headers = ['المؤشر', 'القيمة'];
      const rows = [
        ['إنتاج الشهر (كرتون)', kpi.monthProd.toLocaleString('ar-EG')],
        ['مبيعات الشهر (ر.ي)', kpi.totalSalesAmount.toLocaleString('ar-EG')],
        ['تحصيلات الشهر (ر.ي)', kpi.totalCollection.toLocaleString('ar-EG')],
        ['مصروفات الشهر (ر.ي)', kpi.monthExp.toLocaleString('ar-EG')],
        ['إجمالي المخزون (كرتون)', kpi.totalInventory.toLocaleString('ar-EG')],
        ['مديونيات المناديب (ر.ي)', kpi.totalReceivables.toLocaleString('ar-EG')],
        ['الإيرادات (ر.ي)', pl.revenue],
        ['تكلفة البضاعة (ر.ي)', pl.cogs],
        ['إجمالي الربح (ر.ي)', pl.grossProfit],
        ['صافي الربح/الخسارة (ر.ي)', pl.netProfit]
      ];
      const html = Exports.rowsToHTMLTable(headers, rows, { title: 'لوحة التحكم - نظرة لحظية' });
      Exports.exportExcel(html, "dashboard");
    },
    csv: () => {
      const kpi = DB.dashboardKPI(db);
      const headers = ['المؤشر', 'القيمة'];
      const rows = [
        ['إنتاج الشهر (كرتون)', kpi.monthProd],
        ['مبيعات الشهر (ر.ي)', kpi.totalSalesAmount],
        ['تحصيلات الشهر (ر.ي)', kpi.totalCollection],
        ['مصروفات الشهر (ر.ي)', kpi.monthExp],
        ['مخزون (كرتون)', kpi.totalInventory],
        ['مديونيات (ر.ي)', kpi.totalReceivables]
      ];
      Exports.exportCSV(Exports.rowsToCSV(headers, rows), "dashboard");
    },
    json: () => Exports.exportJSON(db, "dashboard_backup"),
    print: () => window.print()
  });
  const kpi = DB.dashboardKPI(db);
  const pl = DB.profitLoss(db);
  const be = DB.breakEven(db);

  const lastProductions = db.productionLog.slice(-10).reverse();
  const today = new Date().toISOString().split('T')[0];

  container.innerHTML = `
    <div class="alert alert-info">
      ${Icons.render('info')}
      <span>مرحباً <b>${APP.getUser().name}</b> — هذه نظرة لحظية على عمليات مصنع سيلين. كل الأرقام تُحدَّث فوراً عند تعديل المدخلات.</span>
    </div>

    <div class="kpi-grid">
      <div class="kpi-card success">
        <div class="label"><span class="ic">${Icons.render('factoryKpi')}</span> إنتاج اليوم (كرتون)</div>
        <div class="value">${kpi.todayProd.toLocaleString('ar-EG')}</div>
        <div class="delta">الشهري: ${kpi.monthProd.toLocaleString('ar-EG')} كرتون</div>
      </div>
      <div class="kpi-card info">
        <div class="label"><span class="ic">${Icons.render('cash')}</span> مبيعات الشهر</div>
        <div class="value">${(kpi.totalSalesAmount/1000).toFixed(0)}K</div>
        <div class="delta">${kpi.totalSalesQty.toLocaleString('ar-EG')} كرتون مباع</div>
      </div>
      <div class="kpi-card success">
        <div class="label"><span class="ic">${Icons.render('collection')}</span> تحصيلات الشهر</div>
        <div class="value">${(kpi.totalCollection/1000).toFixed(0)}K</div>
        <div class="delta">ريال يمني</div>
      </div>
      <div class="kpi-card warning">
        <div class="label"><span class="ic">${Icons.render('expense')}</span> مصروفات الشهر</div>
        <div class="value">${(kpi.monthExp/1000).toFixed(0)}K</div>
        <div class="delta">ريال يمني</div>
      </div>
      <div class="kpi-card danger">
        <div class="label"><span class="ic">${Icons.render('debt')}</span> مديونيات المناديب</div>
        <div class="value">${(kpi.totalReceivables/1000).toFixed(0)}K</div>
        <div class="delta">ريال يمني</div>
      </div>
      <div class="kpi-card">
        <div class="label"><span class="ic">${Icons.render('inventory')}</span> المخزون الحالي</div>
        <div class="value">${kpi.totalInventory.toLocaleString('ar-EG')}</div>
        <div class="delta">كرتون متوفر</div>
      </div>
      <div class="kpi-card info">
        <div class="label"><span class="ic">${Icons.render('balance')}</span> نقطة التعادل الشهرية</div>
        <div class="value">${be.breakEvenMonthly.toFixed(0).toLocaleString('ar-EG')}</div>
        <div class="delta">كرتون لتغطية المصاريف</div>
      </div>
      <div class="kpi-card ${pl.netProfit >= 0 ? 'success' : 'danger'}">
        <div class="label"><span class="ic">${pl.netProfit >= 0 ? Icons.render('profit') : Icons.render('loss')}</span> صافي الربح / الخسارة</div>
        <div class="value">${(pl.netProfit/1000).toFixed(0)}K</div>
        <div class="delta">الإيرادات: ${(pl.revenue/1000).toFixed(0)}K | التكلفة: ${(pl.cogs/1000).toFixed(0)}K</div>
      </div>
    </div>

    <div class="charts-grid">
      <div class="chart-box">
        <h4>${Icons.render('chart')} الإنتاج حسب الصنف (آخر السجلات)</h4>
        <canvas id="chartProdByProduct" height="180"></canvas>
      </div>
      <div class="chart-box">
        <h4>${Icons.render('cash')} المبيعات اليومية حسب المندوب</h4>
        <canvas id="chartSalesByRep" height="180"></canvas>
      </div>
      <div class="chart-box">
        <h4>${Icons.render('money')} توزيع التكلفة الفعلية للكرتون</h4>
        <canvas id="chartCostBreakdown" height="180"></canvas>
      </div>
      <div class="chart-box">
        <h4>${Icons.render('box')} الرصيد الحالي للمخزون</h4>
        <canvas id="chartInventory" height="180"></canvas>
      </div>
    </div>

    <div class="card" style="margin-top:20px">
      <div class="header-row">
        <h3>${Icons.render('document')} آخر العمليات الإنتاجية</h3>
        <button class="btn btn-secondary btn-sm" data-action="nav-production">${Icons.render('arrowRight')} عرض الكل</button>
      </div>
      <table>
        <thead>
          <tr>
            <th>التاريخ</th>
            <th>الصنف</th>
            <th>الكمية (كرتون)</th>
            <th>التالف</th>
            <th>ملاحظة</th>
          </tr>
        </thead>
        <tbody>
          ${lastProductions.map(p => {
            const prod = db.products.find(x => x.code === p.productCode);
            return `<tr>
              <td>${p.date}</td>
              <td>${prod ? prod.name : p.productCode}</td>
              <td class="text-primary">${p.qty.toLocaleString('ar-EG')}</td>
              <td class="text-warning">${p.waste}</td>
              <td class="text-muted">${p.note || '-'}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;

  // الرسوم البيانية
  setTimeout(() => {
    const prodByProduct = {};
    db.productionLog.forEach(p => {
      prodByProduct[p.productCode] = (prodByProduct[p.productCode] || 0) + p.qty;
    });
    const prodLabels = Object.keys(prodByProduct).map(c => (db.products.find(x => x.code === c) || {name:c}).name);
    const prodValues = Object.values(prodByProduct);

    new Chart(document.getElementById('chartProdByProduct'), {
      type: 'bar',
      data: {
        labels: prodLabels,
        datasets: [{
          label: 'الإنتاج (كرتون)',
          data: prodValues,
          backgroundColor: ['#1565c0','#5e92f3','#00bcd4','#ff9800','#4caf50','#9c27b0']
        }]
      },
      options: { responsive: true, plugins: { legend: { display: false } } }
    });

    const salesByRep = {};
    db.salesLog.forEach(s => {
      salesByRep[s.repCode] = (salesByRep[s.repCode] || 0) + s.credit + s.cash;
    });
    new Chart(document.getElementById('chartSalesByRep'), {
      type: 'doughnut',
      data: {
        labels: Object.keys(salesByRep),
        datasets: [{
          data: Object.values(salesByRep),
          backgroundColor: ['#1565c0','#00bcd4','#ff9800','#4caf50']
        }]
      },
      options: { responsive: true }
    });

    // توزيع التكلفة
    const sampleCost = DB.costPerCarton('750-K', db);
    new Chart(document.getElementById('chartCostBreakdown'), {
      type: 'pie',
      data: {
        labels: ['مواد خام','رواتب','مياه','مختبر','صيانة','إهلاك','تالف'],
        datasets: [{
          data: [sampleCost.rawMaterials, sampleCost.salary, sampleCost.water, sampleCost.lab, sampleCost.maintenance, sampleCost.depreciation, sampleCost.waste],
          backgroundColor: ['#1565c0','#5e92f3','#00bcd4','#ff9800','#9c27b0','#4caf50','#f44336']
        }]
      },
      options: { responsive: true }
    });

    const inv = DB.inventory(db);
    new Chart(document.getElementById('chartInventory'), {
      type: 'bar',
      data: {
        labels: inv.map(i => i.name),
        datasets: [
          { label: 'افتتاحي', data: inv.map(i => i.opening), backgroundColor: '#bbdefb' },
          { label: 'منتج', data: inv.map(i => i.produced), backgroundColor: '#1565c0' },
          { label: 'مصروف', data: inv.map(i => i.dispatched), backgroundColor: '#ff9800' },
          { label: 'الرصيد', data: inv.map(i => i.balance), backgroundColor: '#4caf50' }
        ]
      },
      options: { responsive: true, scales: { x: { stacked: true }, y: { stacked: true } } }
    });
  }, 100);
};

/* ============ الإنتاج ============ */
window.Modules.production = function(container) {
  const db = APP.getDB();
  // تسجيل دالة التصدير
  Exports.register("production", {
    label: "الإنتاج والتوالف",
    pdf: () => {
      const headers = ['التاريخ', 'الصنف', 'الكمية', 'التالف', 'ملاحظة'];
      const rows = db.productionLog.map(p => {
        const prod = db.products.find(x => x.code === p.productCode);
        return [p.date, prod ? prod.name : p.productCode, p.qty.toLocaleString('ar-EG'), p.waste.toString(), p.note || '-'];
      });
      const html = `<p>إجمالي السجلات: ${rows.length}</p>` + Exports.rowsToHTMLTable(headers, rows, { title: 'سجل الإنتاج الكامل' });
      Exports.exportPDF("سجل الإنتاج والتوالف", html, "production");
    },
    excel: () => {
      const headers = ['التاريخ', 'الصنف', 'الكمية المنتجة (كرتون)', 'التالف', 'ملاحظة'];
      const rows = db.productionLog.map(p => {
        const prod = db.products.find(x => x.code === p.productCode);
        return [p.date, prod ? prod.name : p.productCode, p.qty, p.waste, p.note || ''];
      });
      Exports.exportExcel(Exports.rowsToHTMLTable(headers, rows, { title: 'سجل الإنتاج' }), "production");
    },
    csv: () => {
      const headers = ['التاريخ', 'الصنف', 'الكمية', 'التالف', 'ملاحظة'];
      const rows = db.productionLog.map(p => {
        const prod = db.products.find(x => x.code === p.productCode);
        return [p.date, prod ? prod.name : p.productCode, p.qty, p.waste, p.note || ''];
      });
      Exports.exportCSV(Exports.rowsToCSV(headers, rows), "production");
    },
    json: () => Exports.exportJSON({ productionLog: db.productionLog }, "production_data"),
    print: () => window.print()
  });

  function render() {
    const recent = db.productionLog.slice().reverse();
    const summary = {};
    db.productionLog.forEach(p => {
      if (!summary[p.productCode]) summary[p.productCode] = { qty: 0, waste: 0 };
      summary[p.productCode].qty += p.qty;
      summary[p.productCode].waste += p.waste;
    });

    container.innerHTML = `
      <div class="alert alert-success">
        ${Icons.render('info')}
        <span>سجّل الإنتاج اليومي لكل صنف مع التالف. الإجماليات تُحسب تلقائياً وتنعكس على المخزون والتكلفة الفورية.</span>
      </div>

      <div class="card">
        <div class="header-row">
          <h3>${Icons.render('plus')} تسجيل إنتاج يومي</h3>
        </div>
        <form id="prodForm" class="form-grid">
          <div class="form-group">
            <label>التاريخ</label>
            <input type="date" id="prodDate" value="${new Date().toISOString().split('T')[0]}" required />
          </div>
          <div class="form-group">
            <label>الصنف</label>
            <select id="prodCode" required>
              ${db.products.map(p => `<option value="${p.code}">${p.name} (${p.bottlesPerCarton} عبوة)</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>الكمية المنتجة (كرتون)</label>
            <input type="number" id="prodQty" min="1" step="1" required />
          </div>
          <div class="form-group">
            <label>التالف (كرتون)</label>
            <input type="number" id="prodWaste" min="0" step="1" value="0" />
          </div>
          <div class="form-group" style="grid-column: span 2">
            <label>ملاحظات</label>
            <input type="text" id="prodNote" placeholder="اختياري" />
          </div>
        </form>
        <div class="btn-row">
          <button class="btn btn-primary" data-action="add-production">${Icons.render('save')} حفظ الإنتاج</button>
          <button class="btn btn-secondary" data-action="reset-prod-form">مسح</button>
        </div>
      </div>

      <div class="card">
        <h3>${Icons.render('box')} ملخص الإنتاج حسب الصنف</h3>
        <table>
          <thead>
            <tr>
              <th>الصنف</th>
              <th>إجمالي الإنتاج (كرتون)</th>
              <th>إجمالي التالف</th>
              <th>نسبة التالف %</th>
            </tr>
          </thead>
          <tbody>
            ${db.products.map(p => {
              const s = summary[p.code] || {qty:0, waste:0};
              const pct = s.qty > 0 ? (s.waste / s.qty * 100).toFixed(2) : '0.00';
              return `<tr>
                <td>${p.name}</td>
                <td class="text-primary">${s.qty.toLocaleString('ar-EG')}</td>
                <td class="text-warning">${s.waste.toLocaleString('ar-EG')}</td>
                <td><span class="badge ${parseFloat(pct) > 2 ? 'badge-danger' : 'badge-success'}">${pct}%</span></td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>

      <div class="card">
        <div class="header-row">
          <h3>${Icons.render('clipboard')} سجل الإنتاج (${recent.length} عملية)</h3>
          <button class="btn btn-secondary btn-sm" data-action="export-production">${Icons.render('download')} تصدير</button>
        </div>
        <table>
          <thead>
            <tr>
              <th>التاريخ</th>
              <th>الصنف</th>
              <th>الكمية</th>
              <th>التالف</th>
              <th>ملاحظة</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            ${recent.map((p, idx) => {
              const prod = db.products.find(x => x.code === p.productCode);
              return `<tr>
                <td>${p.date}</td>
                <td>${prod ? prod.name : p.productCode}</td>
                <td class="text-primary">${p.qty.toLocaleString('ar-EG')}</td>
                <td class="text-warning">${p.waste}</td>
                <td class="text-muted">${p.note || '-'}</td>
                <td><button class="btn btn-danger btn-sm" data-action="delete-production" data-idx="${db.productionLog.length - 1 - idx})">${Icons.render('trash')} حذف</button></td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  Modules._addProduction = function() {
    const date = document.getElementById('prodDate').value;
    const productCode = document.getElementById('prodCode').value;
    const qty = parseInt(document.getElementById('prodQty').value);
    const waste = parseInt(document.getElementById('prodWaste').value) || 0;
    const note = document.getElementById('prodNote').value;
    if (!date || !productCode || !qty || qty < 1) return alert('يرجى ملء الحقول المطلوبة');
    const db = APP.getDB();
    db.productionLog.push({ date, productCode, qty, waste, note });
    APP.saveDB(db);
    alert(Icons.render("check") + ' تم حفظ الإنتاج وإعادة احتساب التكلفة والمخزون');
    render();
  };

  Modules._deleteProduction = function(idx) {
    if (!confirm('تأكيد حذف هذه العملية؟')) return;
    const db = APP.getDB();
    db.productionLog.splice(idx, 1);
    APP.saveDB(db);
    render();
  };

  render();
};

/* ============ التكاليف ============ */
window.Modules.costs = function(container) {
  const db = APP.getDB();
  // تسجيل دالة التصدير
  Exports.register("costs", {
    label: "التكاليف الفعلية",
    pdf: () => {
      const be = DB.breakEven(db);
      const headers = ['الصنف', 'التكلفة', 'متوسط السعر', 'هامش المساهمة', 'نسبة الإنتاج', 'هامش موزون'];
      const rows = be.rows.map(r => [
        r.name, r.cost.toFixed(2), r.price.toFixed(2),
        { v: r.margin.toFixed(2), cls: r.margin >= 0 ? 'text-success' : 'text-danger' },
        (r.share * 100).toFixed(2) + '%',
        (r.margin * r.share).toFixed(2)
      ]);
      const footer = ['إجمالي متوسط هامش المساهمة الموزون', '', '', '', '', be.weightedMargin.toFixed(2)];
      const footer2 = ['المصروفات العمومية الشهرية', '', '', '', '', be.overheadMonthly.toFixed(2)];
      const footer3 = ['نقطة التعادل الشهرية (كرتون)', '', '', '', '', be.breakEvenMonthly.toFixed(0)];
      const html = Exports.rowsToHTMLTable(headers, rows, {
        title: 'التكلفة الفعلية للكرتون ونقطة التعادل',
        footerRow: [footer, footer2, footer3]
      });
      Exports.exportPDF("التكاليف الفعلية ونقطة التعادل", html, "costs");
    },
    excel: () => {
      const be = DB.breakEven(db);
      const headers = ['الصنف', 'التكلفة (ر.ي)', 'متوسط السعر (ر.ي)', 'هامش المساهمة (ر.ي)', 'نسبة الإنتاج', 'هامش موزون (ر.ي)'];
      const rows = be.rows.map(r => [r.name, r.cost.toFixed(2), r.price.toFixed(2), r.margin.toFixed(2), (r.share*100).toFixed(2)+'%', (r.margin*r.share).toFixed(2)]);
      const html = Exports.rowsToHTMLTable(headers, rows, { title: 'التكاليف ونقطة التعادل' });
      Exports.exportExcel(html, "costs");
    },
    csv: () => {
      const be = DB.breakEven(db);
      const headers = ['الصنف', 'التكلفة', 'متوسط السعر', 'هامش المساهمة', 'نسبة الإنتاج', 'هامش موزون'];
      const rows = be.rows.map(r => [r.name, r.cost.toFixed(2), r.price.toFixed(2), r.margin.toFixed(2), (r.share*100).toFixed(2), (r.margin*r.share).toFixed(2)]);
      Exports.exportCSV(Exports.rowsToCSV(headers, rows), "costs");
    },
    json: () => Exports.exportJSON({ costs: db.costs, products: db.products, pricing: db.pricing }, "costs_data"),
    print: () => window.print()
  });

  function render() {
    const productsCosts = db.products.map(p => {
      const c = DB.costPerCarton(p.code, db);
      return { product: p, cost: c };
    });

    container.innerHTML = `
      <div class="alert alert-warning">
        ${Icons.render('alert')}
        <span>التكلفة الفعلية للكرتون تُحسب لحظياً من المعادلات. غيّر أي مدخل (مثل عدد العمال، سعر البوزة، قيمة المعدات) لترى التكلفة تتغير فوراً.</span>
      </div>

      <div class="card">
        <div class="header-row">
          <h3>${Icons.render('settings')} إعدادات الإنتاج (المؤثرات على التكلفة)</h3>
          <button class="btn btn-primary btn-sm" data-action="save-cost-settings">${Icons.render('save')} حفظ التعديلات</button>
        </div>
        <div class="form-grid">
          <div class="form-group">
            <label>الإنتاج الشهري (كرتون)</label>
            <input type="number" id="cost_monthlyProd" value="${db.costs.production.monthlyProductionCartons}" />
          </div>
          <div class="form-group">
            <label>أيام العمل في الشهر</label>
            <input type="number" id="cost_days" value="${db.costs.production.daysPerMonth}" />
          </div>
          <div class="form-group">
            <label>ساعات العمل في اليوم</label>
            <input type="number" id="cost_hours" value="${db.costs.production.hoursPerDay}" />
          </div>
          <div class="form-group">
            <label>سعر البوزة (10,000 لتر)</label>
            <input type="number" id="cost_boozaPrice" value="${db.costs.water.boozaPriceYER}" />
          </div>
          <div class="form-group">
            <label>بوز من البئر يومياً</label>
            <input type="number" id="cost_wellBooza" value="${db.costs.water.dailyBoozaFromWell}" />
          </div>
          <div class="form-group">
            <label>بوز مشتراة يومياً</label>
            <input type="number" id="cost_purchBooza" value="${db.costs.water.dailyBoozaPurchased}" />
          </div>
          <div class="form-group">
            <label>إجمالي الرواتب الشهرية</label>
            <input type="number" id="cost_salary" value="${db.costs.salaries.monthlyTotal}" />
          </div>
          <div class="form-group">
            <label>عمال مباشرون</label>
            <input type="number" id="cost_directW" value="${db.costs.salaries.directWorkers}" />
          </div>
          <div class="form-group">
            <label>عمال غير مباشرون</label>
            <input type="number" id="cost_indirectW" value="${db.costs.salaries.indirectWorkers}" />
          </div>
          <div class="form-group">
            <label>مصاريف المختبر (سنوي)</label>
            <input type="number" id="cost_labYearly" value="${db.costs.lab.yearlyExpenses}" />
          </div>
          <div class="form-group">
            <label>مصاريف الصيانة (سنوي)</label>
            <input type="number" id="cost_maintYearly" value="${db.costs.maintenance.yearlyExpenses}" />
          </div>
          <div class="form-group">
            <label>قيمة المعدات والآلات</label>
            <input type="number" id="cost_equipValue" value="${db.costs.depreciation.equipmentValue}" />
          </div>
          <div class="form-group">
            <label>العمر الافتراضي (سنوات)</label>
            <input type="number" id="cost_life" value="${db.costs.depreciation.usefulLifeYears}" />
          </div>
          <div class="form-group">
            <label>نسبة التالف المسموح %</label>
            <input type="number" id="cost_waste" value="${db.costs.waste.allowedPercent}" step="0.1" />
          </div>
        </div>
      </div>

      <div class="card">
        <div class="header-row">
          <h3>${Icons.render("cart")} تكلفة المواد الخام للكرتون (لكل صنف)</h3>
        </div>
        <table>
          <thead>
            <tr>
              <th>الصنف</th>
              <th>أنبولات</th>
              <th>شرنك</th>
              <th>أغطية</th>
              <th>ليبل</th>
              <th>غراء ليبل</th>
              <th>كرتون</th>
              <th>غراء كرتون</th>
              <th>إجمالي المواد</th>
            </tr>
          </thead>
          <tbody>
            ${productsCosts.map(({product, cost}) => {
              const rm = db.costs.rawMaterials;
              const bpc = product.bottlesPerCarton;
              const anboula = rm.anboula_205.unitCost;
              const shrinka = product.packaging === "شرنج" ? 0 : rm.shrinka.unitCost;
              const ghetaa = rm.ghetaa.unitCost * bpc;
              const label = rm.label.unitCost * bpc;
              const ghl = rm.gharaaLabel.unitCost * bpc;
              const karton = product.packaging === "كرتون" ? rm.karton.unitCost + rm.gharaaKarton.unitCost : 0;
              const total = anboula + shrinka + ghetaa + label + ghl + karton;
              return `<tr>
                <td><b>${product.name}</b></td>
                <td>${anboula.toFixed(2)}</td>
                <td>${shrinka.toFixed(2)}</td>
                <td>${ghetaa.toFixed(2)}</td>
                <td>${label.toFixed(2)}</td>
                <td>${ghl.toFixed(2)}</td>
                <td>${karton.toFixed(2)}</td>
                <td class="text-primary"><b>${total.toFixed(2)}</b></td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>

      <div class="card">
        <h3>${Icons.render("cash")} التكلفة الإجمالية للكرتون لكل صنف</h3>
        <table>
          <thead>
            <tr>
              <th>الصنف</th>
              <th>مواد خام</th>
              <th>رواتب</th>
              <th>مياه</th>
              <th>مختبر</th>
              <th>صيانة</th>
              <th>إهلاك</th>
              <th>تالف</th>
              <th class="text-primary">الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            ${productsCosts.map(({product, cost}) => `
              <tr>
                <td><b>${product.name}</b></td>
                <td>${cost.rawMaterials.toFixed(2)}</td>
                <td>${cost.salary.toFixed(2)}</td>
                <td>${cost.water.toFixed(2)}</td>
                <td>${cost.lab.toFixed(2)}</td>
                <td>${cost.maintenance.toFixed(2)}</td>
                <td>${cost.depreciation.toFixed(2)}</td>
                <td>${cost.waste.toFixed(2)}</td>
                <td class="text-primary" style="font-size:14px"><b>${cost.total.toFixed(2)}</b></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="card">
        <h3>${Icons.render("chart")} نقطة التعادل (Break-Even Point)</h3>
        <p class="text-muted" style="margin-bottom:12px">نقطة التعادل الشهرية = إجمالي المصروفات العمومية ÷ متوسط هامش المساهمة الموزون لكل صنف</p>
        ${(() => {
          const be = DB.breakEven(db);
          return `
            <table>
              <thead>
                <tr>
                  <th>الصنف</th>
                  <th>التكلفة</th>
                  <th>متوسط السعر</th>
                  <th>هامش المساهمة</th>
                  <th>نسبة الإنتاج</th>
                  <th>هامش موزون</th>
                </tr>
              </thead>
              <tbody>
                ${be.rows.map(r => `
                  <tr>
                    <td><b>${r.name}</b></td>
                    <td>${r.cost.toFixed(2)}</td>
                    <td>${r.price.toFixed(2)}</td>
                    <td class="${r.margin >= 0 ? 'text-success' : 'text-danger'}">${r.margin.toFixed(2)}</td>
                    <td>${(r.share * 100).toFixed(2)}%</td>
                    <td class="text-primary">${(r.margin * r.share).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="5">إجمالي متوسط هامش المساهمة الموزون</td>
                  <td class="text-primary">${be.weightedMargin.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colspan="5">إجمالي المصروفات العمومية الشهرية</td>
                  <td class="text-warning">${be.overheadMonthly.toFixed(2)}</td>
                </tr>
                <tr style="font-size:16px">
                  <td colspan="5"><b>نقطة التعادل الشهرية (كرتون)</b></td>
                  <td class="text-danger"><b>${be.breakEvenMonthly.toFixed(0).toLocaleString('ar-EG')}</b></td>
                </tr>
              </tfoot>
            </table>
          `;
        })()}
      </div>
    `;
  }

  Modules._saveCostSettings = function() {
    const db = APP.getDB();
    db.costs.production.monthlyProductionCartons = +document.getElementById('cost_monthlyProd').value;
    db.costs.production.daysPerMonth = +document.getElementById('cost_days').value;
    db.costs.production.hoursPerDay = +document.getElementById('cost_hours').value;
    db.costs.water.boozaPriceYER = +document.getElementById('cost_boozaPrice').value;
    db.costs.water.dailyBoozaFromWell = +document.getElementById('cost_wellBooza').value;
    db.costs.water.dailyBoozaPurchased = +document.getElementById('cost_purchBooza').value;
    db.costs.salaries.monthlyTotal = +document.getElementById('cost_salary').value;
    db.costs.salaries.directWorkers = +document.getElementById('cost_directW').value;
    db.costs.salaries.indirectWorkers = +document.getElementById('cost_indirectW').value;
    db.costs.lab.yearlyExpenses = +document.getElementById('cost_labYearly').value;
    db.costs.maintenance.yearlyExpenses = +document.getElementById('cost_maintYearly').value;
    db.costs.depreciation.equipmentValue = +document.getElementById('cost_equipValue').value;
    db.costs.depreciation.usefulLifeYears = +document.getElementById('cost_life').value;
    db.costs.waste.allowedPercent = +document.getElementById('cost_waste').value;
    APP.saveDB(db);
    alert(Icons.render("check") + ' تم حفظ الإعدادات وإعادة احتساب التكاليف');
    render();
  };

  render();
};

// === Event delegation (no inline onclick) ===
document.addEventListener('click', function(e) {
  var el = e.target.closest('[data-action]');
  if (!el) return;
  var action = el.dataset.action;
  switch(action) {
    case 'nav-production': APP.navigate('production'); break;
    case 'add-production': Modules._addProduction(); break;
    case 'reset-prod-form': document.getElementById('prodForm') && document.getElementById('prodForm').reset(); break;
    case 'export-production': Modules.exportTable && Modules.exportTable('productionLog', 'سجل_الإنتاج'); break;
    case 'delete-production': Modules._deleteProduction && Modules._deleteProduction(el.dataset.idx); break;
    case 'save-cost-settings': Modules._saveCostSettings && Modules._saveCostSettings(); break;
  }
});

