import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, LogOut, Zap } from 'lucide-react';
import { apiClient } from '../services/api/client';
import { useAuthStore } from '../store';
import { Logger } from '../utils/helpers';

const logger = Logger.getInstance();

interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { userCredits, setAuth } = useAuthStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [showNewForm, setShowNewForm] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const projects = await apiClient.getProjects();
      setProjects(projects || []);
      setError(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load projects';
      setError(errorMsg);
      logger.error('Error loading projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) {
      setError('Project name is required');
      return;
    }

    setCreating(true);
    try {
      const { id } = await apiClient.createProject(newProjectName);
      setProjects([...projects, { id, name: newProjectName, createdAt: new Date().toISOString() }]);
      setNewProjectName('');
      setShowNewForm(false);
      setError(null);
      logger.info(`Created new project: ${newProjectName}`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create project';
      setError(errorMsg);
      logger.error('Error creating project:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      await apiClient.deleteProject(projectId);
      setProjects(projects.filter(p => p.id !== projectId));
      logger.info(`Deleted project: ${projectId}`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete project';
      setError(errorMsg);
      logger.error('Error deleting project:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setAuth({
      userId: '',
      email: '',
      userCredits: 0,
      isAuthenticated: false,
    });
    navigate('/login');
  };

  const handleNewGeneration = (projectId: string) => {
    navigate(`/workflow?projectId=${projectId}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <div className="bg-slate-700 border-b border-slate-600">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Projects</h1>
              <p className="text-gray-400 mt-1">Manage your video generation projects</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-slate-600 px-4 py-2 rounded-lg">
                <Zap className="w-5 h-5 text-yellow-400" />
                <span className="text-white font-semibold">{userCredits} Credits</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {error && (
          <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* New Project Form */}
        {showNewForm && (
          <div className="bg-slate-700 rounded-lg shadow-lg p-6 mb-8 border border-slate-600">
            <h2 className="text-xl font-bold text-white mb-4">Create New Project</h2>
            <form onSubmit={handleCreateProject} className="flex gap-3">
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Project name"
                className="flex-1 px-4 py-2 bg-slate-600 border border-slate-500 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={creating}
              />
              <button
                type="submit"
                disabled={creating}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold px-6 py-2 rounded transition-colors"
              >
                {creating ? 'Creating...' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => setShowNewForm(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold px-6 py-2 rounded transition-colors"
              >
                Cancel
              </button>
            </form>
          </div>
        )}

        {/* Create Project Button */}
        {!showNewForm && (
          <button
            onClick={() => setShowNewForm(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg mb-8 transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Project
          </button>
        )}

        {/* Projects Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin">
              <div className="w-12 h-12 border-4 border-slate-600 border-t-blue-500 rounded-full"></div>
            </div>
            <p className="text-gray-400 mt-4">Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-slate-700 rounded-lg border border-slate-600 p-12 text-center">
            <p className="text-gray-400 text-lg">No projects yet. Create your first project to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(project => (
              <div key={project.id} className="bg-slate-700 rounded-lg shadow-lg border border-slate-600 p-6 hover:border-blue-500 transition-colors">
                <h3 className="text-xl font-bold text-white mb-2">{project.name}</h3>
                {project.description && (
                  <p className="text-gray-400 text-sm mb-4">{project.description}</p>
                )}
                <p className="text-gray-500 text-xs mb-4">
                  Created {formatDate(project.createdAt)}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleNewGeneration(project.id)}
                    className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    New Video
                  </button>
                  <button
                    onClick={() => handleDeleteProject(project.id)}
                    className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
