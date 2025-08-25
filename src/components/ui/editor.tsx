import {
  MDXEditor,
  UndoRedo,
  BoldItalicUnderlineToggles,
  toolbarPlugin,
  CodeToggle,
  InsertCodeBlock,
  codeBlockPlugin,
  headingsPlugin,
  listsPlugin,
  linkPlugin,
  quotePlugin,
  markdownShortcutPlugin,
  ListsToggle,
  linkDialogPlugin,
  CreateLink,
  InsertImage,
  InsertTable,
  tablePlugin,
  imagePlugin,
  codeMirrorPlugin,
  ConditionalContents,
  ChangeCodeMirrorLanguage,
  Separator,
  InsertThematicBreak,
  diffSourcePlugin,
  type MDXEditorMethods,
} from "@mdxeditor/editor";
import { type Ref } from "react";
import "@mdxeditor/editor/style.css";

interface Props {
  value: string;
  editorRef?: Ref<MDXEditorMethods> | undefined;
  fieldChange: (value: string) => void;
}
export const Editor = ({ value, editorRef, fieldChange }: Props) => {
  return (
    <MDXEditor
      markdown={value}
      ref={editorRef}
      onChange={fieldChange}
      className="prose max-w-none dark-theme dark-editor prose-invert flex-grow"
      contentEditableClassName="prose prose-invert"
      plugins={[
        headingsPlugin(),
        listsPlugin(),
        linkPlugin(),
        linkDialogPlugin(),
        quotePlugin(),
        markdownShortcutPlugin(),
        tablePlugin(),
        imagePlugin(),
        codeBlockPlugin({ defaultCodeBlockLanguage: "" }),
        codeMirrorPlugin({
          codeBlockLanguages: {
            css: "css",
            txt: "txt",
            sql: "sql",
            html: "html",
            sass: "sass",
            scss: "scss",
            bash: "bash",
            json: "json",
            js: "javascript",
            ts: "typescript",
            "": "unspecified",
            tsx: "TypeScript (React)",
            jsx: "JavaScript (React)",
          },
          autoLoadLanguageSupport: true,
        }),
        diffSourcePlugin({ viewMode: "rich-text", diffMarkdown: "" }),
        toolbarPlugin({
          toolbarContents: () => (
            <ConditionalContents
              options={[
                {
                  when: (editor) => editor?.editorType === "codeblock",
                  contents: () => <ChangeCodeMirrorLanguage />,
                },
                {
                  fallback: () => (
                    <>
                      <UndoRedo />
                      <Separator />
                      <BoldItalicUnderlineToggles />
                      <CodeToggle />
                      <Separator />
                      <ListsToggle />
                      <Separator />
                      <CreateLink />
                      <InsertImage />
                      <Separator />
                      <InsertTable />
                      <InsertThematicBreak />
                      <Separator />
                      <InsertCodeBlock />
                    </>
                  ),
                },
              ]}
            />
          ),
        }),
      ]}
    />
  );
};
