import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Grid3x3, LayoutGrid } from 'lucide-react';
import { LinkCard } from '@/components/LinkCard';
import { AddLinkModal } from '@/components/AddLinkModal';
import { SearchBar } from '@/components/SearchBar';
import { useToast } from '@/hooks/use-toast';
import { storageUtils } from '@/utils/storage';

interface LinkItem {
  id: string;
  url: string;
  title: string;
  description?: string;
  thumbnail?: string;
  tags: string[];
  clickCount: number;
  size: '1x1' | '1x2' | '2x2';
  createdAt: Date;
}

// Sample data
const sampleLinks: LinkItem[] = [
  {
    id: '1',
    url: 'https://figma.com',
    title: 'Figma - Design Tool',
    description: 'Collaborative interface design tool',
    tags: ['design', 'collaboration', 'figma'],
    clickCount: 42,
    size: '2x2',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    url: 'https://github.com',
    title: 'GitHub',
    description: 'Code repository hosting',
    tags: ['development', 'git', 'code'],
    clickCount: 38,
    size: '1x1',
    createdAt: new Date('2024-01-10'),
  },
  {
    id: '3',
    url: 'https://notion.so',
    title: 'Notion',
    description: 'All-in-one workspace',
    tags: ['productivity', 'notes', 'workspace'],
    clickCount: 25,
    size: '1x2',
    createdAt: new Date('2024-01-12'),
  },
  {
    id: '4',
    url: 'https://tailwindcss.com',
    title: 'Tailwind CSS',
    description: 'Utility-first CSS framework',
    tags: ['css', 'development', 'framework'],
    clickCount: 31,
    size: '1x1',
    createdAt: new Date('2024-01-08'),
  },
];

const Index = () => {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'compact'>('grid');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Load links from storage on mount
  useEffect(() => {
    const loadLinks = async () => {
      try {
        const storedLinks = await storageUtils.getLinks();
        if (storedLinks.length === 0) {
          // Initialize with sample data if no links exist
          await storageUtils.saveLinks(sampleLinks);
          setLinks(sampleLinks);
        } else {
          setLinks(storedLinks);
        }
      } catch (error) {
        console.error('Error loading links:', error);
        setLinks(sampleLinks);
      } finally {
        setIsLoading(false);
      }
    };

    loadLinks();
  }, []);

  // Get all available tags
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    links.forEach(link => {
      link.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [links]);

  // Filter links based on search and tags
  const filteredLinks = useMemo(() => {
    return links.filter(link => {
      const matchesSearch = searchQuery === '' || 
        link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        link.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        link.url.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTags = selectedTags.length === 0 ||
        selectedTags.some(tag => link.tags.includes(tag));
      
      return matchesSearch && matchesTags;
    });
  }, [links, searchQuery, selectedTags]);

  const handleAddLink = async (newLinkData: {
    url: string;
    title: string;
    description?: string;
    tags: string[];
    size: '1x1' | '1x2' | '2x2';
  }) => {
    try {
      const newLink = await storageUtils.addLink(newLinkData);
      setLinks(prev => [newLink, ...prev]);
      toast({
        title: 'Link added!',
        description: `${newLink.title} has been added to your collection.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add link. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleEditLink = (link: LinkItem) => {
    // TODO: Implement edit modal
    toast({
      title: 'Edit link',
      description: 'Edit functionality coming soon!',
    });
  };

  const handleDeleteLink = async (id: string) => {
    try {
      await storageUtils.deleteLink(id);
      setLinks(prev => prev.filter(link => link.id !== id));
      toast({
        title: 'Link removed',
        description: 'The link has been removed from your collection.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove link. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleOpenLink = async (link: LinkItem) => {
    try {
      // Increment click count
      await storageUtils.updateLink(link.id, { clickCount: link.clickCount + 1 });
      setLinks(prevLinks =>
        prevLinks.map(l =>
          l.id === link.id
            ? { ...l, clickCount: l.clickCount + 1 }
            : l
        )
      );
      
      // Open link in new tab
      window.open(link.url, '_blank');
      
      toast({
        title: 'Link opened',
        description: `Opened ${link.title}`,
      });
    } catch (error) {
      // Still open the link even if count update fails
      window.open(link.url, '_blank');
    }
  };

  const handleResizeLink = async (id: string, size: '1x1' | '1x2' | '2x2') => {
    try {
      await storageUtils.updateLink(id, { size });
      setLinks(prev =>
        prev.map(link =>
          link.id === id ? { ...link, size } : link
        )
      );
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to resize tile. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                LinkCloud
              </h1>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode(viewMode === 'grid' ? 'compact' : 'grid')}
                  className="bg-background/50 border-border hover:bg-muted"
                >
                  {viewMode === 'grid' ? <Grid3x3 className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
                </Button>
                <span className="text-sm text-muted-foreground">
                  {filteredLinks.length} links
                </span>
              </div>
            </div>
            <Button 
              onClick={() => setIsAddModalOpen(true)}
              className="bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Link
            </Button>
          </div>
          
          <SearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedTags={selectedTags}
            onTagToggle={handleTagToggle}
            availableTags={availableTags}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-6">
        {isLoading ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 mx-auto border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-muted-foreground mt-2">Loading your links...</p>
          </div>
        ) : filteredLinks.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto space-y-4">
              <div className="w-24 h-24 mx-auto bg-gradient-primary rounded-full flex items-center justify-center">
                <Plus className="w-12 h-12 text-primary-foreground" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">
                {searchQuery || selectedTags.length > 0 ? 'No matching links' : 'No links yet'}
              </h2>
              <p className="text-muted-foreground">
                {searchQuery || selectedTags.length > 0 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Add your first link to get started with your visual bookmark collection'
                }
              </p>
              {(!searchQuery && selectedTags.length === 0) && (
                <Button 
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-gradient-primary text-primary-foreground hover:opacity-90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Link
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 auto-rows-[200px]">
            {filteredLinks.map((link) => (
              <LinkCard
                key={link.id}
                link={link}
                onEdit={handleEditLink}
                onDelete={handleDeleteLink}
                onOpen={handleOpenLink}
                onResize={handleResizeLink}
              />
            ))}
          </div>
        )}
      </main>

      {/* Add Link Modal */}
      <AddLinkModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onAddLink={handleAddLink}
      />
    </div>
  );
};

export default Index;