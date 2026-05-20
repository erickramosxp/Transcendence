import { BrandHeader } from "@/design-system"

export function Header() {
    return (
        <div className='pt-4 sm:pt-8 pb-2 mb-2'>
            <div className='max-w-5xl m-auto'>
                <BrandHeader size="sm" layout="inline" className="gap-1.5" />
            </div>
        </div>
    )
}