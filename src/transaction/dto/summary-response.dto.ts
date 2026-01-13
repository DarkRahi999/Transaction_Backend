import { ApiProperty } from '@nestjs/swagger';

export class SummaryResponseDto {
  @ApiProperty({
    description: 'Total income for the period',
    example: 5000,
    type: Number,
  })
  monthlyIncome?: number;

  @ApiProperty({
    description: 'Total expense for the period',
    example: 2000,
    type: Number,
  })
  monthlyExpense?: number;

  @ApiProperty({
    description: 'Current balance',
    example: 10000,
    type: Number,
  })
  currentBalance: number;

  @ApiProperty({
    description: 'Total income for the year',
    example: 60000,
    type: Number,
  })
  yearlyIncome?: number;

  @ApiProperty({
    description: 'Total expense for the year',
    example: 24000,
    type: Number,
  })
  yearlyExpense?: number;
}