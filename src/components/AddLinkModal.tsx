import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus } from 'lucide-react';

interface AddLinkModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddLink: (link: {
    url: string;
    title: string;
    description?: string;
    tags: string[];
    size: '1x1' | '1x2' | '2x2';
  }) => void;
}

export function AddLinkModal({ open, onOpenChange, onAddLink }: AddLinkModalProps) {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [size, setSize] = useState<'1x1' | '1x2' | '2x2'>('1x1');
  const [isLoading, setIsLoading] = useState(false);

  const handleAddTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async () => {
    if (!url.trim() || !title.trim()) return;

    setIsLoading(true);
    
    try {
      onAddLink({
        url: url.trim(),
        title: title.trim(),
        description: description.trim() || undefined,
        tags,
        size,
      });
      
      // Reset form
      setUrl('');
      setTitle('');
      setDescription('');
      setTags([]);
      setCurrentTag('');
      setSize('1x1');
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Add New Link</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Add a new link to your collection with tags and custom sizing.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* URL Input */}
          <div className="space-y-2">
            <Label htmlFor="url" className="text-foreground">URL</Label>
            <Input
              id="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="bg-background border-border"
            />
          </div>

          {/* Title Input */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-foreground">Title</Label>
            <Input
              id="title"
              placeholder="Link title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-background border-border"
            />
          </div>

          {/* Description Input */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-foreground">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Brief description of the link"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-background border-border min-h-[60px]"
            />
          </div>

          {/* Size Selection */}
          <div className="space-y-2">
            <Label htmlFor="size" className="text-foreground">Card Size</Label>
            <Select value={size} onValueChange={(value) => setSize(value as '1x1' | '1x2' | '2x2')}>
              <SelectTrigger className="bg-background border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1x1">Small (1×1)</SelectItem>
                <SelectItem value="1x2">Tall (1×2)</SelectItem>
                <SelectItem value="2x2">Large (2×2)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label className="text-foreground">Tags</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add a tag"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyPress={handleKeyPress}
                className="bg-background border-border flex-1"
              />
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={handleAddTag}
                className="px-3"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="bg-primary/10 text-primary border-primary/20 pr-1"
                  >
                    {tag}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto w-auto p-0.5 ml-1 hover:bg-transparent"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!url.trim() || !title.trim() || isLoading}
            className="bg-gradient-primary text-primary-foreground hover:opacity-90"
          >
            {isLoading ? 'Adding...' : 'Add Link'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}