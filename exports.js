/* ============================================================
   سيلين - نظام التصدير الموحد
   يدعم: PDF / Excel / CSV / JSON
   لكل صفحة، يمكن تسجيل دالة تصدير خاصة بها
   ============================================================ */

window.Exports = (function () {

  // --- سجل دوال التصدير لكل صفحة ---
  const registry = {};

  function register(pageId, exporters) {
    // exporters = { pdf: fn, excel: fn, csv: fn, json: fn, label: 'اسم الصفحة' }
    registry[pageId] = exporters;
  }

  function getExporters(pageId) {
    return registry[pageId] || null;
  }

  function listPages() {
    return Object.keys(registry);
  }

  // --- مساعدات مشتركة ---
  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }

  function dateStamp() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}_${String(d.getHours()).padStart(2,'0')}${String(d.getMinutes()).padStart(2,'0')}`;
  }

  // === CSV ===
  function exportCSV(csvContent, filename) {
    const BOM = '\uFEFF'; // للدعم العربي في Excel
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8' });
    downloadBlob(blob, filename + '_' + dateStamp() + '.csv');
  }

  // === Excel (HTML table بصيغة XLS) ===
  function exportExcel(htmlContent, filename) {
    const fullHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Cairo', Tahoma, Arial; direction: rtl; }
          table { border-collapse: collapse; width: 100%; }
          th { background: #1565c0; color: white; padding: 8px 12px; border: 1px solid #ccc; text-align: right; font-weight: bold; }
          td { padding: 6px 10px; border: 1px solid #ddd; text-align: right; }
          tr:nth-child(even) { background: #f9f9f9; }
          .header-info { background: #f0f4fa; padding: 12px; margin-bottom: 16px; border-right: 4px solid #1565c0; }
          .header-info h1 { color: #1565c0; margin: 0 0 8px; font-size: 18px; }
          .header-info p { margin: 4px 0; color: #555; font-size: 12px; }
          .footer { margin-top: 20px; padding: 10px; text-align: center; font-size: 11px; color: #888; border-top: 1px solid #ddd; }
          .text-success { color: #2e7d32; font-weight: bold; }
          .text-danger { color: #c62828; font-weight: bold; }
        </style>
      </head>
      <body>
        ${htmlContent}
        <div class="footer">
          مصنع سيلين للمياه المعدنية والمرطبات © ${new Date().getFullYear()} | المهندس / مختار عبدالله الحييد
        </div>
      </body>
      </html>
    `;
    const blob = new Blob([fullHtml], { type: 'application/vnd.ms-excel;charset=utf-8' });
    downloadBlob(blob, filename + '_' + dateStamp() + '.xls');
  }

  // === PDF (طباعة نافذة جديدة) ===
  function exportPDF(title, bodyHtml, filename) {
    const db = APP.getDB();
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('يرجى السماح بالنوافذ المنبثقة');
      return;
    }
    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8" />
        <title>${title} - سيلين</title>
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
        <style>
          * { box-sizing: border-box; }
          body { font-family: 'Cairo', Tahoma, Arial; direction: rtl; padding: 30px; color: #1a2332; margin: 0; }
          .doc-header { text-align: center; margin-bottom: 24px; border-bottom: 3px double #1565c0; padding-bottom: 16px; }
          .doc-header img { width: 70px; height: 70px; }
          .doc-header h1 { color: #1565c0; margin: 8px 0 4px; font-size: 20px; }
          .doc-header p { color: #6b7c93; margin: 2px 0; font-size: 12px; }
          .doc-title { background: #f0f4fa; border-right: 4px solid #1565c0; padding: 10px 16px; margin-bottom: 16px; font-size: 16px; font-weight: 700; color: #1565c0; }
          h2 { color: #1565c0; border-right: 4px solid #1565c0; padding-right: 10px; margin: 20px 0 10px; font-size: 15px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 12px; }
          th { background: #1565c0; color: white; padding: 8px; text-align: right; font-weight: 700; }
          td { padding: 6px 10px; border-bottom: 1px solid #ddd; }
          tr:nth-child(even) td { background: #f9f9f9; }
          tfoot td { background: #e3f2fd; font-weight: 700; border-top: 2px solid #1565c0; }
          .kpi-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 16px; }
          .kpi { background: #f0f4fa; border-right: 4px solid #1565c0; padding: 12px; }
          .kpi .label { color: #6b7c93; font-size: 11px; margin-bottom: 4px; }
          .kpi .value { color: #1565c0; font-size: 18px; font-weight: 800; }
          .text-success { color: #2e7d32; font-weight: 700; }
          .text-danger { color: #c62828; font-weight: 700; }
          .text-warning { color: #ef6c00; font-weight: 700; }
          .text-primary { color: #1565c0; font-weight: 700; }
          .doc-footer { margin-top: 30px; padding-top: 14px; border-top: 2px solid #ddd; text-align: center; font-size: 11px; color: #6b7c93; }
          .doc-footer b { color: #1565c0; }
          .print-bar { position: fixed; top: 0; left: 0; right: 0; background: #1565c0; color: white; padding: 10px 20px; display: flex; justify-content: space-between; align-items: center; z-index: 9999; font-family: 'Cairo'; }
          .print-bar button { background: white; color: #1565c0; border: 0; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 700; font-family: 'Cairo'; }
          .print-bar button:hover { background: #f0f4fa; }
          @media print {
            .print-bar { display: none; }
            body { padding: 0; }
          }
          @page { margin: 1.5cm; }
        </style>
      </head>
      <body>
        <div class="print-bar">
          <span>📄 ${title} - جاهز للطباعة</span>
          <span>
            <button onclick="window.print()">🖨 طباعة / حفظ PDF</button>
            <button onclick="window.close()" style="background:#c62828;color:white;margin-right:8px">✕ إغلاق</button>
          </span>
        </div>
        <div class="doc-header">
          <img src="${window.location.origin}${window.location.pathname.replace(/\/[^/]*$/, '')}/logo.png" alt="سيلين" onerror="this.style.display='none'" />
          <h1>${db.meta.factory}</h1>
          <p>${db.meta.location} | ${db.meta.year}</p>
        </div>
        <div class="doc-title">${title}</div>
        ${bodyHtml}
        <div class="doc-footer">
          جميع الحقوق محفوظة © ${db.meta.year} | <b>${db.meta.copyright}</b><br>
          ${db.meta.role} - ${db.meta.location}<br>
          تم الإصدار: ${new Date().toLocaleString('ar-EG')}
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
  }

  // === JSON ===
  function exportJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    downloadBlob(blob, filename + '_' + dateStamp() + '.json');
  }

  // === بناء CSV من مصفوفة صفوف ===
  function rowsToCSV(headers, rows) {
    let csv = headers.map(h => `"${h}"`).join(',') + '\n';
    rows.forEach(row => {
      csv += row.map(cell => {
        if (cell === null || cell === undefined) return '';
        const s = String(cell).replace(/"/g, '""');
        return `"${s}"`;
      }).join(',') + '\n';
    });
    return csv;
  }

  // === بناء HTML table من headers + rows (للـ Excel/PDF) ===
  function rowsToHTMLTable(headers, rows, options = {}) {
    const { title, footerRow, classes } = options;
    let html = '';
    if (title) html += `<h2>${title}</h2>`;
    html += '<table>';
    html += '<thead><tr>' + headers.map(h => `<th>${h}</th>`).join('') + '</tr></thead>';
    html += '<tbody>';
    rows.forEach(row => {
      html += '<tr>' + row.map(cell => {
        const cls = (cell && cell.cls) ? ` class="${cell.cls}"` : '';
        const val = (cell && cell.v !== undefined) ? cell.v : (cell || '-');
        return `<td${cls}>${val}</td>`;
      }).join('') + '</tr>';
    });
    html += '</tbody>';
    if (footerRow) {
      html += '<tfoot><tr>' + footerRow.map(cell => `<td>${cell}</td>`).join('') + '</tr></tfoot>';
    }
    html += '</table>';
    return html;
  }

  return {
    register, getExporters, listPages,
    exportCSV, exportExcel, exportPDF, exportJSON,
    rowsToCSV, rowsToHTMLTable,
    downloadBlob, dateStamp
  };
})();
