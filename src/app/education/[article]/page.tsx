"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

// Import all article data
import relationshipArticles from "@/data/articles";

function ArticleTemplate() {
  const { article } = useParams<{ article: string }>();
  console.log(article);
  // Find the article by slug
  const currentArticle = relationshipArticles.find((art) => art.slug === article);
  console.log(currentArticle);
  if (!currentArticle) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Article Not Found
          </h1>
          <p className="text-gray-600 mb-8">
            The article you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link
            href="/education"
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all"
          >
            Back to Education Hub
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Featured Image */}
      <div className="relative bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-800 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
          <nav className="mb-8">
            <Link
              href="/education"
              className="text-white/80 hover:text-white flex items-center text-sm font-medium"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Education Hub
            </Link>
          </nav>

          <div className="max-w-4xl">
            <div className="flex items-center mb-6">
              <span className="inline-block bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full mr-4">
                {currentArticle.category.toUpperCase()}
              </span>
              <div className="flex items-center text-white/70 text-sm">
                <span>📚 Article</span>
                <span className="mx-2">•</span>
                <span>Dating DNA Education</span>
              </div>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              {currentArticle.title}
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
              {currentArticle.excerpt}
            </p>

            {/* Article Tags */}
            <div className="flex flex-wrap gap-2">
              {currentArticle.tags?.map((tag: string, index: number) => (
                <span 
                  key={index}
                  className="bg-white/10 text-white px-3 py-1 rounded-full text-sm font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Article Content */}
        <div className="mb-12">
          <div className="prose prose-lg max-w-none">
            <div className="text-lg text-gray-700 leading-relaxed whitespace-pre-line">
              {currentArticle.content}
            </div>
          </div>
        </div>

        {/* Key Takeaway */}
        <div className="mb-12">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-8 border border-indigo-100">
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Key Takeaway
                </h2>
                <p className="text-lg text-gray-700 leading-relaxed">
                  {currentArticle.takeaway}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Related Articles */}
        <div className="mt-20 pt-16 border-t border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">
            More Articles in {currentArticle.category}
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {relationshipArticles
              .filter((art) => art.category === currentArticle.category && art.id !== currentArticle.id)
              .slice(0, 3)
              .map((related, index) => (
                <Link
                  key={index}
                  href={`/education/${related.slug}`}
                  className="block group"
                >
                  <div className="bg-gray-50 rounded-xl p-6 transition-all group-hover:bg-gray-100 group-hover:shadow-md">
                    <div className="flex items-center mb-3">
                      <span className="text-xs font-semibold text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full">
                        {related.category}
                      </span>
                    </div>
                    <h4 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors mb-2">
                      {related.title}
                    </h4>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {related.excerpt}
                    </p>
                  </div>
                </Link>
              ))}
          </div>
          {relationshipArticles.filter((art) => art.category === currentArticle.category && art.id !== currentArticle.id).length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No related articles found in this category.</p>
              <Link 
                href="/education"
                className="text-indigo-600 hover:text-indigo-800 font-medium mt-2 inline-block"
              >
                Browse all articles →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ArticleTemplate;
