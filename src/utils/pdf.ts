import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { ShoppingItem, IngredientCategory } from '@/types';
import { INGREDIENT_CATEGORY_LABELS } from '@/types';
import { groupByCategory, formatAmount } from './ingredient';

export const generateShoppingListPDF = async (
  items: ShoppingItem[],
  title: string = '购物清单',
  subtitle?: string
): Promise<void> => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  const groupedItems = groupByCategory(items.filter((i) => !i.checked));
  const categories = Object.keys(groupedItems) as IngredientCategory[];

  let y = margin + 10;

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(20);
  pdf.setTextColor(45, 90, 39);
  pdf.text(title, margin, y);
  y += 8;

  if (subtitle) {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(11);
    pdf.setTextColor(120, 120, 120);
    pdf.text(subtitle, margin, y);
    y += 6;
  }

  pdf.setDrawColor(220, 210, 190);
  pdf.setLineWidth(0.5);
  pdf.line(margin, y, pageWidth - margin, y);
  y += 10;

  const totalItems = items.filter((i) => !i.checked).length;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.setTextColor(100, 100, 100);
  pdf.text(`共 ${totalItems} 项待购`, margin, y);
  y += 8;

  categories.forEach((category, catIndex) => {
    const categoryItems = groupedItems[category];
    if (!categoryItems || categoryItems.length === 0) return;

    if (y > pageHeight - margin - 30) {
      pdf.addPage();
      y = margin + 10;
    }

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(13);
    pdf.setTextColor(45, 90, 39);
    pdf.text(
      `${INGREDIENT_CATEGORY_LABELS[category]} (${categoryItems.length})`,
      margin,
      y
    );
    y += 3;

    pdf.setDrawColor(200, 220, 200);
    pdf.setLineWidth(0.3);
    pdf.line(margin, y, pageWidth - margin, y);
    y += 7;

    categoryItems.forEach((item, index) => {
      if (y > pageHeight - margin - 20) {
        pdf.addPage();
        y = margin + 10;
      }

      const boxSize = 5;
      pdf.setDrawColor(180, 180, 180);
      pdf.setLineWidth(0.5);
      pdf.rect(margin, y - 4, boxSize, boxSize);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(11);
      pdf.setTextColor(60, 60, 60);
      pdf.text(item.name, margin + 10, y);

      const amountText = formatAmount(item.totalAmount, item.unit);
      const amountWidth = pdf.getTextWidth(amountText);
      pdf.text(amountText, pageWidth - margin - amountWidth, y);

      y += 8;
    });

    if (catIndex < categories.length - 1) {
      y += 4;
    }
  });

  pdf.setFont('helvetica', 'italic');
  pdf.setFontSize(9);
  pdf.setTextColor(150, 150, 150);
  const footerText = '家庭菜单计划 · 购物清单';
  const footerWidth = pdf.getTextWidth(footerText);
  pdf.text(footerText, (pageWidth - footerWidth) / 2, pageHeight - margin);

  pdf.save(`${title}.pdf`);
};

export const printShoppingList = (items: ShoppingItem[]): void => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const groupedItems = groupByCategory(items.filter((i) => !i.checked));
  const categories = Object.keys(groupedItems) as IngredientCategory[];
  const totalItems = items.filter((i) => !i.checked).length;

  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>购物清单</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Noto Sans SC", sans-serif;
          padding: 30px;
          color: #333;
          line-height: 1.6;
        }
        h1 {
          font-size: 24px;
          color: #2D5A27;
          margin-bottom: 5px;
        }
        .subtitle {
          color: #999;
          font-size: 14px;
          margin-bottom: 20px;
        }
        .divider {
          border-top: 1px solid #e0d8c8;
          margin: 15px 0;
        }
        .total {
          color: #666;
          font-size: 13px;
          margin-bottom: 20px;
        }
        .category {
          margin-bottom: 20px;
        }
        .category h2 {
          font-size: 16px;
          color: #2D5A27;
          margin-bottom: 8px;
          padding-bottom: 4px;
          border-bottom: 1px solid #d0e0d0;
        }
        .item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 6px 0;
          border-bottom: 1px dashed #eee;
        }
        .item-checkbox {
          width: 16px;
          height: 16px;
          border: 1.5px solid #ccc;
          border-radius: 3px;
          display: inline-block;
          margin-right: 10px;
          vertical-align: middle;
        }
        .item-name {
          flex: 1;
          font-size: 14px;
        }
        .item-amount {
          color: #666;
          font-size: 13px;
        }
        @media print {
          body { padding: 0; }
        }
      </style>
    </head>
    <body>
      <h1>🛒 购物清单</h1>
      <p class="subtitle">家庭菜单计划生成</p>
      <div class="divider"></div>
      <p class="total">共 ${totalItems} 项待购</p>
  `;

  categories.forEach((category) => {
    const categoryItems = groupedItems[category];
    if (!categoryItems || categoryItems.length === 0) return;

    html += `
      <div class="category">
        <h2>${INGREDIENT_CATEGORY_LABELS[category]} (${categoryItems.length})</h2>
    `;

    categoryItems.forEach((item) => {
      html += `
        <div class="item">
          <div style="display: flex; align-items: center;">
            <span class="item-checkbox"></span>
            <span class="item-name">${item.name}</span>
          </div>
          <span class="item-amount">${formatAmount(item.totalAmount, item.unit)}</span>
        </div>
      `;
    });

    html += `</div>`;
  });

  html += `
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 500);
};

export const captureElementAsImage = async (element: HTMLElement): Promise<string> => {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
  });
  return canvas.toDataURL('image/png');
};
