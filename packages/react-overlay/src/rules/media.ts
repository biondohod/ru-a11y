import { findRepeated, queryAll } from './dom';
import { AA_PRESETS, ALL_PRESETS, STRICT_PRESETS, finding, type CustomRule } from './types';

/** Moving content, autoplaying media, captions and frames. */
export const mediaRules: CustomRule[] = [
  {
    id: 'blink',
    presets: ALL_PRESETS,
    check: (context) => queryAll(context, 'blink').map((element) => finding(element, 'serious')),
  },
  {
    id: 'marquee',
    presets: ALL_PRESETS,
    check: (context) => queryAll(context, 'marquee').map((element) => finding(element, 'serious')),
  },
  {
    id: 'no-autoplay-audio',
    presets: AA_PRESETS,
    check: (context) =>
      queryAll(context, 'audio[autoplay], video[autoplay]')
        .filter((media) => !media.hasAttribute('muted') && !media.hasAttribute('controls'))
        .map((media) => finding(media, 'serious')),
  },
  {
    id: 'audio-caption',
    presets: AA_PRESETS,
    check: (context) =>
      queryAll(context, 'audio')
        .filter((audio) => !audio.querySelector('track[kind="captions"], track[kind="subtitles"]'))
        .map((audio) => finding(audio, 'moderate')),
  },
  {
    id: 'frame-title-unique',
    presets: AA_PRESETS,
    check: (context) =>
      findRepeated(queryAll(context, 'iframe[title], frame[title]'), (frame) =>
        frame.getAttribute('title')?.trim(),
      ).map((frame) => finding(frame, 'moderate')),
  },
  {
    id: 'frame-focusable-content',
    presets: STRICT_PRESETS,
    check: (context) =>
      queryAll(context, 'iframe[tabindex="-1"], frame[tabindex="-1"]').map((frame) =>
        finding(frame, 'minor'),
      ),
  },
];
