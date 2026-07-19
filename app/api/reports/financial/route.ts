import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/mysql-db';

export async function GET(request: NextRequest) {
  try {
    const startDate = request.nextUrl.searchParams.get('start_date') || '2024-01-01';
    const endDate = request.nextUrl.searchParams.get('end_date') || new Date().toISOString().split('T')[0];
    const transactionType = request.nextUrl.searchParams.get('transaction_type');

    // Total revenue
    let sql = `SELECT SUM(amount) as total, COUNT(*) as count FROM financial_transactions 
                 WHERE transaction_date BETWEEN ? AND ?`;
    let params: any[] = [startDate, endDate];

    if (transactionType) {
      sql += ` AND transaction_type = ?`;
      params.push(transactionType);
    }

    const totalResult: any = await query(sql, params);
    const totalRevenue = totalResult[0]?.total || 0;
    const transactionCount = totalResult[0]?.count || 0;

    // Revenue by type
    const typeResult: any = await query(
      `SELECT transaction_type, SUM(amount) as total, COUNT(*) as count FROM financial_transactions 
       WHERE transaction_date BETWEEN ? AND ? GROUP BY transaction_type ORDER BY total DESC`,
      [startDate, endDate]
    );

    // Revenue by payment method
    const methodResult: any = await query(
      `SELECT payment_method, SUM(amount) as total, COUNT(*) as count FROM financial_transactions 
       WHERE transaction_date BETWEEN ? AND ? GROUP BY payment_method`,
      [startDate, endDate]
    );

    // All transactions
    const transactionsResult: any = await query(
      `SELECT * FROM financial_transactions WHERE transaction_date BETWEEN ? AND ? ORDER BY transaction_date DESC`,
      [startDate, endDate]
    );

    const avgTransaction = transactionCount > 0 ? (totalRevenue / transactionCount).toFixed(2) : 0;

    return NextResponse.json({
      total_revenue: parseFloat(totalRevenue),
      period: `${startDate} to ${endDate}`,
      revenue_by_type: typeResult.map((row: any) => ({
        type: row.transaction_type,
        total: parseFloat(row.total),
        count: row.count,
      })),
      payment_methods: methodResult.map((row: any) => ({
        method: row.payment_method,
        total: parseFloat(row.total),
        count: row.count,
      })),
      average_transaction: avgTransaction,
      transactions_count: transactionCount,
      details: transactionsResult,
    });
  } catch (error) {
    console.error('Error generating financial report:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}
