
import ImageGenerator from '@/components/ImageGenerator';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95 flex items-center justify-center relative overflow-hidden">
      {/* Glow effect background elements */}
      <div className="glow-bg glow-primary w-[40vw] h-[40vw] top-[-10%] left-[-5%]" />
      <div className="glow-bg glow-secondary w-[35vw] h-[35vw] bottom-[-10%] right-[5%]" />
      <div className="glow-bg glow-accent w-[25vw] h-[25vw] top-[40%] right-[-5%]" />
      
      {/* Content */}
      <ImageGenerator />
    </div>
  );
};

export default Index;
