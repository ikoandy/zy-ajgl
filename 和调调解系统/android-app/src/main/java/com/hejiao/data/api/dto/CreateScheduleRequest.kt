package com.hejiao.data.api.dto

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class CreateScheduleRequest(
    val title: String,
    @Json(name = "start_time") val startTime: String,
    @Json(name = "end_time") val endTime: String,
    val location: String? = null,
    @Json(name = "schedule_type") val scheduleType: String,
    @Json(name = "case_id") val caseId: Int? = null,
    val status: String? = null
)
