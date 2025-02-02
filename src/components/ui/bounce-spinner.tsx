import { cn } from "@/lib/utils";

const BounceSpinner = ({ className }: { className?: string }) => {
  return (
    <div className={cn("flex items-center justify-center gap-0.5", className)}>
      <div className="size-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
      <div className="size-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
      <div className="size-1.5 animate-bounce rounded-full bg-primary" />
    </div>
  );
};

export { BounceSpinner };
