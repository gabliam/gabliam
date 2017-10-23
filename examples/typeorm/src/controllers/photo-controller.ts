import { RestController, Get, Post, Delete, express } from '@gabliam/express';
import { Photo } from '../entities/photo';
import { Connection, Repository } from '@gabliam/typeorm';

@RestController('/photos')
export class PhotoController {
  private photoRepository: Repository<Photo>;

  constructor(connection: Connection) {
    this.photoRepository = connection.getRepository<Photo>('Photo');
  }

  @Post('/')
  async create(req: express.Request, res: express.Response) {
    try {
      return await this.photoRepository.persist(req.body);
    } catch (err) {
      res.status(500);
      res.json(err);
    }
  }

  @Delete('/:id')
  async del(req: express.Request, res: express.Response) {
    const photo = await this.photoRepository.findOneById(req.params.id);
    if (photo) {
      try {
        await this.photoRepository.remove(photo);
        res.sendStatus(204);
      } catch (err) {
        res.status(500);
        res.json(err);
      }
      return;
    }
    res.sendStatus(404);
  }

  @Get('/:id')
  async getById(req: express.Request, res: express.Response) {
    const photo = await this.photoRepository.findOneById(req.params.id);
    if (photo) {
      return photo;
    }
    res.sendStatus(404);
  }

  @Get('/')
  async getAll(req: express.Request, res: express.Response) {
    const photos = await this.photoRepository.find();
    if (photos.length > 0) {
      return photos;
    }
    res.sendStatus(404);
  }
}
