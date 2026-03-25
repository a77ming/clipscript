import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs/promises';
import { existsSync } from 'fs';

export interface ProcessingProgress {
  step: string;
  progress: number;
  message: string;
}

export class VideoProcessor {
  private outputDir: string;
  private onProgress?: (progress: ProcessingProgress) => void;

  constructor(outputDir: string, onProgress?: (progress: ProcessingProgress) => void) {
    this.outputDir = outputDir;
    this.onProgress = onProgress;
  }

  async processVideo(
    videoPath: string,
    reelScripts: any[],
    videoName: string
  ): Promise<{
    clipFiles: string[];
    finalVideo: string;
    executionTable: string;
  }> {
    try {
      await fs.mkdir(this.outputDir, { recursive: true });
      const clipsDir = path.join(this.outputDir, 'clips');
      await fs.mkdir(clipsDir, { recursive: true });

      this.onProgress?.({
        step: 'cutting',
        progress: 10,
        message: 'Cutting clip ranges...',
      });

      const clipFiles: string[] = [];

      for (let i = 0; i < reelScripts.length; i++) {
        const reel = reelScripts[i];
        const startSeconds = this.timeToSeconds(reel.start_time);
        const endSeconds = this.timeToSeconds(reel.end_time);
        const duration = endSeconds - startSeconds;

        const clipPath = path.join(
          clipsDir,
          `${videoName}_clip_${i + 1}_${reel.start_time.replace(/:/g, '-')}_${reel.end_time.replace(/:/g, '-')}.mp4`
        );

        await this.cutVideo(videoPath, clipPath, reel.start_time, duration);

        clipFiles.push(clipPath);

        this.onProgress?.({
          step: 'cutting',
          progress: 10 + (i + 1) * 20,
          message: `Cut clip ${i + 1}/${reelScripts.length}`,
        });
      }

      this.onProgress?.({
        step: 'merging',
        progress: 60,
        message: 'Merging selected clips...',
      });

      const finalVideo = path.join(this.outputDir, `${videoName}_highlight_clips.mp4`);
      await this.mergeVideos(clipFiles, finalVideo);

      this.onProgress?.({
        step: 'generating',
        progress: 90,
        message: 'Generating execution table...',
      });

      const executionTable = path.join(this.outputDir, `${videoName}_execution_table.txt`);
      await this.generateExecutionTable(reelScripts, videoName, executionTable);

      this.onProgress?.({
        step: 'complete',
        progress: 100,
        message: 'Export complete.',
      });

      return {
        clipFiles,
        finalVideo,
        executionTable,
      };
    } catch (error) {
      throw new Error(`Video processing failed: ${error}`);
    }
  }

