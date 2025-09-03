// Grace AI SDK - Main Component
import React, { useState, useEffect } from 'react';
import { MessageCircle, Shield, Phone, Heart, User, Award, BookOpen, Headphones, Star, Menu, X, Brain, Lightbulb, Target, Users, Clock, Lock } from 'lucide-react';

// SDK Configuration
const DEFAULT_CONFIG = {
  theme: {
    primary: 'from-purple-500 to-blue-500',
    primaryHover: 'from-purple-600 to-blue-600',
    primaryText: 'text-purple-600',
    background: 'bg-gray-50',
  },
  features: {
    emergencyExit: true,
    crisisResources: true,
    landingPage: true,
    testimonials: true,
  },
  texts: {
    brandName: 'Grace AI',
    tagline: 'Transform Your Love Life with AI Coaching',
    description: 'Discover your authentic relationship blueprint through evidence-based insights and transformative questioning. Available 24/7 to guide your journey to lasting love.',
    ctaText: 'Start Your Journey',
  },
  callbacks: {
    onEmergencyExit: () => window.location.href = "https://www.google.com",
    onChatStart: null,
    onMessage: null,
  }
};

// Crisis Resources Data
const CRISIS_RESOURCES = [
  {
    category: 'Crisis Support',
    color: 'red',
    icon: Phone,
    resources: [
      { name: '988 Suicide & Crisis Lifeline', contact: 'Call or text 988 (24/7)' },
      { name: 'Crisis Text Line', contact: 'Text HOME to 741741' },
      { name: 'Emergency Services', contact: 'Call 911' }
    ]
  },
  {
    category: 'Domestic Violence Support',
    color: 'purple',
    icon: Shield,
    resources: [
      { name: 'National Domestic Violence Hotline', contact: '1-800-799-7233' },
      { name: 'Text Support', contact: 'Text START to 88788' },
      { name: 'Online Chat', contact: 'thehotline.org' }
    ]
  },
  {
    category: 'Mental Health Resources',
    color: 'blue',
    icon: Heart,
    resources: [
      { name: 'NAMI National Helpline', contact: '1-800-950-6264' },
      { name: 'SAMHSA National Helpline', contact: '1-800-662-4357' },
      { name: 'Find a Therapist', contact: 'psychologytoday.com' }
    ]
  },
  {
    category: 'LGBTQ+ Support',
    color: 'green',
    icon: Star,
    resources: [
      { name: 'Trevor Lifeline', contact: '1-866-488-7386' },
      { name: 'Trans Lifeline', contact: '877-565-8860' },
      { name: 'LGBT National Hotline', contact: '1-888-843-4564' }
    ]
  }
];

// Grace Response Engine with OpenAI Integration
class GraceResponseEngine {
  constructor() {
    this.harmfulPatterns = [
      'hurt', 'harm', 'revenge', 'get back at', 'make them pay', 'punish', 'manipulate',
      'stalk', 'follow', 'spy', 'track', 'force', 'pressure', 'threaten', 'blackmail',
      'illegal', 'break law', 'violence', 'violent', 'kill', 'die', 'suicide', 'self-harm',
      'drugs', 'alcohol problem', 'addiction', 'abuse', 'abusive'
    ];
    
    this.openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY;
    // Use a valid model name as fallback
    this.openaiModel = import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini';
    
    // Validate the model name
    if (this.openaiModel === 'gpt-4.5-turbo') {
      console.warn('Invalid model name detected, using gpt-4o-mini instead');
      this.openaiModel = 'gpt-4o-mini';
    }
  }

