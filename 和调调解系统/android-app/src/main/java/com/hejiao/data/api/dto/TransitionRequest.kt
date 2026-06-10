package com.hejiao.data.api.dto

import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class TransitionRequest(
    val status: String
)
