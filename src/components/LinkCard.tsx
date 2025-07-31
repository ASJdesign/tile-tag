import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Tag, MoreHorizontal, Move, Globe } from 'lucide-react';
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
  backgroundColor?: string;
}

interface LinkCardProps {
  link: LinkItem;
  onEdit: (link: LinkItem) => void;
  onDelete: (id: string) => void;
  onOpen: (link: LinkItem) => void;
  onResize: (id: string, size: '1x1' | '1x2' | '2x2') => void;
  onColorChange: (id: string, color: string) => void;
}

export function LinkCard({ link, onEdit, onDelete, onOpen, onResize, onColorChange }: LinkCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [sampledColor, setSampledColor] = useState<string | null>(null);
  const dragStartRef = useRef<{ x: number; y: number; size: string } | null>(null);

  // Extract domain and favicon from URL
  const getDomainInfo = (url: string) => {
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname.replace('www.', '');
      const favicon = `https://${urlObj.hostname}/favicon.ico`;
      return { domain, favicon };
    } catch {
      return { domain: 'Invalid URL', favicon: null };
    }
  };

  const { domain, favicon } = getDomainInfo(link.url);

  // Sample favicon colors and create contrasting background
  const sampleFaviconColor = async (faviconUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(getThemeColor(domain));
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        try {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          
          // Sample colors and find the most prominent non-white color
          const colorMap = new Map<string, number>();
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];
            
            // Skip transparent or very light pixels
            if (a < 128 || (r > 240 && g > 240 && b > 240)) continue;
            
            const color = `${r},${g},${b}`;
            colorMap.set(color, (colorMap.get(color) || 0) + 1);
          }
          
          if (colorMap.size > 0) {
            // Get the most prominent color
            const dominantColor = Array.from(colorMap.entries())
              .sort((a, b) => b[1] - a[1])[0][0];
            
            const [r, g, b] = dominantColor.split(',').map(Number);
            
            // Convert to HSL and create a complementary background
            const hsl = rgbToHsl(r, g, b);
            const complementaryHue = (hsl.h + 180) % 360;
            
            // Create a subtle background with complementary hue
            resolve(`hsl(${complementaryHue}, 80%, 95%)`);
          } else {
            resolve(getThemeColor(domain));
          }
        } catch {
          resolve(getThemeColor(domain));
        }
      };
      
      img.onerror = () => resolve(getThemeColor(domain));
      img.src = faviconUrl;
    });
  };

  // Convert RGB to HSL
  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return { h: h * 360, s: s * 100, l: l * 100 };
  };

  // Generate random colors
  const getRandomColor = () => {
    const hue = Math.floor(Math.random() * 360);
    const saturation = Math.floor(Math.random() * 40) + 40; // 40-80%
    const lightness = Math.floor(Math.random() * 20) + 85; // 85-95%
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  // Generate a color-based background from domain (fallback)
  const getThemeColor = (domain: string) => {
    const colors = [
      'hsl(var(--thumbnail-bg-blue))',
      'hsl(var(--thumbnail-bg-green))',
      'hsl(var(--thumbnail-bg-purple))',
      'hsl(var(--thumbnail-bg-orange))',
      'hsl(var(--thumbnail-bg-red))',
      'hsl(var(--thumbnail-bg-teal))'
    ];
    
    const hash = domain.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const handleColorChange = () => {
    const newColor = getRandomColor();
    onColorChange(link.id, newColor);
  };

  // Sample favicon color on mount and set random color if none exists
  useEffect(() => {
    if (!link.backgroundColor) {
      if (favicon && !sampledColor) {
        sampleFaviconColor(favicon).then(setSampledColor);
      } else if (!favicon) {
        // Set a random color for links without favicons
        const randomColor = getRandomColor();
        onColorChange(link.id, randomColor);
      }
    }
  }, [favicon, sampledColor, link.backgroundColor, link.id, onColorChange]);

  const themeColor = link.backgroundColor || sampledColor || getRandomColor();

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
      <div 
        className="aspect-video w-full rounded-t-lg overflow-hidden relative"
        style={{ backgroundColor: themeColor }}
      >
        {link.thumbnail ? (
          <img
            src={link.thumbnail}
            alt={link.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        ) : favicon ? (
          <div className="w-full h-full flex items-center justify-center relative">
            <img
              src={favicon}
              alt={`${domain} favicon`}
              className="w-16 h-16 object-contain opacity-90 transition-transform duration-300 group-hover:scale-110"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className="hidden w-full h-full flex items-center justify-center">
              <ExternalLink className="w-8 h-8 text-foreground/60" />
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ExternalLink className="w-8 h-8 text-foreground/60" />
          </div>
        )}
        
        {/* Domain Badge */}
        <div className="absolute top-2 left-2 flex items-center gap-1 bg-background/90 backdrop-blur-sm rounded-md px-2 py-1 text-xs">
          {favicon ? (
            <img 
              src={favicon} 
              alt={`${domain} favicon`}
              className="w-3 h-3 rounded-sm"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <Globe className={cn("w-3 h-3 text-muted-foreground", favicon && "hidden")} />
          <span className="text-muted-foreground font-medium truncate max-w-[80px]">
            {domain}
          </span>
        </div>
        
        {/* Color Change Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleColorChange();
          }}
          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-background/80 backdrop-blur-sm border border-border/30 hover:bg-background transition-colors opacity-0 group-hover:opacity-100"
          title="Change background color"
        >
          <div className="w-3 h-3 rounded-full mx-auto" style={{ backgroundColor: themeColor }} />
        </button>
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

        {/* URL Preview & Stats */}
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground truncate bg-muted/30 rounded px-2 py-1">
            {link.url.length > 40 ? `${link.url.substring(0, 40)}...` : link.url}
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{link.clickCount} clicks</span>
            <span>{new Date(link.createdAt).toLocaleDateString()}</span>
          </div>
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