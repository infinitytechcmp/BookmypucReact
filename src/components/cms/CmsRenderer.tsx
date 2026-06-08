import React from 'react';
import { parseShortcodes, ShortcodeNode } from '@/utils/shortcodeParser';

interface CmsRendererProps {
  content: string;
}

// Dynamically import all CMS components
const modules = import.meta.glob('./Cms*.tsx', { eager: true });

const componentMap: Record<string, React.ComponentType<any>> = {};

for (const path in modules) {
  // Skip CmsRenderer itself to prevent recursion/mapping issues
  if (path.includes('CmsRenderer')) continue;

  const match = path.match(/\.\/Cms(.*)\.tsx$/);
  if (match) {
    const componentName = match[1];
    // Convert CamelCase to kebab-case
    const shortcodeName = componentName
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      .toLowerCase();
    
    const module = modules[path] as any;
    // The exported component is usually named `Cms${componentName}` or default.
    const Component = module[`Cms${componentName}`] || module.default;
    if (Component) {
      componentMap[shortcodeName] = Component;
    }
  }
}

export function renderNode(node: ShortcodeNode, index: number): React.ReactNode {
  if (node.type === 'text') {
    if (!node.content) return null;
    
    // Check if the content is just empty tags or whitespace
    const stripped = node.content.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/gi, '').trim();
    const hasVisualTags = /<(img|iframe|video|audio|svg|canvas|object|embed)/i.test(node.content);
    
    if (!stripped && !hasVisualTags) return null;

    return (
      <div 
        key={index} 
        className="container mx-auto px-4 py-8 max-w-5xl prose prose-slate dark:prose-invert prose-headings:font-bold prose-a:text-primary"
        dangerouslySetInnerHTML={{ __html: node.content }} 
      />
    );
  }

  if (node.type === 'shortcode' && node.name) {
    const Component = componentMap[node.name];
    if (Component) {
      // The simple-slider should be full width, everything else gets constrained
      if (node.name === 'simple-slider') {
        return <Component key={index} {...node.props} />;
      }

      return (
        <div key={index} className="container mx-auto px-4 max-w-5xl">
          <Component {...node.props} />
        </div>
      );
    }
    // If component is not mapped, we can either ignore or just show a fallback
    console.warn(`Unknown shortcode: [${node.name}]`);
    return null;
  }

  return null;
}

export function CmsRenderer({ content }: CmsRendererProps) {
  const nodes = parseShortcodes(content || '');

  return (
    <div className="cms-content">
      {nodes.map((node, index) => renderNode(node, index))}
    </div>
  );
}
