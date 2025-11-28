import imageCompression from "browser-image-compression";

const MAX_SIZE_KB = 1400;
const MIN_SIZE_KB = 200;
const baseOptions = {
        maxSizeMB: MAX_SIZE_KB / 1024,
        initialQuality: 0.85,
        useWebWorker: true,
};

const getSizeInKB = (file) => file.size / 1024;

const compressFile = async (file) => {
        const sizeInKB = getSizeInKB(file);
        if (sizeInKB <= MIN_SIZE_KB) {
                return file;
        }

        const compressed = await imageCompression(file, baseOptions);
        if (getSizeInKB(compressed) < MIN_SIZE_KB) {
                return file;
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
