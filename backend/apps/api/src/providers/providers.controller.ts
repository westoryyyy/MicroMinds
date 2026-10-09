import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Controller('providers')
export class ProvidersController {
  constructor(private configService: ConfigService) {}

  @Post('ai-assistant')
  async aiAssistant(@Body() body: { prompt: string }) {
    if (!body.prompt || body.prompt.length > 1000) {
      throw new HttpException('Invalid prompt length', HttpStatus.BAD_REQUEST);
    }
    
    const mock = this.configService.get<string>('LLM_MOCK') === 'true';
    if (mock) {
      return { answer: 'This is a mock answer from the AI assistant.' };
    }

    const apiKey = this.configService.get<string>('LLM_API_KEY');
    if (!apiKey) {
      throw new HttpException('LLM_API_KEY not configured', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    
    try {
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'google/gemini-flash-1.5',
          messages: [{ role: 'user', content: body.prompt }]
        },
        {
          timeout: 25000,
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': 'http://localhost:3000',
            'Content-Type': 'application/json'
          }
        }
      );
      
      const content = response.data?.choices?.[0]?.message?.content || '';
      return { answer: content };
    } catch (error) {
      // Return 500 so the Gateway treats it as an error and triggers refund()
      throw new HttpException('LLM API error or timeout', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('flaky')
  flaky(@Body() body: { trigger: string }) {
    if (body.trigger === '500') {
      throw new HttpException('Simulated internal error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    if (body.trigger === 'bad_schema') {
      return { wrong_key: 'this does not match { result: string }' };
    }
    return { result: 'Flaky call succeeded' };
  }

  @Post('json-format')
  jsonFormat(@Body() body: { raw: string }) {
    try {
      const parsed = JSON.parse(body.raw || '');
      return { formatted: JSON.stringify(parsed, null, 2) };
    } catch (e) {
      return { formatted: 'Invalid JSON' };
    }
  }

  @Post('text-extract')
  textExtract(@Body() body: { text: string }) {
    const text = body.text || '';
    const emails = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi) || [];
    // Basic phone number extraction
    const phones = text.match(/(?:\+?\d{1,3}[\s-]?)?(?:\(?\d{2,4}\)?[\s-]?)?\d{3,4}[\s-]?\d{3,4}/g) || [];
    return { 
      emails: [...new Set(emails)], 
      phones: [...new Set(phones)].map(p => p.trim())
    };
  }

  @Post('url-metadata')
  urlMetadata(@Body() body: { url: string }) {
    return { 
      title: `Mock Title for ${body.url || 'URL'}`, 
      description: `Mock description for the requested URL.` 
    };
  }
}
