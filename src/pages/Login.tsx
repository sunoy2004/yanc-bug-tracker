import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PROJECTS, type ProjectKey } from '@/config/projects';
import { useProject } from '@/context/ProjectContext';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { setProjectKey } = useProject();
  const [selectedKey, setSelectedKey] = useState<ProjectKey>('yanc_website');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKey) return;

    const expectedPasswords: Record<ProjectKey, string> = {
      yanc_website: 'password_website',
      yanc_cote: 'password_cote',
      yanc_cms: 'password_cms',
      yanc_mentor_mentee: 'password_mentormentee',
    };

    const expected = expectedPasswords[selectedKey];
    if (password !== expected) {
      setError('Incorrect password for selected project.');
      return;
    }

    setError('');
    setProjectKey(selectedKey);
    navigate('/');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="grid min-h-screen grid-cols-1 md:grid-cols-2 bg-background"
    >
      {/* Left full-height dark panel (desktop/tablet only) */}
      <div className="relative hidden md:flex flex-col justify-center px-6 md:px-10 py-10 bg-gradient-to-b from-primary/90 to-slate-900 text-primary-foreground">
        <div className="space-y-6 max-w-lg">
          <div className="flex items-center gap-3">
            <div className="relative w-14 h-14 rounded-full bg-white border border-primary/40 flex items-center justify-center shadow-card">
              <img
                src="/favicon2.png"
                alt="BugTracker"
                className="w-10 h-10 object-contain"
                onError={e => {
                  (e.target as HTMLImageElement).src = '/favicon.png';
                }}
              />
            </div>
            <div className="min-w-0">
              <p className="text-base md:text-lg opacity-80">Welcome to</p>
              <h1 className="text-3xl md:text-4xl font-semibold leading-tight">YANC Bug Tracker</h1>
            </div>
          </div>
          <p className="text-sm md:text-base leading-relaxed opacity-90">
            Track, prioritize, and resolve issues across your YANC projects with a unified, developer-friendly
            interface.
          </p>
        </div>
        <div className="mt-4 flex items-center gap-3 text-xs md:text-sm opacity-80">
          <span>© {new Date().getFullYear()} YANC</span>
          <span>• Bug Tracking Workspace</span>
        </div>
      </div>

      {/* Right full-height light form panel (always visible, full-width on small screens) */}
      <div className="flex items-center justify-center bg-card px-6 py-10 sm:px-16">
        <div className="w-full max-w-md">
          {/* Mobile welcome strip */}
          <div className="mb-6 flex items-center gap-3 md:hidden">
            <div className="relative w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <img
                src="/favicon2.png"
                alt="BugTracker"
                className="w-7 h-7 object-contain"
                onError={e => {
                  (e.target as HTMLImageElement).src = '/favicon.png';
                }}
              />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Welcome to</p>
              <h1 className="text-lg font-semibold text-foreground leading-tight">YANC Bug Tracker</h1>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-semibold text-foreground">Select project</h2>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Choose which YANC workspace you want to manage, then enter the project password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="project" className="block text-sm font-medium text-foreground mb-1.5">
                Project <span className="text-destructive">*</span>
              </label>
              <select
                id="project"
                value={selectedKey}
                onChange={e => setSelectedKey(e.target.value as ProjectKey)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                required
              >
                {PROJECTS.map(p => (
                  <option key={p.key} value={p.key}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">
                Password <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  placeholder="Enter project password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
            </div>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:shadow-lg hover:shadow-primary/20 transition-all duration-200 focus-ring"
            >
              Continue to workspace
            </button>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default Login;

