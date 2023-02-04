    SELECT
      pf_value.currency,
      pf_value.date,
      SUM(pf_value.value) AS value,
      SUM(pf_value.entry_price) AS entry_price
    FROM (
      SELECT
		a.user_id,
		sph.security_id,
		s_details.currency,
		sph.date,
		SUM(security_summary.amount) AS amount,
		SUM(security_summary.amount) * sph.close AS value,
		SUM(security_summary.value) AS entry_price
	  FROM security_price_history AS sph
	  LEFT JOIN security AS s_details ON s_details.id = sph.security_id
	  INNER JOIN security_history AS security_summary ON
		security_summary.security_id = sph.security_id
		AND security_summary.date <= sph.date
		AND security_summary.type IN ('buy', 'sell', 'posting')
	  LEFT JOIN account AS a ON a.id = security_summary.account_id
	  -- WHERE sph.security_id IN (1, 10)
	  GROUP BY
		a.user_id,
		sph.security_id,
		s_details.currency,
		sph.date
	  ORDER BY sph.date
    ) AS pf_value
    WHERE pf_value.currency = 'CHF'
	  AND pf_value.user_id = 2
      AND WEEKDAY(pf_value.date) NOT IN (5, 6)
    GROUP BY
      pf_value.currency,
      pf_value.date
    ORDER BY pf_value.date
