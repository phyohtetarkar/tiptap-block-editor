import { useTheme } from "next-themes";
import { Button } from "./ui/button";
import { MoonIcon, PencilLineIcon, SunIcon } from "lucide-react";
import { Editor } from "@tiptap/core";
import PreviewButton from "./preview-button";
import GitHubButton from "react-github-btn";

export default function Header({ editor }: { editor?: Editor }) {
  const { theme, setTheme } = useTheme();

  return (
    <nav className="border-b h-16 fixed top-0 inset-x-0 bg-background z-10">
      <div className="container flex items-center space-x-3 h-full">
        <PencilLineIcon className="size-8" />
        <div className="font-semibold text-2xl">Block Editor</div>
        <div className="grow"></div>

        <div className="h-[28px]">
          <GitHubButton
            href="https://github.com/phyohtetarkar/tiptap-block-editor"
            data-size="large"
            data-show-count="true"
            aria-label="Star buttons/github-buttons on GitHub"
          >
            Star
          </GitHubButton>
        </div>
        <PreviewButton editor={editor} />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setTheme(theme === "dark" ? "light" : "dark");
          }}
        >
          {theme === "dark" ? <MoonIcon /> : <SunIcon />}
        </Button>
      </div>
    </nav>
  );
}
