import { Module } from '@nestjs/common';
import { AuthModule } from './auth-module/auth.module.js';
import { PhotosModule } from './photos-module/photos.module.js';

@Module({
  imports: [
    AuthModule,
    PhotosModule
  ],
})
export class ApiRootModule {
}
