import React, { useState, useEffect, useRef } from 'react';
import { Book, Plus, Eye, Download, Save, Settings, Trash2, Edit2, GripVertical, Mic, Volume2, Sun, Moon, Award, Sparkles, Star, ArrowLeft, ArrowRight, Play, Pause, Share2, Printer, Palette, Music, Lightbulb, Gift, Lock, Unlock, BarChart3, FileText, Upload, Grid, List, Pencil, Eraser, Circle, Square, ChevronRight, Trophy, Zap, BookOpen, Camera } from 'lucide-react';


// Text-to-Speech Utility Functions
const useTTS = (settings) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const speak = (text, options = {}) => {
    if (!settings.ttsEnabled || !text) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configure voice settings
    utterance.rate = options.rate || 0.9; // Slightly slower for children
    utterance.pitch = options.pitch || 1;
    utterance.volume = options.volume || 1;

    // Try to use a child-friendly voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.name.includes('Google') || 
      voice.name.includes('Female') ||
      voice.name.includes('Child')
    );
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
      if (options.onStart) options.onStart();
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      if (options.onEnd) options.onEnd();
    };

    utterance.onerror = (event) => {
      console.error('Speech error:', event);
      setIsSpeaking(false);
      setIsPaused(false);
    };

    if (options.onBoundary) {
      utterance.onboundary = options.onBoundary;
    }

    window.speechSynthesis.speak(utterance);
  };

  const pause = () => {
    window.speechSynthesis.pause();
    setIsPaused(true);
  };

  const resume = () => {
    window.speechSynthesis.resume();
    setIsPaused(false);
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  return { speak, pause, resume, stop, isSpeaking, isPaused };
};

