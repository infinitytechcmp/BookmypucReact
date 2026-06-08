import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { cmsService } from '@/services/cmsService';
import { PublicLayout } from '@/components/layouts/PublicLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CalendarDays, Share2 } from 'lucide-react';
import { CmsRenderer } from '@/components/cms/CmsRenderer';
import { GradientHeading } from '@/components/ui/gradient-heading';

export default function BlogDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!slug) {
      navigate('/');
      return;
    }

    setIsLoading(true);
    cmsService.getPostBySlug(slug)
      .then(data => {
        if (data && !data.error && data.data) {
          setPost(data.data);
        } else {
          // If post not found or error, just go back
          navigate('/');
        }
      })
      .catch(err => {
        console.error('Failed to fetch blog post details:', err);
        navigate('/');
      })
      .finally(() => setIsLoading(false));
  }, [slug, navigate]);

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-20">
          <div className="mx-auto max-w-3xl">
            <div className="mb-8 h-8 w-32 animate-pulse rounded bg-muted/50" />
            <div className="mb-4 h-12 w-3/4 animate-pulse rounded bg-muted/50" />
            <div className="mb-12 h-6 w-1/2 animate-pulse rounded bg-muted/50" />
            <div className="h-96 w-full animate-pulse rounded-2xl bg-muted/50" />
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (!post) return null;

  return (
    <PublicLayout>
      <article className="pb-20 pt-32">
        {/* Header Section */}
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <Button variant="ghost" className="mb-8 hover:bg-transparent" asChild>
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>

            <GradientHeading level={1} className="mb-6 text-4xl font-bold md:text-5xl lg:text-6xl drop-shadow-sm">
              {post.name}
            </GradientHeading>

            <div className="mb-12 flex items-center justify-center gap-6 text-muted-foreground">
              <div className="flex items-center">
                <CalendarDays className="mr-2 h-5 w-5" />
                {new Date(post.created_at).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </div>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10" title="Share this post">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Featured Image */}
        {post.image && (
          <div className="container mx-auto px-4 mb-16">
            <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl shadow-2xl">
              <img
                src={cmsService.getImageUrl(post.image) || ''}
                alt={post.name}
                className="w-full object-cover max-h-[600px]"
              />
            </div>
          </div>
        )}

        {/* Content Section */}
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl prose prose-lg dark:prose-invert">
            {/* If content exists and contains shortcodes or HTML, render it via CmsRenderer */}
            {post.content ? (
              <CmsRenderer content={post.content} />
            ) : (
              /* Fallback to description if there's no rich content body */
              <p className="text-xl leading-relaxed text-muted-foreground">
                {post.description}
              </p>
            )}
          </div>
        </div>
      </article>
    </PublicLayout>
  );
}
