import express, { Request, Response } from 'express';
import multer from 'multer';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import cors from 'cors';

const app = express();
app.use(cors()); // Enable CORS for all routes

const upload = multer({ dest: 'uploads/' });

app.post('/api/clip-video', upload.single('video'), (req: Request, res: Response) => {
  const { start, end, clipId } = req.body;

  if (!req.file) {
    res.status(400).send('No file uploaded.');
    return;
  }

  const videoPath = req.file.path;
  const outputPath = path.join(__dirname, '..', 'clips', `${clipId}.mp4`);

  const command = `ffmpeg -i "${videoPath}" -ss ${start} -to ${end} -c copy "${outputPath}"`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing FFmpeg: ${error.message}`);
      res.status(500).send(`Error executing FFmpeg: ${error.message}`);
      return;
    }

    if (stderr) {
      console.error(`FFmpeg stderr: ${stderr}`);
      res.status(500).send(`FFmpeg stderr: ${stderr}`);
      return;
    }

    fs.unlink(videoPath, (err) => {
      if (err) console.error(`Error deleting uploaded video: ${err.message}`);
    });
    console.log(`Processing clip from ${start} to ${end} with ID: ${clipId}`);

     res.json({ clipUrl: `/clips/${clipId}.mp4` });


  });
});

app.use('/clips', express.static(path.join(__dirname, '..', 'clips')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
