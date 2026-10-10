import { Controller, Get, Param, Query, Post, Body, UseGuards } from '@nestjs/common';
import { ListingsService } from './listings.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { PrivyAuthGuard } from '../auth/privy-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('listings')
export class ListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  @Get()
  async findAll(
    @Query('q') q?: string,
    @Query('maxPrice') maxPrice?: string,
  ) {
    return this.listingsService.findAll({ q, maxPrice });
  }

  @Post()
  @UseGuards(PrivyAuthGuard)
  async createListing(
    @Body() dto: CreateListingDto,
    @CurrentUser() user: any,
  ) {
    const provider_address = user.address.toLowerCase();

    return this.listingsService.create({
      ...dto,
      provider_address,
      timeout_ms: dto.timeout_ms || 5000,
      category: 'general'
    });
  }

  @Get('me')
  @UseGuards(PrivyAuthGuard)
  async getMyListings(@CurrentUser() user: any) {
    const provider_address = user.address.toLowerCase();
    return this.listingsService.findByProvider(provider_address);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.listingsService.findById(id);
  }
}
