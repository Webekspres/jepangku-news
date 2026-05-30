import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-jepang-black text-white mt-24" data-testid="main-footer">
      <div className="px-4 md:px-8 lg:px-12 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <h3 className="font-heading font-black text-2xl tracking-tighter mb-3">
              <span className="text-jepang-red">Jepang</span><span className="text-white">ku</span>
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Portal media interaktif bertema Jepang untuk pembaca Indonesia.
            </p>
          </div>
          <div>
            <h4 className="small-caps text-jepang-red mb-3">Explore</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/articles" className="hover:text-jepang-red transition-colors">Articles</Link></li>
              <li><Link to="/quizzes" className="hover:text-jepang-red transition-colors">Quizzes</Link></li>
              <li><Link to="/polls" className="hover:text-jepang-red transition-colors">Polls</Link></li>
              <li><Link to="/leaderboard" className="hover:text-jepang-red transition-colors">Leaderboard</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="small-caps text-jepang-red mb-3">Categories</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/articles?category=anime" className="hover:text-jepang-red transition-colors">Anime</Link></li>
              <li><Link to="/articles?category=manga" className="hover:text-jepang-red transition-colors">Manga</Link></li>
              <li><Link to="/articles?category=culture" className="hover:text-jepang-red transition-colors">Culture</Link></li>
              <li><Link to="/articles?category=food" className="hover:text-jepang-red transition-colors">Food</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="small-caps text-jepang-red mb-3">Account</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/login" className="hover:text-jepang-red transition-colors">Login</Link></li>
              <li><Link to="/register" className="hover:text-jepang-red transition-colors">Register</Link></li>
              <li><Link to="/submit-article" className="hover:text-jepang-red transition-colors">Submit Article</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-zinc-500 font-mono">© 2026 JEPANGKU. ALL RIGHTS RESERVED.</p>
          <p className="text-xs text-zinc-500 font-mono uppercase tracking-wider">日本語ポータル | INDONESIA</p>
        </div>
      </div>
    </footer>
  );
}
