import imageCompression from "browser-image-compression";

const DEFAULT_TARGET_MB = 2;
const AGGRESSIVE_TARGET_MB = 1;
const LARGE_IMAGE_THRESHOLD_MB = 8;
const CATEGORY_MAX_SIZE_BYTES = 3 * 1024 * 1024;
const MIN_QUALITY = 0.35;
const QUALITY_STEP = 0.1;
const MAX_ATTEMPTS = 8;
const DIMENSION_REDUCTION_STEP = 0.9;
const MIN_DIMENSION_SCALE = 0.6;

const getFileSizeInMB = (file) => file.size / 1024 / 1024;

const getImageDimensions = async (file) =>
        new Promise((resolve, reject) => {
                const url = URL.createObjectURL(file);
                const image = new Image();

                image.onload = () => {
                        resolve({ width: image.width, height: image.height });
                        URL.revokeObjectURL(url);
                };

                image.onerror = (error) => {
                        URL.revokeObjectURL(url);
                        reject(error);
                };

                image.src = url;
        });

const getTargetSize = (originalFile) => {
        const originalSize = getFileSizeInMB(originalFile);
        return originalSize >= LARGE_IMAGE_THRESHOLD_MB ? AGGRESSIVE_TARGET_MB : DEFAULT_TARGET_MB;
};

const compressFile = async (file, { maxSizeBytes, targetSizeMB } = {}) => {
        const targetSizeMBValue = targetSizeMB ?? getTargetSize(file);
        const desiredMaxBytes = maxSizeBytes ?? targetSizeMBValue * 1024 * 1024;
        const { width, height } = await getImageDimensions(file);
        const maxDimension = Math.max(width, height);

        let quality = 0.9;
        let dimensionScale = 1;
        let compressed = file;

        for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
                compressed = await imageCompression(compressed, {
                        useWebWorker: true,
                        maxSizeMB: maxSizeBytes ? undefined : targetSizeMBValue,
                        maxSizeBytes,
                        initialQuality: quality,
                        maxWidthOrHeight:
                                dimensionScale < 1 ? Math.round(maxDimension * dimensionScale) : undefined,
                });

                if (compressed.size <= desiredMaxBytes) {
                        return compressed;
                }

                if (quality > MIN_QUALITY) {
                        quality = Math.max(quality - QUALITY_STEP, MIN_QUALITY);
                        continue;
                }

                if (dimensionScale > MIN_DIMENSION_SCALE) {
                        dimensionScale = Math.max(dimensionScale * DIMENSION_REDUCTION_STEP, MIN_DIMENSION_SCALE);
                        continue;
                }
        }

        const error = new Error("Unable to compress image below desired size");
        error.code = "IMAGE_COMPRESSION_FAILED";
        throw error;
};

const convertFileToDataUrl = async (file) => imageCompression.getDataUrlFromFile(file);

export const compressFilesToDataUrls = async (files) =>
        Promise.all(
                files.map(async (file) => {
                        const processedFile = await compressFile(file);
                        return convertFileToDataUrl(processedFile);
                })
        );

export const compressCategoryImageToDataUrl = async (file) => {
        if (file.size <= CATEGORY_MAX_SIZE_BYTES) {
                return convertFileToDataUrl(file);
        }

        const compressed = await compressFile(file, { maxSizeBytes: CATEGORY_MAX_SIZE_BYTES });
        return convertFileToDataUrl(compressed);
};
