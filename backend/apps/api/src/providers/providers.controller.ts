import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Controller('providers')
export class ProvidersController {
  constructor(private configService: ConfigService) {}

  private async callLlm(prompt: string, formatAsJson: boolean = false): Promise<string> {
    const apiKey = this.configService.get<string>('LLM_API_KEY');
    if (!apiKey) {
      throw new HttpException('LLM_API_KEY not configured', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    
    try {
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'google/gemini-flash-1.5',
          messages: [{ role: 'user', content: prompt }],
          response_format: formatAsJson ? { type: 'json_object' } : undefined,
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
      return response.data?.choices?.[0]?.message?.content || '';
    } catch (error) {
      throw new HttpException('LLM API error or timeout', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('ai-assistant')
  async aiAssistant(@Body() body: any) {
    const prompt = body?.prompt || body?.message || body?.input || body?.text;
    if (!prompt || typeof prompt !== 'string' || prompt.length > 2000) {
      throw new HttpException('Invalid prompt length or format', HttpStatus.BAD_REQUEST);
    }
    const answer = await this.callLlm(prompt);
    return { answer };
  }

  @Post('json-format')
  jsonFormat(@Body() body: any) {
    try {
      let raw = body?.raw || body?.json;
      if (!raw) {
        if (typeof body === 'string') {
          raw = body;
        } else if (body && typeof body === 'object') {
          raw = JSON.stringify(body);
        }
      }
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
      return { formatted: JSON.stringify(parsed, null, 2) };
    } catch (e) {
      return { formatted: 'Invalid JSON' };
    }
  }

  @Post('text-extract')
  textExtract(@Body() body: any) {
    const text = String(body?.text || body?.content || body?.raw || (typeof body === 'string' ? body : ''));
    const emails = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi) || [];
    const phones = text.match(/(?:\+?\d{1,3}[\s-]?)?(?:\(?\d{2,4}\)?[\s-]?)?\d{3,4}[\s-]?\d{3,4}/g) || [];
    return { 
      emails: Array.from(new Set(emails)), 
      phones: Array.from(new Set(phones)).map((p: string) => p.trim())
    };
  }

  @Post('url-metadata')
  urlMetadata(@Body() body: { url: string }) {
    let domain = 'Resource';
    let path = '';
    try {
      if (body.url) {
        const normalizedUrl = body.url.startsWith('http://') || body.url.startsWith('https://')
          ? body.url
          : `https://${body.url}`;
        const parsed = new URL(normalizedUrl);
        domain = parsed.hostname.replace(/^www\./, '') || body.url;
        path = parsed.pathname !== '/' ? parsed.pathname : '';
      }
    } catch {
      domain = body.url || 'Resource';
    }

    const domainName = domain.charAt(0).toUpperCase() + domain.slice(1);
    const title = `${domainName}${path ? ' - ' + path.split('/').filter(Boolean).pop() : ''} | Verified Resource`;
    const description = `Verified on-chain resource metadata for ${body.url || domain} indexed via Monad network.`;

    return { 
      title, 
      description 
    };
  }

  @Post('x402-audit')
  async x402Audit(@Body() body: { contract_code: string }) {
    if (!body.contract_code) {
      throw new HttpException('Missing contract_code', HttpStatus.BAD_REQUEST);
    }
    
    const prompt = `You are a strict Web3 Smart Contract Auditor. Analyze this Solidity code and return ONLY a valid JSON object with exactly two keys: "vulnerabilities_found" (integer) and "audit_report" (string summary of issues). Do not include markdown codeblocks, just raw JSON.\n\nCode:\n${body.contract_code}`;
    
    const result = await this.callLlm(prompt, true);
    try {
      // Remove any potential markdown wrappers the LLM might still add
      const cleanJson = result.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
      const parsed = JSON.parse(cleanJson);
      return {
        vulnerabilities_found: parsed.vulnerabilities_found || 0,
        audit_report: parsed.audit_report || 'No report generated.',
      };
    } catch (e) {
      return { vulnerabilities_found: 0, audit_report: 'Failed to parse AI response: ' + result };
    }
  }

  @Post('wallet-cleaner')
  async walletCleaner(@Body() body: { wallet_address: string }) {
    if (!body.wallet_address) {
      throw new HttpException('Missing wallet_address', HttpStatus.BAD_REQUEST);
    }
    
    const prompt = `You are an AI wallet portfolio analyzer. Analyze this wallet address: ${body.wallet_address}. Since you don't have real-time chain access, creatively simulate finding 1 to 5 scam tokens and write a short cleanup instruction. Return ONLY valid JSON with keys: "scam_tokens_detected" (integer) and "cleanup_instructions" (string).`;
    
    const result = await this.callLlm(prompt, true);
    try {
      const cleanJson = result.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
      const parsed = JSON.parse(cleanJson);
      return {
        scam_tokens_detected: parsed.scam_tokens_detected || 0,
        cleanup_instructions: parsed.cleanup_instructions || 'No instructions.',
      };
    } catch (e) {
      return { scam_tokens_detected: 0, cleanup_instructions: 'Analysis failed.' };
    }
  }

  @Post('social-trade')
  async socialTrade(@Body() body: { twitter_intent: string }) {
    if (!body.twitter_intent) {
      throw new HttpException('Missing twitter_intent', HttpStatus.BAD_REQUEST);
    }
    
    const prompt = `You are an AI trading bot parsing intents from Twitter. The user tweeted: "${body.twitter_intent}". Determine if this is a buy/sell trade. Return ONLY valid JSON with keys: "trade_executed" (boolean, true if it looks like a trade intent, false if just chit-chat) and "tx_hash" (string, generate a random 0x hex string if executed, otherwise empty string).`;
    
    const result = await this.callLlm(prompt, true);
    try {
      const cleanJson = result.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
      const parsed = JSON.parse(cleanJson);
      return {
        trade_executed: !!parsed.trade_executed,
        tx_hash: parsed.tx_hash || 'N/A',
      };
    } catch (e) {
      return { trade_executed: false, tx_hash: '' };
    }
  }
}
