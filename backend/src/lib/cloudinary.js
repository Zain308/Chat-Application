import { v2 as cloudinary } from "cloudinary"
import dotenv from "dotenv"

// Ensure environment variables are loaded
dotenv.config()

// Log the actual values (with partial masking for security)
const cloudName = process.env.CLOUDINARY_CLOUD_NAME
const apiKey = process.env.CLOUDINARY_API_KEY
const apiSecret = process.env.CLOUDINARY_API_SECRET

console.log("Cloudinary Configuration:")
console.log(`Cloud Name: ${cloudName || "NOT SET"}`)
console.log(`API Key: ${apiKey ? apiKey.substring(0, 4) + "..." : "NOT SET"}`)
console.log(`API Secret: ${apiSecret ? "******" : "NOT SET"}`)

// Configure Cloudinary with explicit values
cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
})

// Export the configured cloudinary instance
export default cloudinary
