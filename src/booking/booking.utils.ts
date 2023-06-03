export const getDeadline = (payment: number, date?: Date): string => {
  return new Date((date?.getTime() ?? Date.now()) + payment).toLocaleDateString(
    [],
    {
      day: 'numeric',
      month: 'long',
      localeMatcher: 'best fit',
      weekday: 'long',
    },
  );
};

export const isPastDeadline = (payment: number, date: Date): boolean => {
  return Date.now() > new Date(2023, 2, 16, 23, 59, 0).getTime();
};
