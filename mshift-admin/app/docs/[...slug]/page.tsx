import { notFound } from 'next/navigation';

import { promises as fs } from 'fs';
import path from 'path';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import BackButton from './components/BackButton';

interface DocsPageProps {
  params: Promise<{
    slug: string[];
  }>;
}

async function getMarkdownContent(slug: string[]) {
  try {
    // URL 경로를 조합
    const urlPath = slug.join('/');

    // 이미 .md로 끝나는지 확인
    const fileName = urlPath.endsWith('.md') ? urlPath : urlPath + '.md';
    const filePath = path.join(process.cwd(), 'docs', fileName);

    console.log('파일 경로 시도:', filePath);
    const content = await fs.readFile(filePath, 'utf8');
    return content;
  } catch (error) {
    console.error('Markdown 파일 로드 오류:', error);
    return null;
  }
}

export default async function DocsPage({ params }: DocsPageProps) {
  const resolvedParams = await params;
  const content = await getMarkdownContent(resolvedParams.slug);

  if (!content) {
    notFound();
  }

  return (
    <div className='min-h-screen bg-gray-900 text-white'>
      <div className='container mx-auto max-w-4xl px-4 py-8'>
        <div className='rounded-lg border border-gray-700 bg-gray-800 p-8 shadow-lg'>
          <div className='prose prose-lg prose-invert max-w-none'>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <h1 className='mb-6 border-b border-gray-600 pb-3 text-3xl font-bold text-blue-400'>
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className='mb-4 mt-8 text-2xl font-semibold text-green-400'>
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className='mb-3 mt-6 text-xl font-semibold text-purple-400'>
                    {children}
                  </h3>
                ),
                h4: ({ children }) => (
                  <h4 className='mb-2 mt-4 text-lg font-semibold text-orange-400'>
                    {children}
                  </h4>
                ),
                p: ({ children }) => (
                  <p className='mb-4 leading-relaxed text-white'>{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className='mb-4 space-y-2 text-white'>{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className='mb-4 space-y-2 text-white'>{children}</ol>
                ),
                li: ({ children }) => (
                  <li className='ml-4'>
                    <span className='mr-2 text-blue-400'>•</span>
                    {children}
                  </li>
                ),
                strong: ({ children }) => (
                  <strong className='font-bold text-yellow-100'>
                    {children}
                  </strong>
                ),
                em: ({ children }) => (
                  <em className='italic text-blue-100'>{children}</em>
                ),
                code: ({ children }) => (
                  <code className='rounded bg-gray-700 px-2 py-1 font-mono text-sm text-green-100'>
                    {children}
                  </code>
                ),
                pre: ({ children }) => (
                  <pre className='mb-4 overflow-x-auto rounded-lg border border-gray-600 bg-gray-700 p-4'>
                    {children}
                  </pre>
                ),
                blockquote: ({ children }) => (
                  <blockquote className='mb-4 rounded-r-lg border-l-4 border-blue-500 bg-gray-700 py-2 pl-4'>
                    {children}
                  </blockquote>
                ),
                table: ({ children }) => (
                  <div className='mb-4 overflow-x-auto'>
                    <table className='w-full border-collapse border border-gray-600'>
                      {children}
                    </table>
                  </div>
                ),
                th: ({ children }) => (
                  <th className='border border-gray-600 bg-gray-700 px-4 py-2 font-semibold text-blue-300'>
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className='border border-gray-600 px-4 py-2 text-white'>
                    {children}
                  </td>
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    className='text-blue-400 underline transition-colors hover:text-blue-300'
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    {children}
                  </a>
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          </div>

          {/* 뒤로 가기 버튼 */}
          <div className='mt-8 border-t border-gray-600 pt-6'>
            <BackButton />
          </div>
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: DocsPageProps) {
  const resolvedParams = await params;
  const fileName = resolvedParams.slug.join('/');

  return {
    title: `${fileName} - MoneyShift AI 문서`,
    description: 'MoneyShift AI 데이터 수집 전략 및 시스템 문서',
  };
}