  private async cutVideo(
    inputPath: string,
    outputPath: string,
    startTime: string,
    duration: number
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .setStartTime(startTime)
        .setDuration(duration)
        .videoCodec('libx264')
        .audioCodec('aac')
        .outputOptions([
          '-preset fast',
          '-avoid_negative_ts make_zero',
        ])
        .on('end', () => resolve())
        .on('error', (err) => reject(err))
        .save(outputPath);
    });
  }

  private async mergeVideos(inputPaths: string[], outputPath: string): Promise<void> {
    const listFilePath = path.join(this.outputDir, 'file_list.txt');

    const listContent = inputPaths
      .map((p) => {
        const absPath = path.resolve(p);
        return `file '${absPath.replace(/'/g, "'\\''")}'`;
      })
      .join('\n');

    await fs.writeFile(listFilePath, listContent);

    return new Promise((resolve, reject) => {
      ffmpeg()
        .input(listFilePath)
        .inputOptions(['-f concat', '-safe 0'])
        .videoCodec('libx264')
        .audioCodec('aac')
        .outputOptions(['-preset fast'])
        .on('end', () => resolve())
        .on('error', (err) => reject(err))
        .save(outputPath);
    });
  }

  private async generateExecutionTable(
    reelScripts: any[],
    videoName: string,
    outputPath: string
  ): Promise<void> {
    let content = '='.repeat(100) + '\n';
    content += 'ClipScript Execution Table\n';
    content += '='.repeat(100) + '\n';
    content += `Generated at: ${new Date().toLocaleString('en-US')}\n`;
    content += `Source video: ${videoName}\n`;
    content += `Clip count: ${reelScripts.length}\n`;
    content += `Editorial goal: social-ready short-form clips with added context and creative direction\n`;
    content += '\n';

    reelScripts.forEach((reel, i) => {
      content += '\n' + '='.repeat(100) + '\n';
      content += `[Clip ${i + 1}] ${reel.title}\n`;
      content += '='.repeat(100) + '\n';
      content += `Hook: "${reel.hook_subtitle}"\n`;
      content += `Range: ${reel.start_time} - ${reel.end_time}\n`;
      if (reel.target_emotion) {
        content += `Target emotion: ${reel.target_emotion}\n`;
      }
      content += '\n';

      content += 'Cut sequence:\n';
      content += `   ${reel.cut_sequence}\n`;
      content += '\n';

      content += 'Scene notes:\n';
      (reel.scene_descriptions || []).forEach((desc: string, idx: number) => {
        content += `   Scene ${idx + 1}: ${desc}\n`;
      });
      content += '\n';

      content += 'Voiceover:\n';
      if (reel.voiceover_script) {
        content += `${reel.voiceover_script}\n`;
        if (reel.voiceover_style) {
          content += `Style: ${reel.voiceover_style}\n`;
        }
      } else if (reel.subtitle_strategy?.new_subtitles_voiceover) {
        content += `   ${reel.subtitle_strategy.new_subtitles_voiceover}\n`;
      }
      content += '\n';

      content += 'Subtitle plan:\n';
      content += `   Preserved dialogue:\n`;
      (reel.subtitle_strategy?.original_subtitles || []).forEach((sub: string) => {
        content += `     - ${sub}\n`;
      });

      if (reel.subtitle_strategy?.info_captions && reel.subtitle_strategy.info_captions.length > 0) {
        content += `   Added info captions:\n`;
        reel.subtitle_strategy.info_captions.forEach((cap: string) => {
          content += `     - ${cap}\n`;
        });
      }

      if (reel.subtitle_strategy?.emphasis_elements && reel.subtitle_strategy.emphasis_elements.length > 0) {
        content += `   Emphasis elements:\n`;
        reel.subtitle_strategy.emphasis_elements.forEach((ele: string) => {
          content += `     - ${ele}\n`;
        });
      }
      content += '\n';

      content += 'Editing direction:\n';
      content += `   ${reel.editing_direction || 'Not provided'}\n`;
      content += '\n';

      if (reel.originality_elements && reel.originality_elements.length > 0) {
        content += 'Editorial value checklist:\n';
        reel.originality_elements.forEach((ele: string) => {
          content += `   ${ele}\n`;
        });
        content += '\n';
      }

      content += `Why this clip: ${reel.reason}\n`;
    });

    content += '\n' + '='.repeat(100) + '\n';
    content += 'Notes\n';
    content += '='.repeat(100) + '\n';
    content += 'This export includes hook ideas, context captions, voiceover angles, and editing direction so each clip has clear editorial value beyond raw trimming.\n';

    await fs.writeFile(outputPath, content, 'utf-8');
  }

  private timeToSeconds(timeStr: string): number {
    const parts = timeStr.split(':');
    if (parts.length === 3) {
      const [h, m, s] = parts.map(Number);
      return h * 3600 + m * 60 + s;
    }
    return 0;
  }

  static async checkFFmpeg(): Promise<boolean> {
    return new Promise((resolve) => {
      ffmpeg.getAvailableFormats((err, formats) => {
        resolve(!err);
      });
    });
  }
}
