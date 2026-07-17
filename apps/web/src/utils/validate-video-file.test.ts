import { describe, expect, it } from 'vitest';

import { MAX_UPLOAD_SIZE_BYTES, validateVideoFile } from './validate-video-file';

function createFile(name: string, size: number): File {
  const file = new File(['x'], name, { type: 'video/mp4' });
  Object.defineProperty(file, 'size', { value: size });
  return file;
}

describe('validateVideoFile', () => {
  it('menerima video mp4 di bawah batas ukuran', () => {
    expect(validateVideoFile(createFile('video.mp4', 1024))).toEqual({ valid: true });
  });

  it('menerima seluruh ekstensi yang didukung tanpa peka kapital', () => {
    for (const name of ['a.MOV', 'b.avi', 'c.mkv', 'd.WEBM']) {
      expect(validateVideoFile(createFile(name, 1024)).valid).toBe(true);
    }
  });

  it('menolak format yang tidak didukung', () => {
    const result = validateVideoFile(createFile('document.pdf', 1024));
    expect(result.valid).toBe(false);
  });

  it('menolak file tanpa ekstensi', () => {
    expect(validateVideoFile(createFile('video', 1024)).valid).toBe(false);
  });

  it('menolak file yang melebihi 500 MB', () => {
    const result = validateVideoFile(createFile('big.mp4', MAX_UPLOAD_SIZE_BYTES + 1));
    expect(result.valid).toBe(false);
  });
});
