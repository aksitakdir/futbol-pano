"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { useCallback, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

const TB = "rounded border border-slate-600/80 bg-slate-800/80 p-1.5 text-slate-300 transition hover:bg-slate-700/80 hover:text-slate-100";
const TB_ACTIVE = "rounded border border-emerald-500/50 bg-emerald-500/15 p-1.5 text-emerald-300";

function Toolbar({ editor }: { editor: Editor | null }) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const setLink = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("Link URL:");
    if (url == null) return;
    if (url === "") { editor.chain().focus().unsetLink().run(); return; }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    try {
      const ext = file.name.split(".").pop();
      const fileName = `content-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { data, error } = await supabase.storage.from("content-images").upload(fileName, file, { upsert: true });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from("content-images").getPublicUrl(data.path);
      editor.chain().focus().setImage({ src: urlData.publicUrl }).run();
    } catch (err) {
      console.error("Görsel yükleme hatası:", err);
    }
    // Input'u sıfırla — aynı dosyayı tekrar seçebilmek için
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  if (!editor) return null;

  return (
    <div className="flex flex-wrap items-center gap-0.5 rounded-t-xl border border-b-0 border-slate-700/80 bg-slate-900/90 p-1.5">
      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive("bold") ? TB_ACTIVE : TB} title="Kalın">
        <span className="text-sm font-bold">B</span>
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive("italic") ? TB_ACTIVE : TB} title="İtalik">
        <span className="text-sm italic">I</span>
      </button>
      <span className="mx-0.5 h-4 w-px bg-slate-600" />
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={editor.isActive("heading", { level: 2 }) ? TB_ACTIVE : TB} title="Başlık 2">H2</button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={editor.isActive("heading", { level: 3 }) ? TB_ACTIVE : TB} title="Başlık 3">H3</button>
      <span className="mx-0.5 h-4 w-px bg-slate-600" />
      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive("bulletList") ? TB_ACTIVE : TB} title="Madde listesi">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editor.isActive("orderedList") ? TB_ACTIVE : TB} title="Numaralı liste">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4M4 10h2M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>
      </button>
      <button type="button" onClick={setLink}
        className={editor.isActive("link") ? TB_ACTIVE : TB} title="Link ekle">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={editor.isActive("blockquote") ? TB_ACTIVE : TB} title="Alıntı">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"/></svg>
      </button>
      <span className="mx-0.5 h-4 w-px bg-slate-600" />
      {/* Görsel yükleme butonu */}
      <label className={`${TB} cursor-pointer`} title="Görsel ekle">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
      </label>
      {/* URL ile görsel ekleme */}
      <button type="button" title="URL ile görsel ekle"
        className={TB}
        onClick={() => {
          const url = window.prompt("Görsel URL:");
          if (url) editor.chain().focus().setImage({ src: url }).run();
        }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
      </button>
    </div>
  );
}

type Props = {
  value: string;
  onChange?: (html: string) => void;
  placeholder?: string;
};

export default function RichTextEditor({ value, onChange, placeholder = "İçerik yazın..." }: Props) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { target: "_blank", rel: "noopener noreferrer" },
      }),
      Image.configure({
        HTMLAttributes: { class: "max-w-full rounded-lg my-4" },
      }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class: "min-h-[280px] w-full resize-y rounded-b-xl border border-slate-700/80 bg-slate-900/70 px-4 py-3 text-sm leading-relaxed text-slate-100 outline-none focus:border-emerald-500/40 [&_h2]:mb-3 [&_h2]:mt-5 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-slate-50 [&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-slate-100 [&_p]:mb-4 [&_p]:text-slate-200 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:text-slate-200 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:text-slate-200 [&_li]:mb-1 [&_blockquote]:my-4 [&_blockquote]:border-l-2 [&_blockquote]:border-emerald-500/60 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-slate-300 [&_a]:text-emerald-300 [&_a]:underline [&_a]:decoration-emerald-500/30 hover:[&_a]:text-emerald-200 [&_img]:max-w-full [&_img]:rounded-lg [&_img]:my-4",
      },
      handleDOMEvents: {
        paste: (view, event) => {
          const html = event.clipboardData?.getData("text/html");
          if (html) {
            event.preventDefault();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, "text/html");
            const text = doc.body.innerText || "";
            view.dispatch(view.state.tr.insertText(text));
            return true;
          }
          return false;
        },
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    const handler = () => onChange?.(editor.getHTML());
    editor.on("update", handler);
    return () => { editor.off("update", handler); };
  }, [editor, onChange]);

  useEffect(() => {
    if (!editor) return;
    const fromStore = value?.trim() || "";
    const current = editor.getHTML();
    const empty = !current || current === "<p></p>" || current.trim() === "<p></p>";
    if (fromStore && empty) {
      editor.commands.setContent(fromStore, { emitUpdate: false });
    }
  }, [value, editor]);

  return (
    <div className="relative w-full">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
