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
    <div className={`rich-text-editor ${className}`}>
      <style>{`
        .rich-text-editor .ql-container {
          border-bottom-left-radius: 0.5rem;
          border-bottom-right-radius: 0.5rem;
          border: 1px solid #d1d5db;
          border-top: none;
          font-size: 14px;
          min-height: 150px;
        }
        .rich-text-editor .ql-toolbar {
          border: 1px solid #d1d5db;
          border-top-left-radius: 0.5rem;
          border-top-right-radius: 0.5rem;
          background-color: #f9fafb;
          padding: 8px;
        }
        .rich-text-editor .ql-toolbar .ql-stroke {
          stroke: #374151;
        }
        .rich-text-editor .ql-toolbar .ql-fill {
          fill: #374151;
        }
        .rich-text-editor .ql-toolbar button:hover,
        .rich-text-editor .ql-toolbar button.ql-active {
          color: #2563eb;
        }
        .rich-text-editor .ql-toolbar button:hover .ql-stroke,
        .rich-text-editor .ql-toolbar button.ql-active .ql-stroke {
          stroke: #2563eb;
        }
        .rich-text-editor .ql-toolbar button:hover .ql-fill,
        .rich-text-editor .ql-toolbar button.ql-active .ql-fill {
          fill: #2563eb;
        }
        .rich-text-editor .ql-editor {
          min-height: 150px;
        }
        .rich-text-editor .ql-editor.ql-blank::before {
          color: #9ca3af;
          font-style: normal;
        }
        .rich-text-editor .ql-editor {
          white-space: normal;
        }
        .rich-text-editor .ql-editor p {
          margin: 0 0 1em 0;
          display: block;
        }
        .rich-text-editor .ql-editor p:last-child {
          margin-bottom: 0;
        }
        /* Ensure HTML tags are rendered, not shown as text */
        .rich-text-editor .ql-editor * {
          display: inherit;
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

