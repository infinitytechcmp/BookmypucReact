import { PublicLayout } from '@/components/layouts/PublicLayout';
import { CmsBlogPosts } from '@/components/cms/CmsBlogPosts';
import { GradientHeading } from '@/components/ui/gradient-heading';

export default function Blogs() {
  return (
    <PublicLayout>
      <div className="pt-20">
        <div className="container mx-auto px-4 text-center mb-8">
          <GradientHeading level={1} className="text-4xl font-bold md:text-5xl drop-shadow-sm">
            Our <span className="gradient-text">Blogs</span>
          </GradientHeading>
          <p className="mt-4 text-lg text-muted-foreground">
            Stay up to date with the latest news, tips, and insights.
          </p>
        </div>
        
        {/* Render the blog posts component in archive mode (limit="all") and hide its default header */}
        <CmsBlogPosts limit="all" hide_header="true" />
      </div>
    </PublicLayout>
  );
}
