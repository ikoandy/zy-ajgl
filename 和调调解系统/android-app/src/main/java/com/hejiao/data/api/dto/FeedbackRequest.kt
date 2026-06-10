package com.hejiao.data.api.dto

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class FeedbackRequest(
    @Json(name = "case_id") val caseId: Int,
    @Json(name = "party_id") val partyId: Int,
    val rating: Int,
    @Json(name = "attitude_score") val attitudeScore: Int? = null,
    @Json(name = "efficiency_score") val efficiencyScore: Int? = null,
    @Json(name = "fairness_score") val fairnessScore: Int? = null,
    val comment: String? = null,
    @Json(name = "is_anonymous") val isAnonymous: Boolean = false
)
