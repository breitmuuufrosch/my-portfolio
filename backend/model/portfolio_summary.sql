SELECT
	pf_value.currency,
	pf_value.date,
    SUM(pf_value.value) AS value
FROM (
	SELECT sh.security_id, s_details.currency, sh.date, SUM(security_summary.amount) AS amount, SUM(security_summary.amount) * sh.close AS value
	FROM security_history AS sh
	LEFT JOIN security AS s_details ON s_details.id = sh.security_id
	INNER JOIN security_transaction_summary AS security_summary ON security_summary.security_id = sh.security_id AND security_summary.date <= sh.date
	-- WHERE sh.security_id IN (1, 10)
	GROUP BY sh.security_id, s_details.currency, sh.date
	ORDER BY sh.date
) AS pf_value
-- WHERE pf_value.currency = 'CHF'
GROUP BY pf_value.currency, pf_value.date
ORDER BY pf_value.date