import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { promises as fs } from 'fs'
import path from 'path'
import BackButton from './components/BackButton'

interface DocsPageProps {
  params: Promise<{
    slug: string[]
  }>
}

async function getMarkdownContent(slug: string[]) {
  try {
    // URL 경로를 조합
    const urlPath = slug.join('/')
    
    // 이미 .md로 끝나는지 확인
    const fileName = urlPath.endsWith('.md') ? urlPath : urlPath + '.md'
    const filePath = path.join(process.cwd(), 'docs', fileName)
    
    console.log('파일 경로 시도:', filePath)
    const content = await fs.readFile(filePath, 'utf8')
    return content
  } catch (error) {
    console.error('Markdown 파일 로드 오류:', error)
    return null
  }
}

export default async function DocsPage({ params }: DocsPageProps) {
  const resolvedParams = await params
  const content = await getMarkdownContent(resolvedParams.slug)
  
  if (!content) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-gray-800 rounded-lg p-8 shadow-lg border border-gray-700">
          <div className="prose prose-invert prose-lg max-w-none">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
              h1: ({ children }) => (
                <h1 className="text-3xl font-bold mb-6 text-blue-400 border-b border-gray-600 pb-3">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-2xl font-semibold mt-8 mb-4 text-green-400">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-xl font-semibold mt-6 mb-3 text-purple-400">
                  {children}
                </h3>
              ),
              h4: ({ children }) => (
                <h4 className="text-lg font-semibold mt-4 mb-2 text-orange-400">
                  {children}
                </h4>
              ),
              p: ({ children }) => (
                <p className="mb-4 text-white leading-relaxed">
                  {children}
                </p>
              ),
              ul: ({ children }) => (
                <ul className="mb-4 text-white space-y-2">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="mb-4 text-white space-y-2">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="ml-4">
                  <span className="text-blue-400 mr-2">•</span>
                  {children}
                </li>
              ),
              strong: ({ children }) => (
                <strong className="font-bold text-yellow-100">
                  {children}
                </strong>
              ),
              em: ({ children }) => (
                <em className="italic text-blue-100">
                  {children}
                </em>
              ),
              code: ({ children }) => (
                <code className="bg-gray-700 px-2 py-1 rounded text-green-100 font-mono text-sm">
                  {children}
                </code>
              ),
              pre: ({ children }) => (
                <pre className="bg-gray-700 p-4 rounded-lg overflow-x-auto mb-4 border border-gray-600">
                  {children}
                </pre>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-blue-500 pl-4 py-2 mb-4 bg-gray-700 rounded-r-lg">
                  {children}
                </blockquote>
              ),
              table: ({ children }) => (
                <div className="overflow-x-auto mb-4">
                  <table className="w-full border-collapse border border-gray-600">
                    {children}
                  </table>
                </div>
              ),
              th: ({ children }) => (
                <th className="border border-gray-600 px-4 py-2 bg-gray-700 text-blue-300 font-semibold">
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="border border-gray-600 px-4 py-2 text-white">
                  {children}
                </td>
              ),
              a: ({ href, children }) => (
                <a 
                  href={href} 
                  className="text-blue-400 hover:text-blue-300 underline transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {children}
                </a>
              )
            }}
            >
              {content}
            </ReactMarkdown>
          </div>
          
          {/* 뒤로 가기 버튼 */}
          <div className="mt-8 pt-6 border-t border-gray-600">
            <BackButton />
          </div>
        </div>
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: DocsPageProps) {
  const resolvedParams = await params
  const fileName = resolvedParams.slug.join('/')
  
  return {
    title: `${fileName} - MoneyShift AI 문서`,
    description: 'MoneyShift AI 데이터 수집 전략 및 시스템 문서'
  }
} 