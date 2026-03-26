import { KlingProvider } from './KlingProvider';
import { AkoolProvider } from './AkoolProvider';
import config from '../config';
import { Logger } from '../utils/helpers';

export interface IProvider {
  name: string;
  initialize(): Promise<boolean>;
}

export class ProviderFactory {
  private static logger = Logger.getInstance();
  private static providers: Map<string, any> = new Map();

  /**
   * Initialize factory with all providers
   */
  static async initialize(): Promise<void> {
    this.logger.info('Initializing ProviderFactory');

    // Initialize Kling Provider
    const klingProvider = new KlingProvider(config.kling.apiKey, config.kling.baseUrl);
    const klingReady = await klingProvider.initialize();
    this.providers.set('kling', klingProvider);
    this.logger.info(`Kling Provider: ${klingReady ? 'Ready' : 'Failed to initialize'}`);

    // Initialize Akool Provider (stub for now)
    const akoolProvider = new AkoolProvider('', '');
    await akoolProvider.initialize();
    this.providers.set('akool', akoolProvider);
    this.logger.info('Akool Provider: Initialized (stub)');
  }

  /**
   * Get a provider instance by name
   */
  static create(providerName: string): any {
    const provider = this.providers.get(providerName.toLowerCase());
    if (!provider) {
      throw new Error(`Provider not found: ${providerName}`);
    }
    return provider;
  }

  /**
   * Get the default provider
   */
  static getDefault(type: 'video' | 'image' | 'audio'): any {
    switch (type) {
      case 'video':
        return this.create('kling');
      case 'image':
        return this.create('akool');
      case 'audio':
        // TODO: Implement audio provider selection
        throw new Error('Audio provider not yet implemented');
      default:
        throw new Error('Unknown provider type');
    }
  }

  /**
   * Check if provider is available
   */
  static isAvailable(providerName: string): boolean {
    return this.providers.has(providerName.toLowerCase());
  }
}
