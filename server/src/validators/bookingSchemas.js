import { z } from 'zod';

export const createBookingSchema = z.object({
  serviceId: z.number().int().positive('Service is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be HH:MM format'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be HH:MM format'),
  selectedColor: z.string().max(50).optional().default(''),
});

export const adminCreateBookingSchema = z.object({
  customerName: z.string().min(2, 'Customer name is required'),
  customerPhone: z.string().min(9, 'Customer phone is required'),
  serviceId: z.number().int().positive('Service is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be HH:MM format'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be HH:MM format'),
  selectedColor: z.string().max(50).optional().default(''),
  status: z.enum(['pending', 'confirmed']).optional().default('confirmed'),
});

export const updateBookingStatusSchema = z.object({
  status: z.enum(['confirmed', 'completed', 'cancelled'], {
    errorMap: () => ({ message: 'Status must be confirmed, completed, or cancelled' }),
  }),
});
