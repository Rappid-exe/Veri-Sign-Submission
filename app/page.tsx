import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Upload, CheckCircle2, Shield, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="relative border-b-2 border-foreground overflow-hidden">
          <div className="absolute inset-0 blueprint-circles opacity-40" />

          <div className="container mx-auto px-4 py-24 md:py-32 relative">
            <div className="max-w-4xl">
              <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-6 border-l-2 border-foreground pl-4">
                Referred by v0.dev
              </div>

              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-balance">
                Defense<sup className="text-2xl">®</sup>
                <br />
                Intelligence
              </h1>

              <p className="text-lg md:text-xl mb-8 max-w-2xl font-mono leading-relaxed">
                Veri-Sign builds software and verification systems that give creators, analysts, and commanders the
                advantage in contested environments.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link href="/create">
                  <Button
                    size="lg"
                    className="bg-accent hover:bg-accent/90 text-foreground border-2 border-foreground font-mono uppercase tracking-widest"
                  >
                    Create Signature
                  </Button>
                </Link>
                <Link href="/verify">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-foreground font-mono uppercase tracking-widest group bg-transparent"
                  >
                    Verify Content
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="absolute top-4 right-4 font-mono text-xs uppercase tracking-widest text-muted-foreground space-y-1 hidden lg:block">
            <div className="text-right">Algorand Secured</div>
            <div className="flex gap-2 justify-end">
              <div className="w-3 h-3 bg-foreground" />
              <div className="w-3 h-3 bg-foreground" />
              <div className="w-3 h-3 bg-foreground" />
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="border-b-2 border-foreground">
          <div className="container mx-auto px-4 py-16 md:py-24">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">How It Works</h2>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-2 border-foreground p-8 bg-card">
                <div className="flex items-center justify-center w-12 h-12 bg-foreground text-background mb-6">
                  <Upload className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 uppercase tracking-tight">01. Upload</h3>
                <p className="font-mono text-sm leading-relaxed text-muted-foreground">
                  Upload your digital content. Hash is generated client-side. No data leaves your device.
                </p>
              </Card>

              <Card className="border-2 border-foreground p-8 bg-card">
                <div className="flex items-center justify-center w-12 h-12 bg-foreground text-background mb-6">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 uppercase tracking-tight">02. Approve</h3>
                <p className="font-mono text-sm leading-relaxed text-muted-foreground">
                  Connect wallet and approve transaction. Signature anchored to Algorand blockchain.
                </p>
              </Card>

              <Card className="border-2 border-foreground p-8 bg-card">
                <div className="flex items-center justify-center w-12 h-12 bg-foreground text-background mb-6">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 uppercase tracking-tight">03. Verify</h3>
                <p className="font-mono text-sm leading-relaxed text-muted-foreground">
                  Anyone can verify authenticity. Permanent proof of creation and ownership.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Verification Demo */}
        <section className="border-b-2 border-foreground bg-muted">
          <div className="container mx-auto px-4 py-16 md:py-24">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Verification Terminal</h2>

              <Card className="border-2 border-foreground bg-foreground text-background p-8 font-mono text-sm">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 bg-accent" />
                    <div className="w-3 h-3 bg-accent" />
                    <div className="w-3 h-3 bg-accent" />
                  </div>

                  <div className="text-accent">{">"} Checking file hash...</div>
                  <div className="pl-4">
                    FILE HASH: 0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069
                  </div>
                  <div className="text-accent mt-4">{">"} Querying Algorand blockchain...</div>
                  <div className="pl-4">BLOCK HEIGHT: #19392922</div>
                  <div className="pl-4">TIMESTAMP: 2025-10-17 20:44:32 UTC</div>
                  <div className="text-accent mt-4">{">"} Signature verification result:</div>
                  <div className="pl-4 text-green-400 font-bold">✓ FILE HASH MATCH: TRUE</div>
                  <div className="pl-4">CREATOR: 0xA12C...9F7E</div>
                  <div className="pl-4">STATUS: VERIFIED ✓</div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Tech Stack */}
        <section className="border-b-2 border-foreground">
          <div className="container mx-auto px-4 py-16">
            <div className="font-mono text-xs uppercase tracking-widest text-center text-muted-foreground mb-8">
              Powered By
            </div>

            <div className="flex flex-wrap justify-center items-center gap-8">
              {["Next.js", "Tailwind CSS", "AlgoKit", "Pera Wallet", "TypeScript"].map((tech) => (
                <div
                  key={tech}
                  className="border-2 border-foreground px-6 py-3 font-mono text-sm uppercase tracking-widest"
                >
                  {tech}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
