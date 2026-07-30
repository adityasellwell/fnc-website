import { parsePageContent } from "@/lib/utils/pageContent";

/** Renders a Page row's `content` field using the shared block convention. */
export default function PolicyContent({ content }) {
  const blocks = parsePageContent(content);

  return (
    <>
      {blocks.map((block, i) => {
        if (block.type === "heading") {
          return (
            <h2 key={i} className="font-display text-xl font-bold text-charcoal">
              {block.text}
            </h2>
          );
        }
        if (block.type === "list") {
          return (
            <ul key={i} className="list-disc pl-5 flex flex-col gap-1">
              {block.items.map((item, j) => (
                <li key={j}>{item}</li>
              ))}
            </ul>
          );
        }
        return <p key={i}>{block.text}</p>;
      })}
    </>
  );
}
