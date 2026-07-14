export type TimeOfDay = 'night' | 'morning' | 'afternoon' | 'evening';

export function getTimeOfDay(date: Date = new Date()): TimeOfDay {
  const hour = date.getHours();
  if (hour < 5 || hour >= 20) return 'night';
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

export function getGreeting(date: Date = new Date()): string {
  const day = date.getDay(); // 0=Sunday .. 5=Friday, 6=Saturday
  if (day === 6) return 'Happy Sabbath';
  if (day === 5) return 'Happy Preparation Day';

  switch (getTimeOfDay(date)) {
    case 'night':
      return 'Good Night';
    case 'morning':
      return 'Good Morning';
    case 'afternoon':
      return 'Good Afternoon';
    case 'evening':
      return 'Good Evening';
  }
}

export function formatLongDate(date: Date = new Date()): string {
  return date.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });
}
