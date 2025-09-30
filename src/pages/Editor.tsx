import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { TopNav } from '@/components/TopNav';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ReactMarkdown from 'react-markdown';

interface Page {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  content_mdx: string;
  order_num: number;
  published: boolean;
}

export default function Editor() {
  const { user, profile } = useAuth();
  const [pages, setPages] = useState<Page[]>([]);
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate('/auth/login');
      return;
    }
    fetchPages();
  }, [user, navigate]);

  const fetchPages = async () => {
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .order('order_num');

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load pages',
        variant: 'destructive',
      });
    } else {
      setPages(data || []);
      if (data && data.length > 0 && !selectedPage) {
        setSelectedPage(data[0]);
      }
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!selectedPage) return;
    setSaving(true);

    const { error } = await supabase
      .from('pages')
      .update({
        title: selectedPage.title,
        subtitle: selectedPage.subtitle,
        content_mdx: selectedPage.content_mdx,
        order_num: selectedPage.order_num,
        published: selectedPage.published,
      })
      .eq('id', selectedPage.id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to save changes',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Changes saved successfully',
      });
      fetchPages();
    }
    setSaving(false);
  };

  if (!user || loading) return null;

  return (
    <div className="min-h-screen bg-white">
      <TopNav />
      <div className="pt-20 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-semibold tracking-tight mb-8">Content Editor</h1>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Pages List */}
            <div className="lg:col-span-1">
              <div className="space-y-2">
                {pages.map((page) => (
                  <button
                    key={page.id}
                    onClick={() => setSelectedPage(page)}
                    className={`w-full text-left p-4 rounded-lg border transition-all ${
                      selectedPage?.id === page.id
                        ? 'border-black bg-gray-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="font-medium text-sm">{page.title}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {page.published ? '✓ Published' : '○ Draft'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Editor */}
            <div className="lg:col-span-3">
              {selectedPage && (
                <Tabs defaultValue="edit" className="w-full">
                  <TabsList className="mb-4">
                    <TabsTrigger value="edit">Edit</TabsTrigger>
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                  </TabsList>

                  <TabsContent value="edit" className="space-y-6">
                    <div>
                      <Label htmlFor="title" className="text-sm font-medium">
                        Title
                      </Label>
                      <Input
                        id="title"
                        value={selectedPage.title}
                        onChange={(e) =>
                          setSelectedPage({ ...selectedPage, title: e.target.value })
                        }
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="subtitle" className="text-sm font-medium">
                        Subtitle
                      </Label>
                      <Input
                        id="subtitle"
                        value={selectedPage.subtitle || ''}
                        onChange={(e) =>
                          setSelectedPage({ ...selectedPage, subtitle: e.target.value })
                        }
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="content" className="text-sm font-medium">
                        Content (Markdown)
                      </Label>
                      <Textarea
                        id="content"
                        value={selectedPage.content_mdx}
                        onChange={(e) =>
                          setSelectedPage({ ...selectedPage, content_mdx: e.target.value })
                        }
                        className="mt-1 min-h-[400px] font-mono text-sm"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={selectedPage.published}
                            onCheckedChange={(checked) =>
                              setSelectedPage({ ...selectedPage, published: checked })
                            }
                          />
                          <Label>Published</Label>
                        </div>

                        <div className="flex items-center gap-2">
                          <Label htmlFor="order" className="text-sm">Order:</Label>
                          <Input
                            id="order"
                            type="number"
                            value={selectedPage.order_num}
                            onChange={(e) =>
                              setSelectedPage({
                                ...selectedPage,
                                order_num: parseInt(e.target.value),
                              })
                            }
                            className="w-20"
                          />
                        </div>
                      </div>

                      <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="rounded-lg bg-black text-white px-6 py-2 font-medium hover:bg-gray-900"
                      >
                        {saving ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="preview">
                    <div className="prose max-w-none p-8 border rounded-lg">
                      <h1>{selectedPage.title}</h1>
                      {selectedPage.subtitle && (
                        <p className="text-xl text-gray-600">{selectedPage.subtitle}</p>
                      )}
                      <ReactMarkdown>{selectedPage.content_mdx}</ReactMarkdown>
                    </div>
                  </TabsContent>
                </Tabs>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
