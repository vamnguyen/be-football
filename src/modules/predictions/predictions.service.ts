import axios from 'axios';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prediction, User } from '@/entities';
import { ConfigService } from '@nestjs/config';
import { PREDICTION_TYPE } from '@/core/enums';
import { UserCreatePredictionDto } from './dto/user-create-prediction.dto';
import { UsersService } from '@/modules/users/users.service';
import {
  PaginationDto,
  PaginationResponseDto,
} from '@/core/dto/pagination.dto';
import { RedisService } from '@/modules/redis/redis.service';
import { FootballDataService } from '@/modules/football-data/football-data.service';

@Injectable()
export class PredictionsService {
  private readonly openRouterBaseUrl =
    'https://openrouter.ai/api/v1/chat/completions';

  constructor(
    @InjectRepository(Prediction)
    private predictionRepository: Repository<Prediction>,
    private configService: ConfigService,
    private userService: UsersService,
    private redisService: RedisService,
    private footballDataService: FootballDataService,
  ) {}

  async getAIPrediction(matchId: number, user: User): Promise<Prediction> {
    // check if prediction already exists from redis
    const prediction = await this.redisService.get(
      `prediction:${matchId}:${user.id}:type-${PREDICTION_TYPE.AI}`,
    );

    if (prediction) {
      return prediction as Prediction;
    }

    const match = await this.footballDataService.getMatch(matchId);

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
        matchId,
        user,
        explanation: prediction.explanation,
        confidence: prediction.confidence,
        probabilities: prediction.probabilities,
        type: PREDICTION_TYPE.AI,
      });

      const savedPrediction =
        await this.predictionRepository.save(newPrediction);

      // Cache the prediction in Redis
      await this.redisService.set(
        `prediction:${matchId}:${user.id}:type-${PREDICTION_TYPE.AI}`,
        {
          ...savedPrediction,
          match: match,
        },
      );

      return this.redisService.get(
        `prediction:${matchId}:${user.id}:type-${PREDICTION_TYPE.AI}`,
      );
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
    matchId: number,
    body: UserCreatePredictionDto,
  ): Promise<Prediction> {
    const { result, explanation } = body;

    const match = await this.footballDataService.getMatch(matchId);
    if (!match)
      throw new HttpException('Match not found', HttpStatus.NOT_FOUND);

    const user = await this.userService.findById(userId);
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);

    const prediction = this.predictionRepository.create({
      matchId,
      user,
      result,
      explanation,
      type: PREDICTION_TYPE.USER,
    });

    const savedPrediction = await this.predictionRepository.save(prediction);

    // Cache the prediction in Redis
    await this.redisService.set(
      `prediction:${matchId}:${user.id}:type-${PREDICTION_TYPE.USER}`,
      {
        ...savedPrediction,
        match: match,
      },
    );

    return this.redisService.get(
      `prediction:${matchId}:${user.id}:type-${PREDICTION_TYPE.USER}`,
    );
  }

  async getMyPrediction(userId: string, matchId: number): Promise<Prediction> {
    const prediction = await this.redisService.get(
      `prediction:${matchId}:${userId}:type-${PREDICTION_TYPE.USER}`,
    );

    if (prediction) {
      return prediction as Prediction;
    }

    return null;
  }

  async getCommunityPredictions(
    matchId: number,
    paginationParams: PaginationDto,
  ): Promise<PaginationResponseDto<Prediction>> {
    const { page, limit } = paginationParams;

    const match = await this.footballDataService.getMatch(matchId);
    if (!match)
      throw new HttpException('Match not found', HttpStatus.NOT_FOUND);

    const [predictions, total] = await this.predictionRepository
      .createQueryBuilder('prediction')
      .leftJoinAndSelect('prediction.user', 'user')
      .where('prediction.matchId = :matchId', { matchId })
      .andWhere('prediction.type = :type', { type: PREDICTION_TYPE.USER })
      .orderBy('prediction.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const predictionsWithMatch = predictions.map((prediction) => ({
      ...prediction,
      match,
    }));

    return {
      data: predictionsWithMatch,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  private generatePredictionPrompt(match: any): string {
    return `Please analyze and predict the outcome of this football match:
    ${match.homeTeam.name} vs ${match.awayTeam.name}
    League: ${match.competition.name}
    Date: ${match.utcDate.toLocaleString()}
    
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
