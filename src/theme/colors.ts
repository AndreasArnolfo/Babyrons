export const Colors = {
  pastel: {
    mint: '#98FFC1',
    mintActive: '#65C387',
    lavender: '#E6D5F5',
    peach: '#FFD4B8',
    sky: '#B3E5FC',
    skyActive: '#3182CE', // Blue 500 for actions
    rose: '#FFB3C6',
    roseActive: '#F687B3', // Darker rose for actions
    lemon: '#FFF9C4',
    coral: '#FFCCBC',
  },
  neutral: {
    white: '#FFFFFF',
    lightGray: '#F9FAFB',
    gray: '#E5E7EB',
    darkGray: '#6B7280',
    charcoal: '#1F2937',
    black: '#000000',
  },
  dark: {
    background: '#1A202C', // Cool Gray 900
    surface: '#2D3748',    // Cool Gray 800
    text: '#F7FAFC',       // Gray 50
    textSecondary: '#A0AEC0', // Gray 400
    border: '#4A5568',     // Gray 700
    patternOpacity: 0.03,  // Subtler pattern in dark mode
    gradients: {
      mint: ['#064E3B', '#10B981'] as const, // Deep base highlighting to Emerald
      lavender: ['#4C1D95', '#8B5CF6'] as const, // Deep base to Violet
      sky: ['#0C4A6E', '#0EA5E9'] as const, // Deep base to Sky
      rose: ['#881337', '#F43F5E'] as const, // Deep base to Rose
      blue: ['#1E3A8A', '#3B82F6'] as const, // Navy base to vibrant Blue
      pink: ['#831843', '#EC4899'] as const, // Burgundy base to vibrant Pink
    },
  },
  semantic: {
    success: '#65C387',
    warning: '#FFAB40',
    error: '#FF5252',
    info: '#42A5F5',
  },
  baby: {
    boy: '#B3E5FC',
    girl: '#FFB3C6',
    neutral: '#E6F4FE',
  },
  fantasy: {
    gradientStart: '#4c669f',
    gradientEnd: '#3b5998',
    glassBorder: 'rgba(255, 255, 255, 0.5)',
    glassBg: 'rgba(255, 255, 255, 0.2)',
    textLight: '#FFFFFF',
    textDark: '#1F2937',
    accent: '#FFD700', // Gold for active/awake
  },
  modern: {
    background: '#FFFBF0', // "Warm Cream" - Soft, paper-like
    surface: '#FFFFFF',    // Pure white for cards
    text: '#2D3748',       // Soft Charcoal
    textSecondary: '#718096', // Cool Gray for secondary text
    accent: '#805AD5',     // Soft Purple
    border: '#F3F4F6',
  },
  gradients: {
    mint: ['#E0FFEF', '#A8F0C6'] as const,
    lavender: ['#F8F0FF', '#E9D8FD'] as const,
    sky: ['#EBF8FF', '#BEE3F8'] as const,
    rose: ['#FFF5F7', '#FED7E2'] as const,
    lemon: ['#FFFFF0', '#FEFCBF'] as const, // Extra soft lemon
    blue: ['#EBF8FF', '#90CDF4'] as const,
    pink: ['#FFF5F7', '#FBB6CE'] as const,
    warmOverlay: ['rgba(255, 255, 255, 0)', 'rgba(255, 251, 240, 1)'] as const, // Cream fade
  },
  shadows: {
    soft: {
      shadowColor: '#805AD5', // Purple tint
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 12,
      elevation: 3,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.08,
      shadowRadius: 16,
      elevation: 6,
    },
    glow: {
      shadowColor: '#F6AD55', // Orange/Warm glow
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.15,
      shadowRadius: 20,
      elevation: 8,
    },
  },
};

export const babyColors = [
  Colors.pastel.mint,
  Colors.pastel.lavender,
  Colors.pastel.peach,
  Colors.pastel.sky,
  Colors.pastel.rose,
  Colors.pastel.lemon,
  Colors.pastel.coral,
];
