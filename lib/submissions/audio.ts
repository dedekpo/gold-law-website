import { Mp3Encoder } from "@breezystack/lamejs";

/**
 * Audio excerpting for screen recordings, entirely in the browser. The
 * browser's own demuxer/decoder does the heavy lifting: decodeAudioData
 * accepts any container the browser can play and ignores the video track.
 * The selected range is then encoded to MP3 with lamejs (same approach as the
 * backoffice's screen-recording utility).
 */

// decodeAudioData resamples to its context's rate, so decoding through an
// OfflineAudioContext at 22.05 kHz halves the PCM footprint of a phone
// recording (48 kHz stereo is ~690 MB for 30 minutes) — plenty for speech,
// ringtones and voicemail playback, and a rate MP3 encodes natively.
const DECODE_SAMPLE_RATE = 22050;

type DecodingContext = Pick<BaseAudioContext, "decodeAudioData"> & { close?: () => Promise<void> };

function decodingContext(): DecodingContext {
  const w = window as Window & {
    webkitOfflineAudioContext?: typeof OfflineAudioContext;
    webkitAudioContext?: typeof AudioContext;
  };
  const Offline = window.OfflineAudioContext ?? w.webkitOfflineAudioContext;
  if (Offline) {
    try {
      return new Offline(1, 1, DECODE_SAMPLE_RATE);
    } catch {
      // Some older WebKit builds reject rates below 44.1 kHz; fall through.
    }
  }
  const Ctor = window.AudioContext ?? w.webkitAudioContext;
  if (!Ctor) throw new Error("This browser cannot decode audio.");
  return new Ctor();
}

/** Decode the audio track of a media file. Rejects when it has none. */
export async function decodeAudioTrack(source: Blob): Promise<AudioBuffer> {
  const buffer = await source.arrayBuffer();
  const ctx = decodingContext();
  try {
    // Older Safari only implements the callback form.
    return await new Promise<AudioBuffer>((resolve, reject) => {
      const maybePromise = ctx.decodeAudioData(buffer, resolve, reject);
      if (maybePromise && typeof (maybePromise as Promise<AudioBuffer>).then === "function") {
        (maybePromise as Promise<AudioBuffer>).then(resolve, reject);
      }
    });
  } finally {
    void ctx.close?.();
  }
}

/**
 * Waveform peaks for drawing: `buckets` values in 0..1, each the loudest
 * sample (any channel) in its slice of the recording.
 */
export function computePeaks(buffer: AudioBuffer, buckets: number): Float32Array {
  const peaks = new Float32Array(buckets);
  const length = buffer.length;
  const per = Math.max(1, Math.floor(length / buckets));
  for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
    const data = buffer.getChannelData(ch);
    for (let b = 0; b < buckets; b++) {
      const start = b * per;
      const end = Math.min(length, start + per);
      let max = 0;
      // Stride through long buckets; the peak of ~2k samples is visually the same.
      const stride = Math.max(1, Math.floor((end - start) / 2048));
      for (let i = start; i < end; i += stride) {
        const v = Math.abs(data[i]);
        if (v > max) max = v;
      }
      if (max > peaks[b]) peaks[b] = max;
    }
  }
  let global = 0;
  for (let b = 0; b < buckets; b++) if (peaks[b] > global) global = peaks[b];
  if (global > 0) for (let b = 0; b < buckets; b++) peaks[b] /= global;
  return peaks;
}

// Screen recordings carry full-range system audio (ringtones, voicemail
// playback), so use a music-grade rate rather than a speech-band one.
const CLIP_KBPS = 128;

function floatTo16(samples: Float32Array): Int16Array {
  const out = new Int16Array(samples.length);
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    out[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return out;
}

/**
 * Encode [startSeconds, endSeconds) of the decoded audio as an MP3 blob.
 * Yields to the event loop periodically so the page stays responsive while a
 * multi-minute excerpt encodes.
 */
export async function encodeMp3Range(
  buffer: AudioBuffer,
  startSeconds: number,
  endSeconds: number,
  onProgress?: (fraction: number) => void,
): Promise<Blob> {
  const rate = buffer.sampleRate;
  const from = Math.max(0, Math.floor(startSeconds * rate));
  const to = Math.min(buffer.length, Math.ceil(endSeconds * rate));
  if (to <= from) throw new Error("Empty excerpt.");

  const channels = Math.min(buffer.numberOfChannels, 2);
  const left = floatTo16(buffer.getChannelData(0).subarray(from, to));
  const right = channels === 2 ? floatTo16(buffer.getChannelData(1).subarray(from, to)) : undefined;
  const encoder = new Mp3Encoder(channels, rate, CLIP_KBPS);

  // lamejs types its output as Uint8Array<ArrayBufferLike>, which BlobPart
  // rejects; the buffers are ordinary ArrayBuffers, so the cast holds.
  const chunks: BlobPart[] = [];
  const block = 1152;
  let blocksSinceYield = 0;
  for (let i = 0; i < left.length; i += block) {
    const chunk = encoder.encodeBuffer(
      left.subarray(i, i + block),
      right?.subarray(i, i + block),
    );
    if (chunk.length > 0) chunks.push(chunk as BlobPart);
    if (++blocksSinceYield >= 200) {
      blocksSinceYield = 0;
      onProgress?.(i / left.length);
      await new Promise<void>((resolve) => setTimeout(resolve, 0));
    }
  }
  const tail = encoder.flush();
  if (tail.length > 0) chunks.push(tail as BlobPart);
  onProgress?.(1);
  return new Blob(chunks, { type: "audio/mpeg" });
}
