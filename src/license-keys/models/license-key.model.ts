import { ApiProperty } from "@nestjs/swagger";
import { Column, DataType, Model, Table } from "sequelize-typescript";

interface LicenseKeyCreationAttrs {
    licenseKey: string;
    expiryDate: string;
}

@Table({ tableName: "license_keys" })
export class LicenseKey extends Model<LicenseKey, LicenseKeyCreationAttrs> {
    @Column({
        type: DataType.UUID,
        unique: true,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataType.UUIDV4,
    })
    public id: string;

    @ApiProperty({
        type: DataType.TEXT,
        description: "License key token in Base64 format",
        example:
            "TG9yZW0gaXBzdW0gZG9sb3Igc2l0IGFtZXQsIGNvbnNlY3RldHVyIGFkaXBpc2NpbmcgZWxpdCwgc2VkIGRvIGVpdXNtb2QgdGVtcG9yIGluY2lkaWR1bnQgdXQgbGFib3JlLiA=",
    })
    @Column({ type: DataType.TEXT, allowNull: false, field: "license_key" })
    public licenseKey: string;

    @ApiProperty({
        type: Date,
        description: "License key expiration date",
        example: {
            isoDate: "2022-05-11",
            isoDateTime: "2022-05-11T10:30:28.236Z",
            timestamp: 1652265028236,
        },
    })
    @Column({ type: DataType.DATE, unique: false, allowNull: false, field: "expiry_date" })
    public expiryDate: Date;
}
