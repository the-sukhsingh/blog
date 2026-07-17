"use client";

import Image from "@tiptap/extension-image";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
  ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Quote,
  Strikethrough,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface TipTapEditorProps {
  content?: any;
  onChange?: (json: any) => void;
  placeholder?: string;
}

// Helper to check if text is Markdown
function isMarkdown(text: string): boolean {
  const markdownRegex =
    /(^\s*#+\s)|(^\s*[-*+]\s)|(^\s*\d+\.\s)|([*_~`]{1,3}[^*_~`]+[*_~`]{1,3})|(^\s*>\s)/m;
  return markdownRegex.test(text);
}

// Basic markdown to HTML parser
function markdownToHtml(markdown: string): string {
  let html = markdown;

  // Blocks: Blockquotes
  html = html.replace(/^\s*>\s+(.*)$/gm, "<blockquote><p>$1</p></blockquote>");

  // Blocks: Headings
  html = html.replace(/^\s*###\s+(.*)$/gm, "<h3>$1</h3>");
  html = html.replace(/^\s*##\s+(.*)$/gm, "<h2>$1</h2>");
  html = html.replace(/^\s*#\s+(.*)$/gm, "<h1>$1</h1>");

  // Blocks: Horizontal rules
  html = html.replace(/^\s*[-*_]{3,}\s*$/gm, "<hr />");

  // Blocks: Lists
  html = html.replace(/^\s*[-*+]\s+(.*)$/gm, "<li>$1</li>");
  html = html.replace(/(<li>[\s\S]*?<\/li>)/g, (match) => {
    return `<ul>${match}</ul>`;
  });
  html = html.replace(/<\/ul>\s*<ul>/g, "");

  html = html.replace(/^\s*\d+\.\s+(.*)$/gm, "<li>$1</li>");
  html = html.replace(/(<li>[\s\S]*?<\/li>)/g, (match) => {
    if (!match.startsWith("<ul>")) {
      return `<ol>${match}</ol>`;
    }
    return match;
  });
  html = html.replace(/<\/ol>\s*<ol>/g, "");

  // Inline formatting
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/__([^_]+)__/g, "<strong>$1</strong>");
  html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  html = html.replace(/_([^_]+)_/g, "<em>$1</em>");
  html = html.replace(/~~([^~]+)~~/g, "<s>$1</s>");
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

  // Paragraphs
  const lines = html.split(/\n{2,}/);
  const formattedParagraphs = lines.map((line) => {
    const trimmed = line.trim();
    if (!trimmed) return "";
    if (/^(<h|<blockquote|<ul|<ol|<hr)/.test(trimmed)) {
      return trimmed;
    }
    return `<p>${trimmed.replace(/\n/g, "<br />")}</p>`;
  });

  return formattedParagraphs.join("\n");
}

export default function TipTapEditor({
  content,
  onChange,
  placeholder = "Tell your story...",
}: TipTapEditorProps) {
  const [slashMenuOpen, setSlashMenuOpen] = useState(false);
  const [slashPosition, setSlashPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);

  // Custom Selection Bubble Menu States
  const [bubbleMenuOpen, setBubbleMenuOpen] = useState(false);
  const [bubbleMenuPosition, setBubbleMenuPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const slashMenuOpenRef = useRef(false);
  const selectedCommandIndexRef = useRef(0);
  const runCommandRef = useRef<((action: () => void) => void) | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: {
          openOnClick: false,
          HTMLAttributes: {
            class: "text-primary underline underline-offset-2 cursor-pointer",
            rel: "noopener noreferrer",
          },
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full rounded-xl my-6 border border-border/40",
        },
      }),
    ],
    content: content || "",
    editorProps: {
      attributes: {
        class:
          "prose prose-neutral dark:prose-invert max-w-none min-h-[500px] focus:outline-none py-4 text-foreground/90 font-sans leading-relaxed text-[16px]",
      },
      handleKeyDown(_view, event) {
        if (slashMenuOpenRef.current) {
          if (event.key === "ArrowDown") {
            setSelectedCommandIndex((prev) => (prev + 1) % COMMANDS.length);
            return true;
          }
          if (event.key === "ArrowUp") {
            setSelectedCommandIndex(
              (prev) => (prev - 1 + COMMANDS.length) % COMMANDS.length,
            );
            return true;
          }
          if (event.key === "Enter") {
            if (runCommandRef.current) {
              runCommandRef.current(
                COMMANDS[selectedCommandIndexRef.current].action,
              );
            }
            return true;
          }
          if (event.key === "Escape") {
            setSlashMenuOpen(false);
            return true;
          }
        }
        return false;
      },
      handlePaste(_view, event) {
        const text = event.clipboardData?.getData("text/plain");
        if (text && isMarkdown(text)) {
          const html = markdownToHtml(text);
          editor?.commands.insertContent(html);
          return true; // prevent default paste
        }
        return false;
      },
    },
    onUpdate({ editor }) {
      onChange?.(editor.getJSON());
    },
    immediatelyRender: false,
  });

  // Sync refs
  useEffect(() => {
    slashMenuOpenRef.current = slashMenuOpen;
    selectedCommandIndexRef.current = selectedCommandIndex;
  }, [slashMenuOpen, selectedCommandIndex]);

  const addImage = useCallback(async () => {
    if (!editor) return;

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = (await res.json()) as { url?: string };
        if (data.url) {
          editor.chain().focus().setImage({ src: data.url }).run();
        } else {
          const objectUrl = URL.createObjectURL(file);
          editor.chain().focus().setImage({ src: objectUrl }).run();
        }
      } catch {
        const objectUrl = URL.createObjectURL(file);
        editor.chain().focus().setImage({ src: objectUrl }).run();
      }
    };
    input.click();
  }, [editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Enter URL:", previousUrl ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const COMMANDS = [
    {
      label: "Heading 1",
      description: "Big title block heading",
      icon: Heading1,
      action: () => editor?.chain().focus().toggleHeading({ level: 1 }).run(),
    },
    {
      label: "Heading 2",
      description: "Medium section heading",
      icon: Heading2,
      action: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      label: "Heading 3",
      description: "Sub-section heading",
      icon: Heading3,
      action: () => editor?.chain().focus().toggleHeading({ level: 3 }).run(),
    },
    {
      label: "Bullet List",
      description: "Simple bulleted list",
      icon: List,
      action: () => editor?.chain().focus().toggleBulletList().run(),
    },
    {
      label: "Ordered List",
      description: "Sequential numbered list",
      icon: ListOrdered,
      action: () => editor?.chain().focus().toggleOrderedList().run(),
    },
    {
      label: "Blockquote",
      description: "Quote citation block",
      icon: Quote,
      action: () => editor?.chain().focus().toggleBlockquote().run(),
    },
    {
      label: "Divider",
      description: "Horizontal divider rule",
      icon: Minus,
      action: () => editor?.chain().focus().setHorizontalRule().run(),
    },
    {
      label: "Insert Image",
      description: "Upload image block",
      icon: ImageIcon,
      action: () => void addImage(),
    },
  ];

  const runCommand = useCallback(
    (action: () => void) => {
      if (!editor) return;
      const { state } = editor;
      const { selection } = state;

      // Delete the slash character
      editor
        .chain()
        .focus()
        .deleteRange({ from: selection.from - 1, to: selection.from })
        .run();
      // Apply command
      action();
      setSlashMenuOpen(false);
    },
    [editor],
  );

  useEffect(() => {
    runCommandRef.current = runCommand;
  }, [runCommand]);

  // Track selection to display Slash Menu & Custom Bubble Menu
  useEffect(() => {
    if (!editor) return;

    const handleSelectionUpdate = () => {
      const { state, view } = editor;
      const { selection } = state;
      const { $from } = selection;

      const blockText = $from.parent.textContent;
      const isSlash = blockText === "/";

      if (isSlash) {
        const coords = view.coordsAtPos(selection.from);
        const editorBound = view.dom.getBoundingClientRect();

        setSlashPosition({
          top: coords.bottom - editorBound.top + view.dom.scrollTop + 8,
          left: coords.left - editorBound.left,
        });
        setSlashMenuOpen(true);
        setSelectedCommandIndex(0);
        setBubbleMenuOpen(false);
      } else {
        setSlashMenuOpen(false);

        // Bubble menu logic
        if (!selection.empty && selection.from !== selection.to) {
          const text = state.doc.textBetween(selection.from, selection.to);
          if (text.trim().length > 0) {
            const coords = view.coordsAtPos(selection.from);
            const editorBound = view.dom.getBoundingClientRect();

            setBubbleMenuPosition({
              top: coords.top - editorBound.top + view.dom.scrollTop - 44,
              left: coords.left - editorBound.left,
            });
            setBubbleMenuOpen(true);
          } else {
            setBubbleMenuOpen(false);
          }
        } else {
          setBubbleMenuOpen(false);
        }
      }
    };

    editor.on("selectionUpdate", handleSelectionUpdate);
    editor.on("update", handleSelectionUpdate);
    return () => {
      editor.off("selectionUpdate", handleSelectionUpdate);
      editor.off("update", handleSelectionUpdate);
    };
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="relative">
      {/* Custom Floating Selection Bubble Menu */}
      {bubbleMenuOpen && bubbleMenuPosition && (
        <div
          className="absolute z-50 flex items-center gap-0.5 rounded-lg border border-border/80 bg-background/85 backdrop-blur-md p-1 shadow-lg select-none animate-in fade-in zoom-in-95 duration-100"
          style={{
            top: bubbleMenuPosition.top,
            left: Math.max(0, bubbleMenuPosition.left),
          }}
        >
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`flex h-8 w-8 items-center justify-center rounded-md transition-all cursor-pointer ${
              editor.isActive("bold")
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
            title="Bold"
          >
            <Bold size={14} />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`flex h-8 w-8 items-center justify-center rounded-md transition-all cursor-pointer ${
              editor.isActive("italic")
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
            title="Italic"
          >
            <Italic size={14} />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`flex h-8 w-8 items-center justify-center rounded-md transition-all cursor-pointer ${
              editor.isActive("strike")
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
            title="Strike"
          >
            <Strikethrough size={14} />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`flex h-8 w-8 items-center justify-center rounded-md transition-all cursor-pointer ${
              editor.isActive("code")
                ? "bg-primary/10 text-primary font-mono"
                : "text-muted-foreground hover:bg-muted hover:text-foreground font-mono"
            }`}
            title="Code Block"
          >
            <Code size={14} />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={setLink}
            className={`flex h-8 w-8 items-center justify-center rounded-md transition-all cursor-pointer ${
              editor.isActive("link")
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
            title="Add Link"
          >
            <Link2 size={14} />
          </button>
        </div>
      )}

      {/* Editor Content Area */}
      <div className="relative">
        {editor.isEmpty && (
          <p className="pointer-events-none absolute left-0 top-4 text-base text-muted-foreground/35 select-none font-sans">
            {placeholder}
          </p>
        )}
        <EditorContent editor={editor} />
      </div>

      {/* Notion-Style Slash Commands Menu */}
      {slashMenuOpen && slashPosition && (
        <div
          className="absolute z-50 w-64 max-h-72 overflow-y-auto rounded-xl border border-border/80 bg-background/95 backdrop-blur-md p-1.5 shadow-lg select-none animate-in fade-in slide-in-from-top-1 duration-100"
          style={{
            top: slashPosition.top,
            left: Math.max(0, slashPosition.left),
          }}
        >
          <div className="px-2.5 py-1 text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest">
            Basic Blocks
          </div>
          <div className="space-y-0.5 mt-1 select-none">
            {COMMANDS.map((cmd, idx) => {
              const Icon = cmd.icon;
              return (
                <button
                  key={cmd.label}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    runCommand(cmd.action);
                  }}
                  className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-1.5 text-left transition-colors cursor-pointer group ${
                    idx === selectedCommandIndex
                      ? "bg-accent text-accent-foreground font-semibold"
                      : "hover:bg-accent/45 text-foreground/90"
                  }`}
                >
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors ${
                      idx === selectedCommandIndex
                        ? "bg-background text-accent-foreground shadow-sm"
                        : "bg-muted text-muted-foreground group-hover:bg-background group-hover:text-foreground"
                    }`}
                  >
                    <Icon size={13} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold leading-none">
                      {cmd.label}
                    </span>
                    <span className="text-[10px] text-muted-foreground/75 font-normal mt-1 leading-none truncate">
                      {cmd.description}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
