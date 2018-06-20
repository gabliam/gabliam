import {
  RestController,
  Get,
  Post,
  Delete,
  express,
  RequestBody,
  Response,
  RequestParam
} from '@gabliam/express';
import { Photo } from '../entities/photo';
import { Connection, Repository } from '@gabliam/typeorm';

@RestController('/photos')
export class PhotoController {
  private photoRepository: Repository<Photo>;

  constructor(connection: Connection) {
    this.photoRepository = connection.getRepository<Photo>('Photo');
  }

  @Post('/')
  async create(@RequestBody() photo: Photo, @Response() res: express.Response) {
    try {
      return await this.photoRepository.save(photo);
    } catch (err) {
      res.status(500);
      res.json(err);
    }
  }

  @Delete('/:id')
  async del(@RequestParam('id') id: string, @Response() res: express.Response) {
    const photo = await this.photoRepository.findOneById(id);
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
  async getById(
    @RequestParam('id') id: string,
    @Response() res: express.Response
  ) {
    const photo = await this.photoRepository.findOneById(id);
    if (photo) {
      return photo;
    }
    res.sendStatus(404);
  }

  @Get('/')
  async getAll(@Response() res: express.Response) {
    const photos = await this.photoRepository.find();
    if (photos.length > 0) {
      return photos;
    }
    res.sendStatus(404);
  }
}
