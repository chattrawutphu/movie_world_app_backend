import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface CreateMovieDto {
  title: string;
  description: string;
  releaseYear: number;
  genre: string;
}

interface UpdateMovieDto {
  title?: string;
  description?: string;
  releaseYear?: number;
  genre?: string;
}

export interface PaginatedMoviesResponse {
  movies: any[];
  total: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
}

@Injectable()
export class MoviesService {
  constructor(private prisma: PrismaService) {}

  async findAll(page: number = 1, limit: number = 10): Promise<PaginatedMoviesResponse> {
    const skip = (page - 1) * limit;
    
    const [movies, total] = await Promise.all([
      this.prisma.movie.findMany({
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.movie.count(),
    ]);

    const hasNextPage = skip + limit < total;

    return {
      movies,
      total,
      page,
      limit,
      hasNextPage,
    };
  }

  async findOne(id: number) {
    const movie = await this.prisma.movie.findUnique({
      where: { id },
    });

    if (!movie) {
      throw new NotFoundException(`Movie with ID ${id} not found`);
    }

    return movie;
  }

  async create(createMovieDto: CreateMovieDto) {
    return this.prisma.movie.create({
      data: createMovieDto,
    });
  }

  async update(id: number, updateMovieDto: UpdateMovieDto) {
    try {
      return await this.prisma.movie.update({
        where: { id },
        data: updateMovieDto,
      });
    } catch (error) {
      throw new NotFoundException(`Movie with ID ${id} not found`);
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.movie.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(`Movie with ID ${id} not found`);
    }
  }
} 