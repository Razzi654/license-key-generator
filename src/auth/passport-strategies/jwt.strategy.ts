import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";
import { JwtPayload } from "src/utils/interfaces";
import { isUUID } from "class-validator";
import { ExceptionResponse } from "src/util-classes/exception-response.util";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    public constructor() {
        const { JWT_SECRET } = process.env;
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: JWT_SECRET,
        });
    }

    public async validate({ accountId }: JwtPayload): Promise<boolean> {
        if (!accountId || !isUUID(accountId, 4)) {
            ExceptionResponse.badRequest("Invalid auth token");
        }
        return true;
    }
}
