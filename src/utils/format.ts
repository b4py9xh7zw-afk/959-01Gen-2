import dayjs from 'dayjs';

export const formatDate = (date: string | Date, format?: string): string => {
  const fmt = format || 'YYYY-MM-DD';
  return dayjs(date).format(fmt);
};

export const formatPrice = (price: number, currency?: string): string => {
  const cur = currency || 'CNY';
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: cur,
  }).format(price);
};

export const getStatusBadgeClass = (status: string): string => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'expiring':
      return 'bg-yellow-100 text-yellow-800';
    case 'expired':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getDaysRemaining = (endDate: string): number => {
  const end = dayjs(endDate);
  const now = dayjs();
  return end.diff(now, 'day');
};

export const generateCertificateNumber = (): string => {
  const prefix = 'CERT';
  const timestamp = dayjs().format('YYYYMMDD');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};
