import ffmpeg from 'fluent-ffmpeg';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __dirname = dirname(fileURLToPath(import.meta.url));

async function convertMp4ToMkv(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .output(outputPath)
      .videoCodec('copy') 
      .audioCodec('copy') 
      .format('matroska') 
      .on('end', () => {
        console.log('Conversion finished');
        resolve();
      })
      .on('error', (err) => {
        console.error('Error during conversion:', err.message);
        reject(err);
      })
      .run();
  });
}

async function main() {
  const inputPath = join(__dirname, 'custom-video.mp4');
  const outputPath = join(__dirname, 'output.mkv');

  try {
    await convertMp4ToMkv(inputPath, outputPath);
    console.log('Video converted to MKV successfully');
  } catch (error) {
    console.error('Failed to convert video:', error);
  }
}

main();
