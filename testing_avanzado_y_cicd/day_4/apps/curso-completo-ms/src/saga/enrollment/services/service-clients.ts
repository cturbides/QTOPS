import { Injectable } from '@nestjs/common';
import { UserDetails, CourseDetails, PaymentDetails, SlotReservation, PaymentMethod } from '../types/enrollment-saga.types';

// Dummy service
@Injectable()
export class UserServiceClient {
  async obtenerUsuario(userId: string): Promise<UserDetails> {
    return {
      id: userId,
      email: `user${userId}@example.com`,
      active: true,
      creditLimit: 5000,
      completedCourses: ['course-1', 'course-2'], // Mock completed courses
      enrollmentHistory: [
        {
          courseId: 'course-1',
          enrollmentDate: new Date('2024-01-15'),
          completionDate: new Date('2024-03-15'),
          status: 'COMPLETED'
        },
        {
          courseId: 'course-2',
          enrollmentDate: new Date('2024-04-01'),
          completionDate: new Date('2024-06-01'),
          status: 'COMPLETED'
        }
      ]
    };
  }

  async obtenerCursosCompletados(userId: string): Promise<string[]> {
    // Mock completed courses
    return ['course-1', 'course-2', 'prerequisites-course-1'];
  }

  async validarLimiteCredito(userId: string, amount: number): Promise<boolean> {
    const user = await this.obtenerUsuario(userId);
    return user.creditLimit >= amount;
  }

  async bloquearCredito(userId: string, amount: number): Promise<void> {
    console.log(`[USER-SERVICE] Credit blocked for user ${userId}: $${amount}`);
  }

  async liberarBloqueoCredito(userId: string): Promise<void> {
    console.log(`[USER-SERVICE] Credit limit released for user ${userId}`);
  }
}

@Injectable()
export class CourseServiceClient {
  async obtenerCurso(courseId: string): Promise<CourseDetails> {
    // Mock course data
    const mockCourses: Record<string, CourseDetails> = {
      'course-advanced-nodejs': {
        id: courseId,
        title: 'Advanced Node.js Development',
        price: 299.99,
        currency: 'USD',
        hasAvailableSlots: true,
        maxStudents: 50,
        currentStudents: 35,
        prerequisites: ['course-1', 'course-2'], // Requires basic courses
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
        endDate: new Date(Date.now() + 37 * 24 * 60 * 60 * 1000), // 5 weeks from now
        instructor: {
          id: 'instructor-1',
          name: 'Dr. Sarah Johnson',
          email: 'sarah.johnson@example.com'
        }
      },
      'course-microservices': {
        id: courseId,
        title: 'Microservices Architecture',
        price: 399.99,
        currency: 'USD',
        hasAvailableSlots: true,
        maxStudents: 30,
        currentStudents: 20,
        prerequisites: ['course-advanced-nodejs'], // Requires advanced course
        startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
        endDate: new Date(Date.now() + 44 * 24 * 60 * 60 * 1000), // 6 weeks from now
        instructor: {
          id: 'instructor-2',
          name: 'Prof. Michael Chen',
          email: 'michael.chen@example.com'
        }
      }
    };

    return mockCourses[courseId] || {
      id: courseId,
      title: 'Sample Course',
      price: 199.99,
      currency: 'USD',
      hasAvailableSlots: true,
      maxStudents: 100,
      currentStudents: 15,
      prerequisites: [],
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 37 * 24 * 60 * 60 * 1000),
      instructor: {
        id: 'instructor-default',
        name: 'Default Instructor',
        email: 'instructor@example.com'
      }
    };
  }

  async reservarCupo(params: {
    courseId: string;
    userId: string;
    reservationId: string;
    expiresAt: Date;
  }): Promise<{ success: boolean; reservation?: SlotReservation; error?: string }> {
    const course = await this.obtenerCurso(params.courseId);
    
    if (!course.hasAvailableSlots) {
      return {
        success: false,
        error: 'No available slots'
      };
    }

    if (course.currentStudents >= course.maxStudents) {
      return {
        success: false,
        error: 'Course is full'
      };
    }

    const reservation: SlotReservation = {
      reservationId: params.reservationId,
      courseId: params.courseId,
      userId: params.userId,
      expiresAt: params.expiresAt,
      confirmed: false
    };

    console.log(`[COURSE-SERVICE] Slot reserved for course ${params.courseId}, user ${params.userId}`);

    return {
      success: true,
      reservation
    };
  }

  async liberarReservacion(reservationId: string): Promise<void> {
    console.log(`[COURSE-SERVICE] Slot reservation released: ${reservationId}`);
  }

  async confirmarInscripcion(params: {
    userId: string;
    courseId: string;
    reservationId: string;
    enrollmentType: string;
  }): Promise<{ success: boolean; enrollmentId?: string; error?: string }> {
    const enrollmentId = `enrollment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    console.log(`[COURSE-SERVICE] Enrollment confirmed: ${enrollmentId} for user ${params.userId} in course ${params.courseId}`);

    return {
      success: true,
      enrollmentId
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

@Injectable()
export class PaymentServiceClient {
  async procesarPago(params: {
    amount: number;
    currency: string;
    paymentMethod: PaymentMethod;
    userId: string;
    description: string;
    metadata?: Record<string, any>;
  }): Promise<{ success: boolean; payment?: PaymentDetails; error?: string }> {
    // Simulate payment failure for testing (10% failure rate)
    const shouldFail = Math.random() < 0.1;
    
    if (shouldFail) {
      return {
        success: false,
        error: 'Payment processing failed - insufficient funds'
      };
    }

    const payment: PaymentDetails = {
      transactionId: `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      amount: params.amount,
      currency: params.currency,
      method: params.paymentMethod,
      status: 'COMPLETED',
      processedAt: new Date()
    };

    console.log(`[PAYMENT-SERVICE] Payment processed: ${payment.transactionId} for $${params.amount}`);

    return {
      success: true,
      payment
    };
  }

  async revertirPago(transactionId: string): Promise<void> {
    console.log(`[PAYMENT-SERVICE] Payment reverted: ${transactionId}`);
  }

  async validarMetodoPago(paymentMethod: PaymentMethod, userId: string): Promise<boolean> {
    
    // Mock validation - in real implementation would validate with payment provider
    const validMethods = [PaymentMethod.CREDIT_CARD, PaymentMethod.DEBIT_CARD, PaymentMethod.PAYPAL];
    return validMethods.includes(paymentMethod);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

@Injectable()
export class EmailServiceClient {
  async enviarNotificacion(params: {
    userId: string;
    courseId: string;
    notificationType: string;
    templateData: Record<string, any>;
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    // Simulate email service
    const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    console.log(`[EMAIL-SERVICE] Notification sent to user ${params.userId}: ${params.notificationType}`);

    return {
      success: true,
      messageId
    };
  }

  async enviarWelcomeEmail(userId: string, courseTitle: string, startDate: Date): Promise<void> {
    console.log(`[EMAIL-SERVICE] Welcome email sent to user ${userId} for course "${courseTitle}"`);
  }

  async enviarPaymentConfirmation(userId: string, transactionId: string, amount: number): Promise<void> {
    console.log(`[EMAIL-SERVICE] Payment confirmation sent to user ${userId} for transaction ${transactionId}`);
  }
}
