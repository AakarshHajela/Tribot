interface ConfidenceBadgeProps {
  confidence: number;
  variant?: 'high' | 'medium' | 'low';
}

export function ConfidenceBadge({ confidence, variant }: ConfidenceBadgeProps) {
  const actualVariant = variant || (
    confidence >= 70 ? 'high' : confidence >= 40 ? 'medium' : 'low'
  );

const styles = {
  high: 'bg-green-100 text-green-800 border-green-300',
  medium: 'bg-amber-100 text-amber-800 border-amber-300',
  low: 'bg-red-100 text-red-800 border-red-300'
};

  const icon = {
    high: '✓',
    medium: '⚠',
    low: '⚠'
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${styles[actualVariant]}`}>
      {icon[actualVariant]} {confidence}%
    </span>
  );
}
