import ReactMarkdown from "react-markdown";

const markdownComponents = {
  h1: ({ children }) => (
    <h1 className="mb-3 text-xl font-bold text-slate-800">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="mb-2 mt-4 text-lg font-bold text-slate-800">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-2 mt-4 font-bold text-slate-800">{children}</h3>
  ),
  p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
  ul: ({ children }) => <ul className="mb-3 list-disc space-y-1 pl-5">{children}</ul>,
  ol: ({ children }) => <ol className="mb-3 list-decimal space-y-1 pl-5">{children}</ol>,
  li: ({ children }) => <li>{children}</li>,
  pre: ({ children }) => (
    <pre className="mb-3 overflow-x-auto rounded-xl bg-slate-900 p-4 text-sm text-slate-100">
      {children}
    </pre>
  ),
  code: ({ children, className }) =>
    className ? (
      <code className={className}>{children}</code>
    ) : (
      <code className="rounded bg-violet-100 px-1 py-0.5 text-violet-900">
        {children}
      </code>
    ),
};

export default function MarkdownContent({ children, className = "" }) {
  return (
    <div className={`text-sm leading-6 text-slate-600 ${className}`}>
      <ReactMarkdown components={markdownComponents}>{children}</ReactMarkdown>
    </div>
  );
}
