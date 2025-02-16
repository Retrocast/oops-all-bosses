export function randomChoice<T>(array: T[]): T {
  switch (array.length) {
    case 0:
      return null;
    case 1:
      return array[0];
    default:
      return array[Math.floor(Math.random() * array.length)];
  }
}
