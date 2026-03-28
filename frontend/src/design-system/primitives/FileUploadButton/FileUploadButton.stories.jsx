import { FileUploadButton } from './FileUploadButton'
import { useState } from 'react'

export default {
    title: 'Primitives/FileUploadButton',
    component: FileUploadButton,
    parameters: {
        layout: 'centered',
    },
}


export const Playground = {
    render: (args) => {
        const [fileName, setFileName] = useState(null)

        return (
            <div className="flex flex-col items-center gap-4">
                <FileUploadButton
                    {...args}
                    onFileSelect={(file) => {
                        setFileName(file.name)
                        console.log('Arquivo selecionado:', file)
                    }}
                />

                {fileName && (
                    <p className="text-sm text-muted-foreground">
                        Selecionado: {fileName}
                    </p>
                )}
            </div>
        )
    },
}

export const ImagesOnly = {
    args: {
        accept: 'image/*',
    },
}

export const Default = {
    args: {},
}