package com.moneyshift.trojan.service;

import com.moneyshift.trojan.model.Transaction;
import com.moneyshift.trojan.model.Receipt;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExcelExportService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    /**
     * Export user transactions to Excel format
     */
    public byte[] exportTransactionsToExcel(String userId, List<Transaction> transactions, List<Receipt> receipts) throws IOException {
        try (Workbook workbook = new XSSFWorkbook()) {
            
            // Create summary sheet
            createSummarySheet(workbook, userId, transactions);
            
            // Create transactions sheet
            createTransactionsSheet(workbook, transactions);
            
            // Create receipts sheet if receipts are available
            if (receipts != null && !receipts.isEmpty()) {
                createReceiptsSheet(workbook, receipts);
            }
            
            // Create categories analysis sheet
            createCategoriesAnalysisSheet(workbook, transactions);
            
            // Write to byte array
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            
            log.info("Excel export completed for user: {} with {} transactions", userId, transactions.size());
            return outputStream.toByteArray();
            
        } catch (IOException e) {
            log.error("Failed to create Excel export for user: {}", userId, e);
            throw e;
        }
    }

    private void createSummarySheet(Workbook workbook, String userId, List<Transaction> transactions) {
        Sheet sheet = workbook.createSheet("요약");
        
        // Create header style
        CellStyle headerStyle = createHeaderStyle(workbook);
        CellStyle currencyStyle = createCurrencyStyle(workbook);
        
        int rowNum = 0;
        
        // Title
        Row titleRow = sheet.createRow(rowNum++);
        Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue("MoneyShift 가계부 요약");
        titleCell.setCellStyle(headerStyle);
        
        rowNum++; // Empty row
        
        // Export info
        Row exportRow = sheet.createRow(rowNum++);
        exportRow.createCell(0).setCellValue("내보내기 날짜:");
        exportRow.createCell(1).setCellValue(LocalDateTime.now().format(DATE_FORMATTER));
        
        Row userRow = sheet.createRow(rowNum++);
        userRow.createCell(0).setCellValue("사용자 ID:");
        userRow.createCell(1).setCellValue(userId);
        
        rowNum++; // Empty row
        
        // Calculate statistics
        BigDecimal totalIncome = transactions.stream()
                .filter(t -> "INCOME".equals(t.getType()))
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal totalExpense = transactions.stream()
                .filter(t -> "EXPENSE".equals(t.getType()))
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal netAmount = totalIncome.subtract(totalExpense);
        
        // Statistics
        Row statsHeaderRow = sheet.createRow(rowNum++);
        Cell statsHeaderCell = statsHeaderRow.createCell(0);
        statsHeaderCell.setCellValue("통계");
        statsHeaderCell.setCellStyle(headerStyle);
        
        Row incomeRow = sheet.createRow(rowNum++);
        incomeRow.createCell(0).setCellValue("총 수입:");
        Cell incomeCell = incomeRow.createCell(1);
        incomeCell.setCellValue(totalIncome.doubleValue());
        incomeCell.setCellStyle(currencyStyle);
        
        Row expenseRow = sheet.createRow(rowNum++);
        expenseRow.createCell(0).setCellValue("총 지출:");
        Cell expenseCell = expenseRow.createCell(1);
        expenseCell.setCellValue(totalExpense.doubleValue());
        expenseCell.setCellStyle(currencyStyle);
        
        Row netRow = sheet.createRow(rowNum++);
        netRow.createCell(0).setCellValue("순액:");
        Cell netCell = netRow.createCell(1);
        netCell.setCellValue(netAmount.doubleValue());
        netCell.setCellStyle(currencyStyle);
        
        Row countRow = sheet.createRow(rowNum++);
        countRow.createCell(0).setCellValue("총 거래 건수:");
        countRow.createCell(1).setCellValue(transactions.size());
        
        // Auto-size columns
        sheet.autoSizeColumn(0);
        sheet.autoSizeColumn(1);
    }

    private void createTransactionsSheet(Workbook workbook, List<Transaction> transactions) {
        Sheet sheet = workbook.createSheet("거래내역");
        
        CellStyle headerStyle = createHeaderStyle(workbook);
        CellStyle currencyStyle = createCurrencyStyle(workbook);
        CellStyle dateStyle = createDateStyle(workbook);
        
        // Create header row
        Row headerRow = sheet.createRow(0);
        String[] headers = {
            "날짜", "구분", "금액", "설명", "카테고리", "결제수단", "가맹점", "위치", "태그", "메모"
        };
        
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }
        
        // Fill data rows
        int rowNum = 1;
        for (Transaction transaction : transactions) {
            Row row = sheet.createRow(rowNum++);
            
            // Date
            Cell dateCell = row.createCell(0);
            dateCell.setCellValue(transaction.getTransactionDate().format(DATE_FORMATTER));
            dateCell.setCellStyle(dateStyle);
            
            // Type
            row.createCell(1).setCellValue("INCOME".equals(transaction.getType()) ? "수입" : "지출");
            
            // Amount
            Cell amountCell = row.createCell(2);
            amountCell.setCellValue(transaction.getAmount().doubleValue());
            amountCell.setCellStyle(currencyStyle);
            
            // Description
            row.createCell(3).setCellValue(transaction.getDescription());
            
            // Category
            row.createCell(4).setCellValue(transaction.getCategory());
            
            // Payment method
            row.createCell(5).setCellValue(transaction.getPaymentMethod());
            
            // Merchant
            row.createCell(6).setCellValue(transaction.getMerchantName());
            
            // Location
            row.createCell(7).setCellValue(transaction.getLocation());
            
            // Tags
            if (transaction.getTags() != null) {
                row.createCell(8).setCellValue(String.join(", ", transaction.getTags()));
            }
            
            // Notes
            row.createCell(9).setCellValue(transaction.getNotes());
        }
        
        // Auto-size columns
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }
    }

    private void createReceiptsSheet(Workbook workbook, List<Receipt> receipts) {
        Sheet sheet = workbook.createSheet("영수증데이터");
        
        CellStyle headerStyle = createHeaderStyle(workbook);
        CellStyle currencyStyle = createCurrencyStyle(workbook);
        CellStyle dateStyle = createDateStyle(workbook);
        CellStyle percentageStyle = createPercentageStyle(workbook);
        
        // Create header row
        Row headerRow = sheet.createRow(0);
        String[] headers = {
            "수집일시", "가맹점명", "주소", "총금액", "카테고리", "OCR신뢰도", "처리상태"
        };
        
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }
        
        // Fill data rows
        int rowNum = 1;
        for (Receipt receipt : receipts) {
            Row row = sheet.createRow(rowNum++);
            
            // Date
            Cell dateCell = row.createCell(0);
            dateCell.setCellValue(receipt.getCreatedAt().format(DATE_FORMATTER));
            dateCell.setCellStyle(dateStyle);
            
            // Merchant name
            row.createCell(1).setCellValue(receipt.getMerchantName());
            
            // Address
            row.createCell(2).setCellValue(receipt.getMerchantAddress());
            
            // Amount
            if (receipt.getTotalAmount() != null) {
                Cell amountCell = row.createCell(3);
                amountCell.setCellValue(receipt.getTotalAmount().doubleValue());
                amountCell.setCellStyle(currencyStyle);
            }
            
            // Category
            row.createCell(4).setCellValue(receipt.getCategory());
            
            // OCR Confidence
            if (receipt.getOcrConfidence() != null) {
                Cell confidenceCell = row.createCell(5);
                confidenceCell.setCellValue(receipt.getOcrConfidence().doubleValue());
                confidenceCell.setCellStyle(percentageStyle);
            }
            
            // Processing status
            row.createCell(6).setCellValue(receipt.getProcessingStatus());
        }
        
        // Auto-size columns
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }
    }

    private void createCategoriesAnalysisSheet(Workbook workbook, List<Transaction> transactions) {
        Sheet sheet = workbook.createSheet("카테고리분석");
        
        CellStyle headerStyle = createHeaderStyle(workbook);
        CellStyle currencyStyle = createCurrencyStyle(workbook);
        
        // Calculate category totals for expenses only
        var categoryTotals = transactions.stream()
                .filter(t -> "EXPENSE".equals(t.getType()))
                .collect(java.util.stream.Collectors.groupingBy(
                    Transaction::getCategory,
                    java.util.stream.Collectors.reducing(
                        BigDecimal.ZERO,
                        Transaction::getAmount,
                        BigDecimal::add
                    )
                ));
        
        // Create header row
        Row headerRow = sheet.createRow(0);
        String[] headers = {"카테고리", "총 금액", "거래 건수", "평균 금액"};
        
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }
        
        // Fill data rows
        int rowNum = 1;
        for (var entry : categoryTotals.entrySet()) {
            String category = entry.getKey();
            BigDecimal total = entry.getValue();
            
            long count = transactions.stream()
                    .filter(t -> "EXPENSE".equals(t.getType()))
                    .filter(t -> category.equals(t.getCategory()))
                    .count();
            
            BigDecimal average = count > 0 ? total.divide(BigDecimal.valueOf(count), 2, BigDecimal.ROUND_HALF_UP) : BigDecimal.ZERO;
            
            Row row = sheet.createRow(rowNum++);
            
            // Category
            row.createCell(0).setCellValue(category);
            
            // Total amount
            Cell totalCell = row.createCell(1);
            totalCell.setCellValue(total.doubleValue());
            totalCell.setCellStyle(currencyStyle);
            
            // Count
            row.createCell(2).setCellValue(count);
            
            // Average
            Cell avgCell = row.createCell(3);
            avgCell.setCellValue(average.doubleValue());
            avgCell.setCellStyle(currencyStyle);
        }
        
        // Auto-size columns
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }
    }

    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 12);
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        return style;
    }

    private CellStyle createCurrencyStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        DataFormat format = workbook.createDataFormat();
        style.setDataFormat(format.getFormat("#,##0"));
        return style;
    }

    private CellStyle createDateStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        DataFormat format = workbook.createDataFormat();
        style.setDataFormat(format.getFormat("yyyy-mm-dd hh:mm:ss"));
        return style;
    }

    private CellStyle createPercentageStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        DataFormat format = workbook.createDataFormat();
        style.setDataFormat(format.getFormat("0.00%"));
        return style;
    }
}