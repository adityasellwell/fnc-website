import { cn } from "@/lib/utils";
import Container from "./Container";

const backgrounds = {
  offwhite: "bg-offwhite",
  warmwhite: "bg-warmwhite",
  white: "bg-white",
  transparent: "bg-transparent",
};

const spacings = {
  sm: "py-section-sm",
  md: "py-section-md",
  lg: "py-section-lg",
};

export default function Section({
  as: Tag = "section",
  background = "offwhite",
  spacing = "md",
  container = true,
  className,
  children,
  ...props
}) {
  return (
    <Tag
      className={cn(backgrounds[background], spacings[spacing], className)}
      {...props}
    >
      {container ? <Container>{children}</Container> : children}
    </Tag>
  );
}
