import { multerType } from "src/common/utils/multer.util"

export type ProfileImageType = {
    image_profile: multerType[],
    bg_image: multerType[]
}