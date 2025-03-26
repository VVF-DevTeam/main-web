import { z } from "zod";
import { DOCUMENT_SCHEMA } from "./fileSchema";

export const createApplicationSchema = z.object({
    firstName: z.string({ required_error: 'First name is required' }),
    lastName: z.string({ required_error: 'First name is required' }),
    address: z
      .string({ required_error: 'Address is required' })
      .min(1, { message: 'Address must be at least 2 characters long' }),
    city: z.string({ required_error: 'City is required' }),
    country: z.string({ required_error: 'Country is required' }),
    postCode: z.string({ required_error: 'Postal code is required' }),
    email: z.string().email('Invalid email').nonempty(),
    phoneNumber: z.string().nonempty(),
    resume: DOCUMENT_SCHEMA,
  })