import { Controller, Get, Query } from '@nestjs/common';
import type { SearchResponse } from '@scryland/shared';
import { SearchQueryDto } from './dto/search-query.dto';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  search(@Query() query: SearchQueryDto): Promise<SearchResponse> {
    return this.searchService.search(query.q);
  }
}
