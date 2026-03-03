import { createContext } from 'react';
import type { GroupDto } from '../types/group.types';

export interface GroupContextType {
    group: GroupDto | null;
    hasGroup: boolean;
    groupLoading: boolean;
    refetchGroup: () => Promise<void>;
}

export const GroupContext = createContext<GroupContextType | undefined>(undefined);
