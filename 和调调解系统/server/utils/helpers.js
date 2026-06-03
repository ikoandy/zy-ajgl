function paginate(query, countQuery, params, page, pageSize) {
  const offset = (page - 1) * pageSize;
  const total = countQuery.get(params).count;
  const rows = query.all({ ...params, limit: pageSize, offset });
  return {
    data: rows,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize)
    }
  };
}

function formatResponse(data, message) {
  return {
    success: true,
    message: message || '操作成功',
    data
  };
}

function formatError(message, code) {
  return {
    success: false,
    error: message || '操作失败',
    code: code || 400
  };
}

function buildWhereClause(filters) {
  const conditions = [];
  const params = {};
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        const placeholders = value.map((v, i) => `@${key}_${i}`).join(', ');
        conditions.push(`${key} IN (${placeholders})`);
        value.forEach((v, i) => {
          params[`${key}_${i}`] = v;
        });
      } else if (typeof value === 'string' && value.includes('%')) {
        conditions.push(`${key} LIKE @${key}`);
        params[key] = value;
      } else {
        conditions.push(`${key} = @${key}`);
        params[key] = value;
      }
    }
  }
  return {
    where: conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '',
    params
  };
}

function logAudit(db, userId, action, resourceType, resourceId, detail, req) {
  db.prepare(
    `INSERT INTO audit_logs (user_id, action, resource_type, resource_id, detail, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(userId, action, resourceType, resourceId, detail, req?.ip, req?.headers?.['user-agent'] || null);
}

module.exports = { paginate, formatResponse, formatError, buildWhereClause, logAudit };
