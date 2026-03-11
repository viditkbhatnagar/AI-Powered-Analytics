/**
 * AI-Powered Analytics ECharts Theme
 * State-of-the-art chart theming with dark mode support
 */

// Premium color palette - vibrant yet professional
export const chartColors = {
  light: {
    // Primary palette - UAE-inspired with modern tech feel
    primary: [
      '#2563EB', // Royal Blue (Dubai)
      '#059669', // Emerald (Abu Dhabi)
      '#7C3AED', // Violet (Innovation)
      '#EA580C', // Orange (Energy)
      '#0891B2', // Cyan (Maritime)
      '#DB2777', // Pink (Accent)
      '#CA8A04', // Amber (Desert)
      '#4F46E5', // Indigo (Tech)
      '#16A34A', // Green (Sustainability)
      '#DC2626', // Red (Alert)
    ],
    // Gradient pairs for area/bar fills
    gradients: {
      blue: ['#3B82F6', '#1D4ED8'],
      green: ['#10B981', '#047857'],
      purple: ['#8B5CF6', '#6D28D9'],
      orange: ['#F97316', '#C2410C'],
      cyan: ['#06B6D4', '#0E7490'],
    },
    // Semantic colors
    positive: '#10B981',
    negative: '#EF4444',
    neutral: '#6B7280',
    // Background & text
    background: 'transparent',
    textPrimary: '#1F2937',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    // Grid & axis
    axisLine: '#E5E7EB',
    splitLine: '#F3F4F6',
    // Tooltip
    tooltipBg: 'rgba(255, 255, 255, 0.96)',
    tooltipBorder: '#E5E7EB',
    tooltipShadow: 'rgba(0, 0, 0, 0.1)',
  },
  dark: {
    primary: [
      '#60A5FA', // Bright Blue
      '#34D399', // Bright Emerald
      '#A78BFA', // Bright Violet
      '#FB923C', // Bright Orange
      '#22D3EE', // Bright Cyan
      '#F472B6', // Bright Pink
      '#FBBF24', // Bright Amber
      '#818CF8', // Bright Indigo
      '#4ADE80', // Bright Green
      '#F87171', // Bright Red
    ],
    gradients: {
      blue: ['#60A5FA', '#3B82F6'],
      green: ['#34D399', '#10B981'],
      purple: ['#A78BFA', '#8B5CF6'],
      orange: ['#FB923C', '#F97316'],
      cyan: ['#22D3EE', '#06B6D4'],
    },
    positive: '#34D399',
    negative: '#F87171',
    neutral: '#9CA3AF',
    background: 'transparent',
    textPrimary: '#F9FAFB',
    textSecondary: '#D1D5DB',
    textMuted: '#9CA3AF',
    axisLine: '#374151',
    splitLine: '#1F2937',
    tooltipBg: 'rgba(17, 24, 39, 0.96)',
    tooltipBorder: '#374151',
    tooltipShadow: 'rgba(0, 0, 0, 0.4)',
  },
};

// Get colors based on theme
export function getChartColors(isDark: boolean) {
  return isDark ? chartColors.dark : chartColors.light;
}

