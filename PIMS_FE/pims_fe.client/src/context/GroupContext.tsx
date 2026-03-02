import React, { useState, useEffect, useCallback, type ReactNode } from 'react';
import type { GroupDto } from '../types/group.types';
import { groupService } from '../services/groupService';
import { GroupContext } from './groupContextDef';

export const GroupProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [group, setGroup] = useState<GroupDto | null>(null);
    const [groupLoading, setGroupLoading] = useState(true);

    const fetchGroup = useCallback(async () => {
        try {
            setGroupLoading(true);
            const response = await groupService.getMyGroup();
            if (response.success && response.data) {
                setGroup(response.data);
            } else {
                setGroup(null);
            }
        } catch {
            setGroup(null);
        } finally {
            setGroupLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchGroup();
    }, [fetchGroup]);

    return (
        <GroupContext.Provider value={{ group, hasGroup: !!group, groupLoading, refetchGroup: fetchGroup }}>
            {children}
        </GroupContext.Provider>
    );
};
