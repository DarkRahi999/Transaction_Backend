import { Controller, Get, Query } from "@nestjs/common";
import { AppService } from "./app.service";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get('monthly-summary')
  async getMonthlySummary() {
    return await this.appService.getMonthlySummary();
  }

  @Get('yearly-summary')
  async getYearlySummary() {
    return await this.appService.getYearlySummary();
  }

}