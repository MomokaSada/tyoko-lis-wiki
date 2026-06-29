import { ActorRole } from "./actor";

export type User = {
    id: number;
    name: string;
    role: ActorRole;
    isActive: boolean;
}