/* ============================================================
   سيلين - التقارير الشاملة والتصدير
   ============================================================ */

window.Modules.reports = function(container) {
  const db = APP.getDB();
  Exports.register("reports", {
    label: "التقارير الشاملة",
    pdf: () => {
      const pl = DB.profitLoss(db);
      const be = DB.breakEven(db);
      const html = `
        <h2>الأرباح والخسائر</h2>
        <table>
          <tr><td>إجمالي الإيرادات</td><td class="text-success">${pl.revenue.toLocaleString('ar-EG')} ر.ي</td></tr>
          <tr><td>تكلفة البضاعة</td><td class="text-danger">${pl.cogs.toLocaleString('ar-EG')} ر.ي</td></tr>
          <tr><td><b>إجمالي الربح</b></td><td class="text-primary"><b>${pl.grossProfit.toLocaleString('ar-EG')} ر.ي</b></td></tr>
          <tr><td>المصروفات</td><td class="text-danger">${pl.monthExp.toLocaleString('ar-EG')} ر.ي</td></tr>
          <tr><td><b>صافي الربح/الخسارة</b></td><td class="${pl.netProfit>=0?'text-success':'text-danger'}"><b>${pl.netProfit.toLocaleString('ar-EG')} ر.ي</b></td></tr>
        </table>
        <h2>نقطة التعادل</h2>
        <table>
          <thead><tr><th>الصنف</th><th>التكلفة</th><th>متوسط السعر</th><th>هامش المساهمة</th><th>نسبة الإنتاج</th></tr></thead>
          <tbody>
            ${be.rows.map(r => `<tr><td>${r.name}</td><td>${r.cost.toFixed(2)}</td><td>${r.price.toFixed(2)}</td><td>${r.margin.toFixed(2)}</td><td>${(r.share*100).toFixed(2)}%</td></tr>`).join('')}
          </tbody>
          <tfoot>
            <tr><td colspan="4">إجمالي متوسط هامش المساهمة الموزون</td><td>${be.weightedMargin.toFixed(2)}</td></tr>
            <tr><td colspan="4">إجمالي المصروفات العمومية</td><td>${be.overheadMonthly.toFixed(2)}</td></tr>
            <tr><td colspan="4"><b>نقطة التعادل الشهرية</b></td><td><b>${be.breakEvenMonthly.toFixed(0).toLocaleString('ar-EG')}</b></td></tr>
          </tfoot>
        </table>
      `;
      Exports.exportPDF("التقرير الشامل", html, "reports");
    },
    excel: () => {
      const pl = DB.profitLoss(db);
      const be = DB.breakEven(db);
      const headers1 = ['البند', 'القيمة (ر.ي)'];
      const rows1 = [
        ['إجمالي الإيرادات', pl.revenue],
        ['تكلفة البضاعة', pl.cogs],
        ['إجمالي الربح', pl.grossProfit],
        ['المصروفات', pl.monthExp],
        ['صافي الربح/الخسارة', pl.netProfit]
      ];
      const headers2 = ['الصنف', 'التكلفة', 'متوسط السعر', 'هامش المساهمة', 'نسبة الإنتاج', 'هامش موزون'];
      const rows2 = be.rows.map(r => [r.name, r.cost.toFixed(2), r.price.toFixed(2), r.margin.toFixed(2), (r.share*100).toFixed(2), (r.margin*r.share).toFixed(2)]);
      const html = Exports.rowsToHTMLTable(headers1, rows1, { title: 'الأرباح والخسائر' }) +
                   Exports.rowsToHTMLTable(headers2, rows2, { title: 'نقطة التعادل' });
      Exports.exportExcel(html, "reports");
    },
    csv: () => {
      const pl = DB.profitLoss(db);
      const headers = ['البند', 'القيمة'];
      const rows = [
        ['الإيرادات', pl.revenue],
        ['تكلفة البضاعة', pl.cogs],
        ['إجمالي الربح', pl.grossProfit],
        ['المصروفات', pl.monthExp],
        ['صافي الربح', pl.netProfit]
      ];
      Exports.exportCSV(Exports.rowsToCSV(headers, rows), "reports");
    },
    json: () => Exports.exportJSON(db, "full_system_export"),
    print: () => window.print()
  });

  function render() {
    const pl = DB.profitLoss(db);
    const be = DB.breakEven(db);
    const kpi = DB.dashboardKPI(db);

    container.innerHTML = `
      <div class="alert alert-info">
        <span>${Icons.render("report")}</span>
        <span>تقارير شاملة قابلة للتصدير PDF / Excel. كل التقارير تحمل حقوق الملكية: <b>${db.meta.copyright}</b></span>
      </div>

      <div class="card">
        <h3>${Icons.render("chart")} تقرير الأرباح والخسائر (الشهر الحالي)</h3>
        <table>
          <tbody>
            <tr>
              <td><b>إجمالي الإيرادات</b> (المبيعات نقدية + آجلة)</td>
              <td class="text-success">${pl.revenue.toLocaleString('ar-EG')} ر.ي</td>
            </tr>
            <tr>
              <td><b>تكلفة البضاعة المباعة</b> (تكلفة الإنتاج)</td>
              <td class="text-danger">${pl.cogs.toLocaleString('ar-EG')} ر.ي</td>
            </tr>
            <tr style="background:#fff3e0">
              <td><b>إجمالي الربح</b></td>
              <td class="${pl.grossProfit >= 0 ? 'text-success' : 'text-danger'}"><b>${pl.grossProfit.toLocaleString('ar-EG')} ر.ي</b></td>
            </tr>
            <tr>
              <td>المصروفات العمومية (تشغيلية)</td>
              <td class="text-danger">${pl.monthExp.toLocaleString('ar-EG')} ر.ي</td>
            </tr>
            <tr style="background:${pl.netProfit >= 0 ? '#e8f5e9' : '#ffebee'}; font-size:16px">
              <td><b>صافي الربح / الخسارة</b></td>
              <td class="${pl.netProfit >= 0 ? 'text-success' : 'text-danger'}">
                <b>${pl.netProfit.toLocaleString('ar-EG')} ر.ي</b>
                <br><small>${pl.netProfit >= 0 ? `${Icons.render('check')} ربح` : `${Icons.render('alert')} خسارة`}</small>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="card">
        <h3>${Icons.render("chart")} تقرير نقطة التعادل التفصيلي</h3>
        <p class="text-muted" style="margin-bottom:14px">يتم حساب نقطة التعادل بناءً على متوسط أسعار البيع (تجزئة + جملة) لكل صنف، مع مراعاة نسبة كل صنف من الإنتاج الفعلي.</p>
        <table>
          <thead>
            <tr>
              <th>الصنف</th>
              <th>التكلفة الفعلية</th>
              <th>متوسط السعر</th>
              <th>هامش المساهمة</th>
              <th>نسبة من الإنتاج</th>
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
            <tr><td colspan="5">إجمالي متوسط هامش المساهمة الموزون</td><td class="text-primary">${be.weightedMargin.toFixed(2)}</td></tr>
            <tr><td colspan="5">إجمالي المصروفات العمومية الشهرية</td><td class="text-warning">${be.overheadMonthly.toFixed(2)}</td></tr>
            <tr style="font-size:16px"><td colspan="5"><b>نقطة التعادل الشهرية (كرتون مطلوب)</b></td><td class="text-danger"><b>${be.breakEvenMonthly.toFixed(0).toLocaleString('ar-EG')}</b></td></tr>
            <tr><td colspan="5"><b>نقطة التعادل اليومية</b></td><td class="text-danger"><b>${(be.breakEvenMonthly / 26).toFixed(0).toLocaleString('ar-EG')}</b></td></tr>
          </tfoot>
        </table>
      </div>

      <div class="card">
        <h3>${Icons.render("chart")} تقرير المبيعات التراكمي</h3>
        ${(() => {
          const month = new Date().toISOString().slice(0, 7);
          const monthSales = db.salesLog.filter(s => s.date.startsWith(month));
          const totalQty = monthSales.reduce((s, x) => s + x.qty, 0);
          const totalCredit = monthSales.reduce((s, x) => s + x.credit, 0);
          const totalCash = monthSales.reduce((s, x) => s + x.cash, 0);
          const totalCollection = monthSales.reduce((s, x) => s + x.collection, 0);
          return `<table>
            <thead><tr><th>البند</th><th>القيمة</th></tr></thead>
            <tbody>
              <tr><td>إجمالي الكمية المباعة (كرتون)</td><td class="text-primary"><b>${totalQty.toLocaleString('ar-EG')}</b></td></tr>
              <tr><td>إجمالي المبيعات الآجلة</td><td>${totalCredit.toLocaleString('ar-EG')} ر.ي</td></tr>
              <tr><td>إجمالي المبيعات النقدية</td><td>${totalCash.toLocaleString('ar-EG')} ر.ي</td></tr>
              <tr><td>إجمالي التحصيل</td><td class="text-success">${totalCollection.toLocaleString('ar-EG')} ر.ي</td></tr>
              <tr><td>نسبة التحصيل من المبيعات</td><td><b>${((totalCollection / (totalCredit + totalCash)) * 100).toFixed(1)}%</b></td></tr>
            </tbody>
          </table>`;
        })()}
      </div>

      <div class="card">
        <h3>${Icons.render("clipboard")} تقرير أصول المعدات والإهلاك</h3>
        <table>
          <thead>
            <tr>
              <th>المعدة</th>
              <th>القيمة (ر.ي)</th>
              <th>تاريخ الشراء</th>
              <th>العمر (سنة)</th>
              <th>الإهلاك السنوي</th>
              <th>الإهلاك الشهري</th>
            </tr>
          </thead>
          <tbody>
            ${db.equipmentLog.map(e => {
              const yearly = e.value / e.usefulLife;
              const monthly = yearly / 12;
              return `<tr>
                <td><b>${e.name}</b></td>
                <td>${e.value.toLocaleString('ar-EG')}</td>
                <td>${e.purchaseDate}</td>
                <td>${e.usefulLife}</td>
                <td>${yearly.toLocaleString('ar-EG', {maximumFractionDigits: 0})}</td>
                <td class="text-warning">${monthly.toLocaleString('ar-EG', {maximumFractionDigits: 0})}</td>
              </tr>`;
            }).join('')}
          </tbody>
          <tfoot>
            <tr>
              <td>الإجمالي</td>
              <td>${db.equipmentLog.reduce((s,e) => s + e.value, 0).toLocaleString('ar-EG')}</td>
              <td colspan="2"></td>
              <td>${db.equipmentLog.reduce((s,e) => s + e.value/e.usefulLife, 0).toLocaleString('ar-EG', {maximumFractionDigits: 0})}</td>
              <td class="text-primary">${db.equipmentLog.reduce((s,e) => s + e.value/e.usefulLife/12, 0).toLocaleString('ar-EG', {maximumFractionDigits: 0})}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div class="card">
        <div class="header-row">
          <h3>${Icons.render("download")} تصدير التقارير</h3>
        </div>
        <div class="btn-row">
          <button class="btn btn-primary" onclick="Modules.exportToPDF()">${Icons.render("document")} تصدير PDF</button>
          <button class="btn btn-success" onclick="Modules.exportToExcel()">${Icons.render("chart")} تصدير Excel</button>
          <button class="btn btn-warning" onclick="window.print()">${Icons.render("print")} طباعة</button>
          <button class="btn btn-secondary" onclick="Modules.exportBackup()">${Icons.render("save")} نسخة احتياطية JSON</button>
        </div>
      </div>
    `;
  }

  /* === PDF Export using simple HTML approach === */
  Modules.exportToPDF = function() {
    const db = APP.getDB();
    const printWindow = window.open('', '_blank');
    const pl = DB.profitLoss(db);
    const be = DB.breakEven(db);

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8" />
        <title>تقرير مصنع سيلين</title>
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap" rel="stylesheet">
        <style>
          body { font-family: 'Cairo', Tahoma, Arial; direction: rtl; padding: 30px; color: #1a2332; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 3px double #1565c0; padding-bottom: 16px; }
          .header img { width: 80px; }
          .header h1 { color: #1565c0; margin: 8px 0 4px; font-size: 22px; }
          .header p { color: #6b7c93; margin: 0; font-size: 13px; }
          h2 { color: #1565c0; border-right: 4px solid #1565c0; padding-right: 10px; margin: 24px 0 12px; font-size: 16px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 12px; }
          th { background: #1565c0; color: white; padding: 8px; text-align: right; }
          td { padding: 6px 8px; border-bottom: 1px solid #ddd; }
          .text-success { color: #2e7d32; font-weight: 700; }
          .text-danger { color: #c62828; font-weight: 700; }
          .footer { margin-top: 40px; padding-top: 16px; border-top: 2px solid #ddd; text-align: center; font-size: 11px; color: #6b7c93; }
          .footer b { color: #1565c0; }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="logo.png" />
          <h1>${db.meta.factory}</h1>
          <p>${db.meta.location} | ${db.meta.year}</p>
          <h2 style="border:0;padding:0;margin:8px 0">التقرير الشامل - ${new Date().toLocaleDateString('ar-EG')}</h2>
        </div>

        <h2>${Icons.render("chart")} ملخص المؤشرات الرئيسية</h2>
        <table>
          <tr><th>المؤشر</th><th>القيمة</th></tr>
          <tr><td>إنتاج الشهر (كرتون)</td><td>${db.productionLog.reduce((s,p) => s+p.qty, 0).toLocaleString('ar-EG')}</td></tr>
          <tr><td>إجمالي المبيعات</td><td>${pl.revenue.toLocaleString('ar-EG')} ر.ي</td></tr>
          <tr><td>تكلفة الإنتاج</td><td>${pl.cogs.toLocaleString('ar-EG')} ر.ي</td></tr>
          <tr><td>المصروفات</td><td>${pl.monthExp.toLocaleString('ar-EG')} ر.ي</td></tr>
          <tr><td>صافي الربح</td><td class="${pl.netProfit>=0?'text-success':'text-danger'}">${pl.netProfit.toLocaleString('ar-EG')} ر.ي</td></tr>
          <tr><td>نقطة التعادل الشهرية</td><td>${be.breakEvenMonthly.toFixed(0).toLocaleString('ar-EG')} كرتون</td></tr>
        </table>

        <h2>${Icons.render("money")} التكلفة الفعلية للكرتون</h2>
        <table>
          <thead><tr><th>الصنف</th><th>تكلفة الكرتون (ر.ي)</th></tr></thead>
          <tbody>
            ${db.products.map(p => `<tr><td>${p.name}</td><td>${DB.costPerCarton(p.code, db).total.toFixed(2)}</td></tr>`).join('')}
          </tbody>
        </table>

        <h2>${Icons.render("priceTag")} الأسعار</h2>
        <table>
          <thead><tr><th>الصنف</th><th>تجزئة</th><th>جملة</th><th>سعر المصنع</th></tr></thead>
          <tbody>
            ${db.pricing.map(p => {
              const prod = db.products.find(x => x.code === p.code);
              return `<tr><td>${prod ? prod.name : p.code}</td><td>${p.retailPrice}</td><td>${p.wholesalePrice}</td><td>${p.factoryPrice}</td></tr>`;
            }).join('')}
          </tbody>
        </table>

        <h2>${Icons.render("box")} المخزون</h2>
        <table>
          <thead><tr><th>الصنف</th><th>افتتاحي</th><th>منتج</th><th>مصروف</th><th>الرصيد</th></tr></thead>
          <tbody>
            ${DB.inventory(db).map(i => `<tr><td>${i.name}</td><td>${i.opening}</td><td>${i.produced}</td><td>${i.dispatched}</td><td><b>${i.balance}</b></td></tr>`).join('')}
          </tbody>
        </table>

        <h2>${Icons.render("users")} المناديب</h2>
        <table>
          <thead><tr><th>المندوب</th><th>المبيعات</th><th>التحصيل</th><th>المديونية</th></tr></thead>
          <tbody>
            ${db.salesReps.map(r => {
              const s = DB.salesRepSummary(r.code, db);
              return `<tr><td>${r.name}</td><td>${(s.credit+s.cash).toLocaleString('ar-EG')}</td><td>${s.collection.toLocaleString('ar-EG')}</td><td><b>${s.balance.toLocaleString('ar-EG')}</b></td></tr>`;
            }).join('')}
          </tbody>
        </table>

        <div class="footer">
          جميع الحقوق محفوظة © ${db.meta.year} | <b>${db.meta.copyright}</b><br>
          ${db.meta.role} - ${db.meta.location}
        </div>

        <div class="no-print" style="text-align:center;margin-top:30px">
          <button onclick="window.print()" style="padding:12px 24px;background:#1565c0;color:white;border:0;border-radius:8px;font-weight:700;cursor:pointer;font-family:Cairo">${Icons.render("print")} طباعة / حفظ PDF</button>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  /* === Excel Export using simple HTML table download === */
  Modules.exportToExcel = function() {
    const db = APP.getDB();
    let html = `<html xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="UTF-8"><style>
      table { border-collapse: collapse; }
      th { background: #1565c0; color: white; padding: 8px; border: 1px solid #ccc; }
      td { padding: 6px; border: 1px solid #ddd; }
    </style></head><body>`;
    html += `<h1>${db.meta.factory} - تقرير شامل ${new Date().toLocaleDateString('ar-EG')}</h1>`;
    html += `<p>حقوق الملكية: <b>${db.meta.copyright}</b> | ${db.meta.location} | ${db.meta.year}</p>`;

    html += `<h2>التكلفة الفعلية للكرتون</h2><table><thead><tr><th>الصنف</th><th>تكلفة الكرتون</th></tr></thead><tbody>`;
    db.products.forEach(p => { html += `<tr><td>${p.name}</td><td>${DB.costPerCarton(p.code, db).total.toFixed(2)}</td></tr>`; });
    html += `</tbody></table>`;

    html += `<h2>المخزون</h2><table><thead><tr><th>الصنف</th><th>افتتاحي</th><th>منتج</th><th>مصروف</th><th>الرصيد</th></tr></thead><tbody>`;
    DB.inventory(db).forEach(i => { html += `<tr><td>${i.name}</td><td>${i.opening}</td><td>${i.produced}</td><td>${i.dispatched}</td><td>${i.balance}</td></tr>`; });
    html += `</tbody></table>`;

    html += `<h2>المناديب</h2><table><thead><tr><th>المندوب</th><th>المبيعات</th><th>التحصيل</th><th>المديونية</th></tr></thead><tbody>`;
    db.salesReps.forEach(r => {
      const s = DB.salesRepSummary(r.code, db);
      html += `<tr><td>${r.name}</td><td>${s.credit + s.cash}</td><td>${s.collection}</td><td>${s.balance}</td></tr>`;
    });
    html += `</tbody></table>`;

    html += `</body></html>`;
    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `تقرير_سيلين_${new Date().toISOString().split('T')[0]}.xls`;
    a.click();
  };

  render();
};
