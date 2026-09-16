import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  TrendingUp, 
  LayoutDashboard, 
  Receipt, 
  Sparkles, 
  FileText, 
  User, 
  LogOut, 
  LogIn, 
  UserPlus, 
  Home, 
  Menu, 
  X,
  Sun,
  Moon,
  Compass
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="sticky top-0 z-50 transition-all duration-300">
      <nav 
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-300 ${
          isDark 
            ? 'bg-[#0B0B0B]/85 backdrop-blur-md border-b border-[rgba(255,255,255,0.06)] shadow-lg' 
            : 'my-3 mx-3 sm:mx-6 lg:mx-8 rounded-2xl bg-white/85 backdrop-blur-[20px] border border-[#E5E7EB] shadow-xl shadow-black/5'
        }`}
      >
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-xl bg-[var(--card-bg)] border border-[var(--accent-gold)]/50 text-[var(--accent-gold)] flex items-center justify-center font-bold shadow-md group-hover:border-[var(--accent-gold)] group-hover:scale-105 transition-all">
              <TrendingUp className="w-4 h-4 text-[var(--accent-gold)]" strokeWidth={2.5} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-[var(--text-primary)]">FinNova</span>
              <span className="px-2 py-0.5 rounded-full bg-[var(--accent-gold)]/15 text-[var(--accent-gold)] border border-[var(--accent-gold)]/30 text-[9px] font-bold uppercase tracking-widest">
                AI Wealth
              </span>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center gap-6">
            {!isAuthenticated ? (
              <>
                <NavLink to="/" active={isActive('/')} icon={<Home className="w-3.5 h-3.5" />} label="Home" />
                <NavLink to="/login" active={isActive('/login')} icon={<LogIn className="w-3.5 h-3.5" />} label="Login" />
                <div className="ml-2">
                  <Link
                    to="/register"
                    className="btn-primary text-xs px-4 py-2"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Get started</span>
                  </Link>
                </div>
              </>
            ) : (
              <>
                <NavLink to="/dashboard" active={isActive('/dashboard')} icon={<LayoutDashboard className="w-3.5 h-3.5" />} label="Dashboard" />
                <NavLink to="/financial-compass" active={isActive('/financial-compass') || isActive('/beginner-mode')} icon={<Compass className="w-3.5 h-3.5 text-[var(--accent-gold)]" />} label="Financial Compass" title="Start your personalized financial learning journey." />
                <NavLink to="/transactions" active={isActive('/transactions')} icon={<Receipt className="w-3.5 h-3.5" />} label="Transactions" />
                <NavLink to="/ai-insights" active={isActive('/ai-insights')} icon={<Sparkles className="w-3.5 h-3.5 text-[var(--accent-gold)]" />} label="AI Assistant" />
                <NavLink to="/reports" active={isActive('/reports')} icon={<FileText className="w-3.5 h-3.5" />} label="Reports" />
                <NavLink to="/profile" active={isActive('/profile')} icon={<User className="w-3.5 h-3.5" />} label="Profile" />
              </>
            )}

            {/* Theme Toggle & User Info */}
            <div className="flex items-center gap-3 pl-3 border-l border-[var(--card-border)]">
              {/* Sun / Moon Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                className="p-2 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--accent-gold)] hover:border-[var(--accent-gold)] hover:scale-105 transition-all shadow-sm cursor-pointer"
              >
                <motion.div
                  key={theme}
                  initial={{ rotate: -90, scale: 0.7, opacity: 0 }}
                  animate={{ rotate: 0, scale: 1, opacity: 1 }}
                  exit={{ rotate: 90, scale: 0.7, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-[#C9A227]" />}
                </motion.div>
              </button>

              {isAuthenticated && (
                <>
                  <div className="hidden lg:flex flex-col items-end">
                    <span className="text-xs font-semibold text-[var(--text-primary)] leading-tight">{user?.fullName}</span>
                    <span className="text-[10px] text-[var(--accent-gold)] font-mono leading-tight font-medium">₹ INR</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    title="Logout"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-[var(--text-secondary)] hover:text-[#EF4444] hover:bg-[#EF4444]/10 border border-transparent hover:border-[#EF4444]/20 transition-all"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden lg:inline">Logout</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu toggle */}
          <div className="flex items-center gap-2 md:hidden">
            {/* Theme Toggle Button for Mobile */}
            <button
              onClick={toggleTheme}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              className="p-2 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--accent-gold)]"
            >
              {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-[#C9A227]" />}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--card-bg)] border border-[var(--card-border)] transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[var(--bg-secondary)] border-b border-[var(--card-border)] px-4 py-4 space-y-2 animate-in slide-in-from-top duration-200">
          {!isAuthenticated ? (
            <>
              <MobileNavLink to="/" onClick={() => setMobileMenuOpen(false)} label="Home" />
              <MobileNavLink to="/login" onClick={() => setMobileMenuOpen(false)} label="Login" />
              <div className="pt-2">
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-primary w-full text-xs py-3 justify-center"
                >
                  <UserPlus className="w-4 h-4" /> Get started
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 px-3.5 py-3 mb-2 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)]">
                <div className="w-8 h-8 rounded-xl bg-[var(--accent-gold)]/15 border border-[var(--accent-gold)]/30 text-[var(--accent-gold)] flex items-center justify-center text-xs font-bold">
                  {user?.fullName?.charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-semibold text-[var(--text-primary)] leading-tight">{user?.fullName}</p>
                  <p className="text-[11px] text-[var(--text-secondary)] leading-tight">{user?.email}</p>
                </div>
              </div>
              <MobileNavLink to="/dashboard" onClick={() => setMobileMenuOpen(false)} label="Dashboard" />
              <MobileNavLink to="/financial-compass" onClick={() => setMobileMenuOpen(false)} label="Financial Compass" />
              <MobileNavLink to="/transactions" onClick={() => setMobileMenuOpen(false)} label="Transactions" />
              <MobileNavLink to="/ai-insights" onClick={() => setMobileMenuOpen(false)} label="AI Assistant" />
              <MobileNavLink to="/reports" onClick={() => setMobileMenuOpen(false)} label="Reports" />
              <MobileNavLink to="/profile" onClick={() => setMobileMenuOpen(false)} label="Profile" />
              <div className="pt-2 border-t border-[var(--card-border)] mt-2 flex items-center justify-between">
                <button
                  onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function NavLink({ to, active, icon, label }) {
  return (
    <Link
      to={to}
      className={`relative flex items-center gap-2 py-2 text-xs font-semibold transition-all duration-200 group ${
        active 
          ? 'text-[var(--accent-gold)]' 
          : 'text-[var(--text-secondary)] hover:text-[var(--accent-gold)]'
      }`}
    >
      {icon}
      <span>{label}</span>
      {/* Gold Underline Indicator for Active Item */}
      {active ? (
        <span className="absolute -bottom-3.5 left-0 right-0 h-0.5 bg-[var(--accent-gold)] rounded-full shadow-sm" />
      ) : (
        <span className="absolute -bottom-3.5 left-0 right-0 h-0.5 bg-[var(--accent-gold)] rounded-full opacity-0 group-hover:opacity-60 transition-opacity" />
      )}
    </Link>
  );
}

function MobileNavLink({ to, onClick, label }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--accent-gold)] hover:bg-[var(--card-bg)] transition-all"
    >
      {label}
    </Link>
  );
}
