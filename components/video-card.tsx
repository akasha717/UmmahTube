'use client';

import Image from 'next/image';
import { Heart, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface VideoCardProps {
  id: string;
  title: string;
  channel_name: string;
  thumbnail_url: string;
  views: number;
  likes: number;
  duration: number;
  created_at: string;
}

export default function VideoCard({
  title,
  channel_name,
  thumbnail_url,
  views,
  likes,
  duration,
  created_at,
}: VideoCardProps) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatViews = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <div className="group cursor-pointer">
      <div className="relative overflow-hidden rounded-lg bg-slate-200 aspect-video mb-3">
        <Image
          src={thumbnail_url}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute bottom-2 right-2 bg-slate-900/80 text-white text-xs px-2 py-1 rounded">
          {formatDuration(duration)}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold text-slate-900 line-clamp-2 group-hover:text-emerald-600 transition-colors">
          {title}
        </h3>

        <p className="text-sm text-slate-600 hover:text-emerald-600 transition-colors">
          {channel_name}
        </p>

        <div className="flex items-center gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4 text-emerald-600" />
            <span>{formatViews(views)} views</span>
          </div>
          <div className="flex items-center gap-1">
            <Heart className="w-4 h-4 text-emerald-600" />
            <span>{formatViews(likes)}</span>
          </div>
          <span>
            {formatDistanceToNow(new Date(created_at), { addSuffix: true })}
          </span>
        </div>
      </div>
    </div>
  );
}
