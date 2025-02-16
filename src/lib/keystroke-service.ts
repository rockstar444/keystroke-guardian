
interface KeyTiming {
  key: string;
  pressTime: number;
  releaseTime: number | null;
}

interface KeystrokePattern {
  timings: KeyTiming[];
  totalTime: number;
  averagePressTime: number;
}

export class KeystrokeService {
  private static readonly SIMILARITY_THRESHOLD = 0.75;

  static calculatePattern(timings: KeyTiming[]): KeystrokePattern {
    const validTimings = timings.filter(timing => timing.releaseTime !== null);
    const totalTime = Math.max(...validTimings.map(t => t.releaseTime!)) - Math.min(...timings.map(t => t.pressTime));
    const pressTimesSum = validTimings.reduce((sum, timing) => sum + (timing.releaseTime! - timing.pressTime), 0);
    
    return {
      timings: [...timings],
      totalTime,
      averagePressTime: pressTimesSum / validTimings.length
    };
  }

  static comparePatterns(pattern1: KeystrokePattern, pattern2: KeystrokePattern): number {
    const timingDiff = Math.abs(pattern1.totalTime - pattern2.totalTime) / Math.max(pattern1.totalTime, pattern2.totalTime);
    const pressDiff = Math.abs(pattern1.averagePressTime - pattern2.averagePressTime) / 
                     Math.max(pattern1.averagePressTime, pattern2.averagePressTime);
    
    const similarity = 1 - ((timingDiff + pressDiff) / 2);
    return similarity;
  }

  static isMatch(pattern1: KeystrokePattern, pattern2: KeystrokePattern): boolean {
    return this.comparePatterns(pattern1, pattern2) >= this.SIMILARITY_THRESHOLD;
  }
}
