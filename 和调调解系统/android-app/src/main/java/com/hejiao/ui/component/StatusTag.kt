package com.hejiao.ui.component

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.hejiao.ui.theme.Gold
import com.hejiao.ui.theme.Rose
import com.hejiao.ui.theme.StatusAccepted
import com.hejiao.ui.theme.StatusAgreed
import com.hejiao.ui.theme.StatusClosed
import com.hejiao.ui.theme.StatusMediating
import com.hejiao.ui.theme.StatusTerminated
import com.hejiao.ui.theme.Violet

@Composable
fun StatusTag(status: String, text: String? = null) {
    val (bgColor, textColor) = when (status.lowercase()) {
        "pending" -> Gold to Color.White
        "accepted" -> StatusAccepted to Color.White
        "mediating" -> StatusMediating to Color.White
        "agreed" -> StatusAgreed to Color.White
        "terminated" -> StatusTerminated to Color.White
        "closed" -> StatusClosed to Color.White
        else -> Gold to Color.White
    }
    val displayText = text ?: when (status.lowercase()) {
        "pending" -> "待受理"
        "accepted" -> "已受理"
        "mediating" -> "调解中"
        "agreed" -> "已达成协议"
        "terminated" -> "已终止"
        "closed" -> "已结案"
        else -> status
    }

    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(999.dp))
            .background(bgColor)
            .padding(horizontal = 12.dp, vertical = 4.dp)
    ) {
        Text(
            text = displayText,
            color = textColor,
            fontSize = 12.sp,
        )
    }
}
