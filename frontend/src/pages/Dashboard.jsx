import { useState, useEffect } from 'react';
import api from '../services/api';
import './Dashboard.css';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getStats().then(setStats).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-container"><div className="loader"></div></div>;

  const statusLabels = { todo: 'To Do', in_progress: 'In Progress', done: 'Done' };
  const statusColors = { todo: 'var(--gray-400)', in_progress: 'var(--blue-500)', done: 'var(--green-500)' };

  const totalForPercent = stats?.totalTasks || 1;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Overview of your tasks and projects</p>
      </div>

      <div className="grid-4 dash-stats">
        <div className="stat-card">
          <div className="stat-value">{stats?.projectCount || 0}</div>
          <div className="stat-label">Projects</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.totalTasks || 0}</div>
          <div className="stat-label">Total Tasks</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.byStatus?.done || 0}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-value stat-value-overdue">{stats?.overdueTasks || 0}</div>
          <div className="stat-label">Overdue</div>
        </div>
      </div>

      <div className="dash-grid">
        <div className="dash-section">
          <h2 className="dash-section-title">Tasks by Status</h2>
          <div className="status-bars">
            {Object.entries(statusLabels).map(([key, label]) => {
              const count = stats?.byStatus?.[key] || 0;
              const pct = Math.round((count / totalForPercent) * 100);
              return (
                <div key={key} className="status-bar-row">
                  <div className="status-bar-label">
                    <span>{label}</span>
                    <span className="status-bar-count">{count}</span>
                  </div>
                  <div className="status-bar-track">
                    <div className="status-bar-fill" style={{ width: `${pct}%`, background: statusColors[key] }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="dash-section">
          <h2 className="dash-section-title">Tasks by Priority</h2>
          <div className="priority-grid">
            {[
              { key: 'high', label: 'High', color: 'var(--red-500)' },
              { key: 'medium', label: 'Medium', color: 'var(--amber-500)' },
              { key: 'low', label: 'Low', color: 'var(--green-500)' },
            ].map((p) => (
              <div key={p.key} className="priority-item">
                <span className="priority-dot" style={{ background: p.color }}></span>
                <span className="priority-count" style={{ color: p.color }}>{stats?.byPriority?.[p.key] || 0}</span>
                <span className="priority-label">{p.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="dash-section">
          <h2 className="dash-section-title">Tasks per Team Member</h2>
          {stats?.tasksByUser?.length > 0 ? (
            <div className="member-list">
              {stats.tasksByUser.map((item, i) => (
                <div key={i} className="member-row">
                  <div className="member-avatar">{item.user?.name?.charAt(0).toUpperCase()}</div>
                  <div className="member-info">
                    <div className="member-name">{item.user?.name}</div>
                    <div className="member-email">{item.user?.email}</div>
                  </div>
                  <div className="member-count">{item.count} task{item.count !== 1 ? 's' : ''}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state"><div className="empty-state-text">No task assignments yet</div></div>
          )}
        </div>

        <div className="dash-section">
          <h2 className="dash-section-title">Recent Tasks</h2>
          {stats?.recentTasks?.length > 0 ? (
            <div className="recent-tasks">
              {stats.recentTasks.map((task) => (
                <div key={task.id} className="recent-task-row">
                  <div className="recent-task-info">
                    <div className="recent-task-title">{task.title}</div>
                    <div className="recent-task-meta">
                      {task.assignee ? `Assigned to ${task.assignee.name}` : 'Unassigned'}
                    </div>
                  </div>
                  <span className={`badge badge-${task.status.replace('_', '-')}`}>
                    {statusLabels[task.status]}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state"><div className="empty-state-text">No tasks yet</div></div>
          )}
        </div>
      </div>
    </div>
  );
}
