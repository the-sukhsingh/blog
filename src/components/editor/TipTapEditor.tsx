"use client";

import {
  Command,
  createSuggestionItems,
  EditorBubble,
  EditorBubbleItem,
  EditorCommand,
  EditorCommandEmpty,
  EditorCommandItem,
  EditorCommandList,
  EditorContent,
  EditorRoot,
  HighlightExtension,
  handleCommandNavigation,
  Placeholder,
  renderItems,
  StarterKit,
  TaskItem,
  TaskList,
  TiptapImage,
  TiptapLink,
  TiptapUnderline,
} from "novel";
import { useCallback, useMemo, useState } from "react";
import {
  BoldIcon,
  BulletListIcon,
  ChevronDownIcon,
  CodeIcon,
  DividerIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  HighlighterIcon,
  ImageUpload,
  ItalicIcon,
  LinkIcon,
  OrderedListIcon,
  QuoteIcon,
  StrikethroughIcon,
  TaskListIcon,
  TextIcon,
  UnderlineIcon,
  UnlinkIcon,
} from "@/lib/icons";

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

// Basic markdown to HTML parser for pasted markdown text
function markdownToHtml(markdown: string): string {
  let html = markdown;

  html = html.replace(/^\s*>\s+(.*)$/gm, "<blockquote><p>$1</p></blockquote>");
  html = html.replace(/^\s*###\s+(.*)$/gm, "<h3>$1</h3>");
  html = html.replace(/^\s*##\s+(.*)$/gm, "<h2>$1</h2>");
  html = html.replace(/^\s*#\s+(.*)$/gm, "<h1>$1</h1>");
  html = html.replace(/^\s*[-*_]{3,}\s*$/gm, "<hr />");

  html = html.replace(/^\s*[-*+]\s+(.*)$/gm, "<li>$1</li>");
  html = html.replace(/(<li>[\s\S]*?<\/li>)/g, (match) => `<ul>${match}</ul>`);
  html = html.replace(/<\/ul>\s*<ul>/g, "");

  html = html.replace(/^\s*\d+\.\s+(.*)$/gm, "<li>$1</li>");
  html = html.replace(/(<li>[\s\S]*?<\/li>)/g, (match) => {
    if (!match.startsWith("<ul>")) {
      return `<ol>${match}</ol>`;
    }
    return match;
  });
  html = html.replace(/<\/ol>\s*<ol>/g, "");

  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/__([^_]+)__/g, "<strong>$1</strong>");
  html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  html = html.replace(/_([^_]+)_/g, "<em>$1</em>");
  html = html.replace(/~~([^~]+)~~/g, "<s>$1</s>");
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

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

export default function NovelEditor({
  content,
  onChange,
  placeholder = "Tell your story... (Press '/' for commands)",
}: TipTapEditorProps) {
  const [linkInputOpen, setLinkInputOpen] = useState(false);
  const [nodeMenuOpen, setNodeMenuOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  const initialParsedContent = useMemo(() => {
    if (!content) return undefined;
    if (typeof content === "string") {
      try {
        return JSON.parse(content);
      } catch {
        return content;
      }
    }
    return content;
  }, [content]);

  // Define slash command items with duotone icons
  const suggestionItems = useMemo(
    () =>
      createSuggestionItems([
        {
          title: "Text",
          description: "Start typing with plain text",
          searchTerms: ["p", "paragraph", "text"],
          icon: <TextIcon className="size-4.5" />,
          command: ({ editor, range }) => {
            editor
              .chain()
              .focus()
              .deleteRange(range)
              .toggleNode("paragraph", "paragraph")
              .run();
          },
        },
        {
          title: "Heading 1",
          description: "Big title block heading",
          searchTerms: ["title", "big", "h1", "heading1"],
          icon: <Heading1Icon className="size-4.5" />,
          command: ({ editor, range }) => {
            editor
              .chain()
              .focus()
              .deleteRange(range)
              .setNode("heading", { level: 1 })
              .run();
          },
        },
        {
          title: "Heading 2",
          description: "Medium section heading",
          searchTerms: ["subtitle", "medium", "h2", "heading2"],
          icon: <Heading2Icon className="size-4.5" />,
          command: ({ editor, range }) => {
            editor
              .chain()
              .focus()
              .deleteRange(range)
              .setNode("heading", { level: 2 })
              .run();
          },
        },
        {
          title: "Heading 3",
          description: "Small sub-section heading",
          searchTerms: ["subheading", "small", "h3", "heading3"],
          icon: <Heading3Icon className="size-4.5" />,
          command: ({ editor, range }) => {
            editor
              .chain()
              .focus()
              .deleteRange(range)
              .setNode("heading", { level: 3 })
              .run();
          },
        },
        {
          title: "Bullet List",
          description: "Simple bulleted list",
          searchTerms: ["unordered", "point", "bullet", "list"],
          icon: <BulletListIcon className="size-4.5" />,
          command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleBulletList().run();
          },
        },
        {
          title: "Numbered List",
          description: "Sequential numbered list",
          searchTerms: ["ordered", "number", "list"],
          icon: <OrderedListIcon className="size-4.5" />,
          command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleOrderedList().run();
          },
        },
        {
          title: "Task List",
          description: "Track tasks with a todo checklist",
          searchTerms: ["todo", "task", "check", "list"],
          icon: <TaskListIcon className="size-4.5" />,
          command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleTaskList().run();
          },
        },
        {
          title: "Blockquote",
          description: "Quote citation block",
          searchTerms: ["quote", "blockquote", "cite"],
          icon: <QuoteIcon className="size-4.5" />,
          command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleBlockquote().run();
          },
        },
        {
          title: "Code Block",
          description: "Capture code snippet with formatting",
          searchTerms: ["code", "codeblock", "snippet"],
          icon: <CodeIcon className="size-4.5" />,
          command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
          },
        },
        {
          title: "Divider",
          description: "Horizontal divider line",
          searchTerms: ["line", "hr", "divider", "separator"],
          icon: <DividerIcon className="size-4.5" />,
          command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).setHorizontalRule().run();
          },
        },
        {
          title: "Upload Image",
          description: "Upload an image block from your file system",
          searchTerms: ["photo", "picture", "image", "upload"],
          icon: <ImageUpload className="size-4.5" />,
          command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).run();
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
                  editor
                    .chain()
                    .focus()
                    .setImage({ src: URL.createObjectURL(file) })
                    .run();
                }
              } catch {
                editor
                  .chain()
                  .focus()
                  .setImage({ src: URL.createObjectURL(file) })
                  .run();
              }
            };
            input.click();
          },
        },
      ]),
    [],
  );

  const extensions = useMemo(
    () => [
      StarterKit.configure({
        bulletList: {
          HTMLAttributes: {
            class: "list-disc pl-6 space-y-1 my-3",
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: "list-decimal pl-6 space-y-1 my-3",
          },
        },
        blockquote: {
          HTMLAttributes: {
            class:
              "border-l-4 border-primary/80 pl-4 italic text-muted-foreground my-4 bg-muted/20 py-1 rounded-r-md",
          },
        },
        codeBlock: {
          HTMLAttributes: {
            class:
              "rounded-xl bg-muted/80 p-4 my-4 font-mono text-sm border border-border/50 overflow-x-auto",
          },
        },
      }),
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === "heading") {
            return `Heading ${node.attrs.level}`;
          }
          return placeholder;
        },
        includeChildren: true,
      }),
      TiptapLink.configure({
        openOnClick: false,
        HTMLAttributes: {
          class:
            "text-primary underline underline-offset-4 decoration-primary/40 hover:decoration-primary cursor-pointer transition-colors",
          rel: "noopener noreferrer",
        },
      }),
      TiptapImage.configure({
        HTMLAttributes: {
          class:
            "max-w-full rounded-xl my-6 border border-border/40 shadow-sm mx-auto",
        },
      }),
      TiptapUnderline,
      HighlightExtension.configure({
        multicolor: true,
      }),
      TaskList.configure({
        HTMLAttributes: {
          class: "not-prose pl-2 space-y-2 my-4",
        },
      }),
      TaskItem.configure({
        HTMLAttributes: {
          class: "flex items-start gap-2 select-none",
        },
        nested: true,
      }),
      Command.configure({
        suggestion: {
          items: () => suggestionItems,
          render: renderItems,
        },
      }),
    ],
    [placeholder, suggestionItems],
  );

  const handleLinkSubmit = useCallback(
    (editor: any) => {
      if (!linkUrl) {
        editor.chain().focus().extendMarkRange("link").unsetLink().run();
      } else {
        editor
          .chain()
          .focus()
          .extendMarkRange("link")
          .setLink({ href: linkUrl })
          .run();
      }
      setLinkInputOpen(false);
      setLinkUrl("");
    },
    [linkUrl],
  );

  const HIGHLIGHT_COLORS = [
    { label: "Yellow", value: "#fef08a" },
    { label: "Green", value: "#bbf7d0" },
    { label: "Blue", value: "#bfdbfe" },
    { label: "Pink", value: "#fbcfe8" },
    { label: "Purple", value: "#e9d5ff" },
  ];

  return (
    <div className="relative w-full">
      <EditorRoot>
        <EditorContent
          initialContent={initialParsedContent}
          extensions={extensions}
          onUpdate={({ editor }) => {
            onChange?.(editor.getJSON());
          }}
          editorProps={{
            attributes: {
              class:
                "prose prose-neutral dark:prose-invert max-w-none min-h-[500px] focus:outline-none py-4 text-foreground/90 font-sans leading-relaxed text-[16px]",
            },
            handleKeyDown(_view, event) {
              if (handleCommandNavigation(event)) {
                return true;
              }
              return false;
            },
            handlePaste(_view, event) {
              const text = event.clipboardData?.getData("text/plain");
              if (text && isMarkdown(text)) {
                const html = markdownToHtml(text);
                _view.dispatch(
                  _view.state.tr.replaceSelectionWith(
                    _view.state.schema.nodes.paragraph.create({}, [
                      _view.state.schema.text(text),
                    ]),
                  ),
                );
                return false;
              }
              return false;
            },
          }}
        >
          {/* Floating Selection Bubble Menu Bar */}
          <EditorBubble
            tippyOptions={{
              placement: "top",
              duration: 150,
              moveTransition: "transform 0.15s cubic-bezier(0.23, 1, 0.32, 1)",
            }}
            className="z-50 flex items-center gap-1 rounded-2xl border border-border/80 bg-background/90 backdrop-blur-xl p-1.5 shadow-2xl shadow-foreground/5 select-none animate-in fade-in zoom-in-95 duration-150 ease-out"
          >
            {/* Block Node Selector Dropdown */}
            <div className="relative flex items-center">
              <button
                type="button"
                onClick={() => setNodeMenuOpen((prev) => !prev)}
                className="flex h-8 items-center gap-1.5 rounded-lg px-2 text-xs font-semibold text-foreground/90 transition-all duration-150 ease-out hover:bg-muted/80 active:scale-[0.95] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <span>Format</span>
                <ChevronDownIcon className="size-3 opacity-70" />
              </button>

              {nodeMenuOpen && (
                <div className="absolute top-10 left-0 z-50 flex w-36 flex-col gap-0.5 rounded-xl border border-border/80 bg-background/95 backdrop-blur-xl p-1 shadow-xl animate-in fade-in zoom-in-95 duration-150">
                  <EditorBubbleItem
                    onSelect={(editor) => {
                      editor.chain().focus().setParagraph().run();
                      setNodeMenuOpen(false);
                    }}
                  >
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors cursor-pointer text-left active:scale-[0.97]"
                    >
                      <TextIcon className="size-3.5 text-primary" />
                      <span>Text</span>
                    </button>
                  </EditorBubbleItem>
                  <EditorBubbleItem
                    onSelect={(editor) => {
                      editor.chain().focus().toggleHeading({ level: 1 }).run();
                      setNodeMenuOpen(false);
                    }}
                  >
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-bold text-foreground hover:bg-muted transition-colors cursor-pointer text-left active:scale-[0.97]"
                    >
                      <Heading1Icon className="size-3.5 text-primary" />
                      <span>Heading 1</span>
                    </button>
                  </EditorBubbleItem>
                  <EditorBubbleItem
                    onSelect={(editor) => {
                      editor.chain().focus().toggleHeading({ level: 2 }).run();
                      setNodeMenuOpen(false);
                    }}
                  >
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-bold text-foreground hover:bg-muted transition-colors cursor-pointer text-left active:scale-[0.97]"
                    >
                      <Heading2Icon className="size-3.5 text-primary" />
                      <span>Heading 2</span>
                    </button>
                  </EditorBubbleItem>
                  <EditorBubbleItem
                    onSelect={(editor) => {
                      editor.chain().focus().toggleHeading({ level: 3 }).run();
                      setNodeMenuOpen(false);
                    }}
                  >
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer text-left active:scale-[0.97]"
                    >
                      <Heading3Icon className="size-3.5 text-primary" />
                      <span>Heading 3</span>
                    </button>
                  </EditorBubbleItem>
                  <EditorBubbleItem
                    onSelect={(editor) => {
                      editor.chain().focus().toggleBlockquote().run();
                      setNodeMenuOpen(false);
                    }}
                  >
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors cursor-pointer text-left active:scale-[0.97]"
                    >
                      <QuoteIcon className="size-3.5 text-primary" />
                      <span>Quote</span>
                    </button>
                  </EditorBubbleItem>
                </div>
              )}
            </div>

            <span className="h-4 w-px bg-border/60 mx-0.5" />

            {/* Text Formatting Actions */}
            <EditorBubbleItem
              onSelect={(editor) => editor.chain().focus().toggleBold().run()}
            >
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-150 ease-out hover:bg-muted text-muted-foreground hover:text-foreground active:scale-[0.95] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none cursor-pointer"
                title="Bold (⌘B)"
              >
                <BoldIcon className="size-3.5 text-foreground" />
              </button>
            </EditorBubbleItem>

            <EditorBubbleItem
              onSelect={(editor) => editor.chain().focus().toggleItalic().run()}
            >
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-150 ease-out hover:bg-muted text-muted-foreground hover:text-foreground active:scale-[0.95] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none cursor-pointer"
                title="Italic (⌘I)"
              >
                <ItalicIcon className="size-3.5 text-foreground" />
              </button>
            </EditorBubbleItem>

            <EditorBubbleItem
              onSelect={(editor) =>
                editor.chain().focus().toggleUnderline().run()
              }
            >
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-150 ease-out hover:bg-muted text-muted-foreground hover:text-foreground active:scale-[0.95] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none cursor-pointer"
                title="Underline (⌘U)"
              >
                <UnderlineIcon className="size-3.5 text-foreground" />
              </button>
            </EditorBubbleItem>

            <EditorBubbleItem
              onSelect={(editor) => editor.chain().focus().toggleStrike().run()}
            >
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-150 ease-out hover:bg-muted text-muted-foreground hover:text-foreground active:scale-[0.95] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none cursor-pointer"
                title="Strikethrough"
              >
                <StrikethroughIcon className="size-3.5 text-foreground" />
              </button>
            </EditorBubbleItem>

            <EditorBubbleItem
              onSelect={(editor) => editor.chain().focus().toggleCode().run()}
            >
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-150 ease-out hover:bg-muted text-muted-foreground hover:text-foreground active:scale-[0.95] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none cursor-pointer font-mono"
                title="Inline Code"
              >
                <CodeIcon className="size-3.5 text-foreground" />
              </button>
            </EditorBubbleItem>

            <span className="h-4 w-px bg-border/60 mx-0.5" />

            {/* Highlighting Chips */}
            <div className="flex items-center gap-1">
              {HIGHLIGHT_COLORS.map((color) => (
                <EditorBubbleItem
                  key={color.label}
                  onSelect={(editor) =>
                    editor
                      .chain()
                      .focus()
                      .toggleHighlight({ color: color.value })
                      .run()
                  }
                >
                  <button
                    type="button"
                    style={{ backgroundColor: color.value }}
                    className="h-4 w-4 rounded-full border border-black/10 transition-transform hover:scale-125 active:scale-95 cursor-pointer shadow-xs"
                    title={`Highlight ${color.label}`}
                  />
                </EditorBubbleItem>
              ))}
              <EditorBubbleItem
                onSelect={(editor) =>
                  editor.chain().focus().unsetHighlight().run()
                }
              >
                <button
                  type="button"
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all active:scale-[0.95] cursor-pointer"
                  title="Clear highlight"
                >
                  <HighlighterIcon className="size-3.5 text-foreground" />
                </button>
              </EditorBubbleItem>
            </div>

            <span className="h-4 w-px bg-border/60 mx-0.5" />

            {/* Link Manager */}
            <EditorBubbleItem
              onSelect={(editor) => {
                const prevUrl = editor.getAttributes("link").href;
                setLinkUrl(prevUrl ?? "");
                setLinkInputOpen((prev) => !prev);
              }}
            >
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-150 ease-out hover:bg-muted text-muted-foreground hover:text-foreground active:scale-[0.95] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none cursor-pointer"
                title="Add Link (⌘K)"
              >
                <LinkIcon className="size-3.5 text-foreground" />
              </button>
            </EditorBubbleItem>

            {linkInputOpen && (
              <div className="flex items-center gap-1 pl-1 animate-in fade-in zoom-in-95 duration-150">
                <input
                  type="url"
                  placeholder="Paste URL..."
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="h-7 w-40 rounded-lg border border-border bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const btn = e.currentTarget
                        .nextElementSibling as HTMLButtonElement;
                      btn?.click();
                    }
                  }}
                />
                <EditorBubbleItem
                  onSelect={(editor) => handleLinkSubmit(editor)}
                >
                  <button
                    type="button"
                    className="h-7 rounded-lg bg-primary px-2.5 text-[11px] font-bold text-primary-foreground transition-all duration-150 hover:bg-primary/95 active:scale-[0.96] cursor-pointer shadow-xs"
                  >
                    Apply
                  </button>
                </EditorBubbleItem>
                <EditorBubbleItem
                  onSelect={(editor) => {
                    editor
                      .chain()
                      .focus()
                      .extendMarkRange("link")
                      .unsetLink()
                      .run();
                    setLinkInputOpen(false);
                    setLinkUrl("");
                  }}
                >
                  <button
                    type="button"
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-muted transition-all active:scale-[0.95] cursor-pointer"
                    title="Remove Link"
                  >
                    <UnlinkIcon className="size-3.5 text-destructive" />
                  </button>
                </EditorBubbleItem>
              </div>
            )}
          </EditorBubble>

          {/* Notion-Style Slash Command Menu Portal */}
          <EditorCommand className="z-50 max-h-80 w-72 overflow-y-auto rounded-2xl border border-border/80 bg-background/95 backdrop-blur-xl p-1.5 shadow-2xl shadow-foreground/10 select-none animate-in fade-in slide-in-from-top-2 duration-150 ease-out scrollbar-none">
            <EditorCommandEmpty className="px-3 py-2 text-xs text-muted-foreground font-medium text-center">
              No matching commands
            </EditorCommandEmpty>
            <EditorCommandList className="space-y-0.5">
              {suggestionItems.map((item) => (
                <EditorCommandItem
                  value={item.title}
                  keywords={item.searchTerms}
                  onCommand={(val) => item.command?.(val)}
                  key={item.title}
                  className="flex w-full items-center gap-3 rounded-xl px-2.5 py-1.5 text-left transition-all duration-150 ease-out cursor-pointer hover:bg-muted/40 aria-selected:bg-muted/70 active:scale-[0.98] group"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground/80 transition-colors group-hover:text-foreground group-aria-selected:text-foreground">
                    {item.icon}
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-xs font-bold leading-none text-foreground">
                      {item.title}
                    </span>
                    <span className="text-[10px] text-muted-foreground/70 font-normal mt-1 leading-none truncate">
                      {item.description}
                    </span>
                  </div>
                </EditorCommandItem>
              ))}
            </EditorCommandList>
          </EditorCommand>
        </EditorContent>
      </EditorRoot>
    </div>
  );
}
