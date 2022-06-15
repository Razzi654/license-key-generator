import { ApiProperty } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsEmail, IsString, IsDate } from "class-validator";
import { isValidDate } from "src/utils/functions";

export class CreateLicenseKeyDto {
    @ApiProperty({
        type: String,
        description: "Product identifier: UUID, Power BI visual GUID, etc",
        example: {
            uuid: "5f95888a-6519-44bc-a08e-e76dda4621f1",
            visualGuid: "ClusteredStackedBarChart39ECD6FE50G",
        },
    })
    @IsString({ message: "Must be a string" })
    public readonly productId: string;

    @ApiProperty({
        type: String,
        description: "Purchaser full name",
        example: "John Fitzgerald Kennedy",
    })
    @IsString({ message: "Must be a string" })
    public readonly holderName: string;

    @ApiProperty({ type: String, description: "Purchaser e-mail", example: "user@mail.com" })
    @IsString({ message: "Must be a string" })
    @IsEmail({}, { message: "Incorrect e-mail" })
    public readonly email: string;

    @ApiProperty({
        type: String,
        description: "License key type",
        example: "Trial",
    })
    @IsString({ message: "Must be a string" })
    public readonly licenseType: string;

    @ApiProperty({
        type: Date,
        description: "License key expiration date",
        example: {
            isoDate: "2022-05-11",
            isoDateTime: "2022-05-11T10:30:28.236Z",
            timestamp: 1652265028236,
        },
    })
    @Type(() => Date)
    @Transform(({ value }) => {
        const date = new Date(value);
        return isValidDate(date) ? date : null;
    })
    @IsDate({ message: "Must be a correct date type" })
    public readonly expiryDate: Date;
}
