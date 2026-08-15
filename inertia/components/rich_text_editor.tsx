import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import DOMPurify from 'dompurify'
import {
  Bold,
  Eye,
  Italic,
  Link2,
  List,
  ListOrdered,
  Pilcrow,
  Quote,
  Redo2,
  UnderlineIcon,
  Undo2,
} from 'lucide-react'
import { useEffect, useMemo, useState, type ComponentType } from 'react'

export function RichTextEditor({
  value,
  onChange,
  label = 'Note',
}: {
  value: string
  onChange: (html: string) => void
  label?: string
}) {
  const [preview, setPreview] = useState(false)
  const safe = useMemo(
    () => (typeof DOMPurify.sanitize === 'function' ? DOMPurify.sanitize(value) : ''),
    [value]
  )
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] }, link: { openOnClick: false } }),
      Placeholder.configure({ placeholder: 'Écrivez une note pour la famille…' }),
    ],
    content: value || '<p></p>',
    editorProps: { attributes: { 'class': 'rich-content', 'aria-label': label } },
    onUpdate: ({ editor: current }) => onChange(current.getHTML()),
  })
  useEffect(() => {
    if (editor && editor.getHTML() !== value)
      editor.commands.setContent(value || '<p></p>', { emitUpdate: false })
  }, [editor, value])
  const setLink = () => {
    const href = window.prompt('Adresse du lien', editor?.getAttributes('link').href || 'https://')
    if (href === null || !editor) return
    href.trim()
      ? editor.chain().focus().extendMarkRange('link').setLink({ href: href.trim() }).run()
      : editor.chain().focus().unsetLink().run()
  }
  return (
    <div className="rich-editor">
      <div className="rich-toolbar" role="toolbar" aria-label="Mise en forme du texte">
        <Tool icon={Undo2} label="Annuler" onClick={() => editor?.chain().focus().undo().run()} />
        <Tool icon={Redo2} label="Rétablir" onClick={() => editor?.chain().focus().redo().run()} />
        <Tool
          icon={Pilcrow}
          label="Paragraphe"
          onClick={() => editor?.chain().focus().setParagraph().run()}
          active={editor?.isActive('paragraph')}
        />
        <Tool
          icon={Bold}
          label="Gras"
          onClick={() => editor?.chain().focus().toggleBold().run()}
          active={editor?.isActive('bold')}
        />
        <Tool
          icon={Italic}
          label="Italique"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          active={editor?.isActive('italic')}
        />
        <Tool
          icon={UnderlineIcon}
          label="Souligné"
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
          active={editor?.isActive('underline')}
        />
        <Tool
          icon={List}
          label="Liste"
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          active={editor?.isActive('bulletList')}
        />
        <Tool
          icon={ListOrdered}
          label="Liste numérotée"
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          active={editor?.isActive('orderedList')}
        />
        <Tool
          icon={Quote}
          label="Citation"
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
          active={editor?.isActive('blockquote')}
        />
        <Tool icon={Link2} label="Lien" onClick={setLink} active={editor?.isActive('link')} />
        <span className="toolbar-spacer" />
        <Tool
          icon={Eye}
          label={preview ? 'Modifier' : 'Aperçu'}
          onClick={() => setPreview(!preview)}
          active={preview}
        />
      </div>
      {preview ? (
        <div className="rich-content rich-preview" dangerouslySetInnerHTML={{ __html: safe }} />
      ) : (
        <EditorContent editor={editor} />
      )}
    </div>
  )
}

function Tool({
  icon: Icon,
  label,
  onClick,
  active,
}: {
  icon: ComponentType<{ size?: number }>
  label: string
  onClick: () => void
  active?: boolean
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={active ? 'active' : ''}
      onClick={onClick}
    >
      <Icon size={17} />
    </button>
  )
}
