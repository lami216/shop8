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
