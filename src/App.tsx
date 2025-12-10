import clsx from "clsx";
import { detectEagle } from "./utils/phEagleModel.util";
import type { ModelPrediction } from "./types/modelPrediction.type";
import { useMemo, useState } from "react";
import { MyContext } from "./contexts/MyContext";
import Classifier from "./pages/Classifier";
import About from "./pages/About";
import { motion } from "framer-motion";
import AudioSamples from "./pages/AudioSamples";

/* eslint-disable react-hooks/purity */
export default function App() {

  const [activeTab, setActiveTab] = useState<string>("Classifier");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [result, setResult] = useState<ModelPrediction | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const handleClearFile = () => {
    setFile(null);
    setResult(null);
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };
  
  const handleAnalyze = async () => {
    if (!file) return;
    
    setIsAnalyzing(true);
    const predictionResult = await detectEagle(file);
    setResult(predictionResult);
    setIsAnalyzing(false);
  };

  const particles = useMemo(() => {
    return [...Array(20)].map(() => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 8 + Math.random() * 8
    }));
  }, []);

  return (
    <main className="fixed inset-0 -z-10 overflow-hidden">
      {/* Forest Gradient Base */}
      <div className="absolute inset-0 bg-linear-to-b from-emerald-900 via-green-800 to-teal-900">
        {/* Ambient light orbs */}
        <div className="absolute top-10 right-20 w-96 h-96 bg-yellow-300/10 rounded-full blur-3xl animate-glow"></div>
        <div className="absolute top-1/3 left-10 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl animate-glow-delayed"></div>
        <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-teal-300/10 rounded-full blur-3xl animate-pulse"></div>
        
        {/* Bush silhouettes - Left side */}
        <svg className="absolute bottom-0 left-0 h-2/5 w-1/4 opacity-30" viewBox="0 0 200 240" preserveAspectRatio="none">
          <ellipse cx="30" cy="200" rx="35" ry="45" fill="rgba(0,0,0,0.4)"/>
          <ellipse cx="80" cy="180" rx="45" ry="60" fill="rgba(0,0,0,0.3)"/>
          <ellipse cx="130" cy="190" rx="38" ry="50" fill="rgba(0,0,0,0.35)"/>
          <ellipse cx="20" cy="220" rx="25" ry="30" fill="rgba(0,0,0,0.35)"/>
          <ellipse cx="100" cy="215" rx="30" ry="35" fill="rgba(0,0,0,0.38)"/>
        </svg>
        
        {/* Bush silhouettes - Right side */}
        <svg className="absolute bottom-0 right-0 h-2/5 w-1/4 opacity-30" viewBox="0 0 200 240" preserveAspectRatio="none">
          <ellipse cx="70" cy="185" rx="40" ry="55" fill="rgba(0,0,0,0.35)"/>
          <ellipse cx="120" cy="195" rx="42" ry="48" fill="rgba(0,0,0,0.4)"/>
          <ellipse cx="170" cy="175" rx="38" ry="65" fill="rgba(0,0,0,0.3)"/>
          <ellipse cx="50" cy="210" rx="28" ry="32" fill="rgba(0,0,0,0.37)"/>
          <ellipse cx="150" cy="220" rx="32" ry="28" fill="rgba(0,0,0,0.36)"/>
        </svg>
        
        {/* Foliage layers at bottom */}
        <svg className="absolute bottom-0 w-full opacity-40" viewBox="0 0 1200 200" preserveAspectRatio="none">
          <path d="M0,200 Q100,120 200,140 T400,130 T600,145 T800,125 T1000,140 T1200,130 L1200,200 Z" fill="rgba(34,197,94,0.4)"/>
        </svg>
        <svg className="absolute bottom-0 w-full opacity-50" viewBox="0 0 1200 150" preserveAspectRatio="none">
          <path d="M0,150 Q150,80 300,100 T600,90 T900,105 T1200,95 L1200,150 Z" fill="rgba(22,163,74,0.5)"/>
        </svg>
        <svg className="absolute bottom-0 w-full opacity-60" viewBox="0 0 1200 100" preserveAspectRatio="none">
          <path d="M0,100 Q200,40 400,60 T800,55 T1200,50 L1200,100 Z" fill="rgba(21,128,61,0.6)"/>
        </svg>
        
        {/* Floating particles (fireflies/leaves) */}
        {particles.map((particle, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-firefly"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
              width: i % 3 === 0 ? '3px' : '2px',
              height: i % 3 === 0 ? '3px' : '2px',
              backgroundColor: i % 2 === 0 ? 'rgba(254, 240, 138, 0.6)' : 'rgba(134, 239, 172, 0.5)',
              boxShadow: i % 2 === 0 ? '0 0 8px rgba(254, 240, 138, 0.8)' : '0 0 6px rgba(134, 239, 172, 0.6)'
            }}
          />
        ))}
        
        {/* Falling leaves */}
        {[...Array(8)].map((_, i) => (
          <div
            key={`leaf-${i}`}
            className="absolute w-3 h-3 opacity-40 animate-leaf-fall"
            style={{
              left: `${10 + i * 12}%`,
              animationDelay: `${i * 2}s`,
              animationDuration: `${15 + i * 2}s`
            }}
          >
            <svg viewBox="0 0 24 24" fill="rgba(34,197,94,0.6)">
              <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z"/>
            </svg>
          </div>
        ))}
      </div>
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div 
          className="flex flex-col items-center justify-center w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 md:p-12"
        >
          {/* HEADER SECTION */}
          <section className="text-center">
            <div className="flex flex-row justify-center items-center space-x-3 mb-1">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                AgilaGuard
              </h1>
              <div className="inline-block p-3 bg-white/20 rounded-2xl">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
            </div>
            <p className="text-white/80 text-md tracking-widest">
              Listen. Detect. Conserve.
            </p>
          </section>
          {/* NAVIGATION */}
          <div className="inline-block border border-white rounded-xl mt-5">
            <button 
              className={clsx("px-3 py-2 rounded-l-lg",
                activeTab === "Classifier" ? "bg-white text-black" : "bg-none text-white cursor-pointer hover:bg-white hover:text-black duration-200"
              )}
              onClick={() => setActiveTab("Classifier")}
            >
              Classifier
            </button>
            <button 
              className={clsx("px-3 py-2",
                activeTab === "About" ? "bg-white text-black" : "bg-none text-white cursor-pointer hover:bg-white hover:text-black duration-200"
              )}
              onClick={() => setActiveTab("About")}
            >
              About
            </button>
            <button 
              className={clsx("px-3 py-2 rounded-r-lg",
                activeTab === "Audio Samples" ? "bg-white text-black" : "bg-none text-white cursor-pointer hover:bg-white hover:text-black duration-200"
              )}
              onClick={() => setActiveTab("Audio Samples")}
            >
              Audio Samples
            </button>
          </div>
          <MyContext.Provider
            value={{
              activeTab,
              setActiveTab,
              isAnalyzing,
              setIsAnalyzing,
              result,
              setResult,
              file,
              setFile,
              handleAnalyze,
              handleClearFile,
              handleFileChange
            }}
          >
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }} // faster
              className="w-full"
            >
              {activeTab === "Classifier" && <Classifier />}
              {activeTab === "About" && <About />}
              {activeTab === "Audio Samples" && <AudioSamples />}
            </motion.div>

          </MyContext.Provider>
        </div>
      </div>
    </main>
  );
}