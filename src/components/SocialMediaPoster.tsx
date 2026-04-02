import React, { useState, useEffect } from 'react';
import { 
  Send, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  Calendar, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  X,
  Plus,
  Instagram,
  Twitter,
  Linkedin,
  Facebook,
  Music2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { createPost } from '../lib/uploadPost';

interface MediaItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  thumbnail?: string;
}

const PLATFORMS = [
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'text-pink-500' },
  { id: 'twitter', name: 'Twitter', icon: Twitter, color: 'text-blue-400' },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'text-blue-600' },
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'text-blue-500' },
  { id: 'tiktok', name: 'TikTok', icon: Music2, color: 'text-white' },
];

export const SocialMediaPoster = () => {
  const [caption, setCaption] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishStatus, setPublishStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [showScheduler, setShowScheduler] = useState(false);

  // Load generated assets from library (simulated)
  const [libraryAssets, setLibraryAssets] = useState<MediaItem[]>([]);

  useEffect(() => {
    const savedImages = JSON.parse(localStorage.getItem('generated_images') || '[]');
    const savedVideos = JSON.parse(localStorage.getItem('generated_videos') || '[]');
    
    const assets: MediaItem[] = [
      ...savedImages.map((img: any) => ({ id: img.id, url: img.url, type: 'image' as const })),
      ...savedVideos.map((vid: any) => ({ id: vid.id, url: vid.url, type: 'video' as const, thumbnail: vid.thumbnail }))
    ];
    
    setLibraryAssets(assets);
  }, []);

  const togglePlatform = (id: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handlePublish = async () => {
    const apiKey = localStorage.getItem('upload_post_api_key');
    
    if (!apiKey) {
      setPublishStatus('error');
      setErrorMessage('Please configure your Upload-Post API key in Settings first.');
      return;
    }

    if (!caption && selectedMedia.length === 0) {
      setPublishStatus('error');
      setErrorMessage('Please add some content or media to your post.');
      return;
    }

    if (selectedPlatforms.length === 0) {
      setPublishStatus('error');
      setErrorMessage('Please select at least one platform.');
      return;
    }

    setIsPublishing(true);
    setPublishStatus('idle');
    setErrorMessage('');

    try {
      await createPost({
        apiKey,
        caption,
        platforms: selectedPlatforms,
        mediaUrls: selectedMedia.map(m => m.url),
        scheduledAt: scheduledDate || undefined
      });

      setPublishStatus('success');
      setCaption('');
      setSelectedMedia([]);
      setSelectedPlatforms([]);
      setScheduledDate('');
    } catch (error) {
      setPublishStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to publish post');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#0a0a0a] p-8 scrollbar-hide">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Send className="w-8 h-8 text-purple-500" />
            Social Media Poster
          </h1>
          <p className="text-zinc-500">Automate your content publishing across all platforms.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Composer */}
          <div className="lg:col-span-2 space-y-6">
            {/* Live Preview */}
            <div className="p-6 rounded-3xl bg-zinc-900/30 border border-zinc-800/50 backdrop-blur-sm">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-6 block">
                Live Preview
              </label>
              <div className="max-w-sm mx-auto bg-black rounded-3xl border border-zinc-800 overflow-hidden shadow-2xl">
                <div className="p-4 flex items-center gap-3 border-b border-zinc-900">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500" />
                  <span className="text-xs font-bold text-white">Your Profile</span>
                </div>
                <div className="aspect-square bg-zinc-900 flex items-center justify-center relative">
                  {selectedMedia.length > 0 ? (
                    <img 
                      src={selectedMedia[0].type === 'video' ? selectedMedia[0].thumbnail : selectedMedia[0].url} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="text-zinc-700 flex flex-col items-center gap-2">
                      <ImageIcon className="w-12 h-12" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">No Media Selected</span>
                    </div>
                  )}
                  {selectedMedia.length > 1 && (
                    <div className="absolute bottom-4 right-4 px-2 py-1 bg-black/50 rounded-lg text-[10px] text-white">
                      1 / {selectedMedia.length}
                    </div>
                  )}
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex items-center gap-4 text-white/80">
                    <div className="w-5 h-5 rounded-full border border-white/20" />
                    <div className="w-5 h-5 rounded-full border border-white/20" />
                    <div className="w-5 h-5 rounded-full border border-white/20" />
                  </div>
                  <p className="text-xs text-white/90 line-clamp-2">
                    <span className="font-bold mr-2">yourprofile</span>
                    {caption || "Your caption will appear here..."}
                  </p>
                </div>
              </div>
            </div>

            {/* Caption Editor */}
            <div className="p-6 rounded-3xl bg-zinc-900/30 border border-zinc-800/50 backdrop-blur-sm">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4 block">
                Caption
              </label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="What's on your mind? #NanoGen #AI"
                className="w-full h-40 bg-transparent text-white placeholder:text-zinc-700 resize-none focus:outline-none text-lg"
              />
            </div>

            {/* Media Selection */}
            <div className="p-6 rounded-3xl bg-zinc-900/30 border border-zinc-800/50 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-6">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                  Media Assets
                </label>
                <span className="text-[10px] text-zinc-600">Select from your library</span>
              </div>

              <div className="grid grid-cols-4 gap-4">
                {selectedMedia.map((item) => (
                  <div key={item.id} className="relative aspect-square rounded-xl overflow-hidden group">
                    <img 
                      src={item.type === 'video' ? item.thumbnail : item.url} 
                      alt="Selected asset" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <button 
                      onClick={() => setSelectedMedia(prev => prev.filter(m => m.id !== item.id))}
                      className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    {item.type === 'video' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <VideoIcon className="w-6 h-6 text-white/50" />
                      </div>
                    )}
                  </div>
                ))}
                
                {selectedMedia.length < 4 && (
                  <button 
                    onClick={() => {
                      document.getElementById('recent-generations')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="aspect-square rounded-xl border-2 border-dashed border-zinc-800 flex flex-col items-center justify-center gap-2 text-zinc-600 hover:text-zinc-400 hover:border-zinc-700 transition-all"
                  >
                    <Plus className="w-6 h-6" />
                    <span className="text-[10px] font-bold">Add Media</span>
                  </button>
                )}
              </div>

              {/* Library Quick Select */}
              <div className="mt-8" id="recent-generations">
                <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-4">Recent Generations</p>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {libraryAssets.slice(0, 8).map((asset) => (
                    <button
                      key={asset.id}
                      onClick={() => {
                        if (!selectedMedia.find(m => m.id === asset.id) && selectedMedia.length < 4) {
                          setSelectedMedia(prev => [...prev, asset]);
                        }
                      }}
                      className={cn(
                        "relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all",
                        selectedMedia.find(m => m.id === asset.id) ? "border-purple-500 scale-95" : "border-transparent opacity-60 hover:opacity-100"
                      )}
                    >
                      <img 
                        src={asset.type === 'video' ? asset.thumbnail : asset.url} 
                        alt="Library asset" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      {asset.type === 'video' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <VideoIcon className="w-3 h-3 text-white/50" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Controls */}
          <div className="space-y-6">
            {/* Platform Selector */}
            <div className="p-6 rounded-3xl bg-zinc-900/30 border border-zinc-800/50 backdrop-blur-sm">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-6 block">
                Publish To
              </label>
              <div className="space-y-3">
                {PLATFORMS.map((platform) => (
                  <button
                    key={platform.id}
                    onClick={() => togglePlatform(platform.id)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-2xl border transition-all",
                      selectedPlatforms.includes(platform.id)
                        ? "bg-white/5 border-white/10"
                        : "bg-transparent border-transparent opacity-40 hover:opacity-60"
                    )}
                  >
                    <div className={cn("w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center", platform.color)}>
                      <platform.icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold text-white">{platform.name}</span>
                    {selectedPlatforms.includes(platform.id) && (
                      <CheckCircle2 className="w-4 h-4 text-purple-500 ml-auto" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Scheduler */}
            <div className="p-6 rounded-3xl bg-zinc-900/30 border border-zinc-800/50 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                  Schedule
                </label>
                <button 
                  onClick={() => setShowScheduler(!showScheduler)}
                  className={cn(
                    "w-10 h-5 rounded-full transition-all relative",
                    showScheduler ? "bg-purple-600" : "bg-zinc-800"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-3 h-3 rounded-full bg-white transition-all",
                    showScheduler ? "right-1" : "left-1"
                  )} />
                </button>
              </div>
              
              <AnimatePresence>
                {showScheduler && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4 space-y-4">
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input 
                          type="datetime-local" 
                          value={scheduledDate}
                          onChange={(e) => setScheduledDate(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-purple-500/50"
                        />
                      </div>
                      <p className="text-[10px] text-zinc-600">
                        Post will be automatically published at the selected time.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Publish Button */}
            <button
              onClick={handlePublish}
              disabled={isPublishing}
              className={cn(
                "w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all",
                isPublishing 
                  ? "bg-zinc-800 text-zinc-500 cursor-not-allowed" 
                  : "bg-white text-black hover:scale-[1.02] active:scale-[0.98]"
              )}
            >
              {isPublishing ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Send className="w-6 h-6" />
                  {showScheduler ? 'Schedule Post' : 'Publish Now'}
                </>
              )}
            </button>

            {/* Status Messages */}
            <AnimatePresence>
              {publishStatus !== 'idle' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className={cn(
                    "p-4 rounded-2xl border flex items-start gap-3",
                    publishStatus === 'success' 
                      ? "bg-green-500/10 border-green-500/20 text-green-400" 
                      : "bg-red-500/10 border-red-500/20 text-red-400"
                  )}
                >
                  {publishStatus === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  )}
                  <div>
                    <p className="text-sm font-bold">
                      {publishStatus === 'success' ? 'Post Published!' : 'Publishing Failed'}
                    </p>
                    <p className="text-xs opacity-80 mt-1">
                      {publishStatus === 'success' 
                        ? 'Your content is being distributed across selected platforms.' 
                        : errorMessage}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
