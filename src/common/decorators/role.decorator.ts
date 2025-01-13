import { SetMetadata } from "@nestjs/common"
import { Roles } from "../enums/role.snum"

export const ROLE_KEY = "ROLES"
export const CanAccess = (...roles: Roles[])=> SetMetadata(ROLE_KEY,roles)