import React, { useState } from 'react';
import { 
  Home as HomeIcon, 
  Image as ImageIcon, 
  Video, 
  Library, 
  Settings, 
  Sparkles, 
  Plus, 
  Menu, 
  X,
  User,
  Zap,
  LayoutGrid,
  Layers,
  History,
  Send
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick?: () => void;
  collapsed?: boolean;
}

const SidebarItem = ({ icon: Icon, label, active, onClick, collapsed }: SidebarItemProps) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all duration-200 group",
      active 
        ? "bg-purple-600/10 text-purple-400 border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.1)]" 
        : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
    )}
  >
    <Icon className={cn("w-5 h-5", active ? "text-purple-400" : "text-zinc-400 group-hover:text-zinc-200")} />
    {!collapsed && <span className="text-sm font-medium">{label}</span>}
  </button>
);

export const Layout = ({ 
  children, 
  activeTab, 
  setActiveTab 
}: { 
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-zinc-100 overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <aside 
        className={cn(
          "hidden md:flex flex-col border-r border-zinc-800/50 bg-[#0d0d0d] transition-all duration-300 ease-in-out",
          isSidebarOpen ? "w-64" : "w-20"
        )}
      >
        <div className="p-6 flex items-center gap-3">
          <div 
            onClick={() => setActiveTab('home')}
            className="w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer hover:scale-110 transition-transform overflow-hidden"
          >
            <img 
              src="https://res.cloudinary.com/dpfapm0tl/image/upload/v1775169465/ChatGPT_Image_Apr_2_2026_06_24_34_PM_y2mc6w.png" 
              alt="Mystic Marv Logo" 
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          {isSidebarOpen && (
            <span className="text-xl font-display tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
              Mystic Marv AI
            </span>
          )}
        </div>

        <nav className="flex-1 px-3 space-y-1 mt-4">
          <SidebarItem 
            icon={HomeIcon} 
            label="Home" 
            active={activeTab === 'home'} 
            onClick={() => setActiveTab('home')}
            collapsed={!isSidebarOpen}
          />
          <SidebarItem 
            icon={ImageIcon} 
            label="Image Generation" 
            active={activeTab === 'image'} 
            onClick={() => setActiveTab('image')}
            collapsed={!isSidebarOpen}
          />
          <SidebarItem 
            icon={Video} 
            label="Motion (Veo 3)" 
            active={activeTab === 'video'} 
            onClick={() => setActiveTab('video')}
            collapsed={!isSidebarOpen}
          />
          <SidebarItem 
            icon={Send} 
            label="Social Media" 
            active={activeTab === 'social'} 
            onClick={() => setActiveTab('social')}
            collapsed={!isSidebarOpen}
          />
          <SidebarItem 
            icon={Library} 
            label="Library" 
            active={activeTab === 'feed'} 
            onClick={() => setActiveTab('feed')}
            collapsed={!isSidebarOpen}
          />
          
          <div className="pt-6 pb-2 px-3">
            {!isSidebarOpen ? (
              <div className="h-px bg-zinc-800 mx-1" />
            ) : (
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Tools</span>
            )}
          </div>
          
          <SidebarItem 
            icon={Layers} 
            label="Canvas" 
            active={activeTab === 'canvas'} 
            onClick={() => setActiveTab('canvas')}
            collapsed={!isSidebarOpen}
          />
          <SidebarItem 
            icon={History} 
            label="History" 
            active={activeTab === 'history'} 
            onClick={() => setActiveTab('history')}
            collapsed={!isSidebarOpen}
          />
        </nav>

        <div className="p-4 border-t border-zinc-800/50">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full flex items-center justify-center p-2 rounded-xl hover:bg-zinc-800/50 text-zinc-500 hover:text-zinc-300 transition-all mb-2"
          >
            {isSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
          <SidebarItem 
            icon={Settings} 
            label="Settings" 
            active={activeTab === 'settings'} 
            onClick={() => setActiveTab('settings')}
            collapsed={!isSidebarOpen}
          />
          <div className="mt-4 flex items-center gap-3 px-3 py-2 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
              <User className="w-4 h-4 text-zinc-400" />
            </div>
            {isSidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">Free Plan</p>
                <div className="w-full h-1 bg-zinc-800 rounded-full mt-1 overflow-hidden">
                  <div className="w-1/3 h-full bg-purple-500 shadow-[0_0_5px_rgba(168,85,247,0.5)]" />
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#0d0d0d]/80 backdrop-blur-xl border-b border-zinc-800/50 z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2" onClick={() => setActiveTab('home')}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
            <img 
              src="https://res.cloudinary.com/dpfapm0tl/image/upload/v1775169465/ChatGPT_Image_Apr_2_2026_06_24_34_PM_y2mc6w.png" 
              alt="Mystic Marv Logo" 
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <span className="font-display text-lg tracking-wider">Mystic Marv</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-zinc-400">
          {isSidebarOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar Content */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="md:hidden fixed top-0 left-0 bottom-0 w-72 bg-[#0d0d0d] z-50 border-r border-zinc-800/50 flex flex-col"
          >
            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
                  <img 
                    src="https://res.cloudinary.com/dpfapm0tl/image/upload/v1775169465/ChatGPT_Image_Apr_2_2026_06_24_34_PM_y2mc6w.png" 
                    alt="Mystic Marv Logo" 
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <span className="text-xl font-display tracking-wider">Mystic Marv AI</span>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-zinc-400">
                <X />
              </button>
            </div>
            <nav className="flex-1 px-3 space-y-1 mt-4">
              <SidebarItem icon={HomeIcon} label="Home" active={activeTab === 'home'} onClick={() => { setActiveTab('home'); setIsSidebarOpen(false); }} />
              <SidebarItem icon={ImageIcon} label="Image Generation" active={activeTab === 'image'} onClick={() => { setActiveTab('image'); setIsSidebarOpen(false); }} />
              <SidebarItem icon={Video} label="Motion" active={activeTab === 'video'} onClick={() => { setActiveTab('video'); setIsSidebarOpen(false); }} />
              <SidebarItem icon={Send} label="Social Media" active={activeTab === 'social'} onClick={() => { setActiveTab('social'); setIsSidebarOpen(false); }} />
              <SidebarItem icon={Library} label="Library" active={activeTab === 'feed'} onClick={() => { setActiveTab('feed'); setIsSidebarOpen(false); }} />
            </nav>
            <div className="p-4 border-t border-zinc-800/50">
              <SidebarItem icon={Settings} label="Settings" active={activeTab === 'settings'} onClick={() => { setActiveTab('settings'); setIsSidebarOpen(false); }} />
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden pt-16 md:pt-0">
        {children}
      </main>
    </div>
  );
};
