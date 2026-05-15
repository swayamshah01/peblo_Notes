import React from 'react';
import { Archive, ArrowRight, FileText, Share2, Sparkles, Tags } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Link } from 'react-router-dom';

export function InsightsPanel({ insights }) {
  if (!insights) {
    return <div className="dashboard-shell">Loading insights...</div>;
  }

  const stats = [
    { label: 'Active notes', value: insights.totalNotes, icon: FileText, tone: 'blue' },
    { label: 'Public links', value: insights.publicNotes, icon: Share2, tone: 'green' },
    { label: 'Archived', value: insights.archivedNotes, icon: Archive, tone: 'amber' },
    { label: 'AI runs this week', value: insights.aiSummariesThisWeek, icon: Sparkles, tone: 'violet' },
  ];

  const chartData = insights.weeklyActivity?.length ? insights.weeklyActivity : [
    { day: 'Mon', notes: 0 },
    { day: 'Tue', notes: 0 },
    { day: 'Wed', notes: 0 },
    { day: 'Thu', notes: 0 },
    { day: 'Fri', notes: 0 },
    { day: 'Sat', notes: 0 },
    { day: 'Sun', notes: 0 },
  ];

  const topCount = insights.topTags?.[0]?.count || 1;

  return (
    <div className="dashboard-shell">
      <div className="dashboard-header">
        <div>
          <p className="eyebrow dashboard-eyebrow">Workspace command center</p>
          <h1>Dashboard</h1>
          <p>Track note volume, shared work, archive hygiene, and weekly writing momentum.</p>
        </div>
        <Link to="/workspace" className="btn btn-primary hero-button">
          Open workspace
          <ArrowRight size={18} />
        </Link>
      </div>

      <section className="metric-grid">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <article key={stat.label} className={`metric-card tone-${stat.tone}`}>
              <div className="metric-icon"><Icon size={22} /></div>
              <span>{stat.label}</span>
              <strong>{stat.value || 0}</strong>
            </article>
          );
        })}
      </section>

      <section className="dashboard-grid">
        <article className="dashboard-panel chart-panel">
          <div className="panel-heading">
            <div>
              <h2>Weekly activity</h2>
              <p>Notes created over the last seven days.</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={310}>
            <BarChart data={chartData}>
              <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
              <XAxis dataKey="day" stroke="var(--text-muted)" tickLine={false} axisLine={false} />
              <YAxis stroke="var(--text-muted)" tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                cursor={{ fill: 'var(--accent-soft)' }}
                contentStyle={{
                  backgroundColor: 'var(--surface-elevated)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                }}
              />
              <Bar dataKey="notes" fill="var(--accent)" radius={[7, 7, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </article>

        <article className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <h2>Top tags</h2>
              <p>Your most used active-note labels.</p>
            </div>
            <Tags size={20} />
          </div>
          <div className="tag-rank-list">
            {insights.topTags?.length ? insights.topTags.map((tag) => (
              <div className="tag-rank" key={tag.name}>
                <div>
                  <strong>{tag.name}</strong>
                  <span>{tag.count} notes</span>
                </div>
                <div className="rank-track">
                  <span style={{ width: `${(tag.count / topCount) * 100}%` }} />
                </div>
              </div>
            )) : (
              <div className="quiet-state">No tags yet.</div>
            )}
          </div>
        </article>
      </section>

      <section className="dashboard-panel recent-panel">
        <div className="panel-heading">
          <div>
            <h2>Recently edited</h2>
            <p>The latest notes touched in this workspace.</p>
          </div>
        </div>
        <div className="recent-list">
          {insights.recentlyEdited?.length ? insights.recentlyEdited.map((note) => (
            <div className="recent-row" key={note.id}>
              <div>
                <strong>{note.title || 'Untitled'}</strong>
                <span>{note.isArchived ? 'Archived' : 'Active'}</span>
              </div>
              <time>{note.updatedAtLabel}</time>
            </div>
          )) : (
            <div className="quiet-state">No recent notes yet.</div>
          )}
        </div>
      </section>
    </div>
  );
}
