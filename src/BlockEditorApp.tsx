import { Editor } from "@tiptap/core";
import { ThemeProvider } from "next-themes";
import { useState } from "react";
import { BlockEditor } from "./components/editor";
import Header from "./components/header";
import defaultContent from "./assets/default-content.json";
import { Toaster } from "./components/ui/sonner";

function App() {
  const [editor, setEditor] = useState<Editor>();

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      disableTransitionOnChange
    >
      <Header editor={editor} />
      <div className="container max-w-4xl mt-16 pt-7 pb-32">
        <BlockEditor
          content={defaultContent}
          onCreate={setEditor}
          onUpdate={setEditor}
        />
      </div>
      <Toaster position="top-right" duration={2000} richColors />
    </ThemeProvider>
  );
}

export default App;
