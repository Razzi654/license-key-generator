import { ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { IS_PUBLIC_ENDPOINT } from "src/utils/constants";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
    public constructor(private readonly reflector: Reflector) {
        super();
    }

    public canActivate(context: ExecutionContext) {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_ENDPOINT, [
            context.getHandler(),
            context.getClass(),
        ]);

        return isPublic || super.canActivate(context);
    }
}
