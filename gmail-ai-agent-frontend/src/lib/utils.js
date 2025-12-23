import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const isAuthenticated = () => {
  const data = localStorage.getItem("authUser");
  const user = JSON.parse(data);
  return user?.token ? false : false;
};

export function parseEmailAndName(input) {
  if (!input) {
    return { name: null, email: null };
  }

  const match = input.match(/^(.*?)\s*<([^>]+)>$/);

  if (match) {
    return {
      name: match[1].trim(),
      email: match[2].trim(),
    };
  }

  // Fallback: only email provided
  return {
    name: null,
    email: input.trim(),
  };
}

export function formatDate(isoString) {
  if (!isoString) return "";

  const date = new Date(isoString);

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function sanitizeEmailHtml(html) {
  // Always return a string (prevents React crashes)
  if (typeof html !== "string") return "";

  return (
    html
      // Remove <script> tags completely
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")

      // Remove inline JS handlers: onclick, onload, etc.
      .replace(/\son\w+="[^"]*"/gi, "")
      .replace(/\son\w+='[^']*'/gi, "")

      // Block javascript: URLs
      .replace(/href\s*=\s*["']\s*javascript:[^"']*["']/gi, 'href="#"')

      // Block iframe/object/embed tags
      .replace(/<(iframe|object|embed)[\s\S]*?>[\s\S]*?<\/\1>/gi, "")
  );
}
