import { FileInterceptor } from "@nestjs/platform-express";
import { multerStorage } from "../utils/multer.util";

export function Uploadfile(feildName:string, folderName: string) {
    return class UloadUtility extends FileInterceptor(
        feildName,
        {
            storage: multerStorage(folderName,feildName),
        }
    ){
    }
}