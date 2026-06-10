package com.hejiao.data.api.model

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class WorkflowLog(
    val id: Int = 0,
    val action: String? = null,
    val content: String? = null,
    @Json(name = "user_name") val userName: String? = null,
    @Json(name = "created_at") val createdAt: String? = null
)

@JsonClass(generateAdapter = true)
data class LoginData(
    val token: String? = null,
    val user: User? = null
)
