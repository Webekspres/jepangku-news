"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Typography from "@tiptap/extension-typography";
import { useEffect, useCallback } from "react";
import {
  Bold,
  Italic,
  UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading2,
  Heading3,
  Quote,
  Minus,
  Link as LinkIcon,
  Unlink,
  RotateCcw,
  RotateCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  shortcut?: string;
  children: React.ReactNode;
}

function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  shortcut,
  children,
}: ToolbarButtonProps) {
  const label = shortcut ? `${title} (${shortcut})` : title;

  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault(); // prevent focus loss from editor
        onClick();
      }}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={cn(
        "p-1.5 transition-colors border border-transparent",
        "hover:bg-white hover:border-jepang-border",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        active &&
          "bg-foreground text-white border-foreground hover:bg-foreground hover:border-foreground",
      )}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="w-px h-5 bg-jepang-border mx-1 self-center" />;
}

// Detect OS for shortcut display
const isMac =
  typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);
const mod = isMac ? "⌘" : "Ctrl";

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Tulis konten artikel...",
  className,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        // StarterKit already includes keyboard shortcuts for:
        // Bold: Ctrl/⌘+B, Italic: Ctrl/⌘+I, Strike: Ctrl/⌘+Shift+X
        // Code: Ctrl/⌘+E, Blockquote: Ctrl/⌘+Shift+B
        // BulletList: Ctrl/⌘+Shift+8, OrderedList: Ctrl/⌘+Shift+7
        // Undo: Ctrl/⌘+Z, Redo: Ctrl/⌘+Shift+Z (or Ctrl+Y on Windows)
        // Hard break: Shift+Enter
      }),
      Underline,
      // Typography converts markdown-like input in real time:
      // (c) → ©, (r) → ®, (tm) → ™
      // -- → en dash, --- → em dash
      // << / >> → « »
      // '...' → ellipsis …
      Typography,
      TextAlign.configure({
        types: ["heading", "paragraph"],
        // Shortcuts: Ctrl/⌘+Shift+L/E/R/J
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass:
          "before:content-[attr(data-placeholder)] before:text-jepang-muted before:float-left before:pointer-events-none before:h-0",
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-jepang-red underline underline-offset-2 cursor-pointer",
        },
      }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class: cn(
          "min-h-[320px] px-5 py-4 focus:outline-none font-sans text-base",
          // headings
          "[&_h2]:font-heading [&_h2]:font-black [&_h2]:text-2xl [&_h2]:tracking-tighter [&_h2]:mt-6 [&_h2]:mb-2",
          "[&_h3]:font-heading [&_h3]:font-bold [&_h3]:text-xl [&_h3]:tracking-tight [&_h3]:mt-5 [&_h3]:mb-2",
          // paragraphs
          "[&_p]:leading-relaxed [&_p]:mb-3",
          // lists
          "[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-3",
          "[&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-3",
          "[&_li]:mb-1",
          // blockquote
          "[&_blockquote]:border-l-4 [&_blockquote]:border-jepang-red [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-jepang-muted [&_blockquote]:my-4",
          // hr
          "[&_hr]:border-jepang-border [&_hr]:my-6",
          // links
          "[&_a]:text-jepang-red [&_a]:underline [&_a]:underline-offset-2",
          // strong / em
          "[&_strong]:font-bold",
          "[&_em]:italic",
        ),
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
  });

  // Sync external value changes (e.g. on form reset)
  useEffect(() => {
    if (!editor) return;
    if (editor.getHTML() !== value) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [value, editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL link:", prev ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className={cn("border border-jepang-border bg-white", className)}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 bg-jepang-off-white border-b border-jepang-border">
        {/* Headings */}
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          active={editor.isActive("heading", { level: 2 })}
          title="Heading 2"
        >
          <Heading2 size={15} strokeWidth={2} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          active={editor.isActive("heading", { level: 3 })}
          title="Heading 3"
        >
          <Heading3 size={15} strokeWidth={2} />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Inline marks */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Bold"
          shortcut={`${mod}+B`}
        >
          <Bold size={15} strokeWidth={2.5} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Italic"
          shortcut={`${mod}+I`}
        >
          <Italic size={15} strokeWidth={2} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          title="Underline"
          shortcut={`${mod}+U`}
        >
          <UnderlineIcon size={15} strokeWidth={2} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")}
          title="Strikethrough"
          shortcut={`${mod}+Shift+X`}
        >
          <Strikethrough size={15} strokeWidth={2} />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Alignment */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          active={editor.isActive({ textAlign: "left" })}
          title="Align left"
          shortcut={`${mod}+Shift+L`}
        >
          <AlignLeft size={15} strokeWidth={2} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          active={editor.isActive({ textAlign: "center" })}
          title="Align center"
          shortcut={`${mod}+Shift+E`}
        >
          <AlignCenter size={15} strokeWidth={2} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          active={editor.isActive({ textAlign: "right" })}
          title="Align right"
          shortcut={`${mod}+Shift+R`}
        >
          <AlignRight size={15} strokeWidth={2} />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Lists */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Bullet list"
          shortcut={`${mod}+Shift+8`}
        >
          <List size={15} strokeWidth={2} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="Ordered list"
          shortcut={`${mod}+Shift+7`}
        >
          <ListOrdered size={15} strokeWidth={2} />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Block elements */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          title="Blockquote"
          shortcut={`${mod}+Shift+B`}
        >
          <Quote size={15} strokeWidth={2} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal rule"
        >
          <Minus size={15} strokeWidth={2} />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Link */}
        <ToolbarButton
          onClick={setLink}
          active={editor.isActive("link")}
          title="Add link"
          shortcut={`${mod}+K`}
        >
          <LinkIcon size={15} strokeWidth={2} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().unsetLink().run()}
          disabled={!editor.isActive("link")}
          title="Remove link"
        >
          <Unlink size={15} strokeWidth={2} />
        </ToolbarButton>

        <ToolbarDivider />

        {/* History */}
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
          shortcut={`${mod}+Z`}
        >
          <RotateCcw size={15} strokeWidth={2} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
          shortcut={isMac ? `${mod}+Shift+Z` : `Ctrl+Y`}
        >
          <RotateCw size={15} strokeWidth={2} />
        </ToolbarButton>
      </div>

      {/* Editor area */}
      <EditorContent editor={editor} />

      {/* Shortcut hint bar */}
      <div className="border-t border-jepang-border bg-jepang-off-white px-3 py-1.5 flex flex-wrap gap-x-4 gap-y-1">
        {[
          [`${mod}+B`, "Bold"],
          [`${mod}+I`, "Italic"],
          [`${mod}+U`, "Underline"],
          [`${mod}+Z`, "Undo"],
          [isMac ? `${mod}+Shift+Z` : "Ctrl+Y", "Redo"],
          [`${mod}+K`, "Link"],
          ["Shift+Enter", "Line break"],
        ].map(([key, label]) => (
          <span key={key} className="text-[10px] text-jepang-muted font-mono">
            <kbd className="bg-white border border-jepang-border px-1 py-0.5 text-[10px]">
              {key}
            </kbd>{" "}
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
