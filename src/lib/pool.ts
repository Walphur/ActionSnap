/** Ejecuta tareas en paralelo con límite de concurrencia */
export async function runPool<T>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<void>
) {
  const queue = [...items];
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (queue.length > 0) {
      const item = queue.shift();
      if (item !== undefined) await fn(item);
    }
  });
  await Promise.all(workers);
}
