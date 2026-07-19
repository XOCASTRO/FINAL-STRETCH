import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request: NextRequest) {
  try {
    const startDate = request.nextUrl.searchParams.get('start_date') || '2024-01-01';
    const endDate = request.nextUrl.searchParams.get('end_date') || new Date().toISOString().split('T')[0];
    const transactionType = request.nextUrl.searchParams.get('transaction_type');

    const client = await pool.connect();

    // Total revenue
    let query = `SELECT SUM(amount) as total, COUNT(*) as count FROM financial_transactions 
                 WHERE transaction_date BETWEEN $1 AND $2`;
    let params: any[] = [startDate, endDate];

    if (transactionType) {
      query += ` AND transaction_type = $3`;
      params.push(transactionType);
    }

    const totalResult = await client.query(query, params);
    const totalRevenue = totalResult.rows[0].total || 0;
    const transactionCount = totalResult.rows[0].count || 0;

    // Revenue by type
    const typeResult = await client.query(
      `SELECT transaction_type, SUM(amount) as total, COUNT(*) as count FROM financial_transactions 
       WHERE transaction_date BETWEEN $1 AND $2 GROUP BY transaction_type ORDER BY total DESC`,
      [startDate, endDate]
    );

    // Revenue by payment method
    const methodResult = await client.query(
      `SELECT payment_method, SUM(amount) as total, COUNT(*) as count FROM financial_transactions 
       WHERE transaction_date BETWEEN $1 AND $2 GROUP BY payment_method`,
      [startDate, endDate]
    );

    // All transactions
    const transactionsResult = await client.query(
      `SELECT * FROM financial_transactions WHERE transaction_date BETWEEN $1 AND $2 ORDER BY transaction_date DESC`,
      [startDate, endDate]
    );

    client.release();

    const avgTransaction = transactionCount > 0 ? (totalRevenue / transactionCount).toFixed(2) : 0;

    return NextResponse.json({
      total_revenue: parseFloat(totalRevenue),
      period: `${startDate} to ${endDate}`,
      revenue_by_type: typeResult.rows.map(row => ({
        type: row.transaction_type,
        total: parseFloat(row.total),
        count: row.count,
      })),
      payment_methods: methodResult.rows.map(row => ({
        method: row.payment_method,
        total: parseFloat(row.total),
        count: row.count,
      })),
      average_transaction: avgTransaction,
      transactions_count: transactionCount,
      details: transactionsResult.rows,
    });
  } catch (error) {
    console.error('Error generating financial report:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}
