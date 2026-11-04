// گزارش مدیریتی A4 و خروجی کارنامه‌های HTML در ZIP
(function reportCardExports(global) {
  const THEME_CSS = `
    *{box-sizing:border-box}
    body{--page-bg:linear-gradient(135deg,#0f172a,#1e1b4b 55%,#312e81);--card-bg:rgba(30,41,59,.96);--text:#f8fafc;--muted:rgba(15,23,42,.7);--row:rgba(15,23,42,.45);--border:rgba(255,255,255,.14);--label:#c4b5fd;--header:linear-gradient(135deg,#8b5cf6,#3b82f6);--badge:linear-gradient(135deg,#7c3aed,#2563eb);--track:rgba(255,255,255,.12);margin:0;min-height:100vh;padding:28px 14px;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:14px;font-family:Tahoma,'Segoe UI',Arial,sans-serif;background:var(--page-bg);color:var(--text)}
    body[data-theme=light]{--page-bg:linear-gradient(135deg,#e0e7ff,#f8fafc 55%,#dbeafe);--card-bg:#fff;--text:#172033;--muted:#f1f5f9;--row:#f8fafc;--border:#dbe3ee;--label:#6d28d9;--header:linear-gradient(135deg,#7c3aed,#2563eb);--badge:linear-gradient(135deg,#7c3aed,#2563eb);--track:#e2e8f0}
    body[data-theme=ocean]{--page-bg:linear-gradient(135deg,#082f49,#0f766e 55%,#164e63);--card-bg:#f0fdfa;--text:#12323a;--muted:#ccfbf1;--row:#fff;--border:#99f6e4;--label:#0f766e;--header:linear-gradient(135deg,#0891b2,#0f766e);--badge:linear-gradient(135deg,#0f766e,#0284c7);--track:#d1fae5}
    body[data-theme=forest]{--page-bg:linear-gradient(135deg,#052e16,#14532d 55%,#365314);--card-bg:#f0fdf4;--text:#163322;--muted:#dcfce7;--row:#fff;--border:#bbf7d0;--label:#15803d;--header:linear-gradient(135deg,#16a34a,#0f766e);--badge:linear-gradient(135deg,#15803d,#0f766e);--track:#dcfce7}
    body[data-theme=sunset]{--page-bg:linear-gradient(135deg,#431407,#9a3412 55%,#7f1d1d);--card-bg:#fffaf5;--text:#3f241b;--muted:#ffedd5;--row:#fff;--border:#fed7aa;--label:#c2410c;--header:linear-gradient(135deg,#f97316,#e11d48);--badge:linear-gradient(135deg,#ea580c,#e11d48);--track:#ffedd5}
    .theme-picker{display:flex;justify-content:center;align-items:center;gap:8px;flex-wrap:wrap}.theme-button{padding:8px 13px;border:1px solid var(--border);border-radius:20px;background:var(--card-bg);color:var(--text);font:inherit;font-size:12px;cursor:pointer}.theme-button[aria-pressed=true]{outline:2px solid var(--label);outline-offset:2px}
    .card{width:min(700px,100%);padding:24px;display:flex;flex-direction:column;gap:16px;color:var(--text);background:var(--card-bg);border:1px solid var(--border);border-radius:22px;box-shadow:0 25px 50px rgba(0,0,0,.25)}.header{padding:17px;text-align:center;color:#fff;background:var(--header);border-radius:14px}.header h1{margin:0;font-size:21px}.report-meta{display:flex;justify-content:center;flex-wrap:wrap;gap:7px;color:var(--label);font-size:12px}.report-meta span{padding:6px 10px;border-radius:20px;background:var(--muted)}
    .student-info{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;padding:12px;background:var(--muted);border:1px solid var(--border);border-radius:13px;font-size:13px}.student-info div{padding:5px;overflow-wrap:anywhere}.student-info b{color:var(--label)}.scores-list{display:flex;flex-direction:column;gap:8px}.score-row{display:flex;align-items:center;gap:12px;padding:8px 10px;background:var(--row);border:1px solid var(--border);border-radius:11px}.skill-name{width:145px;flex-shrink:0;color:var(--text);font-size:13px;font-weight:bold}.bar-container{position:relative;flex:1;height:24px;overflow:hidden;display:flex;align-items:center;background:var(--track);border-radius:20px}.bar-fill{height:100%;border-radius:20px}.bar-fill.high{background:linear-gradient(90deg,#22c55e,#15803d)}.bar-fill.medium{background:linear-gradient(90deg,#fde047,#eab308)}.bar-fill.low{background:linear-gradient(90deg,#fb7185,#dc2626)}.bar-text{position:absolute;width:100%;text-align:center;font-size:12px;font-weight:bold;direction:ltr}.bar-text.high,.bar-text.low{color:#fff;text-shadow:0 1px 2px rgba(0,0,0,.45)}.bar-text.medium{color:#422006}.footer{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;padding-top:12px;border-top:1px dashed var(--border)}.total-badge,.status-badge{padding:8px 14px;border-radius:20px;font-size:13px;font-weight:bold}.total-badge{color:#fff;background:var(--badge)}.status-badge.accepted{color:#166534;background:#dcfce7}.status-badge.conditional{color:#854d0e;background:#fef9c3}.status-badge.failed{color:#991b1b;background:#fee2e2}
    @media(max-width:480px){.card{padding:16px}.header h1{font-size:18px}.score-row{gap:7px}.skill-name{width:112px;font-size:12px}.student-info{font-size:12px}}
    @media print{@page{size:A4 portrait;margin:12mm}body{min-height:0;padding:0;background:#fff!important;color:#172033!important;print-color-adjust:exact;-webkit-print-color-adjust:exact}.theme-picker{display:none}.card{width:100%;max-width:none;padding:12mm;box-shadow:none;border:0;border-radius:0;background:#fff;color:#172033;break-inside:avoid}.header{print-color-adjust:exact;-webkit-print-color-adjust:exact}.score-row,.student-info{break-inside:avoid}}
  `;

  const THEMES = [
    ['violet', 'بنفش'], ['light', 'روشن'], ['ocean', 'اقیانوسی'], ['forest', 'جنگلی'], ['sunset', 'غروب']
  ];

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[char]);
  }

  function safeFilePart(value) {
    return String(value || 'class').replace(/[\\/:*?"<>|\u0000-\u001f]/g, '-').replace(/\s+/g, '-').slice(0, 64) || 'class';
  }

  function normalizedScore(value, max) {
    if (value === null || value === undefined || String(value).trim() === '') return null;
    const parsed = Number(normalizeNumber(value));
    return Number.isFinite(parsed) && parsed >= 0 && parsed <= max ? parsed : null;
  }

  function studentScores(student) {
    ensureReportCard(student);
    return RC_FIELDS.map(field => ({
      field,
      value: normalizedScore(student.reportCard.scores[field.scoreIndex], field.max)
    }));
  }

  function missingFor(student) {
    const missing = [];
    if (!String(student.fullName || '').trim()) missing.push('نام');
    if (!String(student.fatherName || '').trim()) missing.push('نام پدر');
    if (!String(student.nationalId || '').trim()) missing.push('کد ملی');
    studentScores(student).forEach(item => {
      if (item.value === null) missing.push(item.field.label);
    });
    return missing;
  }

  function reportCardHtml(cls, student) {
    const scores = studentScores(student);
    const total = scores.reduce((sum, item) => sum + (item.value || 0), 0);
    const status = total >= 160
      ? { text: 'قبول', className: 'accepted' }
      : total >= 140 ? { text: 'قبول مشروط', className: 'conditional' }
        : { text: 'مردود', className: 'failed' };
    const rows = scores.map(({ field, value }) => {
      const score = value || 0;
      const pct = Math.max(0, Math.min(100, score / field.max * 100));
      const level = pct >= 80 ? 'high' : pct >= 50 ? 'medium' : 'low';
      return `<div class="score-row"><span class="skill-name">${esc(field.label.replace(/\s*\([^)]*\)\s*$/, ''))}</span><div class="bar-container"><div class="bar-fill ${level}" style="width:${pct}%"></div><span class="bar-text ${level}">${value === null ? '—' : value} / ${field.max}</span></div></div>`;
    }).join('');
    const themeButtons = THEMES.map(([theme, label], index) =>
      `<button class="theme-button" type="button" data-theme="${theme}" aria-pressed="${index === 0}">${label}</button>`
    ).join('');

    return `<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>کارنامه - ${esc(student.fullName)}</title><style>${THEME_CSS}</style></head><body data-theme="violet"><main class="page"><nav class="theme-picker" aria-label="انتخاب تم">${themeButtons}</nav><section class="card"><header class="header"><h1>کارنامه ارزیابی عملکرد زبان‌آموز</h1></header><div class="report-meta"><span>کلاس: ${esc(cls.name)}</span><span>جلسه: ${esc(cls.session?.sessionNo || '—')}</span><span>تاریخ: ${esc(cls.session?.dateJalali || '—')}</span></div><div class="student-info"><div><b>نام:</b> ${esc(student.fullName)}</div><div><b>نام پدر:</b> ${esc(student.fatherName)}</div><div><b>کد ملی:</b> ${esc(student.nationalId)}</div><div><b>وضعیت:</b> ${status.text}</div></div><div class="scores-list">${rows}</div><footer class="footer"><div class="total-badge">مجموع نمرات: ${total} از ۲۰۰</div><div class="status-badge ${status.className}">${status.text}</div></footer></section></main><script>document.querySelectorAll('.theme-button').forEach(function(button){button.addEventListener('click',function(){document.body.dataset.theme=button.dataset.theme;document.querySelectorAll('.theme-button').forEach(function(item){item.setAttribute('aria-pressed',String(item===button));});});});</script></body></html>`;
  }

  const crcTable = (() => {
    const table = new Uint32Array(256);
    for (let n = 0; n < 256; n += 1) {
      let crc = n;
      for (let k = 0; k < 8; k += 1) crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
      table[n] = crc >>> 0;
    }
    return table;
  })();

  function crc32(bytes) {
    let crc = 0xffffffff;
    for (const byte of bytes) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
    return (crc ^ 0xffffffff) >>> 0;
  }

  function zipHeader(size, nameLength, crc, time, date, offset, central) {
    const header = new Uint8Array((central ? 46 : 30) + nameLength);
    const view = new DataView(header.buffer);
    if (central) {
      view.setUint32(0, 0x02014b50, true); view.setUint16(4, 20, true); view.setUint16(6, 20, true);
      view.setUint16(8, 0x0800, true); view.setUint16(10, 0, true); view.setUint16(12, time, true); view.setUint16(14, date, true);
      view.setUint32(16, crc, true); view.setUint32(20, size, true); view.setUint32(24, size, true);
      view.setUint16(28, nameLength, true); view.setUint16(30, 0, true); view.setUint16(32, 0, true);
      view.setUint16(34, 0, true); view.setUint16(36, 0, true); view.setUint32(38, 0, true); view.setUint32(42, offset, true);
    } else {
      view.setUint32(0, 0x04034b50, true); view.setUint16(4, 20, true); view.setUint16(6, 0);
      view.setUint16(8, 0x0800, true); view.setUint16(10, time, true); view.setUint16(12, date, true);
      view.setUint32(14, crc, true); view.setUint32(18, size, true); view.setUint32(22, size, true);
      view.setUint16(26, nameLength, true); view.setUint16(28, 0, true);
    }
    return header;
  }

  function createZip(files) {
    const encoder = new TextEncoder();
    const localParts = [];
    const centralParts = [];
    const now = new Date();
    const dosTime = (now.getHours() << 11) | (now.getMinutes() << 5) | Math.floor(now.getSeconds() / 2);
    const dosDate = ((Math.max(1980, now.getFullYear()) - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();
    let offset = 0;
    files.forEach(file => {
      const name = encoder.encode(file.name);
      const data = encoder.encode(file.content);
      const checksum = crc32(data);
      const local = zipHeader(data.length, name.length, checksum, dosTime, dosDate, 0, false);
      local.set(name, 30); localParts.push(local, data);
      const central = zipHeader(data.length, name.length, checksum, dosTime, dosDate, offset, true);
      central.set(name, 46); centralParts.push(central);
      offset += local.length + data.length;
    });
    const directorySize = centralParts.reduce((sum, part) => sum + part.length, 0);
    const end = new Uint8Array(22);
    const view = new DataView(end.buffer);
    view.setUint32(0, 0x06054b50, true); view.setUint16(4, 0, true); view.setUint16(6, 0, true);
    view.setUint16(8, files.length, true); view.setUint16(10, files.length, true);
    view.setUint32(12, directorySize, true); view.setUint32(16, offset, true); view.setUint16(20, 0, true);
    return new Blob([...localParts, ...centralParts, end], { type: 'application/zip' });
  }

  function download(blob, fileName) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url; anchor.download = fileName; anchor.style.display = 'none';
    document.body.appendChild(anchor); anchor.click(); anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  }

  function exportReportCardsZip() {
    const cls = AppStore.getSelectedClass();
    if (!cls?.students?.length) return toast('زبان‌آموزی در این کلاس وجود ندارد.');
    const invalid = cls.students.map((student, index) => ({ student, index, missing: missingFor(student) })).filter(item => item.missing.length);
    if (invalid.length) {
      const list = invalid.slice(0, 3).map(item => `${item.student.fullName || `زبان‌آموز ${item.index + 1}`} (${item.missing.join('، ')})`);
      return toast(`برای ساخت ZIP مشخصات و نمره‌ها را کامل کنید: ${list.join('؛ ')}${invalid.length > 3 ? `؛ و ${invalid.length - 3} نفر دیگر` : ''}`);
    }
    const files = cls.students.map((student, index) => ({
      name: `${String(index + 1).padStart(2, '0')}-${safeFilePart(student.fullName)}.html`,
      content: reportCardHtml(cls, student)
    }));
    download(createZip(files), `کارنامه‌های-${safeFilePart(cls.name)}.zip`);
    toast(`${files.length} کارنامهٔ HTML در ZIP آماده شد.`);
  }

  function exportClassReportA4() {
    const cls = AppStore.getSelectedClass();
    if (!cls?.students?.length) return toast('زبان‌آموزی در این کلاس وجود ندارد.');
    const reportWindow = window.open('', '_blank');
    if (!reportWindow) return toast('پنجرهٔ گزارش توسط مرورگر مسدود شد. اجازهٔ بازشدن پنجره را بدهید و دوباره تلاش کنید.');

    const headers = ['ردیف', 'نام و نام خانوادگی', 'نام پدر', 'کد ملی', ...RC_FIELDS.map(field => field.label), 'جمع از ۲۰۰'];
    const rows = cls.students.map((student, index) => {
      const scores = studentScores(student);
      const total = scores.reduce((sum, item) => sum + (item.value || 0), 0);
      const cells = scores.map(item => `<td>${item.value === null ? '—' : esc(item.value)}</td>`).join('');
      return `<tr><td>${index + 1}</td><td class="student-name">${esc(student.fullName || 'بدون نام')}</td><td>${esc(student.fatherName || '—')}</td><td>${esc(student.nationalId || '—')}</td>${cells}<td class="total">${total}</td></tr>`;
    }).join('');
    const html = `<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>گزارش نمرات - ${esc(cls.name)}</title><style>
      *{box-sizing:border-box}body{margin:0;padding:18px;color:#172033;background:#fff;font-family:Tahoma,'Segoe UI',Arial,sans-serif}.toolbar{margin:0 auto 14px;max-width:1100px;display:flex;justify-content:flex-end;gap:8px}.toolbar button{border:0;border-radius:7px;padding:10px 15px;background:#2563eb;color:#fff;font:inherit;cursor:pointer}.sheet{width:100%;margin:auto}.title{text-align:center;margin:0 0 6px;font-size:18px}.meta{text-align:center;margin-bottom:12px;color:#475569;font-size:11px}.table-wrap{width:100%;overflow:auto}table{width:100%;border-collapse:collapse;table-layout:auto;font-size:8px}th,td{border:1px solid #64748b;padding:5px 3px;text-align:center;vertical-align:middle}thead{display:table-header-group}th{background:#e2e8f0;font-weight:bold}.student-name{text-align:right;min-width:105px}.total{font-weight:bold;background:#f1f5f9}.footer{margin-top:9px;color:#64748b;font-size:9px}@page{size:A4 landscape;margin:8mm}@media print{body{padding:0}.toolbar{display:none}.sheet{width:100%}table{font-size:7px}th,td{padding:4px 2px;print-color-adjust:exact;-webkit-print-color-adjust:exact}tr{break-inside:avoid;page-break-inside:avoid}}
      </style></head><body><div class="toolbar"><button onclick="window.print()">چاپ / ذخیره PDF</button></div><main class="sheet"><h1 class="title">گزارش نمرات کارنامهٔ کلاس ${esc(cls.name)}</h1><div class="meta">جلسه: ${esc(cls.session?.sessionNo || '—')} &nbsp; | &nbsp; تاریخ: ${esc(cls.session?.dateJalali || '—')} &nbsp; | &nbsp; تعداد زبان‌آموزان: ${cls.students.length}</div><div class="table-wrap"><table><thead><tr>${headers.map(header => `<th>${esc(header)}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></div><div class="footer">گزارش نمرات کلاس برای ارائه به مدیریت مؤسسه</div></main><script>window.addEventListener('load',function(){setTimeout(function(){window.print();},250);});</script></body></html>`;
    reportWindow.document.open();
    reportWindow.document.write(html);
    reportWindow.document.close();
  }

  global.exportReportCardsZip = exportReportCardsZip;
  global.exportClassReportA4 = exportClassReportA4;
  document.getElementById('btnExportReportCardsZip')?.addEventListener('click', exportReportCardsZip);
  document.getElementById('btnExportReportA4')?.addEventListener('click', exportClassReportA4);
})(window);
