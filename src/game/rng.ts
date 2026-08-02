/** Mulberry32 seeded PRNG */
export function createRng(seed: number) {
  let s = seed >>> 0
  return {
    next(): number {
      s += 0x6d2b79f5
      let t = s
      t = Math.imul(t ^ (t >>> 15), t | 1)
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    },
    int(max: number): number {
      return Math.floor(this.next() * max)
    },
    pick<T>(arr: readonly T[]): T {
      return arr[this.int(arr.length)]!
    },
    shuffle<T>(arr: T[]): T[] {
      const a = [...arr]
      for (let i = a.length - 1; i > 0; i--) {
        const j = this.int(i + 1)
        ;[a[i], a[j]] = [a[j]!, a[i]!]
      }
      return a
    },
  }
}

export type Rng = ReturnType<typeof createRng>
