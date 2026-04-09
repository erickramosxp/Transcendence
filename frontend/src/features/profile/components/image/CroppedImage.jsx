import React, { useState } from 'react'
import Cropper from 'react-easy-crop'
import { Button } from '@/design-system'
import { getCroppedImage } from '@/features/profile/utils/imageCrop'

// // Avatar — círculo, 1:1
// <CroppedImage
//   cropShape="round"
//   aspect={1}
//   onSave={handleAvatarSave}
// />

// // Cover — retângulo, 3:1, zoom livre
// <CroppedImage
//   cropShape="rect"
//   aspect={3 / 1}
//   onSave={handleCoverSave}
// />

export const CroppedImage = ({ image, cropShape = 'rect', aspect = 1, setNewImage, onClose, ...props }) => {

    const [crop, onCropChange] = useState({ x: 0, y: 0 })
    const [zoom, onZoomChange] = useState(1);
    const [croppedPixel, setCroppedPixel] = useState(null);

    const onCropComplete = (croppedArea, croppedAreaPixels) => {
        setCroppedPixel(croppedAreaPixels);
    }

    const onSave = async () => {

        try {
            
            const { url, file } = await getCroppedImage(image, croppedPixel);
            setNewImage(file);
        } finally {

            onClose(null);
        }
    }

    return (
        <div {...props} className='flex  flex-col w-full h-full bg-card border border-border rounded'>
            <div className="relative flex-1 rounded">
                <Cropper
                    image={image}
                    crop={crop}
                    zoom={zoom}
                    cropShape={cropShape}
                    aspect={aspect}
                    onCropChange={onCropChange}
                    onZoomChange={onZoomChange}
                    onCropComplete={onCropComplete}
                />

            </div>
            <div className="flex items-center justify-center gap-8 p-4 h-16 shrink-0 bg-card/50">
                <input
                    type="range"
                    value={zoom}
                    min={1}
                    max={3}
                    step={0.1}
                    aria-labelledby="Zoom"
                    onChange={(e) => {
                        onZoomChange(Number(e.target.value))
                    }}
                    className="w-1/2 cursor-pointer"
                />
                <Button onClick={() => onSave()}>
                    Salvar
                </Button>
            </div>

        </div>
    )
}