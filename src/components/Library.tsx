import React, { useEffect, useState } from 'react';
import { 
  Image as ImageIcon, 
  Video as VideoIcon, 
  Download, 
  Trash2, 
  Maximize2, 
  Search,
  Filter,
  Grid,
  List,
  Clock,
  Calendar
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface Asset {
  id: string;
  url: string;
  prompt: string;
  type: 'image' | 'video';
  aspectRatio: string;
  timestamp: number;
}

export const Library = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filter, setFilter] = useState<'all' | 'image' | 'video'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('nanogen_library');
    if (saved) {
      setAssets(JSON.parse(saved));
    }
  }, []);

  const filteredAssets = assets.filter(asset => {
    const matchesFilter = filter === 'all' || asset.type === filter;
    const matchesSearch = asset.prompt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const deleteAsset = (id: string) => {
    const updated = assets.filter(a => a.id !== id);
    setAssets(updated);
    localStorage.setItem('nanogen_library', JSON.stringify(updated));
    if (selectedAsset?.id === id) setSelectedAsset(null);
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a]">
      {/* Header */}
      <div className="px-8 py-6 border-b border-zinc-800/50 bg-[#0d0d0d]/50 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Personal Library</h1>
            <p className="text-sm text-zinc-500">Manage and view all your AI creations in one place.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-purple-400 transition-colors" />
              <input 
                type="text" 
                placeholder="Search prompt..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-zinc-900/50 border border-zinc-800 rounded-xl py-2 pl-10 pr-4 text-sm text-zinc-200 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/10 transition-all w-full md:w-64"
              />
            </div>
            <div className="flex p-1 bg-zinc-900/50 border border-zinc-800 rounded-xl">
              {(['all', 'image', 'video'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all",
                    filter === t ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
        {filteredAssets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-20 h-20 rounded-3xl bg-zinc-900 flex items-center justify-center mb-6 border border-zinc-800">
              <Grid className="w-10 h-10 text-zinc-700" />
            </div>
            <h2 className="text-xl font-bold text-zinc-300 mb-2">No assets found</h2>
            <p className="text-zinc-500 max-w-sm">
              {searchQuery ? "Try a different search term." : "Start generating content to build your library."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredAssets.map((asset) => (
                <motion.div
                  layout
                  key={asset.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={cn(
                    "group relative rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden cursor-pointer transition-all duration-300 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/10",
                    asset.aspectRatio === '1:1' ? 'aspect-square' : asset.aspectRatio === '9:16' ? 'aspect-[9/16]' : 'aspect-video'
                  )}
                  onClick={() => setSelectedAsset(asset)}
                >
                  {asset.type === 'video' ? (
                    <video 
                      src={asset.url} 
                      className="w-full h-full object-cover"
                      muted
                      loop
                      onMouseOver={(e) => e.currentTarget.play()}
                      onMouseOut={(e) => e.currentTarget.pause()}
                    />
                  ) : (
                    <img 
                      src={asset.url} 
                      alt={asset.prompt} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  
                  {/* Type Badge */}
                  <div className="absolute top-3 left-3 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 flex items-center gap-1.5">
                    {asset.type === 'video' ? <VideoIcon className="w-3 h-3 text-purple-400" /> : <ImageIcon className="w-3 h-3 text-blue-400" />}
                    <span className="text-[10px] font-bold text-white uppercase tracking-wider">{asset.type}</span>
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <p className="text-xs text-white font-medium line-clamp-2 mb-3">{asset.prompt}</p>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); window.open(asset.url, '_blank'); }}
                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-[10px] font-bold transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); deleteAsset(asset.id); }}
                        className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 backdrop-blur-md text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Asset Modal */}
      <AnimatePresence>
        {selectedAsset && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-black/95 backdrop-blur-xl"
            onClick={() => setSelectedAsset(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-6xl w-full max-h-full flex flex-col md:flex-row gap-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex-1 flex items-center justify-center bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl">
                {selectedAsset.type === 'video' ? (
                  <video 
                    src={selectedAsset.url} 
                    controls 
                    autoPlay 
                    loop 
                    className="max-w-full max-h-[70vh] md:max-h-[85vh]"
                  />
                ) : (
                  <img 
                    src={selectedAsset.url} 
                    alt={selectedAsset.prompt} 
                    className="max-w-full max-h-[70vh] md:max-h-[85vh] object-contain"
                    referrerPolicy="no-referrer"
                  />
                )}
              </div>
              
              <div className="w-full md:w-80 flex flex-col gap-6">
                <div>
                  <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Prompt</h3>
                  <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-300 leading-relaxed">
                    {selectedAsset.prompt}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-zinc-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-zinc-500 uppercase">Created On</p>
                      <p className="text-sm font-medium text-zinc-200">
                        {new Date(selectedAsset.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center">
                      <Filter className="w-5 h-5 text-zinc-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-zinc-500 uppercase">Aspect Ratio</p>
                      <p className="text-sm font-medium text-zinc-200">{selectedAsset.aspectRatio}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-auto flex flex-col gap-3">
                  <button 
                    onClick={() => window.open(selectedAsset.url, '_blank')}
                    className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-white text-black font-bold hover:bg-zinc-200 transition-colors"
                  >
                    <Download className="w-5 h-5" />
                    Download {selectedAsset.type === 'video' ? 'Video' : 'Image'}
                  </button>
                  <button 
                    onClick={() => deleteAsset(selectedAsset.id)}
                    className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-red-500/10 text-red-500 font-bold hover:bg-red-500/20 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                    Delete Asset
                  </button>
                </div>
              </div>

              <button 
                onClick={() => setSelectedAsset(null)}
                className="absolute -top-12 right-0 md:-right-12 p-2 text-zinc-400 hover:text-white transition-colors"
              >
                <Maximize2 className="w-8 h-8" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
