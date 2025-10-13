const hairstyleCategoryLabels: Record<string, string> = {
  short: 'Tóc ngắn',
  long: 'Tóc dài',
  bob: 'Tóc bob',
  bangs: 'Tóc mái',
  medium: 'Tóc ngang vai',
  buzz: 'Đầu đinh',
  extension: 'Nối tóc',
  color: 'Nhuộm màu',
  'color-care': 'Giữ màu',
};

export function translateHairstyleCategory(category?: string | null) {
  if (!category) return 'Không xác định';
  return hairstyleCategoryLabels[category] ?? category;
}

export function translateCompatibilityLabel(label?: string | null) {
  if (!label) return 'Đang đánh giá';
  const normalized = label.trim();
  switch (normalized) {
    case 'Good':
    case 'Phù hợp':
      return 'Phù hợp';
    case 'Fair':
    case 'Tạm ổn':
      return 'Tạm ổn';
    case 'Poor':
    case 'Chưa hợp':
    case 'Chưa phù hợp':
      return 'Chưa hợp';
    default:
      return normalized;
  }
}
