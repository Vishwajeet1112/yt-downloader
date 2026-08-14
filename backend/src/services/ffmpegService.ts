import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

let ffmpegPath = process.env.FFMPEG_PATH || 'ffmpeg';

export class FfmpegService {
  async checkInstallation(): Promise<{ installed: boolean; version?: string }> {
    try {
      const { stdout } = await this.execCommand(['-version']);
      const versionMatch = stdout.match(/ffmpeg version ([^\s]+)/);
      return { installed: true, version: versionMatch ? versionMatch[1] : 'unknown' };
    } catch {
      return { installed: false };
    }
  }

  async mergeVideoAudio(videoPath: string, audioPath: string, outputPath: string): Promise<void> {
    await this.execCommand([
      '-i', videoPath,
      '-i', audioPath,
      '-c:v', 'copy',
      '-c:a', 'aac',
      '-map', '0:v:0',
      '-map', '1:a:0',
      '-shortest',
      outputPath
    ]);
  }

  async convertAudio(inputPath: string, outputPath: string, format: string, bitrate?: number): Promise<void> {
    const args = ['-i', inputPath];
    if (bitrate) args.push('-b:a', `${bitrate}k`);
    args.push(outputPath);
    await this.execCommand(args);
  }

  async embedThumbnail(inputPath: string, thumbnailPath: string, outputPath: string): Promise<void> {
    await this.execCommand([
      '-i', inputPath,
      '-i', thumbnailPath,
      '-map', '0',
      '-map', '1',
      '-c', 'copy',
      '-disposition:1', 'attached_pic',
      outputPath
    ]);
  }

  private execCommand(args: string[]): Promise<{ stdout: string; stderr: string }> {
    return new Promise((resolve, reject) => {
      const proc = spawn(ffmpegPath, args, { windowsHide: true });
      let stdout = '', stderr = '';
      proc.stdout.on('data', d => stdout += d.toString());
      proc.stderr.on('data', d => stderr += d.toString());
      proc.on('close', code => {
        if (code === 0) resolve({ stdout, stderr });
        else reject(new Error(stderr || stdout));
      });
      proc.on('error', reject);
    });
  }
}