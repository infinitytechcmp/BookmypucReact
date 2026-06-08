import React from 'react';
import { cn } from '@/lib/utils';

interface GradientHeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

export function GradientHeading({ children, level = 2, className, ...props }: GradientHeadingProps) {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;

  if (typeof children !== 'string') {
    return <Tag className={cn(className)} {...props}>{children}</Tag>;
  }

  const text = children.trim();
  if (!text) {
    return <Tag className={cn(className)} {...props}>{children}</Tag>;
  }

  const words = text.split(' ');
  
  if (words.length <= 1) {
    return (
      <Tag className={cn(className)} {...props}>
        <span className="gradient-text">
          {text}
        </span>
      </Tag>
    );
  }

  const mid = Math.ceil(words.length / 2);
  const firstPart = words.slice(0, mid).join(' ');
  const secondPart = words.slice(mid).join(' ');

  return (
    <Tag className={cn(className)} {...props}>
      <span>{firstPart} </span>
      <span className="gradient-text">
        {secondPart}
      </span>
    </Tag>
  );
}