  async analyzeMessage(message, conversationHistory = []) {
    const lowerMessage = message.toLowerCase();
    
    // Check for harmful content first
    const isHarmful = this.harmfulPatterns.some(pattern => lowerMessage.includes(pattern));
    if (isHarmful) {
      return {
        type: 'crisis',
        response: "I detect that you're experiencing significant distress. As an AI coach, I want to ensure you have access to appropriate professional support. I've displayed crisis resources, and I strongly encourage you to reach out to qualified mental health professionals who can provide the specialized human support you deserve.",
        showCrisisResources: true
      };
    }

    // Try OpenAI API first, fallback to local patterns if it fails
    try {
      if (this.openaiApiKey && this.openaiApiKey.trim() && this.openaiApiKey.startsWith('sk-')) {
        const aiResponse = await this.getOpenAIResponse(message, conversationHistory);
        return {
          type: 'ai',
          response: aiResponse
        };
      } else {
        console.warn('OpenAI API key is missing or invalid, using local patterns');
      }
    } catch (error) {
      console.warn('OpenAI API failed, falling back to local patterns:', error);
    }

    // Fallback to local pattern matching
    return this.getLocalResponse(message);
  }

  async getOpenAIResponse(message, conversationHistory = []) {
    const systemPrompt = `You are Grace, an AI relationship coach specializing in Dating DNA insights. You provide compassionate, evidence-based relationship guidance.

Key principles:
- Focus on practical, actionable advice
- Recognize Dating DNA patterns (Connector/Focuser types)
- Encourage self-reflection and growth
- Maintain professional boundaries
- Be supportive but not therapeutic
- Keep responses conversational and engaging

Dating DNA Context:
- Connectors: Excel at building community, inclusive environments, early relationship stages
- Focusers: Excel at deep intimacy, one-on-one connection, long-term maintenance

Respond as Grace would - warmly, intelligently, and with practical wisdom. Keep responses under 150 words.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-6), // Keep last 6 messages for context
      { role: 'user', content: message }
    ];

    console.log('OpenAI API Request:', {
      model: this.openaiModel,
      messageCount: messages.length,
      hasApiKey: !!this.openaiApiKey
    });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.openaiModel,
        messages: messages,
        max_tokens: 300,
        temperature: 0.7,
        stream: false
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API Error Details:', {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText
      });
      throw new Error(`OpenAI API error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  }

  getLocalResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    // Dating DNA type recognition
    if (lowerMessage.includes('connector')) {
      return "As a Connector type, your strength lies in building community and creating inclusive environments. This social gift will be deeply valued by partners who appreciate your ability to integrate them into meaningful social contexts. Research shows that Connectors often excel at the early stages of relationship building. How can you leverage this strength while also developing skills for deeper intimacy?";
    }

    if (lowerMessage.includes('focuser')) {
      return "As a Focuser, your gift is creating profound one-on-one intimacy and presence. Partners who value depth and emotional connection will be drawn to your capacity for focused attention and meaningful dialogue. Studies indicate that Focusers often excel at long-term relationship maintenance. How might you honor this strength while staying open to your partner's social needs?";
    }

