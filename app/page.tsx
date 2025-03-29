"use client";

import { useState, useRef, useEffect } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Send, StopCircle, MapPin, Building, Calendar, DollarSign, Bed, MessageSquare } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  properties?: any[];
}

const Container = styled.div`
  display: flex;
  height: 100vh;
  background: #1e1e2d;
`;

const Sidebar = styled.div`
  width: 280px;
  background: #151521;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  padding: 1rem;
`;

const SidebarHeader = styled.div`
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 1rem;
`;

const SidebarTitle = styled.h2`
  color: #fff;
  font-size: 1.2rem;
  font-weight: 500;
`;

const ChatHistoryList = styled.div`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ChatHistoryItem = styled.div<{ active?: boolean }>`
  padding: 0.75rem 1rem;
  border-radius: 8px;
  background: ${props => props.active ? 'rgba(80, 70, 229, 0.1)' : 'transparent'};
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid ${props => props.active ? 'rgba(80, 70, 229, 0.5)' : 'transparent'};

  &:hover {
    background: rgba(80, 70, 229, 0.05);
  }
`;

const HistoryMessage = styled.p`
  color: #a0aec0;
  font-size: 0.875rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const HistoryTime = styled.span`
  color: #64748b;
  font-size: 0.75rem;
  margin-top: 0.25rem;
  display: block;
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #1e1e2d;
`;

const Header = styled.header`
  padding: 1.5rem 2rem;
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const Title = styled.h1`
  color: #fff;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
`;

const Subtitle = styled.p`
  color: #64748b;
  font-size: 0.875rem;
`;

const ChatContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const MessageBubble = styled(motion.div)<{ isUser: boolean }>`
  max-width: 70%;
  padding: 1rem 1.25rem;
  border-radius: 16px;
  align-self: ${props => props.isUser ? 'flex-end' : 'flex-start'};
  background: ${props => props.isUser ? '#5046e5' : 'rgba(255, 255, 255, 0.05)'};
  color: ${props => props.isUser ? '#fff' : '#e2e8f0'};
`;

const PropertiesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
  width: 100%;
`;

const PropertyCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const PropertyImage = styled.div<{ url?: string }>`
  height: 180px;
  background: ${props => props.url ? `url(${props.url})` : '#2d2d3d'};
  background-size: cover;
  background-position: center;
`;

const PropertyContent = styled.div`
  padding: 1.25rem;
`;

const PropertyName = styled.h3`
  color: #fff;
  font-size: 1.1rem;
  font-weight: 500;
  margin-bottom: 0.75rem;
`;

const PropertyDetail = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #94a3b8;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
`;

const InputContainer = styled.div`
  padding: 1.5rem 2rem;
  background: rgba(255, 255, 255, 0.02);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const Input = styled.input`
  flex: 1;
  padding: 0.875rem 1.25rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  font-size: 0.875rem;
  transition: all 0.2s ease;

  &::placeholder {
    color: #64748b;
  }

  &:focus {
    outline: none;
    border-color: #5046e5;
    background: rgba(255, 255, 255, 0.08);
  }
`;

const Button = styled.button`
  padding: 0.875rem;
  border-radius: 12px;
  background: #5046e5;
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: #4338ca;
  }

  &:disabled {
    background: #374151;
    cursor: not-allowed;
  }
`;

const VoiceButton = styled(Button)<{ isRecording: boolean }>`
  background: ${props => props.isRecording ? '#dc2626' : '#5046e5'};

  &:hover {
    background: ${props => props.isRecording ? '#b91c1c' : '#4338ca'};
  }
`;

const Timestamp = styled.span`
  font-size: 0.75rem;
  color: ${props => props.color || '#64748b'};
  margin-top: 0.5rem;
  display: block;
`;

const ErrorMessage = styled.div`
  margin-top: 0.5rem;
  color: #ef4444;
  font-size: 0.875rem;
  background: rgba(239, 68, 68, 0.1);
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  align-self: flex-start;
`;

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
    maximumFractionDigits: 0,
  }).format(price);
};

