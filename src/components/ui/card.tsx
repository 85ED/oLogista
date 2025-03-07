import { GlowingEffect } from "./glowing-effect";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  isDarkMode?: boolean;
}

export function Card({ children, isDarkMode, className, ...props }: CardProps) {
  return (
    <div className="relative" {...props}>
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 relative`}>
        <GlowingEffect
          spread={40}
          glow={true}
          disabled={false}
          proximity={64}
          inactiveZone={0.01}
          borderWidth={3}
        />
        {children}
      </div>
    </div>
  );
}