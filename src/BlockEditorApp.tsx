import { Editor } from "@tiptap/core";
import { ThemeProvider } from "next-themes";
import { useState } from "react";
import { BlockEditor } from "./components/editor";
import Header from "./components/header";
import { Toaster } from "./components/ui/toaster";
import defaultContent from "./assets/default-content.json";

function App() {
  const [editor, setEditor] = useState<Editor>();

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      disableTransitionOnChange
    >
      <Toaster />
      <Header editor={editor} />
      <div className="container max-w-4xl mt-16 pt-7 pb-32">
        <BlockEditor
          content={defaultContent}
          onCreate={setEditor}
          onUpdate={setEditor}
        />
      </div>
    </ThemeProvider>
  );
}

export default App;
