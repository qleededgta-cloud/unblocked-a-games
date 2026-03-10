import React, { useState, useEffect } from 'react';
import { 
  Gamepad2, 
  Plus, 
  Search, 
  Lock, 
  LogOut, 
  Trash2, 
  Play, 
  X,
  LayoutGrid
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Game {
  id: number;
  title: string;
  url: string;
  thumbnail: string;
  category: string;
  description: string;
}

export default function App() {
  const [games, setGames] = useState<Game[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newGame, setNewGame] = useState({
    title: '',
    url: '',
    thumbnail: '',
    category: '',
    description: ''
  });

  useEffect(() => {
    fetchGames();
    const token = localStorage.getItem('adminToken');
    if (token === 'admin-session-token-2014') {
      setIsAdmin(true);
    }
  }, []);

  const fetchGames = async () => {
    try {
      const res = await fetch('/api/games');
      const data = await res.json();
      setGames(data);
    } catch (err) {
      console.error('Failed to fetch games', err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPassword })
      });
      const data = await res.json();
      if (data.success) {
        setIsAdmin(true);
        localStorage.setItem('adminToken', data.token);
        setShowAdminLogin(false);
        setAdminPassword('');
      } else {
        alert('Invalid password');
      }
    } catch (err) {
      alert('Login failed');
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem('adminToken');
  };

  const handleAddGame = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/games', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('adminToken') || ''
        },
        body: JSON.stringify(newGame)
      });
      if (res.ok) {
        fetchGames();
        setShowAddModal(false);
        setNewGame({ title: '', url: '', thumbnail: '', category: '', description: '' });
      } else {
        alert('Failed to add game');
      }
    } catch (err) {
      alert('Error adding game');
    }
  };

  const handleDeleteGame = async (id: number) => {
    if (!confirm('Are you sure you want to delete this game?')) return;
    try {
      const res = await fetch(`/api/games/${id}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': localStorage.getItem('adminToken') || ''
        }
      });
      if (res.ok) {
        fetchGames();
      }
    } catch (err) {
      alert('Delete failed');
    }
  };

  const filteredGames = games.filter(game => 
    game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    game.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans selection:bg-emerald-500/30">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setSelectedGame(null)}>
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Gamepad2 className="text-black w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight hidden sm:block">
              UNBLOCKED<span className="text-emerald-500">GAMES</span>
            </h1>
          </div>

          <div className="flex-1 max-w-md mx-4">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search games..." 
                className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin ? (
              <>
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="p-2 bg-emerald-500 hover:bg-emerald-400 text-black rounded-lg transition-colors"
                  title="Add Game"
                >
                  <Plus className="w-5 h-5" />
                </button>
                <button 
                  onClick={handleLogout}
                  className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-zinc-400 hover:text-white"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <button 
                onClick={() => setShowAdminLogin(true)}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-zinc-400 hover:text-white"
                title="Admin Login"
              >
                <Lock className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {selectedGame ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <button 
                  onClick={() => setSelectedGame(null)}
                  className="text-emerald-500 hover:text-emerald-400 text-sm font-medium flex items-center gap-1 mb-2"
                >
                  <X className="w-4 h-4" /> Back to Library
                </button>
                <h2 className="text-3xl font-bold">{selectedGame.title}</h2>
                <p className="text-zinc-400 text-sm">{selectedGame.category}</p>
              </div>
            </div>
            
            <div className="aspect-video w-full bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative group">
              <iframe 
                src={selectedGame.url} 
                className="w-full h-full border-none"
                allowFullScreen
                title={selectedGame.title}
              />
            </div>

            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-zinc-400 leading-relaxed">
                {selectedGame.description || "No description provided for this game."}
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-zinc-400">
                <LayoutGrid className="w-5 h-5" />
                <span className="text-sm font-medium uppercase tracking-wider">Library</span>
              </div>
              <div className="text-xs text-zinc-500">
                Showing {filteredGames.length} games
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredGames.map((game) => (
                  <motion.div
                    key={game.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="group relative bg-white/5 rounded-2xl overflow-hidden border border-white/10 hover:border-emerald-500/50 transition-all hover:shadow-2xl hover:shadow-emerald-500/10"
                  >
                    <div className="aspect-[4/3] overflow-hidden relative">
                      <img 
                        src={game.thumbnail} 
                        alt={game.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <button 
                          onClick={() => setSelectedGame(game)}
                          className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-black hover:scale-110 transition-transform shadow-lg"
                        >
                          <Play className="w-6 h-6 fill-current" />
                        </button>
                        {isAdmin && (
                          <button 
                            onClick={() => handleDeleteGame(game.id)}
                            className="w-12 h-12 bg-red-500/20 backdrop-blur-md rounded-full flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-lg group-hover:text-emerald-500 transition-colors truncate">
                            {game.title}
                          </h3>
                          <span className="text-xs text-zinc-500 font-medium uppercase tracking-wide">
                            {game.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {filteredGames.length === 0 && (
              <div className="py-20 text-center">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-zinc-600" />
                </div>
                <h3 className="text-xl font-medium text-zinc-400">No games found</h3>
                <p className="text-zinc-500 text-sm mt-1">Try searching for something else</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Admin Login Modal */}
      <AnimatePresence>
        {showAdminLogin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAdminLogin(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-3xl p-8 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
                  <Lock className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Admin Portal</h2>
                  <p className="text-zinc-500 text-sm">Enter password to manage games</p>
                </div>
              </div>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Password</label>
                  <input 
                    type="password" 
                    autoFocus
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-emerald-500 transition-all"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20"
                >
                  Access Dashboard
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Game Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-zinc-900 border border-white/10 rounded-3xl p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                    <Plus className="w-6 h-6 text-emerald-500" />
                  </div>
                  <h2 className="text-2xl font-bold">Add New Game</h2>
                </div>
                <button onClick={() => setShowAddModal(false)} className="text-zinc-500 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleAddGame} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Game Title</label>
                    <input 
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-emerald-500 transition-all"
                      value={newGame.title}
                      onChange={(e) => setNewGame({...newGame, title: e.target.value})}
                      placeholder="e.g. Minecraft Classic"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Game URL (Iframe Source)</label>
                    <input 
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-emerald-500 transition-all"
                      value={newGame.url}
                      onChange={(e) => setNewGame({...newGame, url: e.target.value})}
                      placeholder="https://example.com/game"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Category</label>
                    <input 
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-emerald-500 transition-all"
                      value={newGame.category}
                      onChange={(e) => setNewGame({...newGame, category: e.target.value})}
                      placeholder="Action, Puzzle, etc."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Thumbnail URL</label>
                    <input 
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-emerald-500 transition-all"
                      value={newGame.thumbnail}
                      onChange={(e) => setNewGame({...newGame, thumbnail: e.target.value})}
                      placeholder="https://picsum.photos/..."
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Description</label>
                    <textarea 
                      rows={3}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-emerald-500 transition-all resize-none"
                      value={newGame.description}
                      onChange={(e) => setNewGame({...newGame, description: e.target.value})}
                      placeholder="Tell us about the game..."
                    />
                  </div>
                </div>
                <button 
                  type="submit"
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-500/20 mt-4"
                >
                  Publish to Library
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="max-w-7xl mx-auto px-4 py-12 border-t border-white/5 text-center">
        <p className="text-zinc-500 text-sm">
          &copy; 2024 Unblocked Games Hub. Built for the community.
        </p>
      </footer>
    </div>
  );
}
