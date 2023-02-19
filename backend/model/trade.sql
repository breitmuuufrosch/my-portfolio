SELECT
	t.*,
    t.exit_price - t.entry_price_all AS profit_loss,
    (t.exit_price - t.entry_price_all) * 100 / t.entry_price_all AS profit_loss_percentage
FROM (
	SELECT
		a.user_id,
		s.id,
		s.name_long AS name,
		s.symbol,
		s.quote_type,
		s.currency,
		SUM(CASE WHEN sts.amount > 0 THEN sts.value ELSE 0 END) AS entry_price,
		SUM(sts.fee) AS entry_fee,
		SUM(sts.tax) AS entry_tax,
		CASE WHEN SUM(sts.amount) = 0 THEN SUM(CASE WHEN sts.amount > 0 THEN sts.value + sts.fee + sts.tax ELSE 0 END) ELSE SUM(sts.value + sts.fee + sts.tax) END AS entry_price_all,
		SUM(sts.amount) AS amount,
		sph_hi.close AS last_price,
		sph_hi.date AS last_date,
		CASE WHEN SUM(sts.amount) = 0 THEN SUM(CASE WHEN sts.amount < 0 THEN sts.value - sts.fee - sts.tax ELSE 0 END) ELSE CAST(SUM(sts.amount) * sph_hi.close AS DECIMAL(19, 4)) END AS exit_price
	FROM security_transaction_summary AS sts
    LEFT JOIN account AS a ON a.id = sts.account_id
	LEFT JOIN security AS s ON sts.security_id = s.id
	LEFT JOIN (
		SELECT sph.*
		FROM security_price AS sph
		JOIN (
			SELECT sph_inner.security_id, MAX(date) as max_date
			FROM security_price AS sph_inner
			-- WHERE date = '2022-01-03'
			GROUP BY security_id
		) AS sph_sorted ON sph_sorted.security_id = sph.security_id and sph_sorted.max_date = sph.date
	) as sph_hi on sph_hi.security_id = s.id
	WHERE sts.type IN ('buy', 'sell', 'posting')
	GROUP BY a.user_id, s.id, s.name_long, s.symbol, s.quote_type, s.currency
) AS t
ORDER BY t.symbol