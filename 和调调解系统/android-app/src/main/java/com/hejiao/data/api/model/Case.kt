package com.hejiao.data.api.model

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class Case(
    val id: Int = 0,
    @Json(name = "case_number") val caseNumber: String? = null,
    val title: String? = null,
    @Json(name = "type_id") val typeId: Int? = null,
    @Json(name = "type_name") val typeName: String? = null,
    val description: String? = null,
    val status: String? = null,
    val priority: String? = null,
    @Json(name = "mediator_id") val mediatorId: Int? = null,
    @Json(name = "mediator_name") val mediatorName: String? = null,
    @Json(name = "created_at") val createdAt: String? = null,
    @Json(name = "updated_at") val updatedAt: String? = null,
    @Json(name = "type_details") val typeDetails: String? = null
)
