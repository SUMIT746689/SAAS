export const formatNumber = (number: number) => {
    return new Intl.NumberFormat('en-IN', {}).format(number);
  }