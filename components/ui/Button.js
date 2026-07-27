import Link from "next/link";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonStyles = cva(
  "inline-flex items-center justify-center gap-2 font-body font-medium transition-colors duration-200 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fnc-red focus-visible:ring-offset-2 focus-visible:ring-offset-offwhite disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary: "bg-fnc-red text-white hover:bg-fnc-red/90",
        secondary: "bg-charcoal text-white hover:bg-charcoal/90",
        outline:
          "bg-transparent text-charcoal border border-bordergray hover:border-charcoal",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-6 text-base",
        lg: "h-14 px-8 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export default function Button({
  variant,
  size,
  href,
  className,
  children,
  ...props
}) {
  const classes = cn(buttonStyles({ variant, size }), className);

  if (href) {
    return (
      <Link href={href} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