// The backend API URL
const API_BASE_URL = 'http://34.72.28.241:8989';

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<{ [key: string]: HTMLDivElement }>({});
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const scrollToMessage = (messageId: string) => {
    const messageElement = messageRefs.current[messageId];
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setSelectedMessageId(messageId);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!selectedMessageId) {
      scrollToBottom();
    }
  }, [messages, selectedMessageId]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    const messageId = Math.random().toString(36).substr(2, 9);
    const userMessage: Message = {
      id: messageId,
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      const response = await fetch(`${API_BASE_URL}/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          question: input,
          conversation_id: conversationId
        }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const data = await response.json();
      setConversationId(data.conversation_id);

      const botMessage: Message = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'bot',
        content: data.human_response,
        timestamp: new Date(),
        properties: data.object_response
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to connect to the server. Please try again later.');
      
      // Only add error message if there was a genuine error
      if (messages.length > 0) {
        const errorMessage: Message = {
          id: Math.random().toString(36).substr(2, 9),
          type: 'bot',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setIsLoading(true);
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
        const formData = new FormData();
        formData.append('voice', audioBlob);
        if (conversationId) {
          formData.append('conversation_id', conversationId);
        }

        try {
          const response = await fetch(`${API_BASE_URL}/ask-voice`, {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
          }

          const data = await response.json();
          setConversationId(data.conversation_id);

          const botMessage: Message = {
            id: Math.random().toString(36).substr(2, 9),
            type: 'bot',
            content: data.human_response,
            timestamp: new Date(),
            properties: data.object_response
          };

          setMessages(prev => [...prev, botMessage]);
        } catch (error) {
          console.error('Error sending voice message:', error);
          setError('Failed to connect to the server. Please try again later.');
          
          if (messages.length > 0) {
            const errorMessage: Message = {
              id: Math.random().toString(36).substr(2, 9),
              type: 'bot',
              content: 'Sorry, I encountered an error processing your voice message.',
              timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
          }
        } finally {
          setIsLoading(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setError('Could not access your microphone. Please check your browser permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  return (
    <Container>
      <Sidebar>
        <SidebarHeader>
          <SidebarTitle>Chat History</SidebarTitle>
        </SidebarHeader>
        <ChatHistoryList>
          {messages.map((message) => (
            <ChatHistoryItem
              key={message.id}
              active={selectedMessageId === message.id}
              onClick={() => scrollToMessage(message.id)}
            >
              <HistoryMessage>
                <MessageSquare size={14} style={{ display: 'inline', marginRight: '6px' }} />
                {message.content.substring(0, 40)}...
              </HistoryMessage>
              <HistoryTime>{message.timestamp.toLocaleTimeString()}</HistoryTime>
            </ChatHistoryItem>
          ))}
        </ChatHistoryList>
      </Sidebar>

      <MainContent>
        <Header>
          <Title>AI Real Estate Assistant</Title>
          <Subtitle>Your intelligent companion for Dubai properties</Subtitle>
        </Header>

        <ChatContainer>
          <MessagesContainer>
            <AnimatePresence>
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  ref={el => {
                    if (el) messageRefs.current[message.id] = el;
                  }}
                  isUser={message.type === 'user'}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  {message.content}
                  <Timestamp color={message.type === 'user' ? 'rgba(255,255,255,0.5)' : undefined}>
                    {message.timestamp.toLocaleTimeString()}
                  </Timestamp>
                  {message.properties && message.properties.length > 0 && (
                    <PropertiesGrid>
                      {message.properties.map((property, idx) => (
                        <PropertyCard
                          key={idx}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.1 }}
                        >
                          <PropertyImage url={property.images?.[0]?.medium} />
                          <PropertyContent>
                            <PropertyName>{property.name}</PropertyName>
                            <PropertyDetail>
                              <MapPin size={16} />
                              {property.location?.full_name}
                            </PropertyDetail>
                            <PropertyDetail>
                              <Building size={16} />
                              {property.developer?.name}
                            </PropertyDetail>
                            {property.delivery_date && (
                              <PropertyDetail>
                                <Calendar size={16} />
                                Delivery: {new Date(property.delivery_date).getFullYear()}
                              </PropertyDetail>
                            )}
                            {property.price?.from && (
                              <PropertyDetail>
                                <DollarSign size={16} />
                                Starting from {formatPrice(property.price.from)}
                              </PropertyDetail>
                            )}
                            {property.bedrooms?.length > 0 && (
                              <PropertyDetail>
                                <Bed size={16} />
                                {property.bedrooms.join(', ')} Bedrooms
                              </PropertyDetail>
                            )}
                          </PropertyContent>
                        </PropertyCard>
                      ))}
                    </PropertiesGrid>
                  )}
                </MessageBubble>
              ))}
            </AnimatePresence>
            {error && <ErrorMessage>{error}</ErrorMessage>}
            <div ref={messagesEndRef} />
          </MessagesContainer>

          <InputContainer>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder={isLoading ? "Please wait..." : "Type your message..."}
              disabled={isLoading || isRecording}
            />
            <Button 
              onClick={handleSend} 
              disabled={!input.trim() || isLoading || isRecording}
            >
              <Send size={20} />
            </Button>
            <VoiceButton
              isRecording={isRecording}
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isLoading}
            >
              {isRecording ? <StopCircle size={20} /> : <Mic size={20} />}
            </VoiceButton>
          </InputContainer>
        </ChatContainer>
      </MainContent>
    </Container>
  );
}