import { Module } from '@nestjs/common';
import { AppApiModule } from './app-api.module.js';
import { AppDbModule } from './app-db.module.js';

@Module({
  imports: [AppDbModule, AppApiModule],
})
export class ApplicationModule {}
