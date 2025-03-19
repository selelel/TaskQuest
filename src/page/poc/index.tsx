import { Button } from "@/components/ui/button"
import '../../config/env'
import { auth } from "@/~core/firebase/client"
function IndexPage() {
  const user = auth.currentUser
  console.log(user)
  return (
    <main className="min-h-screen bg-[#242424]">
        <Button>Hello World</Button>
    </main>
  )
}

export default IndexPage