import React, { useMemo, useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Enter description...',
  className = ''
}) => {
  // Ensure value is properly formatted HTML
  const [formattedValue, setFormattedValue] = useState(value);

  useEffect(() => {
    // ReactQuill automatically renders HTML content
    // But if HTML is escaped (like &lt;p&gt;), we need to unescape it first
    if (value && typeof value === 'string') {
      // Check if HTML is escaped (contains &lt; or &gt;)
      if (value.includes('&lt;') || value.includes('&gt;')) {
        // Unescape HTML entities
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = value;
        setFormattedValue(tempDiv.innerHTML);
      } else {
        // Already proper HTML, use as-is
        setFormattedValue(value);
      }
    } else {
      setFormattedValue('');
    }
  }, [value]);
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        ['bold', 'italic', 'underline'],
        [{ 'header': [1, 2, 3, false] }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'align': [] }],
        ['link', 'image'],
        ['clean']
      ]
    }
  }), []);

  const formats = [
    'bold', 'italic', 'underline',
    'header', 'size',
    'list', 'bullet',
    'align',
    'link', 'image'
  ];

  return (
    <div className={`editor-wrapper h-[300px] flex flex-col border border-gray-300 rounded-md overflow-hidden ${className}`}>
      <style>{`
        /* Toolbar - fixed at top */
        .editor-wrapper .ql-toolbar {
          flex-shrink: 0;
          position: sticky;
          top: 0;
          z-index: 20;
          background: white;
          border-bottom: 1px solid #e5e7eb;
          border-top: none;
          border-left: none;
          border-right: none;
          padding: 8px 12px;
        }
        
        .editor-wrapper .ql-toolbar .ql-stroke {
          stroke: #374151;
        }
        .editor-wrapper .ql-toolbar .ql-fill {
          fill: #374151;
        }
        .editor-wrapper .ql-toolbar button:hover,
        .editor-wrapper .ql-toolbar button.ql-active {
          color: #2563eb;
        }
        .editor-wrapper .ql-toolbar button:hover .ql-stroke,
        .editor-wrapper .ql-toolbar button.ql-active .ql-stroke {
          stroke: #2563eb;
        }
        .editor-wrapper .ql-toolbar button:hover .ql-fill,
        .editor-wrapper .ql-toolbar button.ql-active .ql-fill {
          fill: #2563eb;
        }
        
        /* Container - flex layout, no overflow */
        .editor-wrapper .ql-container {
          flex: 1 !important;
          overflow: hidden !important;
          display: flex !important;
          flex-direction: column !important;
          border: none;
          font-size: 14px;
          position: relative;
        }
        
        /* Editor content area - scrollable */
        .editor-wrapper .ql-editor {
          flex: 1 !important;
          overflow-y: auto !important;
          overflow-x: hidden !important;
          height: 100% !important;
          max-height: 100% !important;
          padding: 12px 16px;
          overscroll-behavior: contain;
          -webkit-overflow-scrolling: touch;
        }
        
        .editor-wrapper .ql-editor.ql-blank::before {
          color: #9ca3af;
          font-style: normal;
        }
        .editor-wrapper .ql-editor {
          white-space: normal;
        }
        .editor-wrapper .ql-editor p {
          margin: 0 0 1em 0;
          display: block;
        }
        .editor-wrapper .ql-editor p:last-child {
          margin-bottom: 0;
        }
        /* Ensure HTML tags are rendered, not shown as text */
        .editor-wrapper .ql-editor * {
          display: inherit;
        }
        /* Custom scrollbar styling */
        .editor-wrapper .ql-editor::-webkit-scrollbar {
          width: 8px;
        }
        .editor-wrapper .ql-editor::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        .editor-wrapper .ql-editor::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .editor-wrapper .ql-editor::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
      <ReactQuill
        theme="snow"
        value={formattedValue}
        onChange={(content) => {
          setFormattedValue(content);
          onChange(content);
        }}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        preserveWhitespace={false}
      />
    </div>
  );
};

export default RichTextEditor;

