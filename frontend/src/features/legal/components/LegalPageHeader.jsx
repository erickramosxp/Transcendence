import React from "react"

export function LegalPageHeader({title, description, icon: Icon}) {

    return (
        <div className='flex items-center justify-between mt-4 mb-3'>
            <div>
                <h2>{title}</h2>
                <p className='text-sm text-muted-foreground'>{description}</p>
            </div>
            <div className='flex justify-center items-center bg-accent h-10 w-10 rounded-sm shadow-md'>
                {Icon}
            </div>
        </div>
    )
}