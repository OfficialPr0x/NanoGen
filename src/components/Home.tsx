import React from 'react';
import { 
  Sparkles, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  Zap, 
  ChevronRight, 
  ArrowRight,
  LayoutGrid,
  Layers,
  History,
  TrendingUp,
  Clock,
  Star
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface HomeProps {
  onNavigate: (tab: string) => void;
}

const FeatureCard = ({ 
  icon: Icon, 
  title, 
  description, 
  onClick, 
  color,
  badge
}: { 
  icon: React.ElementType; 
  title: string; 
  description: string; 
  onClick: () => void;
  color: string;
  badge?: string;
}) => (
  <button
    onClick={onClick}
    className="group relative flex flex-col text-left p-6 rounded-3xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-all duration-300 hover:shadow-2xl hover:shadow-black/50 overflow-hidden"
  >
    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-lg", color)}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    
    {badge && (
      <div className="absolute top-6 right-6 px-2 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-bold uppercase tracking-wider">
        {badge}
      </div>
    )}

    <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
      {title}
      <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
    </h3>
    <p className="text-sm text-zinc-500 leading-relaxed">{description}</p>
    
    <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors duration-500" />
  </button>
);

export const Home = ({ onNavigate }: HomeProps) => {
  return (
    <div className="flex-1 overflow-y-auto bg-[#0a0a0a] scrollbar-hide">
      {/* Hero Section */}
      <div className="relative px-8 pt-16 pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(168,85,247,0.15),transparent_70%)]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
        
        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/50 border border-zinc-800 text-zinc-400 text-xs font-medium mb-8 backdrop-blur-sm">
              <div className="w-4 h-4 rounded-md overflow-hidden flex items-center justify-center">
                <img 
                  src="https://res.cloudinary.com/dpfapm0tl/image/upload/v1775169465/ChatGPT_Image_Apr_2_2026_06_24_34_PM_y2mc6w.png" 
                  alt="Mystic Marv Logo" 
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              Powered by Gemini Nano Banana & Veo 3
              <div className="w-1 h-1 rounded-full bg-zinc-700 mx-1" />
              <span className="text-purple-400">v2.0 Release</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-display text-white mb-6 tracking-wider leading-[1.1]">
              YOURS TO <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-indigo-400 to-purple-400 animate-gradient">CREATE</span>
            </h1>
            
            <p className="text-lg md:text-xl text-zinc-400 mb-12 max-w-2xl mx-auto leading-relaxed">
              Unlock your creative potential with the most advanced AI generation tools. 
              From hyper-realistic images to cinematic motion.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <button 
                onClick={() => onNavigate('image')}
                className="px-8 py-4 rounded-2xl bg-white text-black font-bold text-base hover:bg-zinc-200 transition-all shadow-xl shadow-white/5 flex items-center gap-2"
              >
                Start Creating
                <ArrowRight className="w-4 h-4" />
              </button>
              <button 
                onClick={() => onNavigate('feed')}
                className="px-8 py-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-white font-bold text-base hover:bg-zinc-800 transition-all flex items-center gap-2"
              >
                View Gallery
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="px-8 pb-24">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Creative Tools</h2>
              <p className="text-sm text-zinc-500">Everything you need to bring your vision to life.</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-bold">
                <TrendingUp className="w-3.5 h-3.5 text-green-400" />
                Popular
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard 
              icon={ImageIcon}
              title="Image Generation"
              description="Create stunning visuals from text prompts using Gemini Nano Banana. Support for multiple aspect ratios."
              onClick={() => onNavigate('image')}
              color="bg-blue-600"
            />
            <FeatureCard 
              icon={VideoIcon}
              title="Motion (Veo 3)"
              description="Transform your ideas into cinematic videos. High-resolution output with realistic physics and lighting."
              onClick={() => onNavigate('video')}
              color="bg-purple-600"
              badge="New"
            />
            <FeatureCard 
              icon={Layers}
              title="AI Canvas"
              description="An infinite workspace for editing, outpainting, and refining your AI-generated masterpieces."
              onClick={() => {}}
              color="bg-indigo-600"
            />
          </div>
        </div>
      </div>

      {/* Recent Activity / Stats */}
      <div className="px-8 pb-24">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 p-8 rounded-3xl bg-zinc-900/30 border border-zinc-800/50">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-purple-400" />
                Quick History
              </h3>
              <button onClick={() => onNavigate('feed')} className="text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors">
                View All
              </button>
            </div>
            
            <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-zinc-800/50 rounded-2xl">
              <Clock className="w-8 h-8 text-zinc-700 mb-3" />
              <p className="text-sm text-zinc-500">Your recent generations will appear here.</p>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-gradient-to-br from-purple-600/10 to-indigo-600/10 border border-purple-500/20">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" />
              Pro Status
            </h3>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span className="text-zinc-400">Daily Tokens</span>
                  <span className="text-purple-400">150 / 1000</span>
                </div>
                <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="w-[15%] h-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Upgrade to <span className="text-white font-bold">Mystic Marv Pro</span> for unlimited generations, 4K video, and priority processing.
                </p>
                <button className="w-full mt-4 py-3 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-500 transition-colors">
                  Upgrade Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
