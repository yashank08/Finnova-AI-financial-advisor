import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Sparkles, BookOpen, RotateCcw, ArrowLeft } from 'lucide-react';
import { INITIAL_QUESTIONNAIRE, ROADMAP_LEVELS } from '../components/beginner/beginnerData';
import BeginnerWelcome from '../components/beginner/BeginnerWelcome';
import BeginnerQuestionnaire from '../components/beginner/BeginnerQuestionnaire';
import BeginnerProfileCard from '../components/beginner/BeginnerProfileCard';
import BeginnerRoadmap from '../components/beginner/BeginnerRoadmap';
import BeginnerLessonView from '../components/beginner/BeginnerLessonView';
import BeginnerRecommendations from '../components/beginner/BeginnerRecommendations';
import BeginnerBadges from '../components/beginner/BeginnerBadges';

const PROFILE_STORAGE_KEY = 'finnova_financial_compass_profile';
const PROGRESS_STORAGE_KEY = 'finnova_financial_compass_completed_levels';
const OLD_PROFILE_KEY = 'finnova_beginner_profile';
const OLD_PROGRESS_KEY = 'finnova_beginner_completed_levels';

export default function BeginnerMode() {
  const [profile, setProfile] = useState(null);
  const [completedLevels, setCompletedLevels] = useState([]);
  const [viewState, setViewState] = useState('welcome'); // 'welcome' | 'questionnaire' | 'dashboard'
  const [selectedLevel, setSelectedLevel] = useState(null);

  // Load saved state on mount
  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem(PROFILE_STORAGE_KEY) || localStorage.getItem(OLD_PROFILE_KEY);
      const savedProgress = localStorage.getItem(PROGRESS_STORAGE_KEY) || localStorage.getItem(OLD_PROGRESS_KEY);

      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
        setViewState('dashboard');
      }

      if (savedProgress) {
        setCompletedLevels(JSON.parse(savedProgress));
      }
    } catch (e) {
      console.error("Failed to load Financial Compass state from localStorage:", e);
    }
  }, []);

  const handleStartQuestionnaire = () => {
    setViewState('questionnaire');
  };

  const handleResetRoadmap = () => {
    setCompletedLevels([]);
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify([]));
    localStorage.removeItem(OLD_PROGRESS_KEY);
    setSelectedLevel(null);
  };

  const handleCompleteQuestionnaire = (answers) => {
    setProfile(answers);
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(answers));
    // Automatically reset all roadmap progress and badges to start fresh
    handleResetRoadmap();
    setViewState('dashboard');
  };

  const handleCompleteLevel = (levelId) => {
    if (!completedLevels.includes(levelId)) {
      const updated = [...completedLevels, levelId];
      setCompletedLevels(updated);
      localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(updated));
    }
  };

  const handleSelectLevelById = (levelId) => {
    const target = ROADMAP_LEVELS.find(l => l.id === levelId);
    if (target) {
      setSelectedLevel(target);
    }
  };

  return (
    <div className="min-h-[85vh] py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 bg-[var(--bg-primary)] transition-colors duration-300">
      
      {/* ── HEADER ──────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[var(--card-border)] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[var(--accent-gold)]/15 text-[var(--accent-gold)] border border-[var(--accent-gold)]/30 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> AI-Powered Guided Onboarding
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight flex items-center gap-2">
            <Compass className="w-7 h-7 text-[var(--accent-gold)]" />
            <span>Financial Compass</span>
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1 font-medium">
            Your personalized guide to building financial confidence, 10-level roadmap &amp; AI Coach.
          </p>
        </div>

        {profile && viewState === 'dashboard' && (
          <div className="flex items-center gap-3 self-start md:self-auto">
            <button
              onClick={() => setViewState('questionnaire')}
              className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[var(--accent-gold)]" />
              <span>Update Profile</span>
            </button>
          </div>
        )}
      </div>

      {/* ── MAIN CONTENT VIEWS ──────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {/* VIEW 1: WELCOME SCREEN */}
        {viewState === 'welcome' && (
          <BeginnerWelcome
            key="welcome"
            onStart={handleStartQuestionnaire}
            hasProfile={Boolean(profile)}
          />
        )}

        {/* VIEW 2: QUESTIONNAIRE WIZARD */}
        {viewState === 'questionnaire' && (
          <motion.div key="questionnaire" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <BeginnerQuestionnaire
              initialAnswers={profile || INITIAL_QUESTIONNAIRE}
              isRetake={Boolean(profile)}
              onComplete={handleCompleteQuestionnaire}
              onCancel={() => setViewState(profile ? 'dashboard' : 'welcome')}
            />
          </motion.div>
        )}

        {/* VIEW 3: DASHBOARD & ROADMAP */}
        {viewState === 'dashboard' && profile && (
          <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
            
            {/* STEP 3 & 6: Profile & Health Score */}
            <BeginnerProfileCard
              profile={profile}
              onRetake={() => setViewState('questionnaire')}
            />

            {/* STEP 7: Smart Recommendations */}
            <BeginnerRecommendations
              profile={profile}
              onSelectLevel={handleSelectLevelById}
            />

            {/* STEP 4: 10-Level Learning Roadmap */}
            <BeginnerRoadmap
              completedLevels={completedLevels}
              onSelectLevel={(level) => setSelectedLevel(level)}
              currentLevelId={selectedLevel?.id}
              onReset={handleResetRoadmap}
            />

            {/* STEP 8: Achievement Badges System */}
            <BeginnerBadges completedLevels={completedLevels} />

          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL / OVERLAY: STEP 5 AI Coach Lesson View */}
      <AnimatePresence>
        {selectedLevel && profile && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
            <div className="max-w-5xl w-full my-auto">
              <BeginnerLessonView
                level={selectedLevel}
                userProfile={profile}
                onCompleteLevel={handleCompleteLevel}
                onNextLevel={handleSelectLevelById}
                onClose={() => setSelectedLevel(null)}
              />
            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
