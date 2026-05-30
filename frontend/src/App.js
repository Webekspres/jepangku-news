import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// Public Pages
import HomePage from '@/pages/HomePage';
import ArticleListPage from '@/pages/ArticleListPage';
import ArticleDetailPage from '@/pages/ArticleDetailPage';
import QuizListPage from '@/pages/QuizListPage';
import QuizDetailPage from '@/pages/QuizDetailPage';
import PollListPage from '@/pages/PollListPage';
import PollDetailPage from '@/pages/PollDetailPage';
import LeaderboardPage from '@/pages/LeaderboardPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';

// User Pages
import ProfilePage from '@/pages/ProfilePage';
import MyArticlesPage from '@/pages/MyArticlesPage';
import SubmitArticlePage from '@/pages/SubmitArticlePage';
import BookmarksPage from '@/pages/BookmarksPage';
import PointsHistoryPage from '@/pages/PointsHistoryPage';

// Admin Pages
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminReviewArticles from '@/pages/admin/AdminReviewArticles';
import AdminArticlesPage from '@/pages/admin/AdminArticlesPage';
import AdminCreateQuiz from '@/pages/admin/AdminCreateQuiz';
import AdminCreatePoll from '@/pages/admin/AdminCreatePoll';

import '@/App.css';

function AppLayout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ style: { background: '#0A0A0A', color: '#fff', borderRadius: 0, border: '1px solid #D90429' } }} />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<AppLayout><HomePage /></AppLayout>} />
          <Route path="/articles" element={<AppLayout><ArticleListPage /></AppLayout>} />
          <Route path="/articles/:slug" element={<AppLayout><ArticleDetailPage /></AppLayout>} />
          <Route path="/quizzes" element={<AppLayout><QuizListPage /></AppLayout>} />
          <Route path="/quizzes/:slug" element={<AppLayout><QuizDetailPage /></AppLayout>} />
          <Route path="/polls" element={<AppLayout><PollListPage /></AppLayout>} />
          <Route path="/polls/:slug" element={<AppLayout><PollDetailPage /></AppLayout>} />
          <Route path="/leaderboard" element={<AppLayout><LeaderboardPage /></AppLayout>} />

          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* User Routes */}
          <Route path="/profile" element={<ProtectedRoute><AppLayout><ProfilePage /></AppLayout></ProtectedRoute>} />
          <Route path="/my-articles" element={<ProtectedRoute><AppLayout><MyArticlesPage /></AppLayout></ProtectedRoute>} />
          <Route path="/submit-article" element={<ProtectedRoute><AppLayout><SubmitArticlePage /></AppLayout></ProtectedRoute>} />
          <Route path="/edit-article/:id" element={<ProtectedRoute><AppLayout><SubmitArticlePage /></AppLayout></ProtectedRoute>} />
          <Route path="/bookmarks" element={<ProtectedRoute><AppLayout><BookmarksPage /></AppLayout></ProtectedRoute>} />
          <Route path="/points" element={<ProtectedRoute><AppLayout><PointsHistoryPage /></AppLayout></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute requireAdmin><AppLayout><AdminDashboard /></AppLayout></ProtectedRoute>} />
          <Route path="/admin/articles" element={<ProtectedRoute requireAdmin><AppLayout><AdminArticlesPage /></AppLayout></ProtectedRoute>} />
          <Route path="/admin/articles/review" element={<ProtectedRoute requireAdmin><AppLayout><AdminReviewArticles /></AppLayout></ProtectedRoute>} />
          <Route path="/admin/quizzes/create" element={<ProtectedRoute requireAdmin><AppLayout><AdminCreateQuiz /></AppLayout></ProtectedRoute>} />
          <Route path="/admin/polls/create" element={<ProtectedRoute requireAdmin><AppLayout><AdminCreatePoll /></AppLayout></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
