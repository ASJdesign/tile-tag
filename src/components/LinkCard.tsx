import { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Tag, MoreHorizontal, Move } from 'lucide-react';
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
  onResize: (id: string, size: '1x1' | '1x2' | '2x2') => void;
}

export function LinkCard({ link, onEdit, onDelete, onOpen, onResize }: LinkCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; size: string } | null>(null);

  const sizeClasses = {
    '1x1': 'col-span-1 row-span-1',
    '1x2': 'col-span-1 row-span-2',
    '2x2': 'col-span-2 row-span-2'
  };

  const handleClick = () => {
    if (!isResizing) {
      onOpen(link);
    }
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      size: link.size
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragStartRef.current) return;
      
      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaY = e.clientY - dragStartRef.current.y;
      const threshold = 50;

      let newSize: '1x1' | '1x2' | '2x2' = dragStartRef.current.size as '1x1' | '1x2' | '2x2';

      if (Math.abs(deltaX) > threshold || Math.abs(deltaY) > threshold) {
        if (deltaX > threshold && deltaY > threshold) {
          newSize = '2x2';
        } else if (deltaY > threshold) {
          newSize = '1x2';
        } else if (deltaX > threshold) {
          newSize = '2x2';
        } else {
          newSize = '1x1';
        }

        if (newSize !== link.size) {
          onResize(link.id, newSize);
          dragStartRef.current.size = newSize;
        }
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      dragStartRef.current = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
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

      {/* Resize Handle */}
      {isHovered && (
        <div 
          className="absolute bottom-1 right-1 w-4 h-4 cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
          onMouseDown={handleResizeStart}
        >
          <div className="w-full h-full bg-primary/20 rounded-sm flex items-center justify-center hover:bg-primary/40 transition-colors">
            <Move className="w-2.5 h-2.5 text-primary" />
          </div>
        </div>
      )}
    </Card>
  );
}