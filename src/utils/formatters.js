/**
 * Format currency in Indian Rupees (₹) with Lakhs and Crores support
 */
export function formatCurrency(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} L`;
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format highway chainage (e.g. Km 142+450)
 */
export function formatChainage(km, meter = 0) {
  if (typeof km === 'string' && km.includes('+')) return km;
  const kmNum = Math.floor(Number(km) || 0);
  const mNum = Math.floor(Number(meter) || 0);
  return `Km ${kmNum}+${String(mNum).padStart(3, '0')}`;
}

/**
 * Get PCI Rating Badge metadata
 */
export function getPCIRating(pciScore) {
  const score = Math.round(Number(pciScore) || 0);
  if (score >= 85) {
    return {
      score,
      label: 'Good (Optimal)',
      grade: 'A',
      color: 'text-emerald-700',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      barColor: 'bg-emerald-500',
      description: 'Routine preventive maintenance only.',
    };
  }
  if (score >= 70) {
    return {
      score,
      label: 'Satisfactory',
      grade: 'B',
      color: 'text-lime-700',
      bgColor: 'bg-lime-50',
      borderColor: 'border-lime-200',
      badgeClass: 'bg-lime-100 text-lime-800 border-lime-300',
      barColor: 'bg-lime-500',
      description: 'Minor surface treatment / crack sealing needed.',
    };
  }
  if (score >= 55) {
    return {
      score,
      label: 'Fair (Degraded)',
      grade: 'C',
      color: 'text-amber-700',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
      barColor: 'bg-amber-500',
      description: 'Slurry seal or micro-surfacing recommended.',
    };
  }
  if (score >= 40) {
    return {
      score,
      label: 'Poor (Critical Defect)',
      grade: 'D',
      color: 'text-orange-700',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      badgeClass: 'bg-orange-100 text-orange-800 border-orange-300',
      barColor: 'bg-orange-500',
      description: 'Structural mill & asphalt overlay required.',
    };
  }
  return {
    score,
    label: 'Failed / Hazard',
    grade: 'F',
    color: 'text-rose-700',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
    barColor: 'bg-rose-600',
    description: 'Immediate deep reconstruction / emergency closure.',
  };
}

/**
 * Format date in readable Indian standard format
 */
export function formatDate(dateString, includeTime = false) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  const options = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  };
  
  if (includeTime) {
    options.hour = '2-digit';
    minute: '2-digit';
    options.hour12 = true;
  }

  return new Intl.DateTimeFormat('en-IN', options).format(date);
}

/**
 * Relative time helper (e.g. 12 mins ago, 3 hours ago)
 */
export function formatRelativeTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffSec = Math.floor((now - date) / 1000);

  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86400)}d ago`;
}
