import { UseExpressInterceptors } from '@gabliam/express';
import { UseKoaInterceptors } from '@gabliam/koa';
import { Connection, Repository } from '@gabliam/typeorm';
import {
  Delete,
  GabRequest,
  Get,
  Post,
  Request,
  RequestBody,
  RequestParam,
  ResponseEntity,
  RestController,
} from '@gabliam/web-core';
import Boom from 'boom';
import { Photo } from '../entities/photo';
import { expressMulter, koaMulter } from '../multer';

@RestController('/photos')
export class PhotoController {
  private photoRepository: Repository<Photo>;

  constructor(connection: Connection) {
    this.photoRepository = connection.getRepository<Photo>('Photo');
  }

  @Post('/')
  async create(@RequestBody() photo: Photo) {
    try {
      return await this.photoRepository.save(photo);
    } catch (err) {
      throw Boom.internal(err);
    }
  }

  @Delete('/:id')
  async del(@RequestParam('id') id: string) {
    const photo = await this.photoRepository.findOne(id);
    if (photo) {
      try {
        await this.photoRepository.remove(photo);
        return ResponseEntity.noContent();
      } catch (err) {
        throw Boom.internal(err);
      }
    }
    throw Boom.notFound();
  }

  @Get('/:id')
  async getById(@RequestParam('id') id: string) {
    const photo = await this.photoRepository.findOne(id);
    if (photo) {
      return photo;
    }
    throw Boom.notFound();
  }

  @Get('/')
  async getAll() {
    const photos = await this.photoRepository.find();
    if (photos.length > 0) {
      return photos;
    }
    throw Boom.notFound();
  }

  @UseKoaInterceptors(koaMulter.single('avatar'))
  @UseExpressInterceptors(expressMulter.single('avatar'))
  @Post('/upload')
  async upload(@Request() req: GabRequest) {
      return req.file;
  }
}
