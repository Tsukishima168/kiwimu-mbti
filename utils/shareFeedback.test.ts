import { describe, expect, it, vi } from 'vitest';
import { shareWithFeedback } from './shareFeedback';

describe('truthful share feedback', () => {
  const data = { text: 'Your Kiwimu result', url: 'https://kiwimu.com/' };
  it('reports native success after delivery resolves', async () => {
    const writeText = vi.fn();
    expect(await shareWithFeedback(data, { share: vi.fn().mockResolvedValue(undefined), clipboard: { writeText } })).toBe('shared');
    expect(writeText).not.toHaveBeenCalled();
  });
  it('does not copy or show an error when the user cancels', async () => {
    const writeText = vi.fn();
    expect(await shareWithFeedback(data, { share: vi.fn().mockRejectedValue({ name: 'AbortError' }), clipboard: { writeText } })).toBe('cancelled');
    expect(writeText).not.toHaveBeenCalled();
  });
  it('falls back to clipboard when native sharing is unavailable or denied', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    expect(await shareWithFeedback(data, { share: vi.fn().mockRejectedValue({ name: 'NotAllowedError' }), clipboard: { writeText } })).toBe('copied');
    expect(writeText).toHaveBeenCalledWith('Your Kiwimu result\n\nhttps://kiwimu.com/');
    expect(await shareWithFeedback(data, { clipboard: { writeText } })).toBe('copied');
  });
  it('never claims copy success if clipboard is missing or blocked', async () => {
    expect(await shareWithFeedback(data, {})).toBe('failed');
    expect(await shareWithFeedback(data, { clipboard: { writeText: vi.fn().mockRejectedValue(new Error('blocked')) } })).toBe('failed');
  });
  it('does not append the same link twice', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    await shareWithFeedback({ ...data, text: `Result\n${data.url}` }, { clipboard: { writeText } });
    expect(writeText).toHaveBeenCalledWith(`Result\n${data.url}`);
  });
});
