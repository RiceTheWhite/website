/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
// app/page.tsx
'use client'

import { useState, useEffect } from 'react';

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

  useEffect(() => {
    const generateLayout = () => {
      const containerWidth = 1200;
      const containerHeight = 800;
      const minSize = 150;
      const maxSize = 320;
      const padding = 30;
      const maxAttempts = 100;

      const newPositions: Array<{ top: number; left: number; size: number }> = [];

      items.forEach((_, index) => {
        let attempts = 0;
        let placed = false;
        let top=0, left=0, size=0;

        while (!placed && attempts < maxAttempts) {
          size = minSize + Math.random() * (maxSize - minSize);
          top = Math.random() * (containerHeight - size - 60); // Reserve space for text
          left = Math.random() * (containerWidth - size);
          placed = true;

          for (const existing of newPositions) {
            const horizontalOverlap = 
              left < existing.left + existing.size + padding && 
              left + size + padding > existing.left;
            
            const verticalOverlap = 
              top < existing.top + existing.size + padding + 60 && // Extra vertical padding for text
              top + size + padding + 60 > existing.top;

            if (horizontalOverlap && verticalOverlap) {
              placed = false;
              break;
            }
          }
          
          attempts++;
        }

        newPositions.push({ top, left, size });
      });

      setPositions(newPositions);
    };

    generateLayout();
  }, [items]);

  if (!positions.length) return null;

  return (
    <div 
      className="relative w-full h-[800px] mx-auto p-4"
      style={{ maxWidth: '1200px' }}
    >
      {items.map((item, index) => {
        const { top, left, size } = positions[index] || {};
        const imageSize = size * 0.85;

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
            <div className="relative w-full">
              <img
                src={item.track.album.images[0]?.url}
                alt={`Cover for ${item.track.name}`}
                className="w-full rounded-lg shadow-xl"
                style={{
                  height: `${imageSize}px`,
                  objectFit: 'cover'
                }}
              />
              <div 
                className="absolute w-full pt-3 space-y-1"
                style={{ 
                  top: `${imageSize}px`, // Position text below image
                  minHeight: `${size - imageSize}px`
                }}
              >
                <p 
                  className="font-medium line-clamp-2 dark:text-white text-gray-900"
                  style={{ fontSize: `${Math.max(14, size * 0.08)}px` }}
                >
                  {item.track.name}
                </p>
                <p 
                  className="text-sm line-clamp-1 dark:text-gray-300 text-gray-600"
                  style={{ fontSize: `${Math.max(12, size * 0.06)}px` }}
                >
                  {item.track.artists.map(artist => artist.name).join(', ')}
                </p>
              </div>
            </div>
          </a>
        );
      })}
    </div>
  );
};

// Update your page component
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