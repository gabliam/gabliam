import {
  RestController,
  Get,
  Post,
  Delete,
  express,
  RequestBody,
  Response,
  Re,
  RequestParam
} from '@gabliam/express';
import { Hero } from '../entities/hero';
import { Repository, MongooseConnection, mongoose } from '@gabliam/mongoose';

@RestController('/heroes')
export class HeroController {
  private heroRepository: Repository<Hero>;

  constructor(connection: MongooseConnection) {
    this.heroRepository = connection.getRepository<Hero>('Hero');
  }

  @Post('/')
  async create(
    @RequestBody() hero: Hero,
    @Response() res: express.Response
  ): Promise<(Hero & mongoose.Document) | undefined> {
    try {
      return await this.heroRepository.create(hero);
    } catch (err) {
      res.status(500);
      res.json(err);
    }
  }

  @Delete('/:id')
  async del(@RequestParam('id') id: string, @Response() res: express.Response) {
    await this.heroRepository.delete(id);
    res.sendStatus(204);
  }

  @Get('/:id')
  async getById(
    @RequestParam('id') id: string,
    @Response() res: express.Response
  ) {
    const hero = await this.heroRepository.findById(id);
    if (hero) {
      return hero;
    }
    res.sendStatus(404);
  }

  @Get('/')
  async getAll(@Response() res: express.Response) {
    const photos = await this.heroRepository.find({});
    if (photos.length > 0) {
      return photos;
    }
    res.sendStatus(404);
  }
}
