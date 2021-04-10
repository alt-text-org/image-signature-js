export as namespace image_signature
export = image_signature

declare namespace image_signature {
    function generate(image: ImageBitmap, lowerCropPercentile: number, upperCropPercentile: number): any
    function distance(sig1, sig2): number
}