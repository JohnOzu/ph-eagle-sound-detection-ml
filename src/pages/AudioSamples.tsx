import { useEffect, useState } from "react";
import DropDownSampleAudio from "../components/DropDownSampleAudio";
import { useMyContext } from "../contexts/MyContext";
import type SampleAudio from "../types/SampleAudio.type";
import { fetchAudioAsFile } from "../utils/phEagleModel.util";

export default function AudioSamples() {

    const {
        setActiveTab,
        setFile,
    } = useMyContext();

    const [audioFiles, setAudioFiles] = useState<SampleAudio[]>([
        { url: "/audioSamples/SampleEagleExist01.wav", isThereEagle: true },
        { url: "/audioSamples/SampleEagleExist02.wav", isThereEagle: true },
        { url: "/audioSamples/SampleEagleExist03.wav", isThereEagle: true },
        { url: "/audioSamples/SampleEagleNotExist01.wav", isThereEagle: false },
    ]);

    useEffect(() => {
    // Fetch files and store them in state
        audioFiles.forEach(async (audio, i) => {
            const file = await fetchAudioAsFile(audio.url);
            setAudioFiles(prev => {
                const newArr = [...prev];
                newArr[i].file = file;
                return newArr;
            });
        });
    }, []);

    const handleUseAudio = (file: File) => {
        setActiveTab("Classifier");
        setFile(file)
    }

    return(
        <>
            <div className="flex flex-col items-center justify-center">
                {audioFiles.map((audioFile, i) => (
                    <DropDownSampleAudio 
                        key={i} 
                        url={audioFile.url}
                        isThereEagle={audioFile.isThereEagle}
                        file={audioFile.file}
                        index={i} 
                        handleUseAudio={handleUseAudio}
                    />
                ))}
            </div>
        </>
    )
}