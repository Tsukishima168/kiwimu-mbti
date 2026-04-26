import React from 'react';

type QaNote = {
  id: string;
  body: string;
  path: string;
  title: string;
  createdAt: string;
};

const STORAGE_KEY = 'kiwimu_v2_qa_notes';
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1']);

const readNotes = (): QaNote[] => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const formatNotes = (notes: QaNote[]) =>
  notes
    .map((note, index) => {
      const time = new Date(note.createdAt).toLocaleString('zh-TW', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
      return `${index + 1}. [${time}] ${note.path}\n${note.body}`;
    })
    .join('\n\n');

export default function V2QaNotes() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [draft, setDraft] = React.useState('');
  const [notes, setNotes] = React.useState<QaNote[]>([]);
  const [copyState, setCopyState] = React.useState<'idle' | 'copied' | 'failed'>('idle');

  const isLocalPreview =
    typeof window !== 'undefined' && LOCAL_HOSTS.has(window.location.hostname);

  React.useEffect(() => {
    if (!isLocalPreview) return;
    setNotes(readNotes());
  }, [isLocalPreview]);

  React.useEffect(() => {
    if (!isLocalPreview) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }, [isLocalPreview, notes]);

  if (!isLocalPreview) return null;

  const addNote = () => {
    const body = draft.trim();
    if (!body) return;

    setNotes((current) => [
      {
        id: `qa-${Date.now()}`,
        body,
        path: `${window.location.pathname}${window.location.hash}`,
        title: document.title,
        createdAt: new Date().toISOString(),
      },
      ...current,
    ]);
    setDraft('');
    setCopyState('idle');
  };

  const copyNotes = async () => {
    const output = formatNotes(notes);
    if (!output) return;

    try {
      await navigator.clipboard.writeText(output);
      setCopyState('copied');
    } catch {
      setCopyState('failed');
    }
  };

  const removeNote = (id: string) => {
    setNotes((current) => current.filter((note) => note.id !== id));
    setCopyState('idle');
  };

  return (
    <aside className={isOpen ? 'v2-qa-notes is-open' : 'v2-qa-notes'} aria-label="V2 QA notes">
      <button
        type="button"
        className="v2-qa-tab"
        onClick={() => setIsOpen((value) => !value)}
        aria-expanded={isOpen}
      >
        QA
        {notes.length ? <span>{notes.length}</span> : null}
      </button>

      <div className="v2-qa-panel">
        <div className="v2-qa-head">
          <div>
            <p>V2 QA Notes</p>
            <span>只存在這台電腦的瀏覽器</span>
          </div>
          <button type="button" onClick={() => setIsOpen(false)} aria-label="Close QA notes">
            Close
          </button>
        </div>

        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="寫下要改的地方：題目、角色狀態、文案、節奏、視覺..."
          className="v2-qa-input"
        />

        <div className="v2-qa-actions">
          <button type="button" onClick={addNote} disabled={!draft.trim()}>
            記下這點
          </button>
          <button type="button" onClick={copyNotes} disabled={!notes.length}>
            複製全部
          </button>
        </div>

        <p className="v2-qa-copy-state">
          {copyState === 'copied'
            ? '已複製，可直接貼回對話。'
            : copyState === 'failed'
              ? '複製失敗，但筆記仍保留在側欄。'
              : `${window.location.pathname}${window.location.hash}`}
        </p>

        <div className="v2-qa-list">
          {notes.length ? (
            notes.map((note) => (
              <article key={note.id} className="v2-qa-note">
                <div>
                  <p>{note.body}</p>
                  <span>{note.path}</span>
                </div>
                <button type="button" onClick={() => removeNote(note.id)}>
                  刪除
                </button>
              </article>
            ))
          ) : (
            <p className="v2-qa-empty">人工跑測驗時，看到任何不順就先記在這裡。</p>
          )}
        </div>
      </div>
    </aside>
  );
}
