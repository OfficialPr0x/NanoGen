import React, { useState } from 'react';
import { 
  Sparkles, 
  Video as VideoIcon, 
  Download, 
  Trash2, 
  Maximize2, 
  Loader2,
  ChevronRight,
  Info,
  Zap,
  RectangleHorizontal,
  RectangleVertical,
  Monitor,
  Smartphone,
  Play,
  Clock,
  X,
  Wand2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { generateVideo, type VideoResolution } from '../lib/gemini';
import { generateKieVideo, type VideoModel, type AspectRatio, type TaskProgress } from '../lib/kie';

interface GeneratedVideo {
  id: string;
  url: string;
  prompt: string;
  aspectRatio: AspectRatio;
  resolution: VideoResolution;
  model: VideoModel;
  timestamp: number;
}

const VIDEO_MODELS: { label: string; value: VideoModel; provider: string; tag?: string }[] = [
  { label: 'Veo 3.1 Quality', value: 'veo3', provider: 'Google Veo', tag: 'Best' },
  { label: 'Veo 3.1 Fast', value: 'veo3_fast', provider: 'Google Veo', tag: 'Popular' },
  { label: 'Veo 3.1 Lite', value: 'veo3_lite', provider: 'Google Veo', tag: 'Cheap' },
  { label: 'Kling v2.1 Pro', value: 'kling-v2.1-pro', provider: 'Kling' },
  { label: 'Kling v2.5', value: 'kling-v2.5', provider: 'Kling', tag: 'New' },
  { label: 'Sora 2 Pro', value: 'sora-2-pro', provider: 'Sora' },
  { label: 'Bytedance v1 Pro', value: 'bytedance-v1-pro', provider: 'Bytedance' },
  { label: 'Bytedance v1 Lite', value: 'bytedance-v1-lite', provider: 'Bytedance', tag: 'Fast' },
  { label: 'Hailuo 2.3 Pro', value: 'hailuo-2.3-pro', provider: 'Hailuo' },
  { label: 'Wan 2.6', value: 'wan-2.6', provider: 'Wan' },
  { label: 'Wan 2.6 Turbo', value: 'wan-2.6-turbo', provider: 'Wan', tag: 'Fast' },
  { label: 'Grok Video', value: 'grok-video', provider: 'Grok' },
];

const ASPECT_RATIOS: { label: string; value: AspectRatio; icon: React.ElementType }[] = [
  { label: 'Landscape', value: '16:9', icon: RectangleHorizontal },
  { label: 'Portrait', value: '9:16', icon: RectangleVertical },
  { label: 'Auto', value: 'Auto', icon: Wand2 },
];

const RESOLUTIONS: { label: string; value: VideoResolution; icon: React.ElementType }[] = [
  { label: '720p', value: '720p', icon: Smartphone },
  { label: '1080p', value: '1080p', icon: Monitor },
];

export const VideoGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState<VideoModel>('veo3_fast');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [resolution, setResolution] = useState<VideoResolution>('720p');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressStatus, setProgressStatus] = useState<TaskProgress | null>(null);
  const [videos, setVideos] = useState<GeneratedVideo[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<GeneratedVideo | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    const kieApiKey = localStorage.getItem('kie_api_key');
    if (!kieApiKey) {
      setErrorMessage('Kie API key is missing. Please go to Settings to add your key.');
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);
    setProgressStatus({ stage: 'submitting', message: 'Preparing request...' });
    try {
      // Use Kie API for video generation
      const videoUrl = await generateKieVideo({
        prompt,
        aspectRatio,
        resolution,
        model,
        apiKey: kieApiKey,
        onProgress: setProgressStatus,
      });

      const newVideo: GeneratedVideo = {
        id: Math.random().toString(36).substr(2, 9),
        url: videoUrl,
        prompt,
        aspectRatio,
        resolution,
        model,
        timestamp: Date.now(),
      };

      setVideos(prev => [newVideo, ...prev]);
      
      // Save to library
      const saved = localStorage.getItem('nanogen_library');
      const library = saved ? JSON.parse(saved) : [];
      localStorage.setItem('nanogen_library', JSON.stringify([{
        ...newVideo,
        type: 'video'
      }, ...library]));

    } catch (error) {
      console.error('Video generation failed:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Video generation failed. Please check your API key.');
    } finally {
      setIsGenerating(false);
      setProgressStatus(null);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-6 py-4 border-b border-zinc-800/50 flex items-center justify-between bg-[#0d0d0d]/50 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-zinc-500">Generation</span>
          <ChevronRight className="w-4 h-4 text-zinc-700" />
          <span className="text-zinc-200 font-medium">Motion Generation ({VIDEO_MODELS.find(m => m.value === model)?.label || model})</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold">
            <Zap className="w-3.5 h-3.5 fill-purple-400" />
            500 Tokens
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <aside className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-zinc-800/50 bg-[#0d0d0d] overflow-y-auto p-6 space-y-8 scrollbar-hide">
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Video Settings</h3>
              <Info className="w-4 h-4 text-zinc-600 cursor-help" />
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="text-xs font-medium text-zinc-500 block mb-3">Model</label>
                <div className="space-y-1.5 max-h-52 overflow-y-auto scrollbar-hide">
                  {VIDEO_MODELS.map((m) => (
                    <button
                      key={m.value}
                      onClick={() => setModel(m.value)}
                      className={cn(
                        "w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border text-left transition-all duration-200",
                        model === m.value
                          ? "bg-purple-600/10 border-purple-500/50 text-purple-400"
                          : "bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
                      )}
                    >
                      <div className="min-w-0">
                        <span className="text-xs font-bold block truncate">{m.label}</span>
                        <span className="text-[10px] text-zinc-600">{m.provider}</span>
                      </div>
                      {m.tag && (
                        <span className={cn(
                          "shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase",
                          m.tag === 'Popular' ? 'bg-amber-500/10 text-amber-400' :
                          m.tag === 'New' ? 'bg-emerald-500/10 text-emerald-400' :
                          'bg-blue-500/10 text-blue-400'
                        )}>{m.tag}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-500 block mb-3">Aspect Ratio</label>
                <div className="grid grid-cols-3 gap-2">
                  {ASPECT_RATIOS.map((ratio) => {
                    const Icon = ratio.icon;
                    return (
                      <button
                        key={ratio.value}
                        onClick={() => setAspectRatio(ratio.value)}
                        className={cn(
                          "flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all duration-200",
                          aspectRatio === ratio.value 
                            ? "bg-purple-600/10 border-purple-500/50 text-purple-400" 
                            : "bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
                        )}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-[10px] font-bold">{ratio.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-500 block mb-3">Resolution</label>
                <div className="grid grid-cols-2 gap-2">
                  {RESOLUTIONS.map((res) => {
                    const Icon = res.icon;
                    return (
                      <button
                        key={res.value}
                        onClick={() => setResolution(res.value)}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-xl border transition-all duration-200",
                          resolution === res.value 
                            ? "bg-purple-600/10 border-purple-500/50 text-purple-400" 
                            : "bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-xs font-bold">{res.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
                <div className="flex items-center gap-2 text-zinc-400 mb-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs font-bold">Estimated Time</span>
                </div>
                <p className="text-[10px] text-zinc-500 leading-relaxed">
                  Video generation typically takes 30-120 seconds depending on model and complexity.
                </p>
              </div>
            </div>
          </section>
        </aside>

        <div className="flex-1 flex flex-col bg-[#0a0a0a] overflow-hidden relative">
          <div className="p-6 border-b border-zinc-800/50 bg-[#0d0d0d]/30">
            <div className="max-w-4xl mx-auto relative">
              <AnimatePresence>
                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium flex items-center justify-between"
                  >
                    <span>{errorMessage}</span>
                    <button onClick={() => setErrorMessage(null)} className="p-1 hover:bg-red-500/10 rounded-lg">
                      <X className="w-3 h-3" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="relative group">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the motion you want to see... (e.g., 'A cinematic drone shot of a futuristic city at sunset')"
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 pr-32 min-h-[120px] text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/50 transition-all resize-none shadow-inner"
                />
                <div className="absolute bottom-4 right-4 flex items-center gap-2">
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating || !prompt.trim()}
                    className={cn(
                      "flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 shadow-lg shadow-purple-500/20",
                      isGenerating || !prompt.trim()
                        ? "bg-zinc-800 text-zinc-500 cursor-not-allowed shadow-none"
                        : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:scale-[1.02] active:scale-[0.98]"
                    )}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating Video...
                      </>
                    ) : (
                      <>
                        <VideoIcon className="w-4 h-4" />
                        Create Motion
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
            <div className="max-w-7xl mx-auto">
              {videos.length === 0 && !isGenerating ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-20 h-20 rounded-3xl bg-zinc-900 flex items-center justify-center mb-6 border border-zinc-800">
                    <VideoIcon className="w-10 h-10 text-zinc-700" />
                  </div>
                  <h2 className="text-xl font-bold text-zinc-300 mb-2">Create Your First Video</h2>
                  <p className="text-zinc-500 max-w-sm">
                    Bring your ideas to life with high-quality AI video generation powered by Veo 3.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <AnimatePresence mode="popLayout">
                    {isGenerating && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className={cn(
                          "relative rounded-2xl bg-zinc-900/50 border border-zinc-800 overflow-hidden flex flex-col items-center justify-center gap-4 p-6",
                          aspectRatio === '9:16' ? 'aspect-[9/16]' : 'aspect-video'
                        )}
                      >
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full border-2 border-purple-500/20 border-t-purple-500 animate-spin" />
                          <VideoIcon className="absolute inset-0 m-auto w-5 h-5 text-purple-400 animate-pulse" />
                        </div>
                        <div className="text-center px-4">
                          <p className="text-xs font-bold text-zinc-400">
                            {progressStatus?.stage === 'submitting' && 'Submitting task...'}
                            {progressStatus?.stage === 'queued' && 'Queued — waiting for server...'}
                            {progressStatus?.stage === 'processing' && 'Generating your video...'}
                            {!progressStatus && 'Processing your video...'}
                          </p>
                          <p className="text-[10px] text-zinc-500 mt-1.5">
                            {progressStatus?.message || 'Please wait...'}
                          </p>
                          {progressStatus?.taskId && (
                            <p className="text-[9px] text-zinc-700 mt-2 font-mono truncate max-w-[200px]">
                              Task: {progressStatus.taskId}
                            </p>
                          )}
                          {progressStatus?.elapsed != null && progressStatus.elapsed > 30 && (
                            <p className="text-[10px] text-amber-500/70 mt-1">
                              Video generation can take 1-3 minutes
                            </p>
                          )}
                        </div>
                      </motion.div>
                    )}
                    
                    {videos.map((vid) => (
                      <motion.div
                        layout
                        key={vid.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={cn(
                          "group relative rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden cursor-pointer transition-all duration-300 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/10",
                          vid.aspectRatio === '9:16' ? 'aspect-[9/16]' : 'aspect-video'
                        )}
                        onClick={() => setSelectedVideo(vid)}
                      >
                        <video 
                          src={vid.url} 
                          className="w-full h-full object-cover"
                          muted
                          loop
                          onMouseOver={(e) => e.currentTarget.play()}
                          onMouseOut={(e) => e.currentTarget.pause()}
                        />
                        <div className="absolute top-3 right-3 p-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
                          <Play className="w-3 h-3 text-white fill-white" />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                          <p className="text-xs text-white font-medium line-clamp-2 mb-3">{vid.prompt}</p>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={(e) => { e.stopPropagation(); window.open(vid.url, '_blank'); }}
                              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-[10px] font-bold transition-colors"
                            >
                              <Download className="w-3.5 h-3.5" />
                              Download
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); setSelectedVideo(vid); }}
                              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-md text-white transition-colors"
                            >
                              <Maximize2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-black/95 backdrop-blur-xl"
            onClick={() => setSelectedVideo(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-6xl w-full max-h-full flex flex-col md:flex-row gap-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex-1 flex items-center justify-center bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl">
                <video 
                  src={selectedVideo.url} 
                  controls 
                  autoPlay 
                  loop 
                  className="max-w-full max-h-[70vh] md:max-h-[85vh]"
                />
              </div>
              
              <div className="w-full md:w-80 flex flex-col gap-6">
                <div>
                  <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Prompt</h3>
                  <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-300 leading-relaxed">
                    {selectedVideo.prompt}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase mb-1">Resolution</p>
                    <p className="text-sm font-medium text-zinc-200">{selectedVideo.resolution}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase mb-1">Aspect Ratio</p>
                    <p className="text-sm font-medium text-zinc-200">{selectedVideo.aspectRatio}</p>
                  </div>
                </div>

                <div className="mt-auto flex flex-col gap-3">
                  <button 
                    onClick={() => window.open(selectedVideo.url, '_blank')}
                    className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-white text-black font-bold hover:bg-zinc-200 transition-colors"
                  >
                    <Download className="w-5 h-5" />
                    Download Video
                  </button>
                  <button 
                    onClick={() => {
                      setVideos(prev => prev.filter(v => v.id !== selectedVideo.id));
                      setSelectedVideo(null);
                    }}
                    className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-red-500/10 text-red-500 font-bold hover:bg-red-500/20 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                    Delete Video
                  </button>
                </div>
              </div>

              <button 
                onClick={() => setSelectedVideo(null)}
                className="absolute -top-12 right-0 md:-right-12 p-2 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-8 h-8" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
