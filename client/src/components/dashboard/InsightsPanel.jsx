import React from 'react';
import { FileText, Archive, Sparkles, Share2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function InsightsPanel({ insights }) {
  if (!insights) {
    return <div>Loading insights...</div>;
  }

  const stats = [
    { label: 'Total Notes', value: insights.totalNotes || 0, icon: FileText, color: '#3b82f6' },
    { label: 'Archived Notes', value: insights.archivedNotes || 0, icon: Archive, color: '#fbbf24' },
    { label: 'AI Summaries This Week', value: insights.aiSummariesThisWeek || 0, icon: Sparkles, color: '#a78bfa' },
    { label: 'Public Notes', value: insights.publicNotes || 0, icon: Share2, color: '#22c55e' },
  ];

  const chartData = insights.weeklyActivity || [
    { day: 'Mon', notes: 0 },
    { day: 'Tue', notes: 0 },
    { day: 'Wed', notes: 0 },
    { day: 'Thu', notes: 0 },
    { day: 'Fri', notes: 0 },
    { day: 'Sat', notes: 0 },
    { day: 'Sun', notes: 0 },
  ];

  return (
    <div style={{ flex: 1, backgroundColor: 'var(--bg-primary)', padding: '32px', overflowY: 'auto' }}>
      <div style={{ maxWidth: '1280px', marginLeft: 'auto', marginRight: 'auto' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: 'white', marginBottom: '32px' }}>Dashboard</h1>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '48px' }}>
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="card"
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '8px' }}>{stat.label}</p>
                    <p style={{ fontSize: '32px', fontWeight: 'bold', color: 'white' }}>{stat.value}</p>
                  </div>
                  <Icon style={{ width: '32px', height: '32px', color: stat.color }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Weekly Activity Chart */}
        <div className="card" style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'white', marginBottom: '24px' }}>Weekly Activity</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="day" stroke="var(--text-secondary)" />
              <YAxis stroke="var(--text-secondary)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: 'white',
                }}
              />
              <Bar dataKey="notes" fill="var(--accent)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Tags */}
        {insights.topTags && insights.topTags.length > 0 && (
          <div className="card" style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'white', marginBottom: '24px' }}>Top Tags</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {insights.topTags.map((tag) => (
                <div key={tag.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{tag.name}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '128px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', height: '8px', overflow: 'hidden' }}>
                      <div
                        style={{
                          backgroundColor: 'var(--accent)',
                          height: '100%',
                          width: `${(tag.count / (insights.topTags[0]?.count || 1)) * 100}%`,
                        }}
                      />
                    </div>
                    <span style={{ color: 'white', fontWeight: '500', width: '32px', textAlign: 'right' }}>{tag.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recently Edited */}
        {insights.recentlyEdited && insights.recentlyEdited.length > 0 && (
          <div className="card">
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'white', marginBottom: '24px' }}>Recently Edited</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {insights.recentlyEdited.map((note) => (
                <div
                  key={note.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px',
                    backgroundColor: 'var(--bg-tertiary)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'background-color 150ms ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
                >
                  <span style={{ color: 'var(--text-secondary)' }}>{note.title || 'Untitled'}</span>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{note.updatedAt}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
