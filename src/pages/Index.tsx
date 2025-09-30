import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TopNav } from '@/components/TopNav';
import ReactMarkdown from 'react-markdown';

interface Page {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  content_mdx: string;
  order_num: number;
}

const Index = () => {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    const { data } = await supabase
      .from('pages')
      .select('*')
      .eq('published', true)
      .order('order_num');

    if (data) {
      setPages(data);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <TopNav />
      
      <main className="pt-24 pb-16">
        {pages.map((page, index) => (
          <section
            key={page.id}
            id={page.slug}
            className={`${index > 0 ? 'mt-20' : ''}`}
          >
            <div className="max-w-4xl mx-auto px-6">
              <div className="prose max-w-none">
                <ReactMarkdown>{page.content_mdx}</ReactMarkdown>
              </div>
            </div>
          </section>
        ))}
      </main>

      <footer className="border-t border-gray-200 py-8">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-sm text-gray-500">
            © 2025 AI 2027 Research. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
