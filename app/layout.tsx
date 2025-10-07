export const metadata = {
  title: 'Webhook Handler',
  description: 'Edge function for processing BoldSign webhook requests',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
