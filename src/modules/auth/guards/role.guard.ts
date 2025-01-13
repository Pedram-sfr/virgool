import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";
import { Observable } from "rxjs";
import { ROLE_KEY } from "src/common/decorators/role.decorator";
import { Roles } from "src/common/enums/role.snum";

@Injectable()
export class RoleGuard implements CanActivate {
    constructor(
        private reflector: Reflector
    ) { }
    canActivate(context: ExecutionContext) {
        const requiredRoles = this.reflector.getAllAndOverride<Roles[]>(ROLE_KEY,
            [
                context.getHandler(),
                context.getClass()
            ])
        if (!requiredRoles || requiredRoles.length == 0)
            return true

        const req: Request = context.switchToHttp().getRequest<Request>();
        const user = req.user;
        const userRole = user?.role || Roles.User;
        if(userRole === Roles.Admin)
            return true;
        if(requiredRoles.includes(userRole as Roles))
            return true;
        throw new ForbiddenException();
    }
}