import React, { useState, useRef } from 'react';
import { 
  Sparkles, 
  Image as ImageIcon, 
  Upload, 
  Download, 
  Trash2, 
  Maximize2, 
  Loader2,
  ChevronRight,
  Info,
  Zap,
  LayoutGrid,
  Square,
  RectangleHorizontal,
  RectangleVertical,
  Plus,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { generateImage, type AspectRatio } from '../lib/gemini';
import { generateKieImage, type ImageModel, type TaskProgress } from '../lib/kie';

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  aspectRatio: AspectRatio;
  model: ImageModel;
  timestamp: number;
}

const IMAGE_MODELS: { label: string; value: ImageModel; provider: string; tag?: string }[] = [
  { label: 'Gemini Flash', value: 'gemini', provider: 'Google', tag: 'Default' },
  { label: 'Seedream', value: 'seedream', provider: 'Seedream' },
  { label: 'Z-Image', value: 'z-image', provider: 'Z-Image' },
  { label: 'Google Imagen', value: 'google-imagen', provider: 'Google' },
  { label: 'Flux-2', value: 'flux2', provider: 'Flux' },
  { label: 'Grok Imagine', value: 'grok-imagine', provider: 'xAI' },
  { label: 'GPT Image', value: 'gpt-image', provider: 'OpenAI', tag: 'Popular' },
  { label: 'Topaz', value: 'topaz', provider: 'Topaz' },
  { label: 'Recraft', value: 'recraft', provider: 'Recraft' },
  { label: 'Ideogram', value: 'ideogram', provider: 'Ideogram' },
  { label: 'Qwen', value: 'qwen', provider: 'Alibaba' },
  { label: '4o Image', value: '4o-image', provider: 'OpenAI', tag: 'New' },
  { label: 'Flux Kontext', value: 'flux-kontext', provider: 'Flux', tag: 'New' },
  { label: 'Wan', value: 'wan-image', provider: 'Wan' },
];

const ASPECT_RATIOS: { label: string; value: AspectRatio; icon: React.ElementType }[] = [
  { label: 'Square', value: '1:1', icon: Square },
  { label: 'Landscape', value: '16:9', icon: RectangleHorizontal },
  { label: 'Portrait', value: '9:16', icon: RectangleVertical },
];

