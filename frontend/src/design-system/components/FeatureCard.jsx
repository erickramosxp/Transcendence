import { Card, CardContent } from "@/design-system/primitives/Card";
import { cn } from "@/design-system/tokens/colors";
/**
 * 
 *  os 4 cards da tela de login (Conecte-se, Converse, Compartilhe, Seguro)
 * 
 * <FeatureCard icon={<PeopleIcon />} title="Conecte-se" description="Faça amigos..." />
 */

export function FeatureCard({ icon: Icon, title, description, gradient, className }) {
    return (
        <Card
            className={cn(
                "group",
                "border-border bg-card/90 backdrop-blur-xl",
                "cursor-pointer transition-all duration-300",
                "shadow-md hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02]",
                className
            )}
        >
            <CardContent className="p-4 sm:p-6">
                <div className="flex items-start gap-3 sm:gap-4">

                    {/* Ícone com gradient */}
                    <div className={cn(
                        "inline-flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center",
                        "rounded-2xl shadow-md flex-shrink-0 transition-all duration-300",
                        "group-hover:scale-110 group-hover:rotate-12",
                        gradient
                    )}>
                        <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>

                    {/* Texto */}
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-foreground text-sm sm:text-base mb-1">
                            {title}
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                            {description}
                        </p>
                    </div>

                </div>
            </CardContent>
        </Card>
    );
}
