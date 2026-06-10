package com.hejiao.data.api.model

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class CaseParty(
    val id: Int = 0,
    @Json(name = "case_id") val caseId: Int = 0,
    val name: String? = null,
    val phone: String? = null,
    val email: String? = null,
    @Json(name = "id_type") val idType: String? = null,
    @Json(name = "id_number") val idNumber: String? = null,
    val role: String = "",
    val address: String? = null
)
