import { envSchema } from "@/schemas/envSchema.js";

const envData = envSchema.safeParse(process.env)

export { envData }