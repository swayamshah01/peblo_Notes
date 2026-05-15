import React from 'react';
import { Link } from 'react-router-dom';
import { Archive, ArrowRight, CheckCircle2, LayoutDashboard, Lock, Moon, Search, Share2, Sparkles, Sun } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export function Landing() {
  const { token } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const workspaceLink = token ? '/dashboard' : '/signup';

  return (
    <main className="landing-page">
      <nav className="landing-nav">
        <Link to="/" className="brand-link">
          <span>Peblo</span> Notes
        </Link>
        <div className="landing-nav-actions">
          <button
            onClick={toggleTheme}
            className="icon-button"
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          {token ? (
            <Link to="/dashboard" className="btn btn-primary">Open dashboard</Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">Sign in</Link>
              <Link to="/signup" className="btn btn-primary">Get started</Link>
            </>
          )}
        </div>
      </nav>

      <section className="landing-hero">
        <div className="landing-copy">
          <p className="eyebrow">Private notes with clean sharing</p>
          <h1>Peblo Notes</h1>
          <p className="hero-text">
            Capture ideas, organize them with tags, archive finished work, and share public links only when you mean to.
          </p>
          <div className="hero-actions">
            <Link to={workspaceLink} className="btn btn-primary hero-button">
              {token ? 'Go to dashboard' : 'Create free account'}
              <ArrowRight size={18} />
            </Link>
            <Link to={token ? '/dashboard' : '/login'} className="btn btn-ghost hero-button">
              {token ? 'View dashboard' : 'Sign in'}
            </Link>
          </div>
        </div>

        <div className="product-preview" aria-label="Peblo Notes workspace preview">
          <div className="preview-sidebar">
            <div className="preview-search"><Search size={14} />Search notes</div>
            <div className="preview-note active">
              <strong>Launch notes</strong>
              <span>Share checklist and final edits...</span>
            </div>
            <div className="preview-note">
              <strong>Research clips</strong>
              <span>Tagged ideas for the dashboard</span>
            </div>
            <div className="preview-note">
              <strong>Archived draft</strong>
              <span>Restorable, never confused with delete</span>
            </div>
          </div>
          <div className="preview-editor">
            <div className="preview-toolbar">
              <span className="preview-title">Launch notes</span>
              <div className="preview-icons">
                <Share2 size={17} />
                <Sparkles size={17} />
                <Archive size={17} />
              </div>
            </div>
            <div className="preview-lines">
              <span />
              <span />
              <span className="short" />
            </div>
            <div className="preview-tags">
              <span>product</span>
              <span>share-ready</span>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-features">
        <div><CheckCircle2 size={20} /><span>Autosaved writing</span></div>
        <div><Share2 size={20} /><span>Public links you control</span></div>
        <div><Archive size={20} /><span>Archive and restore</span></div>
        <div><LayoutDashboard size={20} /><span>Workspace insights</span></div>
        <div><Lock size={20} /><span>Protected private notes</span></div>
      </section>
    </main>
  );
}
