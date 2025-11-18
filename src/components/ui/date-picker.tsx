import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { Calendar, CalendarProps } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { buttonVariants } from "./button";

interface DatePickerProps {
  placeholder?: string;
  value?: string;
  className?: string;
  calendarProps?: (close: () => void) => CalendarProps;
  disabled?: boolean;
}

const DatePicker = ({
  placeholder,
  value,
  className,
  calendarProps,
  disabled,
}: DatePickerProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover modal open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          buttonVariants({ variant: "outline" }),
          "shadow-none w-full",
          className
        )}
        disabled={disabled}
      >
        <span
          className={cn("text-sm text-nowrap grow text-start", {
            "text-muted-foreground": !value,
          })}
        >
          {value ? value : placeholder ?? "Pick a date..."}
        </span>
        <CalendarIcon className="size-4 opacity-50 ms-4" />
      </PopoverTrigger>
      <PopoverContent className="w-fit p-0" align="start">
        <Calendar {...calendarProps?.(() => setOpen(false))} />
      </PopoverContent>
    </Popover>
  );
};

export { DatePicker };
