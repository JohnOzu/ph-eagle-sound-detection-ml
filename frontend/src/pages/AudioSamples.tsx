import { useEffect, useState } from "react";
import DropDownSampleAudio from "../components/DropDownSampleAudio";
import { useMyContext } from "../contexts/MyContext";
import type SampleAudio from "../types/SampleAudio.type";
import { fetchAudioAsFile } from "../utils/audio.util";

const baseUrl = import.meta.env.BASE_URL ?? '/';

const initialAudioFiles: SampleAudio[] = [
    { url: `${baseUrl}audioSamples/SampleEagleExist01.wav`, isThereEagle: true },
    { url: `${baseUrl}audioSamples/SampleEagleExist02.wav`, isThereEagle: true },
    { url: `${baseUrl}audioSamples/SampleEagleExist03.wav`, isThereEagle: true },
    { url: `${baseUrl}audioSamples/SampleEagleNotExist01.wav`, isThereEagle: false },
];

export default function AudioSamples() {

    const {
        setActiveTab,
        setFile,
    } = useMyContext();

    const [audioFiles, setAudioFiles] = useState<SampleAudio[]>(initialAudioFiles);

    useEffect(() => {

        initialAudioFiles.forEach(async (audio, i) => {
            try {
                const file = await fetchAudioAsFile(audio.url);
                setAudioFiles(prev => {
                    const newArr = [...prev];
                    newArr[i] = { ...newArr[i], file };
                    return newArr;
                });
            } catch {
                console.error('Failed to fetch sample audio', audio.url);
            }
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