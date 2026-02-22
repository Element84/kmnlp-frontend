import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ChatContainer, Message } from './ChatContainer';

describe('ChatContainer - Image Rendering', () => {
  it('should render an image when message has a url property', () => {
    const imageMessage: Message = {
      id: '1',
      text: 'Satellite image of hurricane',
      type: 'system',
      timestamp: new Date('2024-01-15T10:00:00'),
      url: 'https://example.com/hurricane.jpg',
    };

    const { getByRole } = render(<ChatContainer messages={[imageMessage]} />);

    const image = getByRole('img');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/hurricane.jpg');
    expect(image).toHaveAttribute('alt', 'Satellite image of hurricane');
  });

  it('should render markdown text when message has no url property', () => {
    const textMessage: Message = {
      id: '2',
      text: 'This is a **bold** message',
      type: 'system',
      timestamp: new Date('2024-01-15T10:00:00'),
    };

    const { getByText, queryByRole } = render(<ChatContainer messages={[textMessage]} />);

    // ReactMarkdown should render the bold text
    const boldText = getByText('bold');
    expect(boldText.tagName).toBe('STRONG');
    
    // Should not render an image
    expect(queryByRole('img')).not.toBeInTheDocument();
  });

  it('should render multiple messages with mixed content (text and images)', () => {
    const messages: Message[] = [
      {
        id: '1',
        text: 'User question',
        type: 'user',
        timestamp: new Date('2024-01-15T10:00:00'),
      },
      {
        id: '2',
        text: 'Here is the satellite image:',
        type: 'system',
        timestamp: new Date('2024-01-15T10:01:00'),
        url: 'https://example.com/satellite.png',
      },
      {
        id: '3',
        text: 'This image shows the storm system',
        type: 'system',
        timestamp: new Date('2024-01-15T10:02:00'),
      },
    ];

    const { getByText, getByRole } = render(<ChatContainer messages={messages} />);

    // Check for text messages
    expect(getByText('User question')).toBeInTheDocument();
    expect(getByText('This image shows the storm system')).toBeInTheDocument();

    // Check for image
    const image = getByRole('img');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/satellite.png');
  });

  it('should apply correct styling to images', () => {
    const imageMessage: Message = {
      id: '1',
      text: 'Weather map',
      type: 'system',
      timestamp: new Date('2024-01-15T10:00:00'),
      url: 'https://example.com/weather.jpg',
    };

    const { getByRole } = render(<ChatContainer messages={[imageMessage]} />);

    const image = getByRole('img');
    expect(image).toHaveStyle({ maxWidth: '100%', height: 'auto' });
  });

  it('should render message timestamp for image messages', () => {
    const imageMessage: Message = {
      id: '1',
      text: 'Image description',
      type: 'system',
      timestamp: new Date('2024-01-15T14:30:00'),
      url: 'https://example.com/image.jpg',
    };

    const { container } = render(<ChatContainer messages={[imageMessage]} />);

    // Check that message time container exists
    const messageTime = container.querySelector('.chat-container__message-time');
    expect(messageTime).toBeInTheDocument();
  });

  it('should handle images with rawContent of type Image', () => {
    const imageMessage: Message = {
      id: '1',
      text: 'https://example.com/chart.png',
      type: 'system',
      timestamp: new Date('2024-01-15T10:00:00'),
      url: 'https://example.com/chart.png',
      rawContent: {
        content_type: 'Image',
        media_type: 'image/png',
        url: 'https://example.com/chart.png',
      },
    };

    const { getByRole } = render(<ChatContainer messages={[imageMessage]} />);

    const image = getByRole('img');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/chart.png');
  });

  it('should render user messages as text even if they contain markdown', () => {
    const userMessage: Message = {
      id: '1',
      text: 'Show me a **map** of the area',
      type: 'user',
      timestamp: new Date('2024-01-15T10:00:00'),
    };

    const { getByText } = render(<ChatContainer messages={[userMessage]} />);

    // User message should render markdown
    const boldText = getByText('map');
    expect(boldText.tagName).toBe('STRONG');
  });

  it('should not render an image if url is undefined', () => {
    const textMessage: Message = {
      id: '1',
      text: 'This is just text',
      type: 'system',
      timestamp: new Date('2024-01-15T10:00:00'),
      url: undefined,
    };

    const { getByText, queryByRole } = render(<ChatContainer messages={[textMessage]} />);

    expect(queryByRole('img')).not.toBeInTheDocument();
    expect(getByText('This is just text')).toBeInTheDocument();
  });

  it('should render empty messages array without errors', () => {
    const { container } = render(<ChatContainer messages={[]} />);

    expect(container.querySelector('.chat-container')).toBeInTheDocument();
    expect(container.querySelector('.chat-container__messages')).toBeInTheDocument();
  });
});
