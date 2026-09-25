import liff from '@line/liff';

const liffId = import.meta.env.VITE_LINE_LIFF_ID;

export const initLiff = async () => {
    if (!liffId) {
        console.warn('VITE_LINE_LIFF_ID is not set in environment variables');
        return false;
    }
    try {
        await liff.init({ liffId });
        console.log('LIFF initialized successfully.');
        return true;
    } catch (err) {
        console.error('LIFF initialization failed', err);
        return false;
    }
};

/**
 * Triggers the LINE Share Target Picker.
 * @param {string} mbtiType - The user's MBTI result (e.g., INFP)
 * @param {string} dessertTitle - The recommended dessert name
 * @returns {Promise<boolean>} - True if shared successfully, false otherwise.
 */
export const shareResultToLine = async (mbtiType: string, dessertTitle: string): Promise<boolean> => {
    if (!liff.isLoggedIn()) {
        // For shareTargetPicker to work in external browser, user might need to login,
        // but usually this is used inside the LINE in-app browser where login is automatic.
        console.warn("LIFF is not logged in. shareTargetPicker may fail if not in LINE app.");
    }

    if (!liff.isApiAvailable('shareTargetPicker')) {
        console.warn('shareTargetPicker is not available in this environment.');
        // Fallback could be handled by the caller, e.g. copying a link
        return false;
    }

    // R7: mbti.kiwimu.com does not resolve (no DNS record) — link to the real,
    // existing kiwimu.com route instead. `from` lets the landing site's
    // kw_attr cookie (R4) record that this visit came from a LINE share.
    const siteUrl = 'https://kiwimu.com/?from=mbti_line_share';

    const flexMessage = {
        type: "flex" as const,
        altText: `我測出了專屬的靈魂甜點，你也來試試！`,
        contents: {
            type: "bubble" as const,
            size: "kilo" as const,
            hero: {
                type: "image" as const,
                // R7: /assets/og-image-mbti.png does not exist (SPA fallback returns
                // index.html, not an image) — reuse index.html's working og:image.
                url: "https://res.cloudinary.com/dvizdsv4m/image/upload/v1771485556/index-image-2_prd43w.png",
                size: "full" as const,
                aspectRatio: "20:13" as const,
                aspectMode: "cover" as const,
                action: {
                    type: "uri" as const,
                    label: "Open Link",
                    uri: siteUrl
                }
            },
            body: {
                type: "box" as const,
                layout: "vertical" as const,
                contents: [
                    {
                        type: "text" as const,
                        text: `我的專屬甜點是`,
                        weight: "bold" as const,
                        color: "#888888",
                        size: "sm" as const
                    },
                    {
                        type: "text" as const,
                        text: dessertTitle,
                        weight: "bold" as const,
                        size: "xl" as const,
                        margin: "md" as const,
                        wrap: true
                    },
                    {
                        type: "text" as const,
                        text: `MBTI: ${mbtiType}`,
                        size: "sm" as const,
                        color: "#aaaaaa",
                        wrap: true,
                        margin: "sm" as const
                    }
                ]
            },
            footer: {
                type: "box" as const,
                layout: "vertical" as const,
                spacing: "sm" as const,
                contents: [
                    {
                        type: "button" as const,
                        style: "primary" as const,
                        color: "#dbb589",
                        height: "sm" as const,
                        action: {
                            type: "uri" as const,
                            label: "我也要測測看",
                            uri: siteUrl
                        }
                    }
                ],
                flex: 0
            }
        }
    };

    try {
        const res = await liff.shareTargetPicker([flexMessage]);
        if (res) {
            console.log('Flex message sent successfully');
            return true;
        } else {
            console.log('User cancelled share target picker');
            return false;
        }
    } catch (error) {
        console.error('Error sharing target picker', error);
        return false;
    }
};
