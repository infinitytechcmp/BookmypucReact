/**
 * Utility functions for exporting raw data to Excel (CSV) and PDF.
 */

/**
 * Recursively flattens a nested object into a single-level object with dot-notated keys.
 */
export function flattenObject(obj: any, prefix = '', res: Record<string, any> = {}): Record<string, any> {
  if (obj === null || obj === undefined) return res;
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const propName = prefix ? `${prefix}.${key}` : key;
      const val = obj[key];
      
      if (typeof val === 'object' && val !== null && !Array.isArray(val) && !(val instanceof Date)) {
        flattenObject(val, propName, res);
      } else if (Array.isArray(val)) {
        res[propName] = JSON.stringify(val);
      } else if (val instanceof Date) {
        res[propName] = val.toISOString();
      } else {
        res[propName] = val;
      }
    }
  }
  return res;
}

/**
 * Escapes a cell value for safe output in a CSV format.
 */
function escapeCsvValue(val: any): string {
  if (val === null || val === undefined) return '';
  let str = '';
  if (typeof val === 'object') {
    str = JSON.stringify(val);
  } else {
    str = String(val);
  }
  // Escape double quotes by doubling them
  str = str.replace(/"/g, '""');
  // If value contains comma, newline, carriage return, or double quote, enclose in double quotes
  if (str.includes(',') || str.includes('\n') || str.includes('\r') || str.includes('"')) {
    str = `"${str}"`;
  }
  return str;
}

/**
 * Escapes HTML characters to prevent XSS / formatting issues in PDF output.
 */
function escapeHtml(val: any): string {
  if (val === null || val === undefined) return '';
  const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Exports data objects to a CSV file (supported by Excel, featuring a UTF-8 BOM).
 */
export function exportToExcel(data: any[], filename: string) {
  if (!data || data.length === 0) {
    alert("No data available to export.");
    return;
  }

  const flattenedData = data.map(item => flattenObject(item));
  
  // Get all unique keys present in the dataset
  const keys = Array.from(
    new Set(flattenedData.flatMap(item => Object.keys(item)))
  );

  const csvRows: string[] = [];

  // Header row
  csvRows.push(keys.map(key => escapeCsvValue(key)).join(','));

  // Data rows
  for (const item of flattenedData) {
    const row = keys.map(key => escapeCsvValue(item[key]));
    csvRows.push(row.join(','));
  }

  const csvContent = csvRows.join('\r\n');
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates an dynamic landscape HTML table template and triggers the system's printing workflow.
 */
export function exportToPdf(data: any[], title: string) {
  if (!data || data.length === 0) {
    alert("No data available to export.");
    return;
  }

  const flattenedData = data.map(item => flattenObject(item));
  
  // Get all unique keys present in the dataset
  const keys = Array.from(
    new Set(flattenedData.flatMap(item => Object.keys(item)))
  );

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert("Please allow popups to export to PDF.");
    return;
  }

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    @page {
      size: A4 landscape;
      margin: 10mm;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 10px;
      color: #1f2937;
      font-size: 8px;
      line-height: 1.25;
    }
    h1 {
      font-size: 16px;
      font-weight: 700;
      margin: 0 0 4px 0;
      color: #111827;
    }
    .subtitle {
      font-size: 10px;
      color: #6b7280;
      margin-bottom: 12px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      page-break-inside: auto;
      table-layout: auto;
    }
    tr {
      page-break-inside: avoid;
      page-break-after: auto;
    }
    th, td {
      border: 1px solid #e5e7eb;
      padding: 5px 6px;
      text-align: left;
      word-break: break-word;
      vertical-align: top;
    }
    th {
      background-color: #f3f4f6;
      color: #374151;
      font-weight: 600;
      text-transform: uppercase;
      font-size: 7px;
      letter-spacing: 0.05em;
    }
    tr:nth-child(even) {
      background-color: #f9fafb;
    }
    @media print {
      body {
        padding: 0;
      }
    }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <div class="subtitle">Generated on: ${new Date().toLocaleString()} | Total Records: ${data.length}</div>
  <table>
    <thead>
      <tr>
        ${keys.map(key => `<th>${escapeHtml(key)}</th>`).join('')}
      </tr>
    </thead>
    <tbody>
      ${flattenedData.map(row => `
        <tr>
          ${keys.map(key => `<td>${escapeHtml(row[key])}</td>`).join('')}
        </tr>
      `).join('')}
    </tbody>
  </table>
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 300);
    };
  </script>
</body>
</html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
