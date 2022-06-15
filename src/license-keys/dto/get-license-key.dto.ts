import { ApiProperty } from "@nestjs/swagger";

export class GetLicenseKeyDto {
    @ApiProperty({
        type: String,
        description: "Purchaser UUID",
        example: "beacc472-1b6b-4d1d-b26b-77a384ab8330",
    })
    public readonly id: string;

    @ApiProperty({
        type: String,
        description: "License key token in Base64 format",
        example:
            "TG9yZW0gaXBzdW0gZG9sb3Igc2l0IGFtZXQsIGNvbnNlY3RldHVyIGFkaXBpc2NpbmcgZWxpdCwgc2VkIGRvIGVpdXNtb2QgdGVtcG9yIGluY2lkaWR1bnQgdXQgbGFib3JlLiA=",
    })
    public readonly licenseKey: string;
}
