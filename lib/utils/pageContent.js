/**
 * Parses the simple line-based convention used by the admin-editable Page
 * model (see prisma/schema.prisma comment on the Page model for why this
 * isn't a full rich-text/HTML format): "## " starts a heading, "- " starts
 * a bullet list item (consecutive ones group into one list), blank lines
 * separate blocks, everything else is a paragraph.
 */
export function parsePageContent(content) {
  if (!content) return [];

  const lines = content.split("\n");
  const blocks = [];
  let currentList = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      currentList = null;
      continue;
    }

    if (line.startsWith("## ")) {
      currentList = null;
      blocks.push({ type: "heading", text: line.slice(3) });
    } else if (line.startsWith("- ")) {
      if (!currentList) {
        currentList = { type: "list", items: [] };
        blocks.push(currentList);
      }
      currentList.items.push(line.slice(2));
    } else {
      currentList = null;
      blocks.push({ type: "paragraph", text: line });
    }
  }

  return blocks;
}
