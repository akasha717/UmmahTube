import Link from 'next/link';
import { Film } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-slate-50 to-slate-100 border-t border-emerald-100 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-lg flex items-center justify-center">
                <Film className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-emerald-700">UmmahTube</span>
            </div>
            <p className="text-slate-600 text-sm">
              A halal video platform for Islamic content and education.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 mb-4">Content</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><Link href="#" className="hover:text-emerald-600">Quran</Link></li>
              <li><Link href="#" className="hover:text-emerald-600">Islamic Studies</Link></li>
              <li><Link href="#" className="hover:text-emerald-600">Duas & Reminders</Link></li>
              <li><Link href="#" className="hover:text-emerald-600">History</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 mb-4">About</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><Link href="#" className="hover:text-emerald-600">About Us</Link></li>
              <li><Link href="#" className="hover:text-emerald-600">Guidelines</Link></li>
              <li><Link href="#" className="hover:text-emerald-600">Community</Link></li>
              <li><Link href="#" className="hover:text-emerald-600">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><Link href="#" className="hover:text-emerald-600">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-emerald-600">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-emerald-600">Halal Standards</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-emerald-100 pt-8">
          <p className="text-center text-sm text-slate-600">
            © 2025 UmmahTube. Dedicated to Islamic knowledge and community.
          </p>
        </div>
      </div>
    </footer>
  );
}
