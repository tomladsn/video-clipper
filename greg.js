import ffmpeg from 'fluent-ffmpeg';
import { createCanvas } from '@napi-rs/canvas';
import nodeHtmlToImage from 'node-html-to-image';
import { writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __dirname = dirname(fileURLToPath(import.meta.url));

async function captureFrames(tweetData) {
  const width = 800;
  const height = 600;

  for (let i = 0; i < 200; i++) {
    const htmlContent = `
      <div style="background-color: white; width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; opacity: 1; transform: translateY(${i * 2}px); text-align: center; color: black;">
        <img src="${tweetData.profileImage}" alt="Profile" style="border-radius: 50%; width: 100px; height: 100px; margin-bottom: 20px;" />
        <h2 style="font-size: 30px; margin-bottom: 10px;">${tweetData.posterName}</h2>
        <p style="font-size: 24px; margin-bottom: 20px;">${tweetData.postContent}</p>
        <p style="font-size: 20px; color: gray;">${tweetData.date}</p>
      </div>
    `;

    const imageBuffer = await nodeHtmlToImage({
      html: htmlContent,
      quality: 100,
      type: 'png',
      encoding: 'buffer',
      content: {
        width: width,
        height: height,
      },
    });

    writeFileSync(join(__dirname, `frame_${i}.png`), imageBuffer);
  }
}

async function convertFramesToVideo() {
  const outputPath = join(__dirname, 'output.mp4');

  ffmpeg()
    .input('frame_%d.png')
    .inputFPS(30)
    .output(outputPath)
    .videoCodec('libx264')
    .on('end', () => {
      console.log('Video saved to', outputPath);
    })
    .on('error', (err) => {
      console.error('Error:', err.message);
    })
    .run();
}

async function main() {
  const tweetData = {
    profileImage: 'https://pbs.twimg.com/profile_images/1836090522198282240/j3hj0eS6_normal.jpg',
    posterName: 'Matt Walsh @MattWalshBlog',
    postContent: 'Deeply saddened by the passing of Joy Reid’s MSNBC show. It was a great resource for right wing podcasters looking for a clip to play and make fun of. I can’t tell you how many slow news days Joy helped me through. I hope she finds somewhere else to spout her inane bullshit.',
    date: '8:31 PM · Feb 23, 2025',
  };

  await captureFrames(tweetData);
  await convertFramesToVideo();
}

main();
