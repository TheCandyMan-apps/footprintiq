import { Finding } from "../ufm";

/**
 * Behavioral Fingerprinting
 * 
 * Extracts linguistic patterns, emoji usage, activity cadence,
 * and provides similarity scoring between behavioral profiles.
 */

export interface BehavioralProfile {
  linguistic: {
    avgWordLength: number;
    sentenceComplexity: number;
    vocabularyRichness: number;
    punctuationStyle: string[];
  };
  emoji: {
    frequentEmojis: string[];
    emojiDensity: number;
  };
  activity: {
    peakHours: number[];
    peakDays: number[];
    postingFrequency: number;
  };
  platform: {
    primaryPlatforms: string[];
    platformDiversity: number;
  };
}

/**
 * Extract behavioral profile from findings
 */
export function extractBehaviour(findings: Finding[]): BehavioralProfile {
  const textSamples: string[] = [];
  const timestamps: Date[] = [];
  const platforms: Set<string> = new Set();
  const emojis: string[] = [];

  findings.forEach((finding) => {
    finding.evidence.forEach((e) => {
      if (e.key === "bio" || e.key === "description" || e.key === "post") {
        if (typeof e.value === "string") {
          textSamples.push(e.value);
          // Extract emojis
          const emojiMatches = e.value.match(/[\u{1F300}-\u{1F9FF}]/gu);
          if (emojiMatches) emojis.push(...emojiMatches);
        }
      }
    });
    
    timestamps.push(new Date(finding.observedAt));
    platforms.add(finding.provider);
  });

  const linguistic = analyzeLinguistic(textSamples);
  const emoji = analyzeEmoji(emojis, textSamples);
  const activity = analyzeActivity(timestamps);
  const platform = analyzePlatform(Array.from(platforms));

  return { linguistic, emoji, activity, platform };
}

/**
 * Analyze linguistic patterns
 */
function analyzeLinguistic(samples: string[]): BehavioralProfile["linguistic"] {
  if (samples.length === 0) {
    return {
      avgWordLength: 0,
      sentenceComplexity: 0,
      vocabularyRichness: 0,
      punctuationStyle: [],
    };
  }

  const allText = samples.join(" ");
  const words = allText.split(/\s+/).filter((w) => w.length > 0);
  const sentences = allText.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const uniqueWords = new Set(words.map((w) => w.toLowerCase()));

  const avgWordLength = words.reduce((sum, w) => sum + w.length, 0) / words.length || 0;
  const sentenceComplexity = words.length / sentences.length || 0;
  const vocabularyRichness = uniqueWords.size / words.length || 0;

  const punctuationStyle: string[] = [];
  if (allText.includes("!")) punctuationStyle.push("exclamatory");
  if (allText.includes("?")) punctuationStyle.push("inquisitive");
  if ((allText.match(/\.\.\./g) || []).length > 0) punctuationStyle.push("ellipsis");

  return {
    avgWordLength: Math.round(avgWordLength * 10) / 10,
    sentenceComplexity: Math.round(sentenceComplexity * 10) / 10,
    vocabularyRichness: Math.round(vocabularyRichness * 100) / 100,
    punctuationStyle,
  };
}

/**
 * Analyze emoji usage
 */
function analyzeEmoji(emojis: string[], samples: string[]): BehavioralProfile["emoji"] {
  const totalChars = samples.join("").length;
  const emojiCounts = new Map<string, number>();
  
  emojis.forEach((emoji) => {
    emojiCounts.set(emoji, (emojiCounts.get(emoji) || 0) + 1);
  });

  const frequentEmojis = Array.from(emojiCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([emoji]) => emoji);

  const emojiDensity = totalChars > 0 ? emojis.length / totalChars : 0;

  return {
    frequentEmojis,
    emojiDensity: Math.round(emojiDensity * 1000) / 1000,
  };
}

/**
 * Analyze activity patterns
 */
function analyzeActivity(timestamps: Date[]): BehavioralProfile["activity"] {
  if (timestamps.length === 0) {
    return { peakHours: [], peakDays: [], postingFrequency: 0 };
  }

  const hourCounts = new Array(24).fill(0);
  const dayCounts = new Array(7).fill(0);

  timestamps.forEach((ts) => {
    hourCounts[ts.getHours()]++;
    dayCounts[ts.getDay()]++;
  });

  const peakHours = hourCounts
    .map((count, hour) => ({ hour, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)
    .map((x) => x.hour);

  const peakDays = dayCounts
    .map((count, day) => ({ day, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 2)
    .map((x) => x.day);

  // Calculate posting frequency (posts per day)
  const sortedTimestamps = timestamps.sort((a, b) => a.getTime() - b.getTime());
  const timeSpanDays =
    sortedTimestamps.length > 1
      ? (sortedTimestamps[sortedTimestamps.length - 1].getTime() - sortedTimestamps[0].getTime()) /
        (1000 * 60 * 60 * 24)
      : 1;
  const postingFrequency = timestamps.length / timeSpanDays;

  return {
    peakHours,
    peakDays,
    postingFrequency: Math.round(postingFrequency * 10) / 10,
  };
}

/**
 * Analyze platform presence
 */
function analyzePlatform(platforms: string[]): BehavioralProfile["platform"] {
  const platformCounts = new Map<string, number>();
  platforms.forEach((p) => platformCounts.set(p, (platformCounts.get(p) || 0) + 1));

  const primaryPlatforms = Array.from(platformCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([platform]) => platform);

  const platformDiversity = new Set(platforms).size;

  return {
    primaryPlatforms,
    platformDiversity,
  };
}

/**
 * Calculate similarity between two behavioral profiles (0-1)
 */
export function similarity(profile1: BehavioralProfile, profile2: BehavioralProfile): number {
  let score = 0;
  let weights = 0;

  // Linguistic similarity (30% weight)
  const lingDiff = Math.abs(profile1.linguistic.avgWordLength - profile2.linguistic.avgWordLength) / 10;
  score += Math.max(0, 1 - lingDiff) * 0.3;
  weights += 0.3;

  // Emoji similarity (20% weight)
  const commonEmojis = profile1.emoji.frequentEmojis.filter((e) =>
    profile2.emoji.frequentEmojis.includes(e)
  ).length;
  const emojiSim = commonEmojis / Math.max(profile1.emoji.frequentEmojis.length, 1);
  score += emojiSim * 0.2;
  weights += 0.2;

  // Activity overlap (30% weight)
  const commonHours = profile1.activity.peakHours.filter((h) =>
    profile2.activity.peakHours.includes(h)
  ).length;
  const hourSim = commonHours / Math.max(profile1.activity.peakHours.length, 1);
  score += hourSim * 0.3;
  weights += 0.3;

  // Platform overlap (20% weight)
  const commonPlatforms = profile1.platform.primaryPlatforms.filter((p) =>
    profile2.platform.primaryPlatforms.includes(p)
  ).length;
  const platformSim = commonPlatforms / Math.max(profile1.platform.primaryPlatforms.length, 1);
  score += platformSim * 0.2;
  weights += 0.2;

  return Math.round((score / weights) * 100) / 100;
}
