function escapePdf(value) {
  return String(value)
    .replace(/[–—]/g, "-")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[^\x20-\x7E]/g, "?")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/[\r\n]+/g, " ");
}

function wrap(text, width = 92) {
  const words = String(text ?? "").replace(/\r/g, "").split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > width && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [""];
}

function textToLines(title, body) {
  const lines = [{ text: title, size: 18, gap: 8 }];
  for (const paragraph of String(body ?? "").split(/\n+/)) {
    const trimmed = paragraph.trim();
    if (!trimmed) {
      lines.push({ text: "", size: 10, gap: 7 });
      continue;
    }
    const bullet = /^[-•*]\s+/.test(trimmed);
    const source = bullet ? `- ${trimmed.replace(/^[-•*]\s+/, "")}` : trimmed;
    for (const line of wrap(source, bullet ? 86 : 92)) {
      lines.push({ text: line, size: 10.5, gap: 14 });
    }
    lines.push({ text: "", size: 10, gap: 5 });
  }
  return lines;
}

export function createTextPdf(title, body) {
  const lines = textToLines(title, body);
  const pages = [];
  let current = [];
  let y = 760;
  for (const line of lines) {
    const needed = line.gap ?? 14;
    if (y - needed < 50 && current.length) {
      pages.push(current);
      current = [];
      y = 760;
    }
    current.push({ ...line, y });
    y -= needed;
  }
  if (current.length) pages.push(current);

  const objects = [];
  const addObject = (content) => {
    objects.push(content);
    return objects.length;
  };

  const fontId = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  const boldFontId = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");
  const pageIds = [];
  const contentIds = [];

  for (const page of pages) {
    let stream = "BT\n";
    for (const line of page) {
      const font = line.size >= 16 ? "F2" : "F1";
      stream += `/${font} ${line.size} Tf\n1 0 0 1 54 ${line.y} Tm\n(${escapePdf(line.text)}) Tj\n`;
    }
    stream += "ET";
    const contentId = addObject(`<< /Length ${Buffer.byteLength(stream, "utf8")} >>\nstream\n${stream}\nendstream`);
    contentIds.push(contentId);
    const pageId = addObject("");
    pageIds.push(pageId);
  }

  const pagesId = addObject("");
  const catalogId = addObject(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`);

  pageIds.forEach((pageId, index) => {
    objects[pageId - 1] = `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 ${fontId} 0 R /F2 ${boldFontId} 0 R >> >> /Contents ${contentIds[index]} 0 R >>`;
  });
  objects[pagesId - 1] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`;

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((obj, index) => {
    offsets[index + 1] = Buffer.byteLength(pdf, "utf8");
    pdf += `${index + 1} 0 obj\n${obj}\nendobj\n`;
  });
  const xref = Buffer.byteLength(pdf, "utf8");
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objects.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return Buffer.from(pdf, "utf8");
}
