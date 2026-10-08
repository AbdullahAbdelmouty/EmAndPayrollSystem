import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { CreateEmployeeDto } from '../application/dto/create-employee.dto';
import {
  EmployeePageResponse,
  EmployeeResponse,
} from '../application/dto/employee.response';
import { ListEmployeesQuery } from '../application/dto/list-employees.query';
import { UpdateEmployeeDto } from '../application/dto/update-employee.dto';
import { EmployeesService } from '../application/employees.service';

@ApiTags('employees')
@Controller({
  path: 'employees',
  version: process.env.API_VERSION,
})
export class EmployeesController {
  constructor(private readonly employees: EmployeesService) {}

  @Post()
  @ApiOperation({ summary: 'Create an employee' })
  @ApiCreatedResponse({ type: EmployeeResponse })
  @ApiBadRequestResponse({
    description: 'Malformed request (problem+json with field errors)',
  })
  @ApiConflictResponse({ description: 'Email already in use' })
  @ApiUnprocessableEntityResponse({ description: 'A domain rule was violated' })
  async create(@Body() dto: CreateEmployeeDto): Promise<EmployeeResponse> {
    return EmployeeResponse.from(await this.employees.create(dto));
  }

  @Get()
  @ApiOperation({
    summary: 'List employees with pagination, search and filters',
  })
  @ApiOkResponse({ type: EmployeePageResponse })
  async list(
    @Query() query: ListEmployeesQuery,
  ): Promise<EmployeePageResponse> {
    return EmployeePageResponse.from(await this.employees.list(query));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one employee' })
  @ApiOkResponse({ type: EmployeeResponse })
  @ApiNotFoundResponse({ description: 'Employee not found' })
  async get(@Param('id', ParseUUIDPipe) id: string): Promise<EmployeeResponse> {
    return EmployeeResponse.from(await this.employees.get(id));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an employee (partial)' })
  @ApiOkResponse({ type: EmployeeResponse })
  @ApiBadRequestResponse({
    description: 'Malformed request (problem+json with field errors)',
  })
  @ApiNotFoundResponse({ description: 'Employee not found' })
  @ApiConflictResponse({ description: 'Email already in use' })
  @ApiUnprocessableEntityResponse({ description: 'A domain rule was violated' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEmployeeDto,
  ): Promise<EmployeeResponse> {
    return EmployeeResponse.from(await this.employees.update(id, dto));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an employee' })
  @ApiNoContentResponse({ description: 'Deleted' })
  @ApiNotFoundResponse({ description: 'Employee not found' })
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.employees.delete(id);
  }
}