export const ImageGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState<ImageModel>('gemini');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressStatus, setProgressStatus] = useState<TaskProgress | null>(null);
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setErrorMessage(null);
    setProgressStatus(model === 'gemini' ? { stage: 'processing', message: 'Generating with Gemini...' } : { stage: 'submitting', message: 'Preparing request...' });
    try {
      let imageUrl: string;

      if (model === 'gemini') {
        imageUrl = await generateImage({
          prompt,
          aspectRatio,
          image: uploadedImage?.split(',')[1],
        });
      } else {
        const kieApiKey = localStorage.getItem('kie_api_key');
        if (!kieApiKey) {
          throw new Error('KIE API key is missing. Please go to Settings to add your key.');
        }
        imageUrl = await generateKieImage({
          prompt,
          aspectRatio,
          model,
          apiKey: kieApiKey,
          onProgress: setProgressStatus,
        });
      }

      const newImage: GeneratedImage = {
        id: Math.random().toString(36).substr(2, 9),
        url: imageUrl,
        prompt,
        aspectRatio,
        model,
        timestamp: Date.now(),
      };

      setImages(prev => [newImage, ...prev]);
      
      // Save to library
      const saved = localStorage.getItem('nanogen_library');
      const library = saved ? JSON.parse(saved) : [];
      localStorage.setItem('nanogen_library', JSON.stringify([{
        ...newImage,
        type: 'image'
      }, ...library]));

    } catch (error) {
      console.error('Generation failed:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Image generation failed.');
    } finally {
      setIsGenerating(false);
      setProgressStatus(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadImage = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Top Bar / Breadcrumbs */}
      <div className="px-6 py-4 border-b border-zinc-800/50 flex items-center justify-between bg-[#0d0d0d]/50 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-zinc-500">Generation</span>
          <ChevronRight className="w-4 h-4 text-zinc-700" />
          <span className="text-zinc-200 font-medium">Image Generation ({IMAGE_MODELS.find(m => m.value === model)?.label || 'Gemini'})</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold">
            <Zap className="w-3.5 h-3.5 fill-purple-400" />
            150 Tokens
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Settings Panel (Left on Desktop, Top on Mobile) */}
        <aside className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-zinc-800/50 bg-[#0d0d0d] overflow-y-auto p-6 space-y-8 scrollbar-hide">
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Image Settings</h3>
              <Info className="w-4 h-4 text-zinc-600 cursor-help" />
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="text-xs font-medium text-zinc-500 block mb-3">Model</label>
                <div className="space-y-1.5 max-h-52 overflow-y-auto scrollbar-hide">
                  {IMAGE_MODELS.map((m) => (
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
                          m.tag === 'Default' ? 'bg-emerald-500/10 text-emerald-400' :
                          m.tag === 'New' ? 'bg-blue-500/10 text-blue-400' :
                          'bg-zinc-500/10 text-zinc-400'
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
                <label className="text-xs font-medium text-zinc-500 block mb-3">Image Guidance</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "relative group cursor-pointer aspect-video rounded-xl border-2 border-dashed border-zinc-800 hover:border-purple-500/50 bg-zinc-900/30 flex flex-col items-center justify-center transition-all duration-200 overflow-hidden",
                    uploadedImage && "border-solid border-purple-500/30"
                  )}
                >
                  {uploadedImage ? (
                    <>
                      <img src={uploadedImage} alt="Reference" className="w-full h-full object-cover opacity-50" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Plus className="w-6 h-6 text-white mb-1" />
                        <span className="text-xs font-bold text-white">Change Image</span>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setUploadedImage(null); }}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-zinc-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center mb-2 group-hover:bg-purple-500/20 group-hover:text-purple-400 transition-colors">
                        <Upload className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-zinc-500 group-hover:text-zinc-300">Upload Reference</span>
                      <span className="text-[10px] text-zinc-600 mt-1">Image-to-Image</span>
                    </>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                    className="hidden" 
                    accept="image/*" 
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="pt-6 border-t border-zinc-800/50">
            <div className="p-4 rounded-xl bg-gradient-to-br from-purple-600/20 to-indigo-600/20 border border-purple-500/20">
              <h4 className="text-xs font-bold text-purple-400 mb-1 flex items-center gap-2">
                <Sparkles className="w-3 h-3" />
                Pro Tip
              </h4>
              <p className="text-[10px] text-zinc-400 leading-relaxed">
                Use descriptive adjectives like "cinematic", "hyper-realistic", or "cyberpunk" for better results.
              </p>
            </div>
          </section>
        </aside>

        {/* Main Generation Area */}
        <div className="flex-1 flex flex-col bg-[#0a0a0a] overflow-hidden relative">
          {/* Prompt Input Area */}
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
                  placeholder="Describe what you want to create..."
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
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Generate
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Gallery Area */}
          <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
            <div className="max-w-7xl mx-auto">
              {images.length === 0 && !isGenerating ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-20 h-20 rounded-3xl bg-zinc-900 flex items-center justify-center mb-6 border border-zinc-800">
                    <ImageIcon className="w-10 h-10 text-zinc-700" />
                  </div>
                  <h2 className="text-xl font-bold text-zinc-300 mb-2">Start Creating</h2>
                  <p className="text-zinc-500 max-w-sm">
                    Enter a prompt above and watch your imagination come to life with Mystic Marv AI.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  <AnimatePresence mode="popLayout">
                    {isGenerating && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className={cn(
                          "relative rounded-2xl bg-zinc-900/50 border border-zinc-800 overflow-hidden flex flex-col items-center justify-center gap-4",
                          aspectRatio === '1:1' ? 'aspect-square' : aspectRatio === '9:16' ? 'aspect-[9/16]' : 'aspect-video'
                        )}
                      >
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full border-2 border-purple-500/20 border-t-purple-500 animate-spin" />
                          <Sparkles className="absolute inset-0 m-auto w-5 h-5 text-purple-400 animate-pulse" />
                        </div>
                        <div className="text-center px-4">
                          <p className="text-xs font-bold text-zinc-400">
                            {progressStatus?.stage === 'submitting' && 'Submitting task...'}
                            {progressStatus?.stage === 'queued' && 'Queued — waiting for server...'}
                            {progressStatus?.stage === 'processing' && 'Generating your image...'}
                            {!progressStatus && 'Dreaming up your image...'}
                          </p>
                          <p className="text-[10px] text-zinc-500 mt-1.5">
                            {progressStatus?.message || 'This usually takes 5-10 seconds'}
                          </p>
                          {progressStatus?.taskId && (
                            <p className="text-[9px] text-zinc-700 mt-2 font-mono truncate max-w-[200px]">
                              Task: {progressStatus.taskId}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    )}
                    
                    {images.map((img) => (
                      <motion.div
                        layout
                        key={img.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={cn(
                          "group relative rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden cursor-pointer transition-all duration-300 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/10",
                          img.aspectRatio === '1:1' ? 'aspect-square' : img.aspectRatio === '9:16' ? 'aspect-[9/16]' : 'aspect-video'
                        )}
                        onClick={() => setSelectedImage(img)}
                      >
                        <img 
                          src={img.url} 
                          alt={img.prompt} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                          <p className="text-xs text-white font-medium line-clamp-2 mb-3">{img.prompt}</p>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={(e) => { e.stopPropagation(); downloadImage(img.url, `nanogen-${img.id}.png`); }}
                              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-[10px] font-bold transition-colors"
                            >
                              <Download className="w-3.5 h-3.5" />
                              Download
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); setSelectedImage(img); }}
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

      {/* Image Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-black/95 backdrop-blur-xl"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-6xl w-full max-h-full flex flex-col md:flex-row gap-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex-1 flex items-center justify-center bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl">
                <img 
                  src={selectedImage.url} 
                  alt={selectedImage.prompt} 
                  className="max-w-full max-h-[70vh] md:max-h-[85vh] object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              
              <div className="w-full md:w-80 flex flex-col gap-6">
                <div>
                  <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Prompt</h3>
                  <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-300 leading-relaxed">
                    {selectedImage.prompt}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase mb-1">Aspect Ratio</p>
                    <p className="text-sm font-medium text-zinc-200">{selectedImage.aspectRatio}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase mb-1">Created</p>
                    <p className="text-sm font-medium text-zinc-200">
                      {new Date(selectedImage.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="mt-auto flex flex-col gap-3">
                  <button 
                    onClick={() => downloadImage(selectedImage.url, `nanogen-${selectedImage.id}.png`)}
                    className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-white text-black font-bold hover:bg-zinc-200 transition-colors"
                  >
                    <Download className="w-5 h-5" />
                    Download Image
                  </button>
                  <button 
                    onClick={() => {
                      setImages(prev => prev.filter(img => img.id !== selectedImage.id));
                      setSelectedImage(null);
                    }}
                    className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-red-500/10 text-red-500 font-bold hover:bg-red-500/20 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                    Delete Generation
                  </button>
                </div>
              </div>

              <button 
                onClick={() => setSelectedImage(null)}
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
