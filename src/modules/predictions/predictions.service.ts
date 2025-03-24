import axios from 'axios';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match } from '../../entities/match.entity';
import { Prediction } from '../../entities/prediction.entity';
import { User } from '../../entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { MatchesService } from '../matches/matches.service';
import { PREDICTION_TYPE } from '../../core/enums';
import { UserCreatePredictionDto } from './dto/user-create-prediction.dto';
import { UsersService } from '../users/users.service';
import {
  PaginationDto,
  PaginationResponseDto,
} from '../../core/dto/pagination.dto';

@Injectable()
export class PredictionsService {
  private readonly openRouterBaseUrl =
    'https://openrouter.ai/api/v1/chat/completions';

  constructor(
    @InjectRepository(Prediction)
    private predictionRepository: Repository<Prediction>,
    private configService: ConfigService,
    private matchesService: MatchesService,
    private userService: UsersService,
  ) {}

  async getAIPrediction(matchId: string, user: User): Promise<Prediction> {
    const prediction = await this.predictionRepository
      .createQueryBuilder('prediction')
      .leftJoinAndSelect('prediction.match', 'match')
      .leftJoinAndSelect('prediction.user', 'user')
      .where('match.id = :matchId', { matchId })
      .andWhere('user.id = :userId', { userId: user.id })
      .andWhere('prediction.type = :type', { type: PREDICTION_TYPE.AI })
      .getOne();

    if (prediction) {
      return prediction;
    }

    const match = await this.matchesService.getMatchById(matchId);

    if (!match) {
      throw new HttpException('Match not found', HttpStatus.NOT_FOUND);
    }

    const prompt = this.generatePredictionPrompt(match);

    try {
      const response = await axios.post(
        this.openRouterBaseUrl,
        {
          model: 'google/gemma-3-27b-it:free',
          messages: [
            {
              role: 'system',
              content:
                'You are a professional football analyst. Please provide match predictions in Vietnamese.',
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
        explanation: prediction.explanation,
        confidence: prediction.confidence,
        probabilities: prediction.probabilities,
        type: PREDICTION_TYPE.AI,
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

  async userCreatePrediction(
    userId: string,
    matchId: string,
    body: UserCreatePredictionDto,
  ): Promise<Prediction> {
    const { result, explanation } = body;

    const match = await this.matchesService.getMatchById(matchId);
    if (!match)
      throw new HttpException('Match not found', HttpStatus.NOT_FOUND);

    const user = await this.userService.findById(userId);
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);

    const prediction = this.predictionRepository.create({
      match,
      user,
      result,
      explanation,
      type: PREDICTION_TYPE.USER,
    });

    return this.predictionRepository.save(prediction);
  }

  async getMyPrediction(userId: string, matchId: string): Promise<Prediction> {
    const prediction = await this.predictionRepository
      .createQueryBuilder('prediction')
      .leftJoinAndSelect('prediction.user', 'user')
      .leftJoinAndSelect('prediction.match', 'match')
      .where('prediction.userId = :userId', { userId })
      .andWhere('prediction.matchId = :matchId', { matchId })
      .andWhere('prediction.type = :type', { type: PREDICTION_TYPE.USER })
      .getOne();

    return prediction;
  }

  async getCommunityPredictions(
    matchId: string,
    paginationParams: PaginationDto,
  ): Promise<PaginationResponseDto<Prediction>> {
    const { page, limit } = paginationParams;

    const [predictions, total] = await this.predictionRepository
      .createQueryBuilder('prediction')
      .leftJoinAndSelect('prediction.user', 'user')
      .leftJoinAndSelect('prediction.match', 'match')
      .where('prediction.matchId = :matchId', { matchId })
      .andWhere('prediction.type = :type', { type: PREDICTION_TYPE.USER })
      .orderBy('prediction.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data: predictions,
      total,
      page,
      limit,
    };
  }

  private generatePredictionPrompt(match: Match): string {
    return `Please analyze and predict the outcome of this football match:
    ${match.homeTeam} vs ${match.awayTeam}
    League: ${match.league.name}
    Date: ${match.matchDate.toISOString()}
    
    Please provide your prediction in the following format:
    
    PREDICTED_WINNER: [Team name or Draw]
    PREDICTED_SCORE: [Home Team] [X] - [Y] [Away Team]
    CONFIDENCE: [Number between 0-100]
    PROBABILITIES:
    - Home Win: [Number between 0-100]
    - Draw: [Number between 0-100]
    - Away Win: [Number between 0-100]
    
    EXPLANATION:
    [Your detailed analysis and reasoning in Vietnamese only. Do not include English translation.]`;
  }

  private parseAIResponse(response: string): {
    explanation: string;
    confidence: number;
    probabilities: {
      homeWin: number;
      draw: number;
      awayWin: number;
    };
  } {
    // Extract confidence score
    const confidenceMatch = response.match(/CONFIDENCE:\s*(\d+)/i);
    const confidence = confidenceMatch ? parseInt(confidenceMatch[1]) : 50;

    // Extract probabilities (handle both with and without %)
    const homeWinMatch = response.match(/Home Win:\s*(\d+)(?:%?)/i);
    const drawMatch = response.match(/Draw:\s*(\d+)(?:%?)/i);
    const awayWinMatch = response.match(/Away Win:\s*(\d+)(?:%?)/i);

    const probabilities = {
      homeWin: homeWinMatch ? parseInt(homeWinMatch[1]) : 40,
      draw: drawMatch ? parseInt(drawMatch[1]) : 20,
      awayWin: awayWinMatch ? parseInt(awayWinMatch[1]) : 40,
    };

    // Extract explanation (only Vietnamese part)
    const explanationMatch = response.match(
      /EXPLANATION:\s*([\s\S]*?)(?=\(Translation for context:|$)/i,
    );
    const explanation = explanationMatch
      ? explanationMatch[1].trim()
      : response;

    // Format the explanation
    const formattedExplanation = explanation
      .replace(/\n{3,}/g, '\n\n')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br />')
      .trim();

    return {
      explanation: formattedExplanation,
      confidence,
      probabilities,
    };
  }
}
