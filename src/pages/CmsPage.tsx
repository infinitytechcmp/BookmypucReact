import { useEffect, useState } from 'react';
import { PublicLayout } from '@/components/layouts/PublicLayout';
import { cmsService } from '@/services/cmsService';
import { CmsRenderer } from '@/components/cms/CmsRenderer';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import { useParams } from 'react-router-dom';
import { GradientHeading } from '@/components/ui/gradient-heading';

interface CmsPageProps {
  slug?: string;
  title?: string;
  hideTitle?: boolean;
}

export default function CmsPage({ slug: propSlug, title, hideTitle }: CmsPageProps) {
  const params = useParams<{ slug: string }>();
  const slug = propSlug || params.slug;

  const [pageData, setPageData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadPage = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!slug) throw new Error('No slug provided');
        const response = await cmsService.getPageBySlug(slug);
        if (mounted) {
          if (!response || response.error) {
            setError(response?.message || 'Failed to load page content.');
          } else {
            setPageData(response.data);
          }
        }
      } catch (err: any) {
        if (mounted) {
          setError(err.message || 'An unexpected error occurred.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadPage();

    return () => {
      mounted = false;
    };
  }, [slug]);

  return (
    <PublicLayout>
      <div className="mx-auto">
        {loading ? (
          <div className="mx-auto max-w-4xl space-y-6">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
            <div className="pt-8 space-y-4">
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        ) : error ? (
          <div className="mx-auto max-w-2xl py-12">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        ) : pageData ? (
          <div className="w-full">
            <CmsRenderer content={pageData.content} />
          </div>
        ) : (
          <div className="mx-auto max-w-2xl py-12 text-center">
            <GradientHeading level={2} className="text-2xl font-bold">Page not found</GradientHeading>
            <p className="mt-2 text-muted-foreground">The page you are looking for does not exist.</p>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
