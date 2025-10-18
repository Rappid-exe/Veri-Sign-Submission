export function Footer() {
  return (
    <footer className="border-t-2 border-foreground bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            © 2025 Veri-Sign. All systems operational.
          </div>

          <div className="flex items-center gap-6 font-mono text-xs uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>Network Status: Online</span>
            </div>
            <div className="text-muted-foreground">Algorand TestNet</div>
          </div>
        </div>
      </div>

      <div className="checkered-pattern h-4" />
    </footer>
  )
}
