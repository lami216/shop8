import imageCompression from "browser-image-compression";

const MAX_SIZE_MB = 2;
const MIN_QUALITY = 0.4;
const QUALITY_STEP = 0.1;
const MAX_COMPRESSION_ATTEMPTS = 5;
const baseOptions = {
        maxSizeMB: MAX_SIZE_MB,
        initialQuality: 0.85,
        useWebWorker: true,
};

const isWithinLimit = (file) => file.size / 1024 / 1024 <= MAX_SIZE_MB;

const compressFile = async (file) => {
        if (isWithinLimit(file)) {
                return file;
        }

        let quality = baseOptions.initialQuality;
        let compressed = file;
        let attempts = 0;

        while (!isWithinLimit(compressed) && attempts < MAX_COMPRESSION_ATTEMPTS) {
                compressed = await imageCompression(compressed, {
                        ...baseOptions,
                        initialQuality: quality,
                });

                quality = Math.max(quality - QUALITY_STEP, MIN_QUALITY);
                attempts += 1;
        }

        if (!isWithinLimit(compressed)) {
                compressed = await imageCompression(compressed, {
                        ...baseOptions,
                        maxSizeMB: MAX_SIZE_MB,
                        maxWidthOrHeight: 1920,
                        initialQuality: MIN_QUALITY,
                });
        }

        if (!isWithinLimit(compressed)) {
                throw new Error("Unable to compress image below 2MB");
        }

        return compressed;
};

const convertFileToDataUrl = async (file) =>
        imageCompression.getDataUrlFromFile(file);

export const compressFilesToDataUrls = async (files) =>
        Promise.all(
                files.map(async (file) => {
                        const processedFile = await compressFile(file);
                        return convertFileToDataUrl(processedFile);
                })
        );

const CATEGORY_MAX_ORIGINAL_MB = 3;
const CATEGORY_TARGET_MB = 1;
const CATEGORY_MIN_QUALITY = 0.4;
const CATEGORY_QUALITY_STEP = 0.1;
const CATEGORY_MAX_ATTEMPTS = 6;

const getFileSizeInMB = (file) => file.size / 1024 / 1024;

export const compressCategoryImageToDataUrl = async (file) => {
        if (getFileSizeInMB(file) > CATEGORY_MAX_ORIGINAL_MB) {
                const error = new Error("Category image exceeds 3MB");
                error.code = "CATEGORY_IMAGE_TOO_LARGE";
                throw error;
        }

        if (getFileSizeInMB(file) <= CATEGORY_TARGET_MB) {
                return convertFileToDataUrl(file);
        }

        let quality = 0.9;

        for (let attempt = 0; attempt < CATEGORY_MAX_ATTEMPTS; attempt += 1) {
                const compressedCandidate = await imageCompression(file, {
                        useWebWorker: true,
                        maxSizeMB: CATEGORY_TARGET_MB,
                        initialQuality: quality,
                });

                if (getFileSizeInMB(compressedCandidate) <= CATEGORY_TARGET_MB) {
                        return convertFileToDataUrl(compressedCandidate);
                }

                if (quality <= CATEGORY_MIN_QUALITY) {
                        break;
                }

                quality = Math.max(quality - CATEGORY_QUALITY_STEP, CATEGORY_MIN_QUALITY);
        }

        const error = new Error("Unable to compress category image below 1MB");
        error.code = "CATEGORY_IMAGE_COMPRESSION_FAILED";
        throw error;
};
