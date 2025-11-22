const escapePdfText = (text = "") =>
  String(text).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");

const padCell = (value, width) => {
  const text = String(value ?? "");
  if (text.length >= width) {
    return text.slice(0, width);
  }
  return text + " ".repeat(width - text.length);
};

const buildTableLines = (columns = [], rows = []) => {
  if (!Array.isArray(columns) || columns.length === 0) return [];
  const widths = columns.map((col, index) => {
    const maxCell = rows.reduce((max, row) => {
      const value = row?.[index];
      return Math.max(max, String(value ?? "").length);
    }, String(col ?? "").length);
    return Math.min(Math.max(maxCell, 4), 40) + 2;
  });

  const formatRow = (values = []) =>
    columns
      .map((_, index) => padCell(values[index] ?? "", widths[index]))
      .join("|");

  const header = formatRow(columns);
  const divider = widths.map((width) => "-".repeat(width)).join("+");
  const body = rows.map((row) => formatRow(row));

  return [header, divider, ...body];
};

const buildPdfContentStream = (lines = []) => {
  const contentLines = [
    "BT",
    "/F1 10 Tf",
    "14 TL",
    "50 780 Td",
  ];
  lines.forEach((line, index) => {
    if (index === 0) {
      contentLines.push(`(${escapePdfText(line)}) Tj`);
    } else {
      contentLines.push("T*", `(${escapePdfText(line)}) Tj`);
    }
  });
  contentLines.push("ET");
  const content = contentLines.join("\n");
  return { content, length: content.length };
};

const buildSimplePdf = (lines = []) => {
  const { content, length } = buildPdfContentStream(lines);
  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  const addObject = (str) => {
    offsets.push(pdf.length);
    const index = offsets.length - 1;
    pdf += `${index} 0 obj\n${str}\nendobj\n`;
    return index;
  };

  const fontRef = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>");
  const contentRef = addObject(`<< /Length ${length} >>\nstream\n${content}\nendstream`);
  const pageRef = addObject(
    `<< /Type /Page /Parent 4 0 R /MediaBox [0 0 612 792] /Contents ${contentRef} 0 R /Resources << /Font << /F1 ${fontRef} 0 R >> >> >>`
  );
  const pagesRef = addObject(`<< /Type /Pages /Kids [${pageRef} 0 R] /Count 1 >>`);
  const catalogRef = addObject(`<< /Type /Catalog /Pages ${pagesRef} 0 R >>`);

  const xrefPosition = pdf.length;
  pdf += `xref\n0 ${offsets.length}\n`;
  pdf += "0000000000 65535 f \n";
  for (let i = 1; i < offsets.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer<< /Size ${offsets.length} /Root ${catalogRef} 0 R >>\nstartxref\n${xrefPosition}\n%%EOF`;
  return pdf;
};

export const downloadTablePdf = ({ title, columns = [], rows = [], filename = "table.pdf" }) => {
  const tableLines = buildTableLines(columns, rows);
  const lines = [title, "", ...tableLines];
  const pdf = buildSimplePdf(lines);
  const blob = new Blob([pdf], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
