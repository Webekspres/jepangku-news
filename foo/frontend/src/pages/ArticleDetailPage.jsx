import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Bookmark, Share2, Eye, Calendar, ArrowLeft, Award } from 'lucide-react';
import { toast } from 'sonner';
import ArticleCard from '@/components/ArticleCard';

export default function ArticleDetailPage() {
  const { slug } = useParams();
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [readCompleted, setReadCompleted] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    loadArticle();
    setReadCompleted(false);
  }, [slug]);

  useEffect(() => {
    if (!user || readCompleted || !article) return;
    
    const handleScroll = () => {
      if (!contentRef.current) return;
      const element = contentRef.current;
      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Check if user has scrolled past 80% of article content
      if (rect.bottom - windowHeight < 100) {
        markReadComplete();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [user, article, readCompleted]);

  const loadArticle = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/articles/${slug}`);
      setArticle(data);
      
      if (user) {
        const { data: bookmarks } = await api.get('/bookmarks');
        const found = bookmarks.find((b) => b.id === data.id);
        setIsBookmarked(!!found);
      }
    } catch (e) {
      console.error(e);
      navigate('/articles');
    } finally {
      setLoading(false);
    }
  };

  const markReadComplete = async () => {
    if (readCompleted || !article || !user) return;
    setReadCompleted(true);
    try {
      const { data } = await api.post(`/articles/${article.id}/read-complete`);
      if (data.awarded) {
        toast.success(`+${data.points} points for reading!`);
        refreshUser();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleBookmark = async () => {
    if (!user) {
      toast.error('Please login to bookmark');
      navigate('/login');
      return;
    }
    try {
      if (isBookmarked) {
        await api.delete(`/bookmarks/${article.id}`);
        setIsBookmarked(false);
        toast.success('Bookmark removed');
      } else {
        const { data } = await api.post(`/bookmarks/${article.id}`);
        setIsBookmarked(true);
        if (data.points_awarded) {
          toast.success('+1 point for bookmarking!');
          refreshUser();
        } else {
          toast.success('Bookmarked');
        }
      }
    } catch (e) {
      toast.error('Failed to bookmark');
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    } catch (e) {
      toast.error('Failed to copy link');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center" data-testid="article-detail-loading">
        <p className="small-caps text-jepang-muted">Loading article...</p>
      </div>
    );
  }

  if (!article) return null;

  return (
    <div className="bg-white" data-testid="article-detail-page">
      {/* Article Header */}
      <article className="px-4 md:px-8 lg:px-12 py-12">
        <div className="max-w-4xl mx-auto">
          <Link to="/articles" className="inline-flex items-center gap-2 small-caps text-jepang-muted hover:text-jepang-red mb-6" data-testid="back-to-articles">
            <ArrowLeft size={14} /> Back to Articles
          </Link>

          <div className="flex flex-wrap items-center gap-2 mb-4">
            {article.category && (
              <Link to={`/articles?category=${article.category.slug}`} className="jepang-badge-red hover:opacity-80" data-testid="article-category-badge">
                {article.category.name}
              </Link>
            )}
            {article.is_hot && <span className="jepang-badge-black">HOT</span>}
          </div>

          <h1 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl tracking-tighter mb-6 leading-[1.05]" data-testid="article-title">
            {article.title}
          </h1>

          {article.excerpt && (
            <p className="text-xl text-jepang-muted leading-relaxed mb-6 font-light" data-testid="article-excerpt">
              {article.excerpt}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 py-4 border-y border-jepang-border text-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-jepang-black text-white flex items-center justify-center font-bold text-xs">
                {article.author?.name?.charAt(0).toUpperCase() || 'J'}
              </div>
              <div>
                <p className="font-semibold text-sm">{article.author?.name || 'Jepangku'}</p>
                <p className="text-[10px] uppercase tracking-wider font-mono text-jepang-muted">AUTHOR</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-jepang-muted font-mono text-xs uppercase tracking-wider">
              <Eye size={14} strokeWidth={1.5} /> {article.view_count} VIEWS
            </div>
            {article.published_at && (
              <div className="flex items-center gap-1 text-jepang-muted font-mono text-xs uppercase tracking-wider">
                <Calendar size={14} strokeWidth={1.5} /> {new Date(article.published_at).toLocaleDateString()}
              </div>
            )}
            <div className="flex gap-2 ml-auto">
              <button
                onClick={handleBookmark}
                className={`flex items-center gap-2 px-4 py-2 border ${isBookmarked ? 'bg-jepang-red text-white border-jepang-red' : 'border-jepang-black hover:bg-jepang-black hover:text-white'} transition-colors text-xs uppercase tracking-wider font-bold`}
                data-testid="bookmark-btn"
              >
                <Bookmark size={14} strokeWidth={1.5} fill={isBookmarked ? 'currentColor' : 'none'} />
                {isBookmarked ? 'Saved' : 'Save'}
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 border border-jepang-black hover:bg-jepang-black hover:text-white transition-colors text-xs uppercase tracking-wider font-bold"
                data-testid="share-btn"
              >
                <Share2 size={14} strokeWidth={1.5} /> Share
              </button>
            </div>
          </div>

          {article.cover_image_url && (
            <div className="my-8 -mx-4 md:mx-0">
              <img src={article.cover_image_url} alt={article.title} className="w-full max-h-[600px] object-cover" />
            </div>
          )}

          <div ref={contentRef} className="article-content" data-testid="article-content" dangerouslySetInnerHTML={{ __html: article.content }} />

          {readCompleted && user && (
            <div className="mt-8 p-4 bg-jepang-red text-white flex items-center gap-3" data-testid="read-complete-banner">
              <Award size={20} strokeWidth={1.5} />
              <p className="small-caps">+2 POINTS AWARDED FOR READING</p>
            </div>
          )}

          {article.tags && article.tags.length > 0 && (
            <div className="mt-8 pt-6 border-t border-jepang-border">
              <p className="small-caps text-jepang-muted mb-3">Tags</p>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <span key={tag.id} className="jepang-badge" data-testid={`tag-${tag.slug}`}>#{tag.name}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>

      {/* Related Articles */}
      {article.related_articles && article.related_articles.length > 0 && (
        <section className="px-4 md:px-8 lg:px-12 py-12 bg-jepang-off-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-heading font-black text-2xl md:text-3xl tracking-tighter mb-6 pb-3 border-b-2 border-jepang-black">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {article.related_articles.map((rel) => (
                <ArticleCard key={rel.id} article={rel} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
