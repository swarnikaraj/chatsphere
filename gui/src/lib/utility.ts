// lib/utils.ts
export function cn(...inputs: (string | undefined)[]) {
    return inputs.filter(Boolean).join(' ');
}

