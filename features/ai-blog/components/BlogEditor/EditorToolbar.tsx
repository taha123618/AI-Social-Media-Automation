"use client";

import { type Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Heading2,
  Heading3,
  Quote,
  Undo,
  Redo,
  Table,
  Link,
  Code,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface EditorToolbarProps {
  editor: Editor | null;
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  if (!editor) return null;

  const btnBase = "h-7 w-7 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-md transition-all duration-150";
  const btnActive = "bg-slate-700 text-white ring-1 ring-slate-600";
  const separator = "h-4 w-px bg-slate-800/60 mx-0.5";

  return (
    <div className="flex flex-wrap items-center gap-0.5 p-1.5 bg-slate-900/60 border-b border-slate-800 rounded-t-xl">
      <button className={`${btnBase} ${editor.isActive("bold") ? btnActive : ""}`} onClick={() => editor.chain().focus().toggleBold().run()}>
        <Bold className="h-3.5 w-3.5 mx-auto" />
      </button>
      <button className={`${btnBase} ${editor.isActive("italic") ? btnActive : ""}`} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <Italic className="h-3.5 w-3.5 mx-auto" />
      </button>
      <button className={`${btnBase} ${editor.isActive("underline") ? btnActive : ""}`} onClick={() => editor.chain().focus().toggleUnderline().run()}>
        <Underline className="h-3.5 w-3.5 mx-auto" />
      </button>

      <div className={separator} />

      <button className={`${btnBase} ${editor.isActive("heading", { level: 2 }) ? btnActive : ""}`} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
        <Heading2 className="h-3.5 w-3.5 mx-auto" />
      </button>
      <button className={`${btnBase} ${editor.isActive("heading", { level: 3 }) ? btnActive : ""}`} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
        <Heading3 className="h-3.5 w-3.5 mx-auto" />
      </button>

      <div className={separator} />

      <button className={`${btnBase} ${editor.isActive("bulletList") ? btnActive : ""}`} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        <List className="h-3.5 w-3.5 mx-auto" />
      </button>
      <button className={`${btnBase} ${editor.isActive("orderedList") ? btnActive : ""}`} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        <ListOrdered className="h-3.5 w-3.5 mx-auto" />
      </button>
      <button className={`${btnBase} ${editor.isActive("blockquote") ? btnActive : ""}`} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        <Quote className="h-3.5 w-3.5 mx-auto" />
      </button>
      <button className={`${btnBase} ${editor.isActive("code") ? btnActive : ""}`} onClick={() => editor.chain().focus().toggleCode().run()}>
        <Code className="h-3.5 w-3.5 mx-auto" />
      </button>

      <div className={separator} />

      <button
        className={`${btnBase} ${editor.isActive("link") ? btnActive : ""}`}
        onClick={() => {
          const url = window.prompt("Enter URL link:");
          if (url) editor.chain().focus().setLink({ href: url }).run();
        }}
      >
        <Link className="h-3.5 w-3.5 mx-auto" />
      </button>
      <button className={btnBase} onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>
        <Table className="h-3.5 w-3.5 mx-auto" />
      </button>

      <div className={`${separator} ml-auto`} />

      <button className={`${btnBase} ${!editor.can().undo() ? "opacity-30 cursor-not-allowed" : ""}`} disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}>
        <Undo className="h-3.5 w-3.5 mx-auto" />
      </button>
      <button className={`${btnBase} ${!editor.can().redo() ? "opacity-30 cursor-not-allowed" : ""}`} disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}>
        <Redo className="h-3.5 w-3.5 mx-auto" />
      </button>
    </div>
  );
}
