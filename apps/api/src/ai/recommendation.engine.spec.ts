import {
  PresetCandidate,
  rankPresets,
  scorePreset,
  VideoAnalysis,
} from './recommendation.engine';

function preset(overrides: Partial<PresetCandidate> & { id: string; slug: string }): PresetCandidate {
  return {
    name: overrides.slug,
    targetResolution: '1080x1920',
    targetCodec: 'h264',
    targetFps: 30,
    targetBitrate: 4000,
    targetAudioBitrate: 128,
    ...overrides,
  };
}

const verticalStory = preset({
  id: 'p-story',
  slug: 'instagram-story',
  name: 'Instagram Story',
  targetResolution: '1080x1920',
});

const landscapeTelegram = preset({
  id: 'p-telegram',
  slug: 'telegram',
  name: 'Telegram',
  targetResolution: '1280x720',
  targetBitrate: 2500,
});

const whatsappStory = preset({
  id: 'p-wa',
  slug: 'whatsapp-story',
  name: 'WhatsApp Story',
  targetResolution: '720x1280',
  targetBitrate: 2000,
});

const youtubeShorts = preset({
  id: 'p-shorts',
  slug: 'youtube-shorts',
  name: 'YouTube Shorts',
  targetResolution: '1080x1920',
  targetBitrate: 8000,
});

function video(overrides: Partial<VideoAnalysis>): VideoAnalysis {
  return {
    width: 1080,
    height: 1920,
    duration: 15,
    fps: 30,
    bitrate: 8000,
    codec: 'h264',
    fileSize: 15_000_000,
    ...overrides,
  };
}

describe('recommendation engine', () => {
  it('deterministik: input sama selalu menghasilkan skor sama', () => {
    const analysis = video({});
    const first = scorePreset(analysis, verticalStory);
    const second = scorePreset(analysis, verticalStory);

    expect(first).toEqual(second);
  });

  it('video vertikal 9:16 merekomendasikan preset vertikal di atas preset landscape', () => {
    const ranked = rankPresets(video({ width: 1080, height: 1920 }), [
      landscapeTelegram,
      verticalStory,
    ]);

    expect(ranked[0].presetId).toBe('p-story');
    expect(ranked[0].score).toBeGreaterThan(ranked[1].score);
  });

  it('video landscape 16:9 merekomendasikan preset landscape', () => {
    const ranked = rankPresets(
      video({ width: 1920, height: 1080, bitrate: 5000 }),
      [landscapeTelegram, verticalStory, whatsappStory],
    );

    expect(ranked[0].presetId).toBe('p-telegram');
  });

  it('rasio aspek yang sama persis mendapat skor faktor penuh', () => {
    const match = scorePreset(video({ width: 540, height: 960 }), verticalStory);
    const mismatch = scorePreset(video({ width: 960, height: 540 }), verticalStory);

    expect(match.score).toBeGreaterThan(mismatch.score);
    expect(match.reasons).toContain('Rasio aspek video sudah sesuai target platform');
  });

  it('resolusi sumber rendah menurunkan skor dan memberi alasan', () => {
    const lowRes = scorePreset(video({ width: 360, height: 640 }), verticalStory);
    const highRes = scorePreset(video({ width: 1080, height: 1920 }), verticalStory);

    expect(lowRes.score).toBeLessThan(highRes.score);
    expect(lowRes.reasons).toContain('Resolusi sumber di bawah target, hasil dapat kurang tajam');
  });

  it('bitrate tinggi dinilai baik karena dapat dioptimalkan turun', () => {
    const highBitrate = scorePreset(video({ bitrate: 10_000 }), whatsappStory);
    const lowBitrate = scorePreset(video({ bitrate: 500 }), whatsappStory);

    expect(highBitrate.score).toBeGreaterThan(lowBitrate.score);
    expect(highBitrate.reasons.join(' ')).toContain('akan dioptimalkan ke 2000 kbps');
  });

  it('codec berbeda mendapat penalti tetapi tetap dapat direkomendasikan', () => {
    const sameCodec = scorePreset(video({ codec: 'h264' }), verticalStory);
    const otherCodec = scorePreset(video({ codec: 'vp9' }), verticalStory);

    expect(otherCodec.score).toBeLessThan(sameCodec.score);
    expect(otherCodec.reasons.join(' ')).toContain('ditranscode');
  });

  it('durasi melebihi batas platform menurunkan skor preset ber-batas', () => {
    const longVideo = video({ duration: 45 });
    const wa = scorePreset(longVideo, whatsappStory);
    const shorts = scorePreset(longVideo, youtubeShorts);

    expect(wa.reasons.join(' ')).toContain('melebihi batas 30s');
    // YouTube Shorts (batas 60s) tidak terkena penalti durasi.
    expect(shorts.reasons.join(' ')).not.toContain('melebihi batas');
  });

  it('fps sumber rendah menurunkan skor', () => {
    const lowFps = scorePreset(video({ fps: 15 }), verticalStory);
    const normalFps = scorePreset(video({ fps: 30 }), verticalStory);

    expect(lowFps.score).toBeLessThan(normalFps.score);
  });

  it('metadata tidak diketahui dinilai netral tanpa crash', () => {
    const unknown = scorePreset(
      video({ width: 0, height: 0, bitrate: 0, fps: 0, codec: 'unknown', duration: 0, fileSize: 0 }),
      verticalStory,
    );

    expect(unknown.score).toBeGreaterThan(0);
    expect(unknown.score).toBeLessThan(100);
  });

  it('skor selalu berada pada rentang 0-100', () => {
    const extreme = scorePreset(
      video({ width: 100, height: 5000, bitrate: 1, fps: 1, duration: 10_000 }),
      whatsappStory,
    );

    expect(extreme.score).toBeGreaterThanOrEqual(0);
    expect(extreme.score).toBeLessThanOrEqual(100);
  });

  it('skor seri diurutkan deterministik berdasarkan slug', () => {
    const twin = preset({ id: 'p-twin', slug: 'aaa-twin', name: 'Twin', targetResolution: '1080x1920' });
    const twinB = preset({ id: 'p-twin-b', slug: 'zzz-twin', name: 'Twin B', targetResolution: '1080x1920' });

    const ranked = rankPresets(video({}), [twinB, twin]);

    expect(ranked[0].slug).toBe('aaa-twin');
  });
});
