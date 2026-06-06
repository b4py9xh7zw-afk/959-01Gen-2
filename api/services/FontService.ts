import { FontRepository } from '../repositories/index';
import { Font } from '../../shared/types';

export class FontService {
  private fontRepository = new FontRepository();

  getFonts(options?: {
    page?: number;
    pageSize?: number;
    style?: string;
    search?: string;
  }): { data: Font[]; total: number } {
    try {
      return this.fontRepository.findAll(options);
    } catch (error) {
      console.error('Get fonts error:', error);
      return { data: [], total: 0 };
    }
  }

  getFontById(id: number): Font | undefined {
    try {
      return this.fontRepository.findById(id);
    } catch (error) {
      console.error('Get font by id error:', error);
      return undefined;
    }
  }
}
