import { useContext } from 'react';
import { GroupContext } from '../context/groupContextDef';

export const useGroup = () => {
    const context = useContext(GroupContext);
    if (!context) throw new Error('useGroup must be used within a GroupProvider');
    return context;
};
