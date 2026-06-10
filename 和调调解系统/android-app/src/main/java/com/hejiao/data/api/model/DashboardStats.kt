package com.hejiao.data.api.model

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class DashboardStats(
    val total: Int = 0,
    val pending: Int = 0,
    val mediating: Int = 0,
    val closed: Int = 0,
    @Json(name = "totalChange") val totalChange: Double? = null,
    @Json(name = "pendingChange") val pendingChange: Double? = null,
    @Json(name = "mediatingChange") val mediatingChange: Double? = null,
    @Json(name = "closedChange") val closedChange: Double? = null
)

@JsonClass(generateAdapter = true)
data class CaseListResponse(
    val data: List<Case> = emptyList(),
    val total: Int = 0,
    val page: Int = 1,
    @Json(name = "pageSize") val pageSize: Int = 20
)
