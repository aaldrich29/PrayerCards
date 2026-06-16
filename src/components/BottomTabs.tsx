import { NavLink } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { dueCount } from '../lib/stack';

interface Tab {
  to: string;
  label: string;
  icon: React.ReactNode;
  end?: boolean;
}

const iconClass = 'w-6 h-6';

const tabs: Tab[] = [
  {
    to: '/',
    label: 'Pray',
    end: true,
    icon: (
      <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 21s-7-4.5-9.5-9C1 9 2.5 5 6 5c2 0 3 1.2 4 2.5C11 6.2 12 5 14 5c3.5 0 5 4 3.5 7-2.5 4.5-9.5 9-9.5 9z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    to: '/cards',
    label: 'Cards',
    icon: (
      <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="6" width="18" height="13" rx="2" />
        <path d="M7 3.5h10" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: '/answered',
    label: 'Answered',
    icon: (
      <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    to: '/settings',
    label: 'Settings',
    icon: (
      <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1" strokeLinecap="round" />
      </svg>
    ),
  },
];

export function BottomTabs() {
  const due = useAppStore((s) => dueCount(s.cards, Date.now(), s.settings.cadenceMode));

  return (
    <nav className="safe-bottom border-t border-slate-800 bg-slate-900/95 backdrop-blur">
      <div className="mx-auto flex max-w-md">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              `relative flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] transition-colors ${
                isActive ? 'text-indigo-300' : 'text-slate-400'
              }`
            }
          >
            <span className="relative">
              {tab.icon}
              {tab.to === '/' && due > 0 && (
                <span className="absolute -right-2 -top-1 min-w-4 rounded-full bg-indigo-500 px-1 text-center text-[10px] font-semibold leading-4 text-white">
                  {due}
                </span>
              )}
            </span>
            {tab.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
