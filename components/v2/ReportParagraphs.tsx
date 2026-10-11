import { splitReportParagraphs } from './reportReading';

/** Plain text only. Paragraph boundaries belong to the editorial source. */
export default function ReportParagraphs({ text, className = '' }: { text: string; className?: string }) {
  return <div className={`ad-report-copy ${className}`.trim()}>
    {splitReportParagraphs(text).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
  </div>;
}
