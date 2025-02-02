import {
  SlashCommandNodeAttrs,
  SuggestionItem,
} from "./slash-command";
import { cn } from "@/lib/utils";
import { SuggestionKeyDownProps, SuggestionProps } from "@tiptap/suggestion";
import { LucideIcon } from "lucide-react";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";

export interface CommandSuggestionItem extends SuggestionItem {
  icon: LucideIcon;
}

export type SuggestionListProps = SuggestionProps<
  CommandSuggestionItem,
  SlashCommandNodeAttrs
>;

export interface SuggestionListHandle {
  onKeyDown: (props: SuggestionKeyDownProps) => boolean;
}

const SuggestionList = forwardRef<SuggestionListHandle, SuggestionListProps>(
  (props, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const selectItem = (index: number) => {
      const item = props.items[index];

      if (item) {
        props.command(item);
      }
    };

    const upHandler = () => {
      setSelectedIndex(
        (selectedIndex + props.items.length - 1) % props.items.length
      );
    };

    const downHandler = () => {
      setSelectedIndex((selectedIndex + 1) % props.items.length);
    };

    const enterHandler = () => {
      selectItem(selectedIndex);
    };

    useEffect(() => setSelectedIndex(0), [props.items]);

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }) => {
        if (event.key === "ArrowUp") {
          upHandler();
          return true;
        }

        if (event.key === "ArrowDown") {
          downHandler();
          return true;
        }

        if (event.key === "Enter") {
          enterHandler();
          return true;
        }

        return false;
      },
    }));
    return (
      <div className="z-20 flex flex-col space-y-1 bg-popover rounded-md border shadow-md transition-all p-1 max-h-[320px] w-72 overflow-y-auto">
        {props.items.length > 0 ? (
          props.items.map((item, i) => {
            return (
              <div
                key={i}
                className={cn(
                  [
                    "flex space-x-2 hover:bg-accent p-1 rounded-md cursor-pointer text-foreground",
                  ],
                  {
                    "bg-accent": i === selectedIndex,
                  }
                )}
                onClick={() => {
                  props.command(item);
                }}
              >
                <div className="size-10 flex items-center justify-center border bg-popover rounded-md">
                  <item.icon className="size-4" />
                </div>
                <div className="flex flex-col">
                  <p className="font-medium text-sm">{item.title}</p>
                  <span className="text-xs text-muted-foreground">
                    {item.description}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="px-3 py-2 text-sm text-muted-foreground">
            No results
          </div>
        )}
      </div>
    );
  }
);

export default SuggestionList;
