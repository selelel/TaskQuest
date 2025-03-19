import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const sign_in_schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long")
});

function IndexPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const form = useForm({
    resolver: zodResolver(sign_in_schema)
  });

  const handleSubmit = async({email, password}: { email: string; password: string }) => {
    try {
      await signIn(email, password);
      navigate("/");
    } catch (error) {
      console.error("Sign in failed", error);
    }
  }

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Sign In</h1>
        <Form {...form}>
          <form className="space-y-6" onSubmit={form.handleSubmit(handleSubmit)}>
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <input type="email" placeholder="Email" {...field} required className="w-full p-2 border border-gray-300 rounded" />
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <input type="password" placeholder="Password" {...field} required className="w-full p-2 border border-gray-300 rounded" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">Sign In</button>
          <p className="text-center mt-4">
            Don't have an account? <a href="/signup" className="text-blue-500 hover:underline">Sign Up</a>
          </p>
          </form>
        </Form>
      </div>
    </main>
  );
}

export default IndexPage