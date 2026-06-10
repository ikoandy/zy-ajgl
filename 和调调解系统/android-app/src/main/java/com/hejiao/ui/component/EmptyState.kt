package com.hejiao.ui.component

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.hejiao.ui.theme.TextMuted
import com.hejiao.ui.theme.TextSecondary

@Composable
fun EmptyState(text: String, icon: String? = null) {
    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center,
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
        ) {
            if (icon != null) {
                Text(
                    text = icon,
                    fontSize = 48.sp,
                    color = TextMuted,
                )
                Spacer(modifier = Modifier.height(12.dp))
            }
            Text(
                text = text,
                fontSize = 14.sp,
                color = TextSecondary,
            )
        }
    }
}
