import imageCompression from "browser-image-compression";

const DEFAULT_TARGET_MB = 2;
const AGGRESSIVE_TARGET_MB = 1;
const LARGE_IMAGE_THRESHOLD_MB = 8;
const CATEGORY_MAX_SIZE_BYTES = 3 * 1024 * 1024;
const DIMENSION_STEPS = [2000, 1600, 1280, 1024, 900, 800];
const QUALITY_STEPS = [0.9, 0.85, 0.8, 0.75, 0.7, 0.65, 0.6, 0.55, 0.5];

const getFileSizeInMB = (file) => file.size / 1024 / 1024;

const getTargetSize = (originalFile) => {
        const originalSize = getFileSizeInMB(originalFile);
        return originalSize >= LARGE_IMAGE_THRESHOLD_MB ? AGGRESSIVE_TARGET_MB : DEFAULT_TARGET_MB;
};

const compressFileWithDefaults = async (file, { maxSizeBytes, targetSizeMB } = {}) => {
        const targetSizeMBValue = targetSizeMB ?? getTargetSize(file);
        return imageCompression(file, {
                useWebWorker: true,
                maxSizeMB: maxSizeBytes ? undefined : targetSizeMBValue,
                maxSizeBytes,
        });
};

const readFileAsDataUrl = async (file) =>
        new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = (error) => reject(error);
                reader.readAsDataURL(file);
        });

const loadImageFromFile = async (file) => {
        const dataUrl = await readFileAsDataUrl(file);

        return new Promise((resolve, reject) => {
                const image = new Image();
                image.onload = () => resolve(image);
                image.onerror = (error) => reject(error);
                image.src = dataUrl;
        });
};

const detectPreferredImageType = () => {
        const canvas = document.createElement("canvas");
        const webpDataUrl = canvas.toDataURL("image/webp", 0.5);
        if (webpDataUrl.startsWith("data:image/webp")) {
                return "image/webp";
        }
        return "image/jpeg";
};

const blobToDataUrl = async (blob) =>
        new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = (error) => reject(error);
                reader.readAsDataURL(blob);
        });

const createCompressedBlob = async (image, maxDimension, quality, mimeType) => {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        const maxSide = Math.max(image.width, image.height);
        const scale = maxSide > maxDimension ? maxDimension / maxSide : 1;
        const width = Math.round(image.width * scale);
        const height = Math.round(image.height * scale);

        canvas.width = width;
        canvas.height = height;
        context.drawImage(image, 0, 0, width, height);

        return new Promise((resolve, reject) => {
                canvas.toBlob(
                        (blob) => {
                                if (!blob) {
                                        reject(new Error("Unable to create compressed blob"));
                                        return;
                                }
                                resolve(blob);
                        },
                        mimeType,
                        quality
                );
        });
};

export const compressFilesToDataUrls = async (files) =>
        Promise.all(
                files.map(async (file) => {
                        const processedFile = await compressFileWithDefaults(file);
                        return imageCompression.getDataUrlFromFile(processedFile);
                })
        );

export const compressCategoryImageToDataUrl = async (file) => {
        const preferredType = detectPreferredImageType();
        const originalSize = file.size;
        const image = await loadImageFromFile(file);

        for (const maxDimension of DIMENSION_STEPS) {
                for (const quality of QUALITY_STEPS) {
                        const blob = await createCompressedBlob(image, maxDimension, quality, preferredType);

                        if (blob.size <= CATEGORY_MAX_SIZE_BYTES) {
                                const dataUrl = await blobToDataUrl(blob);
                                return { dataUrl, compressedSize: blob.size, originalSize };
                        }
                }
        }

        const error = new Error(
                "الصورة كبيرة جدًا ولا يمكن ضغطها دون فقدان مبالغ فيه في الجودة. يرجى استخدام صورة أصغر."
        );
        error.code = "CATEGORY_IMAGE_TOO_LARGE";
        throw error;
};
