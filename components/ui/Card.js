import { cn } from "@/lib/utils";

export default function Card({ as: Tag = "div", hoverLift = false, className, children, ...props }) {
  return (
    <Tag
      className={cn(
        "bg-white border border-bordergray rounded-2xl overflow-hidden",
        hoverLift &&
          "transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg",
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}
