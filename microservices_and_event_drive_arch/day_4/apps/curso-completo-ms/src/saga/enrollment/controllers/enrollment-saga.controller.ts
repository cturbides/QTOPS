import { Controller, Post, Get, Body, Param, Query, Logger, HttpStatus } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { 
  EnrollInCourseCommand 
} from '../commands/enrollment.commands';
import { 
  PaymentMethod, 
  EnrollmentType, 
  EnrollmentResult 
} from '../types/enrollment-saga.types';
import { CourseEnrollmentSaga } from '../course-enrollment-saga.service';

export class EnrollInCourseDto {
  userId: string;
  courseId: string;
  enrollmentType: EnrollmentType = EnrollmentType.REGULAR;
  paymentMethod?: PaymentMethod;
  requiresPayment: boolean = true;
  discountCode?: string;
  preferredStartDate?: string;
  metadata?: Record<string, any>;
}

export class EnrollmentQueryDto {
  userId?: string;
  courseId?: string;
  status?: 'active' | 'completed' | 'failed';
  limit?: number;
  offset?: number;
}

@Controller('enrollment-saga')
export class EnrollmentSagaController {
  private readonly logger = new Logger(EnrollmentSagaController.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly enrollmentSaga: CourseEnrollmentSaga
  ) {}

  @Post('enroll')
  async enrollInCourse(@Body() dto: EnrollInCourseDto): Promise<{
    success: boolean;
    data?: EnrollmentResult;
    error?: string;
  }> {
    this.logger.log(`Enrollment request received for user ${dto.userId} in course ${dto.courseId}`);

    try {
      // Validate required fields
      if (!dto.userId || !dto.courseId) {
        return {
          success: false,
          error: 'userId and courseId are required'
        };
      }

      // Validate payment method if payment is required
      if (dto.requiresPayment && !dto.paymentMethod) {
        return {
          success: false,
          error: 'paymentMethod is required when requiresPayment is true'
        };
      }

      // Create command
      const command = new EnrollInCourseCommand(
        dto.userId,
        dto.courseId,
        dto.enrollmentType,
        dto.paymentMethod,
        dto.requiresPayment,
        dto.discountCode,
        dto.preferredStartDate ? new Date(dto.preferredStartDate) : undefined,
        dto.metadata
      );

      // Execute saga through command bus
      const result = await this.commandBus.execute(command);

      this.logger.log(`Enrollment ${result.success ? 'succeeded' : 'failed'} for user ${dto.userId}`);

      return {
        success: result.success,
        data: result
      };

    } catch (error) {
      this.logger.error(`Enrollment failed for user ${dto.userId}:`, error);

      return {
        success: false,
        error: error.message || 'Internal server error'
      };
    }
  }

