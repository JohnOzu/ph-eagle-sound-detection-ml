import { X } from "lucide-react";
import { useMyContext } from "../contexts/MyContext"
import clsx from "clsx";

export default function Classifier() {

    const {
        file,
        handleClearFile,
        isAnalyzing,
        handleFileChange,
        handleAnalyze,
        result
    } = useMyContext();

    return(
        <>
            <div className="w-full flex flex-col items-center justify-center space-y-5">
                {/* UPLOAD */}
                {file ? (
                    <>
                        <div className="mt-6 w-[80%] flex flex-col items-center relative">
                            {/* Audio Container */}
                            <label className="text-white mb-2 font-mono font-semibold">{file.name}</label>
                            <div className="relative w-full border-2 p-4 rounded-lg border-white border-dashed">
                                <button
                                    className="absolute -top-2 -right-3 cursor-pointer p-1 text-white bg-red-600 rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700 hover:scale-105 duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                    onClick={() => handleClearFile()}
                                    disabled={isAnalyzing}
                                >
                                    <X />
                                </button>
                                
                                {/* Audio Player */}
                                <audio controls autoPlay loop className="w-full">
                                    <source src={URL.createObjectURL(file)} type={file.type} />
                                </audio>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="mt-6 w-[80%]">
                            <label className="block w-full cursor-pointer">
                            <div className="w-full border-2 border-dashed border-white/40 rounded-2xl p-8 text-center hover:border-white/60 hover:bg-white/5 transition-all duration-300">
                                <svg className="w-12 h-12 text-white/70 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                <p className="text-white text-lg mb-2">
                                Drag or Click to upload audio file
                                </p>
                                <p className="text-white/60 text-sm">
                                WAV, MP3, or other audio formats
                                </p>
                            </div>
                            <input
                                type="file"
                                accept="audio/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            </label>
                        </div>
                    </>
                )}
                {!result && (
                    <button
                        onClick={handleAnalyze}
                        disabled={isAnalyzing || !file}
                        className={clsx("w-[80%] cursor-pointer bg-white/90 hover:bg-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-101 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg",
                            file && "shine-button"
                        )}
                    >
                        {isAnalyzing ? (
                        <span className="flex items-center justify-center">
                            <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Analyzing Audio...
                        </span>
                        ) : (
                            <>
                                {file && <span className="shine"></span>}
                                Analyze Audio
                            </>
                        )}
                    </button>
                )}
                {/* Results */}
                {result && !isAnalyzing && (
                    <div className="w-[75%] mt-3 bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 animate-fade-in">
                        <div className="text-center">
                            <div className="mb-4">
                            {result.is_eagle ? (
                                <div className="inline-block p-4 bg-green-500/20 rounded-full">
                                <span className="text-6xl">🦅</span>
                                </div>
                            ) : (
                                <div className="inline-block p-4 bg-red-500/20 rounded-full">
                                <span className="text-6xl">❌</span>
                                </div>
                            )}
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">
                                {result.is_eagle ? "Eagle Detected" : "No Eagle Detected"}
                            </h3>
                            <div className="flex items-center justify-center space-x-2">
                            <span className="text-white/80">Confidence:</span>
                            <span className="text-white font-semibold text-xl">
                                {(result.confidence * 100).toFixed(1)}%
                            </span>
                            </div>
                            
                            {/* Confidence bar */}
                            <div className="mt-4 w-full bg-white/20 rounded-full h-3 overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-1000 ${
                                result.is_eagle ? 'bg-green-400' : 'bg-red-400'
                                }`}
                                style={{ width: `${result.confidence * 100}%` }}
                            ></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}