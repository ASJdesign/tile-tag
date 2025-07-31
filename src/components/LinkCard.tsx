import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Tag, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

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

interface LinkCardProps {
  link: LinkItem;
  onEdit: (link: LinkItem) => void;
  onDelete: (id: string) => void;
  onOpen: (link: LinkItem) => void;
}

export function LinkCard({ link, onEdit, onDelete, onOpen }: LinkCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const sizeClasses = {
    '1x1': 'col-span-1 row-span-1',
    '1x2': 'col-span-1 row-span-2',
    '2x2': 'col-span-2 row-span-2'
  };

  const handleClick = () => {
    onOpen(link);
  };

  return (
    <Card
      className={cn(
        'group relative overflow-hidden cursor-pointer border-border/50',
        'bg-card/50 backdrop-blur-sm transition-all duration-300',
        'hover:shadow-card hover:scale-[1.02] hover:border-primary/30',
        sizeClasses[link.size]
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* Thumbnail */}
      <div className="aspect-video w-full bg-gradient-subtle rounded-t-lg overflow-hidden">
        {link.thumbnail ? (
          <img
            src={link.thumbnail}
            alt={link.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-primary">
            <ExternalLink className="w-8 h-8 text-primary-foreground" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div className="space-y-1">
          <h3 className="font-medium text-sm line-clamp-2 text-foreground group-hover:text-primary transition-colors">
            {link.title}
          </h3>
          {link.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {link.description}
            </p>
          )}
        </div>

        {/* Tags */}
        {link.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {link.tags.slice(0, 3).map((tag, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="text-xs px-2 py-0.5 bg-primary/10 text-primary border-primary/20"
              >
                {tag}
              </Badge>
            ))}
            {link.tags.length > 3 && (
              <Badge variant="outline" className="text-xs px-2 py-0.5">
                +{link.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{link.clickCount} clicks</span>
          <span>{new Date(link.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Hover Actions */}
      {isHovered && (
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Button
            size="sm"
            variant="secondary"
            className="h-6 w-6 p-0 bg-background/80 backdrop-blur-sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(link);
            }}
          >
            <Tag className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="h-6 w-6 p-0 bg-background/80 backdrop-blur-sm"
            onClick={(e) => {
              e.stopPropagation();
              // Add more options
            }}
          >
            <MoreHorizontal className="w-3 h-3" />
          </Button>
        </div>
      )}
    </Card>
  );
}