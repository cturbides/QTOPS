export enum EnrollmentSagaStep {
  STARTED = 'STARTED',
  VALIDATING_USER = 'VALIDATING_USER',
  VALIDATING_COURSE = 'VALIDATING_COURSE',
  VALIDATING_PREREQUISITES = 'VALIDATING_PREREQUISITES',
  RESERVING_SLOT = 'RESERVING_SLOT',
  PROCESSING_PAYMENT = 'PROCESSING_PAYMENT',
  CONFIRMING_ENROLLMENT = 'CONFIRMING_ENROLLMENT',
  SENDING_NOTIFICATIONS = 'SENDING_NOTIFICATIONS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  COMPENSATING = 'COMPENSATING'
}

export enum PaymentMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  PAYPAL = 'PAYPAL',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CRYPTOCURRENCY = 'CRYPTOCURRENCY'
}

export enum EnrollmentType {
  REGULAR = 'REGULAR',
  PREMIUM = 'PREMIUM',
  TRIAL = 'TRIAL',
  SCHOLARSHIP = 'SCHOLARSHIP'
}

export interface CompensationAction {
  name: string;
  action: () => Promise<void>;
  executed?: boolean;
  error?: string;
}

export interface EnrollmentResult {
  success: boolean;
  enrollmentId?: string;
  courseId?: string;
  startDate?: Date;
  error?: string;
  paymentId?: string;
  compensationsExecuted?: string[];
}

export interface CourseDetails {
  id: string;
  title: string;
  price: number;
  currency: string;
  hasAvailableSlots: boolean;
  maxStudents: number;
  currentStudents: number;
  prerequisites: string[];
  startDate: Date;
  endDate: Date;
  instructor: {
    id: string;
    name: string;
    email: string;
  };
}

export interface UserDetails {
  id: string;
  email: string;
  active: boolean;
  creditLimit: number;
  completedCourses: string[];
  enrollmentHistory: EnrollmentHistoryEntry[];
}

export interface EnrollmentHistoryEntry {
  courseId: string;
  enrollmentDate: Date;
  completionDate?: Date;
  status: 'ACTIVE' | 'COMPLETED' | 'DROPPED' | 'FAILED';
}

export interface PaymentDetails {
  transactionId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  processedAt: Date;
}

export interface SlotReservation {
  reservationId: string;
  courseId: string;
  userId: string;
  expiresAt: Date;
  confirmed: boolean;
}
