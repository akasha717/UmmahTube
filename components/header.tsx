'use client';

import Link from 'next/link';
import { Film, Upload, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-emerald-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-lg flex items-center justify-center">
              <Film className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">
              UmmahTube
            </span>
          </Link>

          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Input
                type="text"
                placeholder="Search Islamic content..."
                className="w-full pl-10 pr-4 rounded-full bg-emerald-50 border-emerald-200 focus:border-emerald-500 focus:bg-white"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-emerald-500" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/upload">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex items-center gap-2">
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">Upload</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
