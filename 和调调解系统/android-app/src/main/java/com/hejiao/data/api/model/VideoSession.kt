package com.hejiao.data.api.model

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class VideoSession(
    val id: Int = 0,
    @Json(name = "case_id") val caseId: Int? = null,
    @Json(name = "case_number") val caseNumber: String? = null,
    @Json(name = "room_id") val roomId: String? = null,
    val title: String? = null,
    val status: String? = null,
    @Json(name = "scheduled_at") val scheduledAt: String? = null,
    @Json(name = "started_at") val startedAt: String? = null,
    @Json(name = "ended_at") val endedAt: String? = null,
    val duration: Int? = null,
    @Json(name = "recording_path") val recordingPath: String? = null,
    @Json(name = "created_by") val createdBy: Int? = null,
    @Json(name = "created_at") val createdAt: String? = null
)
