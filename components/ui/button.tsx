import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-signal-dark text-white shadow-xs hover:bg-signal/90",
        destructive:
          "bg-status-critical text-white shadow-xs hover:bg-status-critical/90",
        outline:
          "border border-border bg-canvas shadow-xs hover:bg-surface hover:text-ink",
        secondary:
          "bg-surface text-ink shadow-xs hover:bg-border/80",
        ghost: "hover:bg-surface hover:text-ink",
        link: "text-signal underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean }
>(({ className, variant, size, asChild = false, children, ...props }, ref) => {
  const buttonClass = cn(buttonVariants({ variant, size, className }));

  if (asChild && React.isValidElement(children)) {
    const childProps = (children.props as { className?: string }) || {};
    const childClassName = cn(buttonClass, childProps.className);
    const restProps = props;
    return React.cloneElement(children as React.ReactElement<{ className?: string }>, {
      className: childClassName,
      ...restProps,
    });
  }

  return (
    <button
      ref={ref}
      data-slot="button"
      className={buttonClass}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = "Button";

export { Button, buttonVariants };
