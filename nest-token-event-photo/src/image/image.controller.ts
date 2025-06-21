import { Controller, Post, Body, Get, Param, HttpException, HttpStatus } from '@nestjs/common';
import { ImageService } from './image.service';

@Controller('image')
export class ImageController {
    constructor(private readonly imageService: ImageService) {}

    @Post()
    async saveImage(@Body() body: { id: string; base64: string; qrCodeId: string; date: string; time: string }) {
        if (!body.id || !body.base64 || !body.qrCodeId || !body.date || !body.time) {
            throw new HttpException('All fields (id, base64, qrCodeId, date, time) are required', HttpStatus.BAD_REQUEST);
        }
        return this.imageService.saveImage(body.id, body.base64, body.qrCodeId, body.date, body.time);
    }

    @Get('qr/:qrCodeId')
    async getImageByQrCodeId(@Param('qrCodeId') qrCodeId: string) {
        return this.imageService.getImageByQrCodeId(qrCodeId);
    }
}