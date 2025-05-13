/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useState, useEffect, useRef } from 'react';

interface Track {
  track: {
    name: string;
    artists: Array<{ name: string }>;
    album: {
      images: Array<{ url: string }>;
    };
    external_urls: {
      spotify: string;
    };
  };
}

interface PlaylistTracksProps {
  items: Track[];
}

const PlaylistTracks = ({ items }: PlaylistTracksProps) => {
  const [positions, setPositions] = useState<Array<{ 
    top: number; 
    left: number; 
    size: number 
  }>>([]);
  const [containerHeight, setContainerHeight] = useState(1000);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const generateLayout = () => {
      const containerWidth = containerRef.current?.clientWidth || 1200;
      const minSize = 100;
      const maxSize = 250;
      const padding = 15;
      const maxAttempts = 1000000000000;
      let maxBottom = 0;

      const newPositions: Array<{ top: number; left: number; size: number }> = [];

      items.forEach((_, index) => {
        let attempts = 0;
        let placed = false;
        let top=0, left=0, size=0;

        left = Math.random() * (containerWidth - size);

        while (!placed && attempts < maxAttempts) {
          size = minSize + Math.random() * (maxSize - minSize);
          left = attempts % (containerWidth - size - padding*2) + padding; // Start with base height
          top = Math.floor(attempts/(containerWidth - size - padding*2))
          placed = true;

          for (const existing of newPositions) {
            const horizontalOverlap = 
              left < existing.left + existing.size + padding && 
              left + size + padding > existing.left;
            
            const verticalOverlap = 
              top < existing.top + existing.size + padding && 
              top + size + padding > existing.top;

            if (horizontalOverlap && verticalOverlap) {
              placed = false;
              break;
            }
          }
          
          attempts+=20;
        }

        // Track the lowest element position
        const bottom = top + size;
        if (bottom > maxBottom) {
          maxBottom = bottom;
        }

        newPositions.push({ top, left, size });
      });

      // Add 20px buffer to the calculated height
      setContainerHeight(maxBottom + 20);
      setPositions(newPositions);
    };

    generateLayout();
  }, [items]);

  if (!positions.length) return null;

  return (
    <div 
      ref={containerRef}
      className="relative w-full mx-auto p-4"
      style={{ 
        maxWidth: '1200px',
        height: `${containerHeight}px`
      }}
    >
      {items.map((item, index) => {
        const { top, left, size } = positions[index] || {};

        return (
          <a
            key={index}
            href={item.track.external_urls.spotify}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute transition-transform duration-300 hover:z-10 hover:scale-105"
            style={{
              top: `${top}px`,
              left: `${left}px`,
              width: `${size}px`,
            }}
          >
            <div className="relative group">
              {/* 1:1 Cover Image with Text Overlay */}
              <div 
                className="relative rounded-lg shadow-xl overflow-hidden"
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                }}
              >
                <img
                  src={item.track.album.images[0]?.url}
                  alt={`Cover for ${item.track.name}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:brightness-75"
                />
                
                {/* Text overlay */}
                <div className="absolute inset-0 flex flex-col justify-end p-3 bg-gradient-to-t from-black/70 via-black/40 to-transparent">
                  <p 
                    className="font-medium text-white line-clamp-2"
                    style={{ 
                      fontSize: `${Math.max(12, size * 0.1)}px`,
                      lineHeight: 1.2,
                      textShadow: '0 1px 3px rgba(0,0,0,0.8)'
                    }}
                  >
                    {item.track.name}
                  </p>
                  <p 
                    className="text-white/80 line-clamp-1"
                    style={{ 
                      fontSize: `${Math.max(10, size * 0.08)}px`,
                      lineHeight: 1.2,
                      textShadow: '0 1px 2px rgba(0,0,0,0.8)'
                    }}
                  >
                    {item.track.artists.map(artist => artist.name).join(', ')}
                  </p>
                </div>
              </div>
            </div>
          </a>
        );
      })}
    </div>
  );
};



export default function Page() {
  const [data, setData] = useState<{ tracks?: { items: Track[] }, error?: string }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/spotify?playlistId=1jTsApHoT7pkI4IkpDo7cn');
        const json = await res.json();
        setData(json);
      } catch (error) {
        setData({ error: 'Failed to fetch playlist' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (data.error || !data.tracks?.items) return <div>Error loading playlist</div>;

  return <PlaylistTracks items={data.tracks.items} />;
}