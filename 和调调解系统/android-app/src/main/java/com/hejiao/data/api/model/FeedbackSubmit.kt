package com.hejiao.data.api.model

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class FeedbackSubmit(
    @Json(name = "case_id") val caseId: Int = 0,
    @Json(name = "party_id") val partyId: Int = 0,
    val rating: Int = 0,
    @Json(name = "attitude_score") val attitudeScore: Int? = null,
    @Json(name = "efficiency_score") val efficiencyScore: Int? = null,
    @Json(name = "fairness_score") val fairnessScore: Int? = null,
    val comment: String? = null,
    @Json(name = "is_anonymous") val isAnonymous: Boolean = false
)
