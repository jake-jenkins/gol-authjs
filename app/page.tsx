import { auth } from "@/auth"
import { redirect } from 'next/navigation'
 
export default async function Page() {
  const session = await auth()
  if (!session) return redirect('/api/auth/signin')
 
  return (
    <div>
      <pre>{JSON.stringify(session, null, 2)}</pre>
    </div>
  )
}