export function BrandMark({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="heartGradLight" x1="10" y1="10" x2="86" y2="70" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#c98bd6" />
          <stop offset="55%" stopColor="#e8916b" />
          <stop offset="100%" stopColor="#f3c9a8" />
        </linearGradient>
      </defs>
      <path d="M48 62C30 48 20 37 20 25.5 20 16.9 27 10 35.5 10c5.2 0 10 2.6 12.5 6.7C50.5 12.6 55.3 10 60.5 10 69 10 76 16.9 76 25.5 76 37 66 48 48 62Z" fill="none" stroke="url(#heartGradLight)" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M75 24 78.5 14 82 24 92 27.5 82 31 78.5 41 75 31 65 27.5 75 24Z" fill="url(#heartGradLight)" />
      <path d="M48 62c0 6-3 8-3 12.5A3.5 3.5 0 0 0 48 78a3.5 3.5 0 0 0 3-3.5c0-4.5-3-6.5-3-12.5Z" fill="url(#heartGradLight)" />
    </svg>
  );
}

export function BrandMarkOnDark({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="heartGradDark" x1="10" y1="10" x2="86" y2="70" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#c98bd6" />
          <stop offset="55%" stopColor="#e8916b" />
          <stop offset="100%" stopColor="#f3c9a8" />
        </linearGradient>
      </defs>
      <path d="M48 62C30 48 20 37 20 25.5 20 16.9 27 10 35.5 10c5.2 0 10 2.6 12.5 6.7C50.5 12.6 55.3 10 60.5 10 69 10 76 16.9 76 25.5 76 37 66 48 48 62Z" fill="none" stroke="url(#heartGradDark)" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M75 24 78.5 14 82 24 92 27.5 82 31 78.5 41 75 31 65 27.5 75 24Z" fill="url(#heartGradDark)" />
      <path d="M48 62c0 6-3 8-3 12.5A3.5 3.5 0 0 0 48 78a3.5 3.5 0 0 0 3-3.5c0-4.5-3-6.5-3-12.5Z" fill="url(#heartGradDark)" />
    </svg>
  );
}

export function Wordmark({ className = "" }) {
  return (
    <span className={className}>
      <em className="not-italic italic">Femina</em>Pulse
    </span>
  );
}

export function HeroArt() {
  return (
    <svg viewBox="0 0 96 96" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="heartGradHero" x1="10" y1="10" x2="86" y2="70" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#c98bd6" />
          <stop offset="55%" stopColor="#e8916b" />
          <stop offset="100%" stopColor="#f3c9a8" />
        </linearGradient>
      </defs>
      <path d="M48 62C30 48 20 37 20 25.5 20 16.9 27 10 35.5 10c5.2 0 10 2.6 12.5 6.7C50.5 12.6 55.3 10 60.5 10 69 10 76 16.9 76 25.5 76 37 66 48 48 62Z" fill="none" stroke="url(#heartGradHero)" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M75 24 78.5 14 82 24 92 27.5 82 31 78.5 41 75 31 65 27.5 75 24Z" fill="url(#heartGradHero)" />
      <path d="M48 62c0 6-3 8-3 12.5A3.5 3.5 0 0 0 48 78a3.5 3.5 0 0 0 3-3.5c0-4.5-3-6.5-3-12.5Z" fill="url(#heartGradHero)" />
    </svg>
  );
}


export const SideNavIcons = {
  dashboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="12" width="4" height="9" />
      <rect x="10" y="7" width="4" height="14" />
      <rect x="17" y="3" width="4" height="18" />
    </svg>
  ),
  log: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </svg>
  ),
  risk: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4z" />
    </svg>
  ),
  knowledge: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 5c3-1.5 6-1.5 8 0v14c-2-1.5-5-1.5-8 0V5z" />
      <path d="M20 5c-3-1.5-6-1.5-8 0v14c2-1.5 5-1.5 8 0V5z" />
    </svg>
  ),
  profile: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c1.5-4.5 5-6 8-6s6.5 1.5 8 6" />
    </svg>
  ),
  recommendations: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8" />
      <circle cx="12" cy="12" r="3.2" />
    </svg>
  ),
};

