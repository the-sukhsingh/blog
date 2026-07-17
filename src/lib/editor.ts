import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";

export function generateHtmlFromJSON(json: any) {
  if (!json) return "";

  // Tiptap generateHTML expects a JSON object. If a string is passed, try to parse it.
  let doc = json;
  if (typeof json === "string") {
    try {
      doc = JSON.parse(json);
    } catch {
      return json; // Fallback to returning the string if it's not JSON
    }
  }

  try {
    return generateHTML(doc, [
      StarterKit,
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full rounded-lg my-4",
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline underline-offset-2 cursor-pointer",
          rel: "noopener noreferrer",
        },
      }),
    ]);
  } catch (e) {
    console.error("Error generating HTML from Tiptap JSON:", e);
    return "";
  }
}

export function getPlainTextFromJSON(json: any): string {
  if (!json) return "";

  let doc = json;
  if (typeof json === "string") {
    try {
      doc = JSON.parse(json);
    } catch {
      return json;
    }
  }

  let text = "";
  function walk(node: any) {
    if (!node) return;
    if (node.type === "text" && typeof node.text === "string") {
      text += (text ? " " : "") + node.text;
    }
    if (Array.isArray(node.content)) {
      for (const child of node.content) {
        walk(child);
      }
    }
  }

  walk(doc);
  return text;
}
