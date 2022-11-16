import { UseExpressInterceptors } from '@gabliam/express';
import { UseKoaInterceptors } from '@gabliam/koa';
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
import { DataSource, Repository } from 'typeorm';
import { Photo } from '../entities/photo';
import { expressMulter, koaMulter } from '../multer';

@RestController('/photos')
export class PhotoController {
  private photoRepository: Repository<Photo>;

  constructor(datasource: DataSource) {
    this.photoRepository = datasource.getRepository(Photo);
  }

  @Post('/')
  async create(@RequestBody() photo: Photo) {
    try {
      return await this.photoRepository.save(photo);
    } catch (err) {
      throw Boom.internal(err as string);
    }
  }

  @Delete('/:id')
  async del(@RequestParam('id') id: number) {
    const photo = await this.photoRepository.findOneBy({ id });
    if (photo) {
      try {
        await this.photoRepository.remove(photo);
        return ResponseEntity.noContent();
      } catch (err) {
        throw Boom.internal(err as string);
      }
    }
    throw Boom.notFound();
  }

  @Get('/:id')
  async getById(@RequestParam('id') id: number) {
    const photo = await this.photoRepository.findOneBy({ id });
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
    return [];
  }

  @UseKoaInterceptors(koaMulter.single('avatar'))
  @UseExpressInterceptors(expressMulter.single('avatar'))
  @Post('/upload')
  async upload(@Request() req: GabRequest) {
    return req.file;
  }
}
