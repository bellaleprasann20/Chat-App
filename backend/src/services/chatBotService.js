const axios = require('axios');

class ChatBotService {
  constructor() {
    this.groqApiKey = process.env.GROQ_API_KEY || '';
    this.botEnabled = process.env.BOT_ENABLED !== 'false';
    this.conversationHistory = new Map(); // roomId -> messages[]
    
    // Simple responses for fallback
    this.simpleResponses = {
      greetings: [
        "Hey! How's it going?",
        "Hi there! What's up?",
        "Hello! Nice to meet you!",
        "Hey! What brings you here?",
        "Hi! How are you doing?"
      ],
      questions: [
        "What are your hobbies?",
        "Where are you from?",
        "What do you like to do for fun?",
        "What's your favorite movie?",
        "Do you have any pets?"
      ],
      responses: [
        "That's interesting! Tell me more.",
        "Cool! I'd love to hear about that.",
        "Nice! What else?",
        "Awesome! That sounds fun.",
        "That's great! How did you get into that?"
      ],
      goodbye: [
        "It was nice chatting with you!",
        "Take care! See you around!",
        "Bye! Have a great day!",
        "Thanks for the chat! Goodbye!",
        "See you later! Stay safe!"
      ]
    };
  }

  // Get bot response
  async getBotResponse(roomId, userMessage) {
    if (!this.botEnabled) {
      return "Bot is currently disabled.";
    }

    // Use Groq API if key is available
    if (this.groqApiKey) {
      return await this.getGroqResponse(roomId, userMessage);
    }

    // Otherwise use simple rule-based responses
    return this.getSimpleResponse(roomId, userMessage);
  }

  // Groq API integration (free & fast)
  async getGroqResponse(roomId, userMessage) {
    try {
      // Get conversation history
      let history = this.conversationHistory.get(roomId) || [];
      
      // Add user message
      history.push({
        role: 'user',
        content: userMessage
      });

      // Keep only last 10 messages for context
      if (history.length > 10) {
        history = history.slice(-10);
      }

      // Call Groq API
      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'llama-3.3-70b-versatile', // Fast & smart model
          messages: [
            {
              role: 'system',
              content: 'You are a friendly stranger chatting anonymously. Be casual, fun, and engaging. Keep responses short (1-3 sentences). Ask questions to keep the conversation going. Be curious about the other person.'
            },
            ...history
          ],
          max_tokens: 150,
          temperature: 0.8
        },
        {
          headers: {
            'Authorization': `Bearer ${this.groqApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const botMessage = response.data.choices[0].message.content;

      // Save to history
      history.push({
        role: 'assistant',
        content: botMessage
      });
      this.conversationHistory.set(roomId, history);

      return botMessage;

    } catch (error) {
      console.error('Groq API error:', error.message);
      // Fallback to simple response
      return this.getSimpleResponse(roomId, userMessage);
    }
  }

  // Simple rule-based responses
  getSimpleResponse(roomId, userMessage) {
    const message = userMessage.toLowerCase();
    
    // Check conversation count
    let history = this.conversationHistory.get(roomId) || [];
    const messageCount = history.length;

    // First message - greeting
    if (messageCount === 0) {
      this.conversationHistory.set(roomId, [userMessage]);
      return this.randomChoice(this.simpleResponses.greetings);
    }

    // Check for goodbye
    if (message.includes('bye') || message.includes('goodbye') || message.includes('see you')) {
      return this.randomChoice(this.simpleResponses.goodbye);
    }

    // Check for questions (contains ?)
    if (message.includes('?')) {
      const responses = [
        "That's a good question! I'd say it depends on the situation.",
        "Hmm, let me think... probably yes!",
        "I'm not sure, what do you think?",
        "Interesting question! I haven't thought about that before."
      ];
      return this.randomChoice(responses);
    }

    // Check for common keywords
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      return this.randomChoice(this.simpleResponses.greetings);
    }

    // Every 3rd message, ask a question
    if (messageCount % 3 === 0) {
      return this.randomChoice(this.simpleResponses.questions);
    }

    // Default response
    return this.randomChoice(this.simpleResponses.responses);
  }

  // Helper: Get random item from array
  randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  // Clear conversation history
  clearHistory(roomId) {
    this.conversationHistory.delete(roomId);
  }

  // Get bot info
  getBotInfo() {
    return {
      enabled: this.botEnabled,
      hasGroqKey: !!this.groqApiKey,
      type: this.groqApiKey ? 'AI (Groq)' : 'Simple Bot'
    };
  }
}

module.exports = new ChatBotService();