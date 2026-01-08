import type { UserListItem } from "./user-list-item.interface";

export interface FindAllResult {
    users: UserListItem[];
    total: number;
    page: number;
    limit: number;
}