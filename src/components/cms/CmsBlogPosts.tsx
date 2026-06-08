import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cmsService } from '@/services/cmsService';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, CalendarDays } from 'lucide-react';
import { GradientHeading } from '@/components/ui/gradient-heading';

interface CmsBlogPostsProps {
  style?: string;
  limit?: string;
  category_ids?: string;
  background_color?: string;
  enable_lazy_loading?: string;
  hide_header?: string;
}

export function CmsBlogPosts({
  style = 'style-1',
  limit = '3',
  category_ids,
  background_color = 'transparent',
  hide_header = 'false',
}: CmsBlogPostsProps) {
  const location = useLocation();
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isBlogsPage = location.pathname === '/blogs' || location.pathname === '/blog';
  const effectiveLimit = isBlogsPage && limit === '3' ? 'all' : limit;
  const showHeader = hide_header === 'false' && !isBlogsPage;

  useEffect(() => {
    cmsService.getPosts()
      .then(data => {
        if (data && !data.error && Array.isArray(data.data)) {
          if (effectiveLimit === 'all') {
            setPosts(data.data);
          } else {
            const limitNum = parseInt(effectiveLimit, 10);
            setPosts(data.data.slice(0, limitNum || 3));
          }
        }
      })
      .catch(err => console.error('Failed to fetch blog posts:', err))
      .finally(() => setIsLoading(false));
  }, [effectiveLimit]);

  if (isLoading) {
    return (
      <section className="py-20 md:py-32 w-full" style={{ backgroundColor: background_color }}>
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-96 animate-pulse rounded-2xl bg-muted/50" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="py-20 text-center bg-red-50 text-red-500">
        Debug: CmsBlogPosts is mounted, but posts array is empty.
      </div>
    );
  }

  return (
    <section className="py-5 md:py-10 w-full relative z-10" style={{ backgroundColor: background_color }}>
      <div className="container mx-auto px-4">
        {showHeader && (
          <div className="mb-16 text-center">
            <GradientHeading level={2} className="mb-4 text-4xl font-bold md:text-5xl">
              Latest Insights
            </GradientHeading>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Stay up to date with the latest news, tips, and insights from our team.
            </p>
          </div>
        )}

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Card key={post.id} className="group overflow-hidden rounded-2xl border-2 border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:border-primary/50 hover:shadow-2xl flex flex-col h-full">
              {post.image && (
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={cmsService.getImageUrl(post.image) || ''}
                    alt={post.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </div>
              )}

              <CardContent className="flex flex-1 flex-col p-6">
                <div className="mb-4 flex items-center text-sm text-muted-foreground">
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {new Date(post.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>

                <h3 className="mb-3 text-2xl font-bold line-clamp-2 group-hover:text-primary transition-colors">
                  <Link to={`/blog/${post.slug}`}>
                    {post.name}
                  </Link>
                </h3>

                <p className="mb-6 text-muted-foreground line-clamp-3 flex-1">
                  {post.description}
                </p>

                <div className="mt-auto">
                  <Button variant="ghost" className="group/btn p-0 hover:bg-transparent" asChild>
                    <Link to={`/blog/${post.slug}`}>
                      <span className="font-semibold text-primary">Read More</span>
                      <ArrowRight className="ml-2 h-4 w-4 text-primary transition-transform group-hover/btn:translate-x-1" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
