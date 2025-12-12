export const fetchAudioAsFile = async (url: string): Promise<File> => {
  const response = await fetch(url);
  const blob = await response.blob();
  const fileName = url.split("/").pop() || "audio.wav";
  const file = new File([blob], fileName, { type: blob.type });
  return file;
};