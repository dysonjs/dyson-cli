export function time(task: (...args: unknown[]) => unknown) {
  return async () => {
    const start = performance.now();
    await task();
    const end = performance.now();
    console.log(`\x1b[36m It takes ${Math.round(end - start)}ms. \x1b[0m`);
  };
}
