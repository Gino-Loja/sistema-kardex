export const formatCsv = (headers: string[], rows: Array<string[]>): string => {
  const escapeValue = (value: string) => {
    const escaped = value.replace(/\"/g, "\"\"");
    if (/[\",\n\r]/.test(escaped)) {
      return `"${escaped}"`;
    }
    return escaped;
  };

  const headerLine = headers.map(escapeValue).join(",");
  const rowLines = rows.map((row) => row.map(escapeValue).join(","));

  return [headerLine, ...rowLines].join("\r\n");
};
