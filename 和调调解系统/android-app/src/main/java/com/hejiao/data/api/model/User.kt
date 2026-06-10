package com.hejiao.data.api.model

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class User(
    val id: Int = 0,
    val username: String? = null,
    val real_name: String? = null,
    val phone: String? = null,
    val email: String? = null,
    @Json(name = "role_display_name") val roleDisplayName: String? = null,
    @Json(name = "avatar_color") val avatarColor: String? = null,
    val status: String? = null
)
