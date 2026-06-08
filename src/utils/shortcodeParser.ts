export interface ShortcodeNode {
  type: 'text' | 'shortcode';
  content?: string;
  name?: string;
  props?: Record<string, string>;
  children?: ShortcodeNode[];
}

export function parseShortcodes(html: string): ShortcodeNode[] {
  const nodes: ShortcodeNode[] = [];
  
  // A basic regex to match [shortcode attr="val"]...[/shortcode] or [shortcode attr="val"]
  // This is a simplified regex, it may not cover deeply nested same-name shortcodes well,
  // but it's sufficient for the typical CMS output.
  const shortcodeRegex = /\[([a-zA-Z0-9_-]+)([^\]]*)\](.*?)\[\/\1\]|\[([a-zA-Z0-9_-]+)([^\]]*)\]/gs;

  let lastIndex = 0;
  let match;

  while ((match = shortcodeRegex.exec(html)) !== null) {
    // Add preceding text
    if (match.index > lastIndex) {
      nodes.push({
        type: 'text',
        content: html.substring(lastIndex, match.index),
      });
    }

    const isSelfClosing = !match[1];
    const name = match[1] || match[4];
    const attrsString = match[2] || match[5];
    const innerContent = match[3];

    const props: Record<string, string> = {};
    const attrRegex = /([a-zA-Z0-9_-]+)=(?:"([^"]*)"|'([^']*)')/g;
    let attrMatch;
    while ((attrMatch = attrRegex.exec(attrsString)) !== null) {
      // Decode HTML entities in attributes if needed
      let val = attrMatch[2] !== undefined ? attrMatch[2] : attrMatch[3];
      val = val
        .replace(/&quot;/g, '"')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&#039;/g, "'");
      props[attrMatch[1]] = val;
    }

    nodes.push({
      type: 'shortcode',
      name,
      props,
      content: innerContent,
      children: innerContent ? parseShortcodes(innerContent) : undefined,
    });

    lastIndex = shortcodeRegex.lastIndex;
  }

  // Add remaining text
  if (lastIndex < html.length) {
    nodes.push({
      type: 'text',
      content: html.substring(lastIndex),
    });
  }

  return nodes;
}
