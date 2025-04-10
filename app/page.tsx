import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-bold">
            <div className="rounded-full bg-teal-600 p-1.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5 text-white"
              >
                <path d="M2 17h2v4h-2z" />
                <path d="M6 17h2v4H6z" />
                <path d="M10 17h2v4h-2z" />
                <path d="M14 17h2v4h-2z" />
                <path d="M18 17h2v4h-2z" />
                <path d="M4 21h16" />
                <path d="M4 3h16" />
                <path d="M12 21v-9" />
                <path d="M12 12V7" />
                <path d="M12 7H8" />
                <path d="M12 7h4" />
              </svg>
            </div>
            <span>FinanceFlow</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-teal-600"
            >
              Login
            </Link>
            <Button asChild size="sm" className="bg-teal-600 hover:bg-teal-700">
              <Link href="/register">Register</Link>
            </Button>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">Banking made simple</h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    Manage your finances with ease. Check balances, transfer funds, and track transactions all in one
                    place.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg" className="bg-teal-600 hover:bg-teal-700">
                    <Link href="/register">
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/login">Login</Link>
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative h-[350px] w-full max-w-[500px] rounded-lg bg-gradient-to-br from-teal-100 to-teal-50 p-6 shadow-lg">
                  <div className="absolute right-6 top-6 rounded-full bg-teal-600/10 px-2 py-1 text-xs font-medium">
                    Demo
                  </div>
                  <div className="mb-6 space-y-2">
                    <div className="h-4 w-24 rounded bg-teal-200" />
                    <div className="h-8 w-40 rounded bg-teal-300" />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-md bg-background p-3 shadow-sm">
                      <div className="space-y-1">
                        <div className="h-4 w-20 rounded bg-muted" />
                        <div className="h-3 w-16 rounded bg-muted" />
                      </div>
                      <div className="h-6 w-16 rounded bg-muted" />
                    </div>
                    <div className="flex items-center justify-between rounded-md bg-background p-3 shadow-sm">
                      <div className="space-y-1">
                        <div className="h-4 w-24 rounded bg-muted" />
                        <div className="h-3 w-20 rounded bg-muted" />
                      </div>
                      <div className="h-6 w-16 rounded bg-muted" />
                    </div>
                    <div className="flex items-center justify-between rounded-md bg-background p-3 shadow-sm">
                      <div className="space-y-1">
                        <div className="h-4 w-28 rounded bg-muted" />
                        <div className="h-3 w-24 rounded bg-muted" />
                      </div>
                      <div className="h-6 w-16 rounded bg-muted" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full bg-muted/50 py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Features</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Everything you need</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our platform provides all the essential banking features in a simple, intuitive interface.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-3">
              <div className="rounded-lg border bg-card p-6 shadow-sm">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-teal-100">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 text-teal-600"
                  >
                    <circle cx="8" cy="21" r="1" />
                    <circle cx="19" cy="21" r="1" />
                    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                  </svg>
                </div>
                <h3 className="mb-2 text-xl font-bold">Easy Transfers</h3>
                <p className="text-sm text-muted-foreground">
                  Transfer money between accounts with just a few clicks. Fast, secure, and hassle-free.
                </p>
              </div>
              <div className="rounded-lg border bg-card p-6 shadow-sm">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-teal-100">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 text-teal-600"
                  >
                    <path d="M12 2v20" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </div>
                <h3 className="mb-2 text-xl font-bold">Track Finances</h3>
                <p className="text-sm text-muted-foreground">
                  Monitor your transactions and account balance in real-time. Stay on top of your finances.
                </p>
              </div>
              <div className="rounded-lg border bg-card p-6 shadow-sm">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-teal-100">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 text-teal-600"
                  >
                    <rect width="20" height="14" x="2" y="5" rx="2" />
                    <line x1="2" x2="22" y1="10" y2="10" />
                  </svg>
                </div>
                <h3 className="mb-2 text-xl font-bold">Secure Banking</h3>
                <p className="text-sm text-muted-foreground">
                  Bank with confidence knowing your data is protected with industry-leading security measures.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} FinanceFlow. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link href="#" className="hover:underline">
              Terms
            </Link>
            <Link href="#" className="hover:underline">
              Privacy
            </Link>
            <Link href="#" className="hover:underline">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
