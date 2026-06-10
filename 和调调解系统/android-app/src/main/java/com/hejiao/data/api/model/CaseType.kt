package com.hejiao.data.api.model

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class CaseType(
    val id: Int = 0,
    val name: String? = null,
    val icon: String? = null,
    val color: String? = null,
    @Json(name = "sort_order") val sortOrder: Int? = null
)
