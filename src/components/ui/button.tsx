import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:border-black focus-visible:ring-black/30 focus-visible:ring-2",
  {
    variants: {
      variant: {
        default: "bg-lime-300 text-black hover:bg-lime-400",
        destructive:
          "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-300",
        outline:
          "bg-white text-black border-2 border-black hover:bg-black hover:text-white",
        secondary: "bg-gray-100 text-gray-800 hover:bg-gray-200",
        ghost: "bg-transparent text-black hover:bg-gray-100",
        link: "text-lime-600 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-6",
        sm: "h-8 px-4 text-sm",
        lg: "h-12 px-8 text-base",
        icon: "h-9 w-9 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
