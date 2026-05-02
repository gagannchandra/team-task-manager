import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import './ProjectDetail.css';

const STATUS_COLS = [
  { key: 'todo', label: 'To Do', color: 'var(--gray-400)' },
  { key: 'in_progress', label: 'In Progress', color: 'var(--blue-500)' },
  { key: 'done', label: 'Done', color: 'var(--green-500)' },
];

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [error, setError] = useState('');

  const [taskForm, setTaskForm] = useState({ title: '', description: '', dueDate: '', priority: 'medium', assigneeId: '' });
  const [saving, setSaving] = useState(false);

  const [memberEmail, setMemberEmail] = useState('');
  const [addingMember, setAddingMember] = useState(false);
  const [memberError, setMemberError] = useState('');

  const isAdmin = project?.myRole === 'admin';

  const fetchData = async () => {
    try {
      const [projData, taskData] = await Promise.all([api.getProject(id), api.getTasks(id)]);
      setProject(projData.project);
      setTasks(taskData.tasks);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  const openCreateTask = () => {
    setEditTask(null);
    setTaskForm({ title: '', description: '', dueDate: '', priority: 'medium', assigneeId: '' });
    setError('');
    setShowTaskModal(true);
  };

  const openEditTask = (task) => {
    setEditTask(task);
    setTaskForm({
      title: task.title,
      description: task.description || '',
      dueDate: task.dueDate || '',
      priority: task.priority,
      assigneeId: task.assigneeId || '',
      status: task.status,
    });
    setError('');
    setShowTaskModal(true);
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const body = { ...taskForm };
      if (body.assigneeId === '') body.assigneeId = null;
      if (body.dueDate === '') body.dueDate = null;
      if (editTask) {
        await api.updateTask(id, editTask.id, body);
      } else {
        await api.createTask(id, body);
      }
      setShowTaskModal(false);
      fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (task, newStatus) => {
    try {
      await api.updateTask(id, task.id, { status: newStatus });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.deleteTask(id, taskId);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setMemberError('');
    setAddingMember(true);
    try {
      await api.addMember(id, { email: memberEmail });
      setMemberEmail('');
      fetchData();
    } catch (err) {
      setMemberError(err.message);
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remove this member?')) return;
    try {
      await api.removeMember(id, userId);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="page-container"><div className="loader"></div></div>;
  if (!project) return <div className="page-container"><div className="alert alert-error">Project not found</div></div>;

  const members = project.projectMembers || [];
  const isOverdue = (task) => task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';

  return (
    <div className="page-container">
      <div className="page-header">
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/projects')} style={{ marginBottom: 12 }}>Back</button>
        <div className="flex-between">
          <div>
            <h1 className="page-title">{project.name}</h1>
            <p className="page-subtitle">{project.description || 'No description'}</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {isAdmin && <button className="btn btn-secondary" onClick={() => { setMemberError(''); setShowMemberModal(true); }}>Members</button>}
            {isAdmin && <button id="create-task-btn" className="btn btn-primary" onClick={openCreateTask}>+ Add Task</button>}
          </div>
        </div>
      </div>

      <div className="kanban-board">
        {STATUS_COLS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.key);
          return (
            <div key={col.key} className="kanban-col">
              <div className="kanban-col-header">
                <span className="kanban-col-label">
                  <span className="kanban-dot" style={{ background: col.color }}></span>
                  {col.label}
                </span>
                <span className="kanban-col-count">{colTasks.length}</span>
              </div>
              <div className="kanban-col-body">
                {colTasks.length === 0 && <div className="kanban-empty">No tasks</div>}
                {colTasks.map((task) => (
                  <div key={task.id} className={`task-card ${isOverdue(task) ? 'task-overdue' : ''}`} onClick={() => isAdmin && openEditTask(task)}>
                    <div className="task-card-top">
                      <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                      {isAdmin && (
                        <button className="task-delete" onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }} title="Delete">&times;</button>
                      )}
                    </div>
                    <h4 className="task-card-title">{task.title}</h4>
                    {task.description && <p className="task-card-desc">{task.description}</p>}
                    <div className="task-card-footer">
                      <div className="task-card-assignee">
                        {task.assignee ? (
                          <><span className="task-avatar">{task.assignee.name.charAt(0)}</span> {task.assignee.name}</>
                        ) : (
                          <span className="task-unassigned">Unassigned</span>
                        )}
                      </div>
                      {task.dueDate && (
                        <span className={`task-due ${isOverdue(task) ? 'overdue' : ''}`}>
                          {new Date(task.dueDate).toLocaleDateString('en-GB')}
                        </span>
                      )}
                    </div>
                    {!isAdmin && task.status !== 'done' && (
                      <div className="task-card-actions" onClick={(e) => e.stopPropagation()}>
                        {task.status === 'todo' && <button className="btn btn-sm btn-secondary" onClick={() => handleStatusChange(task, 'in_progress')}>Start</button>}
                        {task.status === 'in_progress' && <button className="btn btn-sm btn-primary" onClick={() => handleStatusChange(task, 'done')}>Complete</button>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {showTaskModal && (
        <div className="modal-overlay" onClick={() => setShowTaskModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editTask ? 'Edit Task' : 'Create Task'}</h2>
              <button className="modal-close" onClick={() => setShowTaskModal(false)}>&times;</button>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleTaskSubmit}>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input className="form-input" value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input form-textarea" value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select className="form-input form-select" value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Due Date</label>
                  <input type="date" className="form-input" value={taskForm.dueDate} onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Assign To</label>
                <select className="form-input form-select" value={taskForm.assigneeId} onChange={(e) => setTaskForm({ ...taskForm, assigneeId: e.target.value })}>
                  <option value="">Unassigned</option>
                  {members.map((m) => <option key={m.user?._id || m.userId} value={m.user?._id || m.userId}>{m.user?.name} ({m.user?.email})</option>)}
                </select>
              </div>
              {editTask && (
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-input form-select" value={taskForm.status} onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}>
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              )}
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowTaskModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : editTask ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showMemberModal && (
        <div className="modal-overlay" onClick={() => setShowMemberModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Team Members</h2>
              <button className="modal-close" onClick={() => setShowMemberModal(false)}>&times;</button>
            </div>
            <div className="member-list" style={{ marginBottom: 24 }}>
              {members.map((m) => (
                <div key={m.user?._id || m.userId} className="member-row">
                  <div className="member-avatar">{m.user?.name?.charAt(0).toUpperCase()}</div>
                  <div className="member-info">
                    <div className="member-name">{m.user?.name}</div>
                    <div className="member-email">{m.user?.email}</div>
                  </div>
                  <span className={`badge badge-${m.role}`}>{m.role}</span>
                  {m.role !== 'admin' && (
                    <button className="btn btn-danger btn-sm" onClick={() => handleRemoveMember(m.user?._id || m.userId)}>Remove</button>
                  )}
                </div>
              ))}
            </div>
            {memberError && <div className="alert alert-error">{memberError}</div>}
            <form onSubmit={handleAddMember}>
              <div className="form-group">
                <label className="form-label">Add Member by Email</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input className="form-input" type="email" placeholder="user@example.com" value={memberEmail} onChange={(e) => setMemberEmail(e.target.value)} required />
                  <button type="submit" className="btn btn-primary" disabled={addingMember} style={{ whiteSpace: 'nowrap' }}>
                    {addingMember ? '...' : 'Add'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
