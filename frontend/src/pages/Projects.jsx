import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './Projects.css';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchProjects = () => {
    api.getProjects().then((d) => setProjects(d.projects)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(fetchProjects, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setCreating(true);
    try {
      await api.createProject({ name, description });
      setShowModal(false);
      setName('');
      setDescription('');
      fetchProjects();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <div className="page-container"><div className="loader"></div></div>;

  return (
    <div className="page-container">
      <div className="page-header flex-between">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">Manage your team projects</p>
        </div>
        <button id="create-project-btn" className="btn btn-primary" onClick={() => setShowModal(true)}>
          + New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-state-title">No projects yet</div>
          <div className="empty-state-text">Create your first project to get started</div>
        </div>
      ) : (
        <div className="grid-2">
          {projects.map((project) => (
            <Link to={`/projects/${project.id}`} key={project.id} className="project-card">
              <div className="project-card-header">
                <h3 className="project-card-name">{project.name}</h3>
                <span className={`badge badge-${project.myRole}`}>{project.myRole}</span>
              </div>
              <p className="project-card-desc">{project.description || 'No description'}</p>
              <div className="project-card-footer">
                <span className="project-card-members">{project.projectMembers?.length || 0} member{(project.projectMembers?.length || 0) !== 1 ? 's' : ''}</span>
                <span className="project-card-date">{new Date(project.createdAt).toLocaleDateString('en-GB')}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Create Project</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Project Name</label>
                <input id="project-name" className="form-input" placeholder="My Awesome Project"
                  value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Description (optional)</label>
                <textarea id="project-description" className="form-input form-textarea" placeholder="What's this project about?"
                  value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button id="project-submit" type="submit" className="btn btn-primary" disabled={creating}>
                  {creating ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
