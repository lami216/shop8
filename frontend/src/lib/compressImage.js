import imageCompression from "browser-image-compression";

const MAX_SIZE_MB = 2;
const MIN_QUALITY = 0.5;
const QUALITY_STEP = 0.1;
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

        while (!isWithinLimit(compressed) && quality >= MIN_QUALITY) {
                compressed = await imageCompression(compressed, {
                        ...baseOptions,
                        initialQuality: quality,
                });

                quality -= QUALITY_STEP;
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
