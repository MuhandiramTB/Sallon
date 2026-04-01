import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  displayOrder: z.number().int().min(0).default(0),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').optional(),
  displayOrder: z.number().int().min(0).optional(),
});

export const createServiceSchema = z.object({
  categoryId: z.number().int().positive('Category is required'),
  name: z.string().min(1, 'Service name is required'),
  description: z.string().optional(),
  durationMinutes: z.number().int().min(5, 'Duration must be at least 5 minutes'),
  price: z.number().int().min(0, 'Price must be non-negative'),
  isPackage: z.boolean().optional().default(false),
  packageServiceIds: z.array(z.number().int().positive()).optional(),
});

export const updateServiceSchema = z.object({
  categoryId: z.number().int().positive().optional(),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  durationMinutes: z.number().int().min(5).optional(),
  price: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
  isPackage: z.boolean().optional(),
  packageServiceIds: z.array(z.number().int().positive()).optional(),
});