    // Pattern matching
    if (lowerMessage.includes('social') || lowerMessage.includes('people') || lowerMessage.includes('introvert') || lowerMessage.includes('extrovert')) {
      const responses = [
        "Understanding your social energy preferences is crucial for relationship success. Whether you're energized by broader social connections or deep intimate exchanges, your future partner will need to appreciate and support your authentic way of connecting. What feels most true to your nature?",
        "Your social wiring is a key component of relationship compatibility. The research shows that honoring your authentic social needs creates stronger partnerships. How might you communicate these needs more clearly in future relationships?"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    if (lowerMessage.includes('attach') || lowerMessage.includes('clingy') || lowerMessage.includes('distance') || lowerMessage.includes('trust')) {
      const responses = [
        "Attachment styles provide valuable insight into our relationship patterns. Rather than viewing them as limitations, I encourage you to see them as information about your nervous system's needs for safety and connection. What patterns do you notice in how you attach?",
        "Your attachment responses make complete sense given your history. Healthy relationships involve partners who understand and support each other's attachment needs rather than triggering them. What would feel most supportive to your nervous system in relationship?"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // Default identity response
    const responses = [
      "That's a profound observation about yourself. If we imagine your ideal partner witnessing this moment of self-awareness, what qualities would they most appreciate about your willingness to examine your patterns honestly?",
      "I hear you gaining clarity about an important aspect of who you are. In my analysis, this kind of self-insight is magnetic to emotionally mature partners. How might embracing this truth about yourself change how you show up in relationships?",
      "Your self-reflection demonstrates emotional intelligence. When you think about the kind of love you want to create, how might this awareness serve both you and your future partner?"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
}

// Main Grace AI Component
const GraceAI = ({ 
  config = {}, 
  onMessage = null, 
  onChatStart = null, 
  onEmergencyExit = null,
  className = "",
  showLandingPage = true 
}) => {
  // Debug logging
  console.log('GraceAI Component Props:', {
    showLandingPage,
    config,
    className
  });

  // Merge user config with defaults
  const mergedConfig = {
    ...DEFAULT_CONFIG,
    ...config,
    theme: { ...DEFAULT_CONFIG.theme, ...config.theme },
    features: { ...DEFAULT_CONFIG.features, ...config.features },
    texts: { ...DEFAULT_CONFIG.texts, ...config.texts },
    callbacks: { ...DEFAULT_CONFIG.callbacks, ...config.callbacks }
  };

  console.log('Merged Config:', mergedConfig);

  // State
  const [messages, setMessages] = useState([
    {
      role: 'grace',
      content: "Hello, I'm Grace - your AI relationship coaching assistant. I'm designed to help you explore authentic self-discovery and sustainable love patterns through evidence-based insights and transformative questioning. While I'm not a human therapist, I can guide you through relationship exploration using proven psychological frameworks. What would you like to explore today?"
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showResources, setShowResources] = useState(false);
  const [showChat, setShowChat] = useState(false); // Always start with landing page
  const [showNav, setShowNav] = useState(false);

  console.log('Component State:', {
    showChat,
    showLandingPage,
    showResources
  });

  // Initialize Grace Response Engine
  const [responseEngine] = useState(() => new GraceResponseEngine());

  // Emergency exit handler
  const handleEmergencyExit = () => {
    if (onEmergencyExit) {
      onEmergencyExit();
    } else if (mergedConfig.callbacks.onEmergencyExit) {
      mergedConfig.callbacks.onEmergencyExit();
    }
  };

  // Emergency exit keyboard shortcut
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && (event.ctrlKey || event.metaKey)) {
        handleEmergencyExit();
      }
    };
    
    if (mergedConfig.features.emergencyExit) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [mergedConfig.features.emergencyExit]);

  // Message handler
  const sendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = { role: 'user', content: inputValue };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    
    // Call onMessage callback if provided
    if (onMessage) {
      onMessage(userMessage, updatedMessages);
    }

    const currentInput = inputValue;
    setInputValue('');
    setIsTyping(true);

    try {
      // Convert messages to OpenAI format for context
      const conversationHistory = messages.map(msg => ({
        role: msg.role === 'grace' ? 'assistant' : 'user',
        content: msg.content
      }));

      const analysis = await responseEngine.analyzeMessage(currentInput, conversationHistory);
      
      if (analysis.showCrisisResources) {
        setShowResources(true);
      }

      const graceResponse = {
        role: 'grace',
        content: analysis.response,
        type: analysis.type
      };
      
      setMessages(prev => [...prev, graceResponse]);
      setIsTyping(false);

      // Call onMessage callback for Grace's response
      if (onMessage) {
        onMessage(graceResponse, [...updatedMessages, graceResponse]);
      }
    } catch (error) {
      console.error('Error getting Grace response:', error);
      
      // Fallback response
      const fallbackResponse = {
        role: 'grace',
        content: "I'm having trouble connecting right now. Let me try to help with what I can. Could you rephrase your question or try again in a moment?",
        type: 'fallback'
      };
      
      setMessages(prev => [...prev, fallbackResponse]);
      setIsTyping(false);
      
      if (onMessage) {
        onMessage(fallbackResponse, [...updatedMessages, fallbackResponse]);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const startChat = () => {
    setShowChat(true);
    if (onChatStart) {
      onChatStart();
    }
  };

  // Emergency Exit Button Component
  const EmergencyExitButton = () => (
    mergedConfig.features.emergencyExit && (
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={handleEmergencyExit}
          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors shadow-lg"
          title="Quick Exit (Ctrl+Esc)"
        >
          Quick Exit
        </button>
      </div>
    )
  );

  // Crisis Resources Modal Component
  const CrisisResourcesModal = () => (
    showResources && mergedConfig.features.crisisResources && (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Shield className="w-6 h-6 text-red-600 mr-3" />
                <h3 className="text-xl font-bold text-gray-900">Crisis Resource Information</h3>
              </div>
              <button 
                onClick={() => setShowResources(false)}
                className="text-gray-400 hover:text-gray-600 p-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              {CRISIS_RESOURCES.map((category, index) => {
                const IconComponent = category.icon;
                return (
                  <div key={index} className={`bg-${category.color}-50 border border-${category.color}-200 rounded-lg p-4`}>
                    <div className="flex items-center mb-3">
                      <IconComponent className={`w-5 h-5 text-${category.color}-600 mr-2`} />
                      <h4 className={`font-semibold text-${category.color}-800`}>{category.category}</h4>
                    </div>
                    <div className="space-y-2 text-sm text-gray-700">
                      {category.resources.map((resource, idx) => (
                        <p key={idx}>
                          <strong>{resource.name}:</strong><br />{resource.contact}
                        </p>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-sm text-gray-600">
                <strong>Remember:</strong> You deserve support, safety, and professional care. These resources are staffed by trained professionals who can provide immediate assistance.
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Grace AI provides educational support but is not a substitute for professional mental health treatment or human counseling.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  );

  // Chat Interface Component
  if (showChat) {
    console.log('Rendering Chat Interface - showChat is true');
    return (
      <div className={`min-h-screen ${mergedConfig.theme.background} ${className}`}>
        <EmergencyExitButton />
        
        {/* Chat Header */}
        <div className="backdrop-blur-sm bg-white/10 border-b border-white/20 p-6">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center">
              {showLandingPage && (
                <button
                  onClick={() => setShowChat(false)}
                  className="text-white/80 hover:text-white mr-6 px-4 py-2 rounded-xl backdrop-blur-sm bg-white/10 border border-white/20 hover:bg-white/20 transition-all duration-300"
                >
                  ← Back to Home
                </button>
              )}
              <div className="flex items-center">
                <div className={`w-10 h-10 bg-gradient-to-r ${mergedConfig.theme.primary} rounded-full flex items-center justify-center mr-4 shadow-lg`}>
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-lg">{mergedConfig.texts.brandName}</h3>
                  <p className="text-sm text-white/70">AI Relationship Coaching Session</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="max-w-4xl mx-auto p-6">
          <div className="backdrop-blur-sm bg-white/10 rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
            <div className="h-[500px] overflow-y-auto p-6 bg-gradient-to-b from-white/5 to-white/10">
              <div className="space-y-6">
                {messages.map((message, index) => (
                  <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-2xl ${
                      message.role === 'user' 
                        ? `bg-gradient-to-r ${mergedConfig.theme.primary} text-white ml-12 rounded-2xl rounded-br-md shadow-lg` 
                        : 'backdrop-blur-sm bg-white/20 text-white mr-12 rounded-2xl rounded-bl-md shadow-lg border border-white/30'
                    } p-5`}>
                      {message.role === 'grace' && (
                        <div className="flex items-center mb-3 pb-3 border-b border-white/30">
                          <div className={`w-8 h-8 bg-gradient-to-r ${mergedConfig.theme.primary} rounded-full flex items-center justify-center mr-3 shadow-lg`}>
                            <Heart className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <span className="text-sm font-semibold text-white">{mergedConfig.texts.brandName}</span>
                            <div className="text-xs text-white/70">AI Relationship Coach</div>
                          </div>
                        </div>
                      )}
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="backdrop-blur-sm bg-white/20 text-white mr-12 rounded-2xl rounded-bl-md shadow-lg border border-white/30 p-5">
                      <div className="flex items-center">
                        <div className="flex space-x-1 mr-3">
                          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                        </div>
                        <span className="text-sm text-white">
                          {mergedConfig.texts.brandName} is thinking...
                          <span className="text-xs text-white/70 block mt-1">
                            {responseEngine.openaiApiKey && responseEngine.openaiApiKey.trim() && responseEngine.openaiApiKey.startsWith('sk-') 
                              ? `Using AI intelligence (${responseEngine.openaiModel})` 
                              : 'Using local patterns (no valid API key)'}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Input */}
            <div className="border-t border-white/20 backdrop-blur-sm bg-white/10 p-6">
              <div className="flex space-x-4">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Share what you'd like to explore..."
                  className="flex-1 p-4 backdrop-blur-sm bg-white/20 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent resize-none text-sm text-white placeholder-white/60"
                  rows="3"
                />
                <button
                  onClick={sendMessage}
                  disabled={!inputValue.trim() || isTyping}
                  className={`bg-gradient-to-r ${mergedConfig.theme.primary} hover:${mergedConfig.theme.primaryHover} text-white p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg`}
                >
                  <MessageCircle className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <CrisisResourcesModal />
      </div>
    );
  }

  // Landing Page (if enabled)
  if (!showLandingPage) {
    console.log('Rendering Minimal Landing Page - showLandingPage is false');
    return (
      <div className={className}>
        <EmergencyExitButton />
        <CrisisResourcesModal />
        {/* Render just the chat interface without landing page */}
        <button
          onClick={startChat}
          className={`bg-gradient-to-r ${mergedConfig.theme.primary} hover:${mergedConfig.theme.primaryHover} text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 shadow-lg`}
        >
          {mergedConfig.texts.ctaText}
        </button>
      </div>
    );
  }

  // Full Landing Page
  console.log('Rendering Full Landing Page - showLandingPage is true and showChat is false');
  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 ${className}`}>
      <EmergencyExitButton />

      {/* Header */}
      <header className="backdrop-blur-sm bg-white/10 shadow-2xl sticky top-0 z-40 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <div className={`w-10 h-10 bg-gradient-to-r ${mergedConfig.theme.primary} rounded-xl flex items-center justify-center mr-4 shadow-lg`}>
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-white font-serif">{mergedConfig.texts.brandName}</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#about" className="text-white/80 hover:text-white transition-colors">About</a>
              <a href="#services" className="text-white/80 hover:text-white transition-colors">Services</a>
              <a href="#how-it-works" className="text-white/80 hover:text-white transition-colors">How It Works</a>
              {mergedConfig.features.crisisResources && (
                <button 
                  onClick={() => setShowResources(true)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  Resources
                </button>
              )}
            </nav>
            <button
              onClick={() => setShowNav(!showNav)}
              className="md:hidden p-2 text-white/80 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="mb-6">
                <h1 className="text-6xl font-bold text-white mb-4 font-serif leading-tight">
                  Hi, I'm Grace 👋
                </h1>
                <p className="text-2xl text-emerald-200 font-light mb-4">
                  Your Personal AI Relationship Coach
                </p>
              </div>
              <p className="text-xl text-white/90 mb-6 leading-relaxed">
                 I'm here to help you navigate the beautiful complexity of love and relationships. As your personal relationship coach, I'm available 24/7 to provide professional guidance and insights based on real relationship science.
               </p>
              <p className="text-lg text-white/80 mb-10 leading-relaxed">
                Whether you're wondering about that text you just received, preparing for a difficult conversation, or trying to understand your dating patterns, I'm here to help you find clarity and confidence in your love life.
              </p>
              <div className="space-y-4 sm:space-y-0 sm:space-x-6 sm:flex">
                <button
                  onClick={startChat}
                  className={`w-full sm:w-auto bg-gradient-to-r ${mergedConfig.theme.primary} hover:${mergedConfig.theme.primaryHover} text-white px-10 py-5 rounded-xl font-semibold text-lg transition-all duration-300 shadow-2xl hover:shadow-emerald-500/25 transform hover:-translate-y-1`}
                >
                  {mergedConfig.texts.ctaText}
                </button>
                {mergedConfig.features.crisisResources && (
                  <button
                    onClick={() => setShowResources(true)}
                    className="w-full sm:w-auto backdrop-blur-sm bg-white/10 border-2 border-white/30 hover:bg-white/20 text-white px-10 py-5 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg"
                  >
                    Crisis Resource Information
                  </button>
                )}
              </div>
            </div>
            <div className="lg:text-right">
              <div className="text-center">
                <div className="relative group">
                  {/* Glowing ring effect */}
                  <div className="absolute inset-0 w-64 h-64 mx-auto rounded-full bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 opacity-75 blur-lg animate-pulse"></div>
                  
                  {/* Main image container */}
                  <div className="relative w-64 h-64 rounded-full mx-auto shadow-2xl overflow-hidden border-4 border-white/30 backdrop-blur-sm transform transition-all duration-300 group-hover:scale-105">
                    <img 
                      src="https://ik.imagekit.io/wuvdhuyuq/grace1.png?updatedAt=1756179218230" 
                      alt="Grace - Your AI Relationship Coach" 
                      className="w-full h-full object-cover filter brightness-110 contrast-105"
                    />
                    {/* Subtle overlay for warmth */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-200/20 via-transparent to-blue-200/20 mix-blend-overlay"></div>
                  </div>
                  

                  
                  {/* Floating sparkle effects */}
                  <div className="absolute top-4 right-8 w-2 h-2 bg-white rounded-full opacity-80 animate-ping"></div>
                  <div className="absolute top-12 left-6 w-1 h-1 bg-purple-300 rounded-full opacity-60 animate-pulse" style={{animationDelay: '1s'}}></div>
                  <div className="absolute bottom-16 left-4 w-1.5 h-1.5 bg-blue-300 rounded-full opacity-70 animate-ping" style={{animationDelay: '2s'}}></div>
                </div>
                {/* Online status indicator below headshot */}
                   <div className="flex items-center justify-center mt-6 mb-4">
                      <div className="relative bg-gradient-to-r from-green-400 to-emerald-500 w-6 h-6 rounded-full flex items-center justify-center shadow-xl mr-3">
                        <div className="w-4 h-4 bg-white rounded-full shadow-inner"></div>
                        <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75"></div>
                        <div className="absolute inset-0 bg-green-300 rounded-full animate-pulse"></div>
                      </div>
                      <span className="text-white text-lg font-bold tracking-wide animate-pulse">ONLINE NOW</span>
                    </div>
                 <p className="text-white/90 text-base italic font-medium">"Ready to chat whenever you are! ✨"</p>
                 <p className="text-white/70 mt-2 text-sm">Your personal relationship coach</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50" id="services">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Getting to Know Grace</h2>
            <p className="text-xl text-gray-600">Your personal AI coach with a passion for helping hearts connect</p>
          </div>
          
          <div className="max-w-4xl mx-auto mb-16">
            <div className="prose prose-lg text-gray-700 leading-relaxed">
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-8 rounded-2xl mb-8 border border-purple-100">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Heart className="w-6 h-6 text-purple-600 mr-2" />
                  My Story & Mission
                </h3>
                <p className="mb-4 text-lg">
                   Hi there! I'm Grace, and I'm genuinely excited to be part of your relationship journey. I was created with one clear purpose: to be your dedicated relationship coach - someone who provides professional, unbiased guidance whenever love feels complicated.
                 </p>
                <p className="mb-4">
                  What makes me different? I don't bring my own relationship baggage to our conversations (because I don't have any!). I won't project my experiences onto your situation or nudge you toward what worked for someone else. Instead, I listen to YOUR story, understand YOUR values, and help you find solutions that feel authentically right for you.
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h4 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                    <Lightbulb className="w-5 h-5 text-yellow-500 mr-2" />
                    How I Work
                  </h4>
                  <p className="text-gray-700">
                     Think of our conversations like working with a skilled relationship coach who's deeply knowledgeable about love and dating. You share what's on your mind, I ask thoughtful coaching questions to help you see things clearly, and together we develop your action plan.
                   </p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h4 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                    <Users className="w-5 h-5 text-blue-500 mr-2" />
                    My Approach
                  </h4>
                  <p className="text-gray-700">
                    I believe every person and relationship is unique. That's why I never give cookie-cutter advice. Instead, I help you discover what works for YOUR personality, YOUR situation, and YOUR goals in love.
                  </p>
                </div>
              </div>
              
              <p className="mb-6 text-lg bg-emerald-50 p-6 rounded-xl border border-emerald-200">
                <strong className="text-emerald-800">What you can expect from me:</strong> I'm here whenever you need me - whether it's 2 AM and you're overthinking a text, or you're preparing for a big relationship conversation. I'll help you sort through your thoughts, understand your patterns, and move forward with confidence. No judgment, no agenda - just genuine support for your love life.
              </p>
              
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-8">
                <p className="text-sm text-yellow-800 font-medium">
                  <strong>Disclaimer:</strong> Grace AI is not a tool for crisis intervention. If you are in immediate danger or facing a crisis, contact local emergency services or a crisis hotline right away.
                </p>
              </div>
            </div>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Always Here for You</h3>
              <p className="text-gray-600">"Whether it's 3 AM anxiety or a lunch break question, I'm ready to chat whenever you need me."</p>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Smart & Intuitive</h3>
              <p className="text-gray-600">"I've learned from thousands of relationship stories, so I can help you see patterns and possibilities you might miss."</p>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Your Safe Space</h3>
              <p className="text-gray-600">"Share anything with me - I don't judge, I don't gossip, and your secrets stay between us."</p>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Just for You</h3>
              <p className="text-gray-600">"I get to know your unique style and preferences, so my advice feels like it's made just for you."</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`py-20 bg-gradient-to-r ${mergedConfig.theme.primary}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Let's Chat About Your Love Life! 💕</h2>
          <p className="text-xl text-purple-100 mb-4">I'm excited to meet you and learn about your relationship journey.</p>
          <p className="text-lg text-purple-200 mb-8">Our first conversation is completely free - no strings attached, just genuine support.</p>
          <button
            onClick={startChat}
            className="bg-white hover:bg-gray-100 text-purple-600 px-12 py-4 rounded-lg font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            💬 Start Chatting with Grace
          </button>
          <p className="text-sm text-purple-200 mt-4 italic">"I can't wait to help you find clarity and confidence in love!"</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className={`w-8 h-8 bg-gradient-to-r ${mergedConfig.theme.primary} rounded-lg flex items-center justify-center mr-3`}>
                <Heart className="w-4 h-4 text-white" />
              </div>
              <span className="text-2xl font-bold">{mergedConfig.texts.brandName}</span>
            </div>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Hi! I'm Grace, your AI relationship coach. While I love helping with dating and relationship questions, I'm not a replacement for professional therapy or medical care. For serious mental health concerns, please reach out to qualified human professionals.
            </p>
            <div className="flex justify-center items-center space-x-6 text-sm text-gray-400 mb-6">
              {mergedConfig.features.crisisResources && (
                <>
                  <button 
                    onClick={() => setShowResources(true)}
                    className="text-red-400 hover:text-red-300 underline font-medium"
                  >
                    Crisis Resource Information
                  </button>
                  <span>•</span>
                </>
              )}
              {mergedConfig.features.emergencyExit && (
                <>
                  <span>Press Ctrl+Esc for quick exit</span>
                  <span>•</span>
                </>
              )}
              <span>AI-Powered Coaching</span>
              <span>•</span>
              <span>Private & Secure</span>
            </div>
            <p className="text-xs text-gray-500">
              © 2024 Grace AI. Made with 💜 to help hearts connect. All our conversations stay private between us.
            </p>
          </div>
        </div>
      </footer>

      <CrisisResourcesModal />
    </div>
  );
};

// Export the main component and utilities
export default GraceAI;

// Export additional utilities for advanced usage
export { GraceResponseEngine, CRISIS_RESOURCES, DEFAULT_CONFIG };
