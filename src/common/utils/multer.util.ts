import { Request } from "express";
import { mkdirSync } from "fs";
import { extname, join } from "path";
import { ValidationMessage } from "../enums/message.enum";
import { BadRequestException } from "@nestjs/common";
import { diskStorage } from "multer";
export type callbackDestination = (error: Error | null, destination: string) => void;
export type callbackFileName = (error: Error | null, filename: string) => void;
export type multerType = Express.Multer.File
export function multerDestination(fieldName: string) {
    return function (req: Request, file: multerType, callback: callbackDestination): void {
        let path = join("public", "uploads", fieldName);
        mkdirSync(path, { recursive: true });
        callback(null, path);
    }
}
export function multerFilename(fieldName: string) {
    return function (req: Request, file: multerType, callback: callbackFileName): void {
        const ext = extname(file.originalname).toLowerCase();
        if (!isValidImageFormat(ext)) {
            callback(new BadRequestException(ValidationMessage.InValidImageFormat, { description: file.fieldname }), null);
        } else {
            const filename = `${fieldName}_${Date.now()}${ext}`
            callback(null, filename);
        }
    }
}

export function multerStorage(folderName: string,fileName: string) {
    return diskStorage({
        destination: multerDestination(folderName),
        filename: multerFilename(fileName)
    })
}

function isValidImageFormat(ext: string) {
    return [".png", ".jpg", ".jpeg"].includes(ext)

}