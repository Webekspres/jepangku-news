import React from 'react';
import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';

export default function ArticleCard({ article, variant = 'default' }) {
  if (variant === 'featured') {
    return (
      <Link
        to={`/articles/${article.slug}`}
        className="group block relative h-[460px] md:h-[560px] overflow-hidden border border-jepang-black bg-jepang-black"
        data-testid={`article-featured-${article.slug}`}
      >
        {article.cover_image_url && (
          <img
            src={article.cover_image_url}
            alt={article.title}
            className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity duration-300"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        <div className="absolute top-6 left-6 flex gap-2">
          <span className="jepang-badge-red">FEATURED</span>
          {article.category && (
            <span className="jepang-badge bg-white">{article.category.name}</span>
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
          <h2 className="font-heading font-black text-3xl md:text-5xl tracking-tighter mb-3 group-hover:text-jepang-red transition-colors">
            {article.title}
          </h2>
          {article.excerpt && (
            <p className="text-zinc-300 text-base md:text-lg max-w-2xl line-clamp-2">{article.excerpt}</p>
          )}
          <div className="flex items-center gap-4 mt-4 text-xs text-zinc-400 font-mono uppercase tracking-wider">
            {article.author && <span>BY {article.author.name}</span>}
            <span className="flex items-center gap-1"><Eye size={14} strokeWidth={1.5} /> {article.view_count || 0}</span>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'compact') {
    return (
      <Link to={`/articles/${article.slug}`} className="group flex gap-3 py-4 border-b border-jepang-border last:border-b-0" data-testid={`article-compact-${article.slug}`}>
        {article.cover_image_url ? (
          <div className="w-20 h-20 flex-shrink-0 bg-jepang-off-white overflow-hidden">
            <img src={article.cover_image_url} alt={article.title} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-20 h-20 flex-shrink-0 bg-jepang-off-white flex items-center justify-center">
            <span className="text-xs text-jepang-muted font-mono">JK</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          {article.category && (
            <span className="text-[10px] uppercase tracking-wider font-bold text-jepang-red">{article.category.name}</span>
          )}
          <h3 className="font-heading font-bold text-sm md:text-base line-clamp-2 group-hover:text-jepang-red transition-colors">
            {article.title}
          </h3>
          <div className="flex items-center gap-2 mt-1 text-[10px] text-jepang-muted font-mono">
            <Eye size={10} /> {article.view_count || 0}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/articles/${article.slug}`}
      className="group block bg-white border border-jepang-border hover:border-jepang-black transition-all duration-200"
      data-testid={`article-card-${article.slug}`}
    >
      {article.cover_image_url ? (
        <div className="aspect-[16/10] overflow-hidden bg-jepang-off-white">
          <img
            src={article.cover_image_url}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      ) : (
        <div className="aspect-[16/10] bg-jepang-off-white flex items-center justify-center">
          <span className="font-mono text-jepang-muted text-sm uppercase tracking-wider">JEPANGKU</span>
        </div>
      )}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          {article.category && <span className="jepang-badge">{article.category.name}</span>}
          {article.is_hot && <span className="jepang-badge-red">HOT</span>}
        </div>
        <h3 className="font-heading font-bold text-xl tracking-tight mb-2 group-hover:text-jepang-red transition-colors line-clamp-2">
          {article.title}
        </h3>
        {article.excerpt && (
          <p className="text-sm text-jepang-muted line-clamp-2 mb-4">{article.excerpt}</p>
        )}
        <div className="pt-3 border-t border-jepang-border flex items-center justify-between text-xs text-jepang-muted font-mono uppercase tracking-wider">
          <span>{article.author?.name || 'Jepangku'}</span>
          <span className="flex items-center gap-1"><Eye size={12} strokeWidth={1.5} /> {article.view_count || 0}</span>
        </div>
      </div>
    </Link>
  );
}
