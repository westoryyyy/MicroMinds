import { Controller, Get, Param, Query } from '@nestjs/common';
import { ListingsService } from './listings.service';

@Controller('listings')
export class ListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  /**
   * GET /listings?q=weather&maxPrice=1000000000000000
   */
  @Get()
  async findAll(
    @Query('q') q?: string,
    @Query('maxPrice') maxPrice?: string,
  ) {
    return this.listingsService.findAll({ q, maxPrice });
  }

  /**
   * GET /listings/:id
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.listingsService.findById(id);
  }
}
