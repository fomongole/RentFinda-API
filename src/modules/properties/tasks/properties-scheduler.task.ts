import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PropertiesService } from '../properties.service';

@Injectable()
export class PropertiesSchedulerTask {
  private readonly logger = new Logger(PropertiesSchedulerTask.name);

  constructor(private readonly propertiesService: PropertiesService) {}

  /**
   * Runs at midnight every day.
   * Automatically un-features any property whose featuredUntil date has passed.
   * This keeps featured listings clean without any manual admin intervention.
   */
  @Cron('0 0 * * *')
  async expireFeaturedListings(): Promise<void> {
    const count = await this.propertiesService.expireFeaturedListings();
    if (count > 0) {
      this.logger.log(`Auto-expired ${count} featured listing(s).`);
    }
  }
}