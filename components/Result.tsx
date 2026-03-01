import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import ResultCardFlow from './ResultCardFlow';
import ResultLegacyDump from './ResultLegacyDump';
import { User } from 'firebase/auth';
import { MbtiResultData, Score } from '../types';
import { getResultData } from '../constants';
import { getVariant } from '../utils/logic';

interface ResultProps {
    resultData: MbtiResultData;
    rawScores: Score;
    onRetest: () => void;
    onOpenConsultant: () => void;
    onViewArchive?: () => void;
    isArchiveMode?: boolean;
    user?: User | null;
    onLogin?: () => void;
    onLogout?: () => void;
    isSharedView?: boolean;
}

const Result: React.FC<ResultProps> = (props) => {
    const { language } = useLanguage();

    // If language is zh-TW (or zh), use the legacy V1 design and content
    if (language === 'zh-TW' || language === 'zh') {
        // Force V1 content from constants.ts to ensure "V1 content" requirement
        const variant = getVariant(props.rawScores);
        const v1Data = getResultData(props.resultData.id, variant);
        return <ResultLegacyDump {...props} resultData={v1Data} isSharedView={props.isSharedView} />;
    }

    // Otherwise, use the new V2 story-like design
    return <ResultCardFlow {...props} />;
};

export default Result;
