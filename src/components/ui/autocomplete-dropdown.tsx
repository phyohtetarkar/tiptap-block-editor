import { ReactNode, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./button";
import { ChevronDownIcon, Trash2Icon } from "lucide-react";
import { Input } from "./input";

interface BaseAutocompleteDropdownProps<T> {
  items: T[];
  value?: T;
  placeholder?: string;
  renderItem: (value: T) => ReactNode;
  getKey: (value: T) => string;
  showCreateSuggestion?: boolean;
  onSelect?: (item: T) => void;
  onDelete?: (item: T) => void;
}

interface WithCreateSuggestionProps<T>
  extends BaseAutocompleteDropdownProps<T> {
  showCreateSuggestion: true;
  onCreate: (value: string) => void;
}

interface WithoutCreateSuggestionProps<T>
  extends BaseAutocompleteDropdownProps<T> {
  showCreateSuggestion?: false;
  onCreate?: (value: string) => void;
}

type AutocompleteDropdownProps<T> =
  | WithCreateSuggestionProps<T>
  | WithoutCreateSuggestionProps<T>;

function AutocompleteDropdown<T>({
  items,
  value,
  placeholder,
  renderItem,
  showCreateSuggestion,
  onCreate,
  onDelete,
  getKey,
  onSelect,
}: AutocompleteDropdownProps<T>) {
  const [search, setSearch] = useState<string>();

  const contents = () => {
    const list = items.filter((v) => {
      if (!search) {
        return true;
      }

      return search === getKey(v);
    });

    if (showCreateSuggestion && list.length === 0 && search) {
      return (
        <DropdownMenuItem
          disabled={!search}
          onClick={() => {
            onCreate?.(search);
            setSearch(undefined);
          }}
        >
          <div>
            <span className="font-semibold">Create:&nbsp;</span>
            {search}
          </div>
        </DropdownMenuItem>
      );
    } else if (list.length === 0) {
      <DropdownMenuItem className="text-muted-foreground hover:text-muted-foreground focus:text-muted-foreground">
        No data
      </DropdownMenuItem>;
    }

    return list.map((item, i) => {
      return (
        <DropdownMenuItem
          key={i}
          onClick={() => {
            onSelect?.(item);
          }}
          className="relative pe-6"
        >
          {renderItem(item)}
          <div
            className="absolute text-destructive end-1"
            onClick={(evt) => {
              evt.stopPropagation();
              onDelete?.(item);
            }}
          >
            <Trash2Icon className="size-4" />
          </div>
        </DropdownMenuItem>
      );
    });
  };
  return (
    <DropdownMenu
      onOpenChange={(op) => {
        if (op) {
          setSearch(undefined);
        }
      }}
    >
      <DropdownMenuTrigger
        className={cn(
          buttonVariants({ variant: "outline" }),
          "shadow-none w-full"
        )}
      >
        <span
          className={cn("text-sm text-nowrap grow text-start", {
            "text-muted-foreground": !value,
          })}
        >
          {value ? `${value}` : placeholder}
        </span>
        <ChevronDownIcon className="size-4 opacity-50 ms-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-fit"
        // style={{
        //   width: "var(--radix-dropdown-menu-trigger-width)",
        // }}
      >
        <DropdownMenuLabel className="font-normal p-1">
          <Input
            value={search ?? ""}
            onChange={(evt) => {
              setSearch(evt.target.value);
            }}
          />
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>{contents()}</DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { AutocompleteDropdown };
