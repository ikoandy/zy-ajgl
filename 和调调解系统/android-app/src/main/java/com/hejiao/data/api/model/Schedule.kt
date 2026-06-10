package com.hejiao.data.api.model

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class Schedule(
    val id: Int = 0,
    val title: String? = null,
    @Json(name = "case_id") val caseId: Int? = null,
    @Json(name = "case_number") val caseNumber: String? = null,
    @Json(name = "schedule_type") val scheduleType: String? = null,
    val status: String? = null,
    @Json(name = "start_time") val startTime: String? = null,
    @Json(name = "end_time") val endTime: String? = null,
    val location: String? = null,
    val description: String? = null,
    val reminder: String? = null,
    @Json(name = "created_by") val createdBy: Int? = null,
    @Json(name = "created_at") val createdAt: String? = null
)
