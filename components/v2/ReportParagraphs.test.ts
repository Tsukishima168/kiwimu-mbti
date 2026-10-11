import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import ReportParagraphs from './ReportParagraphs';

it('renders every authored paragraph and keeps content as escaped text', () => {
  const html = renderToStaticMarkup(createElement(ReportParagraphs, {
    text: '第一段。\n\n<script>alert("example")</script>\n下一行。', className: 'ad-carry-body',
  }));
  expect(html).toContain('<p>第一段。</p>');
  expect(html).toContain('&lt;script&gt;alert(&quot;example&quot;)&lt;/script&gt;\n下一行。');
  expect(html.match(/<p>/g)).toHaveLength(2);
  expect(html).not.toContain('<script>');
});
