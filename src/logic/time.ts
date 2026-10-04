import type { TimeOfDay } from '../data/dares';

export const SECOND_MS = 1000;
export const DAY_MS = 24 * 60 * 60 * SECOND_MS;

/** Maps the device's local hour to a time-of-day bucket. */
export function getTimeOfDay(date: Date = new Date()): TimeOfDay {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

const GREETINGS: Record<TimeOfDay, (name: string) => string> = {
  morning: (name) => `Good morning, ${name}.`,
  afternoon: (name) => `Good afternoon, ${name}.`,
  evening: (name) => `Good evening, ${name}.`,
  night: (name) => `A quiet night, ${name}.`,
};

export function getGreeting(name: string, date: Date = new Date()): string {
  return GREETINGS[getTimeOfDay(date)](name);
}

/** Formats a millisecond duration as HH:MM:SS, rounding up so 00:00:00 means "now". */
export function formatCountdown(remainingMs: number): string {
  const totalSeconds = Math.max(0, Math.ceil(remainingMs / SECOND_MS));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((n) => String(n).padStart(2, '0')).join(':');
}