// Main App Component
const App = () => {
  const [stories, setStories] = useState([]);
  const [currentStory, setCurrentStory] = useState(null);
  const [view, setView] = useState('home');
  const [settings, setSettings] = useState({
    theme: 'light',
    fontSize: 'medium',
    fontFamily: 'default',
    highContrast: false,
    ttsEnabled: true,
    ttsRate: 0.9,
    ttsPitch: 1,
    ttsVolume: 1,
    animations: true,
    backgroundMusic: false,
    musicType: 'none',
    wizardMode: false,
    safeMode: false,
    parentalControls: false,
    keyboardNavigation: true,
    highlightWords: true,
    viewMode: 'grid'
  });
  const [showRewards, setShowRewards] = useState(false);
  const [rewardType, setRewardType] = useState('badge');
  const [showDailyChallenge, setShowDailyChallenge] = useState(true);

  // Note: localStorage is not supported in Claude.ai artifacts
  // All data is stored in memory and will be lost on refresh

  const createNewStory = () => {
    const newStory = {
      id: Date.now(),
      title: 'My New Story',
      pages: [],
      createdAt: new Date().toISOString(),
      wordCount: 0,
      badges: [],
      backgroundMusic: 'none',
      completionDate: null,
      dailyProgress: {}
    };
    setStories([...stories, newStory]);
    setCurrentStory(newStory);
    setView(settings.wizardMode ? 'wizard' : 'editor');
  };

  const deleteStory = (id) => {
    setStories(stories.filter(s => s.id !== id));
    if (currentStory?.id === id) {
      setCurrentStory(null);
      setView('home');
    }
  };

  const updateStory = (updatedStory) => {
    setStories(stories.map(s => s.id === updatedStory.id ? updatedStory : s));
    setCurrentStory(updatedStory);
  };

  const getThemeClasses = () => {
    const base = settings.theme === 'dark' 
      ? 'bg-gray-900 text-gray-100' 
      : 'bg-[#FDF6E3] text-[#333333]';
    const contrast = settings.highContrast ? 'contrast-125' : '';
    return `${base} ${contrast} min-h-screen transition-colors duration-300`;
  };

  const exportAllStories = () => {
    const dataStr = JSON.stringify({ stories, settings, exportDate: new Date().toISOString() }, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `all-stories-backup-${Date.now()}.json`;
    link.click();
  };

  const importStories = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          if (data.stories) {
            setStories([...stories, ...data.stories]);
            alert('Stories imported successfully!');
          }
        } catch (error) {
          alert('Error importing file. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className={getThemeClasses()} style={{ fontFamily: settings.fontFamily === 'dyslexic' ? 'Arial, sans-serif' : 'inherit', fontSize: settings.fontSize === 'large' ? '1.2em' : '1em' }}>
      <Header 
        view={view} 
        setView={setView} 
        settings={settings} 
        currentStory={currentStory}
        exportAllStories={exportAllStories}
        importStories={importStories}
      />
      
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        {view === 'home' && (
          <HomeView 
            stories={stories} 
            createNewStory={createNewStory}
            setCurrentStory={setCurrentStory}
            setView={setView}
            deleteStory={deleteStory}
            settings={settings}
            setSettings={setSettings}
            showDailyChallenge={showDailyChallenge}
            setShowDailyChallenge={setShowDailyChallenge}
          />
        )}
        
        {view === 'editor' && currentStory && (
          <StoryEditor 
            story={currentStory}
            updateStory={updateStory}
            setView={setView}
            settings={settings}
            setShowRewards={setShowRewards}
            setRewardType={setRewardType}
          />
        )}

        {view === 'wizard' && currentStory && (
          <WizardMode
            story={currentStory}
            updateStory={updateStory}
            setView={setView}
            settings={settings}
          />
        )}
        
        {view === 'preview' && currentStory && (
          <Preview 
            story={currentStory}
            setView={setView}
            settings={settings}
          />
        )}
        
        {view === 'settings' && (
          <SettingsView 
            settings={settings}
            setSettings={setSettings}
            setView={setView}
          />
        )}

        {view === 'dashboard' && (
          <ProgressDashboard
            stories={stories}
            setView={setView}
            settings={settings}
          />
        )}

        {view === 'games' && (
          <MiniGames
            stories={stories}
            setView={setView}
            settings={settings}
          />
        )}
      </main>

      {showRewards && (
        <RewardsModal 
          onClose={() => setShowRewards(false)} 
          settings={settings}
          rewardType={rewardType}
          story={currentStory}
        />
      )}
    </div>
  );
};

// Header Component
const Header = ({ view, setView, settings, currentStory, exportAllStories, importStories }) => {
  const bgColor = settings.theme === 'dark' ? 'bg-gray-800' : 'bg-[#FFB347]';
  const fileInputRef = useRef(null);
  
  return (
    <header className={`${bgColor} shadow-lg transition-colors duration-300`}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Book className="w-8 h-8" />
            <h1 className="text-2xl font-bold">Story Creator</h1>
          </div>
          
          <nav className="flex gap-2 flex-wrap">
            <button
              onClick={() => setView('home')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${view === 'home' ? 'bg-white text-[#333333]' : 'hover:bg-[#FFD580]'}`}
            >
              <Book className="w-5 h-5 inline mr-1" />
              Home
            </button>
            
            {currentStory && !settings.safeMode && (
              <>
                <button
                  onClick={() => setView('editor')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${view === 'editor' ? 'bg-white text-[#333333]' : 'hover:bg-[#FFD580]'}`}
                >
                  <Edit2 className="w-5 h-5 inline mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => setView('preview')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${view === 'preview' ? 'bg-white text-[#333333]' : 'hover:bg-[#FFD580]'}`}
                >
                  <Eye className="w-5 h-5 inline mr-1" />
                  Preview
                </button>
              </>
            )}

            {currentStory && settings.safeMode && (
              <button
                onClick={() => setView('preview')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${view === 'preview' ? 'bg-white text-[#333333]' : 'hover:bg-[#FFD580]'}`}
              >
                <Eye className="w-5 h-5 inline mr-1" />
                Read Only
              </button>
            )}

            <button
              onClick={() => setView('dashboard')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${view === 'dashboard' ? 'bg-white text-[#333333]' : 'hover:bg-[#FFD580]'}`}
            >
              <BarChart3 className="w-5 h-5 inline mr-1" />
              Progress
            </button>

            <button
              onClick={() => setView('games')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${view === 'games' ? 'bg-white text-[#333333]' : 'hover:bg-[#FFD580]'}`}
            >
              <Zap className="w-5 h-5 inline mr-1" />
              Games
            </button>
            
            <button
              onClick={() => setView('settings')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${view === 'settings' ? 'bg-white text-[#333333]' : 'hover:bg-[#FFD580]'}`}
            >
              <Settings className="w-5 h-5 inline mr-1" />
              Settings
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-lg font-semibold transition-all hover:bg-[#FFD580]"
              title="Import Stories"
            >
              <Download className="w-5 h-5" />
            </button>

            <button
              onClick={exportAllStories}
              className="px-4 py-2 rounded-lg font-semibold transition-all hover:bg-[#FFD580]"
              title="Backup All Stories"
            >
              <Upload className="w-5 h-5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={importStories}
              className="hidden"
            />
          </nav>
        </div>
      </div>
    </header>
  );
};

// Daily Challenge Component
const DailyChallenge = ({ onClose, createNewStory, settings }) => {
  const challenges = [
    { emoji: '🐱', text: 'Write about your favorite animal today' },
    { emoji: '🌈', text: 'Create a story with all the colors of the rainbow' },
    { emoji: '🚀', text: 'Imagine a trip to space' },
    { emoji: '🏰', text: 'Tell a story about a magical castle' },
    { emoji: '🌊', text: 'Write about an underwater adventure' },
    { emoji: '🎨', text: 'Make a story about creating art' },
    { emoji: '🦄', text: 'Write about a mythical creature' }
  ];

  // Simple random challenge (resets on page reload)
  const challenge = challenges[Math.floor(Math.random() * challenges.length)];

  const cardBg = settings.theme === 'dark' ? 'bg-gray-800' : 'bg-[#FFF8DC]';
  const buttonBg = settings.theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-[#FFB347] hover:bg-[#FFD580]';

  return (
    <div className={`${cardBg} p-6 rounded-xl shadow-lg mb-6`}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-2xl font-bold">📅 Today's Writing Challenge</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
      </div>
      <div className="text-center py-6">
        <div className="text-6xl mb-4">{challenge.emoji}</div>
        <p className="text-xl mb-6">{challenge.text}</p>
        <button
          onClick={() => {
            createNewStory();
            onClose();
          }}
          className={`${buttonBg} px-6 py-3 rounded-lg font-semibold transition-all`}
        >
          Start Writing!
        </button>
      </div>
    </div>
  );
};

// Home View Component
const HomeView = ({ stories, createNewStory, setCurrentStory, setView, deleteStory, settings, setSettings, showDailyChallenge, setShowDailyChallenge }) => {
  const cardBg = settings.theme === 'dark' ? 'bg-gray-800' : 'bg-[#FFF8DC]';
  const buttonBg = settings.theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-[#FFB347] hover:bg-[#FFD580]';
  
  return (
    <div className="space-y-6">
      {showDailyChallenge && (
        <DailyChallenge 
          onClose={() => setShowDailyChallenge(false)}
          createNewStory={createNewStory}
          settings={settings}
        />
      )}

      <div className="text-center py-8">
        <h2 className="text-4xl font-bold mb-4">Welcome to Story Creator! ✨</h2>
        <p className="text-xl mb-6">Create amazing stories with pictures, sounds, and your imagination!</p>
        
        <div className="flex gap-4 justify-center flex-wrap">
          <button
            onClick={createNewStory}
            className={`${buttonBg} px-8 py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform hover:scale-105`}
          >
            <Plus className="w-6 h-6 inline mr-2" />
            Create New Story
          </button>

          <button
            onClick={() => setView('games')}
            className={`${buttonBg} px-8 py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform hover:scale-105`}
          >
            <Zap className="w-6 h-6 inline mr-2" />
            Play Games
          </button>
        </div>
      </div>

      {stories.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold">📚 Your Story Library</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setSettings({ ...settings, viewMode: 'grid' })}
                className={`p-2 rounded ${settings.viewMode === 'grid' ? 'bg-[#8ED1FC]' : 'bg-gray-300'}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setSettings({ ...settings, viewMode: 'list' })}
                className={`p-2 rounded ${settings.viewMode === 'list' ? 'bg-[#8ED1FC]' : 'bg-gray-300'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className={settings.viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
            {stories.map(story => (
              <div key={story.id} className={`${cardBg} p-6 rounded-xl shadow-lg hover:shadow-xl transition-all`}>
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-xl font-bold">{story.title}</h4>
                  {!settings.parentalControls && (
                    <button
                      onClick={() => deleteStory(story.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
                
                <div className="space-y-2 text-sm mb-4">
                  <p>📄 {story.pages.length} pages</p>
                  <p>📝 {story.wordCount} words</p>
                  <p>📅 {new Date(story.createdAt).toLocaleDateString()}</p>
                  {story.badges?.length > 0 && (
                    <p>🏆 {story.badges.length} badges</p>
                  )}
                  {story.completionDate && (
                    <p className="text-green-600 font-semibold">✓ Completed!</p>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setCurrentStory(story);
                      setView(settings.safeMode ? 'preview' : 'editor');
                    }}
                    className={`${buttonBg} flex-1 py-2 rounded-lg font-semibold transition-all`}
                  >
                    {settings.safeMode ? 'Read' : 'Open'}
                  </button>
                  <button
                    onClick={() => {
                      const dataStr = JSON.stringify(story, null, 2);
                      navigator.clipboard.writeText(dataStr);
                      alert('Story code copied! Share with friends to import.');
                    }}
                    className={`${buttonBg} px-3 py-2 rounded-lg transition-all`}
                    title="Share Story"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {stories.length === 0 && (
        <div className={`${cardBg} p-12 rounded-xl text-center`}>
          <Book className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-xl">No stories yet! Create your first story to begin your adventure!</p>
        </div>
      )}
    </div>
  );
};

// Wizard Mode Component
const WizardMode = ({ story, updateStory, setView, settings }) => {
  const [step, setStep] = useState(0);
  const [currentPage, setCurrentPage] = useState({ id: Date.now(), text: '', emotion: null, background: 'default', stickers: [] });

  const cardBg = settings.theme === 'dark' ? 'bg-gray-800' : 'bg-[#FFF8DC]';
  const buttonBg = settings.theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-[#FFB347] hover:bg-[#FFD580]';

  const steps = [
    { title: 'Write Your Text', icon: <Edit2 className="w-8 h-8" /> },
    { title: 'Choose Emotion', icon: <Sparkles className="w-8 h-8" /> },
    { title: 'Pick Background', icon: <Palette className="w-8 h-8" /> },
    { title: 'Add Stickers', icon: <Star className="w-8 h-8" /> }
  ];

  const emotions = ['😊', '😢', '😮', '😡', '😍', '😴', '🤔', '😱', '😆', '😇'];
  const backgrounds = [
    { name: 'Default', value: 'default', class: 'bg-white' },
    { name: 'Sky', value: 'sky', class: 'bg-gradient-to-b from-blue-300 to-blue-100' },
    { name: 'Forest', value: 'forest', class: 'bg-gradient-to-b from-green-400 to-green-200' },
    { name: 'Space', value: 'space', class: 'bg-gradient-to-b from-purple-900 to-black' }
  ];
  const stickers = ['⭐', '❤️', '🌈', '🦄', '🐱', '🐶', '🌸', '🎈'];

  const savePage = () => {
    const updatedPages = [...story.pages, currentPage];
    updateStory({ ...story, pages: updatedPages });
    setCurrentPage({ id: Date.now(), text: '', emotion: null, background: 'default', stickers: [] });
    setStep(0);
    alert('Page added! Create another or go back to editor.');
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className={`${cardBg} p-6 rounded-xl shadow-lg mb-6`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">🪄 Step-by-Step Story Creator</h2>
          <button
            onClick={() => setView('editor')}
            className={`${buttonBg} px-4 py-2 rounded-lg font-semibold`}
          >
            Exit Wizard
          </button>
        </div>

        <div className="flex justify-between mb-8">
          {steps.map((s, i) => (
            <div key={i} className={`flex flex-col items-center ${i === step ? 'text-[#FFB347]' : 'opacity-50'}`}>
              {s.icon}
              <p className="text-sm mt-2">{s.title}</p>
            </div>
          ))}
        </div>

        <div className="min-h-[300px]">
          {step === 0 && (
            <div>
              <label className="block font-bold mb-2 text-lg">What happens on this page?</label>
              <textarea
                value={currentPage.text}
                onChange={(e) => setCurrentPage({ ...currentPage, text: e.target.value })}
                className="w-full p-4 rounded-lg border-2 border-[#8ED1FC] min-h-[200px] text-lg"
                placeholder="Type your story here..."
              />
            </div>
          )}

          {step === 1 && (
            <div>
              <label className="block font-bold mb-4 text-lg">How does your character feel?</label>
              <div className="grid grid-cols-5 gap-4">
                {emotions.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => setCurrentPage({ ...currentPage, emotion: emoji })}
                    className={`text-5xl p-4 rounded-lg ${currentPage.emotion === emoji ? 'bg-[#8ED1FC]' : 'bg-gray-200'} hover:scale-110 transition-all`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <label className="block font-bold mb-4 text-lg">Choose a background for your page</label>
              <div className="grid grid-cols-2 gap-4">
                {backgrounds.map(bg => (
                  <button
                    key={bg.value}
                    onClick={() => setCurrentPage({ ...currentPage, background: bg.value })}
                    className={`${bg.class} p-8 rounded-lg border-4 ${currentPage.background === bg.value ? 'border-black' : 'border-transparent'} transition-all`}
                  >
                    <span className="font-bold text-lg">{bg.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <label className="block font-bold mb-4 text-lg">Add fun stickers!</label>
              <div className="grid grid-cols-4 gap-4 mb-6">
                {stickers.map(sticker => (
                  <button
                    key={sticker}
                    onClick={() => setCurrentPage({ ...currentPage, stickers: [...currentPage.stickers, sticker] })}
                    className="text-5xl p-4 hover:scale-125 transition-all bg-gray-200 rounded-lg"
                  >
                    {sticker}
                  </button>
                ))}
              </div>
              {currentPage.stickers.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  <p className="font-bold">Selected:</p>
                  {currentPage.stickers.map((s, i) => <span key={i} className="text-3xl">{s}</span>)}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-between mt-6">
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className={`${buttonBg} px-6 py-3 rounded-lg font-semibold disabled:opacity-50`}
          >
            <ArrowLeft className="w-5 h-5 inline mr-2" />
            Back
          </button>

          {step < steps.length - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              className={`${buttonBg} px-6 py-3 rounded-lg font-semibold`}
            >
              Next
              <ArrowRight className="w-5 h-5 inline ml-2" />
            </button>
          ) : (
            <button
              onClick={savePage}
              className={`${buttonBg} px-6 py-3 rounded-lg font-semibold`}
            >
              <Save className="w-5 h-5 inline mr-2" />
              Save Page
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Story Editor Component
const StoryEditor = ({ story, updateStory, setView, settings, setShowRewards, setRewardType }) => {
  const [pages, setPages] = useState(story.pages || []);
  const [editingPage, setEditingPage] = useState(null);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [showDrawing, setShowDrawing] = useState(false);

  const cardBg = settings.theme === 'dark' ? 'bg-gray-800' : 'bg-[#FFF8DC]';
  const buttonBg = settings.theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-[#FFB347] hover:bg-[#FFD580]';

  const [storyPrompts] = useState([
    "Once upon a time...",
    "In a magical forest...",
    "One sunny day...",
    "Long ago in a faraway land...",
    "There was a brave hero who..."
  ]);

  useEffect(() => {
    const wordCount = pages.reduce((total, page) => {
      return total + (page.text?.split(' ').filter(w => w.length > 0).length || 0);
    }, 0);
    
    const badges = [];
    if (pages.length >= 1) badges.push('First Page');
    if (pages.length >= 5) badges.push('Story Builder');
    if (pages.length >= 10) badges.push('Author');
    if (wordCount >= 100) badges.push('Word Wizard');
    if (wordCount >= 500) badges.push('Master Writer');
    
    const completionDate = pages.length >= 5 ? new Date().toISOString() : null;
    
    const today = new Date().toDateString();
    const dailyProgress = { ...story.dailyProgress, [today]: wordCount };
    
    updateStory({ ...story, pages, wordCount, badges, completionDate, dailyProgress });
    
    if (pages.length === 5 || pages.length === 10 || wordCount === 100) {
      setRewardType('badge');
      setShowRewards(true);
    }

    if (completionDate && !story.completionDate) {
      setRewardType('certificate');
      setShowRewards(true);
    }
  }, [pages]);

  const addPage = () => {
    const newPage = {
      id: Date.now(),
      text: '',
      image: null,
      audio: null,
      background: 'default',
      stickers: [],
      emotion: null,
      drawing: null
    };
    setPages([...pages, newPage]);
    setEditingPage(newPage);
  };

  const updatePage = (pageId, updates) => {
    setPages(pages.map(p => p.id === pageId ? { ...p, ...updates } : p));
  };

  const deletePage = (pageId) => {
    setPages(pages.filter(p => p.id !== pageId));
    if (editingPage?.id === pageId) setEditingPage(null);
  };

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    const newPages = [...pages];
    const draggedPage = newPages[draggedIndex];
    newPages.splice(draggedIndex, 1);
    newPages.splice(index, 0, draggedPage);
    
    setPages(newPages);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const exportToJSON = () => {
    const dataStr = JSON.stringify(story, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${story.title}.json`;
    link.click();
  };

  const printColoringPage = () => {
    const printWindow = window.open('', '_blank');
    const stickers = pages.flatMap(p => p.stickers || []).join(' ');
    printWindow.document.write(`
      <html>
        <head>
          <title>Coloring Page - ${story.title}</title>
          <style>
            body { font-family: Arial; text-align: center; padding: 40px; }
            .stickers { font-size: 100px; margin: 40px; }
            h1 { font-size: 36px; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <h1>${story.title}</h1>
          <div class="stickers">${stickers}</div>
          <p>Color this page!</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="space-y-6">
      <div className={`${cardBg} p-6 rounded-xl shadow-lg`}>
        <input
          type="text"
          value={story.title}
          onChange={(e) => updateStory({ ...story, title: e.target.value })}
          className={`text-3xl font-bold w-full bg-transparent border-b-2 border-[#8ED1FC] focus:outline-none pb-2 ${settings.theme === 'dark' ? 'text-gray-100' : 'text-[#333333]'}`}
          placeholder="Story Title"
        />
        
        <div className="flex gap-4 mt-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="font-semibold">📄 {pages.length} pages</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">📝 {story.wordCount} words</span>
          </div>
          {story.badges?.length > 0 && (
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-500" />
              <span className="font-semibold">{story.badges.length} badges</span>
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-4 flex-wrap">
          <button onClick={addPage} className={`${buttonBg} px-4 py-2 rounded-lg font-semibold transition-all`}>
            <Plus className="w-5 h-5 inline mr-1" />
            Add Page
          </button>
          <button onClick={exportToJSON} className={`${buttonBg} px-4 py-2 rounded-lg font-semibold transition-all`}>
            <Download className="w-5 h-5 inline mr-1" />
            Export
          </button>
          <button onClick={printColoringPage} className={`${buttonBg} px-4 py-2 rounded-lg font-semibold transition-all`}>
            <Printer className="w-5 h-5 inline mr-1" />
            Coloring Page
          </button>
          <button 
            onClick={() => setView('wizard')} 
            className={`${buttonBg} px-4 py-2 rounded-lg font-semibold transition-all`}
          >
            <Lightbulb className="w-5 h-5 inline mr-1" />
            Wizard Mode
          </button>
        </div>
      </div>

      {storyPrompts.length > 0 && pages.length === 0 && (
        <div className={`${cardBg} p-6 rounded-xl shadow-lg`}>
          <h3 className="text-xl font-bold mb-3">Story Starters 🌟</h3>
          <div className="flex flex-wrap gap-2">
            {storyPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => {
                  const newPage = {
                    id: Date.now(),
                    text: prompt,
                    image: null,
                    audio: null,
                    background: 'default',
                    stickers: [],
                    emotion: null
                  };
                  setPages([newPage]);
                  setEditingPage(newPage);
                }}
                className={`${buttonBg} px-4 py-2 rounded-lg text-sm transition-all`}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-2xl font-bold">Pages</h3>
          {pages.length === 0 ? (
            <div className={`${cardBg} p-8 rounded-xl text-center`}>
              <p className="text-lg">Click "Add Page" to start your story!</p>
            </div>
          ) : (
            pages.map((page, index) => (
              <PageCard
                key={page.id}
                page={page}
                index={index}
                onEdit={() => setEditingPage(page)}
                onDelete={() => deletePage(page.id)}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                isEditing={editingPage?.id === page.id}
                settings={settings}
              />
            ))
          )}
        </div>

        <div className="sticky top-4">
          {editingPage ? (
            <PageEditor
              page={editingPage}
              updatePage={updatePage}
              settings={settings}
              showDrawing={showDrawing}
              setShowDrawing={setShowDrawing}
            />
          ) : (
            <div className={`${cardBg} p-8 rounded-xl text-center`}>
              <Edit2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Select a page to edit</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Page Card Component
const PageCard = ({ page, index, onEdit, onDelete, onDragStart, onDragOver, onDragEnd, isEditing, settings }) => {
  const cardBg = settings.theme === 'dark' ? 'bg-gray-700' : 'bg-white';
  const activeBg = settings.theme === 'dark' ? 'bg-blue-900' : 'bg-[#8ED1FC]';
  
  return (
    <div
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDragEnd={onDragEnd}
      className={`${isEditing ? activeBg : cardBg} p-4 rounded-xl shadow-md hover:shadow-lg transition-all cursor-move`}
    >
      <div className="flex items-start gap-3">
        <GripVertical className="w-6 h-6 mt-1 opacity-50" />
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-lg">Page {index + 1}</span>
            <div className="flex gap-2">
              <button onClick={onEdit} className="text-blue-600 hover:text-blue-800 transition-colors">
                <Edit2 className="w-5 h-5" />
              </button>
              <button onClick={onDelete} className="text-red-500 hover:text-red-700 transition-colors">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <p className="text-sm line-clamp-2">{page.text || 'Empty page'}</p>
          
          {page.emotion && (
            <div className="mt-2">
              <span className="text-2xl">{page.emotion}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Drawing Canvas Component
const DrawingCanvas = ({ onSave, onClose, settings }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(3);
  const [tool, setTool] = useState('pen');

  const buttonBg = settings.theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-[#FFB347] hover:bg-[#FFD580]';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (tool === 'eraser') {
      ctx.strokeStyle = 'white';
      ctx.lineWidth = brushSize * 3;
    } else {
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
    }
    
    ctx.lineCap = 'round';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const saveDrawing = () => {
    const canvas = canvasRef.current;
    const dataURL = canvas.toDataURL();
    onSave(dataURL);
    onClose();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-4xl w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold">🎨 Draw on Your Page</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">✕</button>
        </div>

        <div className="flex gap-4 mb-4 flex-wrap">
          <div className="flex gap-2">
            <button
              onClick={() => setTool('pen')}
              className={`p-2 rounded ${tool === 'pen' ? 'bg-[#8ED1FC]' : 'bg-gray-200'}`}
            >
              <Pencil className="w-6 h-6" />
            </button>
            <button
              onClick={() => setTool('eraser')}
              className={`p-2 rounded ${tool === 'eraser' ? 'bg-[#8ED1FC]' : 'bg-gray-200'}`}
            >
              <Eraser className="w-6 h-6" />
            </button>
          </div>

          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-12 h-12 rounded"
          />

          <select
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="px-4 py-2 rounded border-2"
          >
            <option value={1}>Thin</option>
            <option value={3}>Medium</option>
            <option value={5}>Thick</option>
            <option value={10}>Very Thick</option>
          </select>

          <button onClick={clearCanvas} className={`${buttonBg} px-4 py-2 rounded-lg`}>
            Clear
          </button>
        </div>

        <canvas
          ref={canvasRef}
          width={800}
          height={400}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="border-2 border-gray-300 rounded-lg w-full cursor-crosshair"
        />

        <div className="flex gap-4 mt-4 justify-end">
          <button onClick={onClose} className="px-6 py-2 rounded-lg bg-gray-300 hover:bg-gray-400">
            Cancel
          </button>
          <button onClick={saveDrawing} className={`${buttonBg} px-6 py-2 rounded-lg font-semibold`}>
            Save Drawing
          </button>
        </div>
      </div>
    </div>
  );
};

// Page Editor Component
const PageEditor = ({ page, updatePage, settings, showDrawing, setShowDrawing }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const [wordSuggestions, setWordSuggestions] = useState([]);
  const [localText, setLocalText] = useState(page.text || '');
  const textareaRef = useRef(null);

  const cardBg = settings.theme === 'dark' ? 'bg-gray-800' : 'bg-[#FFF8DC]';
  const inputBg = settings.theme === 'dark' ? 'bg-gray-700 text-gray-100' : 'bg-white text-[#333333]';
  const buttonBg = settings.theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-[#FFB347] hover:bg-[#FFD580]';

  // Sync local text with page text when page changes
  useEffect(() => {
    setLocalText(page.text || '');
  }, [page.id]);

  // Handle text changes with debouncing to avoid constant re-renders
  const handleTextChange = (e) => {
    const newText = e.target.value;
    setLocalText(newText);
    
    // Update the parent immediately so changes are saved
    updatePage(page.id, { text: newText });
  };

  // Pictogram suggestions
  const pictogramMap = {
    'dog': '🐶', 'cat': '🐱', 'sun': '☀️', 'moon': '🌙', 'star': '⭐',
    'heart': '❤️', 'happy': '😊', 'sad': '😢', 'tree': '🌳', 'flower': '🌸',
    'car': '🚗', 'house': '🏠', 'food': '🍎', 'water': '💧', 'fire': '🔥',
    'book': '📚', 'music': '🎵', 'ball': '⚽', 'rainbow': '🌈', 'cloud': '☁️'
  };

  // Pictogram suggestions based on localText
  useEffect(() => {
    const lastWord = localText?.split(' ').pop()?.toLowerCase() || '';
    const suggestions = Object.keys(pictogramMap)
      .filter(word => word.startsWith(lastWord) && lastWord.length > 2)
      .map(word => ({ word, emoji: pictogramMap[word] }));
    setWordSuggestions(suggestions);
  }, [localText]);

  const backgrounds = [
    { name: 'Default', value: 'default', color: 'bg-white' },
    { name: 'Sky', value: 'sky', color: 'bg-gradient-to-b from-blue-300 to-blue-100' },
    { name: 'Forest', value: 'forest', color: 'bg-gradient-to-b from-green-400 to-green-200' },
    { name: 'Space', value: 'space', color: 'bg-gradient-to-b from-purple-900 to-black' },
    { name: 'Sunset', value: 'sunset', color: 'bg-gradient-to-b from-orange-400 to-pink-300' },
    { name: 'Ocean', value: 'ocean', color: 'bg-gradient-to-b from-blue-500 to-teal-300' }
  ];

  const emotions = [
    '😊', '😃', '😄', '😁', '😆', '🥰', '😍', '🤩', '😘', '😗',
    '😚', '😙', '🙂', '🤗', '🤭', '😇', '😌', '😉', '🙃', '😋',
    '😛', '😝', '😜', '🤪', '😎', '🤓', '🧐', '🤠', '🥳', '😏',
    '😢', '😭', '😿', '😔', '😞', '😟', '😕', '🙁', '☹️', '😣',
    '😖', '😫', '😩', '🥺', '😤', '😠', '😡', '🤬', '😱', '😨',
    '😰', '😥', '😓', '🤗', '🤔', '🤨', '😐', '😑', '😶', '🙄',
    '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕',
    '🤢', '🤮', '🤧', '🥵', '🥶', '😵', '🤯', '🤠', '🥳', '🥸',
    '😮', '😯', '😲', '😳', '🥴', '😵‍💫', '🤐', '🤫', '😬', '🙃'
  ];
  
  const stickers = [
    '⭐', '🌟', '✨', '💫', '☀️', '🌙', '🌈', '☁️', '⛅', '🌤️',
    '⛈️', '🌧️', '💧', '💦', '❄️', '⛄', '☃️', '🌊', '🌸', '🌺',
    '🌻', '🌷', '🌹', '🥀', '🌼', '🍀', '🍁', '🍂', '🍃', '🌿',
    '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁',
    '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🐣', '🦆',
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
    '🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍑', '🍒', '🥭',
    '⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🥏', '🎱', '🏓',
    '🎨', '🖌️', '🖍️', '✏️', '✒️', '🖊️', '🖋️', '📚', '📖', '📕',
    '🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐',
    '🎈', '🎉', '🎊', '🎁', '🎀', '🎃', '🎄', '🎆', '🎇', '🏆'
  ];

  const startSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser');
      return;
    }

    const recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      const newText = localText + ' ' + transcript;
      setLocalText(newText);
      updatePage(page.id, { text: newText });
    };

    recognition.start();
  };

  const speakText = () => {
    if (!settings.ttsEnabled || !localText) return;
    
    let textToSpeak = localText;
    if (page.emotion) {
      const emotionText = getEmotionDescription(page.emotion);
      textToSpeak = `The character is ${emotionText}. ` + textToSpeak;
    }
    
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const getEmotionDescription = (emoji) => {
    const emotionMap = {
      '😊': 'happy', '😢': 'sad', '😡': 'angry', '😱': 'scared',
      '😍': 'in love', '😴': 'sleepy', '🤔': 'thinking', '😮': 'surprised'
    };
    return emotionMap[emoji] || 'feeling something';
  };

  const getMoodThemeColor = (emotion) => {
    const moodColors = {
      '😊': 'yellow', '😢': 'blue', '😡': 'red', '😱': 'purple',
      '😍': 'pink', '😴': 'gray', '🤔': 'orange', '😮': 'cyan'
    };
    return moodColors[emotion];
  };

  const applySuggestion = (word, emoji) => {
    const words = localText.split(' ');
    words[words.length - 1] = word;
    const newText = words.join(' ');
    setLocalText(newText);
    updatePage(page.id, { 
      text: newText,
      stickers: [...(page.stickers || []), emoji]
    });
    setWordSuggestions([]);
  };

  return (
    <div className={`${cardBg} p-6 rounded-xl shadow-lg space-y-4`}>
      <h3 className="text-2xl font-bold">Edit Page</h3>

      <div>
        <label className="block font-semibold mb-2">Background Theme</label>
        <div className="grid grid-cols-3 gap-2">
          {backgrounds.map(bg => (
            <button
              key={bg.value}
              onClick={() => updatePage(page.id, { background: bg.value })}
              className={`${bg.color} p-4 rounded-lg border-2 ${page.background === bg.value ? 'border-black' : 'border-transparent'} transition-all`}
            >
              <span className="text-xs font-semibold">{bg.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block font-semibold">Story Text</label>
          <div className="flex gap-2">
            <button
              onClick={isRecording ? null : startSpeechRecognition}
              className={`${buttonBg} p-2 rounded-lg transition-all ${isRecording ? 'animate-pulse' : ''}`}
              title="Speech to Text"
            >
              <Mic className="w-5 h-5" />
            </button>
            <button
              onClick={isSpeaking ? stopSpeaking : speakText}
              className={`${buttonBg} p-2 rounded-lg transition-all`}
              title="Read Aloud"
            >
              {isSpeaking ? <Pause className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setShowDrawing(true)}
              className={`${buttonBg} p-2 rounded-lg transition-all`}
              title="Draw"
            >
              <Pencil className="w-5 h-5" />
            </button>
          </div>
        </div>
        <textarea
          ref={textareaRef}
          value={localText}
          onChange={handleTextChange}
          className={`${inputBg} w-full p-4 rounded-lg border-2 border-[#8ED1FC] focus:outline-none focus:border-[#FFB347] min-h-[200px] text-lg`}
          placeholder="Write your story here..."
        />
        <p className="text-sm mt-1 opacity-75">{localText?.split(' ').filter(w => w.length > 0).length || 0} words</p>
        
        {wordSuggestions.length > 0 && (
          <div className="mt-2 p-2 bg-yellow-100 rounded-lg">
            <p className="text-sm font-semibold mb-2">💡 Pictogram Suggestions:</p>
            <div className="flex gap-2">
              {wordSuggestions.map(({ word, emoji }) => (
                <button
                  key={word}
                  onClick={() => applySuggestion(word, emoji)}
                  className="px-3 py-2 bg-white rounded-lg hover:bg-gray-100 transition-all"
                >
                  <span className="text-2xl mr-2">{emoji}</span>
                  <span className="text-sm">{word}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div>
        <label className="block font-semibold mb-2">Character Emotion</label>
        <div className="max-h-32 overflow-y-auto">
          <div className="flex flex-wrap gap-2">
            {emotions.map(emoji => (
              <button
                key={emoji}
                onClick={() => updatePage(page.id, { emotion: page.emotion === emoji ? null : emoji })}
                className={`text-3xl p-2 rounded-lg ${page.emotion === emoji ? 'bg-[#8ED1FC]' : 'bg-gray-200'} hover:scale-110 transition-all`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block font-semibold">Stickers & Decorations</label>
          <button
            onClick={() => setShowStickers(!showStickers)}
            className={`${buttonBg} px-3 py-1 rounded-lg text-sm transition-all`}
          >
            {showStickers ? 'Hide' : 'Show'} Stickers
          </button>
        </div>
        
        {showStickers && (
          <div className="max-h-48 overflow-y-auto">
            <div className="grid grid-cols-6 gap-2 p-4 bg-white rounded-lg">
              {stickers.map(sticker => (
                <button
                  key={sticker}
                  onClick={() => {
                    const newStickers = [...(page.stickers || []), sticker];
                    updatePage(page.id, { stickers: newStickers });
                  }}
                  className="text-3xl hover:scale-125 transition-all"
                >
                  {sticker}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {page.stickers?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {page.stickers.map((sticker, i) => (
              <button
                key={i}
                onClick={() => {
                  const newStickers = page.stickers.filter((_, idx) => idx !== i);
                  updatePage(page.id, { stickers: newStickers });
                }}
                className="text-2xl bg-white rounded-lg p-2 hover:bg-red-100 transition-all"
                title="Click to remove"
              >
                {sticker}
              </button>
            ))}
          </div>
        )}
      </div>

      {page.drawing && (
        <div>
          <label className="block font-semibold mb-2">Your Drawing</label>
          <img src={page.drawing} alt="Drawing" className="w-full rounded-lg border-2 border-[#8ED1FC]" />
          <button
            onClick={() => updatePage(page.id, { drawing: null })}
            className="mt-2 text-red-500 hover:text-red-700 text-sm"
          >
            Remove Drawing
          </button>
        </div>
      )}

      {showDrawing && (
        <DrawingCanvas
          onSave={(drawing) => updatePage(page.id, { drawing })}
          onClose={() => setShowDrawing(false)}
          settings={settings}
        />
      )}
    </div>
  );
};

// Preview Component
const Preview = ({ story, setView, settings }) => {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isReading, setIsReading] = useState(false);
  const [highlightedWord, setHighlightedWord] = useState(-1);

  const cardBg = settings.theme === 'dark' ? 'bg-gray-800' : 'bg-[#FFF8DC]';
  const buttonBg = settings.theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-[#FFB347] hover:bg-[#FFD580]';

  const currentPage = story.pages[currentPageIndex];

  const nextPage = () => {
    if (currentPageIndex < story.pages.length - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
      setHighlightedWord(-1);
    }
  };

  const prevPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
      setHighlightedWord(-1);
    }
  };

  const readCurrentPage = () => {
    if (!settings.ttsEnabled || !currentPage?.text) return;
    
    const words = currentPage.text.split(' ');
    let wordIndex = 0;

    const utterance = new SpeechSynthesisUtterance(currentPage.text);
    utterance.onstart = () => setIsReading(true);
    utterance.onend = () => {
      setIsReading(false);
      setHighlightedWord(-1);
    };

    if (settings.highlightWords) {
      utterance.onboundary = (event) => {
        if (event.name === 'word') {
          setHighlightedWord(wordIndex);
          wordIndex++;
        }
      };
    }

    window.speechSynthesis.speak(utterance);
  };

  const stopReading = () => {
    window.speechSynthesis.cancel();
    setIsReading(false);
    setHighlightedWord(-1);
  };

  const getBackgroundClass = (bg) => {
    const backgrounds = {
      default: 'bg-white',
      sky: 'bg-gradient-to-b from-blue-300 to-blue-100',
      forest: 'bg-gradient-to-b from-green-400 to-green-200',
      space: 'bg-gradient-to-b from-purple-900 to-black text-white',
      sunset: 'bg-gradient-to-b from-orange-400 to-pink-300',
      ocean: 'bg-gradient-to-b from-blue-500 to-teal-300'
    };
    return backgrounds[bg] || backgrounds.default;
  };

  if (!story.pages || story.pages.length === 0) {
    return (
      <div className={`${cardBg} p-12 rounded-xl text-center`}>
        <Book className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <p className="text-xl mb-4">No pages in this story yet!</p>
        <button onClick={() => setView('editor')} className={`${buttonBg} px-6 py-3 rounded-lg font-semibold transition-all`}>
          Go to Editor
        </button>
      </div>
    );
  }

  const words = currentPage?.text?.split(' ') || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">{story.title}</h2>
        <button onClick={() => setView('editor')} className={`${buttonBg} px-4 py-2 rounded-lg font-semibold transition-all`}>
          <Edit2 className="w-5 h-5 inline mr-1" />
          Back to Editor
        </button>
      </div>

      <div className={`${getBackgroundClass(currentPage?.background)} rounded-xl shadow-2xl p-12 min-h-[500px] relative ${settings.animations ? 'transition-all duration-500' : ''}`}>
        {currentPage?.emotion && (
          <div className="absolute top-4 right-4 text-6xl">
            {currentPage.emotion}
          </div>
        )}

        {currentPage?.stickers && currentPage.stickers.length > 0 && (
          <div className="absolute top-4 left-4 flex gap-2 flex-wrap max-w-xs">
            {currentPage.stickers.map((sticker, i) => (
              <span key={i} className="text-4xl">{sticker}</span>
            ))}
          </div>
        )}

        {currentPage?.drawing && (
          <div className="mb-4">
            <img src={currentPage.drawing} alt="Drawing" className="max-w-full max-h-48 mx-auto rounded-lg" />
          </div>
        )}

        <div className="flex flex-col justify-center items-center h-full text-center">
          <p className={`text-2xl leading-relaxed mb-8 ${currentPage?.background === 'space' ? 'text-white' : 'text-[#333333]'}`}>
            {words.map((word, index) => (
              <span
                key={index}
                className={`${highlightedWord === index ? 'bg-yellow-300 px-1 rounded' : ''} transition-all`}
              >
                {word}{' '}
              </span>
            ))}
          </p>

          <button
            onClick={isReading ? stopReading : readCurrentPage}
            className={`${buttonBg} px-6 py-3 rounded-full font-semibold transition-all transform hover:scale-105`}
          >
            {isReading ? (
              <>
                <Pause className="w-6 h-6 inline mr-2" />
                Stop Reading
              </>
            ) : (
              <>
                <Volume2 className="w-6 h-6 inline mr-2" />
                Read Aloud
              </>
            )}
          </button>
        </div>

        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <span className="font-bold text-lg">
            Page {currentPageIndex + 1} of {story.pages.length}
          </span>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <button
          onClick={prevPage}
          disabled={currentPageIndex === 0}
          className={`${buttonBg} px-6 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <ArrowLeft className="w-5 h-5 inline mr-1" />
          Previous
        </button>

        <div className="flex gap-2">
          {story.pages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPageIndex(index)}
              className={`w-3 h-3 rounded-full transition-all ${index === currentPageIndex ? 'bg-[#FFB347] w-8' : 'bg-gray-400'}`}
            />
          ))}
        </div>

        <button
          onClick={nextPage}
          disabled={currentPageIndex === story.pages.length - 1}
          className={`${buttonBg} px-6 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          Next
          <ArrowRight className="w-5 h-5 inline ml-1" />
        </button>
      </div>
    </div>
  );
};

// Progress Dashboard Component
const ProgressDashboard = ({ stories, setView, settings }) => {
  const cardBg = settings.theme === 'dark' ? 'bg-gray-800' : 'bg-[#FFF8DC]';
  const buttonBg = settings.theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-[#FFB347] hover:bg-[#FFD580]';

  const totalPages = stories.reduce((sum, story) => sum + story.pages.length, 0);
  const totalWords = stories.reduce((sum, story) => sum + story.wordCount, 0);
  const completedStories = stories.filter(s => s.completionDate).length;
  const allBadges = [...new Set(stories.flatMap(s => s.badges || []))];

  const emotionUsage = {};
  stories.forEach(story => {
    story.pages?.forEach(page => {
      if (page.emotion) {
        emotionUsage[page.emotion] = (emotionUsage[page.emotion] || 0) + 1;
      }
    });
  });

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toDateString();
  });

  const dailyWordCounts = last7Days.map(date => {
    const count = stories.reduce((sum, story) => {
      return sum + (story.dailyProgress?.[date] || 0);
    }, 0);
    return { date: date.split(' ')[0] + ' ' + date.split(' ')[2], words: count };
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">📊 Progress Dashboard</h2>
        <button onClick={() => setView('home')} className={`${buttonBg} px-4 py-2 rounded-lg font-semibold`}>
          Back to Home
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`${cardBg} p-6 rounded-xl shadow-lg text-center`}>
          <div className="text-4xl mb-2">📚</div>
          <div className="text-3xl font-bold">{stories.length}</div>
          <div className="text-sm opacity-75">Total Stories</div>
        </div>

        <div className={`${cardBg} p-6 rounded-xl shadow-lg text-center`}>
          <div className="text-4xl mb-2">📄</div>
          <div className="text-3xl font-bold">{totalPages}</div>
          <div className="text-sm opacity-75">Pages Written</div>
        </div>

        <div className={`${cardBg} p-6 rounded-xl shadow-lg text-center`}>
          <div className="text-4xl mb-2">📝</div>
          <div className="text-3xl font-bold">{totalWords}</div>
          <div className="text-sm opacity-75">Total Words</div>
        </div>

        <div className={`${cardBg} p-6 rounded-xl shadow-lg text-center`}>
          <div className="text-4xl mb-2">✅</div>
          <div className="text-3xl font-bold">{completedStories}</div>
          <div className="text-sm opacity-75">Completed Stories</div>
        </div>
      </div>

      <div className={`${cardBg} p-6 rounded-xl shadow-lg`}>
        <h3 className="text-xl font-bold mb-4">🏆 Badges Earned</h3>
        <div className="flex flex-wrap gap-4">
          {allBadges.length > 0 ? (
            allBadges.map((badge, i) => (
              <div key={i} className="flex items-center gap-2 bg-yellow-100 px-4 py-2 rounded-lg">
                <Award className="w-5 h-5 text-yellow-600" />
                <span className="font-semibold">{badge}</span>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No badges yet. Keep writing to earn badges!</p>
          )}
        </div>
      </div>

      <div className={`${cardBg} p-6 rounded-xl shadow-lg`}>
        <h3 className="text-xl font-bold mb-4">📈 Writing Activity (Last 7 Days)</h3>
        <div className="flex items-end justify-between h-48 gap-2">
          {dailyWordCounts.map((day, i) => (
            <div key={i} className="flex-1 flex flex-col items-center">
              <div className="w-full bg-[#FFB347] rounded-t-lg transition-all" style={{ height: `${Math.min((day.words / Math.max(...dailyWordCounts.map(d => d.words), 1)) * 100, 100)}%` }}>
                {day.words > 0 && <div className="text-xs font-bold text-center mt-2">{day.words}</div>}
              </div>
              <div className="text-xs mt-2 transform -rotate-45 origin-left">{day.date}</div>
            </div>
          ))}
        </div>
      </div>

      <div className={`${cardBg} p-6 rounded-xl shadow-lg`}>
        <h3 className="text-xl font-bold mb-4">😊 Most Used Emotions</h3>
        <div className="flex flex-wrap gap-4">
          {Object.entries(emotionUsage)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([emoji, count]) => (
              <div key={emoji} className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg">
                <span className="text-3xl">{emoji}</span>
                <span className="font-semibold">×{count}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

// Mini Games Component
const MiniGames = ({ stories, setView, settings }) => {
  const [selectedGame, setSelectedGame] = useState(null);
  const cardBg = settings.theme === 'dark' ? 'bg-gray-800' : 'bg-[#FFF8DC]';
  const buttonBg = settings.theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-[#FFB347] hover:bg-[#FFD580]';

  const totalWords = stories.reduce((sum, story) => sum + story.wordCount, 0);
  const gamesUnlocked = Math.min(Math.floor(totalWords / 100), 3);

  const games = [
    { id: 1, name: 'Coloring Book', icon: '🎨', requirement: 0, description: 'Color fun pictures!' },
    { id: 2, name: 'Story Sequencing', icon: '🔢', requirement: 100, description: 'Put events in order' },
    { id: 3, name: 'Word Finder', icon: '🔍', requirement: 200, description: 'Find hidden words' },
    { id: 4, name: 'Memory Match', icon: '🧩', requirement: 300, description: 'Match emoji pairs' }
  ];

  if (selectedGame === 1) {
    return <ColoringGame onClose={() => setSelectedGame(null)} settings={settings} />;
  }

  if (selectedGame === 2) {
    return <SequencingGame stories={stories} onClose={() => setSelectedGame(null)} settings={settings} />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">🎮 Fun Games</h2>
        <button onClick={() => setView('home')} className={`${buttonBg} px-4 py-2 rounded-lg font-semibold`}>
          Back to Home
        </button>
      </div>

      <div className={`${cardBg} p-6 rounded-xl shadow-lg text-center`}>
        <p className="text-lg mb-2">You've written <strong>{totalWords} words</strong>!</p>
        <p className="text-sm opacity-75">Keep writing to unlock more games</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {games.map(game => {
          const isUnlocked = totalWords >= game.requirement;
          return (
            <div key={game.id} className={`${cardBg} p-6 rounded-xl shadow-lg ${!isUnlocked && 'opacity-50'}`}>
              <div className="text-center">
                <div className="text-6xl mb-4">{game.icon}</div>
                <h3 className="text-2xl font-bold mb-2">{game.name}</h3>
                <p className="text-sm mb-4">{game.description}</p>
                
                {isUnlocked ? (
                  <button
                    onClick={() => setSelectedGame(game.id)}
                    className={`${buttonBg} px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105`}
                  >
                    Play Now!
                  </button>
                ) : (
                  <div>
                    <Lock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Write {game.requirement - totalWords} more words to unlock</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Coloring Game Component
const ColoringGame = ({ onClose, settings }) => {
  const canvasRef = useRef(null);
  const [selectedColor, setSelectedColor] = useState('#FF0000');
  
  const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080'];
  const buttonBg = settings.theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-[#FFB347] hover:bg-[#FFD580]';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw simple shapes to color
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 3;
      
      // Circle
      ctx.beginPath();
      ctx.arc(150, 150, 80, 0, Math.PI * 2);
      ctx.stroke();
      
      // Square
      ctx.strokeRect(300, 100, 100, 100);
      
      // Triangle
      ctx.beginPath();
      ctx.moveTo(550, 200);
      ctx.lineTo(500, 100);
      ctx.lineTo(600, 100);
      ctx.closePath();
      ctx.stroke();
    }
  }, []);

  const handleClick = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.fillStyle = selectedColor;
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fill();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-4xl w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold">🎨 Coloring Book</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">✕</button>
        </div>

        <div className="flex gap-4 mb-4">
          {colors.map(color => (
            <button
              key={color}
              onClick={() => setSelectedColor(color)}
              className={`w-12 h-12 rounded-full border-4 ${selectedColor === color ? 'border-black' : 'border-gray-300'}`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>

        <canvas
          ref={canvasRef}
          width={700}
          height={400}
          onClick={handleClick}
          className="border-2 border-gray-300 rounded-lg w-full cursor-pointer"
        />

        <p className="text-sm mt-4 text-center">Click on the shapes to color them!</p>
      </div>
    </div>
  );
};

// Sequencing Game Component  
const SequencingGame = ({ stories, onClose, settings }) => {
  const [selectedStory, setSelectedStory] = useState(null);
  const [shuffledPages, setShuffledPages] = useState([]);
  const [userOrder, setUserOrder] = useState([]);
  const [showResult, setShowResult] = useState(false);

  const cardBg = settings.theme === 'dark' ? 'bg-gray-800' : 'bg-[#FFF8DC]';
  const buttonBg = settings.theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-[#FFB347] hover:bg-[#FFD580]';

  const storiesWithPages = stories.filter(s => s.pages && s.pages.length >= 3);

  useEffect(() => {
    if (selectedStory) {
      const pages = selectedStory.pages.slice(0, 5);
      const shuffled = [...pages].sort(() => Math.random() - 0.5);
      setShuffledPages(shuffled);
      setUserOrder([]);
      setShowResult(false);
    }
  }, [selectedStory]);

  const addToOrder = (page) => {
    if (!userOrder.includes(page)) {
      setUserOrder([...userOrder, page]);
    }
  };

  const removeFromOrder = (page) => {
    setUserOrder(userOrder.filter(p => p !== page));
  };

  const checkOrder = () => {
    const correctOrder = selectedStory.pages.slice(0, 5);
    const isCorrect = userOrder.every((page, index) => page.id === correctOrder[index].id);
    setShowResult(true);
    if (isCorrect) {
      alert('🎉 Perfect! You got the story in the right order!');
    }
  };

  if (!selectedStory) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold">🔢 Story Sequencing</h2>
          <button onClick={onClose} className={`${buttonBg} px-4 py-2 rounded-lg font-semibold`}>
            Back to Games
          </button>
        </div>

        <div className={`${cardBg} p-6 rounded-xl`}>
          <p className="text-lg mb-4">Choose a story to practice sequencing:</p>
          {storiesWithPages.length > 0 ? (
            <div className="space-y-2">
              {storiesWithPages.map(story => (
                <button
                  key={story.id}
                  onClick={() => setSelectedStory(story)}
                  className={`${buttonBg} w-full p-4 rounded-lg text-left transition-all hover:scale-102`}
                >
                  <span className="font-bold">{story.title}</span>
                  <span className="text-sm opacity-75 ml-2">({story.pages.length} pages)</span>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">Create stories with at least 3 pages to play this game!</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Put "{selectedStory.title}" in Order</h2>
        <button onClick={() => setSelectedStory(null)} className={`${buttonBg} px-4 py-2 rounded-lg font-semibold`}>
          Choose Different Story
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-xl font-bold mb-4">Available Pages (Click to Add)</h3>
          <div className="space-y-2">
            {shuffledPages.map((page, i) => (
              <button
                key={i}
                onClick={() => addToOrder(page)}
                disabled={userOrder.includes(page)}
                className={`w-full p-4 rounded-lg text-left transition-all ${
                  userOrder.includes(page) ? 'bg-gray-300 cursor-not-allowed' : `${cardBg} hover:shadow-lg`
                }`}
              >
                <p className="line-clamp-2">{page.text || 'Empty page'}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-4">Your Order (Click to Remove)</h3>
          <div className="space-y-2 mb-4">
            {userOrder.length === 0 ? (
              <div className={`${cardBg} p-8 rounded-lg text-center`}>
                <p className="text-gray-500">Click pages on the left to add them here</p>
              </div>
            ) : (
              userOrder.map((page, i) => (
                <button
                  key={i}
                  onClick={() => removeFromOrder(page)}
                  className={`w-full p-4 rounded-lg text-left ${cardBg} hover:bg-red-100 transition-all`}
                >
                  <span className="font-bold mr-2">{i + 1}.</span>
                  <p className="inline line-clamp-2">{page.text || 'Empty page'}</p>
                </button>
              ))
            )}
          </div>

          {userOrder.length === shuffledPages.length && (
            <button
              onClick={checkOrder}
              className={`${buttonBg} w-full py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105`}
            >
              Check My Answer!
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Settings View Component
const SettingsView = ({ settings, setSettings, setView }) => {
  const cardBg = settings.theme === 'dark' ? 'bg-gray-800' : 'bg-[#FFF8DC]';
  const buttonBg = settings.theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-[#FFB347] hover:bg-[#FFD580]';

  const toggleSetting = (key) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  const updateSetting = (key, value) => {
    setSettings({ ...settings, [key]: value });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Settings</h2>
        <button onClick={() => setView('home')} className={`${buttonBg} px-4 py-2 rounded-lg font-semibold transition-all`}>
          Back to Home
        </button>
      </div>

      <div className={`${cardBg} p-6 rounded-xl shadow-lg space-y-6`}>
        <div>
          <h3 className="text-xl font-bold mb-4">Appearance</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">Theme</p>
                <p className="text-sm opacity-75">Choose light or dark mode</p>
              </div>
              <button
                onClick={() => updateSetting('theme', settings.theme === 'light' ? 'dark' : 'light')}
                className={`${buttonBg} px-4 py-2 rounded-lg transition-all flex items-center gap-2`}
              >
                {settings.theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                {settings.theme === 'light' ? 'Dark' : 'Light'}
              </button>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">Font Size</p>
                <p className="text-sm opacity-75">Adjust text size</p>
              </div>
              <select
                value={settings.fontSize}
                onChange={(e) => updateSetting('fontSize', e.target.value)}
                className="px-4 py-2 rounded-lg border-2 border-[#8ED1FC] bg-white text-[#333333]"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">Font Family</p>
                <p className="text-sm opacity-75">Choose readable font</p>
              </div>
              <select
                value={settings.fontFamily}
                onChange={(e) => updateSetting('fontFamily', e.target.value)}
                className="px-4 py-2 rounded-lg border-2 border-[#8ED1FC] bg-white text-[#333333]"
              >
                <option value="default">Default</option>
                <option value="dyslexic">Dyslexic-Friendly</option>
              </select>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">High Contrast</p>
                <p className="text-sm opacity-75">Increase contrast for better visibility</p>
              </div>
              <button
                onClick={() => toggleSetting('highContrast')}
                className={`px-4 py-2 rounded-lg transition-all ${settings.highContrast ? 'bg-green-500 text-white' : 'bg-gray-300'}`}
              >
                {settings.highContrast ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        </div>

        <hr className="border-gray-300" />

        <div>
          <h3 className="text-xl font-bold mb-4">Accessibility</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">Text-to-Speech</p>
                <p className="text-sm opacity-75">Read stories aloud</p>
              </div>
              <button
                onClick={() => toggleSetting('ttsEnabled')}
                className={`px-4 py-2 rounded-lg transition-all ${settings.ttsEnabled ? 'bg-green-500 text-white' : 'bg-gray-300'}`}
              >
                {settings.ttsEnabled ? 'ON' : 'OFF'}
              </button>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">Highlight Words While Reading</p>
                <p className="text-sm opacity-75">Highlight each word as it's spoken</p>
              </div>
              <button
                onClick={() => toggleSetting('highlightWords')}
                className={`px-4 py-2 rounded-lg transition-all ${settings.highlightWords ? 'bg-green-500 text-white' : 'bg-gray-300'}`}
              >
                {settings.highlightWords ? 'ON' : 'OFF'}
              </button>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">Animations</p>
                <p className="text-sm opacity-75">Enable smooth transitions</p>
              </div>
              <button
                onClick={() => toggleSetting('animations')}
                className={`px-4 py-2 rounded-lg transition-all ${settings.animations ? 'bg-green-500 text-white' : 'bg-gray-300'}`}
              >
                {settings.animations ? 'ON' : 'OFF'}
              </button>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">Keyboard Navigation</p>
                <p className="text-sm opacity-75">Navigate with keyboard</p>
              </div>
              <button
                onClick={() => toggleSetting('keyboardNavigation')}
                className={`px-4 py-2 rounded-lg transition-all ${settings.keyboardNavigation ? 'bg-green-500 text-white' : 'bg-gray-300'}`}
              >
                {settings.keyboardNavigation ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        </div>

        <hr className="border-gray-300" />

        <div>
          <h3 className="text-xl font-bold mb-4">Learning Mode</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">Wizard Mode</p>
                <p className="text-sm opacity-75">Step-by-step guided story creation</p>
              </div>
              <button
                onClick={() => toggleSetting('wizardMode')}
                className={`px-4 py-2 rounded-lg transition-all ${settings.wizardMode ? 'bg-green-500 text-white' : 'bg-gray-300'}`}
              >
                {settings.wizardMode ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        </div>

        <hr className="border-gray-300" />

        <div>
          <h3 className="text-xl font-bold mb-4">Parent/Teacher Controls</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">Safe Mode</p>
                <p className="text-sm opacity-75">Read-only mode (no editing)</p>
              </div>
              <button
                onClick={() => toggleSetting('safeMode')}
                className={`px-4 py-2 rounded-lg transition-all ${settings.safeMode ? 'bg-green-500 text-white' : 'bg-gray-300'}`}
              >
                {settings.safeMode ? <Lock className="w-5 h-5 inline mr-1" /> : <Unlock className="w-5 h-5 inline mr-1" />}
                {settings.safeMode ? 'ON' : 'OFF'}
              </button>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">Parental Controls</p>
                <p className="text-sm opacity-75">Hide delete buttons</p>
              </div>
              <button
                onClick={() => toggleSetting('parentalControls')}
                className={`px-4 py-2 rounded-lg transition-all ${settings.parentalControls ? 'bg-green-500 text-white' : 'bg-gray-300'}`}
              >
                {settings.parentalControls ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        </div>

        <hr className="border-gray-300" />

        <div>
          <h3 className="text-xl font-bold mb-4">About</h3>
          <p className="text-sm opacity-75">
            Interactive Story Creator v2.0 - A comprehensive creative writing tool designed for children, 
            especially those with autism. This app helps develop storytelling skills, creativity, 
            self-expression, and emotional intelligence in a fun, accessible, and supportive way.
          </p>
          <p className="text-sm opacity-75 mt-2">
            Features include: Drawing tools, voice input, pictogram suggestions, progress tracking, 
            mini games, certificates, and much more!
          </p>
        </div>
      </div>
    </div>
  );
};

// Rewards Modal Component
const RewardsModal = ({ onClose, settings, rewardType, story }) => {
  const cardBg = settings.theme === 'dark' ? 'bg-gray-800' : 'bg-[#FFF8DC]';

  if (rewardType === 'certificate') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className={`${cardBg} rounded-xl shadow-2xl p-8 max-w-2xl w-full text-center ${settings.animations ? 'animate-bounce' : ''}`}>
          <div className="border-8 border-yellow-500 rounded-xl p-8 bg-gradient-to-br from-yellow-100 to-orange-100">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-4xl font-bold mb-4 text-yellow-800">Certificate of Achievement</h2>
            <p className="text-2xl mb-2">This certifies that</p>
            <p className="text-3xl font-bold mb-4 text-purple-800">Amazing Author</p>
            <p className="text-xl mb-2">has successfully completed</p>
            <p className="text-2xl font-bold mb-4 text-blue-800">"{story?.title}"</p>
            <p className="text-lg mb-6">with {story?.pages?.length} pages and {story?.wordCount} words!</p>
            <div className="flex justify-center gap-4 mb-4">
              <Star className="w-8 h-8 text-yellow-500" />
              <Trophy className="w-8 h-8 text-yellow-600" />
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
            <p className="text-sm text-gray-600">Date: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="flex gap-4 mt-6 justify-center">
            <button
              onClick={() => window.print()}
              className="bg-[#FFB347] hover:bg-[#FFD580] px-6 py-3 rounded-lg font-bold transition-all"
            >
              <Printer className="w-5 h-5 inline mr-2" />
              Print Certificate
            </button>
            <button
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 px-6 py-3 rounded-lg font-bold transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${cardBg} rounded-xl shadow-2xl p-8 max-w-md w-full text-center ${settings.animations ? 'animate-bounce' : ''}`}>
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-3xl font-bold mb-4">Amazing Work!</h2>
        <p className="text-xl mb-6">You've earned a new badge!</p>
        
        <div className="flex justify-center gap-4 mb-6">
          <Star className="w-12 h-12 text-yellow-500" />
          <Award className="w-12 h-12 text-purple-500" />
          <Sparkles className="w-12 h-12 text-pink-500" />
        </div>

        <p className="mb-6">Keep creating wonderful stories!</p>

        <button
          onClick={onClose}
          className="bg-[#FFB347] hover:bg-[#FFD580] px-8 py-3 rounded-lg font-bold text-lg transition-all"
        >
          Continue Writing
        </button>
      </div>
    </div>
  );
};

export default App;