'use client';

import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

export function CopyButton({ text }: { text: string }) {
  const [status, setStatus] = useState('Copy response');
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setStatus('Copied');
    } catch {
      setStatus('Select the code to copy');
    }
  }
  return (
    <button
      className="copy-button"
      onClick={copy}
      type="button"
      aria-live="polite"
    >
      {status === 'Copied' ? <Check size={14} /> : <Copy size={14} />}
      {status}
    </button>
  );
}
