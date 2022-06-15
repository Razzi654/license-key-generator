import { SetMetadata } from "@nestjs/common";
import { IS_PUBLIC_ENDPOINT } from "./constants";

export const Public = () => SetMetadata(IS_PUBLIC_ENDPOINT, true);
