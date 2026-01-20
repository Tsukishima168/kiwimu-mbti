import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { MbtiResultData } from '../types';

/**
 * 生成 PDF 報告
 * 使用 html2canvas 將報告頁面轉換為圖片，再用 jsPDF 生成 PDF
 */
export async function generatePDFReport(
    resultData: MbtiResultData,
    elementId: string = 'result-content'
): Promise<void> {
    try {
        // 顯示載入提示
        const loadingToast = showLoadingToast();

        // 1. 找到要轉換的元素
        const element = document.getElementById(elementId);
        if (!element) {
            throw new Error('找不到報告內容元素');
        }

        // 2. 將元素轉換為 Canvas
        const canvas = await html2canvas(element, {
            scale: 2, // 提高解析度
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff'
        });

        // 3. 計算 PDF 尺寸
        const imgWidth = 210; // A4 寬度 (mm)
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // 4. 創建 PDF
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        // 5. 如果內容超過一頁，需要分頁
        const pageHeight = 297; // A4 高度 (mm)
        let heightLeft = imgHeight;
        let position = 0;

        // 添加第一頁
        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        // 添加後續頁面
        while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        // 6. 下載 PDF
        const fileName = `KIWIMU_${resultData.id}_性格報告.pdf`;
        pdf.save(fileName);

        // 關閉載入提示
        hideLoadingToast(loadingToast);

        // 顯示成功訊息
        showSuccessToast('PDF 報告已下載！');

        // Google Analytics 追蹤
        if (typeof gtag !== 'undefined') {
            gtag('event', 'pdf_download', {
                event_category: 'engagement',
                event_label: resultData.id,
                value: 1
            });
        }
    } catch (error) {
        console.error('PDF 生成失敗:', error);
        showErrorToast('抱歉，PDF 生成失敗，請稍後再試');
    }
}

/**
 * 顯示載入 Toast
 */
function showLoadingToast(): HTMLDivElement {
    const toast = document.createElement('div');
    toast.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-blue-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2';
    toast.innerHTML = `
    <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <span class="font-medium">正在生成 PDF...</span>
  `;
    document.body.appendChild(toast);
    return toast;
}

/**
 * 隱藏載入 Toast
 */
function hideLoadingToast(toast: HTMLDivElement): void {
    toast.remove();
}

/**
 * 顯示成功 Toast
 */
function showSuccessToast(message: string): void {
    const toast = document.createElement('div');
    toast.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 animate-fade-in';
    toast.innerHTML = `
    <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
    </svg>
    <span class="font-medium">${message}</span>
  `;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

/**
 * 顯示錯誤 Toast
 */
function showErrorToast(message: string): void {
    const toast = document.createElement('div');
    toast.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 animate-fade-in';
    toast.innerHTML = `
    <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
    <span class="font-medium">${message}</span>
  `;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}
