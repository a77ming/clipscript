import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

const getOutputDir = () => process.env.OUTPUT_DIR || path.join(/* turbopackIgnore: true */ process.cwd(), 'outputs');
const getUploadDir = () => process.env.UPLOAD_DIR || path.join(/* turbopackIgnore: true */ process.cwd(), 'uploads');

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const outputDir = getOutputDir();
    const uploadDir = getUploadDir();
    const { filename } = await params;

    const decodedFilename = decodeURIComponent(filename);
    const safeFilename = path.basename(decodedFilename);

    if (decodedFilename !== safeFilename) {
      return NextResponse.json({ error: 'Invalid filename.' }, { status: 400 });
    }

    const findFile = async (dir: string): Promise<string | null> => {
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isFile() && entry.name === safeFilename) {
            return fullPath;
          }
          if (entry.isDirectory()) {
            const found = await findFile(fullPath);
            if (found) return found;
          }
        }
      } catch {
        return null;
      }
      return null;
    };

    let filePath = path.join(outputDir, safeFilename);
    try {
      await fs.access(filePath);
    } catch {
      const foundPath = await findFile(outputDir);
      if (foundPath) {
        filePath = foundPath;
      } else {
        filePath = path.join(uploadDir, safeFilename);
        try {
          await fs.access(filePath);
        } catch {
          return NextResponse.json({ error: 'File not found.' }, { status: 404 });
        }
      }
    }

    const fileBuffer = await fs.readFile(filePath);
    const ext = path.extname(safeFilename).toLowerCase();

    const contentTypes: Record<string, string> = {
      '.mp4': 'video/mp4',
      '.mov': 'video/quicktime',
      '.avi': 'video/x-msvideo',
      '.mkv': 'video/x-matroska',
      '.txt': 'text/plain;charset=utf-8',
      '.srt': 'text/plain;charset=utf-8',
      '.csv': 'text/plain;charset=utf-8',
    };

    const encodedFilename = encodeURIComponent(safeFilename);

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentTypes[ext] || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${encodedFilename}"; filename*=UTF-8''${encodedFilename}`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error: any) {
    console.error('Download failed:', error);
    return NextResponse.json({ error: 'Download failed.' }, { status: 500 });
  }
}