// Create ECharts theme object
export function createEChartsTheme(isDark: boolean) {
  const colors = getChartColors(isDark);
  
  return {
    color: colors.primary,
    backgroundColor: colors.background,
    
    // Title styling
    title: {
      textStyle: {
        color: colors.textPrimary,
        fontSize: 16,
        fontWeight: 600,
        fontFamily: 'Inter, system-ui, sans-serif',
      },
      subtextStyle: {
        color: colors.textSecondary,
        fontSize: 13,
        fontFamily: 'Inter, system-ui, sans-serif',
      },
      left: 'center',
      top: 8,
    },
    
    // Legend styling
    legend: {
      textStyle: {
        color: colors.textSecondary,
        fontSize: 12,
        fontFamily: 'Inter, system-ui, sans-serif',
      },
      icon: 'roundRect',
      itemWidth: 12,
      itemHeight: 12,
      itemGap: 16,
      top: 8,
      right: 16,
    },
    
    // Tooltip styling - premium glass effect
    tooltip: {
      backgroundColor: colors.tooltipBg,
      borderColor: colors.tooltipBorder,
      borderWidth: 1,
      borderRadius: 8,
      padding: [12, 16],
      textStyle: {
        color: colors.textPrimary,
        fontSize: 13,
        fontFamily: 'Inter, system-ui, sans-serif',
      },
      extraCssText: `
        backdrop-filter: blur(8px);
        box-shadow: 0 4px 24px ${colors.tooltipShadow}, 0 0 0 1px ${colors.tooltipBorder};
      `,
      confine: true,
    },
    
    // Grid (chart area)
    grid: {
      left: 60,
      right: 24,
      top: 72,
      bottom: 48,
      containLabel: true,
    },
    
    // X Axis
    xAxis: {
      axisLine: {
        show: true,
        lineStyle: {
          color: colors.axisLine,
          width: 1,
        },
      },
      axisTick: {
        show: false,
      },
      axisLabel: {
        color: colors.textSecondary,
        fontSize: 11,
        fontFamily: 'Inter, system-ui, sans-serif',
        margin: 12,
      },
      splitLine: {
        show: false,
      },
      nameTextStyle: {
        color: colors.textSecondary,
        fontSize: 12,
        fontFamily: 'Inter, system-ui, sans-serif',
      },
    },
    
    // Y Axis
    yAxis: {
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      axisLabel: {
        color: colors.textSecondary,
        fontSize: 11,
        fontFamily: 'Inter, system-ui, sans-serif',
        margin: 12,
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: colors.splitLine,
          type: 'dashed',
          width: 1,
        },
      },
      nameTextStyle: {
        color: colors.textSecondary,
        fontSize: 12,
        fontFamily: 'Inter, system-ui, sans-serif',
      },
    },
    
    // Data Zoom (for interactive charts)
    dataZoom: [
      {
        type: 'inside',
        throttle: 50,
      },
      {
        type: 'slider',
        height: 24,
        bottom: 8,
        borderColor: colors.axisLine,
        fillerColor: isDark ? 'rgba(96, 165, 250, 0.2)' : 'rgba(59, 130, 246, 0.15)',
        handleStyle: {
          color: colors.primary[0],
          borderColor: colors.primary[0],
        },
        textStyle: {
          color: colors.textSecondary,
          fontSize: 11,
        },
        brushSelect: false,
      },
    ],
    
    // Visual Map (for heatmaps, etc.)
    visualMap: {
      textStyle: {
        color: colors.textSecondary,
        fontSize: 11,
        fontFamily: 'Inter, system-ui, sans-serif',
      },
      inRange: {
        color: isDark 
          ? ['#1E3A5F', '#2563EB', '#60A5FA', '#93C5FD']
          : ['#DBEAFE', '#93C5FD', '#3B82F6', '#1D4ED8'],
      },
    },
    
    // Toolbox
    toolbox: {
      iconStyle: {
        borderColor: colors.textSecondary,
      },
      emphasis: {
        iconStyle: {
          borderColor: colors.primary[0],
        },
      },
    },
  };
}

// Animation presets
export const animationConfig = {
  // Smooth entrance
  default: {
    animationDuration: 800,
    animationEasing: 'cubicOut' as const,
    animationDelay: (idx: number) => idx * 50,
  },
  // Fast for updates
  update: {
    animationDuration: 400,
    animationEasing: 'cubicInOut' as const,
  },
  // Staggered for lists
  staggered: {
    animationDuration: 600,
    animationEasing: 'elasticOut' as const,
    animationDelay: (idx: number) => idx * 80,
  },
  // None for performance
  none: {
    animation: false,
  },
};

// Responsive breakpoints
export const responsiveConfig = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
  wide: 1280,
};

// Get responsive font sizes
export function getResponsiveFontSize(width: number) {
  if (width < responsiveConfig.mobile) {
    return { title: 14, label: 10, legend: 10 };
  }
  if (width < responsiveConfig.tablet) {
    return { title: 15, label: 11, legend: 11 };
  }
  return { title: 16, label: 12, legend: 12 };
}
