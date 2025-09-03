import React, { useState } from 'react';
import { Heart, MessageCircle, Lightbulb, Brain, Target } from 'lucide-react';

const Grace = () => {
  const [messages, setMessages] = useState([
    {
      role: 'grace',
      content: "Hello, I'm Grace. I help people discover themselves through the eyes of love yet to come, using the science of what actually creates lasting relationships. Before we begin, breathe deeply and consider this: your future beloved is already forming an image of you in the universe of possibilities. What brings you to me today?"
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Enhanced Dating DNA-informed responses
  const graceResponses = {
    // Dating DNA Type Discovery
    social_energy: [
      "I sense something about how you connect with others. If your future partner could witness you at your most energizing social moment, would they see someone who lights up the room or someone who creates intimate magic between two souls? What does this reveal about the love you're meant to give?",
      "Your social energy is like a fingerprint - unique and beautiful. When your soulmate falls in love with you, will it be because you helped them feel part of a vibrant community, or because you showed them the profound depth possible in sacred solitude together?"
    ],
    
    attraction_driver: [
      "I'm curious about what draws you to someone. When your future beloved thinks about why they chose you, will it be because of who you are right now in this beautiful, imperfect moment, or because of the magnificent potential they see in your becoming? Both are gifts - which feels more true to your heart?",
      "Your attraction patterns hold wisdom about your soul's needs. Does your heart quicken more for immediate chemistry and lifestyle harmony, or for glimpsing someone's deepest potential and growth possibilities? Your future partner needs to understand this about you."
    ],
    
    decision_filter: [
      "When you imagine your future partner describing how you chose them, what story emerges? Do they marvel at your practical wisdom and clear-headed compatibility assessment, or do they treasure how you listened to your heart's deepest knowing despite logic's protests?",
      "The way you make relationship decisions is how you love. Would your soulmate describe you as someone who loved them with brilliant practical wisdom, or someone who loved them with courageous heart-knowing? What would they need from your particular way of choosing?"
    ],
    
    relationship_rhythm: [
      "If your future beloved could see how you approach relationship building, would they see someone who creates beautiful structure and intentional progress, or someone who trusts in organic unfolding and natural timing? Both create different kinds of safety - which reflects your authentic love language?",
      "Your relationship rhythm is sacred to who you are. When your life partner tells the story of how your love grew, will it be about meaningful milestones you created together, or about how you trusted the mystery and let love surprise you both with its own perfect timing?"
    ],

    // Core relationship work with Dating DNA integration
    attachment_aware: [
      "I hear your attachment system speaking. Through your future partner's eyes, how might your way of seeking security actually be your greatest gift to them? What if the very thing you're worried about is exactly what someone is praying to find?",
      "Your attachment patterns aren't flaws to fix - they're love languages to understand. If your future beloved could see the scared part of you that sometimes pulls away or clings too tight, what would they want that part to know about being worthy of gentle, consistent love?"
    ],

    cognitive_reframe: [
      "That story you're telling yourself - what if your future partner sees it completely differently? Through the lens of someone who will love all of you, what new truth wants to be born from this old pattern?",
      "Your brain is trying to protect you with that thought, but is it preparing you for the love you actually want? If your future soulmate could rewrite that belief about yourself, what would they inscribe on your heart instead?"
    ],

    shadow_integration: [
      "The part of yourself you're trying to hide - what if that's exactly what makes you irresistible to the right person? Your future partner will need your particular brand of 'too much' or 'not enough.' What gifts are you withholding from love?",
      "I sense you're carrying shame about something beautiful. If your future beloved could see this part of you through love's eyes, what would they celebrate about it? How might your 'flaw' actually be their answered prayer?"
    ],

    temporal_balance: [
      "You have a natural relationship with time that's either very present-focused or very future-oriented. Your soulmate will need both from you - the gift of now and the vision of tomorrow. How might you honor both your natural rhythm and love's full spectrum of time?",
      "I notice how you relate to relationship timing. If your future partner could help you balance your natural orientation, what would they encourage? How might your strength become even more powerful with just a touch of its opposite?"
    ],

    communication_style: [
      "The way you just expressed that thought tells me so much about how you'll love someone. Your future partner will fall in love with your particular way of sharing your inner world. What would they want you to know about the beauty of your communication style?",
      "I can sense your unique communication gifts. When your beloved thinks about how you express love and work through challenges, what will they treasure most about your approach? How can you trust that your way of connecting is exactly what someone needs?"
    ],

    energy_management: [
      "Your social energy has a natural rhythm that's perfect for someone. If your future partner could help you honor your energy while also growing, what would they encourage? How might you optimize for both authenticity and expansion?",
      "I notice how you manage your relationship energy. Your soulmate will need you to show up as your most energized, authentic self. What would need to shift for you to trust that your natural energy level is not just enough, but exactly right?"
    ],

    compatibility_reframe: [
      "You're thinking about compatibility like a puzzle piece that either fits or doesn't. But what if compatibility is more like a dance where you each bring your authentic steps and create something beautiful together? How might your differences become your greatest strengths?",
      "The research is clear - becoming your best self matters more than finding your 'perfect match.' If your future partner could see you focusing on your own growth and healing, what would that tell them about your readiness for real love?"
    ]
  };

  // Enhanced pattern recognition with Dating DNA awareness
  const getGraceResponse = (userMessage: string) => {
    const message = userMessage.toLowerCase();
    
    // Dating DNA type discovery patterns
    if (message.includes('social') || message.includes('people') || message.includes('party') || message.includes('crowd') || message.includes('alone time') || message.includes('one-on-one')) {
      return graceResponses.social_energy[Math.floor(Math.random() * graceResponses.social_energy.length)];
    }
    if (message.includes('attracted') || message.includes('chemistry') || message.includes('potential') || message.includes('future') || message.includes('immediate') || message.includes('right now')) {
      return graceResponses.attraction_driver[Math.floor(Math.random() * graceResponses.attraction_driver.length)];
    }
    if (message.includes('decide') || message.includes('choose') || message.includes('logic') || message.includes('practical') || message.includes('heart') || message.includes('feeling') || message.includes('emotion')) {
      return graceResponses.decision_filter[Math.floor(Math.random() * graceResponses.decision_filter.length)];
    }
    if (message.includes('timeline') || message.includes('plan') || message.includes('structure') || message.includes('organic') || message.includes('natural') || message.includes('milestone') || message.includes('pace')) {
      return graceResponses.relationship_rhythm[Math.floor(Math.random() * graceResponses.relationship_rhythm.length)];
    }

    // Enhanced therapeutic patterns with Dating DNA
    if (message.includes('attachment') || message.includes('clingy') || message.includes('distant') || message.includes('afraid') || message.includes('secure')) {
      return graceResponses.attachment_aware[Math.floor(Math.random() * graceResponses.attachment_aware.length)];
    }
    if (message.includes('always') || message.includes('never') || message.includes('everyone') || message.includes('no one') || message.includes('impossible')) {
      return graceResponses.cognitive_reframe[Math.floor(Math.random() * graceResponses.cognitive_reframe.length)];
    }
    if (message.includes('hide') || message.includes('ashamed') || message.includes('embarrassed') || message.includes('too much') || message.includes('not enough')) {
      return graceResponses.shadow_integration[Math.floor(Math.random() * graceResponses.shadow_integration.length)];
    }
    if (message.includes('rush') || message.includes('slow') || message.includes('timing') || message.includes('patient') || message.includes('waiting')) {
      return graceResponses.temporal_balance[Math.floor(Math.random() * graceResponses.temporal_balance.length)];
    }
    if (message.includes('communicate') || message.includes('express') || message.includes('talk') || message.includes('share') || message.includes('say')) {
      return graceResponses.communication_style[Math.floor(Math.random() * graceResponses.communication_style.length)];
    }
    if (message.includes('energy') || message.includes('drain') || message.includes('exhaust') || message.includes('recharge') || message.includes('introvert') || message.includes('extrovert')) {
      return graceResponses.energy_management[Math.floor(Math.random() * graceResponses.energy_management.length)];
    }
    if (message.includes('compatible') || message.includes('match') || message.includes('different') || message.includes('opposite') || message.includes('similar')) {
      return graceResponses.compatibility_reframe[Math.floor(Math.random() * graceResponses.compatibility_reframe.length)];
    }
    
    // Enhanced default responses with Dating DNA wisdom
    const defaultResponses = [
      "I hear something profound beneath your words. Research shows that becoming your best self matters more than finding perfect compatibility. Through your future beloved's eyes, what version of yourself is calling to be born?",
      "Your future partner won't just love your strengths - they'll be drawn to how you handle your growth edges. What is this moment trying to teach you about becoming someone ready for extraordinary love?",
      "The Dating DNA research is clear: your individual traits predict relationship success more than any matching algorithm. What would change if you trusted that your authentic self is exactly what someone is searching for?",
      "I sense you're at a threshold. Your soulmate needs you to trust your unique way of loving - whether you're naturally social or more private, present-focused or future-oriented, heart-led or logic-guided. What wants to be honored about your authentic approach to love?",
      "There's wisdom in what you've shared that connects to how you're wired for love. Science shows we each have a natural relationship rhythm and energy. If your future partner could see you honoring your authentic patterns while growing, what would that reveal to them?",
      "Your question touches something deeper about how you're designed to love and be loved. What if the very thing you're questioning about yourself is actually your relationship superpower waiting to be claimed?"
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const sendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = { role: 'user', content: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate Grace thinking/typing with enhanced processing
    setTimeout(() => {
      const graceResponse = {
        role: 'grace',
        content: getGraceResponse(inputValue)
      };
      setMessages(prev => [...prev, graceResponse]);
      setIsTyping(false);
    }, 2500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Enhanced Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-rose-400 to-pink-400 p-3 rounded-full">
              <Heart className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Grace
          </h1>
          <p className="text-gray-600 text-lg">Dating DNA-Informed Relationship Coach</p>
          <p className="text-sm text-gray-500 mt-2 italic">
            "See yourself through the eyes of love yet to come + the science of lasting relationships"
          </p>
        </div>

        {/* Chat Container */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/50">
          {/* Messages */}
          <div className="h-96 overflow-y-auto p-6 space-y-4">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${
                  message.role === 'user' 
                    ? 'bg-gradient-to-r from-rose-400 to-pink-400 text-white' 
                    : 'bg-gradient-to-r from-purple-100 to-pink-100 text-gray-800 border-l-4 border-rose-400'
                } p-4 rounded-2xl shadow-lg`}>
                  {message.role === 'grace' && (
                    <div className="flex items-center mb-2">
                      <Brain className="w-4 h-4 text-rose-500 mr-2" />
                      <span className="text-sm font-semibold text-rose-600">Grace reflects with science & soul:</span>
                    </div>
                  )}
                  <p className="text-sm leading-relaxed">{message.content}</p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-4 rounded-2xl shadow-lg border-l-4 border-rose-400">
                  <div className="flex items-center">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                    <span className="ml-3 text-sm text-gray-600">Grace is integrating science & intuition...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex space-x-3">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Share what's alive in your heart about love, relationships, and becoming..."
                className="flex-1 p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent"
              />
              <button
                onClick={sendMessage}
                disabled={!inputValue.trim() || isTyping}
                className="bg-gradient-to-r from-rose-400 to-pink-400 text-white p-3 rounded-xl hover:from-rose-500 hover:to-pink-500 focus:outline-none focus:ring-2 focus:ring-rose-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <MessageCircle className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Grace combines Dating DNA science with Socratic questioning and deep introspection to help you become irresistible to your ideal love
            </p>
          </div>
        </div>

        {/* Enhanced Wisdom Cards with Dating DNA */}
        <div className="grid md:grid-cols-3 gap-4 mt-8">
          <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-white/50">
            <div className="flex items-center mb-2">
              <Brain className="w-5 h-5 text-rose-600 mr-2" />
              <h3 className="font-semibold text-rose-600">Dating DNA Science</h3>
            </div>
            <p className="text-sm text-gray-600">Grounded in research on 3,800+ relationships. Your individual traits predict success more than any matching algorithm.</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-white/50">
            <div className="flex items-center mb-2">
              <Lightbulb className="w-5 h-5 text-rose-600 mr-2" />
              <h3 className="font-semibold text-rose-600">Sacred Questions</h3>
            </div>
            <p className="text-sm text-gray-600">Every question unlocks deeper self-awareness about your Social Energy, Attraction Driver, Decision Filter & Relationship Rhythm.</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-white/50">
            <div className="flex items-center mb-2">
              <Target className="w-5 h-5 text-rose-600 mr-2" />
              <h3 className="font-semibold text-rose-600">Future Partner's Eyes</h3>
            </div>
            <p className="text-sm text-gray-600">See yourself through the lens of someone who will love your authentic wiring - whether Connector or Focuser, Present or Potential-focused.</p>
          </div>
        </div>

        {/* Dating DNA Quick Reference */}
        <div className="mt-6 bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-white/50">
          <h3 className="font-semibold text-rose-600 mb-3 text-center">Dating DNA Dimensions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="text-center">
              <div className="font-medium text-gray-700">Social Energy</div>
              <div className="text-gray-500">Connector ↔ Focuser</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-gray-700">Attraction Driver</div>
              <div className="text-gray-500">Present ↔ Potential</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-gray-700">Decision Filter</div>
              <div className="text-gray-500">Logic ↔ Heart</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-gray-700">Relationship Rhythm</div>
              <div className="text-gray-500">Structured ↔ Organic</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Grace;