export const FeatureIcons = {
  chart: (
    <svg viewBox="0 0 40 40">
      <rect x="4" y="4" width="32" height="32" rx="10" fill="#F3E6EC" />
      <path d="M13 24l5-8 4 5 5-9" stroke="#6B2E4D" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 40 40">
      <rect x="4" y="4" width="32" height="32" rx="10" fill="#E4EFE6" />
      <circle cx="20" cy="20" r="8" fill="none" stroke="#3F5A43" strokeWidth="2.4" />
      <path d="M20 15v5l4 3" stroke="#3F5A43" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  ),
  star: (
    <svg viewBox="0 0 40 40">
      <rect x="4" y="4" width="32" height="32" rx="10" fill="#FCEFDC" />
      <path d="M20 10l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" fill="none" stroke="#8A5A17" strokeWidth="2" />
    </svg>
  ),
  book: (
    <svg viewBox="0 0 40 40">
      <rect x="4" y="4" width="32" height="32" rx="10" fill="#F6DFE3" />
      <path d="M13 13h14v14H13z" fill="none" stroke="#9C3E52" strokeWidth="2" />
      <path d="M13 18h14M18 13v14" stroke="#9C3E52" strokeWidth="2" />
    </svg>
  ),
  leaf: (
    <svg viewBox="0 0 40 40">
      <rect x="4" y="4" width="32" height="32" rx="10" fill="#F3E6EC" />
      <path d="M13 26c2-8 5-12 7-12s5 4 7 12" stroke="#6B2E4D" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <circle cx="20" cy="12" r="2.4" fill="#6B2E4D" />
    </svg>
  ),
  shield: (
    <svg viewBox="0 0 40 40">
      <rect x="4" y="4" width="32" height="32" rx="10" fill="#E4EFE6" />
      <rect x="12" y="12" width="16" height="16" rx="3" fill="none" stroke="#3F5A43" strokeWidth="2.2" />
      <path d="M16 20h8M20 16v8" stroke="#3F5A43" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  ),
};

export const KnowledgeIcons = {
  basics: (
    <svg width="46" height="46" viewBox="0 0 46 46">
      <circle cx="23" cy="23" r="16" fill="none" stroke="#6B2E4D" strokeWidth="2.2" />
      <path d="M23 15v8l6 4" stroke="#6B2E4D" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  ),
  symptoms: (
    <svg width="46" height="46" viewBox="0 0 46 46">
      <path d="M23 12l4 8 9 1-6.5 6.5 1.5 9-8-4.5-8 4.5 1.5-9L10 21l9-1z" fill="none" stroke="#3F5A43" strokeWidth="2" />
    </svg>
  ),
  nutrition: (
    <svg width="46" height="46" viewBox="0 0 46 46">
      <path d="M23 14c-6 0-10 5-10 11 0 5 4 9 10 9s10-4 10-9c0-6-4-11-10-11z" fill="none" stroke="#8A5A17" strokeWidth="2.2" />
      <path d="M23 14V8" stroke="#8A5A17" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  ),
  exercise: (
    <svg width="46" height="46" viewBox="0 0 46 46">
      <circle cx="17" cy="14" r="3" fill="#9C3E52" />
      <path d="M17 19l2 8 6 3M19 27l-5 8M19 27l7-3 5 5" stroke="#9C3E52" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  sleep: (
    <svg width="46" height="46" viewBox="0 0 46 46">
      <path d="M28 15a10 10 0 108.5 15.5A9 9 0 0128 15z" fill="#3F5A43" />
    </svg>
  ),
  care: (
    <svg width="46" height="46" viewBox="0 0 46 46">
      <path d="M23 33s-11-6.5-11-15A6.5 6.5 0 0123 14a6.5 6.5 0 0111 4c0 8.5-11 15-11 15z" fill="none" stroke="#6B2E4D" strokeWidth="2.2" />
    </svg>
  ),
};
