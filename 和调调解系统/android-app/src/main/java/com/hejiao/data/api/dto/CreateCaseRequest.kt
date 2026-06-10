package com.hejiao.data.api.dto

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class CreateCaseRequest(
    val title: String,
    @Json(name = "type_id") val typeId: Int,
    val description: String? = null,
    val priority: String? = null
)
