import { NextResponse } from "next/server"

export async function GET() {
  const response = await fetch(
    "https://free-api-live-football-data.p.rapidapi.com/football-get-all-leagues",
    {
      headers: {
        "x-rapidapi-host": "free-api-live-football-data.p.rapidapi.com",
        "x-rapidapi-key": process.env.FOOTBALL_API_KEY!,
      },
    }
  )

  const data = await response.json()
  console.log("Football API response:", JSON.stringify(data).slice(0, 500))
  return NextResponse.json(data)
}