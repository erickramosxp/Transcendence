import React from 'react'
import { Ellipsis } from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { cva } from 'class-variance-authority'

import { cn } from "@/design-system/tokens/colors"
import { Button } from '@/design-system'

const dropdownContentVariants = cva(
    "min-w-[160px] rounded-md p-1 z-50 animate-in fade-in-80 zoom-in-95",
    {
        variants: {
            variant: {
                default: "bg-secondary text-secondary-foreground border border-border shadow-md",
                glass: "ds-surface-glass text-foreground",
            }
        },
        defaultVariants: {
            variant: "default"
        }
    }
)

const dropdownItemVariants = cva(
    "relative flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
    {
        variants: {
            variant: {
                default: "text-foreground focus:bg-accent focus:text-accent-foreground",
                destructive: "text-secondary-foreground focus:bg-destructive/20 focus:text-secondary-foreground/95",
            }
        },
        defaultVariants: {
            variant: "default"
        }
    }
)


/**
 * <Dropdown items="{meusItens}"/> 
 * 
 * @example
 *  <Dropdown
 *      variant = "default | glass"
 *      items={[
 *          { label: "Excluir", onClick: () => onDelete(post.id), danger: true, icon: <Icon /> },
 *      ]}
 *  />
 * 
 *  */
export const Dropdown = ({ items = [], variant = "default" }) => {

    if (items?.length === 0)
        return null;

    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
                <Button variant="ghost" size="icon" aria-label="Opções">
                    <Ellipsis size={16} />
                </Button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
                <DropdownMenu.Content
                    align="end"
                    className={cn(dropdownContentVariants({ variant }))}
                    sideOffset={0}
                >
                    {items.map((item, index) => (
                        <DropdownMenu.Item
                            key={index}
                            onSelect={item.onClick}
                            className={cn(dropdownItemVariants({
                                variant: item.danger ? "destructive" : "default"
                            }))}
                        >
                            {item.icon && (
                                <span className="flex items-center justify-center">
                                    {item.icon}
                                </span>
                            )}
                            <span>{item.label}</span>
                        </DropdownMenu.Item>
                    ))}
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    )
}