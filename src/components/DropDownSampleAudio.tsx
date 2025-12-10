import clsx from "clsx";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { useState } from "react";

interface DropDownSampleAudioProps {
    url: string;
    isThereEagle: boolean;
    handleUseAudio: (file: File) => void
    index?: number
    file?: File;
}

export default function DropDownSampleAudio({
    url,
    isThereEagle,
    index,
    file,
    handleUseAudio
}: DropDownSampleAudioProps) {

    const fileName = url.split("/").pop();
    const [isOpen, setIsOpen] = useState<boolean>(false);

    return(
        <>
            <motion.div 
                className="w-[80%] mt-5 bg-white rounded-lg shadow-lg overflow-hidden"
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index ? index * 0.1 : 0}}
            >
                {/* Header */}
                <div className="flex justify-between items-center p-3 font-semibold cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
                    <span>{fileName} - {isThereEagle ? "Eagle detected" : "No eagle"}</span>
                    <ChevronLeft className={clsx("w-6 h-6 duration-200", isOpen && "-rotate-90")} />
                </div>

                {/* Dropdown content */}
                {isOpen && (
                    <div className="flex justify-between items-center p-3 border-t border-gray-200">
                        <audio controls loop className="w-[75%]">
                            <source src={url} type="audio/wav" />
                        </audio>
                        <button 
                            onClick={() => handleUseAudio(file!)}
                            className="p-2 bg-green-500 rounded-md text-white cursor-pointer hover:bg-green-600 duration-200">
                            Use Audio
                        </button>
                    </div>
                )}
            </motion.div>
        </>
    )
}