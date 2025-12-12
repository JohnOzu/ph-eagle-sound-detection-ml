import type { ModelPrediction } from "./modelPrediction.type"

export interface MyContextType {
    activeTab: string,
    setActiveTab: React.Dispatch<React.SetStateAction<string>>
    isAnalyzing: boolean,
    setIsAnalyzing: React.Dispatch<React.SetStateAction<boolean>>
    result: ModelPrediction | null,
    setResult: React.Dispatch<React.SetStateAction<ModelPrediction | null>>
    file: File | null,
    setFile: React.Dispatch<React.SetStateAction<File | null>>
    handleClearFile: () => void
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    handleAnalyze: () => void
}