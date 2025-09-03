import React from 'react';

// Article data structure
export interface Article {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  readTime: string;
  author: string;
  authorTitle: string;
  date: string;
  keyInsight: string;
  introduction: string;
  sections: Section[];
  relatedArticles: RelatedArticle[];
}

interface Section {
  title: string;
  content: React.ReactNode;
}

interface RelatedArticle {
  title: string;
  path: string;
  readTime: string;
  category: string;
}

export const articleData: { [key: string]: Article } = {
  'attachment-theory': {
    id: 'attachment-theory',
    title: 'Attachment Theory Explained',
    subtitle: 'How your childhood shapes your relationships and what you can do about it',
    category: 'Dating Basics',
    readTime: '5 min read',
    author: 'Dr. Sarah Chen',
    authorTitle: 'Relationship Psychology Expert',
    date: 'Dec 15, 2024',
    keyInsight: 'Your attachment style isn\'t permanent. With awareness and effort, you can develop more secure attachment patterns that lead to healthier, more fulfilling relationships.',
    introduction: 'Understanding attachment theory can revolutionize how you approach dating and relationships. Learn how your early experiences influence your romantic patterns and discover practical strategies to build healthier connections.',
    sections: [
      {
        title: 'What is Attachment Theory?',
        content: (
          <div>
            <p className="text-lg leading-relaxed text-gray-700 mb-6">
              Attachment theory, developed by psychologist John Bowlby in the 1950s, explains how the bonds we form with our primary caregivers in early childhood shape our relationships throughout life. These early experiences create internal working models that influence how we approach intimacy, trust, and emotional connection.
            </p>
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center mb-3">
                <span className="text-2xl mr-3">🧠</span>
                <h4 className="font-semibold text-gray-900">The Science Behind It</h4>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                Research shows that attachment patterns formed in early childhood activate the same neural pathways in adult romantic relationships, influencing everything from trust levels to communication styles.
              </p>
            </div>
          </div>
        )
      },
      {
        title: 'The Four Attachment Styles',
        content: (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <span className="text-3xl mr-3">🔒</span>
                <div>
                  <h3 className="text-xl font-bold text-green-800">Secure Attachment</h3>
                  <span className="text-sm text-green-600 font-medium">~50-60% of population</span>
                </div>
              </div>
              <p className="text-green-700 mb-6 leading-relaxed">
                People with secure attachment feel comfortable with intimacy and independence. They trust easily, communicate openly, and handle conflict constructively.
              </p>
              <div className="space-y-2">
                <div className="flex items-center text-green-700 text-sm">
                  <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Comfortable with emotional closeness
                </div>
                <div className="flex items-center text-green-700 text-sm">
                  <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Trust others and themselves
                </div>
                <div className="flex items-center text-green-700 text-sm">
                  <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Handle rejection and conflict well
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <span className="text-3xl mr-3">😰</span>
                <div>
                  <h3 className="text-xl font-bold text-yellow-800">Anxious-Preoccupied</h3>
                  <span className="text-sm text-yellow-600 font-medium">The Worrier</span>
                </div>
              </div>
              <p className="text-yellow-700 mb-6 leading-relaxed">
                Anxious individuals crave intimacy but fear abandonment. They often worry about their partner&apos;s feelings and may become clingy or demanding in relationships.
              </p>
              <div className="space-y-2">
                <div className="flex items-center text-yellow-700 text-sm">
                  <svg className="w-4 h-4 mr-2 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Intense fear of abandonment
                </div>
                <div className="flex items-center text-yellow-700 text-sm">
                  <svg className="w-4 h-4 mr-2 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Need constant reassurance
                </div>
                <div className="flex items-center text-yellow-700 text-sm">
                  <svg className="w-4 h-4 mr-2 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Overthink relationship dynamics
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-sky-50 border border-blue-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <span className="text-3xl mr-3">🚪</span>
                <div>
                  <h3 className="text-xl font-bold text-blue-800">Avoidant-Dismissive</h3>
                  <span className="text-sm text-blue-600 font-medium">The Independent</span>
                </div>
              </div>
              <p className="text-blue-700 mb-6 leading-relaxed">
                Avoidant people value independence over intimacy. They may seem emotionally distant and struggle to open up or commit to relationships.
              </p>
              <div className="space-y-2">
                <div className="flex items-center text-blue-700 text-sm">
                  <svg className="w-4 h-4 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  Value independence over closeness
                </div>
                <div className="flex items-center text-blue-700 text-sm">
                  <svg className="w-4 h-4 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  Difficulty expressing emotions
                </div>
                <div className="flex items-center text-blue-700 text-sm">
                  <svg className="w-4 h-4 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  Struggle with commitment
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <span className="text-3xl mr-3">🌪️</span>
                <div>
                  <h3 className="text-xl font-bold text-red-800">Fearful-Avoidant</h3>
                  <span className="text-sm text-red-600 font-medium">The Conflicted</span>
                </div>
              </div>
              <p className="text-red-700 mb-6 leading-relaxed">
                Fearful individuals want close relationships but fear getting hurt. They may push people away while simultaneously craving connection.
              </p>
              <div className="space-y-2">
                <div className="flex items-center text-red-700 text-sm">
                  <svg className="w-4 h-4 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Desire intimacy but fear rejection
                </div>
                <div className="flex items-center text-red-700 text-sm">
                  <svg className="w-4 h-4 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Push-pull behavior in relationships
                </div>
                <div className="flex items-center text-red-700 text-sm">
                  <svg className="w-4 h-4 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  May sabotage good relationships
                </div>
              </div>
            </div>
          </div>
        )
      },
      {
        title: 'How This Affects Your Dating Life',
        content: (
          <div>
            <p className="text-lg leading-relaxed text-gray-700 mb-8">
              Your attachment style influences everything from who you're attracted to, how you communicate, to how you handle breakups. Understanding your patterns can help you:
            </p>
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-gray-700">Recognize unhealthy relationship dynamics</p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-gray-700">Choose partners who complement your style</p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-gray-700">Communicate more effectively</p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-gray-700">Build healthier relationship habits</p>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
                    <span className="text-white text-lg">🌱</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-green-900 font-bold mb-2">Growth Opportunity</h3>
                  <p className="text-green-800 leading-relaxed">
                    If you identify with anxious or avoidant patterns, remember that change is possible. Many people successfully develop more secure attachment through self-work and healthy relationships.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )
      }
    ],
    relatedArticles: [
      { title: 'Communication Skills for Couples', path: '/education/communication-skills', readTime: '7 min', category: 'Dating Basics' },
      { title: 'Building Trust in Relationships', path: '/education/building-trust', readTime: '6 min', category: 'Personal Growth' },
      { title: 'Healing from Past Relationships', path: '/education/healing-from-past', readTime: '9 min', category: 'Personal Growth' }
    ]
  },

  'communication-skills': {
    id: 'communication-skills',
    title: 'Communication Skills for Couples',
    subtitle: 'Master the art of healthy dialogue and deeper connection',
    category: 'Dating Basics',
    readTime: '7 min read',
    author: 'Dr. Michael Torres',
    authorTitle: 'Communication Specialist',
    date: 'Dec 12, 2024',
    keyInsight: 'Great communication isn\'t about never fighting—it\'s about fighting fair and turning conflicts into opportunities for deeper understanding.',
    introduction: 'Effective communication is the foundation of every strong relationship. Learn practical techniques to express yourself clearly, listen actively, and navigate difficult conversations with confidence.',
    sections: [
      {
        title: 'The Foundation of Healthy Communication',
        content: (
          <div>
            <p className="text-lg leading-relaxed text-gray-700 mb-6">
              Healthy communication goes beyond just talking—it's about creating a safe space where both partners feel heard, understood, and valued. This foundation is built on mutual respect, empathy, and the willingness to be vulnerable.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-4">
                  <span className="text-white text-xl">👂</span>
                </div>
                <h4 className="font-semibold text-blue-900 mb-2">Active Listening</h4>
                <p className="text-blue-700 text-sm">Focus completely on your partner's words, emotions, and body language without planning your response.</p>
              </div>
              <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mb-4">
                  <span className="text-white text-xl">💭</span>
                </div>
                <h4 className="font-semibold text-green-900 mb-2">Empathy</h4>
                <p className="text-green-700 text-sm">Try to understand your partner's perspective and validate their feelings, even when you disagree.</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mb-4">
                  <span className="text-white text-xl">🤝</span>
                </div>
                <h4 className="font-semibold text-purple-900 mb-2">Respect</h4>
                <p className="text-purple-700 text-sm">Maintain kindness and consideration, especially during disagreements or heated moments.</p>
              </div>
            </div>
          </div>
        )
      },
      {
        title: 'The Four Horsemen to Avoid',
        content: (
          <div>
            <p className="text-lg leading-relaxed text-gray-700 mb-8">
              Relationship researcher Dr. John Gottman identified four communication patterns that predict relationship failure. Recognizing and avoiding these "Four Horsemen" can dramatically improve your relationship health.
            </p>
            <div className="space-y-6">
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <span className="text-3xl mr-3">⚔️</span>
                  <h4 className="text-xl font-bold text-red-800">Criticism</h4>
                </div>
                <p className="text-red-700 mb-4">Attacking your partner's character rather than addressing specific behavior.</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-red-800 mb-2">❌ Instead of:</p>
                    <p className="text-sm text-red-700 italic">"You never help with chores. You're so lazy."</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-green-800 mb-2">✅ Try:</p>
                    <p className="text-sm text-green-700 italic">"I feel overwhelmed with housework. Can we discuss how to share responsibilities?"</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <span className="text-3xl mr-3">🛡️</span>
                  <h4 className="text-xl font-bold text-orange-800">Defensiveness</h4>
                </div>
                <p className="text-orange-700 mb-4">Playing the victim or counter-attacking instead of taking responsibility.</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-orange-800 mb-2">❌ Instead of:</p>
                    <p className="text-sm text-orange-700 italic">"It's not my fault! You do it too!"</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-green-800 mb-2">✅ Try:</p>
                    <p className="text-sm text-green-700 italic">"You're right, I can see how that hurt you. Let me work on that."</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      }
    ],
    relatedArticles: [
      { title: 'Attachment Theory Explained', path: '/education/attachment-theory', readTime: '5 min', category: 'Dating Basics' },
      { title: 'Conflict Resolution Strategies', path: '/education/conflict-resolution', readTime: '8 min', category: 'Dating Basics' },
      { title: 'Building Trust in Relationships', path: '/education/building-trust', readTime: '6 min', category: 'Personal Growth' }
    ]
  },

  'building-trust': {
    id: 'building-trust',
    title: 'Building Trust in Relationships',
    subtitle: 'The essential foundation for lasting love and connection',
    category: 'Personal Growth',
    readTime: '6 min read',
    author: 'Dr. Lisa Rodriguez',
    authorTitle: 'Relationship Therapist',
    date: 'Dec 10, 2024',
    keyInsight: 'Trust isn\'t built in grand gestures—it\'s created through consistent small actions that show reliability, honesty, and care over time.',
    introduction: 'Trust is the cornerstone of any healthy relationship. Discover how to build, maintain, and rebuild trust through consistent actions, open communication, and emotional vulnerability.',
    sections: [
      {
        title: 'What Trust Really Means',
        content: (
          <div>
            <p className="text-lg leading-relaxed text-gray-700 mb-6">
              Trust in relationships goes far beyond fidelity. It encompasses emotional safety, reliability, honesty, and the confidence that your partner has your best interests at heart. True trust creates a secure foundation where both partners can be vulnerable and authentic.
            </p>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-4">The Four Pillars of Trust</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3 mt-1">
                    <span className="text-white text-sm font-bold">1</span>
                  </div>
                  <div>
                    <h5 className="font-medium text-blue-900">Reliability</h5>
                    <p className="text-blue-700 text-sm">Following through on promises and commitments</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3 mt-1">
                    <span className="text-white text-sm font-bold">2</span>
                  </div>
                  <div>
                    <h5 className="font-medium text-blue-900">Honesty</h5>
                    <p className="text-blue-700 text-sm">Being truthful, even when it's difficult</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3 mt-1">
                    <span className="text-white text-sm font-bold">3</span>
                  </div>
                  <div>
                    <h5 className="font-medium text-blue-900">Emotional Safety</h5>
                    <p className="text-blue-700 text-sm">Creating space for vulnerability without judgment</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3 mt-1">
                    <span className="text-white text-sm font-bold">4</span>
                  </div>
                  <div>
                    <h5 className="font-medium text-blue-900">Consistency</h5>
                    <p className="text-blue-700 text-sm">Maintaining trustworthy behavior over time</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      }
    ],
    relatedArticles: [
      { title: 'Communication Skills for Couples', path: '/education/communication-skills', readTime: '7 min', category: 'Dating Basics' },
      { title: 'Healing from Past Relationships', path: '/education/healing-from-past', readTime: '9 min', category: 'Personal Growth' },
      { title: 'Setting Healthy Boundaries', path: '/education/setting-boundaries', readTime: '5 min', category: 'Personal Growth' }
    ]
  }
};

export const products = [
  {
    name: 'Singles Assessment',
    price: '$49',
    path: 'singles-assessment'
  },
  {
    name: 'Couples Assessment',
    price: '$97',
    path: 'couples-assessment'
  }
]
// Add more articles as needed...