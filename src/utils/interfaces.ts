import { HttpStatus } from "@nestjs/common";

//#region Dependency interfaces
export interface CreateKeyTokenDto {
    readonly visual_id: string;
    readonly holder_name: string;
    readonly email: string;
    readonly license_type: string;
    readonly expiry_date: string | number | Date;
}

export interface GetKeyTokenDto {
    readonly id: string;
    readonly key_token: string;
}
//#endregion

//#region Common
export interface HttpError {
    statusCode: HttpStatus;
    error: string;
    message: string[];
}

export interface JwtPayload {
    accountId: string;
}

export interface AccessToken {
    accessToken: string;
}
//#endregion
