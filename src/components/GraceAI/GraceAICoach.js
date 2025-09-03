import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { generateRelationshipAdvice, checkOpenAIConfig } from '../../services/openai';

const CoachContainer = styled.div`
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  border: 1px solid #dee2e6;
`;

const CoachHeader = styled.div`
  background: #2c5530;
  color: white;
  padding: 2rem;
  text-align: center;
  position: relative;
`;

const GraceName = styled.h2`
  font-family: 'Georgia', serif;
  font-size: 2rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: #f8f9fa;
`;

const CoachTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 400;
  margin: 0 0 0.5rem 0;
  opacity: 0.9;
`;

const AIDisclosure = styled.div`
  background: #e76f51;
  border-radius: 15px;
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const AIIcon = styled.span`
  font-size: 1rem;
`;

const CoachBody = styled.div`
  padding: 2rem;
  min-height: 400px;
  display: flex;
  flex-direction: column;
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
  max-height: 300px;
`;

const Message = styled.div`
  max-width: 85%;
  padding: 1rem 1.5rem;
  border-radius: 20px;
  word-wrap: break-word;
  line-height: 1.6;
  
  ${props => props.isUser ? `
    background: #6c757d;
    color: white;
    align-self: flex-end;
    border-bottom-right-radius: 8px;
  ` : `
    background: white;
    color: #495057;
    align-self: flex-start;
    border-bottom-left-radius: 8px;
    border: 1px solid #dee2e6;
  `}
`;

const InputContainer = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #dee2e6;
`;

const MessageInput = styled.input`
  flex: 1;
  padding: 1rem 1.5rem;
  border: 2px solid #dee2e6;
  border-radius: 25px;
  outline: none;
  font-size: 1rem;
  transition: border-color 0.3s ease;
  
  &:focus {
    border-color: #6c757d;
  }
  
  &::placeholder {
    color: #adb5bd;
  }
`;

const SendButton = styled(motion.button)`
  background: #2c5530;
  color: white;
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.3s ease;
  
  &:disabled {
    background: #adb5bd;
    cursor: not-allowed;
  }
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(108, 117, 125, 0.3);
  }
`;

const LoadingDots = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;
  padding: 1rem 1.5rem;
  background: white;
  border-radius: 20px;
  align-self: flex-start;
  border-bottom-left-radius: 8px;
  border: 1px solid #dee2e6;
`;

const Dot = styled.div`
  width: 8px;
  height: 8px;
  background: #6c757d;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out;
  
  &:nth-child(1) { animation-delay: -0.32s; }
  &:nth-child(2) { animation-delay: -0.16s; }
  
  @keyframes bounce {
    0%, 80%, 100% {
      transform: scale(0);
    }
    40% {
      transform: scale(1);
    }
  }
`;

const ErrorMessage = styled.div`
  background: #f8d7da;
  color: #721c24;
  padding: 1rem 1.5rem;
  border-radius: 15px;
  margin: 1rem 0;
  border-left: 4px solid #dc3545;
  font-size: 0.9rem;
`;



const GraceIntro = styled.p`
  margin: 0 0 1rem 0;
  font-size: 1rem;
`;

const GracePromise = styled.div`
  background: #f0f9ff;
  border-radius: 15px;
  padding: 1rem;
  margin-top: 1rem;
  border-left: 4px solid #2196f3;
`;

const PromiseTitle = styled.h4`
  margin: 0 0 0.5rem 0;
  color: #1976d2;
  font-size: 0.9rem;
  font-weight: 600;
`;

const PromiseText = styled.p`
  margin: 0;
  font-size: 0.8rem;
  color: #1565c0;
  line-height: 1.4;
`;

export default function GraceAICoach({ dnaType = 'Unknown' }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi, I&apos;m Grace. I&apos;m an AI relationship coach here to help you navigate love, dating, and connection. Think of me as your judgment-free sounding board — you share what&apos;s on your mind, and I&apos;ll offer thoughtful, caring advice to help you move forward.",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isConfigured, setIsConfigured] = useState(false);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    // Check if OpenAI is configured
    try {
      const config = checkOpenAIConfig();
      setIsConfigured(config.isConfigured);
    } catch {
      setIsConfigured(false);
      setError('OpenAI not configured. Please add your API key to .env file.');
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || !isConfigured) return;

    const userMessage = {
      id: Date.now(),
      text: inputValue.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      // Generate AI response with Grace's personality
      const aiResponse = await generateRelationshipAdvice(
        dnaType,
        'dating and relationships',
        inputValue.trim()
      );

      const aiMessage = {
        id: Date.now() + 1,
        text: aiResponse,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error('Failed to generate AI response:', err);
      setError('I apologize, but I&apos;m having trouble connecting right now. Please try again in a moment.');
      
      const errorMessage = {
        id: Date.now() + 1,
        text: "I&apos;m sorry, I&apos;m having trouble connecting right now. Please try again in a moment.",
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isConfigured) {
    return (
      <CoachContainer>
        <CoachHeader>
          <GraceName>Grace</GraceName>
          <CoachTitle>Your AI Relationship Coach</CoachTitle>
          <AIDisclosure>
            <AIIcon>🤖</AIIcon>
            AI-powered guidance
          </AIDisclosure>
        </CoachHeader>
        <CoachBody>
          <ErrorMessage>
            <strong>OpenAI Configuration Required</strong><br />
            To use Grace&apos;s AI coaching, please add your OpenAI API key to the .env file.
          </ErrorMessage>
        </CoachBody>
      </CoachContainer>
    );
  }

  return (
    <CoachContainer>
      <CoachHeader>
        <GraceName>Grace</GraceName>
        <CoachTitle>Your AI Relationship Coach</CoachTitle>
        <AIDisclosure>
          <AIIcon>🤖</AIIcon>
          AI-powered guidance, delivered with heart
        </AIDisclosure>
      </CoachHeader>

      <CoachBody>
        <MessagesContainer>
          {messages.map((message) => (
            <Message key={message.id} isUser={message.isUser}>
              {message.isUser ? message.text : (
                <>
                  {message.id === 1 ? (
                    <>
                      <GraceIntro>{message.text}</GraceIntro>
                      <GracePromise>
                        <PromiseTitle>Grace&apos;s Promise to You:</PromiseTitle>
                        <PromiseText>
                          Honest advice. A safe space to share. A caring tone, every time.
                        </PromiseText>
                      </GracePromise>
                    </>
                  ) : (
                    message.text
                  )}
                </>
              )}
            </Message>
          ))}
          
          {isLoading && (
            <LoadingDots>
              <Dot />
              <Dot />
              <Dot />
            </LoadingDots>
          )}
          
          <div ref={messagesEndRef} />
        </MessagesContainer>

        {error && (
          <ErrorMessage>
            {error}
          </ErrorMessage>
        )}

        <InputContainer>
          <MessageInput
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Share what&apos;s on your mind about relationships..."
            disabled={isLoading}
          />
          <SendButton
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ➤
          </SendButton>
        </InputContainer>
      </CoachBody>
    </CoachContainer>
  );
}
