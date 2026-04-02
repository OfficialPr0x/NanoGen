import { useState } from 'react';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { ImageGenerator } from './components/ImageGenerator';
import { VideoGenerator } from './components/VideoGenerator';
import { SocialMediaPoster } from './components/SocialMediaPoster';
import { Library } from './components/Library';
import { Settings } from './components/Settings';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <Home onNavigate={setActiveTab} />;
      case 'image':
        return <ImageGenerator />;
      case 'video':
        return <VideoGenerator />;
      case 'social':
        return <SocialMediaPoster />;
      case 'feed':
        return <Library />;
      case 'settings':
        return <Settings />;
      default:
        return <Home onNavigate={setActiveTab} />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
}
