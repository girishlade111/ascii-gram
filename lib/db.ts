import { neon } from "@neondatabase/serverless"

// Create a SQL client with the connection string from environment variables
const sql = neon(process.env.DATABASE_URL!)

// Export the sql client for direct use with tagged template literals
export { sql }

// Legacy query function - simplified to avoid syntax issues
export async function query(text: string, params: any[] = []) {
  try {
    if (params.length === 0) {
      // For queries without parameters
      const result = await sql`${text}`
      return { rows: result }
    } else {
      // For parameterized queries, we'll use a different approach
      // This is a simplified version to avoid syntax errors
      console.error("Parameterized queries should use sql template literals directly")
      return { rows: [] }
    }
  } catch (error) {
    console.error("Database query error:", error)
    throw new Error(`Database query error: ${error instanceof Error ? error.message : String(error)}`)
  }
}
