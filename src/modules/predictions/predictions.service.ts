import axios from 'axios';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match } from '../../entities/match.entity';
import { Prediction } from '../../entities/prediction.entity';
import { User } from '../../entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { FilterMatchesDto } from './dto/filter-matches.dto';
import {
  PaginationDto,
  PaginationResponseDto,
} from '../../core/dto/pagination.dto';
import { LEAGUES } from '../../core/enums/leagues.enum';

@Injectable()
export class PredictionsService {
  private readonly openRouterBaseUrl =
    'https://openrouter.ai/api/v1/chat/completions';

  constructor(
    @InjectRepository(Match)
    private matchRepository: Repository<Match>,
    @InjectRepository(Prediction)
    private predictionRepository: Repository<Prediction>,
    private configService: ConfigService,
  ) {}

  async getUpcomingMatches(
    filter: FilterMatchesDto,
  ): Promise<PaginationResponseDto<Match>> {
    const { page = 1, limit = 10, league } = filter;
    const skip = (page - 1) * limit;

    const queryBuilder = this.matchRepository
      .createQueryBuilder('match')
      .where('match.matchDate > :now', { now: new Date() });

    if (league && league !== LEAGUES.ALL) {
      queryBuilder.andWhere('match.league = :league', { league });
    }

    const [matches, total] = await queryBuilder
      .orderBy('match.matchDate', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data: matches,
      total,
      page,
      limit,
    };
  }

  async createPrediction(
    matchId: string,
    user: User,
    additionalContext?: string,
  ): Promise<Prediction> {
    const match = await this.matchRepository.findOneBy({ id: matchId });

    if (!match) {
      throw new HttpException('Match not found', HttpStatus.NOT_FOUND);
    }

    const prompt = this.generatePredictionPrompt(match, additionalContext);

    try {
      const response = await axios.post(
        this.openRouterBaseUrl,
        {
          model: 'google/gemma-3-27b-it:free',
          messages: [
            {
              role: 'system',
              content:
                'You are a professional football analyst. Provide match predictions with confidence scores.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${this.configService.get('ai.openRouterApiKey')}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const aiResponse = response.data.choices[0].message.content;
      const prediction = this.parseAIResponse(aiResponse);

      const newPrediction = this.predictionRepository.create({
        match,
        user,
        prediction: prediction.text,
        confidence: prediction.confidence,
      });

      return this.predictionRepository.save(newPrediction);
    } catch (error) {
      console.log('error in createPrediction', error);
      throw new HttpException(
        'Failed to generate prediction',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getUserPredictions(
    userId: string,
    pagination: PaginationDto,
  ): Promise<PaginationResponseDto<Prediction>> {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const [predictions, total] = await this.predictionRepository
      .createQueryBuilder('prediction')
      .leftJoinAndSelect('prediction.match', 'match')
      .where('prediction.userId = :userId', { userId })
      .orderBy('prediction.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data: predictions,
      total,
      page,
      limit,
    };
  }

  private generatePredictionPrompt(
    match: Match,
    additionalContext?: string,
  ): string {
    return `Please analyze and predict the outcome of this football match:
    ${match.homeTeam} vs ${match.awayTeam}
    League: ${match.league}
    Date: ${match.matchDate.toISOString()}
    
    ${additionalContext ? `Additional Context: ${additionalContext}` : ''}
    
    Please provide your prediction in the following format:
    1. Predicted Winner: [Team name or Draw]
    2. Predicted Score: [Home Team] [X] - [Y] [Away Team]
    3. Confidence Score: [Number between 0-100]
    4. Explanation: [Your detailed analysis and reasoning]`;
  }

  private parseAIResponse(response: string): {
    text: string;
    confidence: number;
  } {
    // Extract confidence score
    const confidenceMatch = response.match(/confidence score: (\d+)/i);
    const confidence = confidenceMatch ? parseInt(confidenceMatch[1]) : 50;

    // Convert markdown to HTML and format the response
    const formattedResponse = response
      .replace(/\n{3,}/g, '\n\n') // Remove excessive newlines
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Convert bold to strong
      .replace(/\*(.*?)\*/g, '<em>$1</em>') // Convert italic to em
      .replace(/\n/g, '<br />') // Convert newlines to <br />
      .trim();

    return {
      text: formattedResponse,
      confidence,
    };
  }
}
