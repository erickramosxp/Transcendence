import { Button } from "@/design-system/primitives/Button"
import { ThemeToggle } from "@/design-system/components/ThemeToggle"


export function ThemeShowcase() {
  return (
    <div className="min-h-screen bg-background text-foreground p-8 space-y-10">
      <section className=" flex gap-3 space-y-4">
        <div>
          <h1 className="text-4xl font-bold">Theme Showcase</h1>
          <p className="text-muted-foreground">
            Visualização dos tokens do design system
          </p>
        </div>
        <div className="bg-accent rounded-2xl text-center p-3">
          <h3>Trocar tema: </h3>
          <ThemeToggle />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="bg-card text-card-foreground border border-border rounded-xl p-6 shadow-primary">
          <h3 className="font-bold">Card</h3>
          <p className="text-muted-foreground">Superfície padrão</p>
        </div>

        <div className="bg-popover text-popover-foreground border border-border rounded-xl p-6">
          <h3 className="font-bold">Popover</h3>
          <p className="text-muted-foreground">Menu, tooltip, dropdown</p>
        </div>

        <div className="bg-accent text-accent-foreground border border-border rounded-xl p-6">
          <h3 className="font-bold">Accent</h3>
          <p>Hover, seleção leve, item ativo</p>
        </div>
      </section>

      <section className=" bg-backgroud p-5 rounded-2xl">
        <div>
          <h3>Buttons:</h3>
        </div>
        <div className="flex flex-wrap gap-4">
          <Button>
            Default
          </Button>
          <Button variant={'destructive'}>
            Destructive
          </Button>
          <Button variant={'secondary'}>
            Secondary
          </Button>
          <Button variant={'outline'}>
            Outline
          </Button>
          <Button variant={'ghost'}>
            Ghost
          </Button>
          <Button variant={'link'}>
            Link
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl p-8 bg-gradient-main min-h-40" />
        <div className="rounded-2xl p-8 bg-glass-card border border-glass-border backdrop-blur-xl shadow-primary-strong">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-sparkle text-white mb-4">
            ✦
          </div>
          <h2 className="text-3xl font-bold bg-gradient-title bg-clip-text text-transparent">
            Videa
          </h2>
          <p className="text-muted-foreground mt-2">
            Exemplo de headline com gradient sem hardcode
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl p-4 bg-card border border-border">
          <div className="h-12 w-12 rounded-2xl bg-gradient-connect mb-3" />
          <h4 className="font-bold">Conecte-se</h4>
        </div>
        <div className="rounded-xl p-4 bg-card border border-border">
          <div className="h-12 w-12 rounded-2xl bg-gradient-chat mb-3" />
          <h4 className="font-bold">Converse</h4>
        </div>
        <div className="rounded-xl p-4 bg-card border border-border">
          <div className="h-12 w-12 rounded-2xl bg-gradient-share mb-3" />
          <h4 className="font-bold">Compartilhe</h4>
        </div>
        <div className="rounded-xl p-4 bg-card border border-border">
          <div className="h-12 w-12 rounded-2xl bg-gradient-secure mb-3" />
          <h4 className="font-bold">Seguro</h4>
        </div>
      </section>
    </div>
  )
}