  @Get('saga/:sagaId')
  async getSagaState(@Param('sagaId') sagaId: string): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    try {
      const sagaState = await this.enrollmentSaga.getSagaState(sagaId);

      if (!sagaState) {
        return {
          success: false,
          error: 'Saga not found'
        };
      }

      return {
        success: true,
        data: {
          sagaId: sagaState.sagaId,
          userId: sagaState.userId,
          courseId: sagaState.courseId,
          currentStep: sagaState.currentStep,
          enrollmentType: sagaState.enrollmentType,
          requiresPayment: sagaState.requiresPayment,
          paymentMethod: sagaState.paymentMethod,
          completed: sagaState.completed,
          failed: sagaState.failed,
          failureReason: sagaState.failureReason,
          completedSteps: sagaState.completedSteps,
          compensations: sagaState.compensations,
          executedCompensations: sagaState.executedCompensations,
          enrollmentId: sagaState.enrollmentId,
          paymentId: sagaState.paymentId,
          userDetails: sagaState.userDetails,
          courseDetails: sagaState.courseDetails,
          startedAt: sagaState.startedAt,
          completedAt: sagaState.completedAt,
          failedAt: sagaState.failedAt,
          createdAt: sagaState.createdAt,
          updatedAt: sagaState.updatedAt
        }
      };

    } catch (error) {
      this.logger.error(`Failed to get saga state for ${sagaId}:`, error);

      return {
        success: false,
        error: error.message || 'Internal server error'
      };
    }
  }

  @Get('user/:userId/sagas')
  async getUserSagas(
    @Param('userId') userId: string,
    @Query() query: EnrollmentQueryDto
  ): Promise<{
    success: boolean;
    data?: any[];
    total?: number;
    error?: string;
  }> {
    try {
      const sagas = await this.enrollmentSaga.getSagasByUser(userId);

      // Apply filters
      let filteredSagas = sagas;

      if (query.status) {
        switch (query.status) {
          case 'active':
            filteredSagas = sagas.filter(s => !s.completed && !s.failed);
            break;
          case 'completed':
            filteredSagas = sagas.filter(s => s.completed);
            break;
          case 'failed':
            filteredSagas = sagas.filter(s => s.failed);
            break;
        }
      }

      // Apply pagination
      const offset = query.offset || 0;
      const limit = query.limit || 50;
      const paginatedSagas = filteredSagas.slice(offset, offset + limit);

      const sagaSummaries = paginatedSagas.map(saga => ({
        sagaId: saga.sagaId,
        courseId: saga.courseId,
        enrollmentType: saga.enrollmentType,
        currentStep: saga.currentStep,
        completed: saga.completed,
        failed: saga.failed,
        failureReason: saga.failureReason,
        enrollmentId: saga.enrollmentId,
        paymentId: saga.paymentId,
        startedAt: saga.startedAt,
        completedAt: saga.completedAt,
        failedAt: saga.failedAt
      }));

      return {
        success: true,
        data: sagaSummaries,
        total: filteredSagas.length
      };

    } catch (error) {
      this.logger.error(`Failed to get user sagas for ${userId}:`, error);

      return {
        success: false,
        error: error.message || 'Internal server error'
      };
    }
  }

  @Get('course/:courseId/enrollments')
  async getCourseEnrollments(
    @Param('courseId') courseId: string,
    @Query() query: EnrollmentQueryDto
  ): Promise<{
    success: boolean;
    data?: any[];
    total?: number;
    error?: string;
  }> {
    try {
      const sagas = await this.enrollmentSaga.getSagasByCourse(courseId);

      // Apply filters
      let filteredSagas = sagas;

      if (query.status) {
        switch (query.status) {
          case 'active':
            filteredSagas = sagas.filter(s => !s.completed && !s.failed);
            break;
          case 'completed':
            filteredSagas = sagas.filter(s => s.completed);
            break;
          case 'failed':
            filteredSagas = sagas.filter(s => s.failed);
            break;
        }
      }

      // Apply pagination
      const offset = query.offset || 0;
      const limit = query.limit || 50;
      const paginatedSagas = filteredSagas.slice(offset, offset + limit);

      const enrollmentSummaries = paginatedSagas.map(saga => ({
        sagaId: saga.sagaId,
        userId: saga.userId,
        enrollmentType: saga.enrollmentType,
        currentStep: saga.currentStep,
        completed: saga.completed,
        failed: saga.failed,
        failureReason: saga.failureReason,
        enrollmentId: saga.enrollmentId,
        paymentId: saga.paymentId,
        amount: saga.amount,
        currency: saga.currency,
        startedAt: saga.startedAt,
        completedAt: saga.completedAt,
        failedAt: saga.failedAt
      }));

      return {
        success: true,
        data: enrollmentSummaries,
        total: filteredSagas.length
      };

    } catch (error) {
      this.logger.error(`Failed to get course enrollments for ${courseId}:`, error);

      return {
        success: false,
        error: error.message || 'Internal server error'
      };
    }
  }

  @Get('active')
  async getActiveSagas(): Promise<{
    success: boolean;
    data?: any[];
    error?: string;
  }> {
    try {
      const activeSagas = await this.enrollmentSaga.getActiveSagas();

      const sagaSummaries = activeSagas.map(saga => ({
        sagaId: saga.sagaId,
        userId: saga.userId,
        courseId: saga.courseId,
        enrollmentType: saga.enrollmentType,
        currentStep: saga.currentStep,
        requiresPayment: saga.requiresPayment,
        paymentMethod: saga.paymentMethod,
        startedAt: saga.startedAt,
        completedSteps: saga.completedSteps,
        compensations: saga.compensations
      }));

      return {
        success: true,
        data: sagaSummaries
      };

    } catch (error) {
      this.logger.error(`Failed to get active sagas:`, error);

      return {
        success: false,
        error: error.message || 'Internal server error'
      };
    }
  }

  @Get('stats')
  async getSagaStats(): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    try {
      // This would typically be a more efficient query in a real implementation
      const activeSagas = await this.enrollmentSaga.getActiveSagas();
      const allUserSagas = await this.enrollmentSaga.getSagasByUser(''); // Empty string to get all

      const stats = {
        active: activeSagas.length,
        total: allUserSagas.length,
        completed: allUserSagas.filter(s => s.completed).length,
        failed: allUserSagas.filter(s => s.failed).length,
        byEnrollmentType: {},
        byPaymentMethod: {},
        averageCompletionTime: 0
      };

      // Calculate stats by enrollment type
      const enrollmentTypeCounts = allUserSagas.reduce((acc, saga) => {
        acc[saga.enrollmentType] = (acc[saga.enrollmentType] || 0) + 1;
        return acc;
      }, {});
      stats.byEnrollmentType = enrollmentTypeCounts;

      // Calculate stats by payment method
      const paymentMethodCounts = allUserSagas.reduce((acc, saga) => {
        if (saga.paymentMethod) {
          acc[saga.paymentMethod] = (acc[saga.paymentMethod] || 0) + 1;
        }
        return acc;
      }, {});
      stats.byPaymentMethod = paymentMethodCounts;

      // Calculate average completion time for completed sagas
      const completedSagas = allUserSagas.filter(s => s.completed && s.startedAt && s.completedAt);
      if (completedSagas.length > 0) {
        const totalTime = completedSagas.reduce((sum, saga) => {
          return sum + (saga.completedAt!.getTime() - saga.startedAt!.getTime());
        }, 0);
        stats.averageCompletionTime = totalTime / completedSagas.length;
      }

      return {
        success: true,
        data: stats
      };

    } catch (error) {
      this.logger.error(`Failed to get saga stats:`, error);

      return {
        success: false,
        error: error.message || 'Internal server error'
      };
    }
  }

  @Post('test/simulate-enrollment')
  async simulateEnrollment(@Body() dto: {
    userId?: string;
    courseId?: string;
    enrollmentType?: EnrollmentType;
    paymentMethod?: PaymentMethod;
    shouldFail?: boolean;
  }): Promise<{
    success: boolean;
    data?: EnrollmentResult;
    error?: string;
  }> {
    this.logger.log(`Simulating enrollment with parameters:`, dto);

    // Generate test data if not provided
    const testDto: EnrollInCourseDto = {
      userId: dto.userId || `test-user-${Date.now()}`,
      courseId: dto.courseId || 'course-advanced-nodejs',
      enrollmentType: dto.enrollmentType || EnrollmentType.REGULAR,
      paymentMethod: dto.paymentMethod || PaymentMethod.CREDIT_CARD,
      requiresPayment: true,
      metadata: {
        test: true,
        simulatedAt: new Date().toISOString()
      }
    };

    // Simulate failure by using invalid course ID
    if (dto.shouldFail) {
      testDto.courseId = 'invalid-course-id';
    }

    return await this.enrollInCourse(testDto);
  }
}
