import React, { useRef, useState } from 'react';
import { Upload, Play, Scissors } from 'lucide-react';

const VideoProcessor: React.FC = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [clippedVideos, setClippedVideos] = useState<{ id: string; path: string }[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);

  const clips = [
    { clip_id: 'clip_1', start_time: '00:00:30', end_time: '00:01:00' },
    { clip_id: 'clip_2', start_time: '00:01:00', end_time: '00:01:30' },
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('Video uploaded:', file.name);
      setVideoFile(file);
      if (videoRef.current) {
        videoRef.current.src = URL.createObjectURL(file);
      }
    }
  };

  const generateClip = async (start: string, end: string, clipId: string) => {
    if (!videoFile) {
      alert('Please upload a video file first.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('video', videoFile);
      formData.append('start', start);
      formData.append('end', end);
      formData.append('clipId', clipId);

      const response = await fetch('http://localhost:3000/api/clip-video', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error:', errorText);
        alert(`Server error: ${errorText}`);
        return;
      }

      const data = await response.json();
      setClippedVideos((prev) => [...prev, { id: clipId, path: data.clipUrl }]);
    } catch (error) {
      console.error('Request failed:', error);
      alert('An error occurred while generating the clip.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Video Processor</h1>

        <div className="mb-6">
          <label className="block mb-2">
            <span className="sr-only">Choose video file</span>
            <div className="flex items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-md appearance-none cursor-pointer hover:border-gray-400 focus:outline-none">
              <div className="flex flex-col items-center space-y-2">
                <Upload className="w-6 h-6 text-gray-600" />
                <span className="text-sm text-gray-600">
                  {videoFile ? videoFile.name : 'Drop video file or click to upload'}
                </span>
              </div>
              <input type="file" className="hidden" accept="video/*" onChange={handleFileUpload} />
            </div>
          </label>
        </div>

        {videoFile && (
          <div className="mb-6">
            <video ref={videoRef} controls className="w-full rounded-lg">
              <source src={URL.createObjectURL(videoFile)} type={videoFile.type} />
              Your browser does not support the video tag.
            </video>
          </div>
        )}

        {clips.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Available Clips</h2>
            <div className="space-y-4">
              {clips.map((clip) => (
                <div key={clip.clip_id} className="flex flex-col p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{clip.clip_id}</p>
                      <p className="text-sm text-gray-600">
                        {clip.start_time} - {clip.end_time}
                      </p>
                    </div>
                    <button
                      onClick={() => generateClip(clip.start_time, clip.end_time, clip.clip_id)}
                      className="flex items-center px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      <Scissors className="w-4 h-4 mr-2" />
                      Extract
                    </button>
                  </div>
                  {(() => {
  // Construct the video URL dynamically using clip_id
  const videoUrl = `http://localhost:3000/clips/${clip.clip_id}.mp4`;

  // Debugging: Log the constructed video URL
  console.log("Constructed video URL:", videoUrl);

  // Render the preview section
  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold">Preview</h3>
      <video controls className="w-full rounded-lg mt-2">
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <a
        href={videoUrl}
        download={`${clip.clip_id}.mp4`}
        className="inline-block mt-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        Download
      </a>
    </div>
  );
})()}



                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoProcessor;
