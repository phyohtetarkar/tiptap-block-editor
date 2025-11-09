import { Extension } from "@tiptap/core";
import { requestCompletion } from "../utilities/request-completion";

interface AiTextOptons {
  prompt: string;
  command: string;
  insert: false | { from: number; to: number };
}

export interface AiStorage {
  status?: "loading" | "success" | "error";
  message?: string;
  error?: Error;
}

export interface AiOptions {
  onLoading?: () => void;
  onError?: (error: Error) => void;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    aiCommands: {
      aiTextPrompt: (options: AiTextOptons) => ReturnType;
      aiCompletion: ({ command }: { command: string }) => ReturnType;
      aiReset: () => ReturnType;
      setAiWriter: () => ReturnType;
    };
  }
  interface Storage {
    ai: AiStorage;
  }
}

export const Ai = Extension.create<AiOptions, AiStorage>({
  name: "ai",

  addStorage() {
    return {};
  },

  addCommands() {
    return {
      aiTextPrompt:
        ({ prompt, command, insert }) =>
        ({ editor }) => {
          const question = () => {
            if (command === "prompt") {
              return `Please generate for this prompt: "${prompt}". Use markdown formatting when appropriate.`;
            }

            return `Please ${command} this text: "${prompt}". Use markdown formatting when appropriate.`;
          };

          const { onLoading, onError } = this.options;

          // let update = false;

          requestCompletion({
            prompt: question(),
            onLoading: () => {
              editor.storage.ai = {
                status: "loading",
                message: insert ? prompt : undefined,
                error: undefined,
              };
              onLoading?.();
            },
            onChunk: (chunk) => {
              editor.commands.command(() => {
                const storage = editor.storage.ai;
                storage.message = chunk;
                return true;
              });
            },
            onSuccess: (completion) => {
              const cm = editor.chain().command(() => {
                const storage = editor.storage.ai;
                storage.status = "success";
                return true;
              });

              if (insert) {
                const range = editor.$pos(insert.from).range;
                cm.deleteRange(range).insertContentAt(insert.from, completion, {
                  contentType: "markdown",
                });
              }

              cm.run();
            },
            onError: (error) => {
              onError?.(error);
              const cm = editor.chain().command(() => {
                const storage = editor.storage.ai;
                storage.status = "error";
                storage.error = error;
                return true;
              });

              if (insert) {
                const range = editor.$pos(insert.from).range;
                cm.focus()
                  .deleteRange(range)
                  .insertContentAt(range.from, prompt)
                  .aiReset();
              }

              cm.run();
            },
            onComplete: () => {},
          });

          return true;
        },

      aiCompletion:
        ({ command }) =>
        ({ chain, state }) => {
          const { from, to, empty } = state.selection;

          if (empty || !command) {
            return false;
          }

          const prompt = state.doc.textBetween(from, to);

          if (!prompt) {
            return false;
          }

          return chain()
            .aiReset()
            .setAiPlaceholder({ from, to })
            .aiTextPrompt({
              prompt: prompt,
              command: command,
              insert: { from, to },
            })
            .run();
        },

      aiReset:
        () =>
        ({ commands }) => {
          return commands.command(({ editor }) => {
            editor.storage.ai = {};
            return true;
          });
        },
    };
  },
});
