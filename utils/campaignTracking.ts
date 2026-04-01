interface CampaignData {
    source: string;
    campaign: string;
    medium: string;
    content: string;
    month?: string;
    location?: string;
}

export function getCampaignData(): CampaignData | null {
    if (typeof window === 'undefined') return null;

    const params = new URLSearchParams(window.location.search);

    // 檢查是否有活動參數
    if (!params.has('source') || !params.has('campaign')) {
        return null;
    }

    return {
        source: params.get('source') || '',
        campaign: params.get('campaign') || '',
        medium: params.get('medium') || '',
        content: params.get('content') || '',
        month: params.get('month') || undefined,
        location: params.get('location') || undefined
    };
}

export function isFromStore(): boolean {
    const campaign = getCampaignData();
    return campaign?.source === 'poster' || campaign?.source === 'dm';
}

export function getMonthlyPromo(): string | null {
    const campaign = getCampaignData();

    if (!campaign) return null;

    // 2月：8折
    if (campaign.month === 'feb' || campaign.content.includes('cny')) {
        return '8折優惠券（2月限定）';
    }

    // 3月：9折 + 櫻花拿鐵
    if (campaign.month === 'mar' || campaign.content.includes('spring')) {
        return '9折優惠 + 櫻花拿鐵券';
    }

    // 4月：VIP 招募
    if (campaign.month === 'apr' || campaign.content.includes('vip')) {
        return '終身 VIP 早鳥優惠';
    }

    return null;
}

export function trackCampaignEntry(campaign: CampaignData) {
    if (typeof gtag === 'undefined') return;

    // 追蹤活動進入
    gtag('event', 'campaign_entry', {
        campaign_source: campaign.source,
        campaign_name: campaign.campaign,
        campaign_medium: campaign.medium,
        campaign_content: campaign.content,
        campaign_month: campaign.month || 'unknown',
        campaign_location: campaign.location || 'unknown'
    });

    // 設定用戶屬性
    gtag('set', 'user_properties', {
        campaign_source: campaign.source,
        campaign_month: campaign.month || 'unknown'
    });

    // 儲存到 localStorage（用於後續頁面）
    try {
        localStorage.setItem('campaign_data', JSON.stringify(campaign));
    } catch (e) {
        console.error('Failed to save campaign data', e);
    }
}

export function trackQuizComplete() {
    const campaign = getCampaignData();

    if (typeof gtag === 'undefined') return;

    gtag('event', 'quiz_completion', {
        campaign_source: campaign?.source || 'organic',
        campaign_content: campaign?.content || 'none',
        campaign_month: campaign?.month || 'unknown',
        value: 1
    });
}

export function trackStoreReward() {
    const campaign = getCampaignData();

    if (typeof gtag === 'undefined') return;

    gtag('event', 'store_reward_generated', {
        campaign_source: campaign?.source,
        campaign_location: campaign?.location,
        campaign_month: campaign?.month,
        value: 1
    });
}
