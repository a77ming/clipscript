import { ReelScript } from './ai-analyzer';
import { SubtitleStats } from './srt-parser';

export interface ClipProjectPreviewData {
  success?: boolean;
  fileName: string;
  stats: SubtitleStats;
  reelScripts: ReelScript[];
  srtContent: string;
  synopsis: string;
  videoFileName?: string;
  source?: 'upload' | 'demo';
  parameters?: {
    maxHighlights: number;
    minDuration: number;
    maxDuration: number;
  };
  timestamp?: string;
}

export const DEMO_PROJECT: ClipProjectPreviewData = {
  fileName: 'founder-confession-demo.srt',
  stats: {
    subtitleCount: 18,
    totalDurationSeconds: 92,
  },
  synopsis:
    'A startup founder tries to reassure the team during a product demo, then accidentally reveals the product has never worked reliably in production.',
  source: 'demo',
  srtContent: `1
00:00:01,000 --> 00:00:05,000
Everyone relax. Today's demo is just about confidence.

2
00:00:05,500 --> 00:00:10,000
If we sound certain enough, nobody will ask why the dashboard is still blank.

3
00:00:11,000 --> 00:00:15,000
Wait, you told investors the onboarding flow was already live?

4
00:00:15,500 --> 00:00:19,500
Technically it's live. It just fails for every real customer.

5
00:00:20,000 --> 00:00:24,000
That is not what the deck says.

6
00:00:25,000 --> 00:00:29,000
The deck says what the future wants to hear.

7
00:00:30,000 --> 00:00:34,500
You cannot call imagination a roadmap in front of the board.

8
00:00:35,000 --> 00:00:39,000
I can if the board only looks up when the revenue chart turns red.

9
00:00:40,000 --> 00:00:45,000
So the product has never actually passed a full production test?

10
00:00:45,500 --> 00:00:49,500
Passed? No. Survived? Briefly.

11
00:00:50,000 --> 00:00:54,000
And you're still opening with the line "the system is stable"?

12
00:00:54,500 --> 00:00:58,500
I'm opening with "our momentum is undeniable."

13
00:00:59,000 --> 00:01:03,500
That's not an update. That's a confession with branding.

14
00:01:04,000 --> 00:01:08,000
Fine. What's the truth you want me to say?

15
00:01:08,500 --> 00:01:12,500
That we sold the dream before we built the floor.

16
00:01:13,000 --> 00:01:17,000
And if they walk?

17
00:01:17,500 --> 00:01:21,500
Then at least the lie stops getting payroll.

18
00:01:22,000 --> 00:01:32,000
Okay. No slogans. No fog. We tell them exactly where the product breaks.`,
  reelScripts: [
    {
      title: 'He admitted the dashboard was fake before the meeting even started',
      hook_subtitle: '“If we sound certain enough, nobody will ask why the dashboard is still blank.”',
      start_time: '00:00:01',
      end_time: '00:00:10',
      cut_sequence:
        'Open on the confidence line, then hard-cut into the blank dashboard reveal. Hold the silence for one beat before the next speaker challenges him.',
      scene_descriptions: [
        'Start with the founder forcing calm in a tight medium shot.',
        'Cut immediately to the line about the blank dashboard with an abrupt zoom.',
      ],
      subtitle_strategy: {
        original_subtitles: [
          'Everyone relax. Today\'s demo is just about confidence.',
          'If we sound certain enough, nobody will ask why the dashboard is still blank.',
        ],
        info_captions: [
          'Pre-meeting pep talk turns into accidental confession',
          'Blank dashboard = the real stakes',
        ],
        emphasis_elements: ['Highlight “blank” in a contrasting color', 'Add a one-beat pause before the reveal'],
      },
      voiceover_script:
        'The clip works because it starts like a leadership moment and flips into panic within seconds. You are not watching a strategy session, you are watching someone rehearse denial.',
      voiceover_style: 'deadpan analysis',
      editing_direction:
        'Keep the pacing fast. Trim every gap except the beat after “blank” so the embarrassment lands. Use punch-in crops on the second line.',
      originality_elements: ['narrative contrast', 'added context caption', 'editorial voiceover angle'],
      target_emotion: 'surprise',
      reason: 'The tonal reversal is immediate and easy to understand in a short-form feed.',
    },
    {
      title: '“Technically live” is the most dangerous product update on earth',
      hook_subtitle: '“Technically it’s live. It just fails for every real customer.”',
      start_time: '00:00:11',
      end_time: '00:00:19',
      cut_sequence:
        'Start on the accusation, then let the “technically live” answer land uninterrupted. End on the deck contradiction for a clean punchline.',
      scene_descriptions: [
        'Keep the challenge line visible as a setup caption.',
        'Use a close crop on “fails for every real customer.”',
      ],
      subtitle_strategy: {
        original_subtitles: [
          'Wait, you told investors the onboarding flow was already live?',
          'Technically it\'s live. It just fails for every real customer.',
          'That is not what the deck says.',
        ],
        info_captions: ['Translation: it shipped, but nobody can use it', 'Deck vs reality'],
        emphasis_elements: ['Underline “every real customer”', 'Split-screen deck claim vs actual quote'],
      },
      voiceover_script:
        'This is a perfect short clip because it compresses startup theater into one sentence: the feature exists just enough to be marketed, but not enough to survive contact with users.',
      voiceover_style: 'creator commentary',
      editing_direction:
        'Use subtitle-led editing. Place the phrase “technically live” on screen early, then reveal the customer failure as the second beat.',
      originality_elements: ['translation caption', 'contrast framing', 'commentary layer'],
      target_emotion: 'disbelief',
      reason: 'The quote is sharp, self-contained, and immediately memorable.',
    },
    {
      title: 'They sold the dream before they built the floor',
      hook_subtitle: '“That’s not an update. That’s a confession with branding.”',
      start_time: '00:00:54',
      end_time: '00:01:12',
      cut_sequence:
        'Open on the “confession with branding” line, then cut backwards to the momentum quote as evidence. End on the line about selling the dream before building the floor.',
      scene_descriptions: [
        'Lead with the strongest accusation as the hook.',
        'Use a rewind-style cut into the “momentum is undeniable” line.',
        'Land on the final metaphor and hold the frame for half a second.',
      ],
      subtitle_strategy: {
        original_subtitles: [
          'I\'m opening with "our momentum is undeniable."',
          'That\'s not an update. That\'s a confession with branding.',
          'That we sold the dream before we built the floor.',
        ],
        info_captions: ['Pitch language vs product reality', 'The line that summarizes the whole startup'],
        emphasis_elements: ['Typewriter effect on “confession with branding”', 'Large caption for “built the floor”'],
      },
      voiceover_script:
        'This cut should feel like the thesis statement of the entire scene. The branding line gives you the hook, but the real closer is the metaphor about selling the dream before the floor existed.',
      voiceover_style: 'thesis-driven breakdown',
      editing_direction:
        'Use non-linear sequencing. Start with the accusation, rewind to the euphemism, then pay it off with the final metaphor.',
      originality_elements: ['non-linear structure', 'thesis caption', 'analytical voiceover'],
      target_emotion: 'recognition',
      reason: 'It turns messy dialogue into a clean, quoteable narrative arc.',
    },
    {
      title: 'The meeting finally drops the slogans',
      hook_subtitle: '“Then at least the lie stops getting payroll.”',
      start_time: '00:01:13',
      end_time: '00:01:32',
      cut_sequence:
        'Start with the payroll line as a cold open. Then cut into “Okay. No slogans. No fog.” to make the final resolution feel earned.',
      scene_descriptions: [
        'Open on the harshest line in isolation.',
        'Cut to the founder conceding and stripping away the slogans.',
      ],
      subtitle_strategy: {
        original_subtitles: [
          'Then at least the lie stops getting payroll.',
          'Okay. No slogans. No fog. We tell them exactly where the product breaks.',
        ],
        info_captions: ['This is the first honest line in the room', 'From spin to accountability'],
        emphasis_elements: ['Fade the background under “No slogans. No fog.”', 'Use a clean lower-third for the final promise'],
      },
      voiceover_script:
        'This ending clip is useful because it resolves the argument. Instead of another failure joke, it gives the audience a turning point: the moment spin finally loses to clarity.',
      voiceover_style: 'resolution-focused commentary',
      editing_direction:
        'Let the second line breathe. Slow the pacing slightly so the emotional release feels different from the earlier rapid-fire cuts.',
      originality_elements: ['cold open structure', 'resolution framing', 'context captions'],
      target_emotion: 'relief',
      reason: 'Good short-form sets need a closer, and this one lands on accountability rather than chaos.',
    },
  ],
};
