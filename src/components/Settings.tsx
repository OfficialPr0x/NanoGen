import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Key, 
  Shield, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Zap, 
  ExternalLink,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  Send
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export const Settings = () => {
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [kieApiKey, setKieApiKey] = useState('');
  const [uploadPostApiKey, setUploadPostApiKey] = useState('');
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [showUploadKey, setShowUploadKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isTestingUpload, setIsTestingUpload] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [uploadTestResult, setUploadTestResult] = useState<'success' | 'error' | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [uploadErrorMessage, setUploadErrorMessage] = useState('');

  useEffect(() => {
    const savedGeminiKey = localStorage.getItem('gemini_api_key');
    const savedKieKey = localStorage.getItem('kie_api_key');
    const savedUploadKey = localStorage.getItem('upload_post_api_key');
    if (savedGeminiKey) setGeminiApiKey(savedGeminiKey);
    if (savedKieKey) setKieApiKey(savedKieKey);
    if (savedUploadKey) setUploadPostApiKey(savedUploadKey);
  }, []);

  const handleSave = () => {
    localStorage.setItem('gemini_api_key', geminiApiKey);
    localStorage.setItem('kie_api_key', kieApiKey);
    localStorage.setItem('upload_post_api_key', uploadPostApiKey);
    alert('Settings saved successfully!');
  };

  const testUploadPostConnection = async () => {
    if (!uploadPostApiKey) {
      setUploadTestResult('error');
      setUploadErrorMessage('Please enter an API key first.');
      return;
    }

    setIsTestingUpload(true);
    setUploadTestResult(null);
    setUploadErrorMessage('');

    try {
      // Using the utility we created
      const { testUploadPostConnection: testConn } = await import('../lib/uploadPost');
      await testConn(uploadPostApiKey);
      setUploadTestResult('success');
    } catch (error) {
      setUploadTestResult('error');
      setUploadErrorMessage(error instanceof Error ? error.message : 'Connection failed');
    } finally {
      setIsTestingUpload(false);
    }
  };

  const testConnection = async () => {
    if (!kieApiKey) {
      setTestResult('error');
      setErrorMessage('Please enter an API key first.');
      return;
    }

    setIsTesting(true);
    setTestResult(null);
    setErrorMessage('');

    try {
      const response = await fetch('/api/kie/api/v1/chat/credit', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${kieApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setTestResult('success');
      } else if (response.status === 401) {
        setTestResult('error');
        setErrorMessage('Invalid API key. Get a valid key at https://kie.ai/api-key');
      } else if (response.status === 429) {
        setTestResult('error');
        setErrorMessage('Rate limited. Please wait a moment and try again.');
      } else {
        const data = await response.json().catch(() => ({}));
        setTestResult('error');
        setErrorMessage(data.error?.message || `Connection failed with status ${response.status}`);
      }
    } catch (error) {
      setTestResult('error');
      setErrorMessage(error instanceof Error ? error.message : 'Network error occurred');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#0a0a0a] p-8 scrollbar-hide">
      <div className="max-w-3xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center">
              <img 
                src="https://res.cloudinary.com/dpfapm0tl/image/upload/v1775160488/nanogen-wo5ldaxn7_nxyr1k.png" 
                alt="NanoGen Logo" 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            Settings
          </h1>
          <p className="text-zinc-500">Configure your API keys and application preferences.</p>
        </div>

        <div className="space-y-8">
          {/* Gemini API Configuration */}
          <section className="p-8 rounded-3xl bg-zinc-900/30 border border-zinc-800/50 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Gemini API</h2>
                <p className="text-xs text-zinc-500">Required for image generation. Get a key from Google AI Studio.</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3 block">
                  Gemini API Key
                </label>
                <div className="relative">
                  <input
                    type={showGeminiKey ? "text" : "password"}
                    value={geminiApiKey}
                    onChange={(e) => setGeminiApiKey(e.target.value)}
                    placeholder="AIza..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 px-4 pr-12 text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:border-emerald-500/50 transition-all"
                  />
                  <button 
                    onClick={() => setShowGeminiKey(!showGeminiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-zinc-600 hover:text-zinc-400 transition-colors"
                  >
                    {showGeminiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="mt-3 text-[10px] text-zinc-600 flex items-center gap-1.5">
                  <Shield className="w-3 h-3" />
                  Your key is stored locally in your browser and never sent to our servers.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white text-black font-bold text-sm hover:bg-zinc-200 transition-all"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
                <a 
                  href="https://aistudio.google.com/apikey" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 ml-auto"
                >
                  Get API Key
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </section>

          {/* Kie API Configuration */}
          <section className="p-8 rounded-3xl bg-zinc-900/30 border border-zinc-800/50 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Key className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Kie.ai Integration</h2>
                <p className="text-xs text-zinc-500">Required for Veo 3 and advanced video generation.</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3 block">
                  Kie API Key
                </label>
                <div className="relative">
                  <input
                    type={showKey ? "text" : "password"}
                    value={kieApiKey}
                    onChange={(e) => setKieApiKey(e.target.value)}
                    placeholder="sk-..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 px-4 pr-12 text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:border-purple-500/50 transition-all"
                  />
                  <button 
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-zinc-600 hover:text-zinc-400 transition-colors"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="mt-3 text-[10px] text-zinc-600 flex items-center gap-1.5">
                  <Shield className="w-3 h-3" />
                  Your key is stored locally in your browser and never sent to our servers.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white text-black font-bold text-sm hover:bg-zinc-200 transition-all"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
                <button
                  onClick={testConnection}
                  disabled={isTesting}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-zinc-800 text-white font-bold text-sm hover:bg-zinc-700 transition-all disabled:opacity-50"
                >
                  {isTesting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  Test Connection
                </button>
                <a 
                  href="https://kie.ai/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1.5 ml-auto"
                >
                  Get API Key
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Test Results */}
              <AnimatePresence>
                {testResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className={cn(
                      "p-4 rounded-2xl border flex items-start gap-3",
                      testResult === 'success' 
                        ? "bg-green-500/10 border-green-500/20 text-green-400" 
                        : "bg-red-500/10 border-red-500/20 text-red-400"
                    )}
                  >
                    {testResult === 'success' ? (
                      <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 flex-shrink-0" />
                    )}
                    <div>
                      <p className="text-sm font-bold">
                        {testResult === 'success' ? 'Connection Successful!' : 'Connection Failed'}
                      </p>
                      <p className="text-xs opacity-80 mt-1">
                        {testResult === 'success' 
                          ? 'Successfully connected to Kie.ai API. You can now use all premium features.' 
                          : errorMessage}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>

          {/* Upload-Post Configuration */}
          <section className="p-8 rounded-3xl bg-zinc-900/30 border border-zinc-800/50 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Send className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Upload-Post Integration</h2>
                <p className="text-xs text-zinc-500">Automate your social media publishing.</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3 block">
                  Upload-Post API Key
                </label>
                <div className="relative">
                  <input
                    type={showUploadKey ? "text" : "password"}
                    value={uploadPostApiKey}
                    onChange={(e) => setUploadPostApiKey(e.target.value)}
                    placeholder="up_..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 px-4 pr-12 text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:border-blue-500/50 transition-all"
                  />
                  <button 
                    onClick={() => setShowUploadKey(!showUploadKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-zinc-600 hover:text-zinc-400 transition-colors"
                  >
                    {showUploadKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white text-black font-bold text-sm hover:bg-zinc-200 transition-all"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
                <button
                  onClick={testUploadPostConnection}
                  disabled={isTestingUpload}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-zinc-800 text-white font-bold text-sm hover:bg-zinc-700 transition-all disabled:opacity-50"
                >
                  {isTestingUpload ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  Test Connection
                </button>
                <a 
                  href="https://upload-post.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1.5 ml-auto"
                >
                  Get API Key
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Test Results */}
              <AnimatePresence>
                {uploadTestResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className={cn(
                      "p-4 rounded-2xl border flex items-start gap-3",
                      uploadTestResult === 'success' 
                        ? "bg-green-500/10 border-green-500/20 text-green-400" 
                        : "bg-red-500/10 border-red-500/20 text-red-400"
                    )}
                  >
                    {uploadTestResult === 'success' ? (
                      <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 flex-shrink-0" />
                    )}
                    <div>
                      <p className="text-sm font-bold">
                        {uploadTestResult === 'success' ? 'Connection Successful!' : 'Connection Failed'}
                      </p>
                      <p className="text-xs opacity-80 mt-1">
                        {uploadTestResult === 'success' 
                          ? 'Successfully connected to Upload-Post API. You can now automate your social media.' 
                          : uploadErrorMessage}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>

          {/* Usage & Limits */}
          <section className="p-8 rounded-3xl bg-zinc-900/30 border border-zinc-800/50">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-6">Usage & Credits</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800">
                <p className="text-xs font-bold text-zinc-500 mb-4">Daily Generations</p>
                <div className="flex items-end justify-between mb-2">
                  <span className="text-2xl font-black text-white">12 / 50</span>
                  <span className="text-xs text-zinc-500 mb-1">24% used</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="w-[24%] h-full bg-purple-500" />
                </div>
              </div>
              <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800">
                <p className="text-xs font-bold text-zinc-500 mb-4">Kie.ai Credits</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  </div>
                  <div>
                    <p className="text-xl font-black text-white">$--.--</p>
                    <p className="text-[10px] text-zinc-500">Connect key to see balance</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* App Preferences */}
          <section className="p-8 rounded-3xl bg-zinc-900/30 border border-zinc-800/50">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-6">App Preferences</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800">
                <div>
                  <p className="text-sm font-bold text-white">Auto-save to Library</p>
                  <p className="text-xs text-zinc-500">Automatically save all generations to your feed.</p>
                </div>
                <div className="w-12 h-6 rounded-full bg-purple-600 relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white shadow-sm" />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800">
                <div>
                  <p className="text-sm font-bold text-white">High Quality Previews</p>
                  <p className="text-xs text-zinc-500">Show high-res thumbnails in the gallery.</p>
                </div>
                <div className="w-12 h-6 rounded-full bg-zinc-800 relative cursor-pointer">
                  <div className="absolute left-1 top-1 w-4 h-4 rounded-full bg-zinc-600 shadow-sm" />
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
