import type { Metadata } from "next"
import { Providers } from "./providers"
import "./globals.css"

export const metadata: Metadata = {
  title: "POLLON - World Cup 2026 Pool",
  description: "Create pools with friends, predict scores, and compete for the crown.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Rethink+Sans:ital,wght@0,400..800;1,400..800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}