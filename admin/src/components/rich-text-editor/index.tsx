import React, { useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import type { Editor as TinyMCEEditor } from 'tinymce';

interface RichTextEditorProps {
  value?: string;
  onChange?: (content: string) => void;
  height?: number;
  disabled?: boolean;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  height = 500,
  disabled = false,
}) => {
  const editorRef = useRef<TinyMCEEditor | null>(null);

  return (
    <Editor
      apiKey="3doxr92k37xwpasv9cnu0uhevf3lf3ey9d8xpi9pw119lmjh"
      onInit={(_evt, editor) => (editorRef.current = editor)}
      value={value}
      disabled={disabled}
      onEditorChange={(content) => {
        onChange?.(content);
      }}
      init={{
        height: height,
        menubar: true,
        language: 'zh_CN',
        language_url: '/tinymce/langs/zh_CN.js',
        plugins: [
          'advlist',
          'autolink',
          'lists',
          'link',
          'image',
          'charmap',
          'preview',
          'anchor',
          'searchreplace',
          'visualblocks',
          'code',
          'fullscreen',
          'insertdatetime',
          'media',
          'table',
          'code',
          'help',
          'wordcount',
        ],
        toolbar:
          'undo redo | blocks | ' +
          'bold italic forecolor backcolor | alignleft aligncenter ' +
          'alignright alignjustify | bullist numlist outdent indent | ' +
          'table tabledelete | tableprops tablerowprops tablecellprops | ' +
          'tableinsertrowbefore tableinsertrowafter tabledeleterow | ' +
          'tableinsertcolbefore tableinsertcolafter tabledeletecol | ' +
          'removeformat | help',
        content_style:
          'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
        table_toolbar:
          'tableprops tabledelete | tableinsertrowbefore tableinsertrowafter tabledeleterow | tableinsertcolbefore tableinsertcolafter tabledeletecol',
        table_appearance_options: true,
        table_grid: true,
        table_resize_bars: true,
        table_default_attributes: {
          border: '1',
        },
        table_default_styles: {
          'border-collapse': 'collapse',
          width: '100%',
        },
      }}
    />
  );
};

