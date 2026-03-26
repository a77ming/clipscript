import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { VideoProcessor } from '@/lib/video-processor';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

const getUploadDir = () => process.env.UPLOAD_DIR || path.join(/* turbopackIgnore: true */ process.cwd(), 'uploads');
const getOutputDir = () => process.env.OUTPUT_DIR || path.join(/* turbopackIgnore: true */ process.cwd(), 'outputs');

export async function POST(request: NextRequest) {
  try {
    const uploadDir = getUploadDir();
    const outputDir = getOutputDir();
    const body = await request.json();
    const { videoFileName, reelScripts, videoName } = body;

    if (!videoFileName || !reelScripts || reelScripts.length === 0) {
      return NextResponse.json({ error: 'Missing required video processing parameters.' }, { status: 400 });
    }

    const videoPath = path.join(uploadDir, videoFileName);

    try {
      await fs.access(videoPath);
    } catch {
      return NextResponse.json({ error: 'The uploaded source video could not be found.' }, { status: 404 });
    }

    const sendProgress = async (progress: any) => {
      console.log('Processing progress:', progress);
    };

    const processor = new VideoProcessor(outputDir, sendProgress);

    const result = await processor.processVideo(
      videoPath,
      reelScripts,
      videoName || videoFileName.replace(/\.[^/.]+$/, '')
    );

    const getFileSize = async (filePath: string) => {
      const stats = await fs.stat(filePath);
      return stats.size;
    };

    const finalVideoSize = await getFileSize(result.finalVideo);

    const getDownloadUrl = (filename: string) => `/api/download/${encodeURIComponent(filename)}`;

    return NextResponse.json({
      success: true,
      clipFiles: result.clipFiles.map(f => path.basename(f)),
      clipUrls: result.clipFiles.map(f => getDownloadUrl(path.basename(f))),
      finalVideo: path.basename(result.finalVideo),
      finalVideoSize,
      executionTable: path.basename(result.executionTable),
      downloadUrl: getDownloadUrl(path.basename(result.finalVideo)),
      tableUrl: getDownloadUrl(path.basename(result.executionTable)),
    });
  } catch (error: any) {
    console.error('Video processing failed:', error);
    return NextResponse.json({ error: `Processing failed: ${error.message}` }, { status: 500 });
  }
}
