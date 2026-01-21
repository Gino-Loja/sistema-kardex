import { readFile } from "node:fs/promises";
import path from "node:path";

const TEMPLATE_PATH = path.join(
  process.cwd(),
  "src",
  "email-template",
  "reset-password.html",
);

let cachedTemplate: string | null = null;

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const loadTemplate = async () => {
  if (cachedTemplate) {
    return cachedTemplate;
  }

  cachedTemplate = await readFile(TEMPLATE_PATH, "utf8");
  return cachedTemplate;
};

export const renderResetPasswordEmail = async (input: {
  name: string;
  url: string;
}) => {
  const template = await loadTemplate();
  return template
    .replace(/{{name}}/g, escapeHtml(input.name))
    .replace(/{{url}}/g, escapeHtml(input.url));
};
