import type { AppUser } from '../../types';
import { MbtiResultData, Score } from '../../types';
import type { PassportLoginUiOptions } from '../../utils/authStorage';

export interface CardProps {
    resultData: MbtiResultData;
    rawScores: Score;
    percentages: { E: number; I: number; S: number; N: number; T: number; F: number; J: number; P: number; A: number; Turbulent: number };
    identitySuffix: 'A' | 'T';
    identityLabel: string;
    t: any;
    i18nContent: any;
    extraI18n: any;
    displayKeywords: string[];
    user?: AppUser | null;
    onNext?: () => void;
    onPrev?: () => void;
    onSkipRegistration?: () => void;
    onLogin?: (options?: PassportLoginUiOptions) => void;
    isArchiveMode?: boolean;
}
