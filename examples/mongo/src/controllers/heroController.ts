import { RestController, Get, Post, Delete } from '@gabliam/express';
import { Hero } from '../entities/hero';
import * as express from 'express';
import * as mongoose from 'mongoose';
import { Repository, MongooseConnection } from '@gabliam/mongoose';

@RestController('/heroes')
export class HeroController {
  private heroRepository: Repository<Hero>;

  constructor(connection: MongooseConnection) {
    this.heroRepository = connection.getRepository<Hero>('Hero');
  }

  @Post('/')
  async create(
    req: express.Request,
    res: express.Response
  ): Promise<(Hero & mongoose.Document) | undefined> {
    try {
      return await this.heroRepository.create(req.body);
    } catch (err) {
      res.status(500);
      res.json(err);
    }
  }

  @Delete('/:id')
  async del(req: express.Request, res: express.Response) {
    await this.heroRepository.delete(req.params.id);
    res.sendStatus(204);
  }

  @Get('/:id')
  async getById(req: express.Request, res: express.Response) {
    const hero = await this.heroRepository.findById(req.params.id);
    if (hero) {
      return hero;
    }
    res.sendStatus(404);
  }

  @Get('/')
  async getAll(req: express.Request, res: express.Response) {
    const photos = await this.heroRepository.find({});
    if (photos.length > 0) {
      return photos;
    }
    res.sendStatus(404);
  }
}